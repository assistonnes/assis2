let audioCtx;

const activeNotes = new Set();

let keyWidth = 24; // starting width of white keys
const keyHeight = 110;
let blackKeyWidth = 16;
let blackKeyHeight = 66;

// 88-key layout
const keyOrder = [
  "A0","A#0","B0",
  "C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1",
  "A1","A#1","B1",
  "C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2",
  "A2","A#2","B2",
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3",
  "A3","A#3","B3",
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4",
  "A4","A#4","B4",
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5",
  "A5","A#5","B5",
  "C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6",
  "A6","A#6","B6",
  "C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7",
  "A7","A#7","B7",
  "C8"
];

// Frequencies
const noteFrequencies = {};
const A4 = 440;

keyOrder.forEach((note,i)=>{
  const n = i - 48;
  noteFrequencies[note] = +(A4 * Math.pow(2,n/12)).toFixed(2);
});

const pianoContainer = document.getElementById('piano-container');
const whiteKeys = [];
const blackKeys = [];

// --- Generate piano keys ---
function generateKeys(){
  pianoContainer.innerHTML = '';
  whiteKeys.length = 0;
  blackKeys.length = 0;
  let whiteIndex = 0;

  // Create white keys
  keyOrder.forEach(note => {
    if(!note.includes("#")){
      const keyDiv = document.createElement('div');
      keyDiv.className = 'white-key';
      keyDiv.dataset.note = note;
      keyDiv.style.width = keyWidth + 'px';
      keyDiv.style.height = keyHeight + 'px';
      keyDiv.style.left = (whiteIndex * keyWidth) + 'px';

      // add full note label
      const label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = note; // e.g., C4
      keyDiv.appendChild(label);
      pianoContainer.appendChild(keyDiv);
      whiteKeys.push(keyDiv);
      whiteIndex++;
    }
  });

  // Create black keys
  keyOrder.forEach(note => {
    if(note.includes("#")){
      const letter = note[0];
      const octave = parseInt(note[2]);
      const wk = whiteKeys.find(k => k.dataset.note[0] === letter && parseInt(k.dataset.note[1]) === octave);
      if(wk){
        const bkDiv = document.createElement('div');
        bkDiv.className = 'black-key';
        bkDiv.dataset.note = note;

        // Proportional black key size
        bkDiv.style.width = blackKeyWidth + 'px';
        bkDiv.style.height = blackKeyHeight + 'px';
        bkDiv.style.left = (parseInt(wk.style.left) + keyWidth - blackKeyWidth / 2) + 'px';

        // add full note label
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = note; // e.g., C#4
        bkDiv.appendChild(label);
        pianoContainer.appendChild(bkDiv);
        blackKeys.push(bkDiv);
      }
    }
  });

  attachKeyEvents();
}

generateKeys();

// --- Play a note ---
function playNote(note, velocity=0.8){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==="suspended") audioCtx.resume();

  const freq = noteFrequencies[note];
  if(!freq) return;

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(velocity*0.5, now+0.01);
  masterGain.gain.linearRampToValueAtTime(velocity*0.35, now+0.2);
  masterGain.connect(audioCtx.destination);

  const osc1 = audioCtx.createOscillator();
  osc1.type="triangle";
  osc1.frequency.setValueAtTime(freq, now);
  osc1.connect(masterGain);
  osc1.start(now);

  const osc2 = audioCtx.createOscillator();
  osc2.type="sine";
  osc2.frequency.setValueAtTime(freq, now);
  const gain2 = audioCtx.createGain();
  gain2.gain.value = velocity*0.4;
  osc2.connect(gain2).connect(masterGain);
  osc2.start(now);

  const noteObj = {osc1, osc2, gainNode: masterGain};
  noteObj.stop = function(){
    const t = audioCtx.currentTime;
    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.linearRampToValueAtTime(0, t+0.5);
    setTimeout(()=>{try{this.gainNode.disconnect();}catch(e){}},600);
    try{this.osc1.stop(t+0.5); this.osc2.stop(t+0.5);}catch(e){}
  };

  activeNotes.add(noteObj);
  setTimeout(()=>{noteObj.stop(); activeNotes.delete(noteObj);}, 1000);

  if(window.staffDrawNote) 
  window.staffDrawNote(note);
}

// --- Attach click/touch events ---
function attachKeyEvents(){
  document.querySelectorAll('.white-key, .black-key').forEach(k=>{
    k.onclick = ()=>playNote(k.dataset.note);
    k.ontouchstart = e=>{e.preventDefault(); playNote(k.dataset.note);}
  });
}

// --- Zoom keys, scaling black keys proportionally ---
function zoomKeys(factor){
  const wrapperWidth = pianoWrapper.clientWidth;
  const centerScroll = pianoWrapper.scrollLeft + wrapperWidth / 2;

  const ratio = centerScroll / pianoWrapper.scrollWidth;

  const totalWhiteKeys = whiteKeys.length;

  // Calculate min key width so piano fits entirely in wrapper
  const minKeyWidth = Math.min(60, wrapperWidth / totalWhiteKeys); // max 60 for zoom-in
  const maxKeyWidth = 60; // existing max

  // Update white key width
  keyWidth = Math.min(Math.max(keyWidth * factor, minKeyWidth), maxKeyWidth);

  // Update black key size proportionally
  blackKeyWidth = keyWidth * 2/3;
  blackKeyHeight = keyHeight * 3/5;

  generateKeys();

  // Maintain center position
  const newMaxScroll = pianoWrapper.scrollWidth - wrapperWidth;
  pianoWrapper.scrollLeft = Math.min(Math.max(ratio * pianoWrapper.scrollWidth - wrapperWidth / 2, 0), Math.max(newMaxScroll, 0));

  updateThumb();
  
    // Adjust label font to fit key width
  document.querySelectorAll('.white-key .key-label, .black-key .key-label').forEach(label => {
    const parentWidth = label.parentElement.offsetWidth;
    // Keep font <= 40% of key width for readability
    label.style.fontSize = Math.min(parentWidth * 0.4, 14) + 'px';
  });
  
  document.querySelectorAll('.black-key .key-label').forEach(label => {
    const parentWidth = label.parentElement.offsetWidth;
    label.style.fontSize = Math.min(parentWidth * 0.3, 12) + 'px'; // slightly smaller than white keys
});

  if(window.updateThumb) updateThumb();
}

document.getElementById('zoom-in').onclick = ()=>zoomKeys(1.2);
document.getElementById('zoom-out').onclick = ()=>zoomKeys(1/1.2);

// --- Scroll buttons: by octave ---
const scrollStepOctave = keyWidth * 7; // one octave worth of white keys

document.getElementById('scroll-left-octave').onclick = () => {
  pianoWrapper.scrollLeft = Math.max(pianoWrapper.scrollLeft - scrollStepOctave, 0);
  updateThumb();
};

document.getElementById('scroll-right-octave').onclick = () => {
  const maxScroll = pianoWrapper.scrollWidth - pianoWrapper.clientWidth;
  pianoWrapper.scrollLeft = Math.min(pianoWrapper.scrollLeft + scrollStepOctave, maxScroll);
  updateThumb();
};

// --- Scroll buttons: by single key ---
const scrollStepKey = keyWidth; // one key width per click

document.getElementById('scroll-left-key').onclick = () => {
  pianoWrapper.scrollLeft = Math.max(pianoWrapper.scrollLeft - scrollStepKey, 0);
  updateThumb();
};

document.getElementById('scroll-right-key').onclick = () => {
  const maxScroll = pianoWrapper.scrollWidth - pianoWrapper.clientWidth;
  pianoWrapper.scrollLeft = Math.min(pianoWrapper.scrollLeft + scrollStepKey, maxScroll);
  updateThumb();
};