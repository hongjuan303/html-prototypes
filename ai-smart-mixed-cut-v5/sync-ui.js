import { TARGETS, TARGET_DATA, targetForBatch, outputVersion, validateSyncForm, getOutputSync, prepareSync } from './sync-model.js?v=20260916-publish1';

// Only simulates delivery state; no target system or local video is contacted.
export function createSyncUI(api) {
 const {getState,save,render,toast,modal,closeModal,button,esc,getBatch,getOutput}=api;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 let draft=null,activeJob=null,tagManager=false;
 const timers=new Set();
 const targets=id=>TARGETS.find(t=>t.id===id);
 const jobs=()=>getState().syncJobs;
 const extraTags=()=>getState().customTags;
 const tags=target=>[...TARGET_DATA[target].tags,...extraTags().filter(t=>t.target===target)];
 const findBatch=id=>getState().batches.find(b=>b.id===id);
 const current=(b,o)=>getOutputSync(b.id,o,jobs());
 const confirmed=o=>!o.narrationDraft&&o.status==='ready'&&o.confirmed&&(!o.confirmedVersion||o.confirmedVersion===outputVersion(o));
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
  const old=history(b,o).some(j=>j.items.some(i=>i.outputId===o.id&&i.status==='success'));
  return '<div class="sync-review-notice"><span>当前成片 V'+outputVersion(o)+' · '+(confirmed(o)?'剪辑已确认':'待剪辑确认')+'</span>'+badgeFor(b,o)+(old?'<p>已同步版本保留在素材管理中。此处修改、退款或取消确认不会自动替换或撤回旧素材。</p>':'<p>确认当前版本没有问题后，可同步到对应投放系统。</p>')+'</div>';
 }
 function batchStrip(b) {
  const count=status=>b.outputs.filter(o=>current(b,o)?.status===status).length;
  return '<div class="sync-batch-strip"><div><strong>素材交付</strong><span>已同步 '+count('success')+' 条</span><span>待同步 '+b.outputs.filter(o=>canSync(b,o)).length+' 条</span>'+(count('failed')?'<span class="error-text">失败 '+count('failed')+' 条</span>':'')+(count('unknown')?'<span>待核实 '+count('unknown')+' 条</span>':'')+'</div>'+button('查看同步记录','sync-records','text-btn')+'</div>';
 }
 function setTarget(target) {
  const b=findBatch(draft.batchId),data=TARGET_DATA[target];if(!data)return;
  const mapped=targetForBatch(b)===target?data.dramas.find(d=>d.greenCollectionId===b.config.source.collectionId):null;
  draft.target=target;draft.form={directoryId:'',designerId:data.designers[0].id,dramaId:mapped?.id||'',tagIds:[],onlineDate:''};draft.dramaQuery=mapped?.label||'';draft.mapped=!!mapped;tagManager=false;showForm();
 }
 function open(b,outputs) {
  activeJob=null;
  if(!b||!outputs.length){toast('请先勾选已确认可用的成片');return;}
  if(outputs.some(o=>o.narrationDraft)){toast('所选素材有未保存的文案，请先保存或放弃修改');return;}
  if(outputs.some(o=>!confirmed(o))){toast('选中的素材尚未全部确认，请先检查并确认当前版本');return;}
  if(outputs.some(o=>!canSync(b,o))){toast('选中项包含已同步或结果待核实的版本，请查看同步记录');return;}
  const failed=outputs.length===1?current(b,outputs[0]):null;
  if(failed?.status==='failed'){showJob(failed.job.id);return;}
  draft={batchId:b.id,ids:outputs.map(o=>o.id),target:null,form:null};
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
  const body='<div class="sync-route-band"><strong>'+t.systemLabel+' · 素材管理</strong><span>'+(targetForBatch(b)?'已根据'+(draft.target==='domestic'?'国内短剧':'海外短剧')+'自动匹配':'已选择'+t.label)+'</span>'+(!targetForBatch(b)?button('更换系统','sync-change-target','text-btn'):'')+'</div><div id="syncFormErrors" class="sync-form-errors" role="alert" hidden></div><details class="sync-basic" open><summary>素材基本信息</summary><div class="sync-form">'+
   field('上传目录','<select id="syncDirectory" data-sync-field="directoryId" aria-label="上传目录" required>'+options(data.directories,f.directoryId,'选择上传目录')+'</select>')+
   field('设计师（剪辑）','<select id="syncDesigner" data-sync-field="designerId" aria-label="设计师（剪辑）" required>'+options(data.designers,f.designerId,'请选择')+'</select>')+
   field('关联剧集','<div class="sync-drama-picker"><input id="syncDramaSearch" aria-label="关联剧集" placeholder="输入剧集名称搜索并选择" autocomplete="off" value="'+esc(draft.dramaQuery)+'"><div id="syncDramaOptions" class="sync-drama-options" hidden></div></div>',draft.mapped?'已自动关联，可修改。':'请从'+t.systemLabel+'的剧集列表中选择，不能只输入名称。')+
   field('素材标签','<div class="sync-tags-row"><details class="sync-tags-combo"><summary id="syncTagsSummary">'+(f.tagIds.length?esc(tags(draft.target).filter(i=>f.tagIds.includes(i.id)).map(i=>i.label).join('、')):'请选择标签（可多选）')+'</summary><div id="syncTagOptions" class="sync-tag-options">'+tagsHTML()+'</div></details>'+button('标签管理','sync-tag-manager','sync-primary')+'</div><div id="syncTagManager" class="sync-tag-manager" hidden><p>新增'+t.label+'标签 · 仅在本 Demo 生效</p><div><input id="syncNewTag" maxlength="20" aria-label="新标签名称" placeholder="输入标签名称">'+button('新增','sync-add-tag','secondary')+'</div></div>')+
   field('上线时间','<input id="syncOnlineDate" type="date" data-sync-field="onlineDate" aria-label="上线时间" required value="'+esc(f.onlineDate)+'"><p class="sync-date-warning">该时间设置后会影响素材保护规则，请谨慎设置！</p>')+
   '</div></details>';
  modalShow('上传素材',body,'<span class="sync-footer-note">本次同步不新增示例积分消耗</span>'+button('取消','close')+button('确定同步 '+selectedItems.length+' 条','sync-submit','sync-primary',selectedItems.length?'':'disabled'));
 }
 function tagsHTML() {return tags(draft.target).map(t=>'<label><input type="checkbox" data-sync-tag="'+esc(t.id)+'" '+(draft.form.tagIds.includes(t.id)?'checked':'')+'> '+esc(t.label)+'</label>').join('');}
 function showDramaOptions() {
  const q=draft.dramaQuery.trim().toLowerCase(),items=TARGET_DATA[draft.target].dramas.filter(d=>d.label.toLowerCase().includes(q));
  $('#syncDramaOptions').hidden=false;$('#syncDramaOptions').innerHTML=items.length?items.map(d=>button(esc(d.label),'sync-drama-pick','text-btn','data-id="'+d.id+'"')).join(''):'<p>未找到剧集，请调整关键词或到投放系统维护剧集。</p>';
 }
 function errors(message) {const el=$('#syncFormErrors');if(el){el.hidden=false;el.textContent=message;$('.sync-basic').open=true;el.scrollIntoView({block:'nearest'});}else toast(message);}
 function submit() {
  if(!draft)return;const b=findBatch(draft.batchId),outputs=b.outputs.filter(o=>draft.ids.includes(o.id));
  try {
   const items=prepareSync(b,outputs,draft.target,draft.form,jobs(),extraTags());
   const normalized=validateSyncForm(draft.form,draft.target,extraTags()).normalized;
   const job=createJob(b,draft.target,normalized,items,getState().syncScenario||'normal');draft=null;showJob(job.id);runJob(job);
  }catch(e){errors(e.message);}
 }
 function createJob(b,target,form,items,scenario='normal',retryOf=null) {
  const data=TARGET_DATA[target],label=(group,id)=>data[group].find(v=>v.id===id)?.label||id;
  const j={id:'SYNC-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,5),batchId:b.id,target,form:JSON.parse(JSON.stringify(form)),createdAt:new Date().toISOString(),status:'processing',scenario,retryOf,simulated:true,source:JSON.parse(JSON.stringify(b.config.source||{kind:'sample'})),labels:{directory:label('directories',form.directoryId),designer:label('designers',form.designerId),drama:label('dramas',form.dramaId),tags:tags(target).filter(t=>form.tagIds.includes(t.id)).map(t=>t.label)},items:items.map(i=>{const o=b.outputs.find(x=>x.id===i.outputId);return {...i,title:o.title,duration:o.duration,filename:o.id+'-V'+i.version+'.mp4',confirmedAt:o.confirmedAt||null};})};
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
 function renderJobBody(j) {
  const success=j.items.filter(i=>i.status==='success').length,failed=j.items.filter(i=>i.status==='failed').length,unknown=j.items.filter(i=>i.status==='unknown').length;
  $('#dialogBody').innerHTML='<div class="sync-route-band"><strong>'+targets(j.target).systemLabel+' · 素材管理</strong>'+tag('同步演示','orange')+'</div><div class="sync-job-summary"><h3>'+ (j.status==='processing'?'正在同步':j.status==='success'?'同步完成':unknown?'同步结果待核实':'部分素材未同步')+'</h3><p>成功 '+success+' / '+j.items.length+' 条'+(failed?' · 失败 '+failed+' 条':'')+(unknown?' · 待核实 '+unknown+' 条':'')+'</p></div><dl class="sync-record-meta"><div><dt>上传目录</dt><dd>'+esc(j.labels.directory)+'</dd></div><div><dt>设计师（剪辑）</dt><dd>'+esc(j.labels.designer)+'</dd></div><div><dt>关联剧集</dt><dd>'+esc(j.labels.drama)+'</dd></div><div><dt>素材标签</dt><dd>'+esc(j.labels.tags.join('、'))+'</dd></div><div><dt>上线时间</dt><dd>'+esc(j.form.onlineDate)+'</dd></div></dl><div class="sync-job-items">'+j.items.map(i=>'<div class="sync-job-row"><div><strong>'+esc(i.title)+' · V'+i.version+'</strong><p>'+statusName(i.status)+(i.materialId?' · 素材 ID：'+esc(i.materialId):'')+'</p>'+(i.syncedAt?'<small>'+new Date(i.syncedAt).toLocaleString('zh-CN')+'</small>':'')+(i.error?'<small class="error-text">'+esc(i.error)+'</small>':'')+'</div>'+tag(statusName(i.status),i.status==='success'?'green':i.status==='failed'||i.status==='unknown'?'orange':'gray')+'</div>').join('')+'</div><p class="sync-modal-note">记录对应提交时的成片版本。</p>';
  $('#dialogActions').innerHTML=button('全部同步记录','sync-records')+(unknown?button('查询同步结果','sync-query','secondary','data-job="'+j.id+'"'):'')+(failed?button('仅重试失败 '+failed+' 条','sync-retry','sync-primary','data-job="'+j.id+'"'):'')+button('关闭','close');
 }
 function records(b,outputId=null) {
  activeJob=null;const records=jobs().filter(j=>j.batchId===b.id&&(!outputId||j.items.some(i=>i.outputId===outputId)));
  modalShow('同步到素材管理的记录',records.length?'<p class="sync-modal-note">按提交时版本保留记录；修改成片不会覆盖原同步记录。</p><div class="sync-job-items">'+records.map(j=>'<div class="sync-job-row"><div><strong>'+targets(j.target).label+' · '+j.items.length+' 条</strong><p>'+esc(j.labels.drama)+' · '+new Date(j.createdAt).toLocaleString('zh-CN')+'</p><small>'+j.items.filter(i=>i.status==='success').length+' 条已同步'+(j.retryOf?' · 失败重试':'')+'</small></div>'+button('查看详情','sync-job-detail','text-btn','data-job="'+j.id+'"')+'</div>').join('')+'</div>':'<div class="empty"><h3>还没有同步记录</h3><p>检查并确认成片后，即可同步到素材管理。</p></div>',button('关闭','close'));
 }
 function retry(j) {
  const b=findBatch(j.batchId),failed=j.items.filter(i=>i.status==='failed');
  const candidates=failed.map(i=>b.outputs.find(o=>o.id===i.outputId)).filter(Boolean);
  if(failed.some(i=>outputVersion(b.outputs.find(o=>o.id===i.outputId))!==i.version)){toast('失败素材的内容版本已变化，请重新确认并从成片列表同步新版本');return;}
  try{const items=prepareSync(b,candidates,j.target,j.form,jobs(),extraTags());const retryJob=createJob(b,j.target,j.form,items,'normal',j.id);showJob(retryJob.id);runJob(retryJob);}catch(e){toast(e.message);}
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
   case 'sync-drama-pick':{const item=TARGET_DATA[draft.target].dramas.find(d=>d.id===el.dataset.id);draft.form.dramaId=item.id;draft.dramaQuery=item.label;$('#syncDramaSearch').value=item.label;$('#syncDramaOptions').hidden=true;break;}
   case 'sync-tag-manager':tagManager=!tagManager;$('#syncTagManager').hidden=!tagManager;break;
   case 'sync-add-tag':{const label=$('#syncNewTag').value.trim();if(!label){toast('请输入标签名称');return;}if(tags(draft.target).some(t=>t.label===label)){toast('该标签已存在，请直接选择');return;}const item={id:draft.target+'-custom-'+Date.now(),label,target:draft.target};extraTags().push(item);draft.form.tagIds.push(item.id);save();$('#syncTagOptions').innerHTML=tagsHTML();$('#syncTagsSummary').textContent=tags(draft.target).filter(t=>draft.form.tagIds.includes(t.id)).map(t=>t.label).join('、');$('#syncNewTag').value='';toast('已新增示例标签并选中');break;}
   case 'sync-submit':submit();break;
   case 'sync-records':records(b);break;
   case 'sync-record-one':records(b,el.dataset.id);break;
   case 'sync-job-detail':showJob(el.dataset.job);break;
   case 'sync-retry':retry(jobs().find(j=>j.id===el.dataset.job));break;
   case 'sync-query':query(jobs().find(j=>j.id===el.dataset.job),el);break;
  }
 }
 document.addEventListener('input',e=>{if(!draft?.form)return;if(e.target.dataset.syncField)draft.form[e.target.dataset.syncField]=e.target.value;if(e.target.id==='syncDramaSearch'){draft.dramaQuery=e.target.value;draft.form.dramaId='';draft.mapped=false;showDramaOptions();}});
 document.addEventListener('change',e=>{if(!draft?.form)return;if(e.target.dataset.syncField)draft.form[e.target.dataset.syncField]=e.target.value;if(e.target.dataset.syncTag){const id=e.target.dataset.syncTag;draft.form.tagIds=e.target.checked?[...new Set([...draft.form.tagIds,id])]:draft.form.tagIds.filter(t=>t!==id);$('#syncTagsSummary').textContent=tags(draft.target).filter(t=>draft.form.tagIds.includes(t.id)).map(t=>t.label).join('、')||'请选择标签（可多选）';}});
 document.addEventListener('focusin',e=>{if(draft?.form&&e.target.id==='syncDramaSearch')showDramaOptions();});
 document.addEventListener('click',e=>{if($('#syncDramaOptions')&&!e.target.closest('.sync-drama-picker'))$('#syncDramaOptions').hidden=true;});
 $('#dialog').addEventListener('close',()=>{delete $('#dialog').dataset.syncJob;activeJob=null;});
 function invalidate(o) {o.contentVersion=outputVersion(o)+1;o.confirmed=false;o.confirmedVersion=null;o.confirmedAt=null;}
 function reset() {timers.forEach(t=>clearTimeout(t));timers.clear();draft=null;activeJob=null;initialize();}
 return {handle,badgeFor,rowAction,reviewActions,reviewNotice,batchStrip,locked,confirmed,canSync,invalidate,reset};
}
