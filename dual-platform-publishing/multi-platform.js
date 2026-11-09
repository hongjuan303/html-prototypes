'use strict';
// All entry points share the material-selection wizard; copyright keeps its own fields and storage.
function copyrightDraft(w=state.wizard){
 if(!w)return null;
 w.copyright ||= {...cpNewDraft(),identity:cpState.identity};
 const d=w.copyright;d.identity ||= cpState.identity;d.step=2;
 d.assets=platformAssets(w,CP_PLATFORM).map(a=>({...a}));
 const present=new Set(w.assets.map(a=>a.id));
 for(const id of Object.keys(d.items))if(!present.has(id))delete d.items[id];
 for(const a of d.assets){d.items[a.id] ||= cpNewMaterialInfo();const item=d.items[a.id];if(item.schema!==23){if(!item.configured){item.ai=null;item.anchor=null}item.schema=23}if(item.type==='正片')item.anchor=null}
 return d;
}
function applyCPMaterialSync(w,assetId,selected){
 const d=copyrightDraft(w),source=d?.items[assetId];
 if(!source?.configured||!d.assets.some(a=>a.id===assetId)||cpAssociationError(source))return 0;
 const fields=['type','linkedAccount','content','materialType','dyAccount','hgAccount','cover','dyTitle','hgTitle','topics','ai','anchor','mode','time'];
 const copy=Object.fromEntries(fields.map(key=>[key,source[key]]));
 let count=0;
 for(const asset of d.assets){
  if(!selected.has(asset.id))continue;
  if(asset.id!==assetId)d.items[asset.id]={...d.items[asset.id],...JSON.parse(JSON.stringify(copy)),configured:true};
  count++;
 }
 return count;
}
function openCPMaterialSync(assetId){
 const w=state.wizard,d=copyrightDraft(w);
 if(!d?.items[assetId]?.configured||!d.assets.some(a=>a.id===assetId))return toast('请先编辑并保存当前素材信息',true);
 const error=cpAssociationError(d.items[assetId]);if(error)return toast(error,true);
 openMaterialSyncDialog(d.assets,selected=>applyCPMaterialSync(w,assetId,selected));
}
function copyrightUnits(w){
 if(!w?.platforms.includes(CP_PLATFORM))return [];
 const d=copyrightDraft(w);
 const accepted=[];return d.assets.map(a=>{const item=d.items[a.id],c=CP_CONTENTS.find(c=>c.id===item.content);return {
  platform:CP_PLATFORM,asset:a,account:item.dyAccount,cpItem:item,identity:d.identity,
  target:c,metadata:{},config:{title:item.dyTitle,hang:item.type+' · '+item.materialType},
  desc:item.dyTitle,time:item.mode==='定时发布'?(item.time||'').replace('T',' '):'立即发布',error:(()=>{const error=cpItemError(a,item,d.identity);if(error)return error;const candidate={...item,asset:a,identity:d.identity,owner:'当前运营',dyStatus:'待分发',hgStatus:'待分发'};const issue=cpDistributionError([...accepted,candidate]);if(!issue)accepted.push(candidate);return issue})()
 }});
}
const accountMakeUnits=makeUnits;
makeUnits=function(w=state.wizard){return !w?[]:[...accountMakeUnits({...w,platforms:w.platforms.filter(p=>PLATFORMS.includes(p))}),...copyrightUnits(w)]};
const accountPlatformSection=renderPlatformSection;
renderPlatformSection=function(p){
 if(p!==CP_PLATFORM)return accountPlatformSection(p);
 const d=copyrightDraft(),open=!state.folded?.[p],ready=copyrightUnits(state.wizard).filter(u=>!u.error).length;cpState.draft=d;
 return `<section class="platform-section" data-platform-section="${p}"><h2><button class="platform-section-toggle" data-action="toggle-platform" data-platform="${p}" aria-expanded="${open}" aria-controls="platform-body-${p}"><span class="collapse-chevron ${open?'expanded':''}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg></span>${platformBadge(p)}<span class="section-stats">${d.assets.length} 份素材 · ${ready} 份信息已完善</span><span class="fold-text">${open?'收起':'展开'}</span></button></h2><div id="platform-body-${p}" class="platform-section-body" ${open?'':'hidden'}><div class="config-toolbar"><span class="subtle">${esc(d.identity)} · 点击「编辑素材」配置关联内容、双端账号与标题</span><button class="btn primary small" data-action="platform-library" data-platform="${p}">选择素材</button></div>${d.assets.length?renderCPMaterialList(true):'<div class="target-empty">暂未选择版权中台素材，请从 OSS 文件库选择。</div>'}<div class="platform-section-foot"><span>版权中台信息独立保存，抖音与红果分发规则保持不变。</span><span>${ready} 份配置通过</span></div></div></section>`;
};
const accountRenderWizard=renderWizard;
renderWizard=function(){let html=accountRenderWizard();if(state.wizard.platforms.includes(CP_PLATFORM))html=html.replace('确认后将创建发布任务，可在列表查看执行结果','确认后提交各平台任务，版权中台按预约时间提审').replace("data-action=\"submit-task\">批量发布","data-action=\"submit-task\">确认提交");return html};
const accountRenderConfirm=renderConfirm;
renderConfirm=function(){
 const w=state.wizard;if(!w.platforms.includes(CP_PLATFORM))return accountRenderConfirm();
 const units=makeUnits(w),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error);
 return `<div class="summary-strip">${[['源素材',w.assets.length,'份'],...PUBLISH_PLATFORMS.map(p=>[platformLabel(p),valid.filter(u=>u.platform===p).length,p===CP_PLATFORM?'份':'条']),['可提交合计',valid.length,'项']].map(([label,n,suffix])=>`<div class="summary-item"><span>${label}</span><strong>${n}<em>${suffix}</em></strong></div>`).join('')}</div><div class="notice">抖音、视频号、快手按各自配置创建发布任务；版权中台按发布时间提交审核，可在列表查看抖音、红果两端结果。</div>${bad.length?`<div class="notice warn">${bad.length} 项未完善，请返回编辑，或仅提交通过项。</div><label class="check-summary"><input type="checkbox" id="onlyValid" ${w.onlyValid?'checked':''}>仅提交校验通过的 ${valid.length} 项，问题项保留草稿</label>`:''}<div class="section-title">${pin(3)}提交确认清单<small>${units.length} 项配置</small></div><div class="table-wrap"><table class="data-table compact multi-confirm-table"><thead><tr><th>平台 / 账号</th><th>素材 / 关联内容</th><th>作品信息</th><th>提交方式 / 时间</th><th>校验结果</th></tr></thead><tbody>${units.map(u=>{const cp=u.platform===CP_PLATFORM;return `<tr><td>${platformBadge(u.platform)}<span class="cell-sub">${cp?'抖音：':''}${esc(account(u.account)?.name||'未分配')}</span>${cp?`<span class="cell-sub">红果：${esc(CP_HG_ACCOUNTS.find(a=>a.id===u.cpItem.hgAccount)?.name||'未选择')}</span><span class="cell-sub">${u.identity}</span>`:''}</td><td><div class="asset-name">${esc(u.asset.name)}</div>${unitTargetSummary(u)}</td><td>${cp?`<span class="cell-sub">抖音标题</span>${esc(u.cpItem.dyTitle||'—')}<span class="cell-sub">红果标题</span>${esc(u.cpItem.hgTitle||'—')}`:`${u.platform==='抖音'?`<strong>${esc(u.config?.title||'未填写作品标题')}</strong><span class="cell-sub">作品简介</span>`:''}${esc(u.desc||'—')}`}</td><td>${esc(u.time||'—')}${cp?'<span class="cell-sub">按预约时间提审，返回版权中台查看结果</span>':''}</td><td>${u.error?`<span class="status red">未通过</span><span class="cell-sub exception">${esc(u.error)}</span>`:'<span class="status green">通过</span>'}</td></tr>`}).join('')}</tbody></table></div><div id="wizardError" class="inline-error" role="alert"></div>`;
};
function mixedPendingDraft(w,bad){
 if(!bad.length)return null;
 const next=normalizeDraft(w);next.pendingOnly=true;next.onlyValid=false;
 next.platforms=PUBLISH_PLATFORMS.filter(p=>bad.some(u=>u.platform===p));
 next.assets=next.assets.filter(a=>bad.some(u=>u.asset.id===a.id));next.assignments={};
 for(const p of PUBLISH_PLATFORMS)next.excluded[p]=next.assets.filter(a=>!bad.some(u=>u.platform===p&&u.asset.id===a.id)).map(a=>a.id);
 for(const u of bad)if(u.platform!==CP_PLATFORM){const key=u.platform+u.asset.id;next.assignments[key] ||= [];if(u.account)next.assignments[key].push(u.account)}
 if(next.copyright){const pendingIds=new Set(bad.filter(u=>u.platform===CP_PLATFORM).map(u=>u.asset.id));next.copyright.items=Object.fromEntries(Object.entries(next.copyright.items).filter(([id])=>pendingIds.has(id)));copyrightDraft(next)}
 return next;
}
function saveCopyrightUnits(units,batch){
 const now=shanghaiTime(),stamp=Date.now();
 const saved=units.map((u,i)=>{const item=u.cpItem;return {id:'CP'+stamp+'-'+i,batch,identity:u.identity,owner:'当前运营',asset:{...u.asset},linkedAccount:item.linkedAccount,mode:item.mode||'立即发布',time:item.mode==='定时发布'?item.time:'',content:item.content,materialType:item.materialType,dyAccount:item.dyAccount,hgAccount:item.hgAccount,ai:item.ai,anchor:item.anchor,initialAnchor:item.anchor,dyTitle:item.dyTitle,hgTitle:item.hgTitle,topics:[...item.topics],cover:item.cover,dyStatus:'待分发',hgStatus:'待分发',counted:false,edits:0,created:now}});
 cpRows.unshift(...saved);cpBeginReview(saved);return saved;
}
const accountSubmitTask=submitTask;
submitTask=function(){
 const w=state.wizard;if(!w)return;
 if(!w.platforms.includes(CP_PLATFORM))return accountSubmitTask();
 const units=makeUnits(w),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error);
 if(!valid.length)return errorWizard('没有可提交的配置，请返回完善信息');
 if(bad.length&&!w.onlyValid)return errorWizard('存在未完善项，请返回编辑或选择仅提交通过项');
 const normal=valid.filter(u=>u.platform!==CP_PLATFORM),copyright=valid.filter(u=>u.platform===CP_PLATFORM),pending=mixedPendingDraft(w,bad);
 let batch='FB'+Date.now();
 if(normal.length){state.wizard={...w,platforms:w.platforms.filter(p=>p!==CP_PLATFORM)};accountSubmitTask();batch=state.batch}
 else {state.page='list';state.platform=CP_PLATFORM;cpState.identity=w.copyright.identity;state.wizard=null;state.selected.clear()}
 if(copyright.length)cpState.identity=w.copyright.identity;
 saveCopyrightUnits(copyright,batch);draft=pending;cpState.mode='list';cpState.draft=null;cpState.selected.clear();persist();render();
 toast(`已创建 ${normal.length} 条发布任务，提交 ${copyright.length} 份版权中台素材审核${bad.length?'；问题项已保留草稿':''}`);
};
const accountBatchPublish=openBatchPublish;
openBatchPublish=function(){
 const w=state.wizard;if(!w?.platforms.includes(CP_PLATFORM))return accountBatchPublish();
 const units=makeUnits(),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error);
 if(!valid.length)return errorWizard('没有可提交的配置，请返回完善信息');
 if(bad.length&&!w.onlyValid)return errorWizard('请先处理未完善项，或选择仅提交通过项');
 const normal=valid.filter(u=>u.platform!==CP_PLATFORM).length,cp=valid.length-normal;
 modal('确认提交',`<p class="modal-copy">本次将创建 ${normal} 条账号平台发布任务，并创建 ${cp} 份版权中台提审任务。</p>${normal?`<p class="inline-note">同一个账号的多条视频按现有发布间隔串行执行。</p><div class="modal-field"><label for="publishInterval">发布间隔时间</label><select id="publishInterval">${[15,30,60,75,90,120,180,240].map(n=>`<option value="${n}" ${(w.publishInterval||15)===n?'selected':''}>${n}分钟</option>`).join('')}</select></div>`:''}${cp?'<div class="notice">版权中台素材按预约时间提审；两端结果分别展示。</div>':''}<div id="modalError" class="inline-error" role="alert"></div>`,`<button class="btn" data-action="close-modal">取 消</button><button class="btn primary" id="confirmMixedSubmit">确 定</button>`,'small-modal');
 $('#confirmMixedSubmit').onclick=()=>{if(normal)w.publishInterval=+$('#publishInterval').value;const latest=makeUnits(),newError=latest.find(u=>u.error&&!units.some(old=>old.platform===u.platform&&old.account===u.account&&old.asset.id===u.asset.id&&old.error));if(newError){$('#modalError').textContent=newError.error;return}closeModal();submitTask()};
};
const accountRenderBatch=renderBatch;
renderBatch=function(){const html=accountRenderBatch(),cp=cpRows.filter(r=>r.batch===state.batch&&cpCanSee(r));return html+(cp.length?`<section class="list-panel multi-cp-result"><div class="list-toolbar"><strong>本批次版权中台素材</strong><span class="subtle">${cp.length} 份提审任务</span><button class="btn" data-action="cp-open-list">前往版权中台</button></div><p class="inline-note">${cp.map(r=>esc(r.asset.name)).join('、')}</p></section>`:'')};
Object.assign(actions,{
 'cp-upload':()=>{cpState.mode='list';state.wizard=newWizard();state.wizard.platforms=[CP_PLATFORM];state.wizard.copyright={...cpNewDraft(),identity:cpState.identity};state.page='wizard';state.step=1;state.assetSelected=new Set();state.folded={};render()},
 'cp-edit-draft':el=>{if(state.page==='wizard')cpState.draft=copyrightDraft();cpOpenDraftEditor(el.dataset.id)},
 'cp-sync-draft':el=>openCPMaterialSync(el.dataset.id),
 'cp-remove-asset':el=>{if(state.page!=='wizard'){cpRemoveDraftAsset(cpState.draft,el.dataset.id);render();return}const w=state.wizard,id=el.dataset.id;w.excluded[CP_PLATFORM] ||= [];w.excluded[CP_PLATFORM].push(id);delete copyrightDraft(w).items[id];render()},
 'submit-task':()=>openBatchPublish(),
 'cp-open-list':()=>{state.page='list';state.platform=CP_PLATFORM;cpState.mode='list';render()}
});
render();
