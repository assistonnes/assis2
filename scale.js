/* scale.js — stable visible tick ruler with proper white-key optical midpoints
   + REBUILD hooks on zoom buttons, updateUnitScale, and layout resize
*/

(function() {
  function log(msg){ console.log("[scale]", msg); }

  function whenReady(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn);
  }

  whenReady(() => {
    const pianoContainer = window.piano?.pianoContainer || document.getElementById("piano");
    if (!pianoContainer) return log("pianoContainer not found");

    // --- wait until keys have nonzero widths ---
    const tryBuild = () => {
      const keys = pianoContainer.querySelectorAll("[data-note]");
      if (!keys.length || !keys[0].offsetWidth) {
        requestAnimationFrame(tryBuild);
        return;
      }
      buildRuler();
      attachHooks(); // attach hooks after first successful build
    };
    tryBuild();

    // keep a reference to overlay so we can remove and rebuild cleanly
    let currentOverlay = null;
    let hooksAttached = false;
    // debounce helper
    function debounce(fn, ms=80){
      let t;
      return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); };
    }

    function buildRuler() {
      log("building ruler");

      // remove previous overlay if any
      if (currentOverlay && currentOverlay.parentElement) {
        currentOverlay.parentElement.removeChild(currentOverlay);
        currentOverlay = null;
      } else {
        // also remove any legacy overlays by id
        const old = pianoContainer.querySelector('[data-scale-overlay="1"]');
        if (old) old.remove();
      }

      const allEls = Array.from(pianoContainer.querySelectorAll("[data-note]"));
      if (!allEls.length) return log("no keys found");

      // build dataset of geometric info
      const nodes = allEls.map(k => {
        const left = k.offsetLeft;
        const width = k.offsetWidth;
        return {
          el: k,
          note: k.dataset.note,
          left,
          width,
          right: left + width,
          center: left + width / 2
        };
      }).sort((a,b)=>a.left - b.left);

      // helper: find nearest blacks
      function neighborBlacks(i) {
        let leftB=null, rightB=null;
        for (let j=i-1;j>=0;j--){ if(nodes[j].note.includes("#")){leftB=nodes[j];break;} }
        for (let j=i+1;j<nodes.length;j++){ if(nodes[j].note.includes("#")){rightB=nodes[j];break;} }
        return {leftB,rightB};
      }

      const ticks = nodes.map((n,i,arr)=>{
        const isBlack = n.note.includes("#");
        if(isBlack) return {note:n.note,x:n.center};

        const {leftB,rightB} = neighborBlacks(i);
        const visLeft = leftB ? Math.max(n.left,leftB.right) : n.left;
        const visRight = rightB ? Math.min(n.right,rightB.left) : n.right;
        const opticalMid = (visRight>visLeft)?(visLeft+(visRight-visLeft)/2):n.center;
        return {note:n.note,x:opticalMid};
      });

      // --- draw visible overlay ---
      const overlay = document.createElement("div");
      overlay.setAttribute('data-scale-overlay','1');
      overlay.style.cssText = `
        position:absolute;
        top:0;
        left:0;
        height:20px;
        width:${pianoContainer.scrollWidth}px;
        background:rgba(0,0,0,0.2);
        z-index:9999;
        pointer-events:none;
      `;
      pianoContainer.appendChild(overlay);
      currentOverlay = overlay;

      ticks.forEach(t=>{
        const line=document.createElement("div");
        line.style.cssText=`
          position:absolute;
          bottom:0;
          width:1px;
          height:100%;
          background:${t.note.includes("#")?"#0ff":"#fff"};
          left:${t.x}px;
        `;
        overlay.appendChild(line);
      });

      log(`ticks drawn: ${ticks.length}`);
    }

    // rebuild trigger (debounced)
    const rebuild = debounce(()=> {
      try { buildRuler(); } catch(e){ console.error(e); }
    }, 60);

    // attach hooks for zoom buttons, updateUnitScale and container resize
    function attachHooks(){
      if (hooksAttached) return;
      hooksAttached = true;

      // 1) Zoom buttons (if present)
      ['zoom-in','zoom-out','zoom-thumb','zoom-out-thumb'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', ()=> setTimeout(rebuild, 40));
      });
      // Also attach to your specific zoom controls used in piano.js:
      const zi = document.getElementById('zoom-in');
      const zo = document.getElementById('zoom-out');
      if (zi) zi.addEventListener('click', ()=> setTimeout(rebuild,50));
      if (zo) zo.addEventListener('click', ()=> setTimeout(rebuild,50));

      // 2) If piano.js exposes updateUnitScale, wrap it so buildRuler runs after it
      const orig = window.updateUnitScale;
      window.updateUnitScale = function() {
        try{ if (typeof orig === 'function') orig(); } catch(e){ console.error(e); }
        // rebuild after a small delay so piano layout settles
        setTimeout(rebuild, 40);
      };

      // 3) Observe layout/size changes of pianoContainer and keys; rebuild when they happen
      const resizeObserver = new ResizeObserver(debounce(entries=>{
        // only rebuild if widths/scrollWidth changed significantly; safe to rebuild anyway
        rebuild();
      }, 40));
      resizeObserver.observe(pianoContainer);

      // 4) If keys are regenerated, observe childList changes
      const mo = new MutationObserver(debounce(()=>{ rebuild(); }, 40));
      mo.observe(pianoContainer, { childList: true, subtree: true });

      // 5) Also listen to scroll — overlay is absolute so scrolling doesn't require rebuild,
      //    but if you recreate overlay on scroll positions you might want that. For now just rebuild occasionally.
      pianoContainer.addEventListener('scroll', debounce(()=>{ /* no-op by default */ }, 120));
    }
  });
})();