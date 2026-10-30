/* 交互需求原型；所有上传、CID及回执为本地模拟。 */
(() => {
  const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const clone=x=>JSON.parse(JSON.stringify(x)), KEY='tencent-collection-pool-v1';
  let db;try{db=JSON.parse(localStorage.getItem(KEY));}catch{}if(!db||db.version!==1)db=TV.seed();db.dramas.forEach(TV.normalizeSubmissionStatus);const exampleUpdated=TV.prepareConditionalExample(db),sourceUpdated=TV.prepareContentSourceExamples(db),coverUpdated=TV.prepareCollectionCoverDefaults(db),actorUpdated=TV.prepareActorPhotoDefaults(db);
  const ui={page:'pools',pool:36,draft:null,dirty:false,modal:null,modalData:null,selected:new Set(),poolFilter:{id:'',name:'',type:'腾讯视频',status:''},filter:{id:'',name:'',status:''},running:false,stage:0,pushRows:[],memberQuery:'',members:new Set(),proofOpen:false,keywordOpen:false,metadataAttempted:false,metadataTouched:new Set()};
  let currentNotes, toastTimer, popPool=null, focusBefore=null, viewKey='';
  const drama=id=>db.dramas.find(d=>d.id===Number(id)),pool=()=>db.pools.find(p=>p.id===ui.pool);
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(db));return true;}catch{toast('浏览器空间不足，当前资料保留在本次页面；请减少附件后再保存',true);return false;}};
  const toast=(message,error=false)=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').className='toast'+(error?' error':'');$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);};
  function context(){return {page:ui.page,d:ui.draft,modal:ui.modal,running:ui.running,check:ui.modalData?.check,finished:ui.modalData?.finished};}
  function setNotes(){currentNotes=TVNotes(context());$('#notes').innerHTML=`<button class="note-top" data-action="return-stage">← 返回原型</button><h2>#页面说明</h2><ul><li>本页是${esc(currentNotes.page)}。</li></ul><h2>#原型说明</h2><ul><li><b>背景：</b>${esc(currentNotes.background)}</li><li><b>需求：</b>${esc(currentNotes.need)}</li></ul>${currentNotes.sections.map((s,i)=>`<section class="note-section" id="note-${s.key}"><h3><span class="note-number">${i+1}</span>${esc(s.title)}</h3><ul>${s.items.map(t=>{const n=t.indexOf('：');return `<li>${n<0?esc(t):`<b>${esc(t.slice(0,n))}：</b>${esc(t.slice(n+1))}`}</li>`;}).join('')}</ul></section>`).join('')}${currentNotes.warn?`<p class="warn">待确认 / 边界：${esc(currentNotes.warn)}</p>`:''}`;$('#notes').scrollTop=0;}
  function mark(key){const n=currentNotes.sections.findIndex(s=>s.key===key);return n<0?'':`<button type="button" class="ann" data-note="${key}" aria-label="查看说明${n+1}">${n+1}</button>`;}
  const op=(label,action,key,attrs='',style='')=>`<span class="op"><button class="${style}" data-action="${action}" ${attrs}>${label}</button>${key?mark(key):''}</span>`;
  const tag=(text)=>`<span class="status ${['已齐全','启用','提交成功','创建成功','上传成功'].includes(text)?'good':['提交失败','待补充','明确失败'].includes(text)?'bad':['提交中','结果待确认'].includes(text)?'wait':['停用','未提交'].includes(text)?'neutral':''}">${esc(text)}</span>`;
  function options(a,value,placeholder=''){return (placeholder?`<option value="">${esc(placeholder)}</option>`:'')+a.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}" ${String(value)===String(v)?'selected':''}>${esc(l)}</option>`;}).join('');}
  const pick=(slot,kind='image',multiple=false,role=false)=>`<label class="file-picker">${kind==='pdf'?'选择PDF':'选择图片'}<input type="file" data-file="${slot}" ${role?'data-role-file="true"':''} accept="${kind==='pdf'?'application/pdf,.pdf':'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'}" ${multiple?'multiple':''}></label>`;
  function pushIssues(d){const e=TV.validate(d,null,true);if(d.episodes.length!==Number(d.total_episode)||d.episodes.some(x=>!x.ready||!x.title.trim()))e.push({message:'现有合集的分集标题、视频或封面未就绪',step:3});if(!pool().enabled)e.push({message:'当前合集池已停用'});if(d.unknownStage)e.push({message:`${d.unknownStage}结果待确认，请先联系腾讯核实`});if(d.status==='提交中'&&!d.unknownStage)e.push({message:'该合集正在提交，请勿重复提交'});if(d.status==='提交成功')e.push({message:'该合集已提交成功，不可重复提交'});return e;}
  function bindLabels(root){root.querySelectorAll('.field,.role-fields').forEach((row,i)=>{const label=row.querySelector(':scope > label'),control=row.querySelector('input:not([type=checkbox]),select,textarea');if(label&&control){if(!control.id)control.id=root.id+'-field-'+i;label.htmlFor=control.id;control.setAttribute('aria-label',label.textContent.trim());if(label.classList.contains('required'))control.setAttribute('aria-required','true');}});}
  function render(){if(ui.page!=='form'){ui.proofOpen=false;ui.keywordOpen=false;}const key=ui.page+'-'+ui.draft?.id,scroll=$('.form-body')?.scrollTop||0,keep=key===viewKey;setNotes();$('#popover').hidden=true;$('#main').innerHTML=ui.page==='pools'?renderPools():ui.page==='collections'?renderCollections():renderForm();bindLabels($('#main'));if(keep&&$('.form-body'))$('.form-body').scrollTop=scroll;viewKey=key;if(ui.page==='form')renderMetadataFeedback();layoutProofOptions();layoutKeywords();if(ui.modal)renderModal();}
  function renderPools(){
    const f=ui.poolFilter, rows=db.pools.filter(p=>(!f.id||String(p.id)===f.id)&&(!f.name||p.name.includes(f.name))&&(!f.type||p.type===f.type)&&(!f.status||String(p.enabled)===f.status));
    return `<div class="page-heading"><h1>合集池管理</h1></div><form id="pool-filters" class="panel filter-panel"><label>池ID <input name="id" value="${esc(f.id)}" placeholder="请输入池ID"></label><label>池名称 <input name="name" value="${esc(f.name)}" placeholder="请输入池名称"></label><label>状态 <select name="status">${options([['true','启用'],['false','停用']],f.status,'全部')}</select></label><label>池类型 <select name="type">${options(TV.types,f.type,'全部')}</select>${mark('pool-type')}</label><div class="filter-actions"><button class="primary" type="submit">查询</button><button type="button" data-action="reset-pools">重置</button></div></form><div class="toolbar">${op('＋ 新建合集池','create','create','','primary')}<div class="right"><span class="meta">共 ${rows.length} 个合集池</span></div></div><div class="panel table-panel"><table><thead><tr><th width="110">池ID</th><th>池名称</th><th width="140">池元素数</th><th width="120">状态</th><th width="150">池类型</th><th width="440">操作</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${p.id}</td><td>${esc(p.name)}</td><td>${p.ids.length}</td><td>${tag(p.enabled?'启用':'停用')}</td><td>${esc(p.type)}</td><td><div class="table-actions"><button class="text" data-action="rename" data-id="${p.id}">修改名称</button><button class="text" data-action="members" data-id="${p.id}">修改池元素</button><button class="text" data-action="auto" data-id="${p.id}">自动添加元素</button><span class="op"><button class="text" data-action="more" data-id="${p.id}">更多⌄</button>${p.type==='腾讯视频'?mark('entry'):''}</span></div></td></tr>`).join('')||'<tr><td colspan="6" class="empty">暂无符合条件的合集池</td></tr>'}</tbody></table><div class="pagination"><span>共 ${rows.length} 条</span><span>10条/页</span><span>‹</span><b>1</b><span>›</span><span>前往 1 页</span></div></div>`;
  }
  function collectionRows(){const f=ui.filter;return pool().ids.map(drama).filter(d=>d&&(!f.id||String(d.id)===f.id)&&(!f.name||d.title.includes(f.name))&&(!f.status||d.status===f.status));}
  function renderCollections(){
    const rows=collectionRows(),p=pool();
    return `<div class="page-heading"><button class="text back" data-action="pools">‹ 返回合集池</button><h1>${esc(p.name)}</h1><span class="subtext">池ID：${p.id}</span>${tag(p.enabled?'启用':'停用')}</div>
      ${!p.enabled?'<div class="banner warning">当前池已停用，可查看提交结果并维护资料。</div>':''}
      <form class="panel filter-panel" id="collection-filters">
        <label>合集ID <input name="id" placeholder="请输入合集ID" value="${esc(ui.filter.id)}"></label>
        <label>合集名称 <input name="name" placeholder="请输入合集名称" value="${esc(ui.filter.name)}"></label>
        <label>提交状态 <select name="status">${options(TV.submissionStates,ui.filter.status,'全部')}</select></label>${mark('filters')}
        <div class="filter-actions"><button class="primary">查询</button><button type="button" data-action="reset-filter">重置</button></div>
      </form>
      <div class="panel table-panel"><div class="table-caption"><strong>池内合集 ${mark('list')}</strong><span>已选择 ${ui.selected.size} 项</span></div>
        <table><thead><tr><th width="35"><input type="checkbox" aria-label="全选当前合集" id="select-all" ${rows.length&&rows.every(d=>ui.selected.has(d.id))?'checked':''}></th><th>合集ID</th><th>合集名称</th><th>资料状态</th><th>提交状态</th><th width="280">提交失败原因</th><th>最近推送时间</th><th>操作</th></tr></thead>
          <tbody>${rows.map(d=>`<tr>
            <td><input type="checkbox" aria-label="选择${esc(d.title)}" data-select="${d.id}" ${ui.selected.has(d.id)?'checked':''}></td>
            <td>${d.id}</td><td><span class="drama-name">${esc(d.title)}</span></td>
            <td>${tag(TV.validate(d).length?'待补充':'已齐全')}</td><td>${tag(d.status)}</td><td class="failure-reason-cell">${d.status==='提交失败'?`<div class="failure-reason">${esc(TV.submissionFailureReason(d))}</div>`:'<span class="muted">—</span>'}</td><td>${esc(d.lastTime||'—')}</td>
            <td><div class="table-actions">${op('编辑','edit','metadata',`data-id="${d.id}"`,'text')}</div></td>
          </tr>`).join('')||'<tr><td colspan="8" class="empty">暂无符合条件的合集</td></tr>'}</tbody>
        </table><div class="pagination"><span>共 ${rows.length} 条</span><span>10条/页</span><span>‹</span><b>1</b><span>›</span></div>
      </div>`;
  }

  const title=(label,key,tail='')=>`<div class="section-title"><h2>${label}${mark(key)}</h2>${tail}</div>`;
  function keywordPicker(d){
    const selected=Array.isArray(d.micro_series_keyword)?d.micro_series_keyword:[];
    return `<div class="proof-select keyword-select" data-keyword-select><div class="proof-select-control">
      <button type="button" class="proof-select-trigger" id="metadata-micro_series_keyword" data-metadata="micro_series_keyword" data-action="toggle-keywords" aria-label="选择关键词" aria-expanded="${ui.keywordOpen}" aria-haspopup="listbox" aria-controls="keyword-options" aria-describedby="metadata-micro_series_keyword-hint metadata-micro_series_keyword-error"></button>
      <div class="proof-tags" data-action="toggle-keywords">${selected.length?selected.map(value=>{const label=TV.keywords.find(([id])=>id===value)?.[1]||value;return `<span class="proof-tag" data-keyword-tag="${esc(value)}"><span>${esc(label)}</span><button type="button" data-action="remove-keyword" data-value="${esc(value)}" aria-label="移除关键词${esc(label)}">×</button></span>`;}).join(''):'<span class="proof-placeholder">请选择关键词（至少2个）</span>'}</div><span class="proof-select-arrow" aria-hidden="true">⌄</span></div>
      ${ui.keywordOpen?`<div class="proof-select-options" id="keyword-options" role="listbox" aria-label="关键词选项" aria-multiselectable="true">${TV.keywords.map(([id,label])=>`<button type="button" class="proof-option" role="option" aria-selected="${selected.includes(id)}" data-keyword-option="${id}" data-action="toggle-keyword" data-value="${id}"><span class="proof-option-check" aria-hidden="true">${selected.includes(id)?'✓':''}</span><span>${label}</span></button>`).join('')}</div>`:''}</div>`;
  }
  function closeKeywords(restoreFocus=false){
    ui.keywordOpen=false;$('#keyword-options')?.remove();$('#metadata-micro_series_keyword')?.setAttribute('aria-expanded','false');$('[data-keyword-select]')?.classList.remove('opens-up');if(restoreFocus)$('#metadata-micro_series_keyword')?.focus({preventScroll:true});
  }
  function layoutKeywords(){
    const root=$('[data-keyword-select]'),list=$('#keyword-options'),body=$('.form-body');if(!root||!list||!body)return;const box=root.getBoundingClientRect(),bounds=body.getBoundingClientRect(),above=box.top-bounds.top-8,below=bounds.bottom-box.bottom-8,up=below<240&&above>below;root.classList.toggle('opens-up',up);list.style.maxHeight=Math.max(60,Math.min(240,up?above:below))+'px';
  }
  function renderKeywordPicker(focusSelector='#metadata-micro_series_keyword'){
    const noteScroll=$('#notes').scrollTop,optionScroll=$('#keyword-options')?.scrollTop||0;render();$('#notes').scrollTop=noteScroll;if($('#keyword-options'))$('#keyword-options').scrollTop=optionScroll;$(focusSelector)?.focus({preventScroll:true});
  }
  function changeKeyword(value,removeOnly=false){
    if(!TV.keywords.some(([id])=>id===value))return;const selected=new Set(ui.draft.micro_series_keyword||[]);if(removeOnly||selected.has(value))selected.delete(value);else selected.add(value);ui.draft.micro_series_keyword=TV.keywords.map(([id])=>id).filter(id=>selected.has(id));ui.dirty=true;ui.metadataTouched.add('micro_series_keyword');renderKeywordPicker(removeOnly?'#metadata-micro_series_keyword':`[data-keyword-option="${value}"]`);
  }
  function metadataRow(f,d){
    const id='metadata-'+f.key,multiple=['checks','keywords'].includes(f.type),values=Array.isArray(d[f.key])?d[f.key]:[];
    const hints={kind:'短番为动漫类内容；AI真人短剧为AI生成的真人形象内容。',is_ai_creation:d.kind==='ai'?'AI真人短剧固定为是，需上传AI创作声明和权利声明。':'选择是时，需上传AI创作声明和权利声明；选择否时隐藏这两项。',cover_video_ratio:'AI真人短剧必填，选择横版或竖版。',micro_comic_theme:'单选腾讯题材，已映射值默认带入，可调整。',micro_series_keyword:`至少选择2个，已选择 ${values.length} 个。`,plot_year_drama:'AI真人短剧必填。',micro_series_guzhuang:'AI真人短剧必填。',aboard_area_limit:'根据实际取得的授权范围选择。',granted_rights:'至少选择一项，可同时选择两项。',auth_duration:'单位为年，请填写正整数。',has_own_copyright:'选择“是”时选择自有版权证明材料；选择“否”时需上传版权链文件。'};
    const control=f.type==='keywords'?keywordPicker(d):multiple?`<div class="metadata-checks" id="${id}" role="group" aria-labelledby="${id}-label" aria-describedby="${id}-hint ${id}-error">${f.options.map(([v,label])=>`<label><input type="checkbox" name="${f.key}" data-metadata="${f.key}" value="${v}" ${values.includes(v)?'checked':''}><span>${label}</span></label>`).join('')}</div>`:f.type==='select'?`<select id="${id}" name="${f.key}" data-metadata="${f.key}" ${f.key==='is_ai_creation'&&d.kind==='ai'?'disabled':''} aria-required="true" aria-describedby="${id}-hint ${id}-error">${options(f.options,d[f.key],f.key==='kind'&&TV.contentTypes.some(([value])=>value===d.kind)?'':'请选择'+f.label)}</select>`:`<div class="metadata-number"><input id="${id}" name="${f.key}" data-metadata="${f.key}" type="number" min="1" step="1" value="${esc(d[f.key])}" placeholder="请输入授权年限" aria-required="true" aria-describedby="${id}-hint ${id}-error"><span>年</span></div>`;
    return `<div class="document-row metadata-row" data-metadata-row="${f.key}">${multiple?`<span class="metadata-label required" id="${id}-label">${f.label}</span>`:`<label for="${id}" class="required">${f.label}</label>`}<div>${control}<div class="hint" id="${id}-hint">${hints[f.key]}</div><div class="field-error" id="${id}-error" data-error-for="${f.key}" role="status" hidden></div></div></div>`;
  }
  function renderMetadataFeedback(){
    const issues=TV.metadataIssues(ui.draft);
    TV.editableMetadata(ui.draft).forEach(f=>{const row=$(`[data-metadata-row="${f.key}"]`);if(!row)return;const issue=issues.find(i=>i.field===f.key),show=!!issue&&(ui.metadataAttempted||ui.metadataTouched.has(f.key)),error=row.querySelector('[data-error-for]');error.hidden=!show;error.textContent=show?issue.message:'';row.querySelectorAll('[data-metadata]').forEach(el=>el.setAttribute('aria-invalid',String(show)));row.classList.toggle('has-error',show);});
    const hint=$('#metadata-micro_series_keyword-hint');if(hint)hint.textContent=`至少选择2个，已选择 ${(ui.draft.micro_series_keyword||[]).length} 个。`;
  }
  function updateMetadata(el){
    const f=TV.editableMetadata(ui.draft).find(f=>f.key===el.dataset.metadata);if(!f)return;
    if(f.key==='kind'){if(!TV.changeContentType(ui.draft,el.value))return;ui.proofOpen=false;ui.keywordOpen=false;ui.dirty=true;ui.metadataTouched.add(f.key);render();$('#metadata-kind')?.focus({preventScroll:true});return;}
    if(f.key==='is_ai_creation'){if(ui.draft.kind==='ai')return;ui.draft.is_ai_creation=el.value==='true'?true:el.value==='false'?false:null;ui.draft.short_is_ai_creation=ui.draft.is_ai_creation;ui.proofOpen=false;ui.keywordOpen=false;ui.dirty=true;ui.metadataTouched.add(f.key);render();$('#metadata-is_ai_creation')?.focus({preventScroll:true});return;}
    ui.draft[f.key]=el.type==='checkbox'?f.options.filter(([value])=>$(`[data-metadata="${f.key}"][value="${value}"]`)?.checked).map(([value])=>value):el.value;
    ui.dirty=true;ui.metadataTouched.add(f.key);
    if(f.key==='has_own_copyright'){ui.proofOpen=false;render();$('#metadata-has_own_copyright')?.focus({preventScroll:true});return;}
    renderMetadataFeedback();
  }
  function confirmMetadata(){
    ui.metadataAttempted=true;renderMetadataFeedback();const first=TV.metadataIssues(ui.draft)[0];
    if(!first)return true;const row=$(`[data-metadata-row="${first.field}"]`);row?.scrollIntoView({block:'center',inline:'nearest'});row?.querySelector('[data-metadata]')?.focus({preventScroll:true});toast('请完善必填信息后确认',true);return false;
  }
  function imageCard(f,d){const file=d.files[f.key]?.[0];return `<div class="upload-card file-config-row"><h3 class="required">${f.label}</h3><div class="image-well ${file?'':'empty-image'}">${file?`<img src="${esc(file.preview)}" alt="${esc(f.label)}预览">`:'＋'}</div><div class="upload-details"><div class="file-name">${file?esc(file.name):'尚未选择图片'}</div>${f.key==='user_new_pic_vt'?`<div class="hint">${file?.origin==='collection'?'已带入合集列表封面，可更换。':file?'已使用手动选择的竖版封面。':'未选择竖版封面，请上传图片。'}</div>`:''}<div class="upload-actions">${pick(f.key)}${file?`<button class="text small" data-action="preview-file" data-slot="${f.key}">预览</button><button class="text small danger" data-action="remove-file" data-slot="${f.key}">移除</button>`:''}</div></div></div>`;}
  function renderForm(){
    const d=ui.draft;
    const roles=d.roles.map((r,i)=>`<div class="role-card file-config-row">
      <div class="role-label"><h3 class="mapped-role-name">${esc(r.name||'角色'+(i+1))}</h3><p class="hint">角色剧照</p></div>
      <div class="image-well ${r.image?'':'empty-image'}">${r.image?`<img src="${esc(r.image.preview)}" alt="${esc(r.name||'角色'+(i+1))}剧照">`:'＋'}</div>
      <div class="role-fields">
        <div class="file-name">${r.image?esc(r.image.name):'尚未选择剧照'}</div><div class="hint">${r.image?.origin==='actor'?'已带入演员照片，可更换。':r.image?'已使用手动选择的角色剧照。':r.actor_photo?'未选择剧照，请上传图片。':'演员未配置照片，请手动上传。'}</div>
        <div class="upload-actions">${pick(i,'image',false,true)}${r.image?`<button class="text small" data-action="preview-role" data-index="${i}">预览</button><button class="text small danger" data-action="remove-role-image" data-index="${i}">移除</button>`:''}</div>
      </div></div>`).join('');
    const documentRow=f=>`<div class="document-row" data-document="${f.key}"><label class="required">${f.label}</label><div>
      ${(d.files[f.key]||[]).map((v,i)=>`<div class="file-row"><span class="file-icon">PDF</span><span class="file-title">${esc(v.name)}</span><span class="file-size">${(v.size/1024).toFixed(0)}KB</span><button class="text small" data-action="preview-file" data-slot="${f.key}" data-index="${i}">预览</button><button class="text small danger" data-action="remove-file" data-slot="${f.key}" data-index="${i}">移除</button></div>`).join('')}
      ${pick(f.key,'pdf',f.multiple)}<div class="hint">${f.multiple?'必传，支持添加多个PDF':'必传，选择新文件将替换原文件'}</div>
    </div></div>`;
    const copyrightDocs=TV.copyrightAttachments(d),copyrightKeys=new Set(copyrightDocs.map(f=>f.key));
    const channelDocs=TV.attachments(d).filter(f=>!copyrightKeys.has(f.key));
    const documents=channelDocs.filter(f=>!TV.conditionalAttachments.some(c=>c.key===f.key)).map(documentRow).join('');
    const recordPicker=`<div class="document-row record-choice-row"><label for="is-cp-key-record" class="required">是否重点备案</label><div><select id="is-cp-key-record" name="is_cp_key_record" aria-required="true" aria-describedby="record-choice-hint">${options([['true','是'],['false','否']],d.is_cp_key_record)}</select><div class="hint" id="record-choice-hint">选择“是”时需上传上线备案文件</div></div></div>`;
    const conditionalDocs=channelDocs.filter(f=>TV.conditionalAttachments.some(c=>c.key===f.key)).map(documentRow).join('');
    const selected=TV.selectedProofTypes(d),isOwn=d.has_own_copyright==='1543606';
    const typeLabels=Object.fromEntries([['chain','版权链文件'],...TV.copyrightTypes]);
    const copyrightPicker=`<div class="document-row copyright-types-row"><span class="copyright-type-label required" id="copyright-types-label">版权证明材料类型</span><div role="group" aria-labelledby="copyright-types-label">
      <div class="proof-select ${!isOwn?'fixed':''}" data-proof-select>
        <div class="proof-select-control">
          <button type="button" class="proof-select-trigger" id="proof-type-trigger" data-action="toggle-proof-select" aria-label="选择版权证明材料类型" aria-expanded="${ui.proofOpen}" aria-controls="proof-type-options" aria-haspopup="listbox" aria-describedby="copyright-types-hint" ${!isOwn?'disabled':''}></button>
          <div class="proof-tags">${selected.length?selected.map(key=>`<span class="proof-tag" data-proof-tag="${key}"><span>${typeLabels[key]}</span>${isOwn?`<button type="button" data-action="remove-proof-type" data-value="${key}" aria-label="移除${typeLabels[key]}">×</button>`:''}</span>`).join(''):'<span class="proof-placeholder">请选择版权证明材料类型（可多选）</span>'}</div>
          <span class="proof-select-arrow" aria-hidden="true">⌄</span>
        </div>
        ${isOwn&&ui.proofOpen?`<div class="proof-select-options" id="proof-type-options" role="listbox" aria-label="版权证明材料类型选项" aria-multiselectable="true">${TV.copyrightTypes.map(([key,label])=>`<button type="button" class="proof-option" role="option" aria-selected="${selected.includes(key)}" data-proof-option="${key}" data-action="toggle-proof-type" data-value="${key}"><span class="proof-option-check" aria-hidden="true">${selected.includes(key)?'✓':''}</span><span>${label}</span></button>`).join('')}</div>`:''}
      </div>
      <div class="hint" id="copyright-types-hint">${isOwn?'可多选，点击标签上的×取消；取消后保留文件，不参与本次推送。':'无自有版权时需上传版权链文件；材料类型固定，已上传文件可预览、移除或更换。'}</div>
      ${isOwn&&!selected.length?'<div class="proof-empty">请选择至少一种类型，选择后展开对应上传区域。</div>':''}
    </div></div>`;
    const copyrightDocument=f=>`<div class="document-row proof-document-row" data-document="${f.key}"><label class="required">${f.label}</label><div><div class="proof-file-grid">
      ${(d.files[f.key]||[]).map((v,i)=>`<div class="proof-file-card"><button type="button" class="proof-file-preview" data-action="preview-file" data-slot="${f.key}" data-index="${i}" aria-label="预览${esc(v.name)}"><span class="proof-pdf-icon">PDF</span><span class="file-title" title="${esc(v.name)}">${esc(v.name)}</span></button><button type="button" class="proof-file-remove" data-action="remove-file" data-slot="${f.key}" data-index="${i}" aria-label="移除文件${esc(v.name)}">×</button></div>`).join('')}
      <label class="file-picker proof-upload-tile" role="button" tabindex="0" aria-label="${f.multiple?'添加':(d.files[f.key]||[]).length?'更换':'上传'}${f.label}PDF"><span class="proof-upload-plus" aria-hidden="true">＋</span><span>${f.multiple?'添加PDF':(d.files[f.key]||[]).length?'更换PDF':'上传PDF'}</span><input type="file" data-file="${f.key}" accept="application/pdf,.pdf" ${f.multiple?'multiple':''}></label>
      </div><div class="hint">${f.multiple?'必传，支持添加多个PDF文件。':'必传，请上传完整的PDF证明文件。'}</div></div></div>`;
    const copyrightPanels=TV.copyrightGroups(d).map(group=>`<section class="copyright-material-group" data-proof-group="${group.key}" aria-label="${group.label}">${group.fields.length>1?`<h3>${group.label}</h3>`:''}${group.fields.map(copyrightDocument).join('')}</section>`).join('');
    return `<div class="form-page"><div class="page-heading"><button class="text back" data-action="leave">‹ 返回池内合集</button><h1>编辑腾讯资料</h1><span class="subtext">${esc(d.title)} · ${d.id}</span></div>
      <div class="panel form-panel"><div class="form-body">
        <div class="banner">按内容类型维护腾讯资料，切换后展示对应必填项；已有资料默认带入，隐藏内容与文件保留。</div>
        <section class="form-section">${title('内容类型','content-type','<span>按类型展示与校验必填项</span>')}${TV.contentTypeFields(d).map(f=>metadataRow(f,d)).join('')}</section>
        <section class="form-section">${title('题材信息','classification','<span>使用腾讯题材与关键词</span>')}${TV.editableMetadata(d).filter(f=>f.key!=='has_own_copyright'&&!TV.auth.some(a=>a.key===f.key)&&!TV.contentTypeFields(d).some(a=>a.key===f.key)).map(f=>metadataRow(f,d)).join('')}</section>
        <section class="form-section">${title('授权信息','authorization','<span>按实际取得的授权填写</span>')}${TV.editableMetadata(d).filter(f=>TV.auth.some(a=>a.key===f.key)).map(f=>metadataRow(f,d)).join('')}</section>
        <section class="form-section">${title('专辑封面','covers','<span>三种图片均必填</span>')}<div class="cover-grid">${TV.covers.map(f=>imageCard(f,d)).join('')}</div></section>
        <section class="form-section">${title('角色剧照','roles','<span>默认取对应演员照片，可更换</span>')}<div class="roles-grid">${roles||'<div class="banner warning">合集尚未映射角色，请先完善合集信息。</div>'}</div></section>
        <section class="form-section">${title('证明文件','attachments','<span>按备案条件与版权类型展开 · PDF</span>')}${documents}${recordPicker}${conditionalDocs}${metadataRow(TV.copyrightOwnership,d)}${['1543606','1543607'].includes(d.has_own_copyright)?copyrightPicker+copyrightPanels:''}</section>
      </div><div class="form-footer"><span class="muted">文件在推送时上传至腾讯</span><div class="right"><button data-action="leave">取消</button>${op('确认推送','save-files','save','','primary')}</div></div></div>
    </div>`;
  }
  function layoutProofOptions(){
    const root=$('[data-proof-select]'),list=$('#proof-type-options'),body=$('.form-body');
    if(!root||!list||!body)return;
    const box=root.getBoundingClientRect(),bounds=body.getBoundingClientRect();
    root.classList.toggle('opens-up',bounds.bottom-box.bottom<list.offsetHeight+10&&box.top-bounds.top>list.offsetHeight+10);
  }
  function closeProofSelect(restoreFocus=false){
    ui.proofOpen=false;$('#proof-type-options')?.remove();$('#proof-type-trigger')?.setAttribute('aria-expanded','false');
    $('[data-proof-select]')?.classList.remove('opens-up');if(restoreFocus)$('#proof-type-trigger')?.focus({preventScroll:true});
  }
  function renderProofSelect(focusSelector='#proof-type-trigger'){
    const noteScroll=$('#notes').scrollTop;render();$('#notes').scrollTop=noteScroll;$(focusSelector)?.focus({preventScroll:true});
  }
  function changeProofType(key,removeOnly=false){
    if(ui.draft.has_own_copyright!=='1543606'||!TV.copyrightTypes.some(([value])=>value===key))return;
    const selected=new Set(TV.selectedProofTypes(ui.draft));
    if(removeOnly||selected.has(key))selected.delete(key);else selected.add(key);
    ui.draft.proofTypes=TV.copyrightTypes.map(([value])=>value).filter(value=>selected.has(value));ui.dirty=true;
    renderProofSelect(removeOnly?'#proof-type-trigger':`[data-proof-option="${key}"]`);
  }
  function openModal(type,data={}){closeProofSelect();closeKeywords();focusBefore=document.activeElement;ui.modal=type;ui.modalData=data;$('#popover').hidden=true;setNotes();renderModal();$('.app-shell').inert=true;$('#modal').querySelector('input,select,button')?.focus({preventScroll:true});}
  function closeModal(){if(ui.running)return;ui.modal=null;ui.modalData=null;$('#modal').hidden=true;$('.app-shell').inert=false;render();focusBefore?.focus?.({preventScroll:true});}
  const modalField=(label,control)=>`<div class="field"><label class="required">${label}</label><div>${control}</div></div>`;
  function renderModal(){let body='',foot='',heading='',large=false;const m=ui.modalData,p=db.pools.find(p=>p.id===m?.pool);const confirm=(label,action,key='confirm')=>op(label,action,key,'','primary');
    if(ui.modal==='create'||ui.modal==='rename'){heading=ui.modal==='create'?'新建合集池':'修改池名称';body=`${mark('config')}<div class="fields">${modalField('池名称',`<input id="pool-name" value="${esc(p?.name||'')}" placeholder="请输入池名称">`)}${ui.modal==='create'?modalField('池类型',`<select id="pool-type">${options(TV.types,'腾讯视频')}</select>`)+modalField('状态',`<select id="pool-status"><option value="true">启用</option><option value="false">停用</option></select>`):''}</div>`;foot=`<button data-action="close-modal">取消</button>${confirm(ui.modal==='create'?'创建':'确定','save-pool')}`;}
    if(ui.modal==='members'){heading=`修改池元素 · ${p.name}`;large=true;const rows=db.dramas.filter(d=>!ui.memberQuery||d.title.includes(ui.memberQuery)||String(d.id).includes(ui.memberQuery));body=`<div class="mini-filter"><input id="member-search" value="${esc(ui.memberQuery)}" placeholder="搜索合集名称 / ID"><button data-action="member-search">查询</button>${mark('members')}</div><table class="modal-table"><thead><tr><th width="50"></th><th>合集ID</th><th>合集名称</th><th>内容品类</th><th>总集数</th><th>归属</th></tr></thead><tbody>${rows.map(d=>`<tr><td><input type="checkbox" data-member="${d.id}" ${ui.members.has(d.id)?'checked':''} aria-label="添加${esc(d.title)}到池"></td><td>${d.id}</td><td>${esc(d.title)}</td><td>${d.kind==='ai'?'AI真人短剧':'短番'}</td><td>${d.count}集</td><td>${p.ids.includes(d.id)?'已在池内':'未加入'}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">未找到合集</td></tr>'}</tbody></table><div class="count-text">已选择 ${ui.members.size} 个合集；移出池不会删除腾讯资料与提交记录。</div>`;foot='<button data-action="close-modal">取消</button><button class="primary" data-action="save-members">保存</button>';}
    if(ui.modal==='auto'){heading='自动添加元素';body=`${mark('config')}<div class="fields">${modalField('规则状态',`<select id="auto-enabled">${options([['false','停用'],['true','启用']],p.auto?.enabled||'false')}</select>`)}${modalField('内容品类',`<select id="auto-kind">${options([['','全部'],['duanfan','短番'],['ai','AI真人短剧']],p.auto?.kind||'')}</select>`)}</div><p class="hint">保存规则后沿用现有自动入池任务。本原型只保存配置。</p>`;foot='<button data-action="close-modal">取消</button><button class="primary" data-action="save-auto">保存配置</button>';}
    if(ui.modal==='push'){heading=m.check?'合集资料校验':ui.running?'正在推送腾讯视频':m.finished?'推送结果':'推送腾讯视频';large=true;const hasIssues=ui.pushRows.some(r=>r.issues.length);body=`${ui.running||m.finished?`<div class="batch-stages">${['素材上传','专辑创建','分集提交'].map((t,i)=>`<div class="${ui.stage===i?'current':''}"><b>${i+1}</b>${t}</div>`).join('')}</div>`:''}<div class="banner ${hasIssues||ui.pushRows.some(r=>r.result?.includes('失败')||r.result?.includes('待确认'))?'warning':''}">${m.check?hasIssues?'校验未通过，请先完善以下问题。':'校验通过，所选合集可以推送。':m.finished?'本次执行已结束，请查看各合集结果。':ui.running?'任务执行中，请稍候。':'将读取现有合集分集，按顺序完成上传、创建专辑和批量提交。'}${mark('review')}</div><table class="modal-table"><thead><tr><th>合集名称</th><th>分集来源</th><th>腾讯CID</th><th>校验 / 进度</th></tr></thead><tbody>${ui.pushRows.map(r=>{const d=drama(r.id);return `<tr><td>${esc(d.title)}<span class="subline">${d.id}</span></td><td>现有合集 · ${d.count}集</td><td>${esc(d.cid||'待创建')}</td><td class="wrap">${r.result?esc(r.result):r.issues.length?r.issues.map(e=>`<div>• ${esc(e.message)}</div>`).join(''):tag('校验通过')}</td></tr>`;}).join('')}</tbody></table><p class="hint">成功仅代表接口接收，审核和上线需另行核实。</p>`;foot=ui.running?'<span class="left">执行中，请勿重复提交</span><button disabled>正在执行…</button>':m.finished||m.check?'<button class="primary" data-action="close-modal">完成</button>':`<button data-action="close-modal">取消</button>${op('确认推送','run-push','execute',hasIssues?'disabled':'','primary')}`;}
    if(ui.modal==='logs'){heading=m.id?`${drama(m.id).title} · 推送记录`:'池内合集推送记录';large=true;const ds=m.id?[drama(m.id)]:pool().ids.map(drama),logs=ds.flatMap(d=>d.logs.map(l=>({...l,title:d.title}))).sort((a,b)=>b.time.localeCompare(a.time));body=`<div class="table-caption"><strong>共 ${logs.length} 条阶段记录 ${mark('records')}</strong><span>仅记录接口提交结果</span></div><table class="modal-table"><thead><tr><th>合集名称 / 时间</th><th>阶段 / 结果</th><th>腾讯CID / 集数</th><th>请求ID</th><th>结果说明</th></tr></thead><tbody>${logs.map(l=>`<tr><td>${esc(l.title)}<span class="subline">${esc(l.time)}</span></td><td>${esc(l.stage)}<span class="subline">${tag(l.state)}</span></td><td>${esc(l.cid||'—')}<span class="subline">${l.count}集</span></td><td>${esc(l.request)}<div>${op('复制','copy','copy',`data-value="${esc(l.request)}"`,'text small')}</div></td><td class="log-message">${esc(l.message)}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">暂无推送记录</td></tr>'}</tbody></table>`;foot='<button data-action="close-modal">关闭</button>';}
    if(ui.modal==='preview'){heading=m.file.name;large=true;body=`<div class="hint" style="margin-bottom:12px">${m.file.preview.startsWith('data:')||m.file.preview.startsWith('blob:')?'当前选择文件':'预置示例文件，仅供评审'} ${mark('preview')}</div>${m.file.kind==='image'?`<img class="preview-image" src="${esc(m.file.preview)}" alt="${esc(m.file.name)}">`:`<iframe class="pdf-preview" src="${esc(m.file.preview)}" title="PDF预览"></iframe>`}`;foot='<button data-action="close-modal">关闭预览</button>';}
    if(ui.modal==='leave'){heading='有未保存的修改';body=`当前腾讯资料尚未保存，请选择如何返回。${mark('leave')}`;foot='<button data-action="close-modal">继续编辑</button><button data-action="discard">放弃修改</button><button class="primary" data-action="save-leave">保存并返回</button>';}
    if(ui.modal==='reset'){heading='重置本原型的示例数据？';body=`重置将清除当前浏览器中本原型的草稿、文件选择和模拟推送记录。${mark('reset')}`;foot='<button data-action="close-modal">取消</button><button class="primary" data-action="confirm-reset">重置示例</button>';}
    $('#modal').hidden=false;$('#modal').innerHTML=`<section class="dialog ${large?'large':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="dialog-head"><h2 id="dialog-title">${esc(heading)}</h2><button data-action="close-modal" aria-label="关闭弹窗" ${ui.running?'disabled':''}>×</button></header><div class="dialog-body">${body}</div><footer class="dialog-footer">${foot}</footer></section>`;bindLabels($('#modal'));
  }
  function saveDraft(silent=false){
    const d=drama(ui.draft.id);
    // 保存开放维护的腾讯字段与文件，保留源合集、CID和提交记录。
    TV.applyEditableMetadata(d,ui.draft);
    d.is_cp_key_record=ui.draft.is_cp_key_record;
    d.proofTypes=TV.ownProofTypes(ui.draft);
    d.files=clone(ui.draft.files);
    d.roles=d.roles.map((r,i)=>({...r,image:ui.draft.roles[i]?clone(ui.draft.roles[i].image):r.image}));
    d.saved=true;
    const ok=persist();ui.dirty=!ok;if(ok){ui.draft=clone(d);if(!silent)toast('腾讯资料已保存');}return ok;
  }
  function startPush(ids,check=false){if(!ids.length){toast('请先选择合集',true);return;}ui.pushRows=ids.map(id=>({id,issues:pushIssues(drama(id)),result:''}));ui.stage=0;openModal('push',{check,finished:false});}
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  function addLog(d,stage,state,message,request){d.logs.unshift({id:'DEMO-'+Date.now()+'-'+Math.random().toString(16).slice(2,6),time:new Date().toLocaleString('sv-SE',{hour12:false}),stage,state,message,request,cid:d.cid,count:d.count});d.lastTime=new Date().toLocaleString('sv-SE',{hour12:false});persist();}
  async function runPush(){if(ui.running||ui.pushRows.some(r=>r.issues.length))return;ui.running=true;ui.pushRows.forEach(r=>{drama(r.id).status='提交中';});persist();render();const scenario=$('#scenario').value;$('#scenario').disabled=true;$('#resetDemo').disabled=true;let simulated=false;
    for(const r of ui.pushRows){const d=drama(r.id);const req='DEMO-REQ-'+Date.now().toString(36).toUpperCase();const fail=simulated?'success':scenario;simulated=true;d.status='提交中';ui.stage=0;r.result='正在上传专辑与分集素材…';renderModal();await delay(650);
      if(fail==='upload-fail'){d.status='提交失败';r.result='素材上传明确失败，尚未进入专辑创建，可重试。';addLog(d,'素材上传','明确失败',r.result,req+'-U');continue;}
      const reused=TV.assetList(d).filter(a=>a.file.uploaded).length;TV.assetList(d).forEach(a=>{a.file.uploaded=true;a.file.ref=a.file.ref||'demo_asset_'+Date.now();});d.episodes.forEach(e=>{e.uploaded=true;e.coverUploaded=true;});addLog(d,'素材上传','上传成功',`已准备${TV.assetList(d).length}份专辑素材及${d.count}集视频、封面；复用${reused}份已知素材。`,req+'-U');ui.stage=1;r.result=d.cid?'复用已有CID，跳过专辑创建…':'正在创建腾讯专辑…';renderModal();await delay(650);
      if(!d.cid&&fail==='cid-timeout'){d.status='提交中';d.unknownStage='专辑创建';r.result='专辑创建超时，结果待确认；核实前禁止重新创建。';addLog(d,'专辑创建','结果待确认',r.result,req+'-C');continue;}
      if(!d.cid){d.cid='mzc_demo_'+d.id;addLog(d,'专辑创建','创建成功','已取得腾讯CID，后续复用该CID提交分集。',req+'-C');}
      ui.stage=2;r.result=`正在提交${d.count}集分集…`;renderModal();await delay(700);
      if(fail==='submit-timeout'){d.status='提交中';d.unknownStage='分集提交';r.result='分集提交超时，结果待确认；保留CID，核实前禁止重推。';addLog(d,'分集提交','结果待确认',r.result,req+'-S');}
      else if(fail==='submit-reject'){d.status='提交失败';r.result='本次分集明确未受理，保留CID与已上传文件，可修正后重试。';addLog(d,'分集提交','明确失败',r.result,req+'-S');}
      else{d.status='提交成功';d.submitted=d.count;d.unknownStage='';r.result=`已提交${d.count}集，接口接收成功；不代表审核通过或上线。`;addLog(d,'分集提交','提交成功',r.result,req+'-S');}
    }
    ui.running=false;ui.modalData.finished=true;$('#scenario').disabled=false;$('#resetDemo').disabled=false;persist();if(ui.page==='form')ui.draft=clone(drama(ui.draft.id));render();toast(ui.pushRows.every(r=>drama(r.id).status==='提交成功')?'所选合集已提交，请查看结果':'执行结束，部分合集需要处理',!ui.pushRows.every(r=>drama(r.id).status==='提交成功'));
  }
  function showMore(button,id){const p=db.pools.find(p=>p.id===id),rect=button.getBoundingClientRect(),stage=$('.prototype-stage').getBoundingClientRect();popPool=id;$('#popover').innerHTML=`${p.type==='腾讯视频'?'<button data-action="collections">查看合集信息</button><button data-action="pool-logs-entry">推送记录</button>':'<button data-action="members-menu">查看池元素</button>'}<button data-action="toggle-pool">${p.enabled?'停用':'启用'}合集池</button>`;$('#popover').hidden=false;$('#popover').style.left=Math.min(rect.left-stage.left,1390)+'px';$('#popover').style.top=Math.min(rect.bottom-stage.top+5,stage.height-145)+'px';}
  async function onAction(b){const a=b.dataset.action,id=Number(b.dataset.id);if(ui.running&&a!=='return-stage')return;
    switch(a){
      case 'pools':if(ui.page==='form'&&ui.dirty){openModal('leave',{to:'pools'});break;}ui.page='pools';ui.selected.clear();render();break;
      case 'create':openModal('create');break;
      case 'rename':openModal('rename',{pool:id});break;
      case 'members':ui.members=new Set(db.pools.find(p=>p.id===id).ids);ui.memberQuery='';openModal('members',{pool:id});break;
      case 'auto':openModal('auto',{pool:id});break;
      case 'more':showMore(b,id);break;
      case 'collections':ui.pool=popPool;ui.page='collections';ui.filter={id:'',name:'',status:''};ui.selected.clear();render();break;
      case 'members-menu':onAction({dataset:{action:'members',id:popPool}});break;
      case 'pool-logs-entry':ui.pool=popPool;openModal('logs');break;
      case 'toggle-pool':{const p=db.pools.find(p=>p.id===popPool);p.enabled=!p.enabled;persist();render();toast(p.enabled?'合集池已启用':'合集池已停用');break;}
      case 'save-pool':{const name=$('#pool-name').value.trim(),p=db.pools.find(p=>p.id===ui.modalData.pool);if(!name){toast('请填写池名称',true);break;}if(db.pools.some(x=>x.name===name&&x.id!==p?.id)){toast('池名称已存在',true);break;}if(p)p.name=name;else{db.pools.unshift({id:db.nextPool++,name,type:$('#pool-type').value,enabled:$('#pool-status').value==='true',ids:[]});ui.poolFilter={id:'',name:'',type:$('#pool-type').value,status:''};}persist();closeModal();toast(p?'池名称已更新':'合集池已创建');break;}
      case 'save-members':db.pools.find(p=>p.id===ui.modalData.pool).ids=[...ui.members];ui.selected.clear();persist();closeModal();toast('池元素已保存');break;
      case 'member-search':ui.memberQuery=$('#member-search').value.trim();renderModal();break;
      case 'save-auto':db.pools.find(p=>p.id===ui.modalData.pool).auto={enabled:$('#auto-enabled').value,kind:$('#auto-kind').value};persist();closeModal();toast('自动添加规则已保存');break;
      case 'reset-pools':ui.poolFilter={id:'',name:'',type:'',status:''};render();break;
      case 'reset-filter':ui.filter={id:'',name:'',status:''};ui.selected.clear();render();break;
      case 'toggle-keywords':closeProofSelect();ui.keywordOpen=!ui.keywordOpen;renderKeywordPicker();break;
      case 'toggle-keyword':changeKeyword(b.dataset.value);break;
      case 'remove-keyword':changeKeyword(b.dataset.value,true);break;
      case 'toggle-proof-select':closeKeywords();if(ui.draft.has_own_copyright==='1543606'){ui.proofOpen=!ui.proofOpen;renderProofSelect();}break;
      case 'toggle-proof-type':changeProofType(b.dataset.value);break;
      case 'remove-proof-type':changeProofType(b.dataset.value,true);break;
      case 'edit':ui.metadataAttempted=false;ui.metadataTouched.clear();ui.proofOpen=false;ui.keywordOpen=false;ui.draft=clone(drama(id));TV.changeContentType(ui.draft,ui.draft.kind);ui.dirty=false;ui.page='form';render();break;
      case 'save-files':if(!confirmMetadata())break;if(saveDraft(true)){ui.page='collections';render();toast('腾讯资料已保存');}break;
      case 'remove-role-image':ui.draft.roles[Number(b.dataset.index)].image=null;ui.dirty=true;render();break;
      case 'remove-file':{const arr=ui.draft.files[b.dataset.slot];arr.splice(Number(b.dataset.index||0),1);ui.dirty=true;render();break;}
      case 'preview-file':openModal('preview',{file:ui.draft.files[b.dataset.slot][Number(b.dataset.index||0)]});break;
      case 'preview-role':openModal('preview',{file:ui.draft.roles[Number(b.dataset.index)].image});break;
      case 'leave':if(ui.dirty)openModal('leave');else{ui.page='collections';render();}break;
      case 'discard':ui.page=ui.modalData.to||'collections';ui.draft=null;ui.dirty=false;closeModal();break;
      case 'save-leave':if(saveDraft()){ui.page=ui.modalData.to||'collections';closeModal();}break;
      case 'push-one':startPush([id]);break;
      case 'push-selected':startPush([...ui.selected]);break;
      case 'check-selected':startPush([...ui.selected],true);break;
      case 'run-push':await runPush();break;
      case 'pool-logs':openModal('logs');break;
      case 'copy':try{await navigator.clipboard.writeText(b.dataset.value);toast('请求ID已复制');}catch{toast('复制未成功，可直接选中请求ID复制',true);}break;
      case 'close-modal':closeModal();break;
      case 'confirm-reset':db=TV.seed();persist();ui.page='pools';ui.draft=null;ui.dirty=false;ui.selected.clear();ui.poolFilter={id:'',name:'',type:'腾讯视频',status:''};$('#scenario').value='success';closeModal();toast('已恢复示例数据');break;
      case 'return-stage':window.scrollTo({left:0,behavior:'smooth'});break;
    }
  }
  document.addEventListener('click',e=>{if(ui.keywordOpen&&!e.target.closest('[data-keyword-select]'))closeKeywords();if(ui.proofOpen&&!e.target.closest('[data-proof-select]'))closeProofSelect();const ann=e.target.closest('[data-note]');if(ann){e.preventDefault();e.stopPropagation();const el=$('#note-'+ann.dataset.note);el?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});el?.classList.add('highlight');setTimeout(()=>el?.classList.remove('highlight'),1500);return;}const action=e.target.closest('[data-action]');if(action)onAction(action);else if(!e.target.closest('#popover'))$('#popover').hidden=true;});
  document.addEventListener('submit',e=>{e.preventDefault();if(e.target.getAttribute('id')==='pool-filters')ui.poolFilter=Object.fromEntries(new FormData(e.target));if(e.target.getAttribute('id')==='collection-filters'){ui.filter=Object.fromEntries(new FormData(e.target));ui.selected.clear();}render();});
  document.addEventListener('input',e=>{if(e.target.dataset.metadata&&e.target.type==='number')updateMetadata(e.target);});
  document.addEventListener('change',async e=>{const el=e.target;
    if(el.dataset.metadata){updateMetadata(el);return;}
    if(el.id==='is-cp-key-record'){
      ui.draft.is_cp_key_record=el.value==='true';ui.dirty=true;render();$('#is-cp-key-record')?.focus({preventScroll:true});return;
    }
    if(el.dataset.select){el.checked?ui.selected.add(Number(el.dataset.select)):ui.selected.delete(Number(el.dataset.select));render();}
    if(el.id==='select-all'){collectionRows().forEach(d=>el.checked?ui.selected.add(d.id):ui.selected.delete(d.id));render();}
    if(el.dataset.member){el.checked?ui.members.add(Number(el.dataset.member)):ui.members.delete(Number(el.dataset.member));renderModal();}
    if(el.dataset.file!==undefined){const selectedDraft=ui.draft;const slot=el.dataset.file,isRole=!!el.dataset.roleFile,kind=isRole||TV.covers.some(f=>f.key===slot)?'image':'pdf';const accepted=[];for(const f of el.files){try{if(kind==='pdf'){const head=new TextDecoder().decode(await f.slice(0,5).arrayBuffer());if(head!=='%PDF-')throw Error('请选择有效的PDF文件');}else if(!f.type.startsWith('image/'))throw Error('请选择有效图片');const preview=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(f);});if(kind==='image')await new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=()=>reject(Error('图片无法读取，请重新选择'));im.src=preview;});accepted.push({name:f.name,size:f.size,kind,preview,uploaded:false,ref:''});}catch(err){toast(err.message||'文件读取失败',true);}}
      if(selectedDraft!==ui.draft||ui.page!=='form')return;if(accepted.length){if(isRole)ui.draft.roles[Number(slot)].image=accepted[0];else if(TV.attachments(ui.draft).find(f=>f.key===slot)?.multiple)ui.draft.files[slot]=[...(ui.draft.files[slot]||[]),...accepted];else ui.draft.files[slot]=[accepted[0]];ui.dirty=true;render();toast('文件已选择，推送时上传至腾讯');}}
  });
  document.addEventListener('focusin',e=>{if(ui.keywordOpen&&!e.target.closest('[data-keyword-select]'))closeKeywords();if(ui.proofOpen&&!e.target.closest('[data-proof-select]'))closeProofSelect();});
  document.addEventListener('keydown',e=>{
    if(!ui.modal&&e.key==='Escape'&&ui.keywordOpen){e.preventDefault();closeKeywords(true);return;}
    if(e.target.id==='metadata-micro_series_keyword'&&e.key==='ArrowDown'){e.preventDefault();closeProofSelect();ui.keywordOpen=true;renderKeywordPicker('[data-keyword-option]');return;}
    if(e.target.matches('[data-keyword-option]')&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const items=[...document.querySelectorAll('[data-keyword-option]')],index=items.indexOf(e.target);items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();return;}
    if(e.target.classList.contains('proof-upload-tile')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.querySelector('input[type=file]')?.click();return;}
    if(!ui.modal&&e.key==='Escape'&&ui.proofOpen){e.preventDefault();closeProofSelect(true);return;}
    if(e.target.id==='proof-type-trigger'&&e.key==='ArrowDown'&&!e.target.disabled){e.preventDefault();ui.proofOpen=true;renderProofSelect('[data-proof-option]');return;}
    if(e.target.matches('[data-proof-option]')&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const items=[...document.querySelectorAll('[data-proof-option]')],index=items.indexOf(e.target);items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();return;}
    if(e.key==='Escape'){if(ui.modal)closeModal();else $('#popover').hidden=true;}if(e.key==='Tab'&&ui.modal){const a=[...$('#modal').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')];if(e.shiftKey&&document.activeElement===a[0]){e.preventDefault();a.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===a.at(-1)){e.preventDefault();a[0]?.focus();}}});
  window.addEventListener('beforeunload',e=>{if(ui.dirty||ui.running){e.preventDefault();e.returnValue='';}});
  $('#goNotes').addEventListener('click',()=>$('#notes').scrollIntoView({behavior:'smooth',inline:'nearest',block:'nearest'}));$('#resetDemo').addEventListener('click',()=>openModal('reset'));if(exampleUpdated||sourceUpdated||coverUpdated||actorUpdated)persist();render();
})();
