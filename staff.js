// staff.js — FULL manual mapping, zero theory automation
(function () {

  /* =======================
     CSS (SAFE, UNCHANGED)
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

  /* =======================
     SVG SETUP
  ======================= */
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 230, H = 230;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  document.getElementById("image-placeholder").appendChild(svg);

  const staticGroup = document.createElementNS(SVG_NS, "g");
  const notesGroup = document.createElementNS(SVG_NS, "g");
  svg.appendChild(staticGroup);
  svg.appendChild(notesGroup);

  /* =======================
     STAFF GEOMETRY
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
  const STAFF_SLOT = { C:0, D:1, E:2, F:3, G:4, A:5, B:6 };
  const REF_STEP = 4 * 7 + STAFF_SLOT.E; // E4 reference

  /* =======================
     PIANO IDS (12 SEMITONES)
  ======================= */
  const P = {
    C:"a", CSH:"b", D:"c", DSH:"d",
    E:"e", F:"f", FSH:"g",
    G:"h", GSH:"i",
    A:"j", ASH:"k", B:"l"
  };

  /* =======================
     🔥 FULL KEY MAP 🔥
     EDIT VALUES ONLY
  ======================= */
  const KEY_MAP = {

    C: {
      a:{s:"C",a:""}, b:{s:"C",a:"#"},
      c:{s:"D",a:""}, d:{s:"D",a:"#"},
      e:{s:"E",a:""},
      f:{s:"F",a:""}, g:{s:"F",a:"#"},
      h:{s:"G",a:""}, i:{s:"G",a:"#"},
      j:{s:"A",a:""}, k:{s:"A",a:"#"},
      l:{s:"B",a:""}
    },

    G: {
      a:{s:"C",a:""}, b:{s:"C",a:"#"},
      c:{s:"D",a:""}, d:{s:"D",a:"#"},
      e:{s:"E",a:""},
      f:{s:"F",a:"#"}, g:{s:"F",a:"##"},
      h:{s:"G",a:""}, i:{s:"G",a:"#"},
      j:{s:"A",a:""}, k:{s:"A",a:"#"},
      l:{s:"B",a:""}
    },

    D: {
      a:{s:"C",a:"#"}, b:{s:"C",a:"##"},
      c:{s:"D",a:""}, d:{s:"D",a:"#"},
      e:{s:"E",a:""},
      f:{s:"F",a:"#"}, g:{s:"F",a:"##"},
      h:{s:"G",a:""}, i:{s:"G",a:"#"},
      j:{s:"A",a:""}, k:{s:"A",a:"#"},
      l:{s:"B",a:""}
    },

    A: {
      a:{s:"C",a:"#"}, b:{s:"C",a:"##"},
      c:{s:"D",a:""}, d:{s:"D",a:"#"},
      e:{s:"E",a:""},
      f:{s:"F",a:"#"}, g:{s:"F",a:"##"},
      h:{s:"G",a:"#"}, i:{s:"G",a:"##"},
      j:{s:"A",a:""}, k:{s:"A",a:"#"},
      l:{s:"B",a:""}
    },

    E: {
      a:{s:"C",a:"#"}, b:{s:"C",a:"##"},
      c:{s:"D",a:"#"}, d:{s:"D",a:"##"},
      e:{s:"E",a:""},
      f:{s:"F",a:"#"}, g:{s:"F",a:"##"},
      h:{s:"G",a:"#"}, i:{s:"G",a:"##"},
      j:{s:"A",a:""}, k:{s:"A",a:"#"},
      l:{s:"B",a:""}
    },

    B: {
      a:{s:"C",a:"#"}, b:{s:"C",a:"##"},
      c:{s:"D",a:"#"}, d:{s:"D",a:"##"},
      e:{s:"E",a:""},
      f:{s:"F",a:"#"}, g:{s:"F",a:"##"},
      h:{s:"G",a:"#"}, i:{s:"G",a:"##"},
      j:{s:"A",a:"#"}, k:{s:"A",a:"##"},
      l:{s:"B",a:""}
    },

    "F#": {
      a:{s:"C",a:"#"}, b:{s:"C",a:"##"},
      c:{s:"D",a:"#"}, d:{s:"D",a:"##"},
      e:{s:"E",a:"#"},
      f:{s:"E",a:"#"},
      g:{s:"F",a:"#"},
      h:{s:"G",a:"#"}, i:{s:"G",a:"##"},
      j:{s:"A",a:"#"}, k:{s:"A",a:"##"},
      l:{s:"B",a:"#"}
    },

    "C#": {
      a:{s:"C",a:"#"}, b:{s:"C",a:"##"},
      c:{s:"D",a:"#"}, d:{s:"D",a:"##"},
      e:{s:"E",a:"#"},
      f:{s:"E",a:"#"},
      g:{s:"F",a:"#"},
      h:{s:"G",a:"#"}, i:{s:"G",a:"##"},
      j:{s:"A",a:"#"}, k:{s:"A",a:"##"},
      l:{s:"B",a:"#"}
    },

    F: {
      a:{s:"C",a:""}, b:{s:"D",a:"b"},
      c:{s:"D",a:""}, d:{s:"E",a:"b"},
      e:{s:"E",a:""},
      f:{s:"F",a:""}, g:{s:"G",a:"b"},
      h:{s:"G",a:""}, i:{s:"A",a:"b"},
      j:{s:"A",a:""}, k:{s:"B",a:"b"},
      l:{s:"B",a:""}
    },

    Bb: {
      a:{s:"C",a:""}, b:{s:"D",a:"b"},
      c:{s:"D",a:""}, d:{s:"E",a:"b"},
      e:{s:"E",a:"b"},
      f:{s:"F",a:""}, g:{s:"G",a:"b"},
      h:{s:"G",a:""}, i:{s:"A",a:"b"},
      j:{s:"A",a:""}, k:{s:"B",a:"b"},
      l:{s:"B",a:"b"}
    },

    Eb: {
      a:{s:"C",a:""}, b:{s:"D",a:"b"},
      c:{s:"D",a:""}, d:{s:"E",a:"b"},
      e:{s:"E",a:"b"},
      f:{s:"F",a:""}, g:{s:"G",a:"b"},
      h:{s:"G",a:""}, i:{s:"A",a:"b"},
      j:{s:"A",a:"b"},
      k:{s:"B",a:"b"},
      l:{s:"B",a:"b"}
    },

    Ab: {
      a:{s:"C",a:""}, b:{s:"D",a:"b"},
      c:{s:"D",a:"b"}, d:{s:"E",a:"b"},
      e:{s:"E",a:"b"},
      f:{s:"F",a:""}, g:{s:"G",a:"b"},
      h:{s:"G",a:""}, i:{s:"A",a:"b"},
      j:{s:"A",a:"b"},
      k:{s:"B",a:"b"},
      l:{s:"B",a:"b"}
    },

    Db: {
      a:{s:"C",a:"b"},
      b:{s:"C",a:"b"},
      c:{s:"D",a:"b"},
      d:{s:"D",a:"b"},
      e:{s:"E",a:"b"},
      f:{s:"F",a:""},
      g:{s:"G",a:"b"},
      h:{s:"G",a:"b"},
      i:{s:"A",a:"b"},
      j:{s:"A",a:"b"},
      k:{s:"B",a:"b"},
      l:{s:"B",a:"b"}
    },

    Gb: {
      a:{s:"C",a:"b"},
      b:{s:"C",a:"b"},
      c:{s:"D",a:"b"},
      d:{s:"D",a:"b"},
      e:{s:"E",a:"b"},
      f:{s:"F",a:"b"},
      g:{s:"F",a:"b"},
      h:{s:"G",a:"b"},
      i:{s:"A",a:"b"},
      j:{s:"A",a:"b"},
      k:{s:"B",a:"b"},
      l:{s:"B",a:"b"}
    },

    Cb: {
      a:{s:"C",a:"b"},
      b:{s:"C",a:"b"},
      c:{s:"D",a:"b"},
      d:{s:"D",a:"b"},
      e:{s:"E",a:"b"},
      f:{s:"F",a:"b"},
      g:{s:"F",a:"b"},
      h:{s:"G",a:"b"},
      i:{s:"A",a:"b"},
      j:{s:"A",a:"b"},
      k:{s:"B",a:"b"},
      l:{s:"B",a:"b"}
    }
  };

  let currentKey = "C";

  /* =======================
     DRAW STAFF
  ======================= */
  function drawLines(top) {
    for (let i=0;i<5;i++) {
      const y = top + i*lineSpacing;
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
    staticGroup.innerHTML="";
    drawLines(trebleTop);
    drawLines(bassTop);
  }

  /* =======================
     NOTE RENDER
  ======================= */
  function renderNote(id, octave=4) {
    notesGroup.innerHTML="";
    const map = KEY_MAP[currentKey][id];
    if (!map) return;

    const step = octave*7 + STAFF_SLOT[map.s] - REF_STEP;
    const y = trebleBottom - step*half;

    const head = document.createElementNS(SVG_NS,"ellipse");
    head.setAttribute("cx",noteX);
    head.setAttribute("cy",y);
    head.setAttribute("rx",9);
    head.setAttribute("ry",6);
    head.setAttribute("transform",`rotate(-20 ${noteX} ${y})`);
    head.setAttribute("fill","#000");
    notesGroup.appendChild(head);

    if (map.a) {
      const t = document.createElementNS(SVG_NS,"text");
      t.setAttribute("x",noteX-22);
      t.setAttribute("y",y+4);
      t.textContent = map.a==="##"?"𝄪":map.a==="#"?"♯":map.a==="b"?"♭":"♮";
      notesGroup.appendChild(t);
    }
  }

  /* =======================
     API
  ======================= */
  window.staffDrawPiano = (id,oct=4)=>renderNote(id,oct);
  window.staffSetKey = k=>{currentKey=k; drawStatic(); notesGroup.innerHTML="";};

  document.getElementById("key-selector").addEventListener("change",e=>{
    staffSetKey(e.target.value);
  });

  drawStatic();
})();