/* =========================
   STAFF CONFIG (DO NOT TOUCH)
   ========================= */

const STAFF = {
  lineCount: 5,
  lineSpacing: 12,
  topY: 40,
  leftX: 20,
  width: 420,
  noteRadius: 5
};

/* =========================
   STAFF POSITIONS (FIXED)
   These NEVER change.
   ========================= */

// Vertical positions for staff notes (treble clef reference)
const STAFF_POSITIONS = {
  C:  STAFF.topY + STAFF.lineSpacing * 6,
  D:  STAFF.topY + STAFF.lineSpacing * 5.5,
  E:  STAFF.topY + STAFF.lineSpacing * 5,
  F:  STAFF.topY + STAFF.lineSpacing * 4.5,
  G:  STAFF.topY + STAFF.lineSpacing * 4,
  A:  STAFF.topY + STAFF.lineSpacing * 3.5,
  B:  STAFF.topY + STAFF.lineSpacing * 3
};

/* =========================
   PIANO NOTE IDENTITIES
   12 abstract notes (octave-less)
   DO NOT CHANGE IDs
   ========================= */

const PIANO_NOTES = {
  a: "C",
  b: "C#",
  c: "D",
  d: "D#",
  e: "E",
  f: "F",
  g: "F#",
  h: "G",
  i: "G#",
  j: "A",
  k: "A#",
  l: "B"
};

/* =========================
   KEY SIGNATURE MAPPINGS
   THIS IS WHAT YOU EDIT
   ========================= */

/*
Each piano note (a–l) maps to:
- staffNote: C D E F G A B
- accidental: "#", "b", "♮", or ""
*/

const KEY_SIGNATURES = {

  C: {
    a: { staffNote: "C", accidental: ""  },
    b: { staffNote: "C", accidental: "#" },
    c: { staffNote: "D", accidental: ""  },
    d: { staffNote: "D", accidental: "#" },
    e: { staffNote: "E", accidental: ""  },
    f: { staffNote: "F", accidental: ""  },
    g: { staffNote: "F", accidental: "#" },
    h: { staffNote: "G", accidental: ""  },
    i: { staffNote: "G", accidental: "#" },
    j: { staffNote: "A", accidental: ""  },
    k: { staffNote: "A", accidental: "#" },
    l: { staffNote: "B", accidental: ""  }
  },

  Fsharp: {
    a: { staffNote: "B", accidental: "#" }, // C#
    b: { staffNote: "C", accidental: "#" },
    c: { staffNote: "D", accidental: ""  },
    d: { staffNote: "D", accidental: "#" },
    e: { staffNote: "E", accidental: "#" }, // E#
    f: { staffNote: "E", accidental: "#" }, // F = E#
    g: { staffNote: "F", accidental: "#" },
    h: { staffNote: "G", accidental: "#" },
    i: { staffNote: "A", accidental: ""  },
    j: { staffNote: "A", accidental: "#" },
    k: { staffNote: "B", accidental: ""  },
    l: { staffNote: "C", accidental: "#" }
  }

  // ADD MORE KEYS BY COPYING FULL BLOCKS
};

/* =========================
   STATE
   ========================= */

let currentKey = "C";
let activeNote = null;

/* =========================
   CANVAS SETUP
   ========================= */

const canvas = document.getElementById("staff");
const ctx = canvas.getContext("2d");

/* =========================
   DRAW STAFF
   ========================= */

function drawStaff() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  for (let i = 0; i < STAFF.lineCount; i++) {
    const y = STAFF.topY + i * STAFF.lineSpacing;
    ctx.beginPath();
    ctx.moveTo(STAFF.leftX, y);
    ctx.lineTo(STAFF.leftX + STAFF.width, y);
    ctx.stroke();
  }
}

/* =========================
   DRAW NOTE
   ========================= */

function drawNote(pianoId) {
  const map = KEY_SIGNATURES[currentKey][pianoId];
  if (!map) return;

  const y = STAFF_POSITIONS[map.staffNote];
  const x = STAFF.leftX + STAFF.width - 60;

  // Notehead
  ctx.beginPath();
  ctx.ellipse(x, y, STAFF.noteRadius + 2, STAFF.noteRadius, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  // Accidental
  if (map.accidental) {
    ctx.font = "14px serif";
    ctx.fillText(map.accidental, x - 14, y + 4);
  }
}

/* =========================
   PUBLIC API
   ========================= */

window.setKeySignature = function (key) {
  currentKey = key;
  redraw();
};

window.playPianoNote = function (pianoId) {
  activeNote = pianoId;
  redraw();
};

function redraw() {
  drawStaff();
  if (activeNote) drawNote(activeNote);
}

/* =========================
   INITIAL DRAW
   ========================= */

drawStaff();