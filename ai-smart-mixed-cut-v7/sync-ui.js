import { TARGETS, TARGET_DATA, SYNC_SCHEMA_VERSION, businessDate, designerForAccount, targetForBatch, outputVersion, validateSyncForm, getOutputSync, prepareSync } from './sync-model.js?v=20261009-update11';
import { platformAccount } from './platform-context.js?v=20261009-update11';
import { dramaKey, findDrama } from './dramas.js?v=20261009-update11';

// Only simulates delivery state; no target system or local video is contacted.
export function createSyncUI(api) {
 const {getState,save,render,toast,modal,closeModal,button,esc,getBatch,getOutput}=api;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 let draft=null,activeJob=null,tagManager=false;
 const timers=new Set();
 const targets=id=>TARGETS.find(t=>t.id===id);
 const jobs=()=>getState().syncJobs;
 const extraTags=()=>getState().customTags;
 const tags=target=>target==='domestic'?[...TARGET_DATA.domestic.tags,...extraTags().filter(t=>t.target==='domestic')]:[];
 const findBatch=id=>getState().batches.find(b=>b.id===id);
 const current=(b,o)=>getOutputSync(b.id,o,jobs());
 const confirmed=o=>!o.narrationDraft&&!o.reworkPending&&!o.repairing&&o.status==='ready'&&o.confirmed&&(!o.confirmedVersion||o.confirmedVersion===outputVersion(o));
 const locked=(b,o)=>['pending','processing','unknown'].includes(current(b,o)?.status);
 const canSync=(b,o)=>confirmed(o)&&!['pending','processing','unknown','success'].includes(current(b,o)?.status);
 const statusName=status=>({pending:'等待同步',processing:'同步中',success:'已同步',failed:'同步失败',unknown:'待核实结果'})[status]||'未同步';
 const tag=(name,color='gray')=>'<span class="tag '+color+'">'+esc(name)+'</span>';
 const history=(b,o)=>jobs().filter(j=>j.batchId===b.id&&j.items.some(i=>i.outputId===o.id));
 const after=(fn,ms)=>{const timer=setTimeout(()=>{timers.delete(timer);fn();},ms);timers.add(timer);};
 function initialize() {
  const s=getState();if(!Array.isArray(s.syncJobs))s.syncJobs=[];if(!Array.isArray(s.customTags))s.customTags=[];
  for(const b of s.batches)for(const o of b.outputs){if(!o.contentVersion)o.contentVersion=1;if(o.confirmed&&!o.confirmedVersion)o.confirmedVersion=o.contentVersion;}
  for(const j of jobs()){let changed=false;for(const i of j.items)if(['pending','processing'].includes(i.status)){i.status='unknown';i.error='页面刷新中断演示，请先查询结果，避免重复上传';changed=true;}if(changed)j.status='unknown';}
 }
 initialize();
 function modalShow(title,body,actions) {modal(title,body,actions);$('#dialog').classList.add('material-sync-dialog');}
 function badgeFor(b,o) {
  const record=current(b,o);
  if(record)return '<div class="sync-inline-status">'+tag(statusName(record.status),record.status==='success'?'green':record.status==='failed'||record.status==='unknown'?'orange':'gray')+'<small>'+targets(record.target).label+' · V'+record.version+'</small></div>';
  const old=history(b,o).some(j=>j.items.some(i=>i.outputId===o.id&&i.status==='success'));
  return '<div class="sync-inline-status">'+tag(confirmed(o)?'待同步':'待确认')+(old?'<small>旧版本已同步</small>':'')+'</div>';
 }
 function rowAction(b,o) {
  const r=current(b,o);
  if(r&&['success','pending','processing','unknown'].includes(r.status))return button(r.status==='success'?'同步记录':'查看同步','sync-record-one','text-btn','data-id="'+o.id+'"');
  return button(r?.status==='failed'?'重试同步':'同步素材','sync-open-one','text-btn','data-id="'+o.id+'" '+(!canSync(b,o)?'disabled title="请先确认当前成片可用"':''));
 }
 function reviewActions(b,o) {
  return button('同步到素材管理','sync-open-one','primary','data-id="'+o.id+'" '+(!canSync(b,o)?'disabled title="仅当前已确认且未同步的版本可同步"':''))+(history(b,o).length?button('同步记录','sync-record-one','secondary','data-id="'+o.id+'"'):'');
 }
 function reviewNotice(b,o) {
  if(!history(b,o).length)return '';
  const old=history(b,o).some(j=>j.items.some(i=>i.outputId===o.id&&i.status==='success'));
  return '<div class="sync-review-notice"><span>当前成片 V'+outputVersion(o)+' · '+(confirmed(o)?'剪辑已确认':'待剪辑确认')+'</span>'+badgeFor(b,o)+(old?'<p>已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。</p>':'<p>确认当前版本没有问题后，可同步到对应投放系统。</p>')+'</div>';
 }
 const dramaName=b=>findDrama(getState(),dramaKey(b.config))?.title||b.sourceTitle||'';
 const recordName=j=>j.labels?.materialName||j.labels?.dramaName||j.labels?.drama||j.form?.materialName||j.form?.dramaName||'';
 const currentSchema=j=>j?.schemaVersion===SYNC_SCHEMA_VERSION||j?.form?.schemaVersion===SYNC_SCHEMA_VERSION;
 function setTarget(target,previousJob=null) {
  const b=findBatch(draft.batchId),data=TARGET_DATA[target];if(!b||!data)return;
  const preferences=b.syncPreferences?.[target]||{},allowedTags=new Set(tags(target).map(t=>t.id));
  const previous=previousJob?.form||preferences;
  const directoryId=data.directories.some(item=>item.id===previous.directoryId)?previous.directoryId:'';
  const designerId=designerForAccount(target,platformAccount.id);
  const name=dramaName(b);
  const tagIds=Array.isArray(previous.tagIds)?[...new Set(previous.tagIds.filter(id=>allowedTags.has(id)))]:[];
  draft.target=target;draft.form={schemaVersion:SYNC_SCHEMA_VERSION,directoryId,designerId,...(target==='domestic'?{dramaName:name,tagIds,onlineDate:businessDate()}:{materialName:name})};tagManager=false;showForm();
 }
 function open(b,outputs) {
  activeJob=null;
  if(!b||!outputs.length){toast('请先勾选已确认可用的成片');return;}
  if(outputs.some(o=>o.narrationDraft)){toast('所选素材有未应用的文案，请先应用或放弃修改');return;}
  if(outputs.some(o=>!confirmed(o))){toast('选中的素材尚未全部确认，请先检查并确认当前版本');return;}
  if(outputs.some(o=>!canSync(b,o))){toast('选中项包含已同步或结果待核实的版本，请查看同步记录');return;}
  const failed=outputs.length===1?current(b,outputs[0]):null;
  if(failed?.status==='failed'){showJob(failed.job.id);return;}
  draft={batchId:b.id,ids:outputs.map(o=>o.id),versions:outputs.map(o=>({id:o.id,version:outputVersion(o)})),target:null,form:null};
  const target=targetForBatch(b);if(target)setTarget(target);else showTarget();
 }
 function showTarget() {
  modalShow('选择同步到的素材管理','<p>当前片源未确定国内或海外类型，请选择目标投放系统。</p><div class="sync-target-choices">'+TARGETS.map(t=>'<button class="sync-target-card" data-action="sync-target" data-target="'+t.id+'"><strong>'+t.label+'</strong><p>'+t.systemLabel+' · 素材管理</p></button>').join('')+'</div>',button('取消','close'));
 }
 function options(items,value,placeholder) {return '<option value="">'+placeholder+'</option>'+items.map(i=>'<option value="'+esc(i.id)+'" '+(i.id===value?'selected':'')+'>'+esc(i.label)+'</option>').join('');}
 function field(label,control,help='') {return '<div class="sync-field"><label><span class="required">*</span> '+label+'</label><div class="sync-field-control">'+control+(help?'<p class="sync-field-help">'+help+'</p>':'')+'</div></div>';}
 function showForm() {
  const b=findBatch(draft.batchId),t=targets(draft.target),data=TARGET_DATA[draft.target],f=draft.form;
  const selectedItems=b.outputs.filter(o=>draft.ids.includes(o.id));
  const domestic=draft.target==='domestic';
  const body='<div class="sync-route-band"><strong>'+t.systemLabel+' · 素材管理</strong><span>'+(targetForBatch(b)?'已根据'+(domestic?'国内短剧':'海外短剧')+'自动匹配':'已选择'+t.label)+'</span>'+(!targetForBatch(b)&&!draft.retryOf?button('更换系统','sync-change-target','text-btn'):'')+'</div>'+(draft.retryNotice?'<p class="sync-retry-notice" role="status">'+esc(draft.retryNotice)+'</p>':'')+'<div id="syncFormErrors" class="sync-form-errors" role="alert" hidden></div><details class="sync-basic" open><summary>素材基本信息</summary><div class="sync-form" data-sync-target="'+draft.target+'">'+
   field('上传目录','<select id="syncDirectory" data-sync-field="directoryId" aria-label="上传目录" required>'+options(data.directories,f.directoryId,'选择上传目录')+'</select>')+
   field('设计师（剪辑）','<select id="syncDesigner" data-sync-field="designerId" aria-label="设计师（剪辑）" required>'+options(data.designers,f.designerId,'请选择')+'</select>')+
   (domestic?field('关联剧集','<input id="syncDramaName" data-sync-field="dramaName" aria-label="关联剧集" placeholder="请输入剧集名称" required value="'+esc(f.dramaName)+'">')+
   field('素材标签','<div class="sync-tags-row"><details class="sync-tags-combo"><summary id="syncTagsSummary">'+(f.tagIds.length?esc(tags(draft.target).filter(i=>f.tagIds.includes(i.id)).map(i=>i.label).join('、')):'请选择标签（可多选）')+'</summary><div id="syncTagOptions" class="sync-tag-options">'+tagsHTML()+'</div></details>'+button('标签管理','sync-tag-manager','sync-primary')+'</div><div id="syncTagManager" class="sync-tag-manager" hidden><p>新增素材标签</p><div><input id="syncNewTag" maxlength="20" aria-label="新标签名称" placeholder="输入标签名称">'+button('新增','sync-add-tag','secondary')+'</div></div>')+
   field('上线时间','<input id="syncOnlineDate" type="date" data-sync-field="onlineDate" aria-label="上线时间" min="'+businessDate()+'" required value="'+esc(f.onlineDate)+'"><p class="sync-date-warning">该日期会影响素材保护规则，请谨慎设置。</p>'):field('素材名称','<input id="syncMaterialName" data-sync-field="materialName" aria-label="素材名称" placeholder="请输入素材名称" required value="'+esc(f.materialName)+'">'))+
   '</div></details>';
  modalShow('上传素材',body,button('取消','close')+button((draft.retryOf?'确认并重试 ':'确定同步 ')+selectedItems.length+' 条','sync-submit','sync-primary',selectedItems.length?'':'disabled'));
 }
 function tagsHTML() {return tags(draft.target).map(t=>'<label><input type="checkbox" data-sync-tag="'+esc(t.id)+'" '+(draft.form.tagIds.includes(t.id)?'checked':'')+'> '+esc(t.label)+'</label>').join('');}
 function errors(message) {const el=$('#syncFormErrors');if(el){el.hidden=false;el.textContent=message;$('.sync-basic').open=true;el.scrollIntoView({block:'nearest'});}else toast(message);}
 function submit() {
  if(!draft)return;const b=findBatch(draft.batchId),outputs=b?.outputs.filter(o=>draft.ids.includes(o.id))||[];
  try {
   if(!b||outputs.length!==draft.ids.length||draft.versions.some(v=>outputVersion(outputs.find(o=>o.id===v.id))!==v.version))throw new Error('成片版本已变化，请关闭弹窗后重新选择当前版本');
   const now=new Date();if(draft.target==='domestic'&&$('#syncOnlineDate'))$('#syncOnlineDate').min=businessDate(now);
   const items=prepareSync(b,outputs,draft.target,draft.form,jobs(),extraTags(),now);
   const normalized=validateSyncForm(draft.form,draft.target,extraTags(),now).normalized;
   if(!b.syncPreferences||typeof b.syncPreferences!=='object'||Array.isArray(b.syncPreferences))b.syncPreferences={};
   b.syncPreferences[draft.target]={directoryId:normalized.directoryId,...(draft.target==='domestic'?{tagIds:[...normalized.tagIds]}:{})};
   const job=createJob(b,draft.target,normalized,items,getState().syncScenario||'normal',draft.retryOf||null);draft=null;showJob(job.id);runJob(job);
  }catch(e){errors(e.message);}
 }
 function createJob(b,target,form,items,scenario='normal',retryOf=null) {
  const data=TARGET_DATA[target],label=(group,id)=>data[group].find(v=>v.id===id)?.label||id;
  const j={id:'SYNC-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,5),schemaVersion:SYNC_SCHEMA_VERSION,batchId:b.id,target,form:JSON.parse(JSON.stringify(form)),createdAt:new Date().toISOString(),status:'processing',scenario,retryOf,simulated:true,source:JSON.parse(JSON.stringify(b.config.source||{kind:'sample'})),labels:{directory:label('directories',form.directoryId),designer:label('designers',form.designerId),...(target==='domestic'?{dramaName:form.dramaName,tags:tags(target).filter(t=>form.tagIds.includes(t.id)).map(t=>t.label),date:form.onlineDate}:{materialName:form.materialName})},items:items.map(i=>{const o=b.outputs.find(x=>x.id===i.outputId);return {...i,title:o.title,duration:o.duration,filename:o.id+'-V'+i.version+'.mp4',confirmedAt:o.confirmedAt||null};})};
  jobs().unshift(j);save();render();return j;
 }
 function updateJob(j) {
  j.status=j.items.some(i=>['pending','processing'].includes(i.status))?'processing':j.items.some(i=>i.status==='unknown')?'unknown':j.items.every(i=>i.status==='success')?'success':'partial';
  save();api.refreshSyncState();if($('#dialog').open&&$('#dialog').dataset.syncJob===j.id)renderJobBody(j);
 }
 function runJob(j) {
  const next=()=>{
   if(!jobs().includes(j))return;
   const i=j.items.find(i=>i.status==='pending');if(!i){updateJob(j);return;}
   i.status='processing';updateJob(j);
   after(()=>{const last=i===j.items.at(-1);if(last&&j.scenario==='partial'){i.status='failed';i.error='示例：素材传输失败，可只重试该条';}
    else if(last&&j.scenario==='unknown'){i.status='unknown';i.error='示例：请求超时，需查询目标系统结果后再决定是否重试';}
    else completeItem(j,i);
    updateJob(j);next();
   },700);
  };next();
 }
 function completeItem(j,i) {i.status='success';i.materialId=(j.target==='domestic'?'CN':'OS')+'-DEMO-'+j.id.slice(5)+'-'+(j.items.indexOf(i)+1);i.syncedAt=new Date().toISOString();i.error=null;}
 function showJob(id) {const j=jobs().find(j=>j.id===id);if(!j)return;activeJob=id;modalShow('素材同步记录','',button('关闭','close'));$('#dialog').dataset.syncJob=id;renderJobBody(j);}
 function recordMeta(j) {
  const labels=j.labels||{},form=j.form||{},base=[['上传目录',labels.directory||form.directoryId||''],['设计师（剪辑）',labels.designer||form.designerId||'']];
  const fields=currentSchema(j)?(j.target==='domestic'?[...base,['关联剧集',labels.dramaName||form.dramaName||''],['素材标签',(labels.tags||[]).join('、')],['上线时间',labels.date||form.onlineDate||'']]:[...base,['素材名称',labels.materialName||form.materialName||'']]):[...base,['关联剧集',labels.drama||''],['素材标签',(labels.tags||[]).join('、')],['上线时间',form.onlineDate||labels.date||'']];
  return '<dl class="sync-record-meta">'+fields.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>';
 }
 function renderJobBody(j) {
  const success=j.items.filter(i=>i.status==='success').length,failed=j.items.filter(i=>i.status==='failed').length,unknown=j.items.filter(i=>i.status==='unknown').length;
  $('#dialogBody').innerHTML='<div class="sync-route-band"><strong>'+targets(j.target).systemLabel+' · 素材管理</strong></div><div class="sync-job-summary"><h3>'+ (j.status==='processing'?'正在同步':j.status==='success'?'同步完成':unknown?'同步结果待核实':'部分素材未同步')+'</h3><p>成功 '+success+' / '+j.items.length+' 条'+(failed?' · 失败 '+failed+' 条':'')+(unknown?' · 待核实 '+unknown+' 条':'')+'</p></div>'+recordMeta(j)+'<div class="sync-job-items">'+j.items.map(i=>'<div class="sync-job-row"><div><strong>'+esc(i.title)+' · V'+i.version+'</strong><p>'+statusName(i.status)+(i.materialId?' · 素材 ID：'+esc(i.materialId):'')+'</p>'+(i.syncedAt?'<small>'+new Date(i.syncedAt).toLocaleString('zh-CN')+'</small>':'')+(i.error?'<small class="error-text">'+esc(i.error)+'</small>':'')+'</div>'+tag(statusName(i.status),i.status==='success'?'green':i.status==='failed'||i.status==='unknown'?'orange':'gray')+'</div>').join('')+'</div><p class="sync-modal-note">记录对应提交时的成片版本。</p>';
  $('#dialogActions').innerHTML=button('全部同步记录','sync-records')+(unknown?button('查询同步结果','sync-query','secondary','data-job="'+j.id+'"'):'')+(failed?button('仅重试失败 '+failed+' 条','sync-retry','sync-primary','data-job="'+j.id+'"'):'')+button('关闭','close');
 }
 function records(b,outputId=null) {
  activeJob=null;const records=jobs().filter(j=>j.batchId===b.id&&(!outputId||j.items.some(i=>i.outputId===outputId)));
  modalShow('同步到素材管理的记录',records.length?'<p class="sync-modal-note">按提交时版本保留记录；修改成片不会覆盖原同步记录。</p><div class="sync-job-items">'+records.map(j=>'<div class="sync-job-row"><div><strong>'+targets(j.target).label+' · '+j.items.length+' 条</strong><p>'+esc(recordName(j))+' · '+new Date(j.createdAt).toLocaleString('zh-CN')+'</p><small>'+j.items.filter(i=>i.status==='success').length+' 条已同步'+(j.retryOf?' · 失败重试':'')+'</small></div>'+button('查看详情','sync-job-detail','text-btn','data-job="'+j.id+'"')+'</div>').join('')+'</div>':'<div class="empty"><h3>还没有同步记录</h3><p>检查并确认成片后，即可同步到素材管理。</p></div>',button('关闭','close'));
 }
 function retry(j) {
  if(!j)return;const b=findBatch(j.batchId),failed=j.items.filter(i=>i.status==='failed');
  if(!b||!failed.length){toast('未找到可重试的失败素材');return;}
  const candidates=failed.map(i=>b.outputs.find(o=>o.id===i.outputId)).filter(Boolean);
  if(candidates.length!==failed.length||failed.some(i=>outputVersion(b.outputs.find(o=>o.id===i.outputId))!==i.version)){toast('失败素材的内容版本已变化，请重新确认并从成片列表同步新版本');return;}
  if(candidates.some(o=>!confirmed(o))){toast('请先确认失败素材的当前版本可用');return;}
  if(j.items.some(i=>['pending','processing','unknown'].includes(i.status))){toast('请先查询待核实素材的同步结果，再重试失败项');return;}
  const expired=j.target==='domestic'&&(!j.form?.onlineDate||j.form.onlineDate<businessDate());
  if(!currentSchema(j)||expired){
   activeJob=null;draft={batchId:b.id,ids:candidates.map(o=>o.id),versions:candidates.map(o=>({id:o.id,version:outputVersion(o)})),target:j.target,form:null,retryOf:j.id,retryNotice:expired?'原上线日期已过期，请核对今天或之后的上线日期，再确认重试。':'请核对上传信息，再确认重试失败素材。'};setTarget(j.target,j);return;
  }
  try{const now=new Date(),validation=validateSyncForm(j.form,j.target,extraTags(),now),items=prepareSync(b,candidates,j.target,j.form,jobs(),extraTags(),now);const retryJob=createJob(b,j.target,validation.normalized,items,'normal',j.id);showJob(retryJob.id);runJob(retryJob);}catch(e){toast(e.message);}
 }
 function query(j,el) {
  el.disabled=true;el.textContent='查询中…';
  after(()=>{if(!jobs().includes(j))return;j.items.filter(i=>i.status==='unknown').forEach(i=>completeItem(j,i));updateJob(j);toast('已核实示例结果，未重复上传素材');},600);
 }
 function handle(action,el) {
  const b=getBatch();
  switch(action){
   case 'sync-open-one':open(b,[b.outputs.find(o=>o.id===el.dataset.id)].filter(Boolean));break;
   case 'sync-open-selected':open(b,api.getSelectedOutputs());break;
   case 'sync-target':setTarget(el.dataset.target);break;
   case 'sync-change-target':draft.target=null;draft.form=null;showTarget();break;
   case 'sync-tag-manager':if(draft?.target!=='domestic')return;tagManager=!tagManager;$('#syncTagManager').hidden=!tagManager;break;
   case 'sync-add-tag':{if(draft?.target!=='domestic')return;const label=$('#syncNewTag').value.trim();if(!label){toast('请输入标签名称');return;}if(Array.from(label).length>20){toast('标签名称最多20字');return;}if(tags(draft.target).some(t=>t.label===label)){toast('该标签已存在，请直接选择');return;}const item={id:'domestic-custom-'+Date.now(),label,target:'domestic'};extraTags().push(item);draft.form.tagIds.push(item.id);save();$('#syncTagOptions').innerHTML=tagsHTML();$('#syncTagsSummary').textContent=tags(draft.target).filter(t=>draft.form.tagIds.includes(t.id)).map(t=>t.label).join('、');$('#syncNewTag').value='';toast('已新增标签并选中');break;}
   case 'sync-submit':submit();break;
   case 'sync-records':records(b);break;
   case 'sync-record-one':records(b,el.dataset.id);break;
   case 'sync-job-detail':showJob(el.dataset.job);break;
   case 'sync-retry':retry(jobs().find(j=>j.id===el.dataset.job));break;
   case 'sync-query':query(jobs().find(j=>j.id===el.dataset.job),el);break;
  }
 }
 document.addEventListener('input',e=>{if(!draft?.form)return;if(e.target.dataset.syncField&&Object.hasOwn(draft.form,e.target.dataset.syncField))draft.form[e.target.dataset.syncField]=e.target.value;});
 document.addEventListener('change',e=>{if(!draft?.form)return;if(e.target.dataset.syncField&&Object.hasOwn(draft.form,e.target.dataset.syncField))draft.form[e.target.dataset.syncField]=e.target.value;if(draft.target==='domestic'&&e.target.dataset.syncTag){const id=e.target.dataset.syncTag;draft.form.tagIds=e.target.checked?[...new Set([...draft.form.tagIds,id])]:draft.form.tagIds.filter(t=>t!==id);$('#syncTagsSummary').textContent=tags(draft.target).filter(t=>draft.form.tagIds.includes(t.id)).map(t=>t.label).join('、')||'请选择标签（可多选）';}});
 $('#dialog').addEventListener('close',()=>{delete $('#dialog').dataset.syncJob;activeJob=null;draft=null;});
 function invalidate(o) {o.contentVersion=outputVersion(o)+1;o.confirmed=false;o.confirmedVersion=null;o.confirmedAt=null;}
 function reset() {timers.forEach(t=>clearTimeout(t));timers.clear();draft=null;activeJob=null;initialize();}
 return {open,handle,badgeFor,rowAction,reviewActions,reviewNotice,locked,confirmed,canSync,invalidate,reset,isBusy:()=>timers.size>0};
}
