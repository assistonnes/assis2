/* ==================================================
   staff.js — SELF CONTAINED, NO HTML REQUIRED
   ================================================== */
(function () {

  /* ---------- CSS ---------- */
  const style = document.createElement("style");
  style.textContent = `
    #staff-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    #staff-canvas {
      background: #fff;
      border: 1px solid #999;
      max-width: 100%;
    }
    #staff-key-select {
      font-size: 16px;
      margin: 8px;
    }
  `;
  document.head.appendChild(style);

  /* ---------- DOM ---------- */
  const keySelect = document.createElement("select");
  keySelect.id = "staff-key-select";
  [
    "C","G","D","A","E","B","F#","C#",
    "F","Bb","Eb","Ab","Db","Gb","Cb"
  ].forEach(k=>{
    const o=document.createElement("option");
    o.textContent=k;
    keySelect.appendChild(o);
  });

  const wrap = document.createElement("div");
  wrap.id = "staff-wrapper";

  const canvas = document.createElement("canvas");
  canvas.id = "staff-canvas";
  canvas.width = 900;
  canvas.height = 220;

  wrap.appendChild(canvas);
  document.body.prepend(keySelect);
  document.body.prepend(wrap);

  const ctx = canvas.getContext("2d");

  /* ---------- STAFF GEOMETRY ---------- */
  const STAFF_TOP = 70;
  const LINE = 12;
  const NOTE_X = canvas.width / 2;

  const STAFF_Y = {
    C: STAFF_TOP + LINE*6,
    D: STAFF_TOP + LINE*5.5,
    E: STAFF_TOP + LINE*5,
    F: STAFF_TOP + LINE*4.5,
    G: STAFF_TOP + LINE*4,
    A: STAFF_TOP + LINE*3.5,
    B: STAFF_TOP + LINE*3
  };

  /* ---------- DRAW STAFF ---------- */
  function drawStaff() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle="#000";
    for(let i=0;i<5;i++){
      const y=STAFF_TOP+i*LINE;
      ctx.beginPath();
      ctx.moveTo(40,y);
      ctx.lineTo(canvas.width-40,y);
      ctx.stroke();
    }
  }

  /* ---------- DRAW NOTE ---------- */
  function drawNote(letter, accidental) {
    drawStaff();
    const y = STAFF_Y[letter];

    if (accidental) {
      ctx.font = "16px serif";
      ctx.fillText(
        accidental==="b"?"♭":accidental==="#"?"♯":"♮",
        NOTE_X-18,
        y+5
      );
    }

    ctx.beginPath();
    ctx.ellipse(NOTE_X, y, 6, 4, -0.4, 0, Math.PI*2);
    ctx.fill();
  }

  /* ---------- PIANO NOTE IDs ---------- */
  const PIANO = ["a","b","c","d","e","f","g","h","i","j","k","l"];

  /* ---------- FULL KEY MAPS ---------- */
  const KEY_MAP = {
    C:{a:{l:"C"},b:{l:"C",a:"#"},c:{l:"D"},d:{l:"D",a:"#"},e:{l:"E"},f:{l:"F"},g:{l:"F",a:"#"},h:{l:"G"},i:{l:"G",a:"#"},j:{l:"A"},k:{l:"A",a:"#"},l:{l:"B"}},
    G:{a:{l:"C"},b:{l:"C",a:"#"},c:{l:"D"},d:{l:"D",a:"#"},e:{l:"E"},f:{l:"F",a:"n"},g:{l:"F",a:"#"},h:{l:"G"},i:{l:"G",a:"#"},j:{l:"A"},k:{l:"A",a:"#"},l:{l:"B"}},
    D:{a:{l:"C",a:"n"},b:{l:"C",a:"#"},c:{l:"D"},d:{l:"D",a:"#"},e:{l:"E"},f:{l:"F",a:"n"},g:{l:"F",a:"#"},h:{l:"G"},i:{l:"G",a:"#"},j:{l:"A"},k:{l:"A",a:"#"},l:{l:"B"}},
    A:{a:{l:"C",a:"n"},b:{l:"C",a:"#"},c:{l:"D"},d:{l:"D",a:"#"},e:{l:"E"},f:{l:"F",a:"n"},g:{l:"F",a:"#"},h:{l:"G"},i:{l:"G",a:"#"},j:{l:"A"},k:{l:"A",a:"#"},l:{l:"B"}},
    E:{a:{l:"C",a:"n"},b:{l:"C",a:"#"},c:{l:"D",a:"n"},d:{l:"D",a:"#"},e:{l:"E"},f:{l:"F",a:"n"},g:{l:"F",a:"#"},h:{l:"G"},i:{l:"G",a:"#"},j:{l:"A"},k:{l:"A",a:"#"},l:{l:"B"}},
    B:{a:{l:"C",a:"n"},b:{l:"C",a:"#"},c:{l:"D",a:"n"},d:{l:"D",a:"#"},e:{l:"E",a:"n"},f:{l:"E",a:"#"},g:{l:"F",a:"#"},h:{l:"G"},i:{l:"G",a:"#"},j:{l:"A"},k:{l:"A",a:"#"},l:{l:"B"}},
    "F#":{a:{l:"E",a:"#"},b:{l:"F",a:"#"},c:{l:"G",a:"#"},d:{l:"A"},e:{l:"A",a:"#"},f:{l:"B"},g:{l:"B",a:"#"},h:{l:"C",a:"#"},i:{l:"D"},j:{l:"D",a:"#"},k:{l:"E"},l:{l:"E",a:"#"}},
    "C#":{a:{l:"E",a:"#"},b:{l:"F",a:"#"},c:{l:"G",a:"#"},d:{l:"A"},e:{l:"A",a:"#"},f:{l:"B"},g:{l:"B",a:"#"},h:{l:"C",a:"#"},i:{l:"D"},j:{l:"D",a:"#"},k:{l:"E"},l:{l:"E",a:"#"}},
    F:{a:{l:"C"},b:{l:"D",a:"b"},c:{l:"D"},d:{l:"E",a:"b"},e:{l:"E"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"G"},i:{l:"A",a:"b"},j:{l:"A"},k:{l:"B",a:"b"},l:{l:"B",a:"n"}},
    Bb:{a:{l:"C"},b:{l:"D",a:"b"},c:{l:"D"},d:{l:"E",a:"b"},e:{l:"E",a:"n"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"G"},i:{l:"A",a:"b"},j:{l:"A"},k:{l:"B",a:"b"},l:{l:"B",a:"n"}},
    Eb:{a:{l:"C"},b:{l:"D",a:"b"},c:{l:"D"},d:{l:"E",a:"b"},e:{l:"E",a:"n"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"G"},i:{l:"A",a:"b"},j:{l:"A"},k:{l:"B",a:"b"},l:{l:"C",a:"b"}},
    Ab:{a:{l:"C"},b:{l:"D",a:"b"},c:{l:"D"},d:{l:"E",a:"b"},e:{l:"F",a:"b"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"G"},i:{l:"A",a:"b"},j:{l:"A"},k:{l:"B",a:"b"},l:{l:"C",a:"b"}},
    Db:{a:{l:"C"},b:{l:"D",a:"b"},c:{l:"E",a:"b"},d:{l:"E",a:"b"},e:{l:"F",a:"b"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"A",a:"b"},i:{l:"A",a:"b"},j:{l:"A"},k:{l:"B",a:"b"},l:{l:"C",a:"b"}},
    Gb:{a:{l:"C",a:"b"},b:{l:"D",a:"b"},c:{l:"E",a:"b"},d:{l:"E",a:"b"},e:{l:"F",a:"b"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"A",a:"b"},i:{l:"A",a:"b"},j:{l:"B",a:"b"},k:{l:"B",a:"b"},l:{l:"C",a:"b"}},
    Cb:{a:{l:"C",a:"b"},b:{l:"D",a:"b"},c:{l:"E",a:"b"},d:{l:"F",a:"b"},e:{l:"F",a:"b"},f:{l:"F"},g:{l:"G",a:"b"},h:{l:"A",a:"b"},i:{l:"A",a:"b"},j:{l:"B",a:"b"},k:{l:"B",a:"b"},l:{l:"C",a:"b"}}
  };

  /* ---------- PUBLIC API ---------- */
  window.staffDrawNote = function(pianoIndex){
    const key = keySelect.value;
    const id = PIANO[pianoIndex % 12];
    const n = KEY_MAP[key][id];
    drawNote(n.l, n.a);
  };

  drawStaff();

})();