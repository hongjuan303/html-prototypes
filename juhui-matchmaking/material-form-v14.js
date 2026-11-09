import {materialFeedback,materialHistoryButton} from './material-feedback-v15.js?v=20261109-overview-merge';
import {linkedText} from './material-display-v14.js?v=20261109-overview-merge';
import * as F from './fields.js?v=20261109-overview-merge';
import {materialValues,isMaterialFieldVisible,normalizeMaterialValues,materialReleaseReadOnly} from './material-data-v14.js?v=20261109-overview-merge';

const scriptSections=[
 ['basic','剧集信息',['alternates','type','tags','provider','providerOther']],
 ['writer','编剧资料',['writerName','writerGender','writerIntro']],
 ['story','剧情资料',['shortIntro','outlineShort','outlineLong','recommendation']],
 ['characters','人物介绍',['heroine','heroineIntro','hero','heroIntro']],
 ['ip','发行与改编信息',['releaseType','tomatoIp','ipSource']]
];
const makerSections=[
 ['basic','制作信息',['company','dramaType','episodes','projectType','releaseType']],
 ['team','主创资料',['directorName','directorGender','directorIntro','producerName','producerGender','producerIntro']],
 ['delivery','时长与成片链接',['averageDuration','durationUnit','firstDuration','totalDuration','previewLink','copyrightLink','otherLink']],
 ['tools','制作工具与成本',['aigc','aigcOther','paidEpisodes','cost']],
 ['tracks','分轨资料',['tracksInfo']]
];
const helpOverrides={
 shortIntro:'10字以内，一句话概括剧情。',outlineShort:'100—200字，含标点；填写后提交时校验字数。',outlineLong:'550—1000字，含标点；填写后提交时校验字数。',
 directorIntro:'填写导演介绍。',averageDuration:'支持小数，请同时标明时长单位。',durationUnit:'按实际资料选择单位。',
 writerName:'填写编剧真实姓名；笔名与真实姓名不一致时，以真实姓名为准。',
 copyrightLink:'提供有效期为365天的网盘链接，可附提取码。',otherLink:'提供有效期为365天的网盘链接，可附提取码。',
 aigc:'可选择多个工具；选择“其他”后补充工具名称。',cost:'单位：万元，支持小数。',
 tracksInfo:'可填写网盘链接、提取码或交付说明；对应文件也可在下方上传。'
};
function listValue(value,key){return Array.isArray(value)?value.filter(Boolean).join(key==='alternates'?'\n':'、'):String(value??'');}
function materialShell(intro,sections){
 return `<div class="material-editor-shell"><nav class="material-section-nav" aria-label="物料分区"><strong>物料目录</strong>${sections.map(([key,label],i)=>`<button type="button" data-material-jump="material-section-${key}" ${i===0?'class="is-current" aria-current="location"':''}>${label}</button>`).join('')}</nav><div class="material-scroll" tabindex="0" aria-label="物料填写内容">${intro}`;
}
function fieldHTML(f,value,vals,readonly,E,review=false){
 const shown=isMaterialFieldVisible(f,vals),id='material-input-'+f.key;
 const wide=f.type==='textarea'||['alternates','aigc','tracksInfo','copyrightLink','otherLink','previewLink'].includes(f.key);
 const text=listValue(value,f.key),help=review?'':readonly?(f.key==='releaseType'?'已从项目共用资料带入。':'已从现有资料带入。'):helpOverrides[f.key]||f.desc||'';
 let control='';
 if(readonly)control=`<div class="material-readonly" id="${id}">${(review&&/Link|tracksInfo/.test(f.key)?linkedText(text||'—',E):E(text||'—')).replaceAll('\n','<br>')}</div>${review?'':`<input type="hidden" name="${E(f.key)}" value="${E(text)}">`}`;
 else if(f.type==='multiselect'||f.key==='aigc'){
  const selected=Array.isArray(value)?value:value?[String(value)]:[],options=[...(f.options||[])];for(const item of selected)if(!options.includes(item))options.push(item);
  control=`<div class="material-checks" id="${id}" role="group" aria-label="${E(f.label)}">${options.map(x=>`<label><input type="checkbox" name="${E(f.key)}" value="${E(x)}" ${selected.includes(x)?'checked':''}><span>${E(x)}</span></label>`).join('')}</div>`;
 }else if(f.type==='select'){
  const options=[...(f.options||[])];if(text&&!options.includes(text))options.push(text);
  control=`<select id="${id}" name="${E(f.key)}"><option value="">请选择</option>${options.map(x=>`<option value="${E(x)}" ${x===text?'selected':''}>${E(x)}</option>`).join('')}</select>`;
 }else if(f.type==='textarea'||f.key==='alternates')control=`<textarea id="${id}" name="${E(f.key)}" ${f.max?'maxlength="'+f.max+'"':''} ${f.max?'data-material-count="'+f.max+'"':''}>${E(text)}</textarea>`;
 else control=`<input id="${id}" name="${E(f.key)}" type="${f.type==='number'?'number':'text'}" value="${E(text)}" ${f.type==='number'?`min="${f.key==='episodes'?1:0}" step="${f.key==='episodes'?1:'any'}"`:''} ${f.max?'maxlength="'+f.max+'" data-material-count="'+f.max+'"':''}>`;
 return `<div class="field material-field ${wide?'wide':''}" data-material-field="${E(f.key)}" ${shown?'':'hidden'}><label for="${id}">${f.required?'<i>*</i> ':''}${E(f.label)}</label>${control}${help?`<small>${E(help)}</small>`:''}${!readonly&&f.max?`<small class="material-count" data-material-counter="${E(f.key)}">${Array.from(text).length} / ${f.max}字</small>`:''}</div>`;
}

export function materialForm(s,p,kind,edit,h,{readOnly=false,introExtra=''}={}){
 const {E,fileInput,fileList}=h,script=kind==='scriptMaterial',internal=script&&p.source==='internal';
 const supplier=s.suppliers.find(x=>x.id===(script?p.supplier:p.selected)),title=script?p.name:p.projectName||p.name;
 let html=`<div class="material-context"><strong>${E(title)}</strong><span>${E(p.id)}</span>${supplier?`<small>${script?'剧本方':'承制方'}：${E(supplier.name)}</small>`:''}</div>`;
 if(readOnly)html+=`<p class="material-intro">本次提交：${edit.version?'V'+E(edit.version):'版本未记录'} · ${E(edit.submittedAt||'提交时间未记录')}${edit.submittedBy?' · '+E(edit.submittedBy):''}</p>${introExtra}`;
 else{html+=materialFeedback(p[kind],h,{heading:'本次核验意见'});if(h.button)html+=`<div class="material-history-entry">${materialHistoryButton(p,kind,h)}</div>`;
 html+=`<p class="material-intro">${internal?'上传本剧本的补充物料。':'已有资料自动带入，请补充本次交付内容。'}任何阶段均可保存草稿或提交核验。</p>`;}
 if(internal)return materialShell(html,[['files','物料附件']])+`<section class="material-section" id="material-section-files" tabindex="-1"><h3>物料附件</h3>${fileList(edit.files||[])}${readOnly?'':fileInput('materialFiles','上传物料附件')+'<p class="subtle">可多选上传图片、Excel、Word、PDF、MP4等文件，不限制格式；已上传附件会保留。</p>'}</section></div></div>`;
 const vals=readOnly?normalizeMaterialValues(kind,edit.values||{}):materialValues(s,p,kind,edit.values,{draft:!!p[kind].draft}),fields=script?F.scriptMetadataFields:F.producerMetadataFields,sections=script?scriptSections:makerSections;
 const readonlyKeys=new Set(script?['provider',...(p.category?['type']:[]),...(p.tags?.length?['tags']:[]),...(p.alternates?.some(Boolean)?['alternates']:[])]:[]);
 if(materialReleaseReadOnly(p,kind))readonlyKeys.add('releaseType');
 html=materialShell(html,[...sections.map(([key,label])=>[key,label]),['files','物料附件']]);
 const rendered=new Set();
 for(const [key,label,keys] of sections){const rows=keys.map(k=>fields.find(f=>f.key===k)).filter(Boolean);rows.forEach(f=>rendered.add(f.key));if(!rows.length)continue;
  html+=`<section class="material-section" id="material-section-${key}" tabindex="-1"><h3>${label}</h3>${key==='tracks'?'<ul class="material-track-guide"><li>成片轨：分集，无字幕、无音乐，MP4</li><li>音乐轨：分集BGM，MP3</li><li>字幕轨：分集字幕，SRT</li></ul>':''}<div class="form-grid">${rows.map(f=>fieldHTML(f,vals[f.key],vals,readOnly||readonlyKeys.has(f.key),E,readOnly)).join('')}</div></section>`;
 }
 const rest=fields.filter(f=>!rendered.has(f.key));if(rest.length)html+=`<section class="material-section"><h3>补充资料</h3><div class="form-grid">${rest.map(f=>fieldHTML(f,vals[f.key],vals,readOnly,E,readOnly)).join('')}</div></section>`;
 html+=`<section class="material-section" id="material-section-files" tabindex="-1"><h3>物料附件</h3>${readOnly?'':'<p class="subtle">支持图片、Excel、Word、PDF、视频等格式，可多选上传。</p>'}`;
 if(script)html+=fileList(edit.files||[])+(readOnly?'':fileInput('materialFiles','补充剧本物料附件'));
 else{
  html+=`<div class="material-upload-groups">${F.producerFileFields.map(([key,label])=>`<section class="material-upload-group"><h4>${E(label)}</h4>${fileList((edit.files||[]).filter(f=>f.slot===key))}${readOnly?'':fileInput(key,'上传'+label)+'<small>本次选择的文件将替换该分类原附件；未选择文件则保留。</small>'}</section>`).join('')}</div>`;
  const known=new Set(F.producerFileFields.map(([key])=>key)),other=(edit.files||[]).filter(f=>!known.has(f.slot));if(other.length)html+=`<h4>其他已上传附件</h4>${fileList(other)}`;
 }
 return html+'</section></div></div>';
}

export function readMaterialForm(form,kind){
 const fields=kind==='scriptMaterial'?F.scriptMetadataFields:F.producerMetadataFields,values={};
 for(const f of fields){const controls=[...form.elements].filter(el=>el.name===f.key);if(!controls.length)continue;values[f.key]=f.type==='multiselect'||f.key==='aigc'?controls.filter(el=>el.checked).map(el=>el.value):controls[0].value;}
 return normalizeMaterialValues(kind,values);
}
export function syncMaterialForm(form,kind){
 if(!form)return;const values=readMaterialForm(form,kind),fields=kind==='scriptMaterial'?F.scriptMetadataFields:F.producerMetadataFields;
 for(const f of fields){const box=form.querySelector(`[data-material-field="${f.key}"]`);if(!box)continue;box.hidden=!isMaterialFieldVisible(f,values);}
 form.querySelectorAll('[data-material-count]').forEach(el=>{const counter=form.querySelector(`[data-material-counter="${el.name}"]`);if(counter)counter.textContent=`${Array.from(el.value).length} / ${el.dataset.materialCount}字`;});
}

export function jumpMaterialSection(id){
 const scroller=document.querySelector('.material-scroll'),section=document.getElementById(id);
 if(!scroller||!section)return;
 scroller.scrollTo({top:Math.max(0,scroller.scrollTop+section.getBoundingClientRect().top-scroller.getBoundingClientRect().top-24),behavior:'instant'});
 section.focus({preventScroll:true});
}

export function bindMaterialNavigation(form){
 const scroller=form?.querySelector('.material-scroll'),nav=form?.querySelector('.material-section-nav');
 if(!scroller||!nav)return ()=>{};
 const buttons=[...nav.querySelectorAll('[data-material-jump]')],sections=buttons.map(b=>form.querySelector('#'+b.dataset.materialJump));
 let frame=0;
 const update=()=>{
  frame=0;let current=0;const top=scroller.getBoundingClientRect().top+26;
  sections.forEach((section,i)=>{if(section?.getBoundingClientRect().top<=top)current=i;});
  if(scroller.scrollHeight>scroller.clientHeight+2&&scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-3)current=buttons.length-1;
  buttons.forEach((button,i)=>{button.classList.toggle('is-current',i===current);if(i===current)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 scroller.addEventListener('scroll',schedule,{passive:true});
 const observer=new ResizeObserver(schedule);observer.observe(scroller);sections.filter(Boolean).forEach(section=>observer.observe(section));update();
 return ()=>{scroller.removeEventListener('scroll',schedule);observer.disconnect();cancelAnimationFrame(frame);};
}
