export function createVideoPreview({modal,esc,fmt,toast}){
 const dialog=document.querySelector('#dialog');
 let timer=null,current=null,at=0,lastTick=0;
 const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>';
 const pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg>';
 function stop(){clearInterval(timer);timer=null;const button=dialog.querySelector('[data-preview-command="play"]');if(button){button.innerHTML=playIcon;button.setAttribute('aria-label','播放');}}
 function paint(){
  if(!current)return;
  const seek=dialog.querySelector('#previewSeek'),time=dialog.querySelector('#previewTime'),caption=dialog.querySelector('#previewCaption');
  if(seek)seek.value=String(at);
  if(time)time.textContent=fmt(at)+' / '+fmt(current.duration);
  if(caption){const segment=(current.segments||[]).find(s=>at>=s.start&&at<s.end);caption.textContent=segment?.text||'';}
 }
 function toggle(){
  if(timer){stop();return;}
  if(at>=current.duration)at=0;
  const button=dialog.querySelector('[data-preview-command="play"]');button.innerHTML=pauseIcon;button.setAttribute('aria-label','暂停');
  lastTick=performance.now();paint();
  timer=setInterval(()=>{const now=performance.now();at=Math.min(current.duration,at+(now-lastTick)/1000);lastTick=now;paint();if(at>=current.duration)stop();},250);
 }
 function cleanup(){
  stop();const video=dialog.querySelector('#previewVideo');if(video){video.pause();video.removeAttribute('src');video.load();}
  if(document.fullscreenElement&&dialog.contains(document.fullscreenElement))document.exitFullscreen().catch(()=>{});
  current=null;at=0;
 }
 dialog.addEventListener('close',cleanup);
 dialog.addEventListener('click',async event=>{
  const control=event.target.closest('[data-preview-command]');if(!control||!current)return;
  if(control.dataset.previewCommand==='play')toggle();
  if(control.dataset.previewCommand==='fullscreen'){
   try{if(document.fullscreenElement)await document.exitFullscreen();else await dialog.querySelector('#previewPlayer').requestFullscreen();}
   catch{toast('当前环境无法全屏播放');}
  }
 });
 dialog.addEventListener('input',event=>{if(event.target.id!=='previewSeek'||!current)return;at=Math.max(0,Math.min(current.duration,Number(event.target.value)));lastTick=performance.now();paint();});
 return {open(output){
  cleanup();current=output;at=0;
  const body=output.mediaUrl
   ? `<div class="video-preview-player" id="previewPlayer"><video id="previewVideo" controls playsinline preload="metadata" controlslist="nodownload" src="${esc(output.mediaUrl)}" aria-label="成片视频"></video><p class="preview-error" role="alert" hidden>视频加载失败，请关闭后重试</p></div>`
   : `<div class="video-preview-player" id="previewPlayer"><div class="preview-picture"><div class="preview-portrait"><img src="./assets/drama-confrontation.jpg" alt="虚构剧情故事板"><div id="previewCaption"></div></div></div><div class="preview-controls" id="previewControls"><div class="preview-control-row"><button type="button" data-preview-command="play" aria-label="播放">${playIcon}</button><span id="previewTime"></span><span class="preview-control-spacer"></span><button type="button" disabled aria-label="故事板无音轨" title="故事板无音轨"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z" fill="currentColor"/><path d="m17 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2"/></svg></button><button type="button" data-preview-command="fullscreen" aria-label="全屏"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></div><input id="previewSeek" aria-label="播放进度" type="range" min="0" max="${output.duration}" step="0.1" value="0"></div></div>`;
  modal(output.title,body,'');dialog.classList.add('video-preview-dialog');
  document.querySelector('#dialogTitle').title=output.title;
  const video=dialog.querySelector('#previewVideo');if(video)video.addEventListener('error',()=>{dialog.querySelector('.preview-error').hidden=false;});
  paint();
 }};
}
