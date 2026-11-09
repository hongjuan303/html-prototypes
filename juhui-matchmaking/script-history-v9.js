import * as M from './model-v2.js?v=20261109-overview-merge';
import {scriptMetadataFields} from './fields.js?v=20261109-overview-merge';

const reviewNames={quality:'内容审核',safety:'安全审核'};
const resultNames={approved:'审核通过',revision:'审核驳回',rejected:'不通过'};
const fileKey=f=>f?.previewId||[f?.name,f?.version,f?.at,f?.size].join('|');
const fileVersion=(f,fallback)=>f?.version||fallback||null;

export function canReadScriptHistory(s,p){
 if(!p||s.ui.business!=='matching'||!M.visible(s).some(x=>x.id===p.id))return false;
 return s.ui.system==='platform'||s.ui.identity==='script'&&M.isWriter(s,p);
}

export function uploadRecords(p){
 const records=[],seen=new Set();
 function add(kind,file,fallback,current=false){
  if(!file?.name)return;
  const version=fileVersion(file,fallback),key=kind+'|'+fileKey(file)+'|'+version;
  if(seen.has(key))return;seen.add(key);
  records.push({kind,file,version,current,at:file.at||'',key});
 }
 add('full',p.full,p.full?.version,true);add('card',p.card,p.card?.version,true);
 for(const old of [...(p.scriptVersions||[])].reverse())add('full',old.full,old.version);
 for(const old of [...(p.cardVersions||[])].reverse())add('card',old.card||old.file||old,old.version);
 return records.sort((a,b)=>(Date.parse(b.at)||0)-(Date.parse(a.at)||0)||Number(b.current)-Number(a.current)||(b.version||0)-(a.version||0));
}

export function reviewRecords(p,type='all'){
 const records=[],seen=new Set(),fulls=uploadRecords(p).filter(x=>x.kind==='full');
 function add(key,review,fallback){
  if(!review)return;
  for(const old of review.previousResults||[])add(key,old,old.version||fallback);
  if(!resultNames[review.status])return;
  const version=review.version||fallback||null;
  const signature=JSON.stringify([key,version,review.reviewedAt||'',review.reviewedBy||'',review.status,review.opinion||'',(review.files||[]).map(fileKey).sort()]);
  if(seen.has(signature))return;seen.add(signature);
  records.push({type:key,version,status:review.status,opinion:review.opinion||'',at:review.reviewedAt||'',by:review.reviewedBy||'',files:(review.files||[]).map(f=>({...f,reviewAttachment:true})),full:review.scriptFile||(version?fulls.find(x=>x.version===version)?.file:null),key:signature});
 }
 const types=type==='all'?Object.keys(reviewNames):reviewNames[type]?[type]:[];
 for(const key of types){for(const old of p.scriptVersions||[])add(key,old[key],old.version||old.full?.version);add(key,p[key],p.full?.version);}
 return records.sort((a,b)=>(Date.parse(b.at)||0)-(Date.parse(a.at)||0)||(b.version||0)-(a.version||0));
}

export function scriptHistoryModal(s,p,d,h){
 if(!['script-review-history','script-upload-history'].includes(d.type))return null;
 const {E,button,badge,fileList}=h,review=d.type==='script-review-history';
 const title=review?'审核记录':'剧本上传记录';
 if(!canReadScriptHistory(s,p))return {title,body:'<p class="muted">当前账号不可查看该记录。</p>'};
 const intro=`<div class="review-project"><strong>${E(p.name)}</strong><small>${E(p.id)}</small></div>`;
 if(!review){
  const rows=uploadRecords(p);
  return {title,body:intro+`<div class="script-history-records">${rows.map(x=>`<section class="script-history-record"><header><h3>${x.kind==='card'?'剧本一卡':'剧本全集'} · ${x.version?'V'+E(x.version):'版本未记录'} ${x.current?badge('当前版本','blue'):''}</h3><span>上传时间：${E(x.at||'未记录')}</span></header>${fileList([x.file])}</section>`).join('')||'<p class="muted">暂无可追溯的上传文件。</p>'}</div>`};
 }
 const type=['quality','safety'].includes(d.value)?d.value:'all',rows=reviewRecords(p,type);
 const navigation=`<div class="script-history-types" role="group" aria-label="审核记录类型">${[['all','全部'],...Object.entries(reviewNames)].map(([key,label])=>button(label,'script-review-history',p.id,key===type?'primary':'',`data-value="${key}" aria-pressed="${key===type}"`)).join('')}</div>`;
 return {title,body:intro+navigation+`<div class="script-history-records">${rows.map(x=>`<section class="script-history-record"><header><h3>${reviewNames[x.type]} · ${x.version?'全集 V'+E(x.version):'版本未记录'} ${badge(resultNames[x.status],x.status==='approved'?'green':x.status==='revision'?'orange':'red')}</h3><span>${E(x.at||'审核时间未记录')}${x.by?' · '+E(x.by):''}</span></header><p class="script-review-opinion">${E(x.opinion||'未填写文字意见')}</p>${x.files.length?`<h4>审核附件</h4>${fileList(x.files)}`:''}${x.full?`<details class="supporting-file"><summary>查看本次审核的剧本</summary>${fileList([x.full])}</details>`:'<p class="subtle">此条历史记录未保存对应剧本原件。</p>'}</section>`).join('')||'<p class="muted">暂无已提交的审核记录。</p>'}</div>`};
}

export function scriptDocumentPanels(s,p,h){
 const {E,button,panel,fileList}=h;
 if(!canReadScriptHistory(s,p))return '<p class="muted">当前账号不可查看该剧本。</p>';
 const actions=button('剧本上传记录','script-upload-history',p.id)+button('审核记录','script-review-history',p.id,'','data-value="all"');
 const documents=panel('剧本文件',`<h4>剧本一卡</h4>${fileList(p.card?[p.card]:[])}<h4>剧本全集</h4>${fileList(p.full?[p.full]:[])}`,actions);
 const material=p.scriptMaterial||{},files=material.files||[],draft=material.draft;
 const values=Object.entries(material.values||{}).filter(([,value])=>value!==''&&value!=null);
 const metadata=values.length?`<dl class="record-fields">${values.map(([key,value])=>`<div><dt>${E(scriptMetadataFields.find(f=>f.key===key)?.label||key)}</dt><dd>${E(value)}</dd></div>`).join('')}</dl>`:'';
 const materialBody=metadata+(files.length?fileList(files):'<p class="muted">暂未上传剧本物料附件。</p>')+(draft?.files?.length?`<details class="supporting-file"><summary>未提交物料草稿</summary>${fileList(draft.files)}</details>`:'');
 return documents+panel('剧本物料',materialBody);
}
