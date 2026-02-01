// staff.js — self-contained, SAFE version with MANUAL mapping control
(function () {

  /* =======================
     CSS (UNCHANGED GEOMETRY)
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
     LAYOUT (UNCHANGED)
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
     FIXED STAFF SLOTS
  ======================= */
  const STAFF_SLOT_INDEX = {
    C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
  };

  const REF_STEP = 4 * 7 + STAFF_SLOT_INDEX.E; // E4 reference

  /* =======================
     PIANO IDENTITY (FIXED)
  ======================= */
  const PIANO_IDS = {
    C:  "a",
    CSH:"b",
    D:  "c",
    DSH:"d",
    E:  "e",
    F:  "f",
    FSH:"g",
    G:  "h",
    GSH:"i",
    A:  "j",
    ASH:"k",
    B:  "l"
  };

  /* =======================
     KEY → MANUAL MAPPING
     YOU EDIT THESE TABLES
  ======================= */
  const KEY_MAP = {

    C: {
      a:{slot:"C",acc:""},  b:{slot:"C",acc:"#"},
      c:{slot:"D",acc:""},  d:{slot:"D",acc:"#"},
      e:{slot:"E",acc:""},
      f:{slot:"F",acc:""},  g:{slot:"F",acc:"#"},
      h:{slot:"G",acc:""},  i:{slot:"G",acc:"#"},
      j:{slot:"A",acc:""},  k:{slot:"A",acc:"#"},
      l:{slot:"B",acc:""}
    },

    "F#": {
      a:{slot:"C",acc:"#"},
      b:{slot:"C",acc:"##"},
      c:{slot:"D",acc:"#"},
      d:{slot:"D",acc:"##"},
      e:{slot:"E",acc:"#"},   // E#
      f:{slot:"E",acc:"#"},   // F → E#
      g:{slot:"F",acc:"#"},
      h:{slot:"G",acc:"#"},
      i:{slot:"G",acc:"##"},
      j:{slot:"A",acc:"#"},
      k:{slot:"A",acc:"##"},
      l:{slot:"B",acc:"#"}
    }

    // 👉 YOU ADD MORE KEYS HERE
  };

  let currentKey = "C";

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

  function renderNote(pianoId, octave=4) {
    notesGroup.innerHTML = "";

    const keyTable = KEY_MAP[currentKey];
    if (!keyTable || !keyTable[pianoId]) return;

    const { slot, acc } = keyTable[pianoId];

    const step = octave*7 + STAFF_SLOT_INDEX[slot] - REF_STEP;
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

    if (acc) {
      const t = document.createElementNS(SVG_NS,"text");
      t.setAttribute("x",noteX-22);
      t.setAttribute("y",y+4);
      t.setAttribute("font-size",12);
      t.textContent = acc === "##" ? "𝄪" : acc === "#" ? "♯" : acc === "b" ? "♭" : "♮";
      notesGroup.appendChild(t);
    }
  }

  /* =======================
     API
  ======================= */
  window.staffDrawPiano = (id, octave=4) => renderNote(id, octave);
  window.staffSetKey = k => { currentKey = k; drawStatic(); notesGroup.innerHTML=""; };

  document.getElementById("key-selector").addEventListener("change", e => {
    staffSetKey(e.target.value);
  });

  drawStatic();
})();