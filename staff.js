// staff.js — self-contained, DOM-safe
document.addEventListener("DOMContentLoaded", () => {
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
  if (!container) {
    console.error("staff.js: image-placeholder not found");
    return;
  }

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

  const letterIndex = { C:0, D:1, E:2, F:3, G:4, A:5, B:6 };

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
     NOTE DRAW (still simple for now)
  ======================= */
  function renderNote(name) {
    notesGroup.innerHTML = "";
    const n = parseNote(name);
    if (!n) return;

    const step = diatonicStep(n) - REF;
    const y = trebleBottom - step * half;

    const head = document.createElementNS(SVG_NS,"ellipse");
    head.setAttribute("cx",noteX);
    head.setAttribute("cy",y);
    head.setAttribute("rx",9);
    head.setAttribute("ry",6);
    head.setAttribute("transform",`rotate(-20 ${noteX} ${y})`);
    head.setAttribute("fill","#000");
    notesGroup.appendChild(head);
  }

  /* =======================
     API
  ======================= */
  window.staffDrawNote = n => renderNote(n);
  window.staffSetKey = k => { keySignature = k; drawStatic(); };

  document.getElementById("key-selector")
    .addEventListener("change", e => staffSetKey(e.target.value));

  drawStatic();

})();
});