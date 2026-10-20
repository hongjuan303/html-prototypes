/* A persistent native slider mirrors the whole review canvas scroll position. */
(() => {
  const canvas=document.getElementById('prototypeCanvas');
  const layout=document.getElementById('prototypeLayout');
  const position=document.getElementById('canvasScrollPosition');
  const left=document.getElementById('canvasScrollLeft');
  const right=document.getElementById('canvasScrollRight');
  const maxScroll=()=>Math.max(0,canvas.scrollWidth-canvas.clientWidth);
  function sync(){
    const max=maxScroll();
    const value=max?Math.round(canvas.scrollLeft/max*1000):0;
    position.value=String(value);
    position.disabled=max<1;
    position.setAttribute('aria-valuetext',`画布横向位置 ${Math.round(value/10)}%`);
    left.disabled=canvas.scrollLeft<1;
    right.disabled=canvas.scrollLeft>=max-1;
    const ratio=Math.min(1,canvas.clientWidth/Math.max(1,canvas.scrollWidth));
    position.style.setProperty('--canvas-thumb-width',`${Math.max(32,position.clientWidth*ratio)}px`);
  }
  position.addEventListener('input',()=>{canvas.scrollLeft=maxScroll()*Number(position.value)/1000;sync();});
  left.addEventListener('click',()=>canvas.scrollBy({left:-240,behavior:'smooth'}));
  right.addEventListener('click',()=>canvas.scrollBy({left:240,behavior:'smooth'}));
  canvas.addEventListener('scroll',sync,{passive:true});
  new ResizeObserver(sync).observe(canvas);
  new ResizeObserver(sync).observe(layout);
  sync();
})();
