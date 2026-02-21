(function(){
  
  const keyCss = `
#key-select-wrapper {      
  position: absolute;      
  left: 50%; 
  transform: translate(-230%, 300%);      
  top: 0%;      
  min-width: 60px;      
  text-align: right;      
  z-index: 10;      
  font-family: system-ui, sans-serif;      
  font-size: 14px;      
}

#global-key-selector {
  border: 1px solid #999;
  border-radius: 4px;
  padding: 1px 1px;
  background: #fff;
  color: #000;
  font-size: 14px;
  box-sizing: border-box;
}
`;

const style = document.createElement("style");
style.textContent = keyCss;
document.head.appendChild(style);

  const wrapper = document.createElement("div");
  wrapper.id = "key-select-wrapper";

  wrapper.innerHTML = `
    Key:
    <select id="global-key-selector">
      <option>C</option><option>G</option><option>D</option><option>A</option>
      <option>E</option><option>B</option><option>F#</option><option>C#</option>
      <option>F</option><option>Bb</option><option>Eb</option><option>Ab</option>
      <option>Db</option><option>Gb</option><option>Cb</option>
    </select>
  `;

document.body.appendChild(wrapper);

  const selector = document.getElementById("global-key-selector");

  // Global key state
  let currentKey = selector.value;

  // Notify listeners
  function notify(key){
    if (window.staffSetKey) window.staffSetKey(key);
    if (window.pianoSetKey) window.pianoSetKey(key);
    if (window.anyOtherModuleSetKey) window.anyOtherModuleSetKey(key);
  }

  selector.addEventListener("change", e=>{
    currentKey = e.target.value;
    notify(currentKey);
  });

  // initial broadcast
  notify(currentKey);

})();