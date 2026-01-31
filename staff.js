// staff.js — clean, theory-correct, self-contained grand staff
(function () {

  /* -------------------- CSS -------------------- */
  const css = `
  #controls-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px;
  }
  #key-select-wrapper {
    position: absolute;
    right: 50%;
    transform: translate(-160%, -50%);
    top: 50%;
    z-index: 10;
    font-size: 14px;
  }
  #image-placeholder {
    width: 230px;
    height: 230px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    position: relative;
  }
  #image-placeholder svg {
    width: 100%;
    height: 100%;
  }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* -------------------- HTML -------------------- */
  const wrapper = document.createElement("div");
  wrapper.id = "controls-wrapper";
  wrapper.innerHTML = `
    <div id="key-select-wrapper">
      Key:
      <select id="key-selector">
        <option>C</option><option>G</option><option>D</option><option>A</option>
        <option>E</option><option>B</option><option>F#</option><option>C#</option>
        <option>F</option><option>Bb</option><option>Eb</option><option>Ab</option>
        <option>Db</option><option>Gb</option><option>Cb</option>
      </select>
    </div>
    <div id="image-placeholder"></div>
  `;
  document.body.prepend(wrapper);

  /* -------------------- SVG SETUP -------------------- */
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 230, H = 230;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  document.getElementById("image-placeholder").appendChild(svg);

  const staticGroup = document.createElementNS(SVG_NS, "g");
  const notesGroup  = document.createElementNS(SVG_NS, "g");
  svg.append(staticGroup, notesGroup);

  /* -------------------- STAFF GEOMETRY -------------------- */
  const leftMargin = 48;
  const lineSpacing = 16;
  const half = lineSpacing / 2;

  const totalHeight = 4*lineSpacing + 2*lineSpacing + 4*lineSpacing;
  const topMargin = (H - totalHeight) / 2;

  const trebleTop = topMargin;
  const trebleBottom = trebleTop + 4*lineSpacing;
  const bassTop = trebleBottom + 2*lineSpacing;
  const bassBottom = bassTop + 4*lineSpacing;

  const noteX = W / 2 + 30;

  /* -------------------- THEORY -------------------- */

  // Diatonic indexing (THIS is the vertical truth)
  const LETTER_INDEX = { C:0, D:1, E:2, F:3, G:4, A:5, B:6 };

  // Reference pitch: E4 = bottom line treble staff
  const REF_STEP = 4*7 + LETTER_INDEX.E;

  function parseNote(n) {
    const m = String(n).match(/^([A-G])([#b]?)(-?\d+)$/);
    if (!m) return null;
    return { letter:m[1], accidental:m[2], octave:+m[3] };
  }

  function diatonicStep(n) {
    return n.octave*7 + LETTER_INDEX[n.letter];
  }

  /* -------------------- KEY SIGNATURES -------------------- */

  const KEY_SIGS = {
    C: [],
    G: ["F#"], D: ["F#","C#"], A: ["F#","C#","G#"],
    E: ["F#","C#","G#","D#"], B: ["F#","C#","G#","D#","A#"],
    "F#": ["F#","C#","G#","D#","A#","E#"],
    "C#": ["F#","C#","G#","D#","A#","E#","B#"],

    F: ["Bb"], Bb:["Bb","Eb"], Eb:["Bb","Eb","Ab"],
    Ab:["Bb","Eb","Ab","Db"], Db:["Bb","Eb","Ab","Db","Gb"],
    Gb:["Bb","Eb","Ab","Db","Gb","Cb"],
    Cb:["Bb","Eb","Ab","Db","Gb","Cb","Fb"]
  };

  function keyAlterations(key) {
    const out = {};
    (KEY_SIGS[key]||[]).forEach(n => out[n[0]] = n[1]);
    return out;
  }

  /* -------------------- DRAW STATIC STAFF -------------------- */

  function drawStaffLines(yTop) {
    for (let i=0;i<5;i++) {
      const y = yTop + i*lineSpacing;
      const l = document.createElementNS(SVG_NS,"line");
      l.setAttribute("x1", leftMargin-36);
      l.setAttribute("x2", W-20);
      l.setAttribute("y1", y);
      l.setAttribute("y2", y);
      l.setAttribute("stroke","#000");
      staticGroup.appendChild(l);
    }
  }

  function drawStatic() {
    staticGroup.innerHTML = "";

    drawStaffLines(trebleTop);
    drawStaffLines(bassTop);

    const clef = (sym,x,y,size) => {
      const t = document.createElementNS(SVG_NS,"text");
      t.setAttribute("x",x);
      t.setAttribute("y",y);
      t.setAttribute("font-size",size);
      t.setAttribute("font-family",'serif,"Bravura","Arial Unicode MS"');
      t.textContent = sym;
      staticGroup.appendChild(t);
    };

    clef("𝄞", leftMargin-34, trebleBottom, 61);
    clef("𝄢", leftMargin-34, bassBottom-9, 61);

    // brace
    const brace = document.createElementNS(SVG_NS,"line");
    brace.setAttribute("x1", leftMargin-42);
    brace.setAttribute("x2", leftMargin-42);
    brace.setAttribute("y1", trebleTop);
    brace.setAttribute("y2", bassBottom);
    brace.setAttribute("stroke","#000");
    staticGroup.appendChild(brace);

    // key signature
    const acc = keyAlterations(currentKey);
    let i = 0;
    for (const L in acc) {
      const sym = acc[L]==="#"?"♯":"♭";
      const step = diatonicStep({letter:L,octave:4});
      const y = trebleBottom - (step-REF_STEP)*half;
      const t = document.createElementNS(SVG_NS,"text");
      t.setAttribute("x", leftMargin+10+i*8);
      t.setAttribute("y", y+4);
      t.textContent = sym;
      staticGroup.appendChild(t);
      i++;
    }
  }

  /* -------------------- DRAW NOTE -------------------- */

  function ledger(y,x){
    const l=document.createElementNS(SVG_NS,"line");
    l.setAttribute("x1",x-18);
    l.setAttribute("x2",x+18);
    l.setAttribute("y1",y);
    l.setAttribute("y2",y);
    l.setAttribute("stroke","#000");
    notesGroup.appendChild(l);
  }

  function drawNote(note) {
    notesGroup.innerHTML = "";
    const n = parseNote(note);
    if (!n) return;

    const step = diatonicStep(n);
    const y = trebleBottom - (step-REF_STEP)*half;

    // ledger lines
    if (y < trebleTop) {
      for (let yy=trebleTop-lineSpacing; yy>=y; yy-=lineSpacing) ledger(yy,noteX);
    }
    if (y > bassBottom) {
      for (let yy=bassBottom+lineSpacing; yy<=y; yy+=lineSpacing) ledger(yy,noteX);
    }

    const head=document.createElementNS(SVG_NS,"ellipse");
    head.setAttribute("cx",noteX);
    head.setAttribute("cy",y);
    head.setAttribute("rx",9);
    head.setAttribute("ry",6);
    head.setAttribute("transform",`rotate(-20 ${noteX} ${y})`);
    head.setAttribute("fill","#000");
    notesGroup.appendChild(head);

    const stem=document.createElementNS(SVG_NS,"line");
    if (y < trebleBottom-2*lineSpacing) {
      stem.setAttribute("x1",noteX+8);
      stem.setAttribute("y1",y);
      stem.setAttribute("x2",noteX+8);
      stem.setAttribute("y2",y-36);
    } else {
      stem.setAttribute("x1",noteX-8);
      stem.setAttribute("y1",y);
      stem.setAttribute("x2",noteX-8);
      stem.setAttribute("y2",y+36);
    }
    stem.setAttribute("stroke","#000");
    notesGroup.appendChild(stem);

    const alt = keyAlterations(currentKey);
    let sym = "";
    if (n.accidental) {
      if (alt[n.letter] !== n.accidental)
        sym = n.accidental==="#"?"♯":"♭";
    } else if (alt[n.letter]) {
      sym = "♮";
    }

    if (sym) {
      const a=document.createElementNS(SVG_NS,"text");
      a.setAttribute("x",noteX-18);
      a.setAttribute("y",y+4);
      a.textContent=sym;
      notesGroup.appendChild(a);
    }
  }

  /* -------------------- PUBLIC API -------------------- */

  let currentKey = "C";
  drawStatic();

  document.getElementById("key-selector").onchange = e=>{
    currentKey = e.target.value;
    drawStatic();
    notesGroup.innerHTML="";
  };

  window.staffDrawNote = drawNote;
  window.staffSetKey = k => { currentKey=k; drawStatic(); };

})();