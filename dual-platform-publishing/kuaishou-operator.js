'use strict';
// Operator clips have separate fields and storage from creator-account publishing.
const KM_STORE='publishing-kuaishou-operator-v1';
const KM_TYPES=['高光','花絮'];
const KM_DECLARATIONS=['内容无需添加声明（作品不涉及AI生成）','含AI生成内容'];
const KM_STATUSES=['发布中','已发布','发布失败'];
const kmAccounts=()=>accounts.filter(a=>a.platform==='快手'&&a.entry==='operator');
for(const a of [
 {id:'km01',platform:'快手',entry:'operator',name:'星河短剧经管号',group:'经管平台',owner:'运营一组',ok:true},
 {id:'km02',platform:'快手',entry:'operator',name:'晚风短剧经管号',group:'经管平台',owner:'运营二组',ok:true},
 {id:'km03',platform:'快手',entry:'operator',name:'青禾短剧经管号',group:'经管平台',owner:'运营二组',ok:false}
])if(!account(a.id))accounts.push(a);
// Example mappings use platform-specific IDs; collection IDs are never submitted as platform IDs.
const KM_CATALOG=['km01','km02','km03'].flatMap((id,i)=>DRAMAS.slice(0,i===1?2:3).map((d,j)=>({account:id,collectionId:d.id,id:'78645000'+i+'0'+(j+1),name:d.name})));
function kmSourceDrama(asset){
 const ids=[...new Set(asset.name.replace(/\.[^.]+$/,'').match(/(?<!\d)\d{5,}(?!\d)/g)||[])];
 return ids.length===1?drama(ids[0]):null;
}
const kmTarget=(asset,id)=>KM_CATALOG.find(t=>t.account===id&&t.collectionId===kmSourceDrama(asset)?.id);
let kmRows=[];
try{kmRows=JSON.parse(localStorage.getItem(KM_STORE)||'null')?.rows||null}catch(_){kmRows=null}
if(!kmRows)kmRows=[0,1,2].map((n)=>{const asset={...OSS_FILES[n===2?5:n]},id=n===1?'km02':'km01',target=kmTarget(asset,id);return {id:'KM-DEMO-'+n,batch:'KM-DEMO',asset,account:id,dramaId:target?.id||'',dramaName:target?.name||'',title:['长街重逢，他却不记得她','花店开张，故事才刚刚开始','逆光而来的她从不退缩'][n],clipType:n===1?'花絮':'高光',declaration:n===2?1:0,status:n===2?'发布失败':'已发布',reason:n===2?'标题与视频内容不符，请核对素材信息':'',publishedAt:n===2?'':'2026-10-19 10:0'+n,created:'2026-10-19 10:0'+n,submittedAt:'2026-10-19 10:0'+n,cover:demoCover(target?.name||'视频第一帧')}});
// Older rows were created when submitted; missing historical timestamps stay empty.
const kmSubmittedAt=r=>r.submittedAt||r.created||'';
const kmPersist=()=>localStorage.setItem(KM_STORE,JSON.stringify({rows:kmRows}));
const emptyKMFilters=()=>({account:'',material:'',status:'',start:'',end:'',drama:'',dramaId:'',type:''});
let kmFilters=emptyKMFilters();
const kmDraft=w=>{const d=w.kuaishouOperator ||= {assignments:{},configs:{}};d.assetTitles ||= {};return d};
const kmKey=(assetId,id)=>assetId+'::'+id;
const kmConfig=(w,assetId,id)=>{const d=kmDraft(w),base=d.configs[kmKey(assetId,'')]||{};return {clipType:'',declaration:null,...base,title:d.assetTitles[assetId]??base.title??'',...(id?d.configs[kmKey(assetId,id)]:{})}};
function kmClearAsset(w,id){kmSetAccounts(w,id,[]);delete kmDraft(w).assetTitles[id];delete kmDraft(w).configs[kmKey(id,'')];if(w.aiSelections?.[KM_PLATFORM])w.aiSelections[KM_PLATFORM]=w.aiSelections[KM_PLATFORM].filter(value=>value!==id)}
function kmSetAccounts(w,assetId,ids){
 const d=kmDraft(w),previous=d.assignments[assetId]||[];
 d.assignments[assetId]=ids.filter(id=>kmAccounts().some(a=>a.id===id&&a.ok));
 for(const id of previous)if(!d.assignments[assetId].includes(id))delete d.configs[kmKey(assetId,id)];
}
function applyKMMaterialSync(w,assetId,id,selected){
 const d=kmDraft(w),assets=platformAssets(w,KM_PLATFORM);
 if(!assets.some(a=>a.id===assetId)||!(d.assignments[assetId]||[]).includes(id))return 0;
 const source=kmConfig(w,assetId,id),copy={title:source.title,clipType:source.clipType,declaration:source.declaration};
 let count=0;
 for(const asset of assets){
  if(!selected.has(asset.id))continue;
  // Account assignments and account-specific drama IDs stay with each destination.
  d.assetTitles[asset.id]=copy.title;d.configs[kmKey(asset.id,'')]={...copy};
  for(const accountId of d.assignments[asset.id]||[]){
   if(asset.id===assetId&&accountId===id)continue;
   d.configs[kmKey(asset.id,accountId)]={...kmConfig(w,asset.id,accountId),...copy};
  }
  count++;
 }
 return count;
}
function openKMMaterialSync(assetId,id){
 const w=state.wizard;
 if(!(kmDraft(w).assignments[assetId]||[]).includes(id))return toast('请先选择快手号',true);
 openMaterialSyncDialog(platformAssets(w,KM_PLATFORM),selected=>applyKMMaterialSync(w,assetId,id,selected));
}
function kmConfigError(c){
 if(!c.title?.trim())return '请填写剪辑标题';
 if([...c.title.trim()].length>20)return '剪辑标题不能超过20字';
 if(!KM_TYPES.includes(c.clipType))return '请选择剪辑类型';
 if(![0,1].includes(c.declaration))return '请选择作者声明';
 return '';
}
function kmUnits(w){
 if(!w?.platforms.includes(KM_PLATFORM))return [];
 const d=kmDraft(w);
 return platformAssets(w,KM_PLATFORM).flatMap(asset=>{
  const ids=d.assignments[asset.id]||[];
  return (ids.length?ids:['']).map(id=>{
   const ac=account(id),target=kmTarget(asset,id),c=kmConfig(w,asset.id,id);
   const sourceError=!OSS_FILES.some(f=>f.id===asset.id&&f.ossVersion===asset.ossVersion&&f.availability==='可用');
   const error=sourceError?'素材不可用或版本已更新，请重新选择':!id?'请先选择快手号':!ac?.ok||ac.entry!=='operator'?'快手经管账号授权失效':!target?'未匹配到该账号下的短剧，请核对素材合集ID或更换账号':kmConfigError(c);
   return {platform:KM_PLATFORM,asset,account:id,target,config:{...c,hang:c.clipType},metadata:{},desc:c.title,time:'提交后发布',error};
  });
 });
}
const makeUnitsBeforeKM=makeUnits;
makeUnits=function(w=state.wizard){return !w?[]:[...makeUnitsBeforeKM({...w,platforms:w.platforms.filter(p=>p!==KM_PLATFORM)}),...kmUnits(w)]};
function kmMatches(r,f=kmFilters){
 const includes=(v,q)=>String(v||'').toLowerCase().includes(q.trim().toLowerCase());
 return includes(account(r.account)?.name,f.account)&&includes(r.asset.name,f.material)&&includes(r.dramaName,f.drama)&&(!f.dramaId||r.dramaId===f.dramaId.trim())&&(!f.type||r.clipType===f.type)&&(!f.status||r.status===f.status)&&(!f.start||r.publishedAt?.slice(0,10)>=f.start)&&(!f.end||r.publishedAt?.slice(0,10)<=f.end);
}
function kmFilterForm(){
 const f=kmFilters,input=(key,label,placeholder)=>`<label class="km-filter-field"><span>${label}</span><input name="${key}" aria-label="${label}" value="${esc(f[key])}" placeholder="${placeholder||'请输入'+label}"></label>`;
 const select=(key,label,options)=>`<label class="km-filter-field"><span>${label}</span><select name="${key}" aria-label="${label}"><option value="">全部</option>${options.map(v=>`<option ${f[key]===v?'selected':''}>${v}</option>`).join('')}</select></label>`;
 return `<form id="kmFilters" class="km-filter-grid">${input('account','快手号名称')}${input('material','素材名')}${select('status','发布状态',KM_STATUSES)}<div class="km-filter-field"><span>发布时间</span><div class="km-date-range"><input type="date" name="start" aria-label="发布时间开始" value="${esc(f.start)}"><span>至</span><input type="date" name="end" aria-label="发布时间结束" value="${esc(f.end)}"></div></div>${input('drama','短剧名称')}${input('dramaId','短剧ID','请输入完整短剧ID')}${select('type','剪辑类型',KM_TYPES)}<div class="km-filter-actions"><span id="kmFilterError" class="inline-error" role="alert"></span><button class="btn primary" type="submit">搜索</button><button class="btn" type="button" data-action="km-reset">重置</button></div></form>`;
}
function kmListTable(list){return `<div class="table-wrap"><table class="data-table km-list-table"><colgroup><col style="width:155px"><col style="width:230px"><col style="width:95px"><col style="width:155px"><col style="width:160px"><col style="width:230px"><col style="width:150px"><col style="width:180px"></colgroup><thead><tr>${['快手号','素材名','素材封面','短剧名称','短剧ID','剪辑标题','剪辑状态','提交发布时间'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${list.map(r=>`<tr><td>${esc(account(r.account)?.name||'—')}</td><td><div class="list-text" title="${esc(r.asset.name)}">${esc(r.asset.name)}</div></td><td><img class="material-cover-image" src="${esc(r.cover)}" alt="素材封面"></td><td>${esc(r.dramaName||'—')}</td><td class="km-id">${esc(r.dramaId||'—')}</td><td>${esc(r.title)}</td><td>${statusBadge(r.status)}${r.reason?`<details class="cp-failure"><summary>失败原因</summary><p>${esc(r.reason)}</p></details>`:''}</td><td><span class="cell-date">${esc(kmSubmittedAt(r)||'—')}</span></td></tr>`).join('')||'<tr><td colspan="8" class="empty">暂无符合条件的发布记录</td></tr>'}</tbody></table></div>`}
function renderKMList(){const list=kmRows.filter(r=>kmMatches(r));return `<section class="filter-card"><div class="platform-tabs" role="tablist" aria-label="发布平台">${PUBLISH_PLATFORMS.map(p=>`<button role="tab" aria-selected="${p===KM_PLATFORM}" data-action="platform" data-value="${p}" class="platform-tab ${p===KM_PLATFORM?'active':''}">${platformLabel(p)}</button>`).join('')}</div>${kmFilterForm()}</section><section class="list-panel"><div class="list-toolbar"><button class="btn primary" data-action="km-new">＋ 新增发视频</button>${draft?.platforms.includes(KM_PLATFORM)?'<button class="btn" data-action="resume">继续草稿</button>':''}</div>${kmListTable(list)}<div class="pagination"><span>共 ${list.length} 条</span></div></section>`}
const renderListBeforeKM=renderList;
renderList=function(){return state.platform===KM_PLATFORM?renderKMList():renderListBeforeKM()};
function renderKMSection(){
 const w=state.wizard,assets=platformAssets(w,KM_PLATFORM),units=kmUnits(w),open=!state.folded?.[KM_PLATFORM],selected=new Set(w.aiSelections?.[KM_PLATFORM]||[]);
 return `<section class="platform-section" data-platform-section="${KM_PLATFORM}"><h2><button class="platform-section-toggle" data-action="toggle-platform" data-platform="${KM_PLATFORM}" aria-expanded="${open}" aria-controls="kmPlatformBody"><span class="collapse-chevron ${open?'expanded':''}"><svg viewBox="0 0 20 20"><path d="m7 4 6 6-6 6"/></svg></span>${platformBadge(KM_PLATFORM)}<span class="section-stats">${assets.length} 份素材 · ${units.filter(u=>!u.error).length} 条配置完成</span><span class="fold-text">${open?'收起':'展开'}</span></button></h2><div class="platform-section-body" id="kmPlatformBody" ${open?'':'hidden'}><div class="config-toolbar">${renderPlatformAIControls(KM_PLATFORM)}<button class="btn small" data-action="km-assign-all" ${selectedPlatformAssets(w,KM_PLATFORM).length?'':'disabled'}>批量选择快手号</button><span class="subtle">先选择快手号，再编辑素材</span><button class="btn primary small" data-action="platform-library" data-platform="${KM_PLATFORM}">选择素材</button></div>${assets.length?`<div class="table-wrap"><table class="data-table km-config-table"><colgroup><col style="width:40px"><col style="width:210px"><col style="width:155px"><col style="width:190px"><col style="width:190px"><col style="width:90px"><col style="width:150px"><col style="width:218px"></colgroup><thead><tr><th><input type="checkbox" data-ai-all="${KM_PLATFORM}" aria-label="勾选全部快手经管平台素材" ${assets.every(a=>selected.has(a.id))?'checked':''}></th>${['素材名','快手号','短剧名称 / 短剧ID','剪辑标题','剪辑类型','作者声明','操作'].map(t=>`<th${t==='操作'?' class="action-col"':''}>${t}</th>`).join('')}</tr></thead><tbody>${units.map((u,i)=>`<tr>${i===0||units[i-1].asset.id!==u.asset.id?`<td class="km-asset-selection" rowspan="${units.filter(row=>row.asset.id===u.asset.id).length}"><input type="checkbox" data-ai-asset="${u.asset.id}" data-ai-platform="${KM_PLATFORM}" aria-label="勾选快手经管平台 ${esc(u.asset.name)}" ${selected.has(u.asset.id)?'checked':''}></td>`:''}<td><div class="list-text">${esc(u.asset.name)}</div></td><td><button class="link-button" data-action="km-assign" data-id="${u.asset.id}">${esc(account(u.account)?.name||'选择快手号')}</button></td><td>${esc(u.target?.name||'—')}<span class="cell-sub km-id">${esc(u.target?.id||'—')}</span>${u.account&&!u.target?'<span class="cell-sub exception">未匹配到短剧</span>':''}</td><td>${esc(u.config.title||'—')}</td><td>${esc(u.config.clipType||'—')}</td><td>${u.config.declaration===0?'作品不涉及AI生成':u.config.declaration===1?'含AI生成内容':'—'}</td><td class="action-col"><div class="ops"><button class="link-button" data-action="km-edit" data-id="${u.asset.id}" data-account="${u.account}" ${u.account?'':'disabled'}>编辑素材</button><button class="link-button" data-action="km-sync" data-id="${u.asset.id}" data-account="${u.account}" ${u.account?'':'disabled'}>同步信息</button><button class="link-button danger" data-action="km-remove" data-id="${u.asset.id}">移除</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="target-empty">暂未选择素材</div>'}</div></section>`;
}
const renderSectionBeforeKM=renderPlatformSection;
renderPlatformSection=function(p){return p===KM_PLATFORM?renderKMSection():renderSectionBeforeKM(p)};
function kmAssign(ids){
 const w=state.wizard,d=kmDraft(w),selected=ids.length===1?d.assignments[ids[0]]||[]:[];
 modal('选择快手号',`<p class="modal-copy">为 ${ids.length} 份素材选择快手经管账号。勾选多个账号时，每个账号分别生成发布明细。</p>${kmAccounts().map(a=>`<label class="checkbox-row"><input type="checkbox" name="kmAccount" value="${a.id}" ${selected.includes(a.id)?'checked':''} ${a.ok?'':'disabled'}>${esc(a.name)}<span class="account-extra">${a.ok?'授权有效':'授权失效'}</span></label>`).join('')}<div id="modalError" class="inline-error" role="alert"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="kmSaveAccounts">确定</button>`);
 $('#kmSaveAccounts').onclick=()=>{const picked=$$('[name=kmAccount]:checked').map(el=>el.value);if(!picked.length){$('#modalError').textContent='请至少选择一个快手号';return}ids.forEach(id=>kmSetAccounts(w,id,picked));closeModal();render()};
}
function kmEdit(assetId,id){
 const w=state.wizard,asset=w.assets.find(a=>a.id===assetId),d=kmDraft(w);
 if(!asset||(d.assignments[assetId]||[]).indexOf(id)<0)return toast('请先选择快手号',true);
 const c=kmConfig(w,assetId,id),t=kmTarget(asset,id);
 modal('编辑素材',`<div class="km-edit-context"><strong>${esc(asset.name)}</strong><span>${esc(account(id)?.name)}</span><span>${esc(t?t.name+' · '+t.id:'未匹配到短剧')}</span></div><form id="kmEditForm" class="native-material-form" onsubmit="return false"><div class="modal-field"><label class="required" for="kmClipTitle">剪辑标题</label><textarea id="kmClipTitle" name="title" aria-label="剪辑标题" placeholder="请输入20字内的剪辑标题" rows="3">${esc(c.title)}</textarea><div class="km-character-count" id="kmTitleCount">${[...c.title].length} / 20</div></div><div class="modal-field"><label class="required">剪辑类型</label><div class="km-radio-line">${KM_TYPES.map(t=>`<label class="radio-label"><input type="radio" name="kmClipType" value="${t}" ${c.clipType===t?'checked':''}>${t}</label>`).join('')}</div></div><div class="modal-field"><label class="required">作者声明</label><div class="km-declarations">${KM_DECLARATIONS.map((text,i)=>`<label class="radio-label"><input type="radio" name="kmDeclaration" value="${i}" ${c.declaration===i?'checked':''}>${text}</label>`).join('')}</div></div><div id="modalError" class="inline-error" role="alert"></div></form>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="kmSaveEditor">保存</button>`,'km-editor');
 $('#kmClipTitle').oninput=()=>{const length=[...$('#kmClipTitle').value].length;$('#kmTitleCount').textContent=length+' / 20';$('#kmTitleCount').classList.toggle('exception',length>20);$('#modalError').textContent=length>20?'剪辑标题不能超过20字':''};
 $('#kmSaveEditor').onclick=()=>{const declaration=$('[name=kmDeclaration]:checked'),c={title:$('#kmClipTitle').value.trim(),clipType:$('[name=kmClipType]:checked')?.value||'',declaration:declaration?Number(declaration.value):null},error=kmConfigError(c);if(error){$('#modalError').textContent=error;return}d.configs[kmKey(assetId,id)]=c;closeModal();render();toast('素材信息已保存')};
}
const renderConfirmBeforeKM=renderConfirm;
renderConfirm=function(){
 const w=state.wizard;if(!w.platforms.includes(KM_PLATFORM))return renderConfirmBeforeKM();
 const units=makeUnits(w),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error);
 return `<div class="summary-strip">${w.platforms.map(p=>`<div class="summary-item"><span>${platformLabel(p)}</span><strong>${valid.filter(u=>u.platform===p).length}<em>条</em></strong></div>`).join('')}</div>${bad.length?`<div class="notice warn">${bad.length} 条明细未通过校验，请返回修改。</div><label class="check-summary"><input type="checkbox" id="onlyValid" ${w.onlyValid?'checked':''}>仅提交通过的 ${valid.length} 条，其余保留草稿</label>`:''}<div class="table-wrap"><table class="data-table km-confirm-table"><thead><tr><th>平台 / 账号</th><th>素材 / 短剧</th><th>发布内容</th><th>提交方式</th><th>校验结果</th></tr></thead><tbody>${units.map(u=>`<tr><td>${platformBadge(u.platform)}<span class="cell-sub">${esc(account(u.account)?.name||'未选择账号')}</span></td><td>${esc(u.asset.name)}<span class="cell-sub">${esc(u.target?.name||'未关联短剧')} · ${esc(u.target?.id||'—')}</span></td><td>${esc(u.config?.title||u.desc||'—')}${u.platform===KM_PLATFORM?`<span class="cell-sub">${esc(u.config.clipType||'未选剪辑类型')}</span><span class="cell-sub">${esc(KM_DECLARATIONS[u.config.declaration]||'未选作者声明')}</span>`:u.platform===CP_PLATFORM?`<span class="cell-sub">红果：${esc(u.cpItem.hgTitle)}</span>`:''}</td><td>${esc(u.time||'—')}</td><td>${u.error?`<span class="status red">未通过</span><span class="cell-sub exception">${esc(u.error)}</span>`:'<span class="status green">通过</span>'}</td></tr>`).join('')}</tbody></table></div><div id="wizardError" class="inline-error" role="alert"></div>`;
};
function kmPending(w,bad){const result=mixedPendingDraft(w,bad);if(!result)return null;const d=kmDraft(result);d.assignments={};for(const u of bad.filter(u=>u.platform===KM_PLATFORM)){d.assignments[u.asset.id] ||= [];if(u.account)d.assignments[u.asset.id].push(u.account)}return result}
function kmFinishPublishing(){let changed=false;for(const r of kmRows){if(r.status==='发布中'&&r.due<=Date.now()){r.status='已发布';r.publishedAt=shanghaiTime();delete r.due;changed=true}}if(changed)kmPersist();return changed}
function kmSaveUnits(units,batch){const now=shanghaiTime();const newRows=units.map((u,i)=>({id:'KM'+Date.now()+'-'+i,batch,asset:{...u.asset},account:u.account,dramaId:u.target.id,dramaName:u.target.name,title:u.config.title,clipType:u.config.clipType,declaration:u.config.declaration,status:'发布中',reason:'',created:now,submittedAt:now,publishedAt:'',cover:demoCover(u.target.name),due:Date.now()+1600}));kmRows.unshift(...newRows);kmPersist();setTimeout(()=>{kmFinishPublishing();if(state.page!=='wizard'&&$('#overlay').hidden)render()},1700);return newRows}
const submitBeforeKM=submitTask;
submitTask=function(){
 const w=state.wizard;if(!w?.platforms.includes(KM_PLATFORM))return submitBeforeKM();
 const units=makeUnits(w),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error),km=valid.filter(u=>u.platform===KM_PLATFORM),others=valid.filter(u=>u.platform!==KM_PLATFORM);
 if(!valid.length)return errorWizard('没有可提交的明细，请返回完善信息');
 if(bad.length&&!w.onlyValid)return errorWizard('请先处理未通过项，或选择仅提交通过项');
 const pending=kmPending(w,bad);let batch='FB'+Date.now();
 if(others.length){state.wizard={...w,platforms:w.platforms.filter(p=>p!==KM_PLATFORM)};submitBeforeKM();batch=others.some(u=>PLATFORMS.includes(u.platform))?state.batch:(cpRows[0]?.batch||batch)}
 kmSaveUnits(km,batch);draft=pending;state.wizard=null;state.selected.clear();if(!others.length){state.page='list';state.platform=KM_PLATFORM}else{state.page='batch';state.batch=batch}persist();render();toast(`已提交 ${valid.length} 条明细${bad.length?'，未通过项已保留草稿':''}`);
};
const openBatchBeforeKM=openBatchPublish;
openBatchPublish=function(){
 const w=state.wizard;if(!w?.platforms.includes(KM_PLATFORM))return openBatchBeforeKM();
 const units=makeUnits(w),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error),normal=valid.filter(u=>PLATFORMS.includes(u.platform));
 if(!valid.length)return errorWizard('没有可提交的明细，请返回完善信息');if(bad.length&&!w.onlyValid)return errorWizard('请先处理未通过项，或选择仅提交通过项');
 modal('确认提交',`<p class="modal-copy">确认提交 ${valid.length} 条发布明细？快手经管平台的剪辑在提交后发布。</p>${normal.length?`<div class="modal-field"><label for="kmInterval">账号平台发布间隔</label><select id="kmInterval">${[15,30,60,75,90,120,180,240].map(n=>`<option value="${n}" ${(w.publishInterval||15)===n?'selected':''}>${n}分钟</option>`).join('')}</select><p class="inline-note">间隔用于抖音号、视频号和快手号任务。</p></div>`:''}<div id="modalError" class="inline-error" role="alert"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="kmConfirmSubmit">确定</button>`,'small-modal');
 $('#kmConfirmSubmit').onclick=()=>{if(normal.length)w.publishInterval=Number($('#kmInterval').value);const latest=makeUnits(w),newError=latest.find(u=>u.error&&!units.some(old=>old.platform===u.platform&&old.asset.id===u.asset.id&&old.account===u.account&&old.error));if(newError){$('#modalError').textContent=newError.error;return}closeModal();submitTask()};
};
const renderBatchBeforeKM=renderBatch;
renderBatch=function(){const html=renderBatchBeforeKM(),list=kmRows.filter(r=>r.batch===state.batch);return html+(list.length?`<section class="list-panel multi-cp-result"><div class="list-toolbar"><strong>本批次快手经管平台剪辑</strong><button class="btn" data-action="km-list">前往快手经管平台</button></div>${kmListTable(list)}</section>`:'')};
Object.assign(actions,{
 'km-new':()=>{state.wizard=newWizard();state.wizard.platforms=[KM_PLATFORM];state.page='wizard';state.step=1;state.assetSelected=new Set();state.folded={};render()},
 'km-reset':()=>{kmFilters=emptyKMFilters();render()},
 'km-assign':el=>kmAssign([el.dataset.id]),
 'km-assign-all':()=>{const ids=selectedPlatformAssets(state.wizard,KM_PLATFORM).map(a=>a.id);if(!ids.length)return toast('请先勾选当前平台需要分配账号的素材',true);kmAssign(ids)},
 'km-edit':el=>kmEdit(el.dataset.id,el.dataset.account),
 'km-sync':el=>openKMMaterialSync(el.dataset.id,el.dataset.account),
 'km-remove':el=>{const w=state.wizard,id=el.dataset.id;kmClearAsset(w,id);w.excluded[KM_PLATFORM] ||= [];w.excluded[KM_PLATFORM].push(id);render()},
 'km-list':()=>{state.page='list';state.platform=KM_PLATFORM;render()}
});
const removeAssetBeforeKM=actions['remove-asset'];actions['remove-asset']=el=>{if(state.wizard?.kuaishouOperator)kmClearAsset(state.wizard,el.dataset.id);removeAssetBeforeKM(el)};
document.addEventListener('submit',e=>{if(e.target.id!=='kmFilters')return;e.preventDefault();const f={...emptyKMFilters(),...Object.fromEntries(new FormData(e.target))};if(f.start&&f.end&&f.start>f.end){$('#kmFilterError').textContent='开始日期不能晚于结束日期';return}kmFilters=f;render()});
kmFinishPublishing();for(const r of kmRows.filter(r=>r.due))setTimeout(()=>{kmFinishPublishing();if(state.page!=='wizard')render()},Math.max(0,r.due-Date.now()+30));
render();persist();kmPersist();
