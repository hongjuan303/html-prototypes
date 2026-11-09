'use strict';
// Copyright-center materials are separate from ordinary Douyin account publishing.
const CP_PLATFORM='抖音版权中台',CP_STORE='publishing-copyright-demo-v2';
const CP_TYPES={'正片':['花絮','剧情回顾','剧情解析'],'线索':['预告片','花絮','剧情解析']};
const CP_IDENTITIES=['版权机构','投资出品方机构','版权个人'];
const CP_CONTENTS=DRAMAS.flatMap((d,i)=>['正片','线索'].map(type=>({id:(type==='正片'?'FILM-':'CLUE-')+d.id,drama:d.id,name:d.name,type,dyAccount:i===2?'dy02':'dy01',dyOnline:i!==1,hgOnline:i!==2,kind:'真人短剧'})));
const CP_HG_ACCOUNTS=[{id:'hg01',name:'星河短剧厂牌'},{id:'hg02',name:'晚风剧场厂牌'}];
const CP_TOPICS=['短剧好故事','一起追好剧','剧情解读'];
let cpSaved={};try{cpSaved=JSON.parse(localStorage.getItem(CP_STORE)||'{}')}catch(_){}
let cpRows=cpSaved.rows||[
 {id:'CP-DEMO-1',identity:'版权机构',owner:'当前运营',asset:{...OSS_FILES[6]},content:'FILM-10086',materialType:'花絮',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'长街有月，幕后故事也动人 #短剧',hgTitle:'一起看看长街有月的幕后故事',topics:['短剧好故事'],ai:false,anchor:true,initialAnchor:true,cover:demoCover('长街有月'),dyStatus:'已发布',hgStatus:'已发布',counted:true,edits:1,created:'2026-10-13 15:30'},
 {id:'CP-DEMO-2',identity:'版权机构',owner:'当前运营',asset:{...OSS_FILES[7]},content:'CLUE-10087',materialType:'预告片',dyAccount:'dy02',hgAccount:'hg01',dyTitle:'春风知我意，新的故事即将开始',hgTitle:'春风知我意精彩预告',topics:['一起追好剧'],ai:false,anchor:false,initialAnchor:false,cover:demoCover('春风知我意'),dyStatus:'待投稿',hgStatus:'已发布',counted:true,edits:0,created:'2026-10-13 16:20'},
 {id:'CP-DEMO-3',identity:'版权机构',owner:'运营同事',asset:{...OSS_FILES[11]},content:'FILM-10088',materialType:'剧情解析',dyAccount:'dy02',hgAccount:'hg02',dyTitle:'逆光而来的你，一起读懂她的坚持',hgTitle:'她如何走到灯光之下',topics:['剧情解读'],ai:false,anchor:true,initialAnchor:true,cover:demoCover('逆光而来的你'),dyStatus:'已删除',hgStatus:'已删除',counted:true,edits:2,created:'2026-10-12 11:10'}
];
for(const [i,assetIndex] of [[1,6],[2,7],[3,11]]){const r=cpRows.find(r=>r.id==='CP-DEMO-'+i);if(r)r.asset={...OSS_FILES[assetIndex]};}

const CP_COLUMNS=[['asset','素材名称',180],['drama','短剧名称',130],['type','关联类型',90],['materialType','素材类型',100],['dyAccount','抖音发布账号',120],['hgAccount','红果厂牌账号',130],['anchor','是否挂载锚点',115],['ai','是否AI作品',105],['dyTitle','抖音视频标题',180],['hgTitle','红果视频标题',180],['audit','审核状态',175]];
// Management follows the platform's results list; pre-submission configuration keeps its editable fields.
const CP_LIST_COLUMNS=[['materialInfo','素材信息',260],['relatedContent','关联内容',210],['materialType','素材类型',90],['dyAudit','抖音审核状态',125],['dyPublish','抖音发布状态',115],['dyAccount','抖音发布账号',155],['hgAudit','红果审核状态',125],['hgPublish','红果发布状态',115],['hgAccount','红果发布账号',155],['submittedAt','提审时间',165]];
const CP_AUDITS=['审核中','审核成功','审核失败'];
const emptyCPFilters=()=>({asset:'',drama:'',contentId:'',type:'',materialType:'',dyAccount:'',hgAccount:'',audit:''});
let cpState={identity:'版权机构',role:'管理员',mode:'list',selected:new Set(),filters:emptyCPFilters(),draft:null};
const cpContent=r=>CP_CONTENTS.find(c=>c.id===r.content);
const cpNumericContentId=c=>String(c?.id||'').match(/^(?:(?:FILM|CLUE)-)?(\d+)$/)?.[1]||'';
const cpCanSee=r=>r.identity===cpState.identity&&(cpState.identity!=='版权个人'&&cpState.role==='管理员'||r.owner==='当前运营');
const cpVisible=()=>cpRows.filter(cpCanSee);
const cpPersist=()=>localStorage.setItem(CP_STORE,JSON.stringify({schema:'2.3',rows:cpRows}));
const cpQuotaLimit=type=>type==='正片'?30:200;
function cpQuotaUsed(content,identity=cpState.identity){return cpRows.filter(r=>r.identity===identity&&r.content===content&&r.counted).length}
function cpAudit(r,end){return r[end+'Audit']||({'已发布':'审核成功','审核不通过':'审核失败','审核失败':'审核失败','审核中':'审核中'}[r[end+'Status']]||'')}
function cpFailedEnds(r){return ['dy','hg'].filter(end=>cpAudit(r,end)==='审核失败')}
function cpEditReason(r){
 if(!cpCanSee(r))return '无权编辑此身份下的素材';
 if(['dy','hg'].some(end=>cpAudit(r,end)==='审核中'))return '审核中不可编辑';
 if(r.dyStatus==='已删除'&&r.hgStatus==='已删除')return '两端已删除，不可编辑';
 if(cpAudit(r,'hg')==='审核失败'&&r.dyStatus==='待投稿')return '红果审核失败且抖音待投稿，暂不可编辑';
 if(!cpFailedEnds(r).length)return ['dy','hg'].some(end=>cpAudit(r,end)==='审核成功')?'审核成功不可编辑':'尚未返回审核失败结果';
 if(r.edits>=5)return '已达5次修改上限';
 return '';
}
// Keep prior local records. Add review examples once, without changing their actual outcomes.
if(cpSaved.schema!=='2.3'){
 const base={identity:'版权机构',owner:'当前运营',content:'CLUE-10088',materialType:'剧情解析',dyAccount:'dy02',hgAccount:'hg02',dyTitle:'她让不被看见的梦想被看见',hgTitle:'逆光而来的你，梦想终会被看见',topics:[],ai:false,anchor:false,initialAnchor:false,cover:demoCover('逆光而来的你'),counted:false,edits:0,created:'2026-10-16 10:00'};
 for(const row of [
  {...base,id:'CP-V23-FAILED',asset:{...OSS_FILES[11]},dyStatus:'审核不通过',hgStatus:'审核不通过',dyAudit:'审核失败',hgAudit:'审核失败',dyReason:'标题与素材内容不符，请调整标题后重新提审。',hgReason:'封面文字不清晰，请更换封面后重新提审。'},
  {...base,id:'CP-V23-MIXED',asset:{...OSS_FILES[8]},dyStatus:'已发布',hgStatus:'审核不通过',dyAudit:'审核成功',hgAudit:'审核失败',hgReason:'标题包含不适合展示的表述，请修改红果标题。',counted:true},
  {...base,id:'CP-V23-PENDING',asset:{...OSS_FILES[2]},content:'CLUE-10086',dyAccount:'dy01',hgAccount:'hg01',dyTitle:'长街重逢，他竟忘了最想守护的人',hgTitle:'长街有月精彩花絮',dyStatus:'审核中',hgStatus:'审核中',dyAudit:'审核中',hgAudit:'审核中'}
 ])if(!cpRows.some(r=>r.id===row.id))cpRows.unshift(row);
}
function cpTabs(){return `<div class="platform-tabs" role="tablist" aria-label="发布平台">${PUBLISH_PLATFORMS.map(p=>`<button role="tab" aria-selected="${p===CP_PLATFORM}" data-action="platform" data-value="${p}" class="platform-tab ${p===CP_PLATFORM?'active':''}">${platformLabel(p)}</button>`).join('')}</div>`}
function cpMatches(r,f=cpState.filters){
 const c=cpContent(r),includes=(value,query)=>String(value||'').toLowerCase().includes(query.trim().toLowerCase());
 return includes(r.asset.name,f.asset)&&includes(c?.name,f.drama)&&(!f.contentId||c?.id===f.contentId.trim()||cpNumericContentId(c)===f.contentId.trim())&&(!f.type||c?.type===f.type)&&(!f.materialType||r.materialType===f.materialType)&&(!f.dyAccount||r.dyAccount===f.dyAccount)&&(!f.hgAccount||r.hgAccount===f.hgAccount)&&(!f.audit||['dy','hg'].some(end=>cpAudit(r,end)===f.audit));
}
function cpFilterForm(){
 const f=cpState.filters,opts=(list,value)=>'<option value="">全部</option>'+list.map(x=>{const [v,label]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}" ${value===v?'selected':''}>${esc(label)}</option>`}).join('');
 const select=(name,label,list)=>`<label>${label}<select name="${name}" aria-label="${label}">${opts(list,f[name])}</select></label>`;
 const input=(name,label,placeholder)=>`<label>${label}<input name="${name}" aria-label="${label}" value="${esc(f[name])}" placeholder="${placeholder}"></label>`;
 return `<form id="cpFilters" class="cp-filter-grid"><label>当前身份<select id="cpIdentity" aria-label="当前身份">${CP_IDENTITIES.map(x=>`<option ${cpState.identity===x?'selected':''}>${x}</option>`).join('')}</select></label>${input('asset','素材名称','请输入素材名称')}${input('drama','短剧名称','请输入短剧名称')}${input('contentId','短剧ID','请输入数字短剧ID')}${select('type','关联类型',Object.keys(CP_TYPES))}${select('materialType','素材类型',f.type?CP_TYPES[f.type]:[...new Set(Object.values(CP_TYPES).flat())])}${select('dyAccount','抖音发布账号',accounts.filter(a=>a.platform==='抖音').map(a=>[a.id,a.name]))}${select('hgAccount','红果发布账号',CP_HG_ACCOUNTS.map(a=>[a.id,a.name]))}${select('audit','审核状态',CP_AUDITS)}<div class="cp-filter-actions"><button class="btn primary" type="submit">搜索</button><button class="btn" type="button" data-action="cp-reset">重置</button></div></form>`;
}
function cpAuditCell(r,isDraft=false){
 if(isDraft)return '<span class="cell-sub">—（未提审）</span>';
 return ['dy','hg'].map(end=>{const audit=cpAudit(r,end),reason=r[end+'Reason'],label=end==='dy'?'抖音':'红果';return `<div class="cp-audit-line"><span>${label}</span>${audit?`<span class="status ${audit==='审核成功'?'green':audit==='审核失败'?'red':'orange'}">${audit}</span>`:`<span class="cell-sub">—（${esc(r[end+'Status']||'未提审')}）</span>`}</div>${audit==='审核失败'?`<details class="cp-failure"><summary>${label}失败原因</summary><p>${esc(reason||'平台暂未返回具体原因')}</p></details>`:''}`}).join('');
}
function cpEndAuditCell(r,end){
 const audit=cpAudit(r,end),raw=r[end+'Status'],pending=['待投稿','待分发'].includes(raw),label=audit||(pending?'待投稿':'—'),color=audit==='审核成功'?'green':audit==='审核失败'?'red':audit==='审核中'?'orange':'gray';
 return `<span class="status ${color}">${esc(label)}</span>${audit==='审核失败'?`<details class="cp-failure"><summary>${end==='dy'?'抖音':'红果'}失败原因</summary><p>${esc(r[end+'Reason']||'平台暂未返回具体原因')}</p></details>`:''}`;
}
function cpPublishState(r,end){
 const status=r[end+'Status'];
 if(['已发布','发布中','发布失败','已删除'].includes(status))return status;
 if(cpAudit(r,end)==='审核失败'||['审核不通过','审核失败'].includes(status))return '未发布';
 if(['待投稿','待分发','审核中','待发布'].includes(status))return '待发布';
 return '—';
}
// Only built-in sample rows have a known historical submission time. Other legacy rows remain unknown.
function cpSubmittedAt(r){return r.submittedAt||(/^CP-(DEMO-|V23-)/.test(r.id)?r.created:'')||''}
function cpTableCell(key,r,isDraft){
 const c=cpContent(r),text=v=>`<div class="list-text" title="${esc(v||'—')}">${esc(v||'—')}</div>`;
 if(key==='materialInfo')return `<div class="cp-material-info"><img class="cp-list-cover" src="${esc(r.cover||demoCover(c?.name||'素材封面'))}" alt="素材封面"><div class="cp-material-meta">${text(r.materialTitle||r.asset.name)}<span class="cell-sub">时长：${esc(r.asset.duration||'—')}</span></div></div>`;
 if(key==='relatedContent')return text(c?c.type+'：'+c.name:'—')+(c?`<span class="cell-sub cp-id" title="${esc(cpNumericContentId(c)||'—')}">短剧ID：${esc(cpNumericContentId(c)||'—')}</span>`:'');
 if(key==='submittedAt')return `<span class="cp-submitted-at">${esc(cpSubmittedAt(r)||'—')}</span>`;
 if(key==='dyAudit'||key==='hgAudit')return cpEndAuditCell(r,key.slice(0,2));
 if(key==='dyPublish'||key==='hgPublish'){const end=key.slice(0,2),value=cpPublishState(r,end);return `<span class="cp-publish-state ${value==='发布失败'?'exception':''}" title="${esc(r[end+'Status']==='待投稿'?'关联内容待上架后自动投稿':value)}">${esc(value)}</span>`;}
 if(key==='asset')return text(r.asset.name);
 if(key==='drama')return text(c?.name)+(c?`<span class="cell-sub">${esc(c.id)}</span>`:'');
 if(key==='type')return text(c?.type||r.type);
 if(key==='dyAccount')return text(account(r.dyAccount)?.name);
 if(key==='hgAccount')return text(CP_HG_ACCOUNTS.find(a=>a.id===r.hgAccount)?.name);
 if(key==='anchor'&&isDraft&&(r.type||c?.type)!=='线索')return '—';
 if(['anchor','ai'].includes(key))return typeof r[key]==='boolean'?(r[key]?'是':'否'):'—';
 if(key==='audit')return cpAuditCell(r,isDraft);
 return text(r[key]);
}
function renderCPTable(list,isDraft=false){
 const d=cpState.draft,w=state.wizard,selected=isDraft?(w?.aiSelections?.[CP_PLATFORM]||[]):[],columns=isDraft?CP_COLUMNS:CP_LIST_COLUMNS;
 return `<div class="table-wrap cp-unified-wrap ${isDraft?'':'cp-management-wrap'}"><table class="data-table cp-unified-table ${isDraft?'':'cp-management-table'}" style="min-width:${columns.reduce((sum,c)=>sum+c[2],isDraft?256:90)}px"><colgroup>${isDraft?'<col style="width:38px">':''}${columns.map(c=>`<col style="width:${c[2]}px">`).join('')}<col style="width:${isDraft?218:90}px"></colgroup><thead><tr>${isDraft?`<th><input type="checkbox" data-ai-all="${CP_PLATFORM}" aria-label="勾选全部版权中台素材" ${list.length&&list.every(r=>selected.includes(r.asset.id))?'checked':''}></th>`:''}${columns.map(c=>`<th>${c[1]}</th>`).join('')}<th class="action-col">操作</th></tr></thead><tbody>${list.map(r=>{const reason=isDraft?'':cpEditReason(r),error=isDraft&&r.configured?cpItemError(r.asset,r,d.identity):'';return `<tr>${isDraft?`<td><input type="checkbox" data-ai-asset="${r.asset.id}" data-ai-platform="${CP_PLATFORM}" aria-label="勾选版权中台 ${esc(r.asset.name)}" ${selected.includes(r.asset.id)?'checked':''}></td>`:''}${columns.map(c=>`<td>${cpTableCell(c[0],r,isDraft)}</td>`).join('')}<td class="action-col"><div class="ops"><button class="link-button" data-action="${isDraft?'cp-edit-draft':'cp-edit'}" data-id="${isDraft?r.asset.id:r.id}" ${reason?'disabled':''} title="${esc(reason)}">${isDraft?'编辑素材':'编辑'}</button>${isDraft?`<button class="link-button" data-action="cp-sync-draft" data-id="${r.asset.id}" ${r.configured?'':'disabled'} title="${r.configured?'':'请先编辑并保存当前素材信息'}">同步信息</button><button class="link-button danger" data-action="cp-remove-asset" data-id="${r.asset.id}">移除</button>`:''}</div>${error?`<span class="cell-sub exception">${esc(error)}</span>`:''}</td></tr>`}).join('')||`<tr><td class="empty" colspan="${columns.length+(isDraft?2:1)}">暂无符合条件的素材</td></tr>`}</tbody></table></div>`;
}
function renderCopyright(){
 if(cpState.mode==='upload')return renderCPUpload();
 const list=cpVisible().filter(r=>cpMatches(r));
 return `<section class="filter-card">${cpTabs()}${cpFilterForm()}</section><section class="list-panel"><div class="list-toolbar"><button class="btn primary" data-action="cp-upload">＋ 新增发视频</button>${draft?.platforms?.includes(CP_PLATFORM)?'<button class="btn" data-action="resume">继续草稿</button>':''}</div>${renderCPTable(list)}<div class="pagination"><span>共 ${list.length} 条</span></div></section>`;
}
function cpNewDraft(){return {step:1,assets:[],items:{}}}
function cpNewMaterialInfo(){return {schema:23,type:'正片',content:'',materialType:'花絮',dyAccount:'',hgAccount:'',ai:null,anchor:null,dyTitle:'',hgTitle:'',topics:[],cover:demoCover('推剧素材'),configured:false}}
function cpAddDraftAssets(d,ids){let count=0;for(const a of OSS_FILES.filter(a=>ids.includes(a.id)&&a.availability==='可用')){if(d.assets.some(x=>x.id===a.id))continue;d.assets.push({...a});d.items[a.id]=cpNewMaterialInfo();count++}return count}
function cpRemoveDraftAsset(d,id){d.assets=d.assets.filter(a=>a.id!==id);delete d.items[id];if(!d.assets.length)d.step=1}
function cpSourceError(a){return !OSS_FILES.some(f=>f.id===a.id&&f.availability==='可用'&&f.ossVersion===a.ossVersion)?'素材不可用或版本已更新，请重新选择':''}
function cpItemError(a,item,identity=cpState.identity){
 const c=CP_CONTENTS.find(x=>x.id===item?.content),sourceError=cpSourceError(a);
 if(sourceError)return sourceError;
 if(!c||c.type!==item.type)return '请选择对应的关联内容';
 if(!CP_TYPES[item.type]?.includes(item.materialType))return '请选择对应素材类型';
 if(!account(item.dyAccount)?.ok||account(item.dyAccount)?.platform!=='抖音'||!CP_HG_ACCOUNTS.some(a=>a.id===item.hgAccount))return '请配置有效的抖音账号与红果厂牌账号';
 if(item.type==='正片'&&item.dyAccount!==c.dyAccount)return '正片发布账号不可更换';
 if(cpRows.some(r=>r.identity===identity&&r.content===item.content&&r.asset.id===a.id))return '已存在于此短剧素材管理，请勿重复上传';
 if(!item.dyTitle?.trim()||!item.hgTitle?.trim())return '请填写抖音和红果视频标题';
 if(/[#@]/.test(item.hgTitle))return '红果标题不支持自由创建话题或@，请从已有话题中选择';
 if(!item.cover)return '请选择素材封面';
 if(typeof item.ai!=='boolean')return '请选择是否AI作品';
 if(item.type==='线索'&&typeof item.anchor!=='boolean')return '请选择是否挂载锚点';
 return '';
}
function renderCPMaterialList(){const d=cpState.draft;return renderCPTable(d.assets.map(a=>({...d.items[a.id],asset:a})),true)}
// Retained helpers for stored drafts; new entries use the shared four-platform wizard.
function renderCPUpload(){const d=cpState.draft;return d.step===1?`<button data-action="cp-next-step">下一步</button><div id="cpError"></div>`:renderCPMaterialList()}
function cpNextStep(){const d=cpState.draft;if(!d.assets.length){$('#cpError').textContent='请先从 OSS 文件库选择素材';return}const bad=d.assets.find(cpSourceError);if(bad){$('#cpError').textContent=cpSourceError(bad);return}d.step=2;render()}
function cpDraftError(d){if(!d.assets.length)return '请先从 OSS 文件库选择素材';for(const a of d.assets){const error=cpItemError(a,d.items[a.id],d.identity);if(error)return a.name+'：'+error}return ''}
const cpField=(label,html,required=false)=>`<div class="native-form-field"><label class="native-form-label ${required?'required':''}">${label}</label><div class="native-form-control">${html}</div></div>`;
function cpBooleanField(key,prompt,item,disabled=false){if(key==='anchor'&&(item.type||cpContent(item)?.type)!=='线索')return '';return cpField(prompt,`<div class="native-publish-radios" role="radiogroup" aria-label="${prompt}" aria-required="true">${[true,false].map(value=>`<label class="radio-label"><input type="radio" name="cp-${key}" data-cp-boolean="${key}" value="${value}" ${item[key]===value?'checked':''} ${disabled?'disabled':''}>${value?'是':'否'}</label>`).join('')}</div>`,true)}
let cpMaterialEditor=null;
function cpOpenDraftEditor(id){
 const d=cpState.draft,asset=d?.assets.find(a=>a.id===id);if(!asset||d.step!==2)return;
 materialEditor=null;cpMaterialEditor={draft:d,asset,item:JSON.parse(JSON.stringify(d.items[id])),pickerOpen:false,query:'',active:-1};renderCPDraftEditor();
}
function cpPickerCandidates(){const e=cpMaterialEditor;return CP_CONTENTS.filter(c=>c.type===e.item.type&&(c.name+' '+c.id).toLowerCase().includes(e.query.trim().toLowerCase()))}
function cpPickContent(id){const e=cpMaterialEditor,c=CP_CONTENTS.find(c=>c.id===id&&c.type===e.item.type);if(!c)return;e.item.content=c.id;if(e.item.type==='正片')e.item.dyAccount=c.dyAccount;e.query='';e.pickerOpen=false;renderCPDraftEditor();$('#cpContentSearch').focus();e.pickerOpen=false;cpUpdatePicker()}
function cpPickerHTML(){const e=cpMaterialEditor,c=cpContent(e.item);return `<div class="cp-search-select"><input id="cpContentSearch" role="combobox" aria-label="关联${e.item.type}" aria-autocomplete="list" aria-expanded="false" aria-controls="cpContentOptions" placeholder="请输入ID/名称搜索" autocomplete="off" value="${esc(c?c.name+' · '+c.id:'')}"><button type="button" class="cp-clear-content" data-action="cp-clear-content" aria-label="清空关联内容" ${c?'':'hidden'}>×</button><span class="cp-search-icon" aria-hidden="true">⌕</span><div id="cpContentOptions" class="cp-content-options" role="listbox" aria-label="关联内容候选" hidden></div></div>`}
function cpUpdatePicker(){
 const e=cpMaterialEditor,input=$('#cpContentSearch'),box=$('#cpContentOptions');if(!e||!input||!box)return;
 input.setAttribute('aria-expanded',String(e.pickerOpen));box.hidden=!e.pickerOpen;
 const items=cpPickerCandidates();box.innerHTML=items.map((c,i)=>`<button type="button" id="cp-candidate-${i}" role="option" aria-selected="${e.item.content===c.id}" data-action="cp-pick-content" data-id="${c.id}" class="cp-content-option ${e.active===i?'active':''}"><img src="${demoCover(c.name)}" alt=""><span><strong>${esc(c.name)}</strong><small>${c.type} · ID：${c.id}</small></span>${e.item.content===c.id?'<span class="cp-picked">✓</span>':''}</button>`).join('')||'<div class="cp-picker-empty">未找到匹配短剧，请更换名称或ID</div>';
 if(e.active>=0&&items[e.active])input.setAttribute('aria-activedescendant','cp-candidate-'+e.active);else input.removeAttribute('aria-activedescendant');
}
function renderCPDraftEditor(){
 const e=cpMaterialEditor,{asset,item}=e;
 modal('编辑素材信息',`<div class="cp-edit-asset-name">${esc(asset.name)}</div><form class="native-material-form cp-draft-editor" onsubmit="return false">${cpField('关联类型',`<div class="native-publish-radios">${Object.keys(CP_TYPES).map(t=>`<label class="radio-label"><input type="radio" name="cpDraftType" data-cp-editor="type" value="${t}" ${item.type===t?'checked':''}>${t}</label>`).join('')}</div>`,true)}${cpField('关联'+item.type,cpPickerHTML(),true)}${cpField('素材类型',`<select data-cp-editor="materialType" aria-label="素材类型">${CP_TYPES[item.type].map(t=>`<option ${item.materialType===t?'selected':''}>${t}</option>`).join('')}</select>`,true)}${cpField('抖音发布账号',`<select data-cp-editor="dyAccount" aria-label="抖音发布账号" ${item.type==='正片'?'disabled':''}><option value="">${item.type==='正片'?'选择正片后自动带入':'请选择发布账号'}</option>${accounts.filter(a=>a.platform==='抖音'&&a.ok).map(a=>`<option value="${a.id}" ${item.dyAccount===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}</select>`,true)}${cpField('红果厂牌账号',`<select data-cp-editor="hgAccount" aria-label="红果厂牌账号"><option value="">请选择厂牌账号</option>${CP_HG_ACCOUNTS.map(a=>`<option value="${a.id}" ${item.hgAccount===a.id?'selected':''}>${a.name}</option>`).join('')}</select>`,true)}${cpField('视频封面',`<div class="cp-draft-cover"><img src="${item.cover}" alt="素材封面"><label class="link-button">更换封面<input type="file" accept="image/*" id="cpDraftCover" aria-label="更换封面"></label></div>`,true)}${cpField('抖音视频标题',`<textarea data-cp-editor="dyTitle" aria-label="抖音视频标题" placeholder="支持话题和 @">${esc(item.dyTitle)}</textarea>`,true)}${cpField('红果视频标题',`<textarea data-cp-editor="hgTitle" aria-label="红果视频标题" placeholder="请输入红果视频标题">${esc(item.hgTitle)}</textarea><div class="cp-topic-options">${CP_TOPICS.map(t=>`<label><input type="checkbox" data-cp-editor-topic="${t}" ${item.topics.includes(t)?'checked':''}>#${t}</label>`).join('')}</div>`,true)}${cpBooleanField('ai','是否AI作品',item)}${cpBooleanField('anchor','是否挂载锚点',item)}<div id="modalError" class="inline-error" role="alert"></div></form>`,`<button class="btn" data-action="close-modal">取 消</button><button class="btn primary" data-action="cp-save-draft-editor">确 定</button>`,'native-material-modal cp-material-modal');
 const input=$('#cpContentSearch');input.onfocus=()=>{e.pickerOpen=true;e.query='';e.active=-1;cpUpdatePicker()};
 input.oninput=()=>{e.query=input.value;e.pickerOpen=true;e.active=-1;e.item.content='';if(e.item.type==='正片'){e.item.dyAccount='';$('[data-cp-editor="dyAccount"]').value=''}$('.cp-clear-content').hidden=false;cpUpdatePicker()};
 input.onkeydown=event=>{if(['ArrowDown','ArrowUp','Enter','Escape'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Escape'){e.pickerOpen=false;cpUpdatePicker();return}const items=cpPickerCandidates();if(event.key==='Enter'){if(e.active>=0&&items[e.active])cpPickContent(items[e.active].id);return}e.pickerOpen=true;e.active=Math.max(0,Math.min(items.length-1,e.active+(event.key==='ArrowDown'?1:-1)));cpUpdatePicker()}};
}
function cpSaveDraftEditor(){const e=cpMaterialEditor;if(!e||e.draft!==cpState.draft||!e.draft.assets.some(a=>a.id===e.asset.id))return;const error=cpItemError(e.asset,e.item,e.draft.identity);if(error){$('#modalError').textContent=error;$('#modalError').scrollIntoView({block:'nearest'});return}e.draft.items[e.asset.id]={...JSON.parse(JSON.stringify(e.item)),configured:true};closeModal();render();toast('素材信息已保存')}
function cpEditorChange(t){
 const e=cpMaterialEditor;if(!e||e.record)return;const item=e.item,key=t.dataset.cpEditor;
 if(key){if(t.type==='radio'&&!t.checked)return;item[key]=t.value;if(key==='type'){item.content='';item.dyAccount='';item.anchor=null;item.materialType=CP_TYPES[item.type][0];e.query='';e.pickerOpen=false;renderCPDraftEditor()}else if(key==='content'){const c=cpContent(item);if(item.type==='正片')item.dyAccount=c?.dyAccount||'';renderCPDraftEditor()}return}
 if(t.dataset.cpBoolean&&t.checked)item[t.dataset.cpBoolean]=t.value==='true';
 if(t.dataset.cpEditorTopic)item.topics=t.checked?[...new Set([...item.topics,t.dataset.cpEditorTopic])]:item.topics.filter(x=>x!==t.dataset.cpEditorTopic);
 if(t.id==='cpDraftCover'){const f=t.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){$('#modalError').textContent='请选择封面图片';return}const reader=new FileReader();reader.onload=()=>{if(cpMaterialEditor!==e)return;item.cover=reader.result;renderCPDraftEditor()};reader.readAsDataURL(f)}
}
const cpPreviousCloseModal=closeModal;closeModal=function(){cpMaterialEditor=null;cpPreviousCloseModal()};
function cpDistributionError(selected){
 const reservations={};for(const r of selected){const c=cpContent(r);if(!cpCanSee(r))return '当前身份无权分发该素材';if(r.dyStatus!=='待分发'||r.hgStatus!=='待分发')return '请选择双端均为待分发的素材，避免重复投稿';if(!c?.dyOnline&&!c?.hgOnline)return (c?.name||'关联内容')+'：抖音和红果均未上架，暂不能提交';if(!account(r.dyAccount)?.ok)return '抖音发布账号授权失效';const key=r.identity+'::'+r.content;reservations[key]=(reservations[key]||0)+1;const pending=cpRows.filter(x=>x.identity===r.identity&&x.content===r.content&&!x.counted&&['dy','hg'].some(end=>cpAudit(x,end)==='审核中')).length;if(cpQuotaUsed(r.content,r.identity)+pending+reservations[key]>cpQuotaLimit(c.type))return c.name+'：超过'+cpQuotaLimit(c.type)+'条的限额';}return '';
}
function cpBeginReview(records,endsForRow=()=>['dy','hg']){
 for(const r of records){const ends=endsForRow(r);r.submittedAt ||= cpSubmittedAt(r)||shanghaiTime();r.reviewEnds=ends;r.reviewDue=Date.now()+1800;for(const end of ends){r[end+'Audit']='审核中';r[end+'Status']='审核中';r[end+'Reason']=''}}cpPersist();
 setTimeout(()=>{cpFinishReviews();if(state.platform===CP_PLATFORM||state.page==='batch')render()},1900);
}
function cpFinishReviews(){for(const r of cpRows){if(!r.reviewDue||r.reviewDue>Date.now())continue;const c=cpContent(r);for(const end of r.reviewEnds||[]){r[end+'Audit']='审核成功';r[end+'Status']=end==='dy'&&!c?.dyOnline?'待投稿':'已发布'}if([r.dyStatus,r.hgStatus].includes('已发布'))r.counted=true;delete r.reviewDue;delete r.reviewEnds}cpPersist()}
function cpSaveUpload(){const d=cpState.draft,error=cpDraftError(d);if(error){$('#cpError').textContent=error;return}const records=d.assets.map((asset,i)=>({...d.items[asset.id],id:'CP'+Date.now()+'-'+i,identity:d.identity||cpState.identity,asset,owner:'当前运营',initialAnchor:d.items[asset.id].anchor,dyStatus:'待分发',hgStatus:'待分发',edits:0,counted:false,created:shanghaiTime()}));const issue=cpDistributionError(records);if(issue){$('#cpError').textContent=issue;return}cpRows.unshift(...records);cpBeginReview(records);cpState.mode='list';cpState.draft=null;render()}
function cpResubmit(r,patch){
 const error=cpEditReason(r);if(error)return error;
 const ends=cpFailedEnds(r),both=ends.length===2,c=cpContent(r);
 if(!account(r.dyAccount)?.ok)return '抖音发布账号授权失效，请先恢复授权';
 if(!c||!c.dyOnline&&!c.hgOnline)return '关联内容未上架，暂不能重新提审';
 const pending=cpRows.filter(x=>x!==r&&x.identity===r.identity&&x.content===r.content&&!x.counted&&['dy','hg'].some(end=>cpAudit(x,end)==='审核中')).length;
 if(!r.counted&&cpQuotaUsed(r.content,r.identity)+pending+1>cpQuotaLimit(c.type))return '该短剧可用素材名额不足';
 for(const end of ends)if(!String(patch[end+'Title']??r[end+'Title']).trim())return '请填写失败端的视频标题';
 if(ends.includes('hg')&&/[#@]/.test(patch.hgTitle??r.hgTitle))return '红果话题请从已有选项选择';
 for(const end of ends)r[end+'Title']=String(patch[end+'Title']??r[end+'Title']).trim();
 if(ends.includes('hg')&&patch.topics)r.topics=patch.topics;
 if(both){for(const key of ['cover','ai'])if(patch[key]!==undefined)r[key]=patch[key];if(c.type==='线索'&&typeof patch.anchor==='boolean')r.anchor=r.anchor&&patch.anchor}
 r.edits++;cpBeginReview([r],()=>ends);return '';
}
function cpOpenEdit(id){
 const r=cpRows.find(r=>r.id===id);if(!r)return;const error=cpEditReason(r);if(error)return toast(error,true);
 const ends=cpFailedEnds(r),both=ends.length===2,item=JSON.parse(JSON.stringify(r));materialEditor=null;
 modal('编辑并重新提审',`<div class="cp-edit-fixed">${esc(r.asset.name)}<span class="cell-sub">${esc(cpContent(r)?.name)} · ${cpContent(r)?.type}</span></div><p class="inline-note">${both?'修改后重新提审。':'仅修改并重新提审失败端；已成功端的信息保持原样。'} 剩余 ${5-r.edits} 次修改机会。</p><form class="native-material-form cp-retry-form" onsubmit="return false">${cpField('抖音视频标题',`<textarea id="cpEditDY" aria-label="抖音视频标题" ${ends.includes('dy')?'':'disabled'}>${esc(r.dyTitle)}</textarea>`,true)}${cpField('红果视频标题',`<textarea id="cpEditHG" aria-label="红果视频标题" ${ends.includes('hg')?'':'disabled'}>${esc(r.hgTitle)}</textarea><div class="cp-topic-options">${CP_TOPICS.map(t=>`<label><input type="checkbox" name="cpRetryTopic" value="${t}" ${r.topics.includes(t)?'checked':''} ${ends.includes('hg')?'':'disabled'}>#${t}</label>`).join('')}</div>`,true)}${cpField('视频封面',`<div class="cp-draft-cover"><img id="cpEditCoverPreview" src="${r.cover}" alt="素材封面"><label class="link-button">更换封面<input id="cpEditCover" aria-label="更换封面" type="file" accept="image/*" ${both?'':'disabled'}></label></div>`,true)}${cpBooleanField('ai','是否AI作品',r,!both)}${cpBooleanField('anchor','是否挂载锚点',r,!both||!r.anchor)}<div id="modalError" class="inline-error" role="alert"></div></form>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="cpSaveEdit">重新提审</button>`,'native-material-modal cp-material-modal');
 $('#cpEditCover').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){$('#modalError').textContent='请选择封面图片';return}const reader=new FileReader();reader.onload=()=>{item.cover=reader.result;$('#cpEditCoverPreview').src=item.cover};reader.readAsDataURL(f)};
 $('#cpSaveEdit').onclick=()=>{const patch={dyTitle:$('#cpEditDY').value,hgTitle:$('#cpEditHG').value,topics:$$('[name=cpRetryTopic]:checked').map(el=>el.value),cover:item.cover,ai:$('[name="cp-ai"]:checked')?.value==='true',anchor:$('[name="cp-anchor"]:checked')?.value==='true'},error=cpResubmit(r,patch);if(error){$('#modalError').textContent=error;return}closeModal();render();toast('已重新提审')};
}
const originalRenderList=renderList;renderList=function(){return state.platform===CP_PLATFORM?renderCopyright():originalRenderList()};
Object.assign(actions,{
 'cp-reset':()=>{cpState.filters=emptyCPFilters();render()},
 'cp-upload':()=>{cpState.draft=cpNewDraft();cpState.mode='upload';render()},
 'cp-next-step':cpNextStep,'cp-previous-step':()=>{cpState.draft.step=1;render()},
 'cp-edit-draft':el=>cpOpenDraftEditor(el.dataset.id),'cp-save-draft-editor':cpSaveDraftEditor,
 'cp-pick-content':el=>cpPickContent(el.dataset.id),
 'cp-clear-content':()=>{const e=cpMaterialEditor;e.item.content='';if(e.item.type==='正片')e.item.dyAccount='';e.query='';e.pickerOpen=false;renderCPDraftEditor();$('#cpContentSearch').focus()},
 'cp-remove-asset':el=>{cpRemoveDraftAsset(cpState.draft,el.dataset.id);render()},'cp-edit':el=>cpOpenEdit(el.dataset.id)
});
document.addEventListener('submit',e=>{if(e.target.id!=='cpFilters')return;e.preventDefault();cpState.filters={...emptyCPFilters(),...Object.fromEntries(new FormData(e.target))};render()});
document.addEventListener('change',e=>{const t=e.target;cpEditorChange(t);if(t.id==='cpIdentity'){cpState.identity=t.value;cpState.filters=emptyCPFilters();render()}if(t.name==='type'&&t.closest('#cpFilters')){const allowed=t.value?CP_TYPES[t.value]:[...new Set(Object.values(CP_TYPES).flat())],select=$('#cpFilters [name="materialType"]'),value=select.value;select.innerHTML='<option value="">全部</option>'+allowed.map(x=>`<option ${value===x?'selected':''}>${x}</option>`).join('')}});
document.addEventListener('input',e=>{if(e.target.dataset.cpEditor&&e.target.tagName!=='SELECT'&&e.target.type!=='radio')cpEditorChange(e.target)});
document.addEventListener('click',e=>{if(cpMaterialEditor?.pickerOpen&&!e.target.closest('.cp-search-select')){cpMaterialEditor.pickerOpen=false;cpUpdatePicker()}});
cpFinishReviews();for(const r of cpRows.filter(r=>r.reviewDue))setTimeout(()=>{cpFinishReviews();if(state.platform===CP_PLATFORM)render()},Math.max(0,r.reviewDue-Date.now()+30));
render();cpPersist();
