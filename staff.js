// staff.js — per-key enharmonic mapping, geometry-safe
(function () {

  /* =======================
     CSS (UNCHANGED)
  ======================= */
  const css = `
  #controls-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
  #key-select-wrapper {
    position: absolute;
    right: 50%;
    transform: translate(-160%, -50%);
    top: 50%;
    min-width: 60px;
    text-align: right;
    z-index: 10;
    font-family: system-ui, sans-serif;
    font-size: 14px;
  }
  #image-placeholder {
    transform: translate(-8%, 0%);
    width: 150px;
    height: 130px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin: 0 auto;
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

  /* =======================
     HTML
  ======================= */
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

  const container = document.getElementById("image-placeholder");
  if (!container) return;

  /* =======================
     SVG SETUP
  ======================= */
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 230, H = 230;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  container.appendChild(svg);

  const staticGroup = document.createElementNS(SVG_NS, "g");
  const notesGroup = document.createElementNS(SVG_NS, "g");
  svg.appendChild(staticGroup);
  svg.appendChild(notesGroup);

  /* =======================
     LAYOUT
  ======================= */
  const leftMargin = 48;
  const rightMargin = W - 20;
  const lineSpacing = 16;
  const half = lineSpacing / 2;

  const totalHeight = 10 * lineSpacing;
  const topMargin = (H - totalHeight) / 2;

  const trebleTop = topMargin;
  const trebleBottom = trebleTop + 4 * lineSpacing;
  const bassTop = trebleBottom + 2 * lineSpacing;
  const bassBottom = bassTop + 4 * lineSpacing;

  const noteX = W / 2 + 30;

  /* =======================
     PER-KEY TABLES (FIXED)
  ======================= */
  const KEY_SCALES = {
    "C":  ["C","D","E","F","G","A","B"],
    "G":  ["G","A","B","C","D","E","F#"],
    "D":  ["D","E","F#","G","A","B","C#"],
    "A":  ["A","B","C#","D","E","F#","G#"],
    "E":  ["E","F#","G#","A","B","C#","D#"],
    "B":  ["B","C#","D#","E","F#","G#","A#"],
    "F#": ["F#","G#","A#","B","C#","D#","E#"],
    "C#": ["C#","D#","E#","F#","G#","A#","B#"],
    "F":  ["F","G","A","Bb","C","D","E"],
    "Bb": ["Bb","C","D","Eb","F","G","A"],
    "Eb": ["Eb","F","G","Ab","Bb","C","D"],
    "Ab": ["Ab","Bb","C","Db","Eb","F","Gb"],
    "Db": ["Db","Eb","F","Gb","Ab","Bb","C"],
    "Gb": ["Gb","Ab","Bb","C","Db","Eb","F"],
    "Cb": ["Cb","Db","Eb","Fb","Gb","Ab","Bb"]
  };

  const STAFF_INDEX = { C:0, D:1, E:2, F:3, G:4, A:5, B:6 };
  let keySignature = "C";

  /* =======================
     HELPERS
  ======================= */
  function parseNote(n){
    const m=/^([A-G])([#b]?)(-?\d+)$/.exec(n);
    return m?{letter:m[1],acc:m[2],oct:+m[3]}:null;
  }
  function pitchClass(n){ return n.replace(/\d+/g,""); }

  function enharmonic(a,b){
    return a===b ||
      (a==="F"&&b==="E#")||(a==="E#"&&b==="F")||
      (a==="B"&&b==="Cb")||(a==="Cb"&&b==="B")||
      (a==="C"&&b==="B#")||(a==="B#"&&b==="C")||
      (a==="E"&&b==="Fb")||(a==="Fb"&&b==="E")||
      (a[0]===b[0]);
  }

  function findDegree(p,key){
    return KEY_SCALES[key].findIndex(n=>enharmonic(n,p));
  }

  function staffStep(letter,oct){
    return oct*7 + STAFF_INDEX[letter];
  }

  const REF = staffStep("E",4);

  /* =======================
     STATIC DRAW
  ======================= */
  function drawLines(top){
    for(let i=0;i<5;i++){
      const y=top+i*lineSpacing;
      const l=document.createElementNS(SVG_NS,"line");
      l.setAttribute("x1",leftMargin-36);
      l.setAttribute("x2",rightMargin);
      l.setAttribute("y1",y);
      l.setAttribute("y2",y);
      l.setAttribute("stroke","#000");
      staticGroup.appendChild(l);
    }
  }

  function drawStatic(){
    staticGroup.innerHTML="";
    drawLines(trebleTop);
    drawLines(bassTop);

    const t=document.createElementNS(SVG_NS,"text");
    t.setAttribute("x",leftMargin-34);
    t.setAttribute("y",trebleBottom);
    t.setAttribute("font-size",60);
    t.textContent="𝄞";
    staticGroup.appendChild(t);

    const b=document.createElementNS(SVG_NS,"text");
    b.setAttribute("x",leftMargin-34);
    b.setAttribute("y",bassBottom-8);
    b.setAttribute("font-size",60);
    b.textContent="𝄢";
    staticGroup.appendChild(b);
  }

  /* =======================
     NOTE DRAW
  ======================= */
  function ledger(y){
    const l=document.createElementNS(SVG_NS,"line");
    l.setAttribute("x1",noteX-18);
    l.setAttribute("x2",noteX+18);
    l.setAttribute("y1",y);
    l.setAttribute("y2",y);
    l.setAttribute("stroke","#000");
    notesGroup.appendChild(l);
  }

  function renderNote(name){
    notesGroup.innerHTML="";
    const n=parseNote(name);
    if(!n) return;

    const pitch=pitchClass(name);
    const deg=findDegree(pitch,keySignature);
    if(deg<0) return;

    const spelled=KEY_SCALES[keySignature][deg];
    const staffLetter=spelled[0];

    const step=staffStep(staffLetter,n.oct)-REF;
    const y=trebleBottom-step*half;

    if(y<trebleTop) for(let yy=trebleTop-lineSpacing;yy>=y;yy-=lineSpacing) ledger(yy);
    if(y>bassBottom) for(let yy=bassBottom+lineSpacing;yy<=y;yy+=lineSpacing) ledger(yy);

    const head=document.createElementNS(SVG_NS,"ellipse");
    head.setAttribute("cx",noteX);
    head.setAttribute("cy",y);
    head.setAttribute("rx",9);
    head.setAttribute("ry",6);
    head.setAttribute("transform",`rotate(-20 ${noteX} ${y})`);
    head.setAttribute("fill","#000");
    notesGroup.appendChild(head);

    const stem=document.createElementNS(SVG_NS,"line");
    const up=y>trebleTop+2*lineSpacing;
    stem.setAttribute("x1",up?noteX-8:noteX+8);
    stem.setAttribute("y1",y);
    stem.setAttribute("x2",up?noteX-8:noteX+8);
    stem.setAttribute("y2",y+(up?36:-36));
    stem.setAttribute("stroke","#000");
    notesGroup.appendChild(stem);

    if(pitch!==spelled){
      const a=document.createElementNS(SVG_NS,"text");
      a.setAttribute("x",noteX-18);
      a.setAttribute("y",y+4);
      a.setAttribute("font-size",12);
      a.textContent="♮";
      notesGroup.appendChild(a);
    }
  }

  /* =======================
     API
  ======================= */
  window.staffDrawNote=n=>renderNote(n);
  window.staffSetKey=k=>{ keySignature=k; drawStatic(); };

  document.getElementById("key-selector")
    .addEventListener("change",e=>staffSetKey(e.target.value));

  drawStatic();
})();