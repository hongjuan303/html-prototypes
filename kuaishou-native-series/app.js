(() => {
  'use strict';
  const D=KSData,M=KSModel,R=KSRecords,U=KSUpload,$=s=>document.querySelector(s),key='kuaishou-native-series-v1';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saved;try{saved=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  let records=Array.isArray(saved?.records)?saved.records:M.clone(D.records),draft=saved?.draft||null;
  let editDrafts=saved?.editDrafts||{};
  if(saved?.version!==2)for(const seed of D.records.filter(r=>/^R-DEMO-0[678]$/.test(r.id)))if(!records.some(r=>r.id===seed.id))records.push(M.clone(seed));
  records.forEach(r=>R.normalize(r,D.collections,D.records));
  let state={editingId:'',view:'records',step:1,account:'',targets:{},selected:[],configs:{},active:'',filters:R.defaultFilters(),collectionQ:'',collectionType:'',agreed:false,batch:'',page:1,checked:[]};
  let toastTimer,dialogFocus,running=new Set(),lastModal=null,assignmentIds=[];
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify({version:2,records,draft,editDrafts}))}catch{toast('本地存储空间不足，请保持当前页面打开')}};
  const scrollPrototypeTop=()=>$('#prototypeViewport').scrollTo({left:0,top:0});
  const account=id=>D.accounts.find(a=>a.id===id)||{name:'—',uid:'—'};
  const now=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  const badge=(txt,tone='muted')=>`<span class="badge ${tone}">${esc(txt)}</span>`;
  const dot=(txt,tone)=>`<span class="dot-status ${tone}">${esc(txt)}</span>`;
  const btn=(text,action,primary=false,attrs='')=>`<button class="btn${primary?' primary':''}" data-action="${action}" ${attrs}>${text}</button>`;
  const link=(text,action,attrs='')=>`<button class="link" data-action="${action}" ${attrs}>${text}</button>`;
  const empty=(message='暂无符合条件的数据',hint='试试调整筛选条件')=>`<div class="empty"><svg viewBox="0 0 64 64"><path d="M15 17h25l10 11v28H15zM40 17v12h10M23 37h19M23 45h12M19 10h25l12 13"/></svg><p>${message}</p><small>${hint}</small></div>`;
  function poster(d,portrait=false){
    const [bg,fg]=D.colors[Number(d.cover??0)%D.colors.length],title=String(d.title||d.name||'短剧').slice(0,18),w=portrait?300:480,h=portrait?400:300;
    const lines=title.match(/.{1,5}/g)||['短剧'];
    const xml=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><path d="M0 ${h*.8} L${w*.3} ${h*.48} L${w*.55} ${h*.71} L${w*.8} ${h*.46} L${w} ${h*.76} V${h} H0Z" fill="${fg}" opacity=".13"/><circle cx="${w*.78}" cy="${h*.22}" r="${h*.11}" fill="${fg}" opacity=".22"/><path d="M22 22h${w-44}v${h-44}H22Z" stroke="${fg}" stroke-opacity=".4" fill="none"/><text x="${w/2}" y="${h*.2}" fill="${fg}" font-size="13" letter-spacing="7" text-anchor="middle">原 生 短 剧</text>${lines.map((t,i)=>`<text x="${w/2}" y="${h*.45+i*42}" fill="${fg}" font-family="serif" font-size="34" text-anchor="middle" font-weight="500">${esc(t)}</text>`).join('')}<text x="${w/2}" y="${h-35}" fill="${fg}" opacity=".7" font-size="11" letter-spacing="4" text-anchor="middle">演示封面</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  }
  function cover(d,portrait=true,cls=''){return `<img class="cover ${portrait?'':'landscape'} ${cls}" src="${esc(d.coverUrl||poster(d,portrait))}" alt="${esc(d.title||d.name)}封面">`}
  function drama(d,extra=''){return `<div class="drama-cell">${cover(d)}<div class="drama-meta"><div class="drama-title">${esc(d.title||d.name)}</div><div class="meta-line">合集ID：${esc(d.collectionId||d.id)}</div>${extra}</div></div>`}
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
  function modal(title,body,footer='',wide=false){
    dialogFocus=document.activeElement;lastModal=title;$('#overlay').hidden=false;$('#overlay').innerHTML=`<div class="overlay"><section class="dialog ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="dialogTitle"><header><h2 id="dialogTitle">${esc(title)}</h2><button class="icon-btn" data-action="close" aria-label="关闭弹窗">×</button></header><div class="dialog-body">${body}</div><footer>${footer||btn('关闭','close')}</footer></section></div>`;
    $('#overlay').querySelectorAll('.field').forEach(f=>{const label=f.querySelector('label:not([for])'),control=f.querySelector('input:not([type=hidden]),select,textarea');if(label&&control?.id&&!label.querySelector('input'))label.htmlFor=control.id});
    document.body.style.overflow='hidden';$('#overlay button, #overlay input')?.focus();
  }
  function closeModal(){KSAccountManager.cleanup();const old=dialogFocus;$('#overlay').hidden=true;$('#overlay').innerHTML='';document.body.style.overflow='';lastModal=null;if(old?.isConnected)old.focus()}
  function options(items,value,placeholder='请选择'){return `<option value="">${placeholder}</option>`+Object.entries(items).map(([v,t])=>`<option value="${esc(v)}" ${String(value)===v?'selected':''}>${esc(t)}</option>`).join('')}
  function accountFilter(){
    const ids=U.unique(state.filters.account);
    return `<div class="account-filter"><span class="filter-label">快手号</span><details class="account-filter-menu"><summary aria-label="快手号筛选（多选）"><span>${esc(ids.length?ids.map(id=>account(id).name).join('、'):'全部快手号')}</span><i>⌄</i></summary><div class="account-filter-options">${D.accounts.map(a=>`<label><input type="checkbox" class="multi-account-option" data-filter-account="${a.id}" ${ids.includes(a.id)?'checked':''}><span>${esc(a.name)}<small>${esc(a.uid)}</small></span></label>`).join('')}</div></details></div>`;
  }
  const targetsFor=id=>state.editingId?[state.account]:U.unique(state.targets[id]);
  const uploadPlan=()=>U.plan(state.selected,state.targets);
  const targetNames=id=>targetsFor(id).map(a=>account(a).name).join('、');
  function showTargetPicker(id){
    assignmentIds=id?[id]:[...state.selected];if(!assignmentIds.length)return toast('请先选择合集');
    const common=targetsFor(assignmentIds[0]).filter(a=>assignmentIds.every(id=>targetsFor(id).includes(a)));
    modal(id?'设置目标快手账号':'批量设置目标快手账号',`<p class="target-scope">${id?esc(state.configs[id]?.title||D.collections.find(c=>c.id===id)?.name):'已选 '+assignmentIds.length+' 部合集'}</p><p class="bulk-hint">可选择多个快手账号，确认后覆盖所选合集的账号配置；已有上传记录的合集与账号组合会跳过。</p><input class="target-search" id="targetAccountSearch" placeholder="搜索快手账号名称或ID" aria-label="搜索目标快手账号"><div class="target-account-list">${D.accounts.map(a=>{const duplicates=assignmentIds.filter(id=>M.duplicate(records,a.id,id)).length,disabled=!a.valid||duplicates===assignmentIds.length;return `<label class="target-account-option ${disabled?'disabled':''}" data-account-search="${esc(a.name+' '+a.uid)}"><input type="checkbox" data-target-account="${a.id}" ${common.includes(a.id)&&!disabled?'checked':''} ${disabled?'disabled':''}><span><b>${esc(a.name)}</b><small>${esc(a.uid)}</small></span><em>${!a.valid?'授权已失效':duplicates===assignmentIds.length?'已有上传记录':duplicates?duplicates+' 部合集已有记录，将跳过':'授权有效'}</em></label>`}).join('')}</div><p class="bulk-hint" id="targetSelectionCount">已选择 ${common.filter(a=>D.accounts.find(x=>x.id===a)?.valid&&!assignmentIds.every(id=>M.duplicate(records,a,id))).length} 个账号</p>`,btn('取消','close')+btn('确认设置','apply-targets',true));
  }
  function applyTargets(){
    const ids=[...document.querySelectorAll('[data-target-account]:checked:not(:disabled)')].map(el=>el.dataset.targetAccount);
    const result=U.assign(assignmentIds,ids,state.targets,records,D.accounts);state.targets=result.targets;
    closeModal();render();toast(`已更新 ${assignmentIds.length} 部合集的目标账号${result.skipped.length?'，跳过 '+result.skipped.length+' 个已有或不可用组合':''}`);
  }
  function checkTargets(){
    const errors=U.issues(state.selected,state.targets,records,D.accounts);if(!errors.length)return true;
    modal('请完善目标快手账号',`<ul class="issue-list">${errors.map(x=>`<li><div><b>${esc(state.configs[x.id]?.title||x.id)}</b><small>${esc(x.message)}</small></div></li>`).join('')}</ul>`,btn('返回设置','return-targets',true));return false;
  }
  const current=()=>state.configs[state.active];
  const selectedConfigs=()=>state.selected.map(id=>state.configs[id]).filter(Boolean);
  function issuesFor(d){
    const xs=M.validate(d);
    if(selectedConfigs().some(other=>other.id!==d.id&&other.title.trim()===d.title.trim()&&targetsFor(other.id).some(a=>targetsFor(d.id).includes(a))))xs.push({tab:'base',field:'title',message:'本批次存在同名短剧，请修改标题'});
    if(records.some(r=>r.id!==state.editingId&&targetsFor(d.id).includes(r.account)&&r.title.trim()===d.title.trim()))xs.push({tab:'base',field:'title',message:'目标账号已有同名短剧，请检查上传记录'});
    return xs;
  }
  function saveDraft(quiet=false){if(state.editingId){editDrafts[state.editingId]={config:M.clone(current()),updated:now()};persist();if(!quiet)toast('编辑草稿已保存，不影响新增上传草稿');return;}draft={targets:M.clone(state.targets),selected:[...state.selected],configs:M.clone(state.configs),active:state.active,step:state.step,updated:now()};persist();if(!quiet)toast('草稿已保存，可在上传记录中继续编辑')}
  function resetFlow(selected=[]){state={...state,editingId:'',view:'workflow',step:1,account:'',targets:{},selected:[...selected],configs:{},active:'',agreed:false,showErrors:false,collectionQ:'',collectionType:''};for(const id of selected)state.configs[id]=M.createConfig(D.collections.find(c=>c.id===id));render();scrollPrototypeTop()}
  function restoreDraft(){if(!draft)return;state={...state,...M.clone(draft),targets:U.migrateTargets(draft),account:'',editingId:'',view:'workflow',agreed:false};state.configs=Object.fromEntries(Object.entries(state.configs).map(([id,d])=>[id,M.restoreConfig(d,D.collections.find(c=>c.id===id))]));state.step=Math.min(2,state.step||1);render();scrollPrototypeTop()}
  function render(){
    const y=$('#prototypeViewport').scrollTop;$('#crumb').textContent=state.view==='accounts'?'快手号管理':state.view==='collections'?'合集列表':state.view==='workflow'?(state.editingId?'编辑短剧':'新增批量上传'):'快手原生上剧';
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.action===(state.view==='accounts'?'accounts':state.view==='collections'?'collections':'records')));
    document.querySelectorAll('.route-tabs button').forEach(n=>n.classList.toggle('active',n.dataset.action===(state.view==='accounts'?'accounts':state.view==='collections'?'collections':'records')));
    $('#main').innerHTML=state.view==='accounts'?KSAccountManager.render():state.view==='workflow'?workflow():state.view==='collections'?collectionsPage():recordsPage();
    KSPrototypeNotes.render(state);
    $('#prototypeViewport').scrollTop=y;
  }
  const recordById=id=>records.find(r=>r.id===id);
  const validAccount=r=>!!D.accounts.find(a=>a.id===r.account)?.valid;
  const actionReason=(r,a)=>R.reason(r,a,validAccount(r));
  const timeCell=v=>v?`<span>${esc(v.split(' ')[0])}</span><div class="meta-line">${esc(v.split(' ')[1]||'')}</div>`:'<span class="muted">—</span>';
  function filteredRecords(){return records.filter(r=>R.matches(r,state.filters)&&(!state.batch||r.batch===state.batch));}
  function readFilters(){return Object.fromEntries(Object.keys(R.defaultFilters()).map(k=>[k,k==='account'?[...document.querySelectorAll('[data-filter-account]:checked')].map(el=>el.dataset.filterAccount):$(`[data-record-filter="${k}"]`)?.value.trim()??state.filters[k]??'']));}
  function recordsPage(){
    const rows=filteredRecords();state.page=Math.min(state.page,Math.max(1,Math.ceil(rows.length/10)));const slice=rows.slice((state.page-1)*10,state.page*10),f=state.filters;
    const textFilter=(key,label,placeholder)=>`<label><span>${label}</span><input data-record-filter="${key}" value="${esc(f[key])}" placeholder="${placeholder}"></label>`;
    const selectFilter=(key,label,items)=>`<label><span>${label}</span><select data-record-filter="${key}">${options(items,f[key],'全部')}</select></label>`;
    return `<div class="page-heading"><div><h1>快手原生上剧</h1></div></div>
    ${draft?.selected?.length?`<div class="draft-notice"><span>有一份未提交的草稿 · ${draft.selected.length}部合集 <small>保存于 ${esc(draft.updated)}</small></span><div class="actions">${link('删除草稿','delete-draft')}${btn('继续编辑','resume')}</div></div>`:''}
    ${state.batch?`<div class="result-banner"><div><h3>批量上传任务已创建</h3><p>正在展示本批次记录，可离开页面后继续查看进度。</p></div><div class="actions">${link('查看全部记录','clear-batch')}</div></div>`:''}
    <section class="panel"><div class="filter-grid management-filters">
      ${accountFilter()}
      ${textFilter('title','快手短剧名称','输入快手短剧名称')}${textFilter('collectionName','合集名称','输入绿台合集名称')}${textFilter('collectionId','合集ID','输入完整合集ID')}
      ${selectFilter('audit','审核状态',Object.fromEntries(Object.entries(M.audits).map(([k,v])=>[k,v[0]])))}${selectFilter('type','内容类型',{'1':'真人剧','2':'漫剧'})}${selectFilter('sale','售卖方式',M.sales)}${selectFilter('saleState','售卖状态',R.selling)}
      ${textFilter('miniId','快手短剧ID','输入完整快手短剧ID')}<div class="date-range"><span>创建时间</span><input type="date" data-record-filter="start" aria-label="创建开始日期" value="${esc(f.start)}"><span>至</span><input type="date" data-record-filter="end" aria-label="创建结束日期" value="${esc(f.end)}"></div>
      <div class="record-filter-footer"><div class="actions">${btn('重置','reset-filter')}${btn('查询','query',true)}</div></div>
    </div>
    <div class="toolbar"><strong>短剧列表</strong><small>共 ${rows.length} 条</small>${state.checked.length?`<span class="blue">已选 ${state.checked.length} 条</span>`:''}<div class="actions">${btn('＋ 新增批量上传','new',true)}${btn('刷新状态','refresh')}${btn('重试失败任务','batch-retry',false,state.checked.some(id=>records.find(r=>r.id===id)?.stage==='failed')?'':'disabled')}${link('导出记录','export')}</div></div>
    ${slice.length?`<div class="table-wrap management-table-wrap" tabindex="0" aria-label="短剧列表，可横向滚动查看全部字段"><table class="data-table management-table"><colgroup>${[42,150,238,195,116,90,142,110,185,140,142,142,130,142,142,212].map(w=>`<col style="width:${w}px">`).join('')}</colgroup><thead><tr><th><input type="checkbox" aria-label="全选当前页上传记录" data-record-all ${slice.every(r=>state.checked.includes(r.id))?'checked':''}></th><th>快手号</th><th>快手短剧名称 / 封面</th><th>绿台合集名称 / 合集ID</th><th>售卖方式</th><th>内容类型</th><th>上传进度</th><th>审核状态</th><th>审核原因</th><th>售卖状态</th><th>预约上架时间</th><th>下架时间</th><th>操作人</th><th>创建时间</th><th>修改时间</th><th class="sticky-right">操作</th></tr></thead><tbody>${slice.map(recordRow).join('')}</tbody></table></div>`:empty()}
    <div class="pagination"><span class="total">左右滚动查看全部字段 · 时间均为北京时间</span><span>共 ${rows.length} 条</span><span>10条 / 页</span><button data-action="prev-records" ${state.page===1?'disabled':''} aria-label="上一页">‹</button><button class="current">${state.page}</button><button data-action="next-records" ${state.page*10>=rows.length?'disabled':''} aria-label="下一页">›</button></div></section>`;
  }
  function recordActions(r){
    const attrs=`data-id="${esc(r.id)}"`,editError=actionReason(r,'edit');
    let html=link('详情','detail',attrs)+`<button class="link" data-action="edit-record" ${attrs} ${editError?'disabled':''} title="${esc(editError||'修改本条短剧资料')}">${editDrafts[r.id]?'继续编辑':'编辑'}</button>`;
    if(r.stage==='failed')return html+link('重试上传','retry',attrs);
    if(r.schedule.status==='pending')return html+op('预约上架','modify-schedule');
    if(r.saleState==='online')return html+op('下架','offline');
    if(!actionReason(r,'online'))html+=op('上架','online')+op('预约上架','schedule');
    return html;
    function op(label,action){const error=actionReason(r,action);return `<button class="link" data-action="manage-record" data-kind="${action}" ${attrs} ${error?'disabled':''} title="${esc(error)}">${label}</button>`;}
  }
  function recordRow(r){const s=M.stages[r.stage],a=M.audits[r.audit];return `<tr>
    <td><input type="checkbox" aria-label="选择${esc(r.title)}记录" data-record="${esc(r.id)}" ${state.checked.includes(r.id)?'checked':''}></td>
    <td>${esc(account(r.account).name)}<div class="meta-line">${esc(account(r.account).uid)}</div></td>
    <td><div class="drama-cell">${cover(r,false)}<div class="drama-meta"><b class="drama-title">${esc(r.title)}</b><div class="meta-line">快手ID：${esc(r.miniId||'待创建')} ${r.miniId?`<button class="copy-id" data-action="copy-id" data-value="${esc(r.miniId)}" aria-label="复制${esc(r.title)}快手短剧ID">⧉</button>`:''}</div>${editDrafts[r.id]?badge('有编辑草稿','blue'):''}</div></div></td>
    <td><span class="drama-title">${esc(r.collectionName||'—')}</span><div class="meta-line">合集ID：${esc(r.collectionId)} <button class="copy-id" data-action="copy-id" data-value="${esc(r.collectionId)}" aria-label="复制${esc(r.title)}合集ID">⧉</button></div></td>
    <td>${M.sales[r.sale]||'—'}</td><td>${r.type==='1'?'真人剧':'漫剧'}</td>
    <td>${badge(s[0],s[1])}<div class="meta-line">${r.uploaded} / ${r.total} 集</div><div class="progress-track ${r.stage==='failed'?'failed':''}"><i style="width:${r.uploaded/r.total*100}%"></i></div>${r.stage==='failed'?`<button class="link reason-link" data-action="upload-failure" data-id="${esc(r.id)}">查看上传失败原因</button>`:''}</td>
    <td>${dot(a[0],a[1])}</td><td>${r.auditReason?`<div class="reason-preview" title="${esc(r.auditReason)}">${esc(r.auditReason)}</div>${link('展开','audit-reason',`data-id="${r.id}"`)}`:'<span class="muted">—</span>'}</td>
    <td>${dot(R.selling[r.saleState]||'未知',r.saleState==='online'?'green':'muted')}${r.disposeReason?`<div class="reason-preview" title="${esc(r.disposeReason)}">${esc(r.disposeReason)}</div>`:''}</td>
    <td>${timeCell(r.schedule.time)}</td><td>${timeCell(r.offlineAt)}</td><td>${esc(r.modifiedBy||r.createdBy||'—')}</td><td>${timeCell(r.date)}</td><td>${timeCell(r.modifiedAt)}</td><td class="sticky-right"><div class="small-actions">${recordActions(r)}</div></td></tr>`;}
  function manageRecord(id,kind){
    const r=recordById(id);if(!r)return;const error=actionReason(r,kind);if(error)return toast(error);
    const scheduling=['schedule','modify-schedule'].includes(kind),titles={online:'确认上架',offline:'确认下架',schedule:'设置预约上架','modify-schedule':'设置预约上架'};
    modal(titles[kind],`<div class="schedule-identity"><div><small>快手号</small><b>${esc(account(r.account).name)} · ${esc(account(r.account).uid)}</b></div><div><small>快手短剧名称</small><b>${esc(r.title)}</b></div><div><small>快手短剧ID</small><b>${esc(r.miniId)}</b></div></div>${scheduling?`<div class="field"><label class="require" for="scheduleTime">预约上架时间（北京时间）</label><input type="datetime-local" id="scheduleTime" step="1" value="${kind==='modify-schedule'?esc(r.schedule.time.replace(' ','T')):''}"><div class="hint">请选择未来的时间；预约上架时间可在列表查看，执行结果在详情中查看。</div><div id="scheduleError" role="alert" class="field-error"></div></div>`:`<div class="note ${kind==='offline'?'warning':''}">${kind==='offline'?'下架后，该短剧将停止售卖。':'当前售卖状态为已下架、审核状态为发布成功，上架后该短剧进入售卖状态。'}</div>`}`,btn('取消','close')+btn(scheduling?'确认预约':titles[kind],'confirm-management',true,`data-id="${id}" data-kind="${kind}"`));
  }
  function confirmManagement(id,kind){
    const r=recordById(id);if(!r)return;const error=R.apply(r,kind,{valid:validAccount(r),value:$('#scheduleTime')?.value||''});
    if(error){if($('#scheduleError')){$('#scheduleError').textContent=error;$('#scheduleTime').setAttribute('aria-invalid','true')}return toast(error);}
    persist();closeModal();render();toast({online:'短剧已上架',offline:'短剧已下架',schedule:'预约设置成功','modify-schedule':'预约时间已更新'}[kind]+'（演示）');
  }
  function syncSchedules(){let changed=false;for(const r of records)changed=R.executeDue(r,validAccount(r))||changed;if(changed){persist();if(state.view==='records'&&$('#overlay').hidden&&!document.activeElement?.matches('[data-record-filter]'))render();}return changed;}
  function visibleCollections(){return D.collections.filter(c=>(!state.collectionQ||[c.name,c.id].join(' ').includes(state.collectionQ))&&(!state.collectionType||c.sourceType===state.collectionType))}
  function collectionTable(isSource=false){
    const rows=visibleCollections();return rows.length?`<div class="table-wrap"><table class="data-table picker-table multi-target-table"><colgroup><col style="width:42px"><col style="width:250px"><col style="width:85px"><col style="width:100px"><col style="width:130px"><col style="width:110px"><col style="width:275px"></colgroup><thead><tr><th><input data-select-all type="checkbox" aria-label="全选当前筛选合集" ${rows.every(c=>state.selected.includes(c.id))?'checked':''}></th><th>合集信息</th><th>短剧类型</th><th>可用 / 总集数</th><th>内容标签</th><th>更新时间</th><th>${isSource?'快手上传记录':'目标快手账号（可多选）'}</th></tr></thead><tbody>${rows.map(c=>{const selected=state.selected.includes(c.id),ids=targetsFor(c.id);return `<tr class="${selected?'picked':''}"><td><input type="checkbox" data-select="${c.id}" aria-label="选择合集${esc(c.name)}" ${selected?'checked':''}></td><td>${drama(c)}</td><td>${c.sourceType}</td><td><span class="${c.episodes.some(e=>!e.ready)?'orange':''}">${c.episodes.filter(e=>e.ready).length} / ${c.total}</span><div class="meta-line">${c.completed==='true'?'已完结':'连载中'}</div></td><td>${c.tags.map(t=>badge(t)).join(' ')}</td><td class="muted">${c.updated}</td><td>${isSource?(records.some(r=>r.collectionId===c.id)?badge('已关联快手','blue'):badge('可新建','green')):`<div class="target-tags">${ids.length?ids.map(a=>badge(account(a).name,D.accounts.find(x=>x.id===a)?.valid?'blue':'red')).join(''):'<span class="muted">未设置目标账号</span>'}</div>${btn(ids.length?'调整账号':'选择快手号','set-targets',false,`data-id="${c.id}"`)}`}</td></tr>`}).join('')}</tbody></table></div>`:empty('未找到符合条件的合集','换一个名称、合集ID或内容类型试试');
  }
  function searchCollections(){return `<div class="search-inline"><input id="collectionSearch" value="${esc(state.collectionQ)}" placeholder="搜索合集名称 / 合集ID" aria-label="搜索合集"><select id="collectionType" aria-label="短剧类型">${options({'AI剧':'AI剧','真人剧':'真人剧'},state.collectionType,'全部短剧类型')}</select>${btn('查询','search-collections')}${link('重置','reset-collections')}<div class="selection-count">已选择 <b>${state.selected.length}</b> 部合集${state.selected.length?' · '+state.selected.reduce((n,id)=>n+(D.collections.find(c=>c.id===id)?.total||0),0)+' 集':''}</div></div>`}
  function collectionsPage(){return `<div class="page-heading"><div><h1>合集列表</h1><p class="sub">选择绿台已有合集，批量上传到快手原生短剧</p></div><div class="actions">${btn('上传到快手','source-upload',true,state.selected.length?'':'disabled')}</div></div><section class="panel">${searchCollections()}${collectionTable(true)}<div class="pagination"><span class="total">共 ${visibleCollections().length} 部合集</span><span>10条 / 页</span><button class="current">1</button></div></section>`}
  function workflow(){
    if(state.editingId)return recordEditor();
    const configs=selectedConfigs(),issueCount=configs.reduce((n,d)=>n+issuesFor(d).length,0),ready=configs.filter(d=>!issuesFor(d).length).length;
    return `<div class="page-heading"><button class="icon-btn" data-action="exit-flow" aria-label="返回上传记录">←</button><div><h1>新增批量上传</h1><p class="sub">${state.step===1?'选择合集后，可批量设置多个目标快手账号':`已选 ${configs.length} 部合集 · ${new Set(uploadPlan().map(p=>p.account)).size} 个快手账号 · ${uploadPlan().length} 条上传记录`}</p></div><div class="actions">${btn('保存草稿','save-draft',false,state.selected.length?'':'disabled')}</div></div>
      <div class="steps">${['选择合集','配置资料','确认上传'].map((name,i)=>`${i?`<div class="step-line ${state.step>i?'done':''}"></div>`:''}<div class="step ${state.step===i+1?'active':state.step>i+1?'done':''}"><i>${state.step>i+1?'✓':i+1}</i><span>${name}</span></div>`).join('')}</div>
      ${state.step===1?`<section class="panel">${searchCollections()}<div class="target-toolbar"><span>已配置账号 <b>${state.selected.filter(id=>targetsFor(id).length).length} / ${configs.length}</b> 部合集 · 将生成 <b>${uploadPlan().length}</b> 条上传记录</span>${btn('批量设置快手账号','bulk-targets',false,state.selected.length?'':'disabled')}</div>${collectionTable()}<div class="pagination"><span class="total">共 ${visibleCollections().length} 部合集 · 选中结果在筛选后保留</span><span>10条 / 页</span><button class="current">1</button></div></section>`:state.step===2?editor():confirmation()}
      <div class="workflow-footer"><div class="footer-summary">已选 <b>${configs.length}</b> 部合集 · <b>${configs.reduce((n,d)=>n+d.total,0)}</b> 集 · <b>${uploadPlan().length}</b> 条上传记录${state.step>1?`<span> · 资料完整 <b>${ready}</b> 部</span>${issueCount?`<em>${issueCount} 项待处理</em>`:''}`:''}</div>${btn('取消','exit-flow')}${state.step>1?btn('上一步','prev'):''}${state.step<3?btn(state.step===1?'下一步：配置资料':'下一步：确认上传','next',true,state.step===1&&!configs.length?'disabled':''):btn('确认并开始上传','submit',true,state.agreed?'':'disabled')}</div>`;
  }
  function editor(){
    if(!state.selected.includes(state.active))state.active=state.selected[0];const d=current(),xs=issuesFor(d),allIssues=selectedConfigs().reduce((n,c)=>n+issuesFor(c).length,0);
    return `<div class="note"><span>ⓘ</span><span>${state.editingId?'当前短剧资料已带入，可保存编辑草稿后继续修改。':'合集已有资料已带入，修改仅用于本次快手上传。后台将按原集序自动上传合集全部视频。'}</span>${link('检查全部资料','validate-all')}</div><div class="workspace-editor">
      <aside class="collection-nav"><div class="collection-nav-head"><b>本次上传合集</b><small>${state.selected.length} 部</small></div><div class="collection-nav-body">${selectedConfigs().map(c=>{const n=issuesFor(c).length;return `<button class="collection-item ${c.id===state.active?'active':''}" data-action="edit-collection" data-id="${c.id}">${cover(c)}<span class="info"><strong>${esc(c.title)}</strong><small>${c.total}集 · ${c.sourceType}</small>${badge(n?`${n}项待处理`:'资料完整',n?'orange':'green')}</span></button>`}).join('')}</div><div class="collection-nav-foot">${link('返回选择合集','prev')}</div></aside>
      <section class="editor-panel"><div class="editor-head"><div><h2>${esc(d.title)}</h2><small>合集ID：${d.id} · ${d.total}集</small>${state.editingId?'':`<div class="editor-targets">目标快手号：${esc(targetNames(d.id))}</div>`}</div><div class="actions">${badge(xs.length?`${xs.length}项待处理`:'资料完整',xs.length?'orange':'green')}</div></div>
      <div class="editor-body config-sections"><section class="config-section" id="config-base"><h3>基础信息</h3>${baseForm(d)}</section><section class="config-section" id="config-rights"><h3>版权与备案</h3>${rightsForm(d)}</section><section class="config-section" id="config-sale"><h3>售卖信息</h3>${saleForm(d)}</section></div></section></div>`;
  }

  function field(d,k,label,control,hint='',_source=false,required=true,full=false){const er=state.showErrors?issuesFor(d).find(x=>x.field===k):null;return `<div class="field ${full?'full':''} ${er?'error':''}" id="field-${k}"><label for="f-${k}" class="${required?'require':''}">${label}</label>${control}${hint?`<div class="hint">${hint}</div>`:''}${er?`<div class="field-error">${esc(er.message)}</div>`:''}</div>`}
  const input=(d,k,placeholder='',type='text',extra='')=>`<input id="f-${k}" data-field="${k}" type="${type}" value="${esc(d[k])}" placeholder="${esc(placeholder)}" ${extra}>`;
  const select=(d,k,items,placeholder='请选择')=>`<select id="f-${k}" data-field="${k}">${options(items,d[k],placeholder)}</select>`;
  const radio=(d,k,items)=>`<div class="radio-row">${Object.entries(items).map(([v,l])=>`<label><input type="radio" name="${k}" data-field="${k}" value="${v}" ${String(d[k])===v?'checked':''}>${l}</label>`).join('')}</div>`;
  const categorySummary=d=>d.tags.length?d.tags.map(t=>`<span class="category-selected">${esc(t)}</span>`).join(''):'<span class="muted">请选择短剧分类</span>';
  function categoryControl(d){return `<details class="category-select"><summary id="f-tags" aria-label="短剧分类（最多选择3个）"><span class="category-selection">${categorySummary(d)}</span><i aria-hidden="true">⌄</i></summary><div class="category-menu"><div class="category-limit" aria-live="polite">已选 ${d.tags.length}/3${d.tags.length>=3?'，取消已选项后可继续选择':''}</div><div class="category-options" role="group" aria-label="短剧分类选项">${D.tags.map(t=>`<label><input type="checkbox" data-category="${esc(t)}" ${d.tags.includes(t)?'checked':''} ${d.tags.length>=3&&!d.tags.includes(t)?'disabled':''}><span>${esc(t)}</span></label>`).join('')}</div></div></details>`;}
  function updateCategories(el){
    const d=current(),tag=el.dataset.category;if(!d)return;
    if(el.checked&&!d.tags.includes(tag)){if(d.tags.length>=3){el.checked=false;return toast('最多选择3个分类')}d.tags.push(tag);}
    else if(!el.checked)d.tags=d.tags.filter(t=>t!==tag);
    const root=el.closest('.category-select');root.querySelector('.category-selection').innerHTML=categorySummary(d);
    root.querySelector('.category-limit').textContent=`已选 ${d.tags.length}/3${d.tags.length>=3?'，取消已选项后可继续选择':''}`;
    root.querySelectorAll('[data-category]').forEach(input=>input.disabled=d.tags.length>=3&&!input.checked);
  }
  function baseForm(d){return `<div class="form-grid">
    ${field(d,'title','短剧标题',input(d,'title','输入快手短剧标题'),'快手短剧标题最多20字符，超长时请修改。',true,true,false)}
    ${field(d,'cover','短剧封面',`<div class="cover-editor"><div class="cover-preview ${!d.coverValid?'cover-error':''}">${cover(d,false)}</div><div>${btn(d.coverValid?'更换封面':'选择合规封面','cover')}<div class="hint">8:5 · JPG / PNG / BMP / JPEG<br>10M以内</div>${!d.coverValid?'<div class="field-error">当前合集封面比例不符合快手要求</div>':''}</div></div>`,'',true,true,false)}
    ${field(d,'desc','短剧简介',`<textarea id="f-desc" data-field="desc" placeholder="输入100～400字简介">${esc(d.desc)}</textarea>`,`100～400字符<span class="counter" id="descCount">${[...d.desc.trim()].length} / 400</span>`,true,true,true)}
    ${field(d,'tags','短剧分类',categoryControl(d),'最多选择3个快手分类，请核对带入的选项。',true,true,true)}
    ${field(d,'type','内容类型',radio(d,'type',{'1':'真人剧','2':'漫剧'}),'',true)}
    ${d.type==='2'?field(d,'method','漫剧制作方式',select(d,'method',D.methods)):''}
    ${field(d,'declaration','作者声明',select(d,'declaration',{'0':'内容无需添加声明','1':'含AI生成内容'}),'按本部短剧的实际内容选择。')}
    ${field(d,'completed','是否完结',radio(d,'completed',{'true':'是','false':'否'}),'',true)}
    </div>`}
  function attachment(d,k,label){return d[k]?`<div class="attachment"><span>▧ ${esc(d[k])}</span>${link('更换','material',`data-field-name="${k}" data-label="${label}"`)}</div>`:`<button class="btn" data-action="material" data-field-name="${k}" data-label="${label}">＋ 选择已有材料 / 添加附件</button>`}
  const copyrightHints={
    authorization:'需同时提供至少一种版权证明材料。授权文件应包含授权双方、有效期及短剧名称；被授权方应与入驻经营者主体一致，不一致时需补充关联证明或授权书。',
    registration:'支持JPEG/JPG/PNG，每张不超过5M，可上传1～2张。图片须清晰；作品登记证书著作权人与入驻经营者主体不一致时，需补充双方授权书。',
    agreement:'支持JPEG/JPG/PNG，每张不超过5M。请上传清晰的制作协议或权属声明；著作权归属方与入驻经营者主体不一致时，需补充双方授权书。',
    shootPromise:'上传已填写的承诺函，支持JPEG/JPG/PNG，每张不超过5M。',
    shoot:'上传不少于4张现场拍摄图或短剧工程文件相关图片，支持JPEG/JPG/PNG，每张不超过5M。',
    timePromise:'上传已填写的承诺函，支持JPEG/JPG/PNG，每张不超过5M。',
    timestamp:'支持JPEG/JPG/PNG，每张不超过5M。保护类型为视听作品；认证主体与入驻经营者主体不一致时，需补充双方授权书。'
  };
  function copyrightSelector(d){
    const selected=M.copyrightTypes(d);
    return `<details class="category-select copyright-select"><summary id="f-copyrightMaterial" aria-label="版权证明材料（多选）"><span class="category-selection">${selected.length?selected.map(t=>`<span class="category-selected">${esc(M.copyrightKinds[t].label)}<button type="button" data-action="remove-proof-type" data-value="${t}" aria-label="移除${esc(M.copyrightKinds[t].label)}">×</button></span>`).join(''):'<span class="muted">请选择版权证明材料</span>'}</span><i aria-hidden="true">⌄</i></summary><div class="category-menu"><div class="category-options" role="group" aria-label="版权证明材料选项">${Object.entries(M.copyrightKinds).map(([t,s])=>`<label><input type="checkbox" data-proof-type="${t}" ${selected.includes(t)?'checked':''}><span>${esc(s.label)}</span></label>`).join('')}</div></div></details>`;
  }
  function copyrightUploadField(d,slot){
    const spec=M.copyrightSlots[slot],value=M.copyrightUpload(d,slot),pdf=value.mode==='pdf',files=pdf?value.pdfs:value.images,k=slot==='authorization'?slot:'proof-'+slot;
    const error=state.showErrors?issuesFor(d).find(x=>x.field===k):null;
    const hint=pdf?'请上传清晰、完整的PDF证明文件。'+(slot==='authorization'?copyrightHints[slot]:'证明内容与主体要求同图片材料。'):copyrightHints[slot];
    return `<div class="field copyright-upload ${error?'error':''}" id="field-${k}"><label class="require">${esc(spec.label)}${link(pdf?'⇌ 切换为上传图片':'⇌ 切换为上传PDF','proof-mode',`data-slot="${slot}" aria-label="${esc(spec.label)}：${pdf?'切换为上传图片':'切换为上传PDF'}"`)}</label><div class="proof-files">${files.map((f,i)=>`<div class="proof-file"><span class="proof-file-icon" aria-hidden="true">${pdf?'PDF':'▧'}</span><span class="proof-filename" title="${esc(f.name)}">${esc(f.name)}</span><button type="button" class="proof-remove" data-action="remove-proof-file" data-slot="${slot}" data-index="${i}" aria-label="删除${esc(f.name)}">×</button></div>`).join('')}<label class="proof-upload-tile" for="upload-${slot}" ${!pdf&&spec.max&&files.length>=spec.max?'hidden':''}><span aria-hidden="true">＋</span>${pdf?'上传PDF':slot.endsWith('Promise')?'上传承诺函':'上传图片'}<input id="upload-${slot}" class="visually-hidden" type="file" data-proof-slot="${slot}" multiple accept="${pdf?'.pdf':'.jpeg,.jpg,.png'}" aria-label="上传${esc(spec.label)}${pdf?'PDF':'图片'}"></label></div><div class="hint">${esc(hint)}</div>${error?`<div class="field-error">${esc(error.message)}</div>`:''}</div>`;
  }
  function copyrightPanels(d){return M.copyrightTypes(d).map(t=>`<section class="copyright-panel" data-proof-panel="${t}">${['4','5'].includes(t)?`<h4>${t==='4'?'现场拍摄图/短剧工程文件':'可信时间戳认证证书'}</h4>`:''}${M.copyrightKinds[t].slots.map(slot=>copyrightUploadField(d,slot)).join('')}</section>`).join('');}
  function updateProofTypes(values,focusType){
    current().copyrightMaterials=[...new Set(values)];render();
    const menu=$('.copyright-select');menu.open=true;(focusType?menu.querySelector(`[data-proof-type="${focusType}"]`):menu.querySelector('summary'))?.focus({preventScroll:true});
  }
  function showProofRequirements(){modal('版权证明材料要求',`<p>可同时选择多种材料；每种已选材料都需补齐对应证明。</p><ul class="proof-requirements"><li><b>作品登记证书：</b>图片1～2张，每张不超过5M。</li><li><b>短剧制作协议：</b>上传制作协议或权属声明，图片每张不超过5M。</li><li><b>承诺函+现场拍摄图/短剧工程文件：</b>分别上传承诺函和不少于4张相关图片，每张不超过5M。</li><li><b>承诺函+可信时间戳认证：</b>分别上传承诺函和可信时间戳认证证书，图片每张不超过5M。</li><li><b>授权版权：</b>除以上证明外，还需提供授权推广文件。</li></ul><p>各上传区支持图片/PDF切换；切换后仅校验并提交当前格式的附件。切换格式、取消材料类型后，已选附件暂存，再切回可恢复。</p><p class="bulk-hint">原型仅在本地记录附件名称及规格；正式文件上传、PDF大小/数量限制及平台承诺函模板链接待接入核对。</p>`,btn('关闭','close'));}
  function rightsForm(d){return `<div class="section-title">版权信息</div><div class="form-grid">
    ${field(d,'copyrightType','版权证明类型',select(d,'copyrightType',{'1':'自有版权','2':'授权版权'}))}
    ${d.copyrightType==='2'?`<section class="copyright-panel authorization-panel">${copyrightUploadField(d,'authorization')}</section>`:''}
    ${field(d,'copyrightMaterial',`版权证明材料${link('查看要求','proof-requirements')}`,copyrightSelector(d),'',false,true,true)}
    ${copyrightPanels(d)}
    ${d.copyrightType==='2'?`${field(d,'authRange','授权有效期',KSAuthRange.html(d))}${field(d,'subAuth','是否具有转授权权利',radio(d,'subAuth',{'true':'是','false':'否'}),'',false,true,true)}`:''}
    <div class="field-divider"></div><div class="section-title" style="grid-column:1/-1;margin-bottom:0">备案信息</div>
    ${field(d,'filing','是否有备案号',radio(d,'filing',{'true':'是','false':'否'}),'',true,true,true)}
    ${d.filing==='true'?`${field(d,'filingType','备案号类型',select(d,'filingType',{'2':'重点备案号','3':'普通备案号'}))}${field(d,'filingNo','备案号',input(d,'filingNo','填写该类型的备案号'),'合集备案号需核对所属平台与类型。',true)}`:d.filing==='false'?productionForm(d):''}
    </div>`}
  function personGroup(d,key){
    const g=M.peopleGroups[key],people=M.personnel(d,key),single=g.max===1;
    if(single&&people.length>1)return `<div class="field personnel-group" id="field-${key}"><label class="require">${g.label}信息</label><div class="note warning">历史资料中有多位制作人，请选定一位制片人。</div><select aria-label="选择一位制片人" data-single-person="${key}"><option value="">请选择保留的制片人</option>${people.map((p,i)=>`<option value="${i}">${esc(p.name||'未填写姓名')}（${i+1}）</option>`).join('')}</select></div>`;
    const personField=(p,i,k,label,required=false,type='text')=>{
      const f=`people-${key}-${i}-${k}`,error=state.showErrors?issuesFor(d).find(x=>x.field===f):null;
      const attrs=`id="f-${f}" data-person-group="${key}" data-person-index="${i}" data-person-field="${k}" ${required?'required':''}`;
      return `<div class="person-field ${error?'error':''}" id="field-${f}"><label for="f-${f}" class="${required?'require':''}">${label}</label>${k==='gender'?`<select ${attrs}>${options({'男':'男','女':'女'},p[k],'请选择')}</select>`:`<input ${attrs} type="${type}" value="${esc(p[k])}" placeholder="${k==='role'?'请输入角色名':type==='date'?'请选择':'请输入'}">`}${error?`<div class="field-error">${esc(error.message)}</div>`:''}</div>`;
    };
    return `<div class="field personnel-group" id="field-${key}"><label class="require">${g.label}信息${single?'':` <span class="person-count">（至少添加${g.min}名）</span>`}</label><div class="person-cards">${people.map((p,i)=>`<section class="person-card" role="group" aria-label="${g.label}${single?'':i+1}"><header><strong>${g.label}${single?'':i+1}</strong>${single?'':`<button class="person-delete" data-action="delete-person" data-group="${key}" data-index="${i}" aria-label="删除${g.label}${i+1}" ${people.length<=g.min?'disabled':''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg>删除</button>`}</header><div class="person-fields">${personField(p,i,'name',g.label+'姓名',true)}${personField(p,i,'gender',g.label+'性别',true)}${g.role?personField(p,i,'role','演员角色',true):''}${personField(p,i,'birthday','出生日期',false,'date')}${personField(p,i,'nationality',g.label+'国籍')}${personField(p,i,'company','所属公司')}</div></section>`).join('')}</div>${single?'':`<button class="add-card" data-action="add-person" data-group="${key}" ${g.max&&people.length>=g.max?'disabled':''}>＋ 新增${g.label}</button>${g.max?`<div class="hint">最多添加${g.max}名</div>`:''}`}</div>`;
  }
  function productionInfo(d){
    const license=`<div class="license-number">${input(d,'productionLicensePrefix','请输入','text','aria-label="制作许可证编号前缀"')}<span>字第</span>${input(d,'productionLicenseNumber','请输入','text','aria-label="制作许可证编号号码"')}<span>号</span></div>`;
    const permit=`<div class="production-permit"><button class="btn" data-action="material" data-field-name="productionPermit" data-label="广播电视节目制作经营许可证"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 14v7h16v-7"/></svg>点击上传</button>${d.productionPermit?`<div class="attachment"><span>📎 ${esc(d.productionPermit)}</span>${link('更换','material','data-field-name="productionPermit" data-label="广播电视节目制作经营许可证"')}</div>`:''}</div>`;
    return `<section class="production-info-group" aria-labelledby="production-info-title"><h4 id="production-info-title">制作信息</h4><div class="production-info-card">
      ${field(d,'productionCompany','制作机构',input(d,'productionCompany','请输入制作机构'))}
      ${field(d,'productionTaxId','制作机构税号',input(d,'productionTaxId','请输入'),'',false,false)}
      ${field(d,'productionLicense','制作许可证编号',license,'',false,false)}
      ${field(d,'productionCountry','制作方国别',input(d,'productionCountry','请输入'),'',false,false)}
      ${field(d,'productionProvince','制作机构归属省份',input(d,'productionProvince','请输入制作机构归属省份'),'',false,false)}
      ${field(d,'productionMonths','制作周期',`<div class="input-suffix">${input(d,'productionMonths','请输入制作周期','number','min="0.1" step="any"')}<span>月</span></div>`,'',false,false)}
      ${field(d,'productionPermit','广播电视节目制作经营许可证',permit,'',false,false,true)}
    </div></section>`;
  }
  function broadcastForm(d){
    const platforms=M.broadcastPlatforms(d);
    const itemField=(p,i,k,label)=>{
      const id=`broadcast-${i}-${k}`,error=state.showErrors?issuesFor(d).find(x=>x.field===id):null;
      const attrs=`id="f-${id}" data-broadcast-index="${i}" data-broadcast-field="${k}" required`;
      const control=k==='channel'?`<select ${attrs}>${options(Object.fromEntries(M.broadcastChannels.map(x=>[x,x])),p[k],'请选择')}</select>`:`<input ${attrs} type="${k==='date'?'date':'text'}" value="${esc(p[k])}" placeholder="${k==='date'?'选择日期':'请输入播出平台'}">`;
      return `<div class="field ${error?'error':''}" id="field-${id}"><label for="f-${id}" class="require">${label}</label>${control}${error?`<div class="field-error">${esc(error.message)}</div>`:''}</div>`;
    };
    return `<div class="field personnel-group broadcast-group" id="field-broadcastPlatforms"><label class="require">播出平台 <span class="person-count">（至少添加1个）</span></label><div class="person-cards">${platforms.map((p,i)=>`<section class="person-card" role="group" aria-label="播出平台${i+1}"><header><strong>播出平台${i+1}</strong><button class="person-delete" data-action="delete-broadcast" data-index="${i}" aria-label="删除播出平台${i+1}" ${platforms.length<=1?'disabled':''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg>删除</button></header><div class="person-fields broadcast-fields">${itemField(p,i,'name','播出平台')}${itemField(p,i,'channel','播出途径')}${itemField(p,i,'date','播出时间')}</div></section>`).join('')}</div><button class="add-card" data-action="add-broadcast">＋ 新增播出平台</button></div>`;
  }
  function productionForm(d){return `<div class="note warning" style="grid-column:1/-1;margin:0">未备案短剧需补充制作资料。已有字段可带入，缺失项需按实际情况填写。</div>${field(d,'productionCost','制作成本（万元）',input(d,'productionCost','例如：20.5','number','min="0.1" step="0.1"'))}${field(d,'avgMinutes','单集时长（分钟）',input(d,'avgMinutes','例如：2','number','min="0.1" step="0.1"'))}${field(d,'productionForm','制作形式',select(d,'productionForm',{'横屏':'横屏','竖屏':'竖屏'}))}${field(d,'productionYear','出品年份',input(d,'productionYear','例如：2026','number','min="1900" max="2100"'))}${productionInfo(d)}${Object.keys(M.peopleGroups).map(key=>personGroup(d,key)).join('')}${broadcastForm(d)}${field(d,'specialTheme','是否涉及特殊题材',select(d,'specialTheme',{'false':'否','true':'是（需核对平台专项资料）'}))}`}
  function episodePricing(d){return `<div class="episode-prices" role="group" aria-label="单集价格设置">${d.episodes.map(e=>{
    const error=state.showErrors?issuesFor(d).find(x=>x.field===`episode-price-${e.seq}`):null;
    return `<div class="episode-price-row ${error?'error':''}" id="field-episode-price-${e.seq}"><strong>第${e.seq}集</strong><div><div class="radio-row"><label><input type="radio" name="episode-free-${e.seq}" data-episode-free="${e.seq}" value="true" ${e.free?'checked':''}>免费</label><label><input type="radio" name="episode-free-${e.seq}" data-episode-free="${e.seq}" value="false" ${!e.free?'checked':''}>付费</label></div>${!e.free?`<label class="episode-price-label" for="episode-price-${e.seq}">单集价格（元）</label><input id="episode-price-${e.seq}" aria-label="第${e.seq}集价格（元）" data-episode-price="${e.seq}" type="number" min="0.1" max="100" step="0.01" value="${esc(e.price)}" placeholder="0.10～100">`:''}${error?`<div class="field-error">${esc(error.message)}</div>`:''}</div></div>`;
  }).join('')}</div>`;}
  function saleForm(d){
    const descriptions={'0':'只允许购买全集付费解锁观看单集内容','2':'单集付费和全集付费两种方式均展示','3':'通过观看激励广告解锁更多剧集'};
    return `<div class="section-title" id="field-sale">售卖方式</div><div class="sale-options" role="group" aria-label="售卖方式">${Object.entries(M.sales).map(([v,l])=>`<button class="sale-option ${d.sale===v?'active':''}" data-action="sale-mode" data-value="${v}" aria-pressed="${d.sale===v}"><span class="radio-mark"></span><span><strong>${l}</strong><small>${descriptions[v]}</small></span></button>`).join('')}</div>${!M.sales[d.sale]?`<div class="note warning">请选择售卖方式。</div>`:''}<div class="form-grid">
      ${['0','2'].includes(d.sale)?field(d,'price','全剧价格（元）',input(d,'price','0.10～99999','number','step="0.01" min="0.1" max="99999"'),'最多两位小数。'):''}
      ${d.sale==='2'?field(d,'episodePrices','单集价格设置',episodePricing(d),'按原集序展示，仅设置免费或付费及单集价格，视频仍由后台上传。'):''}
      ${d.sale==='3'?`${field(d,'unlock','每次观看广告解锁',select(d,'unlock',Object.fromEntries(Array.from({length:8},(_,i)=>[String(i+1),(i+1)+'集']))))}${field(d,'smallFree','是否支持小额免广',radio(d,'smallFree',{'true':'是','false':'否'}))}<div class="note full" style="grid-column:1/-1">观看广告解锁（IAA）模式的免费卡点由平台规则处理。</div>`:''}
      </div>`;
  }
  function confirmation(){const ds=selectedConfigs(),plan=uploadPlan();return `<section class="panel"><div class="panel-head"><h2>确认本次上传</h2>${badge('资料检查通过','green')}</div><div class="confirm-grid"><div><small>合集 / 目标账号</small><strong>${ds.length}<span>部合集 · ${new Set(plan.map(p=>p.account)).size} 个账号</span></strong></div><div><small>上传记录</small><strong>${plan.length}<span>条</span></strong></div><div><small>分集上传总次数</small><strong>${plan.reduce((n,p)=>n+state.configs[p.collectionId].total,0)}<span>次</span></strong></div></div><div class="confirmation-info">后台按原集序上传每部合集的全部视频；每个目标账号生成独立记录，分别跟踪上传进度和审核结果。</div><div class="table-wrap"><table class="data-table" style="min-width:1000px"><colgroup><col style="width:245px"><col style="width:235px"><col style="width:90px"><col style="width:90px"><col style="width:130px"><col style="width:90px"><col style="width:90px"></colgroup><thead><tr><th>短剧信息</th><th>目标快手账号</th><th>分集数量</th><th>内容类型</th><th>售卖方式</th><th>上传记录数</th><th class="sticky-right">操作</th></tr></thead><tbody>${ds.map(d=>`<tr><td>${drama(d)}</td><td><div class="target-tags">${targetsFor(d.id).map(a=>badge(account(a).name,'blue')).join('')}</div></td><td>${d.total}集</td><td>${d.type==='1'?'真人剧':'漫剧'}</td><td>${M.sales[d.sale]}<div class="meta-line">${d.sale==='3'?`每次解锁${d.unlock}集`:`全剧 ¥${Number(d.price).toFixed(2)}${d.sale==='2'?'<br>单集价格已配置':''}`}</div></td><td>${targetsFor(d.id).length}条</td><td class="sticky-right">${link('修改','confirm-edit',`data-id="${d.id}"`)}</td></tr>`).join('')}</tbody></table></div><label class="confirm-check"><input type="checkbox" id="confirmUpload" ${state.agreed?'checked':''}><span>已核对各合集的目标快手账号与短剧资料，确认由后台上传全集视频并提交审核。</span></label></section>`}
  function showIssues(){const groups=selectedConfigs().map(d=>({d,xs:issuesFor(d)})).filter(g=>g.xs.length);if(!groups.length){toast('所有合集资料检查通过');return true;}state.showErrors=true;modal('请先处理以下问题',`<div class="note warning">${groups.length}部合集存在待处理项。点击“去补齐”可定位到对应资料。</div><ul class="issue-list">${groups.flatMap(({d,xs})=>xs.map(x=>`<li><span class="red">!</span><div><b>${esc(d.title)}</b><small>${esc(x.message)}</small></div>${link('去补齐','goto-issue',`data-id="${d.id}" data-tab="${x.tab}" data-field-name="${x.field}"`)}</li>`)).join('')}</ul>`,btn('返回修改','close'),true);return false}
  function showMaterials(fieldName,label){const d=current();modal(`选择${label}`,`<div class="note">示例材料库仅演示选择流程，提交演示不会上传文件。</div><div class="material-grid">${[label+'（演示）.pdf',label+'补充材料（演示）.png'].map(name=>`<button class="material-card" data-action="pick-material" data-field-name="${fieldName}" data-value="${esc(d.title+'-'+name)}"><div style="height:74px;display:grid;place-items:center;font-size:32px;color:#8ba5bd;background:#f3f6fa">▧</div><strong>${esc(d.title+'-'+name)}</strong><small>示例附件</small></button>`).join('')}</div><div style="margin-top:20px"><label class="btn" for="materialFile">＋ 选择本地附件</label><input class="visually-hidden" id="materialFile" type="file" accept=".pdf,.png,.jpg,.jpeg" data-file-field="${fieldName}"><p class="bulk-hint">本地附件仅记录文件名，用于交互预览。</p></div>`,btn('取消','close'));}
  function showCovers(){const d=current();modal('选择短剧封面',`<div class="note">请选择8:5的短剧封面。以下是可用于评审的示例封面。</div><div class="material-grid">${[0,1,2].map((v)=>`<button class="material-card" data-action="pick-cover" data-value="${(Number(d.cover)+v)%8}"><img src="${poster({...d,cover:(Number(d.cover)+v)%8})}" alt="${esc(d.title)}封面方案${v+1}"><strong>封面方案 ${v+1}</strong><small>8:5 · 示例封面</small></button>`).join('')}</div><div style="margin-top:20px"><label class="btn" for="coverFile">＋ 选择本地封面</label><input type="file" id="coverFile" accept="image/png,image/jpeg,image/bmp" class="visually-hidden"><p class="bulk-hint">会检查文件格式、大小与图片比例；仅用于本地预览。</p></div>`,btn('取消','close'));}
  function openRecordEditor(id){
    const r=recordById(id);if(!r)return;const error=actionReason(r,'edit');if(error)return toast(error);
    const config=M.restoreConfig(editDrafts[id]?.config||r.config,D.collections.find(c=>c.id===r.collectionId));
    state={...state,view:'workflow',editingId:id,account:r.account,selected:[r.collectionId],configs:{[r.collectionId]:config},active:r.collectionId,step:2,showErrors:false};
    closeModal();render();scrollPrototypeTop();
  }
  function recordEditor(){
    const r=recordById(state.editingId);
    return `<div class="page-heading"><button class="icon-btn" data-action="exit-flow" aria-label="返回短剧列表">←</button><div><h1>编辑短剧</h1><p class="sub">${esc(account(r.account).name)} · 快手短剧ID：${esc(r.miniId||'待创建')}</p></div><div class="actions">${btn('保存编辑草稿','save-draft')}</div></div><div class="note warning">修改后需重新提交审核。快手号、原合集关联及已上传视频保持不变。</div>${r.auditReason?`<div class="note error"><b>审核原因</b><span>${esc(r.auditReason)}</span></div>`:''}<div class="record-edit">${editor()}</div><div class="workflow-footer"><span class="footer-summary">${issuesFor(current()).length?'还有 '+issuesFor(current()).length+' 项资料待处理':'资料已完整，可提交审核'} · 原短剧ID保留</span>${btn('取消','exit-flow')}${btn('保存并提交审核','submit-record',true)}</div>`;
  }
  function submitRecord(confirm=false){
    const r=recordById(state.editingId);if(!r)return;const error=actionReason(r,'edit');if(error)return toast(error);if(!showIssues())return;
    if(!confirm)return modal('确认提交修改',`<div class="note">将更新《${esc(current().title)}》并重新提交审核，保留快手短剧ID ${esc(r.miniId||'待创建')} 和已上传分集。</div><p class="bulk-hint">提交后进入审核中，期间不可继续编辑。售卖状态保持已下架。</p>`,btn('返回修改','close')+btn('确认提交审核','confirm-record-submit',true));
    const d=M.clone(current());Object.assign(r,{title:d.title,cover:d.cover,coverUrl:d.coverUrl||'',type:d.type,sale:d.sale,config:d,audit:'pending',auditReason:'',fail:'',stage:'complete'});
    R.touch(r,'修改资料并提交审核');delete editDrafts[r.id];state.editingId='';state.view='records';state.selected=[];closeModal();persist();render();scrollPrototypeTop();toast('修改已提交审核，原短剧关联已保留（演示）');
  }
  function showRecordReason(id,kind){
    const r=recordById(id);if(!r)return;
    const title=kind==='audit'?'审核原因':'上传失败原因';
    const reason=kind==='audit'?r.auditReason:r.fail||r.uploadReason;
    modal(title,`<p class="failure-reason-text">${esc(reason||'暂无'+title)}</p>`);
  }
  function detail(id){
    const r=recordById(id);if(!r)return;const schedule=r.schedule;
    const kv=(label,value)=>`<div><small>${label}</small><b>${esc(value||'—')}</b></div>`;
    modal('短剧详情',`<div class="detail-summary">${cover(r,false)}<div><h2>${esc(r.title)}</h2><p>${esc(account(r.account).name)} · ${esc(account(r.account).uid)}　快手短剧ID：${esc(r.miniId||'待创建')}</p><div class="detail-badges">${badge(M.stages[r.stage][0],M.stages[r.stage][1])}${badge(M.audits[r.audit][0],M.audits[r.audit][1])}${badge(R.selling[r.saleState],r.saleState==='online'?'green':'muted')}</div></div></div>
    <div class="detail-kv">${kv('绿台合集名称',r.collectionName)}${kv('合集ID',r.collectionId)}${kv('上传集数 / 总集数',r.uploaded+' / '+r.total)}${kv('售卖方式',M.sales[r.sale])}${kv('内容类型',r.type==='1'?'真人剧':'漫剧')}${kv('创建人',r.createdBy)}${kv('创建时间（绿台记录）',r.date)}${kv('最近修改人',r.modifiedBy)}${kv('修改时间（人工操作）',r.modifiedAt)}${kv('下架时间（北京时间）',r.offlineAt)}</div>
    ${r.auditReason?`<div class="note error"><b>审核原因</b><span>${esc(r.auditReason)}</span></div>`:''}${r.stage==='failed'?`<div class="note error"><b>上传失败原因</b><span>${esc(r.fail||r.uploadReason)}。重试保留已上传分集与短剧ID。</span></div>`:''}${r.disposeReason?`<div class="note error"><b>平台处置原因</b><span>${esc(r.disposeReason)}</span></div>`:''}
    <h3>预约上架</h3><div class="detail-kv">${kv('预约状态',R.schedules[schedule.status])}${kv('预约时间（北京时间）',schedule.time)}${kv('实际执行时间',schedule.executedAt)}</div>${schedule.reason?`<div class="note error">${esc(schedule.reason)}</div>`:''}
    <div class="section-title">分集上传结果</div><div class="detail-episodes">${Array.from({length:r.total},(_,i)=>`<span title="第${i+1}集：${i<r.uploaded?'已上传':r.failedSeq?.includes(i+1)?'失败':'待上传'}" class="${i<r.uploaded?'ok':r.failedSeq?.includes(i+1)?'bad':''}">${i+1}</span>`).join('')}</div><p class="bulk-hint">绿色为已上传，红色为上传失败，灰色为待上传。上传完成与审核结果分别处理。</p>
    <h3 style="margin-top:24px">操作记录</h3>${r.logs.length?`<div class="operation-history">${r.logs.slice(0,20).map(log=>`<div><span>${esc(log.time)}</span><b>${esc(log.action)}</b><small>${esc(log.actor)}</small><p>${esc(log.detail||'')}</p></div>`).join('')}</div>`:'<p class="bulk-hint">暂无操作记录；本次操作起开始记录。</p>'}`,`<div class="small-actions">${recordActions(r).replace(link('详情','detail',`data-id="${esc(r.id)}"`),'')}</div>${btn('关闭','close')}`,true);
  }

  function submit(){
    if(!state.agreed)return;if(!checkTargets()||!showIssues())return;
    const batch='B-'+Date.now(),result=U.createRecords({selected:state.selected,targets:state.targets,configs:state.configs,records,accounts:D.accounts,batch,date:now(),failureCollection:D.collections[3].id});
    if(result.errors.length)return toast(result.errors[0].message);
    const newRows=result.records;records.unshift(...newRows);draft=null;state.view='records';state.batch=batch;state.page=1;state.filters=R.defaultFilters();state.checked=[];persist();render();scrollPrototypeTop();newRows.forEach(r=>runTask(r.id));
  }
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function runTask(id){if(running.has(id))return;const r=records.find(x=>x.id===id);if(!r||r.stage==='complete'||r.stage==='failed')return;running.add(id);try{
    if(!r.miniId){r.stage='creating';updateTask();await delay(650);r.miniId='KS-DEMO-'+String(Date.now()).slice(-7)+'-'+records.indexOf(r);}
    r.stage='uploading';r.fail='';r.failedSeq=[];updateTask();
    const videoProblems=M.videoIssues(r.config);if(videoProblems.length){r.stage='failed';r.fail=videoProblems.map(x=>x.message).join('；');r.uploadReason=r.fail;r.failedSeq=videoProblems.map(x=>x.seq).filter(Boolean);updateTask();return;}
    while(r.uploaded<r.total){await delay(850);if(r.simulateFailure&&!r.attempt&&r.uploaded>=20){r.stage='failed';r.fail='第21～30集视频链接已失效，后续分集等待上传';r.failedSeq=Array.from({length:Math.min(10,r.total-r.uploaded)},(_,i)=>r.uploaded+i+1);updateTask();return;}r.uploaded=Math.min(r.uploaded+10,r.total);updateTask();}
    r.stage='submitting';updateTask();await delay(700);r.stage='complete';r.audit='pending';r.uploadReason='';updateTask();
  }finally{running.delete(id)}}
  function updateTask(){persist();if(state.view==='records'&&!document.activeElement?.matches('#main input,#main select'))render()}
  function retry(id){const r=records.find(x=>x.id===id);if(!r||r.stage!=='failed')return;const error=actionReason(r,'retry');if(error)return toast(error);R.touch(r,'重试失败分集');const source=D.collections.find(c=>c.id===r.collectionId);if(source){const completed=r.config.episodes.filter(e=>e.seq<=r.uploaded);r.config.episodes=[...completed,...M.sourceEpisodes(r.config,source).filter(e=>e.seq>r.uploaded)];r.config.total=source.total;r.total=source.total;}r.attempt=(r.attempt||0)+1;r.stage=r.miniId?'uploading':'queued';r.fail='';r.failedSeq=[];closeModal();persist();render();runTask(id);toast('已开始重试，保留原短剧ID与已完成分集')}
  function exportRecords(){
    const rows=filteredRecords(),cols=['快手号','快手号ID','快手短剧名称','快手短剧ID','绿台合集名称','合集ID','售卖方式','内容类型','上传集数','总集数','上传状态','审核状态','审核原因','售卖状态','预约状态','预约上架时间（北京时间）','下架时间（北京时间）','预约失败原因','创建人','最近修改人','创建时间','修改时间','上传失败原因'];
    const values=rows.map(r=>[account(r.account).name,account(r.account).uid,r.title,r.miniId,r.collectionName,r.collectionId,M.sales[r.sale],r.type==='1'?'真人剧':'漫剧',r.uploaded,r.total,M.stages[r.stage][0],M.audits[r.audit][0],r.auditReason,R.selling[r.saleState],R.schedules[r.schedule.status],r.schedule.time,r.offlineAt,r.schedule.reason,r.createdBy,r.modifiedBy,r.date,r.modifiedAt,r.stage==='failed'?r.fail||r.uploadReason:'']);
    const csv=[cols,...values].map(row=>row.map(v=>{let text=String(v??'');if(/^[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='快手原生上剧-记录.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已发起导出，共'+rows.length+'条记录');
  }
  function exitFlow(){if(!state.selected.length){state.view='records';render();return;}modal('离开当前上传配置',`<p style="line-height:1.8">当前已选择 ${state.selected.length} 部合集。可保存为草稿，稍后继续补齐资料。</p>`,btn('继续编辑','close')+btn('不保存离开','discard-exit')+btn('保存草稿并离开','save-exit',true));}
  document.addEventListener('click',e=>{
    document.querySelectorAll('.account-filter-menu[open], .category-select[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false});
    const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id,v=el.dataset.value;
    if(a==='show-notes')return KSPrototypeNotes.show();
    if(a==='collapse')return $('#shell').classList.toggle('collapsed');
    if(a==='close')return closeModal();
    if(a==='edit-record')return openRecordEditor(id);
    if(a==='submit-record')return submitRecord();
    if(a==='confirm-record-submit')return submitRecord(true);
    if(KSAccountManager.handle(a,id))return;
    if(a==='demo-tools')return modal('演示工具',`<div class="note">此页面使用示例数据，所有操作只保存在当前浏览器。</div><p style="line-height:1.9">建议选择「长街有月」与「山河入梦」体验上传及失败重试。「春风知我意」展示版权和备案缺项，「逆光而来的你」展示后台上传时发现源视频缺失。</p><p class="bulk-hint">恢复初始示例会清除本原型的草稿与演示上传记录，恢复内置样例。</p>`,btn('关闭','close')+btn('恢复初始演示数据','reset-demo'));
    if(a==='reset-demo'){if(running.size)return toast('请等待当前演示上传结束后再恢复');records=M.clone(D.records).map(r=>R.normalize(r,D.collections,D.records));draft=null;editDrafts={};state={...state,view:'records',batch:'',selected:[],configs:{},checked:[],page:1,filters:R.defaultFilters()};persist();closeModal();render();scrollPrototypeTop();return toast('已恢复初始演示数据')}
    if(a==='new')return draft?.selected?.length?modal('已有未提交草稿','<p style="line-height:1.8">继续现有草稿，或新建一份批量上传。新建会替换当前草稿。</p>',btn('取消','close')+btn('新建上传','replace-draft')+btn('继续草稿','resume',true)):resetFlow();
    if(a==='replace-draft'){draft=null;persist();closeModal();return resetFlow();}
    if(a==='resume'){closeModal();return restoreDraft();}
    if(a==='delete-draft')return modal('删除草稿','<p>删除当前本地草稿后无法恢复，上传记录不受影响。</p>',btn('取消','close')+btn('删除草稿','confirm-delete-draft',true));
    if(a==='confirm-delete-draft'){draft=null;persist();closeModal();render();return toast('草稿已删除')}
    if(a==='collections'||a==='records'||a==='accounts'){if(state.view==='workflow'&&state.selected.length)saveDraft(true);state.view=a;state.editingId='';state.selected=[];state.batch='';render();scrollPrototypeTop();return;}
    if(a==='source-upload')return resetFlow(state.selected);
    if(a==='exit-flow')return exitFlow();
    if(a==='discard-exit'||a==='save-exit'){if(a==='save-exit')saveDraft(true);state.editingId='';closeModal();state.view='records';state.batch='';render();scrollPrototypeTop();return;}
    if(a==='save-draft')return saveDraft();
    if(a==='search-collections'){state.collectionQ=$('#collectionSearch').value.trim();state.collectionType=$('#collectionType').value;return render()}
    if(a==='reset-collections'){state.collectionQ='';state.collectionType='';return render()}
    if(a==='next'){
      if(state.step===1){if(!state.selected.length||!checkTargets())return;state.step=2;state.active=state.selected[0];}
      else {if(!checkTargets()||!showIssues())return;state.step=3;state.agreed=false;}
      render();scrollPrototypeTop();return;
    }
    if(a==='prev'){state.step=Math.max(1,state.step-1);state.agreed=false;render();scrollPrototypeTop();return;}
    if(a==='edit-collection'){state.active=id;render();scrollPrototypeTop();return;}
    if(a==='sale-mode'){current().sale=v;return render()}
    if(a==='add-broadcast'||a==='delete-broadcast'){
      const platforms=M.broadcastPlatforms(current());
      if(a==='add-broadcast')platforms.push(M.blankBroadcast());
      else {if(platforms.length<=1)return;platforms.splice(Number(el.dataset.index),1);}
      current().broadcastPlatforms=platforms;render();
      if(a==='add-broadcast')$(`#f-broadcast-${platforms.length-1}-name`)?.focus();
      return;
    }
    if(a==='add-person'||a==='delete-person'){
      const key=el.dataset.group,g=M.peopleGroups[key],rows=M.personnel(current(),key);
      if(a==='add-person'){if(g.max&&rows.length>=g.max)return;rows.push(M.blankPerson());}
      else {if(rows.length<=g.min)return;rows.splice(Number(el.dataset.index),1);}
      M.setPersonnel(current(),key,rows);render();
      if(a==='add-person')$(`#f-people-${key}-${rows.length-1}-name`)?.focus();
      return;
    }
    if(a==='validate-all')return showIssues();
    if(a==='goto-issue'){state.step=2;state.active=id;const f=el.dataset.fieldName;closeModal();render();const target=$('#field-'+f),viewport=$('#prototypeViewport');if(target)viewport.scrollTo({top:viewport.scrollTop+(target.getBoundingClientRect().top-viewport.getBoundingClientRect().top)/parseFloat(getComputedStyle(viewport).zoom)-24,behavior:'smooth'});return;}
    if(a==='set-targets')return showTargetPicker(id);
    if(a==='bulk-targets')return showTargetPicker();
    if(a==='apply-targets')return applyTargets();
    if(a==='return-targets'){closeModal();state.step=1;render();scrollPrototypeTop();return;}
    if(a==='cover')return showCovers();
    if(a==='pick-cover'){current().cover=Number(v);current().coverValid=true;delete current().coverUrl;closeModal();render();return toast('已设置本次上传封面')}
    if(a==='proof-requirements')return showProofRequirements();
    if(a==='remove-proof-type'){e.preventDefault();return updateProofTypes(M.copyrightTypes(current()).filter(t=>t!==v));}
    if(a==='proof-mode'){
      const slot=el.dataset.slot,value=M.copyrightUpload(current(),slot);value.mode=value.mode==='pdf'?'image':'pdf';M.setCopyrightUpload(current(),slot,value);render();return;
    }
    if(a==='remove-proof-file'){
      const slot=el.dataset.slot,value=M.copyrightUpload(current(),slot);value[value.mode==='pdf'?'pdfs':'images'].splice(Number(el.dataset.index),1);M.setCopyrightUpload(current(),slot,value);render();return;
    }
    if(a==='material')return showMaterials(el.dataset.fieldName,el.dataset.label);
    if(a==='pick-material'){current()[el.dataset.fieldName]=v;closeModal();render();return toast('已关联所选材料')}
    if(a==='confirm-edit'){state.step=2;state.active=id;return render()}
    if(a==='submit')return submit();
    if(a==='query'){const filters=readFilters();if(filters.start&&filters.end&&filters.start>filters.end)return toast('创建开始日期不能晚于结束日期');state.filters=filters;state.page=1;state.checked=[];return render()}
    if(a==='manage-record')return manageRecord(id,el.dataset.kind);
    if(a==='confirm-management')return confirmManagement(id,el.dataset.kind);
    if(a==='copy-id'){navigator.clipboard.writeText(v).then(()=>toast('ID已复制')).catch(()=>modal('复制ID',`<input aria-label="待复制ID" readonly value="${esc(v)}" style="width:100%">`,btn('关闭','close')));return;}
    if(a==='reset-filter'){state.filters=R.defaultFilters();state.page=1;state.batch='';return render()}
    if(a==='clear-batch'){state.batch='';return render()}
    if(a==='detail')return detail(id);
    if(a==='upload-failure')return showRecordReason(id,'upload');
    if(a==='audit-reason')return showRecordReason(id,'audit');
    if(a==='retry')return retry(id);
    if(a==='batch-retry'){const ids=state.checked.filter(x=>records.find(r=>r.id===x)?.stage==='failed');if(!ids.length)return;modal('重试失败任务',`<p style="line-height:1.8">将重试 ${ids.length} 条上传失败任务，保留各自快手短剧ID与已上传分集。</p>`,btn('取消','close')+btn('开始重试','confirm-batch-retry',true));return;}
    if(a==='confirm-batch-retry'){const ids=[...state.checked];closeModal();ids.forEach(retry);state.checked=[];return render()}
    if(a==='refresh'){syncSchedules();render();return toast('状态已刷新（演示）')}
    if(a==='export')return exportRecords();
    if(a==='prev-records'){state.page=Math.max(1,state.page-1);return render()}
    if(a==='next-records'){state.page++;return render()}
  });
  function updateBroadcastInput(el){
    if(!el.dataset.broadcastField||!current())return false;
    const platforms=M.broadcastPlatforms(current());
    platforms[Number(el.dataset.broadcastIndex)][el.dataset.broadcastField]=el.value;
    current().broadcastPlatforms=platforms;return true;
  }
  function updatePersonInput(el){
    if(!el.dataset.personField||!current())return false;
    const key=el.dataset.personGroup,rows=M.personnel(current(),key);
    rows[Number(el.dataset.personIndex)][el.dataset.personField]=el.value;
    M.setPersonnel(current(),key,rows);return true;
  }
  document.addEventListener('input',e=>{const el=e.target;if(updateBroadcastInput(el)||updatePersonInput(el))return;if(el.dataset.episodePrice&&current()){current().episodes.find(x=>x.seq===Number(el.dataset.episodePrice)).price=el.value;return;}if(el.id==='targetAccountSearch'){document.querySelectorAll('[data-account-search]').forEach(row=>row.hidden=!row.dataset.accountSearch.toLowerCase().includes(el.value.trim().toLowerCase()));return;}if(el.id==='scheduleTime'){$('#scheduleError').textContent='';el.removeAttribute('aria-invalid')}if(el.dataset.field&&current()){if(el.dataset.field==='desc'){if(!e.isComposing&&[...el.value.trim()].length>400)el.value=M.limitDescription(el.value);if($('#descCount'))$('#descCount').textContent=[...el.value.trim()].length+' / 400';}current()[el.dataset.field]=el.value;}});
  document.addEventListener('change',async e=>{
    const el=e.target;
    if(el.dataset.singlePerson&&el.value!==''){const key=el.dataset.singlePerson;M.setPersonnel(current(),key,[M.personnel(current(),key)[Number(el.value)]]);return render();}
    if(updateBroadcastInput(el)||updatePersonInput(el))return;
    if(el.dataset.episodeFree&&current()){current().episodes.find(x=>x.seq===Number(el.dataset.episodeFree)).free=el.value==='true';return render();}
    if(el.hasAttribute('data-proof-type')){
      const types=M.copyrightTypes(current()),t=el.dataset.proofType;
      return updateProofTypes(el.checked?[...types,t]:types.filter(x=>x!==t),t);
    }
    if(el.dataset.proofSlot){
      const slot=el.dataset.proofSlot,upload=M.copyrightUpload(current(),slot),kind=upload.mode==='pdf'?'pdfs':'images';
      if(!el.files.length)return;
      const incoming=[...el.files].map(f=>({name:f.name,size:f.size,type:f.type})),files=[...upload[kind]];
      for(const f of incoming)if(!files.some(x=>x.name===f.name&&x.size===f.size))files.push(f);
      const error=M.copyrightFileError(slot,upload.mode,files);if(error){el.value='';return toast(error);}
      upload[kind]=files;M.setCopyrightUpload(current(),slot,upload);render();return toast('已添加'+incoming.length+'个附件（本地预览）');
    }
    if(el.hasAttribute('data-category'))return updateCategories(el);
    if(el.hasAttribute('data-filter-account')){const ids=[...document.querySelectorAll('[data-filter-account]:checked')].map(x=>x.dataset.filterAccount);$('.account-filter-menu summary span').textContent=ids.length?ids.map(id=>account(id).name).join('、'):'全部快手号';return;}
    if(el.hasAttribute('data-target-account')){$('#targetSelectionCount').textContent='已选择 '+document.querySelectorAll('[data-target-account]:checked').length+' 个账号';return;}
    if(el.dataset.select){const id=el.dataset.select;if(el.checked&&!state.selected.includes(id)){state.selected.push(id);state.configs[id]??=M.createConfig(D.collections.find(c=>c.id===id))}else state.selected=state.selected.filter(x=>x!==id);render();return;}
    if(el.hasAttribute('data-select-all')){for(const c of visibleCollections()){if(el.checked&&!state.selected.includes(c.id)){state.selected.push(c.id);state.configs[c.id]??=M.createConfig(c)}else if(!el.checked)state.selected=state.selected.filter(id=>id!==c.id)}render();return;}
    if(el.dataset.record){state.checked=el.checked?[...state.checked,el.dataset.record]:state.checked.filter(x=>x!==el.dataset.record);return render()}
    if(el.hasAttribute('data-record-all')){const ids=filteredRecords().slice((state.page-1)*10,state.page*10).map(r=>r.id);state.checked=el.checked?[...new Set([...state.checked,...ids])]:state.checked.filter(id=>!ids.includes(id));return render()}
    if(el.dataset.field&&current()){if(el.dataset.field==='type')M.setContentType(current(),el.value);else{if(el.dataset.field==='desc')el.value=M.limitDescription(el.value);current()[el.dataset.field]=el.value;if(el.dataset.field==='desc'&&$('#descCount'))$('#descCount').textContent=[...el.value].length+' / 400';}if(el.tagName==='SELECT'||el.type==='radio')render();return;}
    if(el.id==='confirmUpload'){state.agreed=el.checked;const submit=$('[data-action=submit]');submit.disabled=!state.agreed;return;}
    if(el.dataset.fileField){const file=el.files[0];if(file){if(!/\.(pdf|png|jpg|jpeg)$/i.test(file.name))return toast('请选择PDF或图片附件');current()[el.dataset.fileField]=file.name;closeModal();render();toast('已记录本地附件名称，仅用于原型预览')}return;}
    if(el.id==='coverFile'&&el.files[0]){const f=el.files[0];if(f.size>10*1024*1024)return toast('封面需在10M以内');if(!/\.(png|jpg|jpeg|bmp)$/i.test(f.name))return toast('封面格式需为JPG、PNG、BMP或JPEG');const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{if(Math.abs(img.width/img.height-1.6)>.015)return toast('短剧封面比例需为8:5');current().coverUrl=reader.result;current().coverValid=true;closeModal();render();toast('封面已更新，仅保存在本地原型')};img.onerror=()=>toast('无法读取该图片，请更换文件');img.src=reader.result};reader.readAsDataURL(f)}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const menu=$('.category-select[open]');if(menu){menu.open=false;menu.querySelector('summary').focus();e.preventDefault();return;}}if(e.key==='Escape'&&!$('#overlay').hidden)closeModal();if(e.key==='Enter'&&e.target.hasAttribute('data-record-filter'))$('[data-action=query]')?.click();if(e.key==='Enter'&&e.target.id==='accountSearch')$('[data-action=account-query]')?.click();if(e.key==='Enter'&&e.target.id==='collectionSearch')$('[data-action=search-collections]')?.click();if(e.key==='Tab'&&!$('#overlay').hidden){const nodes=[...$('#overlay').querySelectorAll('button:not(:disabled),input:not([type=hidden]),select,textarea,a[href],summary')].filter(n=>n.offsetParent!==null);if(!nodes.length)return;if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus()}}});
  KSAuthRange.bind(current,(start,end)=>{current().authStart=start;current().authEnd=end;render();});
  KSAccountManager.init({esc,btn,link,dot,modal,close:closeModal,render,toast,now});
  persist();syncSchedules();setInterval(syncSchedules,1000);
  render();records.filter(r=>['queued','creating','uploading','submitting'].includes(r.stage)).forEach(r=>runTask(r.id));
})();
