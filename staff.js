/* staff.js - Draws piano notes on staff correctly for all key signatures */

(function(){
  // --- Minimal CSS for staff lines & note positions ---
  const css = `
#staff { width: 100%; height: 120px; margin: 10px auto; position: relative; }
.staff-line { position: absolute; left: 0; right: 0; height: 1px; background: black; }
.note { position: absolute; width: 12px; height: 12px; background: red; border-radius: 50%; text-align: center; font-size: 8px; line-height: 12px; color: white; user-select: none; }
`;
  const style = document.createElement('style'); style.textContent = css;
  document.head.appendChild(style);

  // --- Staff setup ---
  const staff = document.createElement('div'); staff.id='staff';
  document.body.appendChild(staff);
  const lineSpacing = 14;
  const lines = [];
  for(let i=0;i<5;i++){
    const line = document.createElement('div'); line.className='staff-line';
    line.style.top = (i*lineSpacing)+'px'; staff.appendChild(line);
    lines.push(line);
  }

  // --- Note pitch mapping ---
  const NOTE_TO_SEMITONE = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };

  function noteStringToSemitone(note){
    const m = note.match(/^([A-G])([#b]?)(-?\d+)$/);
    if(!m) return null;
    const [,L,A,O] = m;
    return (+O)*12 + NOTE_TO_SEMITONE[L] + (A==='#'?1:(A==='b'?-1:0));
  }

  // --- Key signature scales ---
  const KEY_SCALES = {
    'C':  ['C','D','E','F','G','A','B'],
    'G':  ['G','A','B','C','D','E','F#'],
    'D':  ['D','E','F#','G','A','B','C#'],
    'A':  ['A','B','C#','D','E','F#','G#'],
    'E':  ['E','F#','G#','A','B','C#','D#'],
    'B':  ['B','C#','D#','E','F#','G#','A#'],
    'F#': ['F#','G#','A#','B','C#','D#','E#'],
    'C#': ['C#','D#','E#','F#','G#','A#','B#'],
    'F':  ['F','G','A','Bb','C','D','E'],
    'Bb': ['Bb','C','D','Eb','F','G','A'],
    'Eb': ['Eb','F','G','Ab','Bb','C','D'],
    'Ab': ['Ab','Bb','C','Db','Eb','F','G'],
    'Db': ['Db','Eb','F','Gb','Ab','Bb','C'],
    'Gb': ['Gb','Ab','Bb','Cb','Db','Eb','F'],
    'Cb': ['Cb','Db','Eb','Fb','Gb','Ab','Bb']
  };

  function respellForKey(note, key){
    const semi = noteStringToSemitone(note);
    if(semi===null) return note;
    const scale = KEY_SCALES[key];
    if(!scale) return note;

    // check scale degrees near octave
    for(let octave=-1; octave<=8; octave++){
      for(const s of scale){
        const m = s.match(/^([A-G])([#b]?)/);
        const letter = m[1], acc = m[2]||'';
        const test = octave*12 + NOTE_TO_SEMITONE[letter] + (acc==='#'?1:(acc==='b'?-1:0));
        if(test===semi) return `${letter}${acc}${octave}`;
      }
    }
    return note;
  }

  // --- Staff note positioning ---
  const BASE_LINE = 60; // middle line y-pos for C4
  const STEP = 7;       // half-step vertical distance

  function noteYPosition(note){
    const semitone = noteStringToSemitone(note);
    const C4 = noteStringToSemitone('C4');
    return BASE_LINE - (semitone - C4)*STEP/2; // each staff line = 1 step
  }

  const currentNotes = [];

  function drawNote(note, keySignature='C'){
    const respelled = respellForKey(note, keySignature);
    const y = noteYPosition(respelled);

    const el = document.createElement('div'); el.className='note';
    el.style.top = y+'px';
    el.textContent = respelled.replace(/\d+/,'');
    staff.appendChild(el);
    currentNotes.push(el);

    // auto remove after 1s
    setTimeout(()=>{ el.remove(); }, 1000);
  }

  window.staffDrawNote = drawNote;

})();