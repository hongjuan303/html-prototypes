import {REVIEW_NOTES} from './review-notes.js?v=20261009-update10';
const frame=document.querySelector('#prototypeFrame'),stage=document.querySelector('#reviewStage'),scroller=document.querySelector('#notesScroller'),content=document.querySelector('#notesContent');
const toolboxEntry=new URLSearchParams(location.search).get('entry')==='toolbox';
let context='',contextOwner='',available=[],focused=null,focusTimer;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatBullet=bullet=>esc(bullet);
const itemKinds={field:'配置字段',action:'操作项',text:'只读文案',status:'状态展示'};
const specLabels={definition:'定义',source:'数据源',default:'默认 / 初始',behavior:'显示与操作',validation:'校验 / 限制',copy:'文案 / 出现条件'};
const specText=value=>Array.isArray(value)?value.map(formatBullet).join('<br>'):formatBullet(String(value));
function renderProcessing(steps,title='AI 与系统处理流程'){
 if(!Array.isArray(steps)||!steps.length)return '';
 const labels={input:'输入',process:'处理要求',output:'输出',acceptance:'验收要点'};
 return `<section class="processing-spec" aria-label="${esc(title)}"><h5>${esc(title)}</h5><ol>${steps.map((step,index)=>`<li class="processing-step"><h6><span>${String(index+1).padStart(2,'0')}</span>${esc(step.name)}</h6><p class="processing-role">执行能力：${esc(step.role)}</p><dl>${Object.entries(labels).filter(([key])=>step[key]!==undefined&&step[key]!=='').map(([key,label])=>`<div><dt>${label}</dt><dd>${specText(step[key])}</dd></div>`).join('')}</dl></li>`).join('')}</ol></section>`;
}
function renderSystemLogic(steps){
 if(!Array.isArray(steps)||!steps.length)return '';
 return `<section class="system-logic"><h2>系统处理逻辑</h2>${renderProcessing(steps,'处理与验收')}</section>`;
}
function renderSpec(section){
 if(!section.items?.length)return `<ul>${(section.bullets||[]).map(bullet=>`<li>${formatBullet(bullet)}</li>`).join('')}</ul>`;
 const cards=section.items.map((item,index)=>`<article class="field-spec" id="field-${context}-${section.number}-${index+1}"><h4><span class="field-index">${section.number}.${index+1}</span>${esc(item.name)}<small>${itemKinds[item.kind]||'需求项'}</small></h4><dl>${Object.entries(specLabels).filter(([key])=>item[key]!==undefined&&item[key]!==null&&item[key]!=='').map(([key,label])=>`<div><dt>${label}</dt><dd>${specText(item[key])}</dd></div>`).join('')}</dl>${renderProcessing(item.processing)}${item.values?.length?`<div class="enum-spec"><div class="enum-label">枚举定义</div><table><thead><tr><th>取值</th><th>显示文案</th><th>含义 / 适用条件</th></tr></thead><tbody>${item.values.map(value=>`<tr><td>${esc(value.value)}</td><td>${esc(value.label)}</td><td>${specText(value.meaning)}</td></tr>`).join('')}</tbody></table></div>`:''}</article>`).join('');
 return cards+(section.checks?.length?`<details class="spec-checks"><summary>测试关注 · ${section.checks.length} 项</summary><ul>${section.checks.map(check=>`<li>${specText(check)}</li>`).join('')}</ul></details>`:'');
}
function send(type,extra={}){frame.contentWindow?.postMessage({channel:'mixed-cut-v7-review',type,...extra},location.origin);}
function goPrototype(){stage.scrollTo({left:0,behavior:'smooth'});}
function goNotes(){stage.scrollTo({left:document.querySelector('#notesBoard').offsetLeft-24,behavior:'smooth'});}
function focusNote(number){const section=content.querySelector(`[data-section="${Number(number)}"]`);if(!section)return;content.querySelector('.is-focused')?.classList.remove('is-focused');section.classList.add('is-focused');focused=number;clearTimeout(focusTimer);focusTimer=setTimeout(()=>{section.classList.remove('is-focused');focused=null;},5000);scroller.scrollTo({top:section.offsetTop-content.offsetTop-20,behavior:'smooth'});}
function render(key,numbers,owner=''){ const note=REVIEW_NOTES[key];if(!note)return;available=numbers||[];if(key!==context||owner!==contextOwner){context=key;contextOwner=owner;focused=null;clearTimeout(focusTimer);document.querySelector('#prototypeTitle').textContent=note.title;document.querySelector('#notesTitle').textContent=note.title;document.querySelector('#currentContext').textContent=`当前：${note.title}`;const pagePath=note.pathByOwner?.[owner]||note.path;content.innerHTML=`<section class="page-description"><h2>页面说明</h2><dl><div><dt>页面路径</dt><dd>${esc(pagePath)}</dd></div><div><dt>功能作用</dt><dd>${esc(note.purpose)}</dd></div></dl></section><h2 class="prototype-spec-title">原型说明</h2>${note.sections.map(section=>`<section class="note-section" data-section="${section.number}"><h3><button type="button" class="note-number" data-locate="${section.number}" aria-label="定位原型 ${section.number}：${esc(section.title)}">${section.number}</button><span>${esc(section.title)}</span><small class="note-unavailable" hidden>当前状态未展示</small></h3>${renderSpec(section)}</section>`).join('')}${renderSystemLogic(note.systemLogic)}`;scroller.scrollTop=0;}
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
