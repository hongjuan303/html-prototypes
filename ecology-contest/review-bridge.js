import {pageNotes} from './review-notes.js?v=20261026-v2';

const app=document.querySelector('#app'), modal=document.querySelector('#modal-root');
const layer=document.createElement('div');
layer.id='review-markers';
layer.setAttribute('aria-label','原型说明序号');
document.body.append(layer);
const style=document.createElement('style');
style.textContent=`
#review-markers{position:fixed;inset:0;pointer-events:none;z-index:20000}
#review-markers .review-marker{position:absolute;display:grid;place-items:center;width:24px;height:24px;min-width:24px;padding:0;border:0;border-radius:50%;background:#F28C18;color:#fff;font:700 13px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;cursor:pointer;pointer-events:auto;box-shadow:0 0 0 2px #fff}
#review-markers .review-marker:focus-visible{outline:3px solid #603b10;outline-offset:3px}
.demo-bar .open-review-notes{background:none;border:0;border-left:1px solid #e3e6eb;padding:0 0 0 12px;color:#a65b0a;font:600 12px/1.5 inherit;cursor:pointer;white-space:nowrap}
`;
document.head.append(style);
const send=(type,extra={})=>parent.postMessage({source:'contest-review',type,...extra},location.origin);
const visible=el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
function resolve(target){
 const spec=typeof target==='string'?{selector:target}:target;
 return [...document.querySelectorAll(spec.selector)].filter(el=>visible(el)&&(!spec.text||el.textContent.trim()===spec.text));
}
function context(){
 const [page='events',sub='']=location.hash.replace(/^#\//,'').split('?')[0].split('/');
 const dialog=modal.querySelector('#modal-title')?.textContent.trim()||'';
 return {page:page||'events',sub,dialog,admin:page==='admin',public:dialog==='公示作品',tab:document.querySelector('.section-tabs .active')?.textContent.trim()||'赛道与规则',script:document.querySelector('#submission')?.dataset.trackType==='script',unavailable:!document.querySelector('#submission'),cancelled:document.querySelector('main h1')?.textContent==='赛事已取消'};
}
let markers=[],fingerprint='',refreshFrame=0,positionFrame=0;
function refresh(){
 refreshFrame=0;
 const bar=document.querySelector('.demo-bar');
 if(bar&&!bar.querySelector('.open-review-notes')){
  const button=document.createElement('button');button.className='open-review-notes';button.type='button';button.textContent='原型说明 →';
  button.onclick=()=>send('show');bar.append(button);
 }
 const doc=pageNotes(context());
 const sections=doc.sections.map(section=>({...section,elements:resolve(section.target)})).filter(section=>section.elements.length);
 const serial={...doc,sections:sections.map(({elements,target,...section})=>section)};
 const stamp=JSON.stringify([location.hash,serial]);
 // Replace only on document changes; scrolling never alters the numbering.
 if(stamp!==fingerprint||markers.some(marker=>!marker.target.isConnected)){
  fingerprint=stamp;layer.replaceChildren();
  markers=sections.map((section,i)=>{
   const badge=document.createElement('button');badge.className='review-marker';badge.type='button';badge.textContent=i+1;
   badge.dataset.reviewNumber=i+1;badge.title=section.title;badge.setAttribute('aria-label','说明 '+(i+1)+'：'+section.title);
   badge.onclick=event=>{event.preventDefault();event.stopPropagation();send('locate',{number:i+1});};
   layer.append(badge);return {badge,target:section.elements[0]};
  });
  send('document',{document:serial,hash:location.hash||'#/events'});
 }
 position();
}
function position(){
 positionFrame=0;
 const occupied=[];
 for(const {badge,target} of markers){
  const r=target.getBoundingClientRect();
  let top=r.top,left=r.left-30;
  const actions=target.closest('.table-actions');
  if(actions){const row=actions.getBoundingClientRect();top=row.top-25;left=row.left;}
  else if(target.matches('button,a')&&r.height<72){top=r.top-26;left=r.left;}
  if(target.matches('.contest-badge')){left=r.right+6;top=r.top-4;}
  const modalBody=target.closest('.modal-body');
  const clip=modalBody?.getBoundingClientRect();
  const minTop=clip?clip.top:0,maxBottom=clip?Math.min(clip.bottom,innerHeight):innerHeight;
  if(!visible(target)||r.top<minTop-1||r.top>maxBottom-14||r.right<0||r.left>innerWidth){badge.hidden=true;badge.style.display='none';continue;}
  top=Math.max(minTop+2,Math.min(maxBottom-26,top));left=Math.max(4,Math.min(innerWidth-28,left));
  for(const p of occupied)if(Math.abs(top-p.top)<26&&Math.abs(left-p.left)<26)left=Math.min(innerWidth-28,p.left+28);
  occupied.push({left,top});badge.hidden=false;badge.style.display='grid';badge.style.transform='translate('+Math.round(left)+'px,'+Math.round(top)+'px)';
 }
}
const schedule=()=>{if(!refreshFrame)refreshFrame=requestAnimationFrame(refresh);};
const reposition=()=>{if(!positionFrame)positionFrame=requestAnimationFrame(position);};
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true});
new MutationObserver(schedule).observe(modal,{childList:true,subtree:true,attributes:true});
addEventListener('scroll',reposition,true);addEventListener('resize',reposition);
document.fonts.ready.then(reposition);
document.addEventListener('load',reposition,true);
addEventListener('hashchange',schedule);
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.source!=='contest-review-parent')return;
 if(event.data.type==='navigate'&&/^#\//.test(event.data.hash)&&location.hash!==event.data.hash)location.hash=event.data.hash;
});
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href]');
 if(!link||link.target==='_blank'||event.defaultPrevented||event.ctrlKey||event.metaKey)return;
 const url=new URL(link.href,location.href);
 if(url.origin===location.origin&&!url.pathname.includes('/ecology-contest/')){event.preventDefault();parent.location.href=url.href;}
});
refresh();
