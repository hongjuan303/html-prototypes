'use strict';
// V2 keeps the original platform forms and adds preparation / matching around them.
const DRAMA_BRIEFS={
 '10086':{synopsis:'药铺姑娘沈月在长街重逢失忆的故人陆川，两人从互相试探到携手查清旧案，在守护街坊的过程中重新找回彼此。',titles:['长街重逢，他竟忘了最想守护的人','一间药铺，一段被遗忘的约定','她救下的陌生人，竟是失忆的故人']},
 '10087':{synopsis:'林知意返乡重开母亲留下的花店，与多年未见的青梅竹马陈风共同挽救小镇花市，在误会与陪伴中重新确认心意。',titles:['重开母亲的花店，她遇见了旧时心动','多年未见的他，为她守住一整个春天','这一次，他们一起守护小镇花市']},
 '10088':{synopsis:'摄影师许光在事业低谷结识听障舞者苏宁，两人一起筹备公益舞台，在相互鼓励中走出阴影，让不被看见的梦想被看见。',titles:['听不见音乐的她，依然站上了舞台','低谷里的相遇，让他们重新看见梦想','一个镜头，记录下她不肯放弃的光']}
};
function materialDrama(asset){
 const ids=[...new Set(asset.name.replace(/\.[^.]+$/,'').match(/(?<!\d)\d{5,}(?!\d)/g)||[])];
 if(ids.length!==1)return {error:ids.length?'素材名含多个可能的合集ID，请核对源文件命名':'未识别到合集ID，请核对源文件命名'};
 const d=drama(ids[0]);if(!d)return {id:ids[0],error:'绿台未找到该合集'};
 if(!DRAMA_BRIEFS[d.id]?.synopsis)return {id:d.id,drama:d,error:'该短剧暂无简介'};
 return {id:d.id,drama:d,...DRAMA_BRIEFS[d.id]};
}
// Include an explicit unresolved case so the prototype demonstrates failure handling.
if(!OSS_FILES.some(a=>a.id==='oss-id-missing'))OSS_FILES.push({...OSS_FILES[0],id:'oss-id-missing',name:'待核对合集_精彩片段.mp4',ossKey:'clips/demo/missing-id.mp4',folder:'待核对素材'});
function applyAssetTitles(w,values){
 w.assetTitles ||= {};
 for(const [id,title] of Object.entries(values)){
  if(!w.assets.some(a=>a.id===id))continue;
  const previous=w.assetTitles[id];w.assetTitles[id]=title;
  // Retain explicit per-account edits; update values that still follow the previous draft title.
  for(const [key,c] of Object.entries(w.materialAccountConfigs))if(key.startsWith(id+'::')&&account(key.split('::')[1])?.platform==='抖音'&&(!c.title||c.title===previous))c.title=title;
 }
}
renderImport=function(){const w=state.wizard;return `<div class="import-heading">${pin(1)}<span>选择发布素材</span><small>素材由剪辑同学提前上传至 OSS 文件库</small></div><div class="source-library-bar"><div><strong>OSS 文件库</strong><p>先选择素材，在下一步分别配置平台、账号和作品信息。</p></div><button class="btn primary" data-action="open-library">选择素材</button></div><div class="section-title">已选素材<small>${w.assets.length} / 100 份</small></div>${w.assets.length?`<div class="table-wrap"><table class="data-table compact source-only-table"><thead><tr><th>素材名称</th><th>来源文件夹</th><th>大小 / 时长</th><th>状态</th><th>操作</th></tr></thead><tbody>${w.assets.map(a=>`<tr><td>${esc(a.name)}</td><td>${esc(a.folder)}</td><td>${esc(a.size)} / ${esc(a.duration)}</td><td><span class="status green">可用</span></td><td><button class="link-button danger" data-action="remove-asset" data-id="${a.id}">移除</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="no-files library-empty"><span class="empty-file-icon">▤</span><strong>暂未选择素材</strong><p>从 OSS 文件库加入本次需要发布的视频。</p></div>'}<div id="wizardError" class="inline-error" role="alert"></div>`};
function openDramaAccounts(){
 const w=state.wizard,assets=platformAssets(w,'抖音'),groups=DRAMAS.map(d=>({d,assets:assets.filter(a=>materialDrama(a).id===d.id)})).filter(g=>g.assets.length),bad=assets.filter(a=>materialDrama(a).error);
 modal('按剧匹配抖音号',`<div class="notice">为同一合集选择一次账号，应用到本批次该剧的全部素材。可随后逐条调整。</div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>识别短剧</th><th>本批素材</th><th>分配抖音号</th></tr></thead><tbody>${groups.map(g=>`<tr><td>${esc(g.d.name)}<span class="cell-sub">${g.d.id}</span></td><td>${g.assets.length} 份</td><td><select data-drama-account="${g.d.id}" aria-label="${g.d.name}分配抖音号"><option value="">保持现有分配</option>${accounts.filter(a=>a.platform==='抖音').map(a=>`<option value="${a.id}" ${!a.ok?'disabled':''}>${esc(a.name)}${!a.ok?'（授权失效）':''}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>${bad.length?`<p class="exception">${bad.length} 份素材无法识别合集，需单独分配账号。</p>`:''}<p class="inline-note">修改账号会清空该素材原账号下的选剧；这里只建立本批次分配关系。</p><div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="applyDramaAccounts">应用分配</button>`,'large-modal');
 $('#applyDramaAccounts').onclick=()=>{let count=0;$$('[data-drama-account]').forEach(el=>{if(!el.value||!account(el.value)?.ok)return;groups.find(g=>g.d.id===el.dataset.dramaAccount).assets.forEach(a=>{setAssignments(w,'抖音',a.id,[el.value]);count++})});if(!count){$('#modalError').textContent='请至少为一部剧选择账号';return}closeModal();render();toast(`已为 ${count} 份同剧素材分配账号`)};
}
function nativeMatches(w){return platformAssets(w,'抖音').flatMap(a=>{const ids=w.assignments['抖音'+a.id]||[];return (ids.length?ids:['']).map(id=>{const info=materialDrama(a),options=availableTargets(w,id,a.id).filter(t=>t.drama===info.id);return {a,id,options,error:!id?'先选择抖音号':!account(id)?.ok?'账号授权失效':info.error||(!options.length?'当前账号没有对应端上剧':options.length>1?'存在多个候选，请手动确认':'')}})})}
function openNativeMatch(){
 const matches=nativeMatches(state.wizard);modal('匹配当前账号的端上剧',`<div class="notice">使用绿台合集 ID 匹配所选抖音号可用的端上剧。平台合集 ID 以账号返回的数据为准。</div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>素材</th><th>抖音号</th><th>端上剧匹配结果</th></tr></thead><tbody>${matches.map((r,i)=>`<tr><td>${esc(r.a.name)}</td><td>${esc(account(r.id)?.name||'未分配')}</td><td>${r.options.length?`<select data-native-match="${i}" aria-label="${esc(r.a.name)}端上剧匹配"><option value="">暂不应用</option>${r.options.map(t=>`<option value="${t.id}" ${r.options.length===1&&!r.error?'selected':''}>${esc(t.name)} · ${t.id}</option>`).join('')}</select>`:`<span class="exception">${esc(r.error)}</span>`}</td></tr>`).join('')}</tbody></table></div><p class="inline-note">仅更新已确认的挂载目标；封面、作品标题和作品简介可继续在「编辑素材」中处理。</p><div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="applyNativeMatches">应用匹配结果</button>`,'large-modal');
 $('#applyNativeMatches').onclick=()=>{let count=0;$$('[data-native-match]').forEach(el=>{const r=matches[+el.dataset.nativeMatch],t=r.options.find(t=>t.id===el.value);if(!t||!account(r.id)?.ok)return;const w=state.wizard,key=targetKey(r.a.id,r.id);w.targets[key]=t.id;const c=assetConfig(w,'抖音',r.a.id,r.id);w.materialAccountConfigs[key]={...c,coverUrl:c.coverUrl||demoCover(t.name)};count++});if(!count){$('#modalError').textContent='暂无可应用结果，请先选择账号或手动选剧';return}closeModal();render();toast(`已匹配 ${count} 条端上剧`)};
}
function openBulkDYCopy(){
 const w=state.wizard,units=makeUnits().filter(u=>u.platform==='抖音'&&u.account);if(!units.length)return toast('请先选择抖音号',true);
 modal('批量编辑作品标题与简介',`<div class="notice">勾选需要修改的明细；可分别选择同步标题、简介，账号和挂链保持现有配置。</div><div class="copy-fields"><label><input type="checkbox" id="bulkTitleEnabled">统一作品标题</label><input id="bulkCopyTitle" aria-label="统一作品标题" placeholder="请输入作品标题"><label><input type="checkbox" id="bulkIntroEnabled">统一作品简介</label><textarea id="bulkCopyIntro" aria-label="统一作品简介" placeholder="请输入作品简介"></textarea></div>${units.map((u,i)=>`<label class="checkbox-row"><input type="checkbox" name="dyCopyUnit" value="${i}" checked>${esc(u.asset.name)}<span class="account-extra">${esc(account(u.account).name)}</span></label>`).join('')}<div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="applyBulkCopy">应用到所选明细</button>`,'large-modal');
 $('#applyBulkCopy').onclick=()=>{const title=$('#bulkTitleEnabled').checked,intro=$('#bulkIntroEnabled').checked,selected=$$('[name=dyCopyUnit]:checked');if((!title&&!intro)||!selected.length||(title&&!$('#bulkCopyTitle').value.trim())||(intro&&!$('#bulkCopyIntro').value.trim())){$('#modalError').textContent='请选择修改字段及目标明细，并填写对应内容';return}selected.forEach(el=>{const u=units[+el.value],key=targetKey(u.asset.id,u.account);w.materialAccountConfigs[key]={...assetConfig(w,'抖音',u.asset.id,u.account),...(title?{title:$('#bulkCopyTitle').value.trim()}:{}),...(intro?{text:$('#bulkCopyIntro').value.trim()}:{} )}});closeModal();render();toast('已应用到所选抖音明细')};
}
function openBatchPublish(){
 const w=state.wizard,units=makeUnits(),valid=units.filter(u=>!u.error);if(!valid.length)return errorWizard('没有可提交的发布明细，请返回检查配置');if(units.length>valid.length&&!w.onlyValid)return errorWizard('请先处理未通过项，或选择仅提交通过项');
 modal('批量发布',`<p class="modal-copy">确认批量发布？<br>确认后将根据配置的发布时间执行视频发布任务。同一个账号若发布多个视频，将按照发布间隔串行。</p><div class="modal-field"><label for="publishInterval">发布间隔时间</label><select id="publishInterval">${[15,30,60,75,90,120,180,240].map(n=>`<option value="${n}" ${(w.publishInterval||15)===n?'selected':''}>${n}分钟</option>`).join('')}</select></div><div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取 消</button><button class="btn primary" id="confirmBatchPublish">确 定</button>`,'small-modal');
 $('#confirmBatchPublish').onclick=()=>{w.publishInterval=+$('#publishInterval').value;const checked=makeUnits(),newErrors=checked.filter(u=>u.error&&!units.some(old=>old.platform===u.platform&&old.account===u.account&&old.asset.id===u.asset.id&&old.error));if(newErrors.length){$('#modalError').textContent=newErrors[0].error+'，请缩短间隔或返回调整';return}closeModal();submitTask()};
}
function ensureKSTasks(ac){if(KS_TASKS.some(t=>t.account===ac.id))return;KS_SERVICES.forEach(s=>DRAMAS.forEach((d,i)=>KS_TASKS.push({id:ac.id+'-'+s.key+'-'+d.id,account:ac.id,service:s.key,dramaName:d.name,genre:['都市情感','古装爱情','逆袭成长'][i],name:d.name+' · '+s.type,start:'2026-01-01',end:'2027-12-31',enabled:true}))) }
accounts.filter(a=>a.platform==='快手').forEach(ensureKSTasks);
function showKSBindings(){
 const list=accounts.filter(a=>a.platform==='快手');modal('快手账号与授权',`<div class="notice">业务可自行绑定账号。这里演示授权结果，不会连接真实快手账号。</div><div class="v2-toolbar"><button class="btn primary" data-action="ks-bind-new">＋ 绑定快手账号</button></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>快手号</th><th>发布入口</th><th>授权状态</th><th>操作</th></tr></thead><tbody>${list.map(a=>`<tr><td>${esc(a.name)}<span class="cell-sub">${esc(a.id)}</span></td><td>${a.entry==='operator'?'经营者管理平台':'创作者服务平台'}</td><td>${statusBadge(a.ok?'授权有效':'授权失效')}</td><td><button class="link-button" data-ks-reauth="${a.id}">重新授权</button></td></tr>`).join('')}</tbody></table></div>`,undefined,'large-modal');$$('[data-ks-reauth]').forEach(el=>el.onclick=()=>openKSBinding(el.dataset.ksReauth));
}
function openKSBinding(id){
 const ac=account(id);modal(ac?'重新授权快手账号':'绑定快手账号',`<div class="notice">模拟授权：不使用真实二维码，也不收集账号密码。</div><div class="modal-field"><label>账号名称</label><input id="ksBindingName" aria-label="快手账号名称" value="${esc(ac?.name||'')}" ${ac?'disabled':''} placeholder="输入演示账号名称"></div><div class="modal-field"><label>发布入口</label><select id="ksBindingEntry" ${ac?'disabled':''}><option value="creator">创作者服务平台</option><option value="operator" ${ac?.entry==='operator'?'selected':''}>经营者管理平台 · 二创发布</option></select></div><div class="auth-placeholder"><span>⇄</span><strong>等待账号授权</strong><p>实际接入时由账号持有人在平台完成授权</p></div><div id="modalError" class="inline-error"></div>`,`<button class="btn" id="cancelKSBinding">返回账号列表</button><button class="btn primary" id="confirmKSBinding">模拟授权成功</button>`,'small-modal');
 $('#cancelKSBinding').onclick=showKSBindings;$('#confirmKSBinding').onclick=()=>{const name=$('#ksBindingName').value.trim(),entry=$('#ksBindingEntry').value;if(!name){$('#modalError').textContent='请输入账号名称';return}if(!ac&&accounts.some(a=>a.platform==='快手'&&a.name===name)){$('#modalError').textContent='该名称已绑定，请使用已有账号';return}const a=ac||{id:'ks-demo-'+Date.now(),platform:'快手',name,entry,group:'业务绑定',owner:'当前运营'};a.ok=true;if(!ac)accounts.push(a);ensureKSTasks(a);persist();showKSBindings();toast('已模拟完成授权')};
}
Object.assign(actions,{'submit-task':openBatchPublish,'ks-bind-new':()=>openKSBinding()});
const oldShowAccounts=showAccounts;showAccounts=function(p){if(p==='快手')return showKSBindings();oldShowAccounts(p)};
document.addEventListener('input',e=>{if(e.target.dataset.assetTitle&&state.wizard)applyAssetTitles(state.wizard,{[e.target.dataset.assetTitle]:e.target.value})});
// Scope selectable accounts to the selected Kuaishou publishing entry.
const oldAssignAccounts=assignAccounts;
assignAccounts=function(ids,p=state.activePlatform){if(p!=='快手')return oldAssignAccounts(ids,p);const eligible=accounts.filter(a=>a.platform==='快手'&&(a.entry||'creator')===(state.wizard.ksEntry||'creator'));const all=accounts;try{accounts=accounts.filter(a=>a.platform!=='快手'||eligible.includes(a));oldAssignAccounts(ids,p)}finally{accounts=all}};
// Migrate display data without changing the source filename or old description.
rows.filter(r=>r.platform==='抖音').forEach(r=>{if(r.title===undefined)r.title=drama(r.drama)?.name||'短剧精彩片段'});
render();persist();
