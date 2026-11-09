import {diagrams} from './swimlane-data-v11.js?v=20261108-whole';

const viewport=document.getElementById('canvas-viewport'),surface=document.getElementById('canvas-surface'),host=document.getElementById('whole-diagram');
const status=document.getElementById('viewer-status'),zoomValue=document.getElementById('zoom-value'),dialog=document.getElementById('overview-node-detail');
const nodes=new Map(diagrams.flatMap(phase=>phase.nodes.map(node=>[node.id,{...node,phase:phase.title}])));
let svg=null,width=0,height=0,scale=1,mode='width',exporting=false;
const peerCursor=new Map();
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const setStatus=(message,error=false)=>{status.textContent=message;status.classList.toggle('error',error);};
const allControls=()=>[...document.querySelectorAll('.overview-toolbar button')];
function setScale(next,nextMode='manual',preserveCenter=true){
 if(!svg)return;
 const oldScale=scale,wasAtTop=viewport.scrollTop<=1,wasAtLeft=viewport.scrollLeft<=1,centerX=(viewport.scrollLeft+viewport.clientWidth/2-16)/oldScale,centerY=(viewport.scrollTop+viewport.clientHeight/2-16)/oldScale;
 scale=Math.max(.04,Math.min(2.5,next));mode=nextMode;
 svg.style.width=width*scale+'px';svg.style.height=height*scale+'px';
 host.style.width=width*scale+'px';host.style.height=height*scale+'px';
 surface.style.width=(width*scale+32)+'px';surface.style.height=(height*scale+32)+'px';
 zoomValue.textContent=Math.round(scale*100)+'%';
 document.getElementById('fit-width').setAttribute('aria-pressed',String(mode==='width'));
 document.getElementById('fit-all').setAttribute('aria-pressed',String(mode==='all'));
 document.getElementById('zoom-original').setAttribute('aria-pressed',String(mode==='original'));
 document.getElementById('zoom-out').disabled=scale<=.04;
 document.getElementById('zoom-in').disabled=scale>=2.5;
 if(preserveCenter){viewport.scrollLeft=wasAtLeft?0:centerX*scale-viewport.clientWidth/2+16;viewport.scrollTop=wasAtTop?0:centerY*scale-viewport.clientHeight/2+16;}
 else{viewport.scrollLeft=0;viewport.scrollTop=0;}
}
function fitWidth(preserveCenter=false){setScale(Math.min(1,(viewport.clientWidth-32)/width),'width',preserveCenter);}
function fitAll(){setScale(Math.min((viewport.clientWidth-32)/width,(viewport.clientHeight-32)/height),'all',false);setStatus('已显示整张图；点击「适合宽度」或放大，可阅读节点文字。');}
function initialize(){
 const graph=document.getElementById('integrated-swimlane');if(!graph||graph===svg)return;
 svg=graph;const box=svg.viewBox?.baseVal;width=box?.width||Number(svg.getAttribute('width'));height=box?.height||Number(svg.getAttribute('height'));
 if(!(width>0&&height>0)){setStatus('整图尺寸无效，请刷新重试。',true);return;}
 allControls().forEach(button=>button.disabled=false);fitWidth(false);setStatus('整张流程图 · 可滚动查看，支持完整导出');
}
window.addEventListener('flow-ready',initialize);
new MutationObserver(initialize).observe(host,{childList:true});
initialize();
new ResizeObserver(()=>{if(!svg)return;if(mode==='width')fitWidth(true);else if(mode==='all')fitAll();}).observe(viewport);
document.getElementById('zoom-in').addEventListener('click',()=>{setScale(scale*1.2);setStatus('已放大；可在画布内滚动查看其他节点。');});
document.getElementById('zoom-out').addEventListener('click',()=>{setScale(scale/1.2);setStatus('已缩小，仍为同一张完整流程图。');});
document.getElementById('fit-width').addEventListener('click',()=>{fitWidth(true);setStatus('按画布宽度显示；向下滚动查看完整流程。');});
document.getElementById('fit-all').addEventListener('click',fitAll);
document.getElementById('zoom-original').addEventListener('click',()=>{setScale(1,'original');setStatus('按原始尺寸显示；可纵向和横向滚动。');});

function openNode(id){
 const node=nodes.get(id);if(!node)return;
 document.getElementById('overview-node-phase').textContent=node.phase;
 document.getElementById('overview-node-title').textContent=node.id+' · '+node.title;
 document.getElementById('overview-node-role').textContent=node.role;
 document.getElementById('overview-node-operation').textContent=node.operation;
 document.getElementById('overview-node-output').textContent=node.output;
 dialog.showModal();
}
function followLink(connector){
 const id=connector.dataset.link;if(!id)return;
 const same=[...svg.querySelectorAll('[data-link]')].filter(el=>el.dataset.link===id),source=connector.closest('[data-node]');
 const peerIds=(connector.dataset.linkPeer||'').split(/[\s,，]+/).filter(Boolean);
 let targets=peerIds.map(peer=>[...svg.querySelectorAll('[data-node]')].find(el=>el.dataset.node===peer)).filter(Boolean);
 if(!targets.length)targets=same.filter(el=>el!==connector).map(el=>el.closest('[data-node]')||el);
 targets=[...new Set(targets)].filter(el=>el!==source);
 if(!targets.length){setStatus(`${id}：请按连接点标注的节点编号查看另一端。`);return;}
 const cursorKey=id+':'+(source?.dataset.node||''),cursor=peerCursor.get(cursorKey)||0,target=targets[cursor%targets.length];peerCursor.set(cursorKey,cursor+1);
 svg.querySelectorAll('.overview-active-node,.overview-active-link').forEach(el=>el.classList.remove('overview-active-node','overview-active-link'));
 same.forEach(el=>el.classList.add('overview-active-link'));source?.classList.add('overview-active-node');target.classList.add('overview-active-node');
 const box=target.getBoundingClientRect(),view=viewport.getBoundingClientRect();
 viewport.scrollTo({top:viewport.scrollTop+box.top-view.top-(viewport.clientHeight-box.height)/2,left:viewport.scrollLeft+box.left-view.left-(viewport.clientWidth-box.width)/2,behavior:reducedMotion()?'auto':'smooth'});
 target.focus?.({preventScroll:true});
 const targetId=target.dataset.node,label=nodes.get(targetId)?.title||'对应连接点';
 setStatus(`${id} → ${targetId||''} ${label}${targets.length>1?'；再次点击原连接点可切换其他目标。':''}`);
}
host.addEventListener('click',event=>{const connector=event.target.closest('[data-link]');if(connector){followLink(connector);return;}const node=event.target.closest('[data-node]');if(node)openNode(node.dataset.node);});
host.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;const connector=event.target.closest('[data-link]');if(connector){event.preventDefault();followLink(connector);return;}const node=event.target.closest('[data-node]');if(node){event.preventDefault();openNode(node.dataset.node);}});
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});

function exportMarkup(){
 const copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',width);copy.setAttribute('height',height);copy.style.removeProperty('width');copy.style.removeProperty('height');
 copy.querySelectorAll('.overview-active-node,.overview-active-link').forEach(el=>el.classList.remove('overview-active-node','overview-active-link'));
 return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(copy);
}
function save(blob,name){const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
document.getElementById('download-svg').addEventListener('click',()=>{if(!svg)return;save(new Blob([exportMarkup()],{type:'image/svg+xml;charset=utf-8'}),'剧汇撮合业务-全流程泳道总图.svg');setStatus('已导出整张 SVG，可放大查看，当前缩放不影响导出。');});
document.getElementById('download-png').addEventListener('click',async()=>{
 if(!svg||exporting)return;exporting=true;const button=document.getElementById('download-png');button.disabled=true;button.textContent='正在生成 PNG…';setStatus('正在生成完整图片，请稍候…');let url;
 try{
  if(document.fonts?.ready)await document.fonts.ready;
  const source=new Blob([exportMarkup()],{type:'image/svg+xml;charset=utf-8'});url=URL.createObjectURL(source);
  const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('图片转换失败，请重试或下载 SVG。'));img.src=url;});
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(width);canvas.height=Math.ceil(height);const context=canvas.getContext('2d');if(!context)throw Error('当前浏览器无法创建图片，请下载 SVG。');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(img,0,0,width,height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('PNG 生成失败，请下载 SVG。')),'image/png'));
  save(blob,'剧汇撮合业务-全流程泳道总图.png');setStatus(`已导出完整 PNG（${Math.ceil(width)} × ${Math.ceil(height)}），包含全部流程。`);
 }catch(error){setStatus(error.message||'导出失败，请重试或下载 SVG。',true);}
 finally{if(url)URL.revokeObjectURL(url);exporting=false;button.disabled=false;button.textContent='下载整图 PNG';}
});
window.addEventListener('error',event=>{if(!svg&&event.message)setStatus('整图加载失败，请刷新重试。',true);});
