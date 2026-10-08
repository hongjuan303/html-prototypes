import {REVIEW_NOTES} from './review-notes.js?v=20261008-fields1';
const frame=document.querySelector('#prototypeFrame'),stage=document.querySelector('#reviewStage'),scroller=document.querySelector('#notesScroller'),content=document.querySelector('#notesContent');
const toolboxEntry=new URLSearchParams(location.search).get('entry')==='toolbox';
let context='',available=[],focused=null,focusTimer;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const ruleSections={
 'R-01':'6.1 R-01 片源与交付',
 'R-02':'6.2 R-02 内容质量',
 'R-03':'6.3 R-03 时长与速度',
 'R-04':'6.4 R-04 内容差异',
 'R-05':'6.5 R-05 声音与字幕',
 'R-06':'6.6 R-06 确认与内容版本',
 'R-07':'6.7 R-07 补救与创作返工',
 'R-08':'6.8 R-08 积分结算',
 'R-09':'6.9 R-09 账户与同步资格',
 'R-10':'6.10 R-10 后台任务与异常',
 'R-11':'6.11 R-11 分析与标准版本',
};
const ruleAnchor=title=>'v7-'+title.replace(/[^\w\u3400-\u9fff-]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
const formatBullet=bullet=>esc(bullet).replace(/R-\d{2}/g,code=>ruleSections[code]?`<a href="./prd.html#${encodeURIComponent(ruleAnchor(ruleSections[code]))}" target="_blank" rel="noopener" title="查看正式规则 ${code}">${code}</a>`:code);
const itemKinds={field:'配置字段',action:'操作项',text:'只读文案',status:'状态展示'};
const specLabels={definition:'定义',source:'数据源',default:'默认 / 初始',behavior:'显示与操作',validation:'校验 / 限制',copy:'文案 / 出现条件'};
const specText=value=>Array.isArray(value)?value.map(formatBullet).join('<br>'):formatBullet(String(value));
function renderSpec(section){
 if(!section.items?.length)return `<ul>${section.bullets.map(bullet=>`<li>${formatBullet(bullet)}</li>`).join('')}</ul>`;
 const cards=section.items.map((item,index)=>`<article class="field-spec" id="field-${context}-${section.number}-${index+1}"><h4><span class="field-index">${section.number}.${index+1}</span>${esc(item.name)}<small>${itemKinds[item.kind]||'需求项'}</small></h4><dl>${Object.entries(specLabels).filter(([key])=>item[key]!==undefined&&item[key]!==null&&item[key]!=='').map(([key,label])=>`<div><dt>${label}</dt><dd>${specText(item[key])}</dd></div>`).join('')}</dl>${item.implementation?`<details class="spec-implementation"><summary>演示代码参考</summary><p>${specText(item.implementation)}</p></details>`:''}${item.values?.length?`<div class="enum-spec"><div class="enum-label">枚举定义</div><table><thead><tr><th>取值</th><th>显示文案</th><th>含义 / 适用条件</th></tr></thead><tbody>${item.values.map(value=>`<tr><td>${esc(value.value)}</td><td>${esc(value.label)}</td><td>${specText(value.meaning)}</td></tr>`).join('')}</tbody></table></div>`:''}</article>`).join('');
 return cards+(section.checks?.length?`<details class="spec-checks"><summary>测试关注 · ${section.checks.length} 项</summary><ul>${section.checks.map(check=>`<li>${specText(check)}</li>`).join('')}</ul></details>`:'');
}
function send(type,extra={}){frame.contentWindow?.postMessage({channel:'mixed-cut-v7-review',type,...extra},location.origin);}
function goPrototype(){stage.scrollTo({left:0,behavior:'smooth'});}
function goNotes(){stage.scrollTo({left:document.querySelector('#notesBoard').offsetLeft-24,behavior:'smooth'});}
function focusNote(number){const section=content.querySelector(`[data-section="${Number(number)}"]`);if(!section)return;content.querySelector('.is-focused')?.classList.remove('is-focused');section.classList.add('is-focused');focused=number;clearTimeout(focusTimer);focusTimer=setTimeout(()=>{section.classList.remove('is-focused');focused=null;},5000);scroller.scrollTo({top:section.offsetTop-content.offsetTop-20,behavior:'smooth'});}
function render(key,numbers){const note=REVIEW_NOTES[key];if(!note)return;available=numbers||[];if(key!==context){context=key;focused=null;clearTimeout(focusTimer);document.querySelector('#prototypeTitle').textContent=note.title;document.querySelector('#notesTitle').textContent=note.title;document.querySelector('#currentContext').textContent=`当前：${note.title}`;content.innerHTML=`<p class="notes-context">${esc(note.page)} · V7 研发与测试说明</p><p class="notes-summary">${esc(note.need)}</p><p class="spec-reading-hint">按字段/操作查规则，测试关注可展开；演示差异已标注，上线验收以 R 规则为准。</p>${note.sections.map(section=>`<section class="note-section" data-section="${section.number}"><h3><button type="button" class="note-number" data-locate="${section.number}" aria-label="定位原型 ${section.number}：${esc(section.title)}">${section.number}</button><span>${esc(section.title)}</span><small class="note-unavailable" hidden>当前状态未展示</small></h3>${renderSpec(section)}</section>`).join('')}<p class="notes-footer">序号定位原型；R 编号查上线规则。<a href="./FIELD-SPEC.md" download>下载字段与测试说明</a> · <a href="./prd.html" target="_blank" rel="noopener">查看精简 PRD ↗</a></p>`;scroller.scrollTop=0;}
  for(const button of content.querySelectorAll('[data-locate]')){const exists=available.includes(Number(button.dataset.locate));button.setAttribute('aria-disabled',String(!exists));button.title=exists?'定位到原型对应区域':'该区域在当前状态下未展示';button.parentElement.querySelector('.note-unavailable').hidden=exists;}
}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.channel!=='mixed-cut-v7-review')return;const data=event.data;if(data.type==='context'){render(data.context,data.available);send('markers',{visible:document.querySelector('#showMarkers').checked});}if(data.type==='select'&&data.context===context){goNotes();focusNote(data.number);}});
content.addEventListener('click',event=>{const button=event.target.closest('[data-locate]');if(!button||button.getAttribute('aria-disabled')==='true')return;focusNote(Number(button.dataset.locate));goPrototype();send('locate',{context,number:Number(button.dataset.locate)});});
document.querySelector('#toPrototype').addEventListener('click',goPrototype);
document.querySelector('#toNotes').addEventListener('click',goNotes);
document.querySelector('#showMarkers').addEventListener('change',event=>send('markers',{visible:event.target.checked}));
frame.addEventListener('load',()=>send('ready'));
render(toolboxEntry?'toolbox':'create',[]);
send('ready');
