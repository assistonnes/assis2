// staff.js — FULLY self-contained (CSS + HTML + SVG + logic) with per-key mapping
(function () {
  /* =======================
     CSS
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

  const totalHeight = 4*lineSpacing + 2*lineSpacing + 4*lineSpacing;
  const topMargin = (H - totalHeight) / 2;

  const trebleTop = topMargin;
  const trebleBottom = trebleTop + 4 * lineSpacing;
  const bassTop = trebleBottom + 2 * lineSpacing;
  const bassBottom = bassTop + 4 * lineSpacing;

  const noteX = W / 2 + 30;

  /* =======================
     THEORY
  ======================= */
  let keySignature = "C";

  // Per-key mapping: piano key -> staff letter (with accidental if needed)
  const STAFF_MAPPING = {
    C:   {C:'C', D:'D', E:'E', F:'F', G:'G', A:'A', B:'B'},
    G:   {C:'C', D:'D', E:'E', F:'F#', G:'G', A:'A', B:'B'},
    D:   {C:'C#', D:'D', E:'E', F:'F#', G:'G', A:'A', B:'B'},
    A:   {C:'C#', D:'D', E:'E', F:'F#', G:'G#', A:'A', B:'B'},
    E:   {C:'C#', D:'D#', E:'E', F:'F#', G:'G#', A:'A', B:'B'},
    B:   {C:'C#', D:'D#', E:'E', F:'F#', G:'G#', A:'A#', B:'B'},
    'F#':{C:'C#', D:'D#', E:'E#', F:'F#', G:'G#', A:'A#', B:'B#'},
    'C#':{C:'C#', D:'D#', E:'E#', F:'F#', G:'G#', A:'A#', B:'B#'},
    F:   {C:'C', D:'D', E:'E', F:'F', G:'G', A:'A', B:'Bb'},
    Bb:  {C:'C', D:'D', E:'Eb', F:'F', G:'G', A:'A', B:'Bb'},
    Eb:  {C:'C', D:'D', E:'Eb', F:'F', G:'G', A:'Ab', B:'Bb'},
    Ab:  {C:'C', D:'Db', E:'Eb', F:'F', G:'G', A:'Ab', B:'Bb'},
    Db:  {C:'C', D:'Db', E:'Eb', F:'F', G:'Gb', A:'Ab', B:'Bb'},
    Gb:  {C:'C', D:'Db', E:'Eb', F:'F', G:'Gb', A:'Ab', B:'Cb'},
    Cb:  {C:'Cb', D:'Db', E:'Eb', F:'Fb', G:'Gb', A:'Ab', B:'Cb'}
  };

  const letterIndex = {C:0,D:1,E:2,F:3,G:4,A:5,B:6};

  function parseNote(n) {
    const m = /^([A-G])([#b]?)(-?\d+)$/.exec(n);
    if (!m) return null;
    return { letter:m[1], accidental:m[2], octave:+m[3] };
  }

  function diatonicStep(n) {
    return n.octave * 7 + letterIndex[n.letter];
  }

  const REF = diatonicStep({letter:"E", octave:4});

  /* =======================
     STATIC DRAW
  ======================= */
  function drawLines(topY) {
    for (let i=0;i<5;i++) {
      const y = topY + i*lineSpacing;
      const l = document.createElementNS(SVG_NS,"line");
      l.setAttribute("x1", leftMargin-36);
      l.setAttribute("x2", rightMargin);
      l.setAttribute("y1", y);
      l.setAttribute("y2", y);
      l.setAttribute("stroke","#000");
      staticGroup.appendChild(l);
    }
  }

  function drawStatic() {
    staticGroup.innerHTML = "";

    drawLines(trebleTop);
    drawLines(bassTop);

    const treble = document.createElementNS(SVG_NS,"text");
    treble.setAttribute("x", leftMargin-34);
    treble.setAttribute("y", trebleBottom);
    treble.setAttribute("font-size", 60);
    treble.textContent = "𝄞";
    staticGroup.appendChild(treble);

    const bass = document.createElementNS(SVG_NS,"text");
    bass.setAttribute("x", leftMargin-34);
    bass.setAttribute("y", bassBottom-8);
    bass.setAttribute("font-size", 60);
    bass.textContent = "𝄢";
    staticGroup.appendChild(bass);
  }

  /* =======================
     NOTE DRAW
  ======================= */
  function ledger(y) {
    const l = document.createElementNS(SVG_NS,"line");
    l.setAttribute("x1", noteX-18);
    l.setAttribute("x2", noteX+18);
    l.setAttribute("y1", y);
    l.setAttribute("y2", y);
    l.setAttribute("stroke","#000");
    notesGroup.appendChild(l);
  }

  function renderNote(name) {
    notesGroup.innerHTML = "";
    const n = parseNote(name);
    if (!n) return;

    // --- Map piano letter to staff letter per key ---
    const staffLetterRaw = STAFF_MAPPING[keySignature][n.letter] || n.letter;
    const staffLetter = staffLetterRaw.replace(/[b#]/,'');
    const accidentalStaff = staffLetterRaw.includes('#') ? '#' :
                            staffLetterRaw.includes('b') ? 'b' : '';

    // create new note object for diatonic calculation
    const nStaff = {letter:staffLetter, octave:n.octave};
    const step = diatonicStep(nStaff) - REF;
    const y = trebleBottom - step * half;

    if (y < trebleTop)
      for (let yy=trebleTop-lineSpacing; yy>=y; yy-=lineSpacing) ledger(yy);

    if (y > bassBottom)
      for (let yy=bassBottom+lineSpacing; yy<=y; yy+=lineSpacing) ledger(yy);

    const head = document.createElementNS(SVG_NS,"ellipse");
    head.setAttribute("cx",noteX);
    head.setAttribute("cy",y);
    head.setAttribute("rx",9);
    head.setAttribute("ry",6);
    head.setAttribute("transform",`rotate(-20 ${noteX} ${y})`);
    head.setAttribute("fill","#000");
    notesGroup.appendChild(head);

    const stem = document.createElementNS(SVG_NS,"line");
    const up = y > trebleTop + 2*lineSpacing;
    stem.setAttribute("x1", up ? noteX-8 : noteX+8);
    stem.setAttribute("y1", y);
    stem.setAttribute("x2", up ? noteX-8 : noteX+8);
    stem.setAttribute("y2", y + (up?36:-36));
    stem.setAttribute("stroke","#000");
    notesGroup.appendChild(stem);

    // --- Determine if accidental is displayed ---
    let acc = "";
    if (n.accidental) {
      if (n.accidental !== accidentalStaff)
        acc = n.accidental === "#" ? "♯" : "♭";
    } else if (accidentalStaff) acc = "♮";

    if (acc) {
      const t = document.createElementNS(SVG_NS,"text");
      t.setAttribute("x",noteX-18);
      t.setAttribute("y",y+4);
      t.setAttribute("font-size",12);
      t.textContent = acc;
      notesGroup.appendChild(t);
    }
  }

  /* =======================
     API + EVENTS
  ======================= */
  window.staffDrawNote = n => { try { renderNote(n); } catch(e){console.error(e);} };
  window.staffSetKey = k => { keySignature = k; drawStatic(); };

  document.getElementById("key-selector").addEventListener("change", e => {
    staffSetKey(e.target.value);
  });

  window.addEventListener("resize", () => {
    drawStatic();
    notesGroup.innerHTML = "";
  });

  drawStatic();
})();