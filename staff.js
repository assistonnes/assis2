// staff.js - self-contained staff UI + logic
(function () {
  // --- Inject CSS ---
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
  }
  #image-placeholder svg, #image-placeholder canvas {
    width: 100%;
    height: 100%;
  }
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // --- Inject HTML ---
  const wrapper = document.createElement("div");
  wrapper.id = "controls-wrapper";
  wrapper.innerHTML = `
    <div id="key-select-wrapper">
      Key:
      <select id="key-selector">
        <option value="C">C</option>
        <option value="G">G</option>
        <option value="D">D</option>
        <option value="A">A</option>
        <option value="E">E</option>
        <option value="B">B</option>
        <option value="F#">F#</option>
        <option value="C#">C#</option>
        <option value="F">F</option>
        <option value="Bb">Bb</option>
        <option value="Eb">Eb</option>
        <option value="Ab">Ab</option>
        <option value="Db">Db</option>
        <option value="Gb">Gb</option>
        <option value="Cb">Cb</option>
      </select>
    </div>
    <div id="image-placeholder">
      <canvas id="staff-canvas"></canvas>
    </div>
  `;
  document.body.prepend(wrapper); // staff appears above piano

  // --- Original staff logic begins here ---
  const container = document.getElementById('image-placeholder');
  if (!container) {
    console.error('staff.js: #image-placeholder not found');
    return;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  container.innerHTML = '';

  const W = 230, H = 230;
  const B = -5;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.display = 'block';
  svg.style.position = 'absolute';
  svg.style.left = '0px';
  svg.style.top = '0px';
  container.appendChild(svg);

  const leftMargin = 48;
  const rightMargin = W - 20;
  const lineSpacing = 16;
  const totalStaffHeight = 4*lineSpacing + 2*lineSpacing + 4*lineSpacing;
  const topMargin = (H - totalStaffHeight)/2;
  const trebleTopY = topMargin;
  const trebleBottomY = trebleTopY + 4*lineSpacing;
  const staveGap = lineSpacing*2;
  const bassTopY = trebleBottomY + staveGap;
  const bassBottomY = bassTopY + 4*lineSpacing;
  const noteX = W / 2 + 30;

  const staticGroup = document.createElementNS(SVG_NS, 'g');
  const notesGroup = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(staticGroup);
  svg.appendChild(notesGroup);

  let keySignature = 'C';
  const keySignatures = {
    'C': [], 'G': ['F#'], 'D': ['F#','C#'], 'A': ['F#','C#','G#'],
    'E': ['F#','C#','G#','D#'], 'B': ['F#','C#','G#','D#','A#'],
    'F#': ['F#','C#','G#','D#','A#','E#'],
    'C#': ['F#','C#','G#','D#','A#','E#','B#'],
    'F': ['Bb'], 'Bb': ['Bb','Eb'], 'Eb': ['Bb','Eb','Ab'],
    'Ab': ['Bb','Eb','Ab','Db'], 'Db': ['Bb','Eb','Ab','Db','Gb'],
    'Gb': ['Bb','Eb','Ab','Db','Gb','Cb'],
    'Cb': ['Bb','Eb','Ab','Db','Gb','Cb','Fb']
  };
  const sharpPositions = {'F#':trebleTopY+0.4*lineSpacing,'C#':trebleTopY+2*lineSpacing,'G#':trebleTopY,'D#':trebleTopY+1.4*lineSpacing,'A#':trebleTopY+3*lineSpacing,'E#':trebleTopY+1*lineSpacing,'B#':trebleTopY+2*lineSpacing};
  const flatPositions = {'Bb':trebleTopY+2.35*lineSpacing,'Eb':trebleTopY+1*lineSpacing,'Ab':trebleTopY+3*lineSpacing,'Db':trebleTopY+1.4*lineSpacing,'Gb':trebleTopY+3.4*lineSpacing,'Cb':trebleTopY+2*lineSpacing,'Fb':trebleTopY+4*lineSpacing};
  const bassSharpPositions = {'F#':bassTopY+0.4*lineSpacing,'C#':bassTopY+2*lineSpacing,'G#':bassTopY,'D#':bassTopY+1.4*lineSpacing,'A#':bassTopY+3*lineSpacing,'E#':bassTopY+1*lineSpacing,'B#':bassTopY+2*lineSpacing};
  const bassFlatPositions = {'Bb':bassTopY+2.35*lineSpacing,'Eb':bassTopY+1*lineSpacing,'Ab':bassTopY+3*lineSpacing,'Db':bassTopY+1.4*lineSpacing,'Gb':bassTopY+3.4*lineSpacing,'Cb':bassTopY+2*lineSpacing,'Fb':bassTopY+4*lineSpacing};

  function drawStatic() {
    while (staticGroup.firstChild) staticGroup.removeChild(staticGroup.firstChild);
    const drawLines = (topY)=>{for(let i=0;i<5;i++){const y=topY+i*lineSpacing;const l=document.createElementNS(SVG_NS,'line');l.setAttribute('x1',leftMargin-36+B);l.setAttribute('x2',rightMargin-B);l.setAttribute('y1',y);l.setAttribute('y2',y);l.setAttribute('stroke','#000');l.setAttribute('stroke-width','1');staticGroup.appendChild(l);}};
    drawLines(trebleTopY); drawLines(bassTopY);
    const treble=document.createElementNS(SVG_NS,'text');treble.setAttribute('x',leftMargin-34+B);treble.setAttribute('y',trebleBottomY);treble.setAttribute('font-size',61);treble.setAttribute('font-family','serif,"Bravura","Arial Unicode MS","Symbola"');treble.textContent='𝄞';staticGroup.appendChild(treble);
    const bass=document.createElementNS(SVG_NS,'text');bass.setAttribute('x',leftMargin-34+B);bass.setAttribute('y',bassBottomY-9);bass.setAttribute('font-size',61);bass.setAttribute('font-family','serif,"Bravura","Arial Unicode MS","Symbola"');bass.textContent='𝄢';staticGroup.appendChild(bass);
    const brace=document.createElementNS(SVG_NS,'path');const bx=leftMargin-42+B,by1=trebleTopY-0.5,by2=bassBottomY+0.5;brace.setAttribute('d',`M ${bx+6} ${by1} L ${bx+6} ${by2}`);brace.setAttribute('stroke','#000');brace.setAttribute('stroke-width','1.2');staticGroup.appendChild(brace);
    const ksNotes=keySignatures[keySignature]||[];
    ksNotes.forEach((n,i)=>{const sym=n.includes('#')?'♯':'♭';const yPos=n.includes('#')?sharpPositions[n]:flatPositions[n];const t=document.createElementNS(SVG_NS,'text');t.setAttribute('x',leftMargin+15+i*7+B);t.setAttribute('y',yPos);t.setAttribute('font-size',22);t.setAttribute('font-family','serif,"Bravura","Arial Unicode MS","Symbola"');t.textContent=sym;staticGroup.appendChild(t);});
    ksNotes.forEach((n,i)=>{const sym=n.includes('#')?'♯':'♭';const yPos=n.includes('#')?bassSharpPositions[n]:bassFlatPositions[n];const t=document.createElementNS(SVG_NS,'text');t.setAttribute('x',leftMargin+15+i*7+B);t.setAttribute('y',yPos);t.setAttribute('font-size',22);t.setAttribute('font-family','serif,"Bravura","Arial Unicode MS","Symbola"');t.textContent=sym;staticGroup.appendChild(t);});
  }

  const lineSpacingHalf = lineSpacing/2;
  const letterIndex={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
  const refDiatonic=(o=>o.step)(function(note){const m=note.match(/^([A-G])([#b]?)(-?\d+)$/);return {step:4*7+letterIndex['E']};}('E4'));

  function diatonicIndex(n){const m=(''+n).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return null;const [_,L,A,O]=m;return{step:O*7+letterIndex[L],accidental:A,letter:L};}
  const NATURAL_OFFSETS={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  function noteToSemitone(n){const m=(''+n).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return null;const [_,L,A,O]=m;const base=NATURAL_OFFSETS[L];const acc=A==='#'?1:A==='b'?-1:0;return O*12+base+acc;}
  function semitoneToSpelled(s,t,oN){t=(''+t).toUpperCase();if(!NATURAL_OFFSETS[t])return oN;const base=NATURAL_OFFSETS[t];const approx=Math.floor(s/12);let best=null;for(let o=approx-1;o<=approx+1;o++){const nat=o*12+base;const diff=s-nat;if(diff>=-1&&diff<=1){const acc=diff===1?'#':diff===-1?'b':'';const c={o,acc,abs:Math.abs(diff)};if(!best||c.abs<best.abs)best=c;}}if(!best)return oN;return `${t}${best.acc}${best.o}`;}
  function applyKeySignatureMapping(n,k){const m=(''+n).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return n;const [_,L,A]=m;if(A!=='')return n;const s=noteToSemitone(n);if(s===null)return n;
    if(k==='C#'){if(L==='C')return semitoneToSpelled(s,'B',n);if(L==='F')return semitoneToSpelled(s,'E',n);}
    else if(k==='F#'){if(L==='F')return semitoneToSpelled(s,'E',n);if(L==='C')return semitoneToSpelled(s,'B',n);}
    else if(k==='Cb'){if(L==='B')return semitoneToSpelled(s,'C',n);if(L==='E')return semitoneToSpelled(s,'F',n);}
    else if(k==='Gb'){if(L==='B')return semitoneToSpelled(s,'C',n);if(L==='E')return semitoneToSpelled(s,'F',n);}
    return n;
  }
  function mapBlackKey(n){n=applyKeySignatureMapping(n,keySignature);const flatK=['F','Bb','Eb','Ab','Db','Gb','Cb'];const sharpK=['G','D','A','E','B','F#','C#'];const m=(''+n).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return n;let[_,L,A,O]=m;if(A==='#'&&flatK.includes(keySignature)){const c={A:'B',C:'D',D:'E',F:'G',G:'A'};if(c[L]){L=c[L];A='b';}}else if(A==='b'&&sharpK.includes(keySignature)){const c={B:'A',D:'C',E:'D',G:'F',A:'G'};if(c[L]){L=c[L];A='#';}}return `${L}${A||''}${O}`;}
  function getKeyAlteredNotes(k){const ks=keySignatures[k]||[];const a={};ks.forEach(n=>{a[n[0]]=n[1];});return a;}
  function appendLedger(y,x){const l=document.createElementNS(SVG_NS,'line');l.setAttribute('x1',x-18);l.setAttribute('x2',x+18);l.setAttribute('y1',y);l.setAttribute('y2',y);l.setAttribute('stroke','#000');l.setAttribute('stroke-width','1');notesGroup.appendChild(l);}
  function renderNote(n,x=noteX){
    while(notesGroup.firstChild)notesGroup.removeChild(notesGroup.firstChild);
    n=mapBlackKey(n);const d=diatonicIndex(n);if(!d)return;const steps=d.step-refDiatonic;const y=trebleBottomY-steps*lineSpacingHalf;
    if(y<trebleTopY-0.5){let i=1;while(true){const yl=trebleTopY-i*lineSpacing;if(yl<y-0.5)break;appendLedger(yl,x);i++;}}
    if(y>bassBottomY+0.5){let i=1;while(true){const yl=bassBottomY+i*lineSpacing;if(yl>y+0.5)break;appendLedger(yl,x);i++;}}
    if(y>trebleBottomY+0.5&&y<bassTopY-0.5){if((Math.abs(steps)%2)===0)appendLedger(y,x);}
    const nh=document.createElementNS(SVG_NS,'ellipse');nh.setAttribute('cx',x);nh.setAttribute('cy',y);nh.setAttribute('rx',9);nh.setAttribute('ry',6);nh.setAttribute('transform',`rotate(-20 ${x} ${y})`);nh.setAttribute('fill','#000');notesGroup.appendChild(nh);
    const tMY=trebleTopY+2*lineSpacing;const stem=document.createElementNS(SVG_NS,'line');
    if(y<=tMY+2){stem.setAttribute('x1',x+8);stem.setAttribute('y1',y-1);stem.setAttribute('x2',x+8);stem.setAttribute('y2',y-36);}
    else{stem.setAttribute('x1',x-8);stem.setAttribute('y1',y+1);stem.setAttribute('x2',x-8);stem.setAttribute('y2',y+36);}
    stem.setAttribute('stroke','#000');stem.setAttribute('stroke-width','1.2');notesGroup.appendChild(stem);
    const alt=getKeyAlteredNotes(keySignature);let sym='';if(d.accidental){if(alt[d.letter]!==d.accidental)sym=d.accidental==='#'?'♯':'♭';}else if(alt[d.letter])sym='♮';
    if(sym){const acc=document.createElementNS(SVG_NS,'text');acc.setAttribute('x',x-18);acc.setAttribute('y',y+4);acc.setAttribute('font-size',12);acc.setAttribute('font-family','serif,"Bravura","Arial Unicode MS","Symbola"');acc.textContent=sym;notesGroup.appendChild(acc);}
  }

  window.staffDrawNote = noteName => { try { renderNote(noteName); } catch(e){ console.error(e); } };
  window.staffSetKey = k => { keySignature = k; drawStatic(); };

  function onResize(){ drawStatic(); while(notesGroup.firstChild) notesGroup.removeChild(notesGroup.firstChild); }
  window.addEventListener('resize', onResize);

  drawStatic();
})();