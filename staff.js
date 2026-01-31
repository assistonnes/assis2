/* ===========================
   STAFF.JS – CLEAN REWRITE
   =========================== */

/* ---------- CONFIG ---------- */

const STAFF_CONFIG = {
  lineSpacing: 12,
  staffTop: 40,
  noteRadius: 5,
};

/* ---------- KEY SIGNATURE TABLES ---------- */

const KEY_SIGNATURES = {
  C:  ["C", "D", "E", "F", "G", "A", "B"],
  G:  ["G", "A", "B", "C", "D", "E", "F#"],
  D:  ["D", "E", "F#", "G", "A", "B", "C#"],
  A:  ["A", "B", "C#", "D", "E", "F#", "G#"],
  E:  ["E", "F#", "G#", "A", "B", "C#", "D#"],
  B:  ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],

  F:  ["F", "G", "A", "Bb", "C", "D", "E"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "Gb"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  Gb: ["Gb", "Ab", "Bb", "C", "Db", "Eb", "F"],
  Cb: ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
};

/* ---------- STAFF POSITIONS (TREBLE CLEF) ---------- */
/* Reference: E4 = bottom line */

const STAFF_POSITIONS = {
  C: -6,
  D: -5,
  E: -4,
  F: -3,
  G: -2,
  A: -1,
  B:  0,
};

/* ---------- CANVAS SETUP ---------- */

const canvas = document.createElement("canvas");
canvas.width = 600;
canvas.height = 180;
canvas.id = "staff-canvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

/* ---------- DRAW STAFF ---------- */

function drawStaff() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5; i++) {
    const y = STAFF_CONFIG.staffTop + i * STAFF_CONFIG.lineSpacing;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
  }
}

drawStaff();

/* ---------- UTILITIES ---------- */

function parseNote(note) {
  const match = note.match(/^([A-G])([b#]?)(\d)$/);
  if (!match) return null;

  return {
    letter: match[1],
    accidental: match[2] || "",
    octave: parseInt(match[3], 10),
  };
}

function normalizePitch(note) {
  const enharmonics = {
    "E#": "F",
    "B#": "C",
    "Cb": "B",
    "Fb": "E",
  };
  return enharmonics[note] || note;
}

/* ---------- MAP PIANO NOTE → STAFF NOTE ---------- */

function mapToKeySignature(noteName, key) {
  const keyScale = KEY_SIGNATURES[key];
  if (!keyScale) return noteName;

  const baseLetter = noteName[0];
  const normalized = normalizePitch(noteName.slice(0, -1));

  for (const scaleNote of keyScale) {
    if (normalizePitch(scaleNote) === normalized) {
      return scaleNote;
    }
  }

  return noteName;
}

/* ---------- DRAW NOTE ---------- */

function drawNote(noteName) {
  drawStaff();

  const key = window.currentKey || "C";
  const parsed = parseNote(noteName);
  if (!parsed) return;

  const staffNote = mapToKeySignature(noteName.slice(0, -1), key);

  const letter = staffNote[0];
  const accidental = staffNote.slice(1);

  const baseOffset = STAFF_POSITIONS[letter];
  const octaveOffset = (parsed.octave - 4) * 7;

  const y =
    STAFF_CONFIG.staffTop +
    4 * STAFF_CONFIG.lineSpacing -
    (baseOffset + octaveOffset) * (STAFF_CONFIG.lineSpacing / 2);

  const x = 120;

  // Draw note head
  ctx.beginPath();
  ctx.ellipse(x, y, STAFF_CONFIG.noteRadius, STAFF_CONFIG.noteRadius - 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw accidental if needed
  if (accidental) {
    ctx.font = "16px serif";
    ctx.fillText(accidental === "#" ? "♯" : "♭", x - 14, y + 5);
  }
}

/* ---------- PUBLIC API ---------- */
/* 🔧 CHANGE THIS NAME IF YOUR PIANO USES A DIFFERENT HOOK */

window.drawStaffNote = drawNote;