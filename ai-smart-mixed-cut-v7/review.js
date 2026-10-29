import {REVIEW_NOTES} from './review-notes.js?v=20261029-update21e';
const frame=document.querySelector('#prototypeFrame'),stage=document.querySelector('#reviewStage'),scroller=document.querySelector('#notesScroller'),content=document.querySelector('#notesContent');
const toolboxEntry=new URLSearchParams(location.search).get('entry')==='toolbox';
let context='',contextOwner='',available=[],focused=null,focusTimer;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatBullet=bullet=>esc(bullet);
const specText=value=>Array.isArray(value)?value.map(formatBullet).join('；'):formatBullet(String(value));
function renderProcessing(steps,title='系统处理逻辑'){
 if(!Array.isArray(steps)||!steps.length)return '';
 return `<div class="processing-spec"><h4>${esc(title)}</h4><ol>${steps.map(step=>`<li><strong>${esc(step.name)}：</strong>${['process','output','acceptance'].filter(key=>step[key]).map(key=>specText(step[key])).join(' ')}</li>`).join('')}</ol></div>`;
}
function renderSystemLogic(steps){return steps?.length?`<section class="system-logic">${renderProcessing(steps)}</section>`:'';}
function specGroup(item,section){
 if(section.category)return section.category;
 if(item.kind==='action')return '操作项';
 if(item.kind==='field')return /筛选|查询|搜索/.test(section.title)?'筛选项':'配置项';
 return /列表|进度/.test(section.title)?'列表项':'说明';
}
function renderSpec(section){
 const groups=new Map();
 (section.items||[]).forEach(item=>{const group=specGroup(item,section);if(!groups.has(group))groups.set(group,[]);groups.get(group).push(item);});
 const renderItem=item=>{
  const parts=[item.definition?specText(item.definition):''];
  if(item.default!==undefined&&item.default!==null&&item.default!==''&&!String(item.definition||'').includes('默认'))parts.push('默认：'+specText(item.default));
  if(item.values?.length)parts.push('枚举：'+item.values.map(v=>esc(v.label)+(v.meaning?'（'+specText(v.meaning)+'）':'')).join('；')+'。');
  if(item.behavior)parts.push(specText(item.behavior));
  if(item.source)parts.push('数据源：'+specText(item.source));
  if(item.validation)parts.push('校验：'+specText(item.validation));
  const body=parts.filter(Boolean).join(' ');
  return `<li class="spec-item"><strong>${esc(item.name)}：</strong>${body}${item.states?.length?`<ul class="spec-states">${item.states.map(state=>`<li>${state.name?`<strong>${esc(state.name)}：</strong>`:''}${specText(state.definition)}</li>`).join('')}</ul>`:''}${renderProcessing(item.processing)}</li>`;
 };
 return (section.source?`<p class="section-source"><b>数据源：</b>${specText(section.source)}</p>`:'')+[...groups].map(([group,items])=>`<div class="spec-group">${group===section.title||section.category?'':`<h4>${group}</h4>`}<ul class="spec-items">${items.map(renderItem).join('')}</ul></div>`).join('');
}
function renderSections(sections){
 return ['筛选项','列表项','操作项'].map(category=>{
  const selected=sections.filter(section=>section.category===category);
  if(!selected.length)return '';
  return `<div class="note-category">${selected.length===1&&selected[0].title===category?'':`<h3 class="note-category-title">${category}</h3>`}${selected.map(section=>`<section class="note-section" data-section="${section.number}"><h3><button type="button" class="note-number" data-locate="${section.number}" aria-label="定位原型 ${section.number}：${esc(section.title)}">${section.number}</button><span>${esc(section.title)}</span><small class="note-unavailable" hidden>当前状态未展示</small></h3>${renderSpec(section)}</section>`).join('')}</div>`;
 }).join('');
}
function send(type,extra={}){frame.contentWindow?.postMessage({channel:'mixed-cut-v7-review',type,...extra},location.origin);}
function goPrototype(){stage.scrollTo({left:0,behavior:'smooth'});}
function goNotes(){stage.scrollTo({left:document.querySelector('#notesBoard').offsetLeft-24,behavior:'smooth'});}
function focusNote(number){const section=content.querySelector(`[data-section="${Number(number)}"]`);if(!section)return;content.querySelector('.is-focused')?.classList.remove('is-focused');section.classList.add('is-focused');focused=number;clearTimeout(focusTimer);focusTimer=setTimeout(()=>{section.classList.remove('is-focused');focused=null;},5000);scroller.scrollTo({top:section.offsetTop-content.offsetTop-20,behavior:'smooth'});}
function render(key,numbers,owner=''){ const note=REVIEW_NOTES[key];if(!note)return;available=numbers||[];if(key!==context||owner!==contextOwner){context=key;contextOwner=owner;focused=null;clearTimeout(focusTimer);document.querySelector('#prototypeTitle').textContent=note.title;document.querySelector('#notesTitle').textContent=note.title;document.querySelector('#currentContext').textContent=`当前：${note.title}`;const pagePath=note.pathByOwner?.[owner]||note.path;content.innerHTML=`<section class="page-description"><h2>#页面说明</h2><p><b>页面路径：</b>${esc(pagePath)}</p><p><b>功能作用：</b>${esc(note.purpose)}</p></section><h2 class="prototype-spec-title">#原型说明</h2><ul class="page-intro"><li><strong>背景：</strong>${esc(note.background||'批量制作并管理投放素材。')}</li><li><strong>需求：</strong>${esc(note.purpose)}</li>${note.source?`<li><strong>数据源：</strong>${esc(note.source)}</li>`:''}</ul>${renderSections(note.sections)}${renderSystemLogic(note.systemLogic)}`;scroller.scrollTop=0;}
  for(const button of content.querySelectorAll('[data-locate]')){const exists=available.includes(Number(button.dataset.locate));button.setAttribute('aria-disabled',String(!exists));button.title=exists?'定位到原型对应区域':'该区域在当前状态下未展示';button.parentElement.querySelector('.note-unavailable').hidden=exists;}
}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.channel!=='mixed-cut-v7-review')return;const data=event.data;if(data.type==='context'){render(data.context,data.available,data.owner);send('markers',{visible:document.querySelector('#showMarkers').checked});}if(data.type==='select'&&data.context===context){goNotes();focusNote(data.number);}});
content.addEventListener('click',event=>{const button=event.target.closest('[data-locate]');if(!button||button.getAttribute('aria-disabled')==='true')return;focusNote(Number(button.dataset.locate));goPrototype();send('locate',{context,number:Number(button.dataset.locate)});});
document.querySelector('#toPrototype').addEventListener('click',goPrototype);
document.querySelector('#toNotes').addEventListener('click',goNotes);
document.querySelector('#showMarkers').addEventListener('change',event=>send('markers',{visible:event.target.checked}));
frame.addEventListener('load',()=>send('ready'));
render(toolboxEntry?'toolbox':'create',[],toolboxEntry?'工具箱':'制作素材');
send('ready');
