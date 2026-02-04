/* piano.js - Fully self-contained piano UI + scrollbar + zoom + keys + audio    
   Designed so index.htm only needs: <script src="piano.js"></script>    
*/    
    
(function() {    
  // --- Inject CSS ---    
  const css = `    
html, body { margin: 0; padding: 0; overflow-x: hidden; box-sizing: border-box; font-family: Arial, sans-serif; background: #f4f4f4; }    
body { display: flex; flex-direction: column; align-items: stretch; }    
/* Scrollbar + buttons layout */    
#scrollbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between; /* ← KEY CHANGE */
  gap: 6px;
  margin: 6px auto;
  width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}
#piano-scrollbar {
  height: 28px;              /* taller = easier thumb grab */
  background: #ccc;
  border-radius: 8px;
  flex: 1;                 /* <-- KEY CHANGE: less width */
  position: relative;
  cursor: pointer;
}
#piano-scroll-thumb {
  height: 100%;
  background: #888;
  border-radius: 8px;
  position: absolute;
  left: 0;
  min-width: 40px;
}
#zoom-out, #zoom-in {
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
}

.scroll-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

#scroll-left-key, #scroll-right-key,
#scroll-left-octave, #scroll-right-octave {
  width: 30px;
  height: 30px;
  font-size: 16px;
  cursor: pointer;
}
/* Piano wrapper and keys */    
#piano-wrapper { height: 200px; overflow-x: auto; overflow-y: visible; -webkit-overflow-scrolling: touch; position: relative; margin: 0; padding: 0; display: flex; align-items: flex-start; }    
#piano-wrapper::-webkit-scrollbar { display: none; }    
#piano-container { position: relative; height: 100%; }    
/* ---------- White Keys ---------- */
.white-key {
  position: absolute;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  border: 1px solid #999;

  /* 3D Gradient Base */
  background: 
    linear-gradient(to bottom, #ffffff 0%, #e0e0e0 100%),   /* main shading */
    radial-gradient(circle at top center, rgba(255,255,255,0.6) 0%, transparent 40%); /* top highlight */

  /* Depth */
  box-shadow: 
    inset 0 -3px 5px rgba(0,0,0,0.1), /* subtle inner shadow for bevel */
    0 2px 4px rgba(0,0,0,0.2);        /* slight lift shadow */
  
  transition: background 0.1s, box-shadow 0.1s, transform 0.1s;
}

/* Key label */
.white-key .key-label {
  pointer-events: none;
  line-height: 1;
  user-select: none;
  position: absolute;
  bottom: 4px;
  width: 100%;
  text-align: center;
  font-size: 10px;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Press animation */
.white-key.pressed {
  background: 
    linear-gradient(to bottom, #dcdcdc 0%, #bfbfbf 100%),
    radial-gradient(circle at top center, rgba(255,255,255,0.3) 0%, transparent 40%);
  box-shadow: inset 0 0 4px rgba(0,0,0,0.3);
  transform: translateY(2px);
}

/* ---------- Black Keys ---------- */
.black-key {
  position: absolute;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  border-radius: 3px;

  /* 3D Gradient Base */
  background: 
    linear-gradient(to bottom, #333 0%, #111 100%),      /* base dark shading */
    radial-gradient(circle at top center, rgba(255,255,255,0.15) 0%, transparent 40%); /* subtle shine */

  /* Add side bevel / thickness illusion */
  box-shadow:
    inset 2px 0 3px rgba(255,255,255,0.08),   /* left bevel */
    inset -2px 0 3px rgba(0,0,0,0.5),        /* right shadow */
    0 4px 6px rgba(0,0,0,0.5);               /* bottom drop shadow */

  z-index: -1;
  color: #fff;
  transition: background 0.1s, box-shadow 0.1s, transform 0.1s;

  /* Slightly taller to overlap white keys more naturally */
  height: 65%; /* tweak as needed with your keyHeight */
}

/* Black key label */
.black-key .key-label {
  pointer-events: none;
  line-height: 1;
  user-select: none;
  position: absolute;
  bottom: 2px;
  width: 100%;
  text-align: center;
  font-size: 5px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Press animation */
.black-key.pressed {
  background: 
    linear-gradient(to bottom, #222 0%, #000 100%),
    radial-gradient(circle at top center, rgba(255,255,255,0.05) 0%, transparent 40%);
  box-shadow:
    inset 2px 0 3px rgba(255,255,255,0.05),
    inset -2px 0 3px rgba(0,0,0,0.7),
    0 2px 4px rgba(0,0,0,0.7);
  transform: translateY(1.5px);
}
  `;    
  const styleEl = document.createElement('style');    
  styleEl.textContent = css;    
  document.head.appendChild(styleEl);    
    
  // --- Create DOM ---    
  const pianoUnit = document.createElement('div'); pianoUnit.id = 'piano-unit'; document.body.appendChild(pianoUnit);    
  const scrollbarContainer = document.createElement('div'); scrollbarContainer.id = 'scrollbar-container';    
  const leftGroup = document.createElement('div'); leftGroup.className = 'scroll-group';    
  const btnScrollLeftOct = document.createElement('button'); btnScrollLeftOct.id='scroll-left-octave'; btnScrollLeftOct.textContent='<<';    
  const btnScrollLeftKey = document.createElement('button'); btnScrollLeftKey.id='scroll-left-key'; btnScrollLeftKey.textContent='<';    
  const btnZoomOut = document.createElement('button'); btnZoomOut.id='zoom-out'; btnZoomOut.textContent='-';    
  leftGroup.append(btnScrollLeftOct, btnScrollLeftKey, btnZoomOut);    
    
  const scrollBar = document.createElement('div'); scrollBar.id='piano-scrollbar';    
  const scrollThumb = document.createElement('div'); scrollThumb.id='piano-scroll-thumb'; scrollBar.appendChild(scrollThumb);    
    
  const rightGroup = document.createElement('div'); rightGroup.className='scroll-group';    
  const btnZoomIn = document.createElement('button'); btnZoomIn.id='zoom-in'; btnZoomIn.textContent='+';    
  const btnScrollRightKey = document.createElement('button'); btnScrollRightKey.id='scroll-right-key'; btnScrollRightKey.textContent='>';    
  const btnScrollRightOct = document.createElement('button'); btnScrollRightOct.id='scroll-right-octave'; btnScrollRightOct.textContent='>>';    
  rightGroup.append(btnZoomIn, btnScrollRightKey, btnScrollRightOct);    
    
  scrollbarContainer.append(leftGroup, scrollBar, rightGroup);    
  pianoUnit.appendChild(scrollbarContainer);    
    
  const pianoWrapper = document.createElement('div'); pianoWrapper.id='piano-wrapper';    
  const pianoContainer = document.createElement('div'); pianoContainer.id='piano-container';    
  pianoWrapper.appendChild(pianoContainer);    
  pianoUnit.appendChild(pianoWrapper);    
    
  window.pianoWrapper = pianoWrapper;    
  window.scrollBar = scrollBar;    
  window.scrollThumb = scrollThumb;    
    
  // --- Audio & keys ---    
  let audioCtx;    
  const activeNotes = new Map(); // noteName → noteObj    
  let keyHeight = 150;
let keyWidth, blackKeyWidth, blackKeyHeight;

const initialVisibleKeys = 12; // change this to whatever you like
const spacing = 1;              // whiteKeySpacing

  const whiteKeys = [], blackKeys = [];    
  const keyOrder = [    
    "A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1",    
    "A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2",    
    "A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3",    
    "A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4",    
    "A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5",    
    "A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6",    
    "A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7",    
    "A7","A#7","B7","C8"    
  ];    
    
  const noteFrequencies = {};    
  const A4=440;    
  keyOrder.forEach((note,i)=>{ const n=i-48; noteFrequencies[note]=+(A4*Math.pow(2,n/12)).toFixed(2); });    
    
// ----- REPLACE generateKeysOnce() AND updateKeyLayout() WITH THE FOLLOWING -----    
    
// We'll create a helper map from whiteNote -> whiteKey element for quick lookup    
function generateKeysOnce() {    
  pianoContainer.innerHTML = '';    
  whiteKeys.length = 0; blackKeys.length = 0;    
  const whiteNoteToIndex = {};    
  let whiteIndex = 0;    
    
  // create white keys (same as before but populate map)    
  keyOrder.forEach(note => {    
    if (!note.includes('#')) {    
      const wk = document.createElement('div');    
      wk.className = 'white-key';    
      wk.dataset.note = note; // e.g. "C4"    
      wk.dataset.wIndex = whiteIndex; // store index    
      const label = document.createElement('span'); label.className = 'key-label'; label.textContent = note;    
      wk.appendChild(label);    
      pianoContainer.appendChild(wk);    
      whiteKeys.push(wk);    
      whiteNoteToIndex[note] = whiteIndex;    
      whiteIndex++;    
    }    
  });    
    
  // create black keys and store reference -- do NOT attempt to compute left position here    
  keyOrder.forEach(note => {    
    if (note.includes('#')) {    
      const bk = document.createElement('div');    
      bk.className = 'black-key';    
      bk.dataset.note = note; // e.g. "C#4"    
      const label = document.createElement('span'); label.className = 'key-label'; label.textContent = note;    
      bk.appendChild(label);    
      pianoContainer.appendChild(bk);    
      blackKeys.push(bk);    
    }    
  });    
    
  // attach events after DOM is set    
  attachKeyEvents();    
    
  // return the map so updateKeyLayout can use it (we'll attach to function closure)    
  return whiteNoteToIndex;    
}    
    
// global-ish holder for mapping created at generation time    
let __whiteNoteToIndex = generateKeysOnce();  

function setInitialKeyWidth() {
  const spacing = 1;
  keyWidth = (pianoWrapper.clientWidth - (initialVisibleKeys - 1) * spacing) / initialVisibleKeys;
  blackKeyWidth = keyWidth * 0.65;
  blackKeyHeight = keyHeight * 0.6;
}    

// Improved updateKeyLayout    
function updateKeyLayout() {    
  // layout white keys sequentially and set explicit left positions    
  let whiteKeySpacing = 1; // 🔧 try 0.2 or -0.2 for fine tuning    
    
  let left = 0;    
  whiteKeys.forEach((wk, i) => {    
  wk.style.width = keyWidth + 'px';    
  wk.style.height = keyHeight + 'px';    
  wk.style.left = left + 'px';    
  wk.dataset.leftPx = left;    
  left += keyWidth + whiteKeySpacing; // ← add this spacing    
});    
    
  // realistic black key placement ratios (position as fraction from left white to right white)    
  // These are empirical / recommended; you can tweak them.    
  const blackKeyRatio = {    
    'C#': 0.97,    
    'D#': 1.12,    
    'F#': 0.88,    
    'G#': 1.05,    
    'A#': 1.15   
  };    
    
  // helper: find left and right white note names for a given black note index in keyOrder    
  function findAdjacentWhiteNotes(blackIndex) {    
    let left = null, right = null;    
    // scan back for left white    
    for (let i = blackIndex - 1; i >= 0; i--) {    
      if (!keyOrder[i].includes('#')) { left = keyOrder[i]; break; }    
    }    
    // scan forward for right white    
    for (let i = blackIndex + 1; i < keyOrder.length; i++) {    
      if (!keyOrder[i].includes('#')) { right = keyOrder[i]; break; }    
    }    
    return { left, right };    
  }    
    
  // layout black keys    
  blackKeys.forEach(bk => {    
    const note = bk.dataset.note;                  // e.g. "C#4"    
    const keyIndex = keyOrder.indexOf(note);    
    if (keyIndex === -1) return; // safety    
    
    const adj = findAdjacentWhiteNotes(keyIndex);    
    if (!adj.left || !adj.right) {    
      // fallback: place relative to left white (defensive)    
      const leftIdx = __whiteNoteToIndex[adj.left] ?? 0;    
      const leftW = whiteKeys[leftIdx];    
      const xLeft = parseFloat(leftW.dataset.leftPx || leftW.style.left || 0);    
      bk.style.width = blackKeyWidth + 'px';    
      bk.style.height = blackKeyHeight + 'px';    
      bk.style.left = (xLeft + keyWidth * 0.55 - blackKeyWidth/2) + 'px';    
      return;    
    }    
    
    const leftIdx = __whiteNoteToIndex[adj.left];    
    const rightIdx = __whiteNoteToIndex[adj.right];    
    const leftW = whiteKeys[leftIdx];    
    const rightW = whiteKeys[rightIdx];    
    const xLeft = parseFloat(leftW.dataset.leftPx || leftW.style.left || 0);    
    const xRight = parseFloat(rightW.dataset.leftPx || rightW.style.left || 0);    
    
    // choose pattern base (C#, D#, F# etc based on pitch class)    
    const pitchClass = note[0] + '#'; // 'C#', 'D#', etc    
    const ratio = (blackKeyRatio[pitchClass] !== undefined) ? blackKeyRatio[pitchClass] : 0.57;    
    
    // compute center between actual left and right white left positions    
    const center = xLeft + (xRight - xLeft) * ratio;    
    const leftForBk = center - blackKeyWidth / 2;    
    
    bk.style.width = blackKeyWidth + 'px';    
    bk.style.height = blackKeyHeight + 'px';    
    bk.style.left = leftForBk + 'px';    
  });    
}    
    
// generate & layout once (regenerate map after creating keys)    
__whiteNoteToIndex = generateKeysOnce();
setInitialKeyWidth();          // <-- NEW LINE
updateKeyLayout();
updateThumb();
    
  function playNote(note, velocity = 0.8) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  const freq = noteFrequencies[note];
  if (!freq) return;

  const now = audioCtx.currentTime;

  // --- Master gain with envelope based on velocity ---
  const masterGain = audioCtx.createGain();

  // Slight pan for realism
  const panNode = audioCtx.createStereoPanner();
  panNode.pan.value = (Math.random() - 0.5) * 0.2; // ±0.1 pan

  // Dynamic envelope
  const attack = 0.01;           // quick attack
  const decay = 0.12;            // decay
  const release = 0.35 + (0.15 * (1 - velocity)); // softer velocity = slightly longer release

  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(velocity * 0.5, now + attack); // attack
  masterGain.gain.linearRampToValueAtTime(velocity * 0.35, now + decay); // decay
  masterGain.gain.linearRampToValueAtTime(0, now + decay + release);      // release

  masterGain.connect(panNode).connect(audioCtx.destination);

  // --- Oscillators with subtle detune ---
  const osc1 = audioCtx.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(freq, now);
  osc1.detune.value = (Math.random() - 0.5) * 4; // ±2 cents
  osc1.connect(masterGain);
  osc1.start(now);

  const osc2 = audioCtx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq, now);
  osc2.detune.value = (Math.random() - 0.5) * 4; // ±2 cents
  const gain2 = audioCtx.createGain();
  gain2.gain.value = velocity * 0.4;
  osc2.connect(gain2).connect(masterGain);
  osc2.start(now);

  const noteObj = { osc1, osc2, gainNode: masterGain, panNode };

  // Stop function: faster release for rapid key presses
  noteObj.stop = function() {
    const t = audioCtx.currentTime;
    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.linearRampToValueAtTime(0, t + 0.3);
    setTimeout(() => { try { this.gainNode.disconnect(); } catch(e) {} }, 400);
    try { this.osc1.stop(t + 0.3); this.osc2.stop(t + 0.3); } catch(e) {}
  };

  activeNotes.set(note, noteObj);

if (window.staffNoteOn) window.staffNoteOn(note);
}

function stopNote(note) {
  const noteObj = activeNotes.get(note);
  if (!noteObj) return;

  noteObj.stop();
  activeNotes.delete(note);

  if (window.staffNoteOff) window.staffNoteOff(note);
}
    
  function attachKeyEvents() {
  [...whiteKeys, ...blackKeys].forEach(k => {
    const note = k.dataset.note;

    // Mouse
    k.addEventListener("mousedown", e => {
  e.preventDefault();
  k.classList.add("pressed");
  playNote(note);
});

k.addEventListener("mouseup", e => {
  e.preventDefault();
  k.classList.remove("pressed");
  stopNote(note);
});

k.addEventListener("mouseleave", () => {
  k.classList.remove("pressed");
  stopNote(note);
});

// Touch events
k.addEventListener("touchstart", e => {
  e.preventDefault();
  k.classList.add("pressed");
  playNote(note);
}, { passive: false });

k.addEventListener("touchend", e => {
  e.preventDefault();
  k.classList.remove("pressed");
  stopNote(note);
});

    k.addEventListener("touchcancel", () => {
      stopNote(note);
    });
  });
}
    
  // helper: get visual center of piano content

function getCenterRatio() {
  const centerX = pianoWrapper.scrollLeft + pianoWrapper.clientWidth / 2;
  return centerX / pianoWrapper.scrollWidth;
}

function restoreCenterFromRatio(ratio) {
  const newCenterX = ratio * pianoWrapper.scrollWidth;
  const newScroll = newCenterX - pianoWrapper.clientWidth / 2;

  const maxScroll =
    pianoWrapper.scrollWidth - pianoWrapper.clientWidth;

  pianoWrapper.scrollLeft = Math.min(
    Math.max(newScroll, 0),
    maxScroll
  );
}

function getTotalPianoWidthForKeyWidth(testKeyWidth) {
  const spacing = 1;
  return whiteKeys.length * testKeyWidth
       + (whiteKeys.length - 1) * spacing;
}

function getExactFitKeyWidth() {
  const spacing = 1;
  const available = pianoWrapper.clientWidth
                  - (whiteKeys.length - 1) * spacing;
  return available / whiteKeys.length;
}

// --- Zoom ---
function zoomKeys(factor) {
  const centerRatio = getCenterRatio();

  const MAX_KEY_WIDTH = 110;
  const ABSOLUTE_MIN = 8;

  let newKeyWidth = keyWidth * factor;

  const fitKeyWidth = getExactFitKeyWidth();
  const minAllowed = Math.max(ABSOLUTE_MIN, fitKeyWidth);

  // If zooming out, clamp ONLY when piano would fit
  if (factor < 1) {
    const testWidth = getTotalPianoWidthForKeyWidth(newKeyWidth);

    if (testWidth <= pianoWrapper.clientWidth) {
      newKeyWidth = fitKeyWidth;
    }
  }

  keyWidth = Math.min(
    Math.max(newKeyWidth, minAllowed),
    MAX_KEY_WIDTH
  );

  blackKeyWidth = keyWidth * 0.65;
  blackKeyHeight = keyHeight * 0.6;

  updateKeyLayout();
  restoreCenterFromRatio(centerRatio);
  updateThumb();

  if (window.updateUnitScale) {
    window.updateUnitScale();
  }
}
    
  document.getElementById('zoom-in').onclick=()=>zoomKeys(1.2);    
  document.getElementById('zoom-out').onclick=()=>zoomKeys(1/1.2);    
    
  // --- Scroll / Thumb logic ---    
   
  function updateThumb(){    
    const trackWidth=scrollBar.clientWidth;    
    const ratio=pianoWrapper.clientWidth/pianoWrapper.scrollWidth;    
    scrollThumb.style.width=Math.max(ratio*trackWidth,20)+'px';    
    const maxScroll=pianoWrapper.scrollWidth-pianoWrapper.clientWidth;    
    const clampedScroll=Math.min(Math.max(pianoWrapper.scrollLeft,0),Math.max(maxScroll,0));    
    scrollThumb.style.left=(clampedScroll/Math.max(maxScroll,1))*(trackWidth-scrollThumb.clientWidth)+'px';    
  }    

function getMinKeyWidthToFit() {
  const whiteKeyCount = whiteKeys.length;
  const spacing = 1; // same whiteKeySpacing you use
  const totalSpacing = spacing * (whiteKeyCount - 1);

  return (pianoWrapper.clientWidth - totalSpacing) / whiteKeyCount;
}
    
  pianoWrapper.addEventListener('scroll', updateThumb);    
  window.addEventListener('resize', updateThumb);    
    
  let isDragging=false, startX, startLeft;    
  function startDrag(x){ isDragging=true; startX=x; startLeft=parseFloat(scrollThumb.style.left)||0; }    
  function moveDrag(x){ if(!isDragging) return; const dx=x-startX; const trackWidth=scrollBar.clientWidth; const newLeft=Math.min(Math.max(startLeft+dx,0),trackWidth-scrollThumb.clientWidth); scrollThumb.style.left=newLeft+'px'; pianoWrapper.scrollLeft=(newLeft/(trackWidth-scrollThumb.clientWidth))*(pianoWrapper.scrollWidth-pianoWrapper.clientWidth); }    
  function endDrag(){ isDragging=false; }    
  scrollThumb.addEventListener('mousedown', e=>{startDrag(e.clientX); e.preventDefault();});    
  document.addEventListener('mousemove', e=>moveDrag(e.clientX));    
  document.addEventListener('mouseup', endDrag);    
  scrollThumb.addEventListener('touchstart', e=>{startDrag(e.touches[0].clientX); e.preventDefault();});    
  document.addEventListener('touchmove', e=>{if(isDragging){moveDrag(e.touches[0].clientX); e.preventDefault();}}, {passive:false});    
  document.addEventListener('touchend', endDrag);    
  scrollBar.addEventListener('click', e=>{ if(e.target===scrollThumb) return; const rect=scrollBar.getBoundingClientRect(); const clickX=e.clientX-rect.left; const trackWidth=scrollBar.clientWidth; const thumbW=scrollThumb.clientWidth; const newLeft=Math.min(Math.max(clickX-thumbW/2,0),trackWidth-thumbW); scrollThumb.style.left=newLeft+'px'; pianoWrapper.scrollLeft=(newLeft/(trackWidth-thumbW))*(pianoWrapper.scrollWidth-pianoWrapper.clientWidth); });    
    
  const scrollStepOctave=keyWidth*7;    
  btnScrollLeftOct.onclick=()=>{ pianoWrapper.scrollLeft=Math.max(pianoWrapper.scrollLeft-scrollStepOctave,0); updateThumb(); };    
  btnScrollRightOct.onclick=()=>{ const maxScroll=pianoWrapper.scrollWidth-pianoWrapper.clientWidth; pianoWrapper.scrollLeft=Math.min(pianoWrapper.scrollLeft+scrollStepOctave,maxScroll); updateThumb(); };    
  const scrollStepKey=keyWidth;    
  btnScrollLeftKey.onclick=()=>{ pianoWrapper.scrollLeft=Math.max(pianoWrapper.scrollLeft-scrollStepKey,0); updateThumb(); };    
  btnScrollRightKey.onclick=()=>{ const maxScroll=pianoWrapper.scrollWidth-pianoWrapper.clientWidth; pianoWrapper.scrollLeft=Math.min(pianoWrapper.scrollLeft+scrollStepKey,maxScroll); updateThumb(); };    
    
  // --- Focus middle C ---    
  function focusMiddleC() {
  const middleC = whiteKeys.find(k => k.dataset.note === 'E4');
  if (!middleC) return;

  const maxScroll = pianoWrapper.scrollWidth - pianoWrapper.clientWidth;
  const keyCenter =
    parseFloat(middleC.style.left) + keyWidth / 2;

  pianoWrapper.scrollLeft = Math.min(
    Math.max(keyCenter - pianoWrapper.clientWidth / 2, 0),
    maxScroll
  );

  updateThumb();
}
  window.addEventListener('load', () => { setInitialKeyWidth(); focusMiddleC(); });
window.addEventListener('resize', () => { setInitialKeyWidth(); focusMiddleC(); });
    
  generateKeysOnce();    
  updateKeyLayout();    
  updateThumb();    
    
  // --- Access individual key attributes ---    
  function getKeyAttributes(note){    
    const key=[...whiteKeys,...blackKeys].find(k=>k.dataset.note===note);    
    if(!key) return null;    
    return {    
      note: key.dataset.note,    
      width: parseFloat(key.style.width),    
      height: parseFloat(key.style.height),    
      left: parseFloat(key.style.left),    
      top: parseFloat(key.style.top)||0,    
      midPoint: parseFloat(key.style.left)+parseFloat(key.style.width)/2    
    };    
  }    
    
  window.piano={playNote, zoomKeys, whiteKeys, blackKeys, getKeyAttributes, pianoWrapper, pianoContainer, keyOrder, noteFrequencies};    
      
})();
