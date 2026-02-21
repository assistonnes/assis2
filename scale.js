(function(){
  
  const keyCss = `
#scale-select-wrapper {
  position: absolute;
  left: -0.5%;
  top: 197px;
  z-index: 9999;

  padding: 4px 8px;
  border-radius: 8px;

  background: rgba(128,128,128,0.5);
  backdrop-filter: blur(0.5px);
  -webkit-backdrop-filter: blur(6px);
  font-size: 14px;  
}

#global-scale-selector {
  background: transparent;
  border: none;
  color: #000;
  font-size: 14px;
  outline: none;
  width: auto;
  min-width: 0;
  display: inline-block;
}

`;

const style = document.createElement("style");
style.textContent = keyCss;
document.head.appendChild(style);

  const wrapper = document.createElement("div");
  wrapper.id = "scale-select-wrapper";

  wrapper.innerHTML = `
    <select id="global-scale-selector">
      <option>major</option><option>
    </select>
  `;

  document.body.appendChild(wrapper);

  const selector = document.getElementById("global-scale-selector");

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