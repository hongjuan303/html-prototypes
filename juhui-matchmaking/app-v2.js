import {chooseOverview,returnOverview,clearOverviewCross} from './overview-v16.js?v=20261109-overview-merge';
import {overviewNotes} from './overview-notes-v16.js?v=20261109-overview-merge';
import {materialReviewSurface,materialHistoryModal,isMaterialReview} from './material-review-v15.js?v=20261109-overview-merge';
import {materialFeedback,materialHistoryButton} from './material-feedback-v15.js?v=20261109-overview-merge';
import {materialForm,readMaterialForm,syncMaterialForm,bindMaterialNavigation,jumpMaterialSection} from './material-form-v14.js?v=20261109-overview-merge';
import {validateMaterialValues} from './material-data-v14.js?v=20261109-overview-merge';
import {groupedMaterialFiles,renderMaterialMetadata} from './material-display-v14.js?v=20261109-overview-merge';
import {permissionsPage,permissionModal,permissionValues,updatePermissionDraft} from './permissions-v10.js?v=20261109-overview-merge';
import {permissionNotes} from './permission-notes-v10.js?v=20261109-overview-merge';
import {scriptHistoryModal,canReadScriptHistory} from './script-history-v9.js?v=20261109-overview-merge';
import {isSpreadsheet,loadSpreadsheet,spreadsheetPreview} from './attachment-preview-v9.js?v=20261109-overview-merge';
import {dashboardPage,dashboardRows,dashboardTarget,dashboardArchiveBody} from './dashboard-v9.js?v=20261109-overview-merge';
import {normalizeSupplierContext,rememberSupplierContext,switchSupplierContext,enterSupplierContext,supplierBusinessNavigation,supplierIdentityNavigation,supplierIdentityName} from './supplier-context-v9.js?v=20261109-overview-merge';
import {demoFileUrl,readDemoWord} from './demo-assets-v8.js?v=20261109-overview-merge';
import {scenarioPanel,sceneSupplier} from './demo-scenarios-v8.js?v=20261109-overview-merge';
import * as A from './access-v3.js?v=20261109-overview-merge';
import * as B from './business-v3.js?v=20261109-overview-merge';
import {ui as createUI} from './ui-v3.js?v=20261109-overview-merge';
import * as M from './model-v2.js?v=20261109-overview-merge';
import * as F from './fields.js?v=20261109-overview-merge';
import * as N from './navigation-v2.js?v=20261109-overview-merge';
import {details as createDetails} from './details-v4.js?v=20261109-overview-merge';
import {readingDocument,readWord,readReviewWord,demoReading} from './word-preview.js?v=20261109-overview-merge';
import {persistReviewFiles,restoreReviewFiles} from './review-files.js?v=20261109-overview-merge';
import {makerViews,supplierRelease} from './supplier-v6.js?v=20261109-overview-merge';
import {productionViews} from './production-v6.js?v=20261109-overview-merge';
import {catalog,canBatchMatch} from './catalog-v5.js?v=20261109-overview-merge';
import {writerViews} from './writer-v7.js?v=20261109-overview-merge';
import {projectTasks} from './tasks-v7.js?v=20261109-overview-merge';
import {reviewNames,reviewSurface,taskNavigation,updateWorkPreview} from './workbench-v7.js?v=20261109-overview-merge';
import {recoverAttachment} from './attachment-recovery-v7.js?v=20261109-overview-merge';
let state=M.load(),dialog=null,crossDetailReturn=null,context='',toastTimer,disposeMaterialNavigation;
const modalScrollArea=()=>document.querySelector('.material-scroll')||document.querySelector('.modal-body');const uploads=new Map(),fileRefs=new Map();
const root=document.querySelector('#app');
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs={grid:'▦',file:'▤',users:'♧',check:'✓',clock:'◷',play:'▷',folder:'▱',flow:'⇄'};
const platform=()=>state.ui.system==='platform';const writer=()=>!platform()&&state.ui.identity==='script';
const can=(...r)=>A.canFor(state,project(),...r);const person=()=>platform()?A.current(state)?.name||'未授权账号':M.nameOf(state,state.ui.supplier);
const displayBusiness=p=>A.roleAlias(state,state.users.find(u=>u.name===p.business),state.ui.business,'business')||p.alias||p.business;
const X=()=>createUI(state,{E,button,link,badge,note,panel,field,fileInput,fileList,issue,heading,empty});
const button=(label,action,id='',cls='',extra='')=>`<button type="button" class="btn ${cls}" data-action="${action}" data-id="${E(id)}" ${extra}>${label}</button>`;
const link=(label,action,id='',extra='')=>button(E(label),action,id,'link',extra);
const badge=(text,color='')=>`<span class="badge ${color}">${E(text)}</span>`;
const audit=x=>badge(M.audits[x]||x,({approved:'green',pending:'blue',revision:'orange',resubmit:'orange',waiting:'orange',rejected:'red'})[x]||'');
const scriptAudit=x=>{const status=M.scriptAuditStatus(x);return badge(M.scriptAudits[status]||status,({approved:'green',pending:'blue',revision:'orange',rejected:'red'})[status]||'');};
const stage=p=>badge(p.stage==='release'?(p.film.status==='approved'?'发行准备':'安全审核'):M.stages[p.stage],({matching:'orange',review:'blue',production:'blue',scheduling:'green',online:'green',ended:'red'})[p.stage]||'');
const issue=t=>`<div class="notice">${t}</div>`;
const empty=t=>`<div class="empty"><span>▤</span><strong>${t}</strong><small>调整筛选条件，或查看其他业务阶段</small></div>`;
const field=(label,name,value='',options={})=>`<label class="field ${options.wide?'wide':''}"><span>${options.required?'<i>*</i> ':''}${label}</span>${options.select?`<select name="${name}" ${options.required?'required':''}>${options.placeholder===false?'':'<option value="">请选择</option>'}${options.select.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${E(v)}" ${v===value?'selected':''}>${E(l)}</option>`;}).join('')}</select>`:options.area?`<textarea name="${name}" ${options.required?'required':''} ${options.max?'maxlength="'+options.max+'"':''}>${E(value)}</textarea>`:`<input name="${name}" type="${options.type||'text'}" value="${E(value)}" ${options.required?'required':''} ${options.max?'maxlength="'+options.max+'"':''} ${options.type==='number'?'min="1" step="1"':''} ${options.readonly?'readonly':''}>`}${options.help?`<small>${options.help}</small>`:''}</label>`;
const fileInput=(name,label,word=false,required=false)=>`<label class="field file-field"><span>${required?'<i>*</i> ':''}${label}</span><div class="upload-icon">↑</div><strong>点击选择文件</strong><small>${word?'仅支持 .doc、.docx 格式':'选择本地文件上传'}</small><input type="file" name="${name}" aria-label="${label}" ${word?'accept=".doc,.docx"':''} ${required?'required':''} ${!word?'multiple':''}><em class="file-selection">尚未选择文件</em></label>`;
// Only the approved permission-page increment has requirement annotations.
const note=()=>'';
function panel(title,body,actions=''){return `<section class="panel"><header><h3>${title}</h3><div class="actions">${actions}</div></header><div class="panel-body">${body}</div></section>`;}
function fileList(files=[]){return files.length?`<div class="files">${files.map(original=>{
 const f=original;
 const key=f.previewId||`${state.ui.id||''}|${f.name}`;fileRefs.set(key,f);
 return `<div class="file-row"><span class="word-icon">${/\.docx?$/i.test(f.name)?'W':'▤'}</span><div><strong>${E(f.name)}</strong><small>${f.version?'V'+f.version+' · ':''}${f.at||'2026-11-02'}${f.demo?' · 合成示例附件':''}</small></div><div class="file-actions">${link(/\.docx?$/i.test(f.name)||f.reviewAttachment?'在线预览':'查看文件','file',key)}${uploads.get(f.previewId||f.name)?.url||demoFileUrl(f)?`<a class="btn link" href="${E(uploads.get(f.previewId||f.name)?.url||demoFileUrl(f))}" download="${E(f.name)}">下载</a>`:''}</div></div>`;
 }).join('')}</div>`:`<div class="muted pad">暂未上传文件</div>`;}

const project=()=>state.projects.find(p=>p.id===state.ui.id);
const menuInfo=N.info;
const menus=()=>N.menus(state);
const menuTitle=N.title;
function top(){return `<div class="review-bar" ${dialog?'inert':''}><div><span class="prototype-dot"></span><strong>剧汇版权服务中心</strong><span class="version">流程评审 · 11.09</span></div><div class="segmented"><button data-system="platform" class="${platform()?'active':''}">平台端</button><button data-system="supplier" class="${!platform()?'active':''}">供应商端</button></div><label>${platform()?'演示人员':'演示供应商'}<select aria-label="${platform()?'演示人员':'供应商账号'}" data-switch="${platform()?'user':'supplier'}">${(platform()?state.users.map(u=>[u.id,u.name]):state.suppliers.map(x=>[x.id,x.name])).map(([v,l])=>`<option value="${v}" ${v===(platform()?state.ui.user:state.ui.supplier)?'selected':''}>${E(l)}</option>`).join('')}</select></label><div class="review-right">${button('测试场景','demo-scenarios','','text')}${button('流程总览','flow','','text')}${button('推进24小时','clock','','text')}${button('重置示例','reset','','text')}</div></div>`;}
function sidebar(){
 const nav=v=>`<button data-view="${v}" class="${v===state.ui.view?'active':''}"><span>${glyphs[menuInfo[v][1]]}</span>${menuTitle(v)}</button>`;
 const available=A.available(state),sp=state.suppliers.find(x=>x.id===state.ui.supplier);
 return `<aside class="sidebar" ${dialog?'inert':''}><div class="brand"><span class="brand-symbol">▣</span><strong>容量剧汇</strong><small>版权服务中心</small></div><span class="system-label">${platform()?'平台端':'供应商端'}</span>${platform()?`<div class="business-switch" aria-label="业务切换">${Object.entries(A.lines).filter(([k])=>available.includes(k)).map(([k,l])=>`<button data-business="${k}" class="${state.ui.business===k?'active':''}">${l}</button>`).join('')}</div>`:supplierIdentityNavigation(state)}<div class="nav-caption">${A.lines[state.ui.business]}</div><nav aria-label="业务菜单">${menus().filter(v=>!N.settings.includes(v)).map(nav).join('')}</nav>${menus().some(v=>N.settings.includes(v))?`<div class="nav-caption">共用系统设置</div><nav aria-label="系统设置">${menus().filter(v=>N.settings.includes(v)).map(nav).join('')}</nav>`:''}<div class="account"><span class="avatar">${platform()?'汇':'供'}</span><div><strong>${E(person())}</strong><small>${platform()?A.isAdmin(state)?'管理员 · 全部操作权限':A.getRoles(state).map(r=>A.label(r,state.ui.business)).join(' / '):'供应商工作台'}</small></div></div></aside>`;
}

function heading(title,sub){return `<div class="breadcrumb">${platform()?(N.settings.includes(state.ui.view)?'共用系统设置':A.lines[state.ui.business]):A.lines[state.ui.business]} <span>/</span> ${title}</div><div class="heading"><h1>${title}</h1><p>${sub}</p></div>`;}
const filtered=()=>N.rows(state);
function listNavigation(){
 const tabs=N.tabs(state);if(!tabs.length)return '';
 const intake=state.ui.view==='intake',maker=!platform()&&!writer(),base=N.baseRows(state);
 const lines=intake?(maker?['剧本评估：接收推送、在线阅读剧本并反馈选择结果。','待反馈：当前可选的推送。','已选中：查看选本记录，制作交付与物料在内容管理中处理。','不可再选：已被其他承制方选中、超时、撤回或已反馈未选中的记录保留，并置灰。']:[
  ...(tabs.some(([k])=>k==='card')?['一卡仅供匹配承制方时预览。']:[]),
  ...(tabs.some(([k])=>k==='full')?[platform()?'剧本内容审核：直接审核已提交全集；内部本直接提交全集。两项审核通过后，总编在剧本库定稿评级。':'全集与修改：直接审核已提交全集；剧本安审退回后，修改版重新进行剧本评估和安审。']:[]),
  ...(tabs.some(([k])=>k==='safety')?['剧本安审：审核同一份全集；与内容审核并行，两项都通过后才能定稿评级。']:[]),
  '页签数量：显示当前权限范围内的记录数量；切换页签保留剧名与来源筛选，项目阶段和页码重置。'
 ]):[`阶段筛选：${tabs.map(x=>x[1]).join('、')}。`,'待发行：包含物料与正片安审、合同留档及待排期项目；具体进度在当前阶段中区分。',writer()?'处理入口：在内容管理中提交剧本物料、查看反馈和进度；返回时保留页签、条件和页码。':platform()?'处理入口：剧本库完成评级、制片分配与匹配；撮合管理处理制作与发行；返回时保留页签、条件和页码。':'处理入口：只展示本承制方选中的项目，制作交付与物料在详情中完成；返回时保留页签、条件和页码。'];
 const marker=note(intake?'评估页签':'项目阶段','筛选项',lines);
 return `<div class="list-tabs-wrap"><div class="tabs list-tabs" role="tablist" aria-label="${state.ui.view==='library'?'入库进度':intake?'评估分类':'项目阶段'}">${tabs.map(([k,l])=>`<button type="button" role="tab" aria-selected="${state.ui.listTab===k}" data-list-tab="${k}" class="${state.ui.listTab===k?'active':''}">${l}<span>${base.filter(p=>N.inTab(state,p,k)).length}</span></button>`).join('')}</div>${marker}</div>`;
}
function assessment(p){return evaluationProgress(p);}
function nextInList(p){return nextAction(p);}
function nextAction(p){if(p.stage==='review')return p.safety.status==='revision'||p.quality.status==='revision'?'剧本方按意见修改':'内容 / 安审独立处理';if(p.stage==='rating')return '待总编评级';if(p.stage==='matching')return !p.card?'补充承制方选本一卡':p.producer?'等待承制方选本':'分配负责制片';if(p.stage==='production')return productionText(p);if(p.stage==='release')return M.ready(p).filter(x=>!x.ok).map(x=>x.label).join('、')||'自动进入排播';if(p.stage==='scheduling')return p.schedule?'等待渠道发行结果':'排播人员设置档期';return M.stages[p.stage];}
function productionText(p){const items=p.production.slice(0,3);return items.filter(x=>x.status==='approved').length+'/3 已通过 · '+items.filter(x=>x.status==='pending').length+'项待审核';}
function evaluationProgress(p){
 if(p.stage==='ended')return `<div class="evaluation-progress">${scriptAudit('rejected')}</div>`;
 return `<div class="evaluation-progress"><div><span>内容审核</span>${scriptAudit(p.quality.status)}</div><div><span>安全审核</span>${scriptAudit(p.safety.status)}</div></div>`;
}
function cardPanel(p){
 const editable=M.canManageCard(state,p);
 return panel('承制方选本一卡',`<p class="subtle">用于匹配时供承制方预览，不参与剧本审核。承制方确认选中后才同步全集。</p>${fileList(p.card?[p.card]:[])}${!p.card?issue('推送承制方前需补充一卡；不影响当前全集内容与安全审核。'):''}`,editable?button(p.card?'更新一卡':'上传一卡','card',p.id):'');
}
const materialLabel=kind=>kind==='scriptMaterial'?'剧本物料':'制作物料';
const materialStatus=x=>badge(({none:'待上传',draft:'草稿',pending:'待核验',approved:'已确认',revision:'待修改'})[x.status]||x.status,({pending:'blue',approved:'green',revision:'orange'})[x.status]||'');
function materialResponsibility(p,kind){return kind==='makerMaterial'?'承制方提交 · 项目制片核验':p.source==='internal'?'剧本商务上传 · 总编核验':'剧本方提交 · 剧本商务核验';}
function materialSection(p,kind,{editable=false}={}){
 const x=p[kind],title=materialLabel(kind),isScript=kind==='scriptMaterial',role=isScript?(p.source==='internal'?'editor':'business'):'producer';
 const content=item=>renderMaterialMetadata(item.values,kind,{E})+groupedMaterialFiles(item.files||[],{E,fileList},kind);
 const draft=x.draft&&!['none','draft'].includes(x.status)?`<details class="supporting-file"><summary>未提交的${title}草稿</summary>${content(x.draft)}</details>`:'';
 const confirmed=x.confirmedSnapshot&&x.status!=='approved'?`<details class="supporting-file"><summary>上次已确认的${title}</summary>${content(x.confirmedSnapshot)}</details>`:'';
 const actions=materialHistoryButton(p,kind,{button})+(editable?button(x.status==='none'?'上传'+title:x.draft||x.status==='draft'?'继续编辑'+title:'补充'+title,kind,p.id):'')+(platform()&&A.canFor(state,p,role)&&x.status==='pending'?button('核验'+title,isScript?'confirmScript':'confirmMaker',p.id,'primary'):'');
 return `<div id="material-${kind}" class="material-section" tabindex="-1">${panel(title,`<p class="material-responsibility">${E(materialResponsibility(p,kind))}<span>任何阶段均可上传和补充</span></p><div class="inline-status">${materialStatus(x)}${x.submittedAt?`<span>提交时间：${E(x.submittedAt)}</span>`:''}${x.draft&&!['none','draft'].includes(x.status)?badge('另有未提交草稿','orange'):''}</div>${materialFeedback(x,{E,fileList})}${content(x)}${draft}${confirmed}`,actions)}</div>`;
}
function internalMaterials(p){return p.source==='internal'?materialSection(p,'scriptMaterial',{editable:M.canUploadInternalMaterials(state,p)}):'';}
function libraryPreparation(p){
 if(p.source==='internal')return internalMaterials(p);
 if(p.selected||!A.canFor(state,p,'admin','business'))return '';
 return materialSection(p,'scriptMaterial')+panel('剧本合同留档',fileList(p.contracts.script?[p.contracts.script]:[]),A.canFor(state,p,'business')&&p.grade?button(p.contracts.script?'替换留档文件':'上传已签合同','contract',p.id,'','data-value="script"'):'');
}
function scriptVersionHistory(p){
 if(!p.scriptVersions?.length)return '';
 return `<details class="archive-history"><summary>历史剧本版本<span>${p.scriptVersions.length} 个历史版本</span></summary><div class="archive-history-body">${[...p.scriptVersions].reverse().map(v=>`<section class="script-version"><h4>V${v.version} · ${E(v.info.name)}</h4><p class="subtle">${E(v.archivedAt)} · ${E(v.archivedBy)}归档</p>${fileList(v.full?[v.full]:[])}<div class="two-col">${[['内容审核',v.quality],['剧本安审',v.safety]].map(([label,x])=>`<div><h4>${label} ${scriptAudit(x.status)}</h4><p>${E(x.opinion||'暂无意见')}</p>${reviewAttachments(x)}</div>`).join('')}</div></section>`).join('')}</div></details>`;
}
function evaluationListPage(){
 context='剧本评估';const rows=filtered();state.ui.page=Math.min(state.ui.page,Math.max(1,Math.ceil(rows.length/8)));
 const business=p=>p.business;
 return heading(context,'审核剧本全集的内容与安全；两项并行，均通过后进入剧本库。')+listNavigation()+
 `<section class="panel filter-panel"><form id="filters">${field('剧本名称 / ID','keyword',state.ui.keyword)}${field('评估进度','stage',state.ui.stage,{select:[['','全部状态'],...Object.entries(M.scriptAudits)],placeholder:false})}${platform()?field('剧本来源','source',state.ui.source,{select:[['','全部来源'],['external','外部剧本'],['internal','内部自有剧本']],placeholder:false}):''}<div class="filter-actions"><button class="btn primary">搜索</button>${button('重置','clear')}</div></form></section>`+
 `<section class="panel evaluation-list"><div class="table-toolbar"><h3>剧本列表 <span>${rows.length} 项</span></h3><div class="actions">${state.ui.listTab!=='ended'?`<label class="task-only"><input type="checkbox" data-task-only ${state.ui.taskOnly?'checked':''}>只看我的待办</label>`:''}${A.canCreateInternal(state)?button('＋ 新增内部剧本','new','','primary'):''}</div></div><div class="table-wrap"><table><thead><tr><th>剧本名称</th><th>来源 / 剧本方</th><th>评估进度</th><th>剧本商务</th><th>操作</th></tr></thead><tbody>${rows.slice((state.ui.page-1)*8,state.ui.page*8).map(p=>`<tr><td><button class="title-link" data-action="detail" data-id="${E(p.id)}">${E(p.name)}</button><small>${E(p.id)} · ${E(p.episodes)}集</small></td><td>${p.source==='internal'?badge('内部自有','purple'):badge('外部剧本')}<small>${E(M.nameOf(state,p.supplier))}</small></td><td>${evaluationProgress(p)}</td><td>${E(business(p)||'—')}</td><td><div class="evaluation-row-actions">${evaluationActions(p)}</div></td></tr>`).join('')}</tbody></table>${rows.length?'':empty('暂无符合条件的评估记录')}</div><div class="pagination"><span>共 ${rows.length} 条 · 每页 8 条</span>${button('‹','page','','',`data-page="${Math.max(1,state.ui.page-1)}" ${state.ui.page===1?'disabled':''}`)}<span class="current-page">${state.ui.page}</span>${button('›','page','','',`data-page="${state.ui.page+1}" ${state.ui.page*8>=rows.length?'disabled':''}`)}</div></section>`;
}
const P=()=>productionViews(state,{E,button,link,badge,panel,fileList,issue});
const makerPages=()=>makerViews(state,{E,heading,field,button,link,badge,panel,fileList,issue,empty,listNavigation,productionTab,filmTab,makerMaterials:p=>P().materials(p)});
const workHelpers=()=>({E,field,fileInput,fileList,button,link,badge,panel,issue});
const releaseProgress=p=>supplierRelease(state,p,{E,button,link,badge,panel,fileList,issue});
const writerPages=()=>writerViews(state,{E,heading,field,button,link,badge,panel,fileList,issue,empty,listNavigation,scriptTab,writerMaterials,releaseProgress});
function writerMaterials(p){return materialSection(p,'scriptMaterial',{editable:M.isWriter(state,p)});}
function evaluationActions(p){const tasks=projectTasks(state,p),primary=tasks.length?button(tasks.length>1?'处理待办（'+tasks.length+'）':E(tasks[0].label),'task-work',p.id,'primary small',`data-value="${E(tasks[0].key)}"`):'';const extra=(M.canReviseInternal(state,p)?link('编辑并重新提交','internal-revise',p.id):'')+(M.canUploadInternalMaterials(state,p)?link('上传剧本物料','scriptMaterial',p.id):'');return primary+link('查看详情','detail',p.id)+(extra?`<details class="row-menu"><summary>更多</summary><div class="row-menu-items">${extra}</div></details>`:'')+(!primary&&!extra?'<span class="muted">暂无待办</span>':'');}
function filmTab(p){return P().safety(p);}
function listPage(){if(writer())return writerPages().list();if(!platform()&&!writer())return makerPages().list();if(platform()&&['library','projects'].includes(state.ui.view))return catalog(state,{E,heading,field,button,link,badge,stage,listNavigation,empty});if((platform()||writer())&&state.ui.view==='intake')return evaluationListPage();context=menuTitle(state.ui.view);const rows=filtered(),library=state.ui.view==='library',phaseTabs=['projects','content'].includes(state.ui.view),evaluating=state.ui.view==='intake'&&(platform()||writer());state.ui.page=Math.min(state.ui.page,Math.max(1,Math.ceil(rows.length/8)));
 let h=heading(context,state.ui.view==='intake'?(platform()?'统一处理剧本评估与安审，按职责切换页签。':writer()?'上传一卡与全集，跟进内容与安全审核结果。':'查看推送剧本，在线阅读并反馈选本结果。'):state.ui.view==='library'?'管理审核通过的剧本，完成评级并跟进撮合进度。':writer()?'维护剧本物料，跟进撮合与发行进度。':'按项目跟进匹配、制作交付与发行进度。');
 h+=listNavigation();
 h+=`<section class="panel filter-panel"><form id="filters">${note('项目筛选','筛选项',['剧本名称 / ID：按名称或编号模糊查询。',...(!phaseTabs?['项目阶段：在当前页签与权限范围内筛选项目的整体进度。']:[]),...(platform()?['剧本来源：外部剧本、内部自有剧本，在权限范围内筛选。']:[])])}${field('剧本名称 / ID','keyword',state.ui.keyword)}${!phaseTabs?field('项目阶段','stage',state.ui.stage,{select:[['','全部阶段'],...Object.entries(M.stages)],placeholder:false}):''}${platform()?field('剧本来源','source',state.ui.source,{select:[['','全部来源'],['external','外部剧本'],['internal','内部自有剧本']],placeholder:false}):''}<div class="filter-actions"><button class="btn primary">搜索</button>${button('重置','clear')}</div></form></section>`;
 const newAllowed=state.ui.view==='intake'&&(writer()||A.canCreateInternal(state));
 const listMark=note('项目列表','列表项',['剧本名称：展示名称、项目ID；点击进入同一项目详情。','来源 / 剧本方：区分外部供应商与内部自有剧本。','题材 / 评级：显示最多3个题材标签，S/A/B为剧本评级。',evaluating?'评估进度：显示内容审核与安全审核结果，下方显示项目整体阶段。':'当前阶段：显示流程阶段；其他承制方选中后，该记录置灰保留。','下一步：显示当前待办或缺失的排播条件。','负责人：平台显示对接商务和项目制片；供应商显示对接商务花名。']);
 const actionMark=note('列表操作','操作项',['查看详情：剧本评估进入剧本与审核；撮合管理仅展示已确定承制方的项目，进入制作或发行页签；供应商内容管理展示自身资料和交付入口。','选本状态：承制方只可操作本次推送，已被其他方选中、超时或撤回时不可选择。','分页：每页8条，切换页码保留当前筛选条件。']);
 h+=`<section class="panel"><div class="table-toolbar"><h3>${library?'剧本列表':'项目列表'} ${listMark}<span>${rows.length} 项</span></h3>${newAllowed?`<div class="actions">${note(platform()?'内部剧本提交':'提交剧本','操作项',[platform()?'新增内部剧本：管理员或总编 / 项目负责人可提交；直接上传全集，进入内容与安全审核，一卡可在推送前补充。':'提交剧本：一卡与全集均必传；提交后直接进入内容与安全审核。','文件格式：剧本一卡、全集、修改稿仅支持.doc或.docx；校验后缀与文件内容。'])}${button('＋ '+(platform()?'新增内部剧本':'提交剧本'),'new','','primary')}</div>`:''}</div><div class="table-wrap"><table><thead><tr><th>剧本名称</th><th>来源 / 剧本方</th><th>题材 / 评级</th><th>${library?'评级状态':evaluating?'评估进度':'当前阶段'}</th><th>下一步</th><th>负责人</th><th>操作 ${actionMark}</th></tr></thead><tbody>${rows.slice((state.ui.page-1)*8,state.ui.page*8).map(p=>{const o=M.latestOffer(p,state.ui.supplier),locked=!platform()&&!writer()&&(p.selected&&p.selected!==state.ui.supplier||['expired','withdrawn','locked','declined'].includes(o?.status));return `<tr class="${locked?'locked':''}"><td><button class="title-link" data-action="detail" data-id="${p.id}">${E(state.ui.view==='content'?M.projectName(p):p.name)}</button><small>${p.id} · ${p.episodes}集</small></td><td>${p.source==='internal'?badge('内部自有','purple'):badge('外部剧本')}<small>${M.nameOf(state,p.supplier)}</small></td><td>${p.grade?badge(p.grade,'grade'):badge('待评级')}<small>${library&&!p.grade?'评级时确认题材':p.tags.join(' / ')}</small></td><td>${locked?badge(p.selected?'已被其他承制方选中':({expired:'推送已超时',withdrawn:'已撤回',declined:'未选中'}[o?.status]||'不可选择')):library?badge(p.grade?'已评级':'待评级',p.grade?'green':'orange'):evaluating?assessment(p):stage(p)}${evaluating?'<small>'+E(M.stages[p.stage])+'</small>':''}</td><td class="next-action">${locked?'该条记录保留，不可再选':E(nextInList(p))}</td><td>${platform()?E(p.producer||'待分配'):E(displayBusiness(p))}<small>${platform()?E(p.business):'对接商务'}</small></td><td><div class="actions">${link('查看详情','detail',p.id)}${library&&M.canRate(state,p)?link('评级','grade',p.id):''}</div></td></tr>`;}).join('')}</tbody></table>${rows.length?'':empty('暂无符合条件的项目')}</div><div class="pagination"><span>共 ${rows.length} 条 · 每页 8 条</span>${button('‹','page','','',`data-page="${Math.max(1,state.ui.page-1)}" ${state.ui.page===1?'disabled':''}`)}<span class="current-page">${state.ui.page}</span>${button('›','page','','',`data-page="${state.ui.page+1}" ${state.ui.page*8>=rows.length?'disabled':''}`)}</div></section>`;return h;}
function meta(p){return `<div class="project-meta"><span>项目编号<b>${p.id}</b></span><span>剧本来源<b>${p.source==='internal'?'内部自有':M.nameOf(state,p.supplier)}</b></span><span>剧本集数<b>${p.episodes} 集</b></span><span>项目制片<b>${E(p.producer||'待分配')}</b></span></div>`;}
function timeline(p){const steps=['review','rating','matching','production','release','scheduling','online'];let idx=steps.indexOf(p.stage);return `<div class="stepper">${steps.map((k,i)=>`<div class="${i<idx?'done':i===idx?'current':''}"><span>${i<idx?'✓':i+1}</span>${M.stages[k]}</div>`).join('')}</div>`;}
function reviewAttachments(review){return review?.files?.length?`<div class="review-attachments"><h4>审核附件</h4>${fileList(review.files.map(f=>({...f,reviewAttachment:true})))}</div>`:'';}
function previousReviews(review){return review?.previousResults?.length?`<details class="previous-reviews"><summary>历史审核意见与附件（${review.previousResults.length}）</summary>${[...review.previousResults].reverse().map(x=>`<section><h4>全集 V${x.version||1} ${scriptAudit(x.status)}</h4><p>${E(x.opinion||'暂无文字意见')}</p>${reviewAttachments(x)}</section>`).join('')}</details>`:'';}
function reviewCard(p,key,title,actor){const x=p[key],mark=note(title,'列表项与操作项',[`${title}：${key==='quality'?'由内容组独立处理，组内任一通过即可。':'由剧本安审角色独立处理。'}`,'审核结果：两项均通过才能定稿评级，一项待审不阻止另一项操作。','退回修改：安审退回时，原剧本评估结果转为待修改重审；修改版提交后，两项审核重新开启，可并行且均须通过。']);return `<div class="audit-card"><header><h3>${title} ${mark}</h3>${scriptAudit(x.status)}</header><small>${key==='safety'?'当前安审：'+E(state.users.find(u=>u.id===p.safetyAssignee)?.name||'待分配'):actor}</small>${x.recheckReason?issue(E(x.recheckReason)):''}<p>${E(x.opinion||'审核意见将展示在这里')}</p>${x.reviewedBy?`<small>${E(x.reviewedBy)} · 全集 V${x.version||1} · ${E(x.reviewedAt)}</small>`:''}${reviewAttachments(x)}${previousReviews(x)}${p.stage==='review'&&key==='safety'&&can('safetyLead')?button('分配剧本安审','match-safety-assign',p.id):''}${p.stage==='review'&&can(key==='quality'?'content':'safety')&&x.status==='pending'?button('处理审核',key,p.id,'primary'):''}</div>`;}
function scriptTab(p){
 if(writer()){const revise=p.stage==='review'&&[p.quality,p.safety].some(x=>['revision','resubmit'].includes(x.status));return `<div class="history-entry-actions">${button('审核记录','script-review-history',p.id,'','data-value="all"')}${button('剧本上传记录','script-upload-history',p.id)}</div><div class="section-heading"><h2>审核反馈</h2><span>当前全集 V${p.full?.version||1}</span></div><div class="two-col">${[['quality','内容审核'],['safety','安全审核']].map(([k,l])=>{const x=p[k];return panel(l,`${scriptAudit(x.status)}<p>${E(x.opinion||'暂未收到审核意见')}</p>${reviewAttachments(x)}`);}).join('')}</div>${revise?button('上传修改版全集','full',p.id,'primary'):''}`;}

 if(!platform()&&!writer())return panel('已同步的剧本资料',`<p class="subtle">已确认选中，现可查看用于制作的剧本全集。</p>${fileList(M.readableScriptFiles(state,p))}`);
 let h=panel('剧本全集',`<p>${E(p.intro)}</p><div class="subtle">备选剧名：${p.alternates.filter(Boolean).map(E).join('、')}</div>${fileList(p.full?[p.full]:[])}`,M.canReviseInternal(state,p)?button('编辑并重新提交','internal-revise',p.id,'primary'):M.isWriter(state,p)&&p.stage==='review'?button('上传修改版','full',p.id,'primary',p.stage==='review'&&!['revision'].includes(p.quality.status)&&p.safety.status!=='revision'?'disabled':''):'');
 h+=`<div class="section-heading"><h2>剧本审核</h2><span>独立并行 · 两项均通过</span></div><div class="two-col">${reviewCard(p,'quality','内容审核','内容组')}${reviewCard(p,'safety','安全审核','剧本安审人员')}</div>`;
 h+=cardPanel(p)+internalMaterials(p)+scriptVersionHistory(p);
 if(M.isAwaitingRating(p))h+=panel('审核结果',`<div class="inline-status">${badge('两项审核已通过','green')}<span>已进入剧本库，待总编 / 项目负责人评级。</span></div>`,N.canOpenLibrary(state,p)?button('查看剧本库','open-script-library',p.id):'');return h;}
const offerLabels={pending:'待反馈',selected:'已选中',locked:'已被其他方选中',declined:'未选中',expired:'超时收回',withdrawn:'人工撤回'};
function matchTab(p){const own=M.latestOffer(p,state.ui.supplier);let h='';
 if(!platform()){
 const unavailable=p.selected&&p.selected!==state.ui.supplier||own?.status!=='pending';h+=panel('一卡选本 '+note('承制方选本','列表项与操作项',['剧本资料：仅预览已推送给本账号的一卡；确认选中后才可查看全集；只有选中的承制方可进入后续制作。','确认选中：读取供应商配置的承制商务；第一家成功选中后锁定，进入内容管理的制作交付页签。','已选中：本人在评估记录中可进入内容管理，继续制作交付。','其他接收方：保留该条记录并置灰，不能继续选择，不展示他方交付或合同。','未选中：填写原因，保留本次反馈记录。']),`<div class="inline-status">${badge(offerLabels[own?.status]||'已选中',own?.status==='pending'?'orange':'')}<span>${p.selected&&p.selected!==state.ui.supplier?'已有其他承制方确认选中':E(p.intro)}</span></div><h4>剧本一卡</h4>${fileList(p.card?[p.card]:[])}${M.isMaker(state,p)?'<h4>剧本全集 · 已同步</h4>'+fileList(p.full?[p.full]:[]):issue(unavailable?'剧本全集仅向已确认选中的承制方开放。':'确认选中后，系统将向本承制方同步已审核通过的剧本全集。')}`,p.selected===state.ui.supplier?button('进入内容管理','manage-project',p.id,'primary'):own?.status==='pending'&&!unavailable?button('确认选中','select',p.id,'primary')+button('未选中','decline',p.id):button('不可再选择','noop',p.id,'','disabled'));return h;
 }
 h+=panel('承制方匹配 '+note('匹配配置','配置项与操作项',['项目制片：在评级时一并分配，负责剧本推送、制作审核及制作物料确认；承制方选中或更换时保留原分配。','S/A级：制片人工多选推送，24小时无响应收回，人工决定下一次推送。','B级：分配制片后，按最多3个剧本标签自动推送所有匹配承制方；支持人工补推。','物料：剧本已定稿即可匹配，物料确认不作为前置。'], 'B级超时策略待细化，原型不擅自套用S/A的24小时。'),`<div class="project-meta"><span>剧本评级<b>${E(p.grade||'未评级')}</b></span><span>匹配题材<b>${p.tags.join(' / ')}</b></span><span>负责制片<b>${E(p.producer||'待分配')}</b></span><span>选中承制方<b>${p.selected?M.nameOf(state,p.selected):'尚未选中'}</b></span></div>`,p.stage==='matching'?`${can('producer')&&p.producer?button('推送承制方','push',p.id,'primary'):''}`:'');
 if(!p.card)h+=issue('尚未上传选本一卡，请在剧本库的查看详情中补充后再推送。');
 if(p.stage==='matching'&&p.grade==='B'&&p.producer&&!p.offers.length&&p.card)h+=issue('暂无题材匹配的承制方，可由制片人工推送。');
 const a=note('推送记录','列表项',['承制方：仅显示当前项目推送过的供应商。','擅长题材：取供应商管理中维护的标签，无标签数量上限。','反馈状态：待反馈、选中、未选中、置灰锁定、超时或撤回。','剩余时间：S/A显示24小时倒计时；B级暂不设置时限。']);const b=note('推送操作','操作项',['撤回：仅承制方未选中且推送待反馈时可操作。','重复推送：同一家存在待反馈推送时不重复生成。','选中锁定：一家选中后，其他接收方不能再选，历史记录保留。']);
 h+=panel('推送记录 '+a,`<table><thead><tr><th>承制方</th><th>擅长题材</th><th>反馈状态</th><th>推送时间</th><th>撤回时间</th><th>剩余时间</th><th>操作 ${b}</th></tr></thead><tbody>${p.offers.map(o=>`<tr class="${o.status==='locked'?'locked':''}"><td>${M.nameOf(state,o.supplier)}</td><td>${state.suppliers.find(x=>x.id===o.supplier)?.tags.join(' / ')}</td><td>${badge(offerLabels[o.status],o.status==='pending'?'orange':o.status==='selected'?'green':'')}</td><td>${o.sent?E(new Date(o.sent).toLocaleString('zh-CN')):'—'}</td><td>${o.status==='withdrawn'&&o.withdrawnAt?E(new Date(o.withdrawnAt).toLocaleString('zh-CN')):'—'}</td><td>${o.expires&&o.status==='pending'?Math.max(0,Math.ceil((o.expires-M.now(state))/3600000))+'小时':o.expires?'—':'未设时限'}</td><td>${can('producer')&&o.status==='pending'?link('撤回','withdraw',p.id,`data-value="${o.supplier}"`):'—'}</td></tr>`).join('')}</tbody></table>${p.offers.length?'':empty('尚未推送承制方')}`);return h;}
function productionTab(p){return P().production(p);}
function releaseTab(p){const scriptOwner=M.isWriter(state,p)||M.canUploadInternalMaterials(state,p),makerOwner=M.isMaker(state,p);let h='';
 if(platform()||writer())h+=materialSection(p,'scriptMaterial',{editable:scriptOwner});
 if(platform()||!writer())h+=materialSection(p,'makerMaterial',{editable:makerOwner});
 h='<div class="project-material-sections">'+h+'</div>';
 if(platform())h+=panel('合同留档 '+note('已签合同留档','列表项与操作项',['合同类型：外部本包含剧本合同与制作合同；内部自有本只需要制作合同。','上传人：剧本商务上传剧本合同，承制商务上传制作合同。','上传结果：线下已签合同上传即留档，不存在审核、驳回或审核人。','排播条件：适用合同必须已上传，合同上传与物料核验可以并行。']),`${p.source==='internal'?issue('内部自有剧本仅需制作合同，无需提交剧本合同。'):''}<div class="two-col">${(p.source==='internal'?['production']:['script','production']).map(k=>`<div class="contract-slot"><h4>${k==='script'?'剧本合同':'制作合同'} ${p.contracts[k]?badge('已留档','green'):badge('待上传')}</h4>${A.isAdmin(state)||A.canFor(state,p,k==='script'?'business':'prodBusiness')?fileList(p.contracts[k]?[p.contracts[k]]:[]):'<p class="subtle">合同原件由对应商务查看</p>'}${can(k==='script'?'business':'prodBusiness')?button(p.contracts[k]?'替换留档文件':'上传已签合同','contract',p.id,'',`data-value="${k}"`):''}</div>`).join('')}</div>`);
 const gates=platform()?M.ready(p):M.ready(p).filter(x=>!x.label.includes('合同'));h+=panel('排播衔接 '+note('自动进入排播','列表项与操作项',['进入条件：当前版本制作终审和正片安审均通过、相关物料确认、适用合同全部留档。','自动流转：最后一项条件满足后自动移交排播，不另设手动移交或合同审核按钮。','排期 / 上线：衔接现有发行流程，排播时间与上线结果回显到项目状态。','渠道修改：承制方或制片提交修改，仅制片确认后交渠道运营重新送审。']),`<div class="gate-list">${gates.map(x=>`<div class="${x.ok?'ok':''}"><span>${x.ok?'✓':'○'}</span>${x.label}</div>`).join('')}</div>${['scheduling','online'].includes(p.stage)?`<div class="success-line">✓ 已自动进入排播 · ${p.schedule?'计划上线 '+E(p.schedule):'等待排播人员安排档期'}</div>`:''}`,'');
 return h;}
function detailPage(){const p=project();if(!p||!(platform()?N.baseRows(state):M.visible(state)).some(x=>x.id===p.id)){state.ui.id=null;return listPage();}context=p.name+' · 项目详情';
 if(writer())return writerPages().detail(p);if(!platform()&&!writer())return makerPages().detail(p);
 if(platform())return createDetails(state,{E,button,link,badge,audit:scriptAudit,stage,panel,fileList,scriptTab,matchTab,productionTab,filmTab,releaseTab,cardPanel,reviewAttachments,internalMaterials:libraryPreparation,scriptVersionHistory,channels:p=>X().channelPanel(p),data:p=>X().data(p),back:crossDetailReturn?link('‹ 返回'+N.title(crossDetailReturn.view)+(crossDetailReturn.id?'详情':''),'return-detail'):link('‹ 返回'+menuTitle(state.ui.view),'back')})(p);
 const loser=!writer()&&p.selected!==state.ui.supplier;
 let tabs=loser?[['match','一卡选本']]:[['script',writer()?'剧本与审核':'剧本资料'],...(platform()||!writer()?[['match',platform()?'承制方匹配':'一卡选本']]:[]),...(p.selected&&(platform()||!writer())?[['production','制作交付']]:[]),['release','发行准备'],...(['scheduling','online'].includes(p.stage)?[['channels','排播与渠道'],['data','渠道数据']]:[]),['history','流转记录']];if(!tabs.some(x=>x[0]===state.ui.tab))state.ui.tab=tabs[0][0];
 let h=`<div class="detail-back">${link('‹ 返回'+menuTitle(state.ui.view),'back')}</div><div class="detail-title"><div><span>${p.id}${state.ui.view==='content'&&M.projectName(p)!==p.name?' · 原剧本：'+E(p.name):''}</span><h1>${E(state.ui.view==='content'?M.projectName(p):p.name)} ${stage(p)}</h1></div>${p.grade?badge(p.grade+'级剧本','grade'):''}</div>${meta(p)}${timeline(p)}<div class="tabs">${tabs.map(([k,l])=>`<button data-tab="${k}" class="${state.ui.tab===k?'active':''}">${l}</button>`).join('')}</div>`;
 if(state.ui.tab==='script')h+=scriptTab(p);if(state.ui.tab==='match')h+=matchTab(p);if(state.ui.tab==='production')h+=productionTab(p);if(state.ui.tab==='release')h+=releaseTab(p);if(state.ui.tab==='channels')h+=X().channelPanel(p);if(state.ui.tab==='data')h+=X().data(p);if(state.ui.tab==='history')h+=panel('流转记录 '+note('项目历史','列表项',['时间：按操作时间倒序。','操作内容：保留提交、审核、推送、选中、交付与排播记录。','操作人：平台可查看岗位；供应商仅呈现与当前项目有关的流程事件。']),`<div class="history">${p.history.filter(x=>platform()||!x.text.includes('合同')).map(x=>`<div><span class="history-dot"></span><small>${E(x.at)}</small><strong>${E(x.text)}</strong><p>${platform()?E(x.actor):'项目进度更新'}</p></div>`).join('')}</div>`);return h;}
function suppliersPage(){
 context='系统设置 / 供应商管理';
 const keyword=state.ui.supplierKeyword||'',rows=state.suppliers.filter(x=>x.name.toLowerCase().includes(keyword.trim().toLowerCase()));
 const createNote=note('创建供应商','操作项',['创建供应商：沿用原创建入口和账号字段，同一弹窗维护业务身份、剧本商务、承制商务、擅长题材；创建后写入同一份供应商列表。']);
 const listNote=note('撮合业务新增字段','列表项',['合作业务 / 身份：撮合展示剧本方、承制方；代发行展示版权方。同一主体可同时合作两条业务。','擅长题材：承制方的题材标签，用于B级剧本匹配，标签数量不限。仅剧本方显示“—”。']);
 const opNote=note('编辑供应商','操作项',['编辑：在原编辑弹窗中维护业务身份、剧本商务、承制商务、擅长题材，与原有供应商资料一起保存。','商务配置：勾选剧本方时显示剧本商务单选；勾选承制方时显示承制商务单选；双身份分别配置。','保存：至少选择一条合作业务；按业务选择身份与对应商务。成功后刷新当前列表，失败时保留填写内容并提示原因。','取消：关闭弹窗，不保存当前修改。','生效范围：供应商商务配置保存在该供应商资料中；在制项目的商务及制片不自动改派。']);
 return heading('供应商管理','共用供应商档案，按合作业务维护身份与对接商务。')+
 panel('筛选条件',`<form id="supplier-filters" class="supplier-filters"><label>供应商名称<input name="supplierKeyword" aria-label="供应商名称筛选" placeholder="请输入供应商名称" value="${E(keyword)}"></label><button class="btn primary" type="submit">搜索</button>${button('重置','supplier-clear')}</form>`)+
 `<div class="supplier-toolbar">${button('＋ 创建供应商','supplier','','primary')} ${createNote}</div>`+
 panel('供应商列表 '+listNote,`<div class="supplier-table-wrap"><table class="supplier-table"><thead><tr><th>序号</th><th>供应商名称</th><th>登录账号</th><th>创建时间</th><th>账号状态</th><th class="new-col">合作业务 / 身份</th><th class="new-col">擅长题材</th><th class="supplier-actions">操作 ${opNote}</th></tr></thead><tbody>${rows.map((x,i)=>`<tr><td>${i+1}</td><td>${E(x.name)}</td><td>${E(x.account)}</td><td class="supplier-date">${E(x.createdAt)}</td><td><span class="account-status ${x.status==='frozen'?'frozen':''}">${x.status==='frozen'?'冻结':'正常'}</span></td><td>${x.businesses.map(b=>`<small>${A.lines[b]}</small>${b==='matching'?x.roles.map(r=>badge(r==='script'?'剧本方':'承制方')).join(' '):badge('版权方')}`).join('')}</td><td class="supplier-tags">${x.roles.includes('maker')&&x.tags.length?x.tags.map(t=>'<span>'+E(t)+'</span>').join(' / '):'—'}</td><td class="supplier-actions">${link('编辑','supplier',x.id)}${link('重置密码','supplier-password',x.id)}${button(x.status==='frozen'?'恢复':'冻结','supplier-status',x.id,'link '+(x.status==='frozen'?'restore':'danger'))}</td></tr>`).join('')}</tbody></table>${rows.length?'':'<div class="empty"><span>▤</span><strong>未找到符合条件的供应商</strong><small>调整供应商名称，或重置筛选条件</small></div>'}</div><div class="supplier-total">共 ${rows.length} 条供应商</div>`);
}
function existingPage(){
 context=menuTitle(state.ui.view);
 const copy={data:'短剧数据继续沿用现有数据页面与统计口径。',permissions:'用户权限分配继续沿用现有角色、人员与菜单权限配置。',personal:'个人中心继续沿用现有账号资料与个人设置。'}[state.ui.view];
 return heading(context,'沿用现有功能')+panel(context,`<div class="existing-page"><span class="existing-icon">${glyphs[menuInfo[state.ui.view][1]]}</span><h3>${copy}</h3><p>本次原型仅展示撮合业务新增功能，此入口保留原有位置。</p><p>正式系统中的页面内容及访问权限继续沿用。</p>${button('返回'+(platform()?'撮合管理':'剧本评估'),'return-business','','primary')}</div>`);
}
function flowPage(){context='业务流程总览';const lanes=[['剧本供应商','提交一卡与全集（均必填）','按审核意见修改剧本','补充剧本物料','查看项目进度'],['内容 / 安审 / 总编','全集内容审核 + 安全审核','内容与安审均通过 → 评级并选择制片','—','—'],['分配人 / 制片','—','S/A人工推送、B自动匹配','三项并行交付，分别审核','随时接收并核验制作物料'],['承制供应商','—','预览一卡 → 确认选中 → 撮合管理 / 同步全集','资产 / 一卡demo / 全集初稿，可分别或同时提交','提交物料 / 按安审意见修改'],['商务 / 安审 / 发行','对接剧本方','剧本物料可并行补充与确认','已签合同可并行上传留档','三项制作通过 → 正片安审；物料与合同齐备 → 排播']];return heading('撮合业务流程总览','从剧本供给到成片发行，以角色串联一部剧的完整协作。')+panel('角色协作 '+note('业务主线','流程说明',['阅读方式：横向表示业务阶段，各行表示角色职责；具体并行与放行条件以下列规则为准。','外部本：首次提交一卡与全集，均必传；提交后直接进入内容与安全审核。内部本直接提交全集。','剧本审核：内容和安审独立并行，全部通过后总编定稿评级。','撮合：定稿并备齐一卡后即可匹配，不等物料。S/A可同时推多家，B推所有标签匹配方；首个选中锁定，其余置灰。','制作：三项独立提交与审核；制片通过的全集即终版，三项都通过才进入安审。','发行准备：正片安审、制作物料核验并行；外部两类合同、内部仅制作合同，全部仅留档。','排播：制作终审、安审、物料确认、适用合同留档完成后自动流转；各端口运营自行准备上剧资料并分渠道送审。']),`<div class="flow-key"><span>① 剧本供给</span><span>② 审核与撮合</span><span>③ 制作协作</span><span>④ 发行衔接</span></div><div class="lanes">${lanes.map(l=>`<div class="lane"><strong>${l[0]}</strong>${l.slice(1).map((t,i)=>`<div><span>${E(t)}</span>${i<3&&t!=='—'&&l[i+2]!=='—'?'<i>→</i>':''}</div>`).join('')}</div>`).join('')}</div><div class="two-col flow-exceptions"><div><h4>修改闭环</h4><p>剧本安审退回 → 修改重提 → 剧本评估与安审重新审核</p><p>正片安审退回 → 修改正片 → 制片终审 → 正片安审</p><p>渠道退回 → 承制方或制片修改 → 制片确认 → 运营重送</p></div><div><h4>合作异常</h4><p>S/A 超过24小时未反馈 → 自动收回 → 人工再推</p><p>制片或陈真终止承制合作 → 立即回库待匹配</p><p>保留原合作档案 → 重新匹配其他承制方</p></div></div><div class="notice">排播设置档期 / 渠道 → 各端口运营准备上剧材料 → 独立送审 → 逐渠道上线 → 数据拉取。撮合数据保留在撮合管理内。</div>`,button('进入撮合管理','projects','','primary'));}
function tagChecks(selected=[],name='tags',limit=0){return `<div class="check-grid" ${limit?'data-limit="'+limit+'"':''}>${M.tags.map(t=>`<label><input type="checkbox" name="${name}" value="${t}" ${selected.includes(t)?'checked':''}>${t}</label>`).join('')}</div>`;}
function modalContent(){const d=dialog,p=state.projects.find(x=>x.id===d.id);let body='',title='',submit='确认',form=true,footer='',submitDisabled=false;context='';
 const extended=permissionModal(state,d,{E,field})||X().modal(d),historical=materialHistoryModal(state,p,d,workHelpers())||scriptHistoryModal(state,p,d,{E,button,badge,fileList});
 const reviews={quality:'剧本内容审核',safety:'剧本安全审核',production:'制作审核',film:'正片安全审核',confirmScript:'剧本物料核验',confirmMaker:'制作物料核验'};
 if(historical){({title,body}=historical);form=false;}
 else if(d.type==='dashboard-archive'){title='已终止的承制合作';form=false;body=dashboardArchiveBody(state,d.id,d.value,{E,fileList,badge})||'当前账号不可查看该记录';}
 else if(d.type==='demo-scenarios'){title='测试场景';form=false;body=scenarioPanel(state,d,{E,button,field});}
 else if(d.type==='recover-file'){title='恢复本地附件';body=`<p>请选择同名原件：<strong>${E(d.file.name)}</strong></p><p class="subtle">仅恢复本机预览，不提交新版本，不改变审核状态。</p>${fileInput('recovery','原始附件',false,true)}`;submit='恢复附件';}
 else if(d.type==='reply-workspace'){title='审核反馈 · '+p.name;body=scriptTab(p);form=false;}
 else if(d.type==='channel-feedback'){title='登记渠道反馈 · '+d.value;body=field('反馈结果','feedback','revision',{select:[['revision','退回修改'],['online','审核通过并已上线']],placeholder:false})+`<div data-channel-feedback="revision">${field('退回类型','returnType','content',{select:[['content','正片内容修改'],['material','端口资料补充']],placeholder:false})}${field('渠道退回意见','opinion','',{area:true})}</div><div data-channel-feedback="online" hidden>${field('实际上线时间','actual','',{type:'datetime-local'})}${field('上线链接','url','',{type:'url'})}</div>`;submit='保存渠道反馈';}
 else if(['channel-submit','channel-confirm'].includes(d.type)){const t=p.channelTasks.find(t=>t.channel===d.value);title=d.type==='channel-submit'?'提交渠道审核':'确认内容修改';body=`<div class="review-project"><strong>${E(M.projectName(p))}</strong><small>${E(d.value)}</small></div>${t.opinion?issue(E(t.opinion)):''}${t.files?.length?`<h3>${t.status==='resubmit'?'制片已确认的修改附件':'本次修改附件'}</h3>${fileList(t.files)}`:''}${d.type==='channel-confirm'?'':`<p>本次上剧材料：${t.material?`<a href="${E(t.material)}" target="_blank" rel="noopener">查看材料 ↗</a>`:'尚未准备'}</p>`}<p>${d.type==='channel-confirm'?'确认修改符合要求后，交由渠道运营重新送审。':'确认材料已备齐，记录本次送审。'}</p>`;submit=d.type==='channel-confirm'?'确认并交运营重送':'确认送审';}
 else if(extended){({title,body,submit}=extended);}

 else if(isMaterialReview(d.type)){({title,body,submit}=materialReviewSurface(state,p,d,workHelpers()));d.work=false;}
 else if(reviews[d.type]){({title,body,submit}=reviewSurface(state,p,d,workHelpers()));d.work=true;if(['quality','safety'].includes(d.type))body=`<div class="history-entry-actions">${button('审核记录','script-review-history',p.id,'',`data-value="${d.type}"`)}${button('剧本上传记录','script-upload-history',p.id)}</div>`+body;}
 else if(d.type==='new'){
 title=platform()?'新增内部剧本':'提交剧本';let f=F.screenplayFields.filter(x=>x.key!=='business');const nf=note('剧本基础信息','配置项',[...f.map(x=>x.label+'：'+(x.required?'必填。':'')+x.desc),'备选剧名：共5个，前3个必填，不得与剧本名称或其他备选名重复。','剧本商务：外部读取供应商配置；内部自动记录首次上传用户，后续修改不更换。']);
 body=`<h3>基础信息 ${nf}</h3><div class="form-grid">${f.map(x=>field(x.label,x.key,x.key==='deliveryDate'?'2026-11-02':'',{required:x.required,select:x.options,area:x.type==='textarea',type:x.type==='number'?'number':x.type==='date'?'date':'text',wide:x.type==='textarea',max:x.max})).join('')}${field('剧本商务','business',platform()?A.current(state)?.name:state.suppliers.find(x=>x.id===state.ui.supplier)?.scriptBusiness||'',{readonly:true,required:true,help:platform()?'自动关联当前上传用户':''})}${[1,2,3,4,5].map(i=>field('备选剧名'+i,'alt'+i,'',{required:i<4,max:50})).join('')}</div><h3>上传剧本 ${note('剧本文件','配置项',[platform()?'内部本：直接上传全集，一卡仅用于后续选本。':'一卡：首次提交必填，包含前10集正文及选本资料。',platform()?'全集：必填，提交后进入两项独立审核。':'全集：首次提交必填；与一卡一并上传，提交后直接进入两项独立审核。','格式：仅允许.doc或.docx，同时校验扩展名与Word内容标识。','成功：创建项目并进入对应审核阶段；取消不创建项目。'])}</h3><div class="form-grid">${fileInput('card','剧本一卡（承制方选本用）',true,!platform())}${fileInput('full','剧本全集（审核用）',true,true)}</div>${issue(platform()?'全集提交后直接进入内容与安全审核；一卡可先上传，也可在推送承制方前补充。':'一卡和全集均必传。仅全集参与内容与安全审核，一卡留待承制方选本预览。')}`;submit='提交审核';
 }
 else if(d.type==='internal-revise'){
 title='编辑内部剧本';
 body=issue('提交修改版后，内容审核与剧本安审均重新开启。原文件及审核意见保留在历史记录中。')+`<h3>退回意见</h3><div class="two-col">${[['内容审核',p.quality],['剧本安审',p.safety]].map(([label,x])=>`<div><strong>${label} ${scriptAudit(x.status)}</strong><p>${E(x.opinion||'暂无意见')}</p>${reviewAttachments(x)}</div>`).join('')}</div><h3>基础信息</h3><div class="form-grid">${F.screenplayFields.filter(f=>f.key!=='business').map(f=>field(f.label,f.key,p[f.key]||'',{required:f.required,select:f.options,area:f.type==='textarea',type:f.type==='number'?'number':f.type==='date'?'date':'text',wide:f.type==='textarea',max:f.max})).join('')}${[1,2,3,4,5].map(i=>field('备选剧名'+i,'alt'+i,p.alternates[i-1]||'',{required:i<4,max:50})).join('')}</div><h3>当前全集 · V${p.full?.version||1}</h3><p class="subtle">${E(p.full?.name||'暂无文件')}</p>${fileInput('files','修改后的剧本全集',true,true)}`;
 submit='提交修改并重新审核';
 }
 else if(d.type==='batch-match'){
 const ids=state.ui.batchIds||[],items=state.projects.filter(x=>ids.includes(x.id)&&canBatchMatch(state,x));
 title='批量匹配承制方';body=`<p>已选择 <strong>${items.length}</strong> 个剧本</p><div class="batch-script-list">${items.map(x=>`<div>${E(x.name)}<small>${E(x.id)}</small></div>`).join('')}</div>${field('承制方','supplier','',{required:true,select:state.suppliers.filter(x=>x.businesses.includes('matching')&&x.roles.includes('maker')&&x.status==='active').map(x=>[x.id,x.name])})}<p class="subtle">一次选择一家承制方。已有待反馈推送将保留，不会重复推送。</p>`;submit='确认匹配';submitDisabled=!items.length;
 }
 else if(d.type==='deliver'){
 const indices=d.value===''?[0,1,2].filter(i=>M.canSubmitProduction(state,p,i)):[Number(d.value)].filter(i=>M.canSubmitProduction(state,p,i));
 title=indices.some(i=>['revision','resubmit'].includes(p.production[i].status))?'修改制作交付':d.value===''?'提交制作资料':'提交'+M.productionNames[Number(d.value)];
 body=`<div class="review-project"><strong>${E(M.projectName(p))}</strong><small>${E(p.id)}</small></div><p class="subtle">可分别提交，也可同时提交；每项独立审核。至少选择一项文件。</p><div class="delivery-upload-grid">${indices.map(i=>`${p.production[i].opinion?`<section class="delivery-revision"><h3>${E(M.productionNames[i])} · 本轮审核意见</h3><p>${E(p.production[i].opinion)}</p><small>${p.production[i].version?'交付 V'+p.production[i].version+' · ':''}${E(p.production[i].reviewedAt||'审核时间未记录')}</small></section>`:''}${fileInput('delivery'+i,M.productionNames[i],false,d.value!=='')}`).join('')}</div>`;submit='提交审核';submitDisabled=!indices.length;
 }
 else if(['full','card','filmResubmit','channelFix','contract'].includes(d.type)){
 const word=['full','card'].includes(d.type);title=({full:'上传修改版全集',card:p?.card?'更新选本一卡':'上传选本一卡',deliver:'提交制作交付',filmResubmit:'提交修改正片重走终审',channelFix:'提交渠道修改',contract:'上传已签合同'})[d.type];
 body=`<h3>上传资料 ${note('文件与提交','配置项',[`文件：${word?'只支持.doc、.docx，校验文件格式与内容。':d.type==='contract'?'选择线下已签署的合同。':'选择当前阶段交付文件，保留提交记录。'}`,'所属项目：'+p.name,...(d.type==='full'?['重提规则：剧本安审退回后，修改版重新开启剧本评估与安审，仍可并行，且均须通过。']:d.type==='filmResubmit'?['重提规则：先重新进入项目制片的制作终审；终审通过后，再开放正片安审。']:d.type==='contract'?['合同类型：'+(d.value==='script'?'剧本合同':'制作合同'),'上传即留档：不审核；适用条件齐全后系统自动进入排播。']:[]),'提交：文件校验成功后更新当前资料与状态；取消不提交。'])}</h3>${d.type==='card'?issue('一卡仅用于承制方选本，不发起审核、不改变全集的审核结果。'):''}${issue(E(p.name)+(d.type==='contract'?' · '+(d.value==='script'?'剧本合同':'制作合同'):''))}${fileInput('files',word?'Word剧本':d.type==='contract'?'已签合同文件':'交付文件',word,true)}`;submit=d.type==='contract'?'上传留档':'提交文件';if(d.type==='full')body=`<h3>本轮修改意见</h3><div class="two-col">${[['内容审核',p.quality],['安全审核',p.safety]].map(([l,x])=>`<div><h4>${l}</h4><p>${E(x.opinion||'暂无意见')}</p>${reviewAttachments(x)}</div>`).join('')}</div>`+body;if(d.type==='filmResubmit')body=issue(E(p.film.opinion||'按安审要求修改后，先提交制片重新验收。'))+body;
 }
 else if(d.type==='rename-project'){title='修改项目名称';body=`<div class="review-project"><strong>${E(M.projectName(p))}</strong><small>${E(p.id)} · 原剧本：${E(p.name)}</small></div>${field('项目名称','projectName',M.projectName(p),{required:true,max:50,help:'仅修改撮合项目名称，原剧本名称与关联资料保持不变。'})}`;submit='保存名称';}
 else if(d.type==='grade'){title='剧本评级';body=`<div class="review-project"><strong>${E(p.name)}</strong><small>${E(p.id)}</small></div><h3>评级配置 ${note('剧本评级','配置项',['评级：S/A人工定向推送；B级按题材匹配所有命中承制方。','题材标签：至少1个、最多3个；选中第4个时拦截。','确认：同时保存评级、题材和项目制片；B级自动推送所有题材匹配承制方，S/A级人工推送。'])}</h3>${field('剧本评级','grade',p.grade||'A',{required:true,select:['S','A','B'],placeholder:false})}<label class="field"><span><i>*</i> 题材标签（最多3个）</span></label>${tagChecks(p.tags,'tags',3)}${field('项目制片','producer',p.producer||'',{required:true,select:A.options(state,'matching','producer').map(([,name])=>name)})}${issue(p.selected?'确认后更新评级、题材和项目制片，保留已选中的承制方及现有项目进度。':'确认后同时保存评级、题材和项目制片。S/A级人工推送；B级自动推送所有题材匹配的承制方。')}`;submit='确认';}
 else if(d.type==='push'){title='匹配承制方';body=`<div class="review-project"><strong>${E(p.name)}</strong><small>${E(p.id)}</small></div><h3>选择接收方 ${note('多家推送','配置项',['承制方：仅展示具有承制方身份的供应商，允许多选。','待反馈：已存在待反馈推送的承制方不可重复勾选。','反馈期限：S/A为24小时；超时收回后由人工再选，B级期限待配置。','确认：各承制方收到同一份一卡，仅选中方获得全集；一家选中后，其余置灰禁选。'])}</h3><div class="supplier-options">${state.suppliers.filter(x=>x.businesses.includes('matching')&&x.status==='active'&&x.roles.includes('maker')).map(x=>{const disabled=M.latestOffer(p,x.id)?.status==='pending';return `<label><input type="checkbox" name="suppliers" value="${x.id}" ${disabled?'disabled':''}><div><strong>${x.name}</strong><small>${E(x.tags.join(' / ')||'未配置题材')}</small></div>${disabled?badge('已在待反馈'):''}</label>`;}).join('')}</div>`;submit='确认推送';body+=`<h3 class="match-record-title">推送记录</h3><div class="match-record-list">${p.offers.slice().reverse().map(o=>`<article><strong>${E(M.nameOf(state,o.supplier))}</strong>${badge(offerLabels[o.status])}<small>推送：${E(new Date(o.sent).toLocaleString('zh-CN'))}${o.withdrawnAt?' · 撤回：'+E(new Date(o.withdrawnAt).toLocaleString('zh-CN')):''}</small>${o.status==='pending'?link('撤回','withdraw',p.id,`data-value="${E(o.supplier)}"`):''}</article>`).join('')||'<p class="subtle">尚无推送记录</p>'}</div>`;}
 else if(d.type==='select'){title='确认选中剧本';body=`<div class="review-project"><strong>${E(p.name)}</strong><small>${E(p.id)} · ${E(p.episodes)}集</small></div><p>确认选中后，剧本将分配给你，并同步全集进入制作。其他承制方将不可再选择。</p>`;submit='确认选中并进入制作';}
 else if(d.type==='decline'){title='确认未选中';body=`<p>确定不要《${E(p.name)}》这个剧本吗？</p><p class="subtle">确认后，本次推送将标记为未选中。</p>`;submit='确认未选中';}
 else if(d.type==='channelReturn'){title='渠道退回修改';body=field('修改意见','opinion','',{area:true,required:true});submit='提交反馈';}
 else if(['scriptMaterial','makerMaterial'].includes(d.type)){
 const internal=d.type==='scriptMaterial'&&p.source==='internal',edit=M.materialForEdit(p[d.type]);
 title=internal?'上传内部剧本物料':d.type==='scriptMaterial'?'填写剧本物料':'填写制作物料';
 body=materialForm(state,p,d.type,edit,{E,fileInput,fileList,button});
 if(p[d.type].draft)body=issue('已恢复未提交的草稿；正式提交后进入重新核验。')+body;
 footer='<button type="submit" class="btn" name="intent" value="draft" formnovalidate>保存草稿</button>';submit='提交整份物料';
 }
 else if(d.type==='terminate'){title='终止承制合作';body=`<div class="review-project"><strong>${E(M.projectName(p))}</strong><small>当前承制方：${E(M.nameOf(state,p.selected))}</small></div>${issue('确认后立即终止当前承制合作，剧本回到剧本库「待匹配承制方」。当前制作资料及审核记录保留，可重新匹配其他承制方。')}${field('终止原因','opinion','',{area:true,required:true})}<input type="hidden" name="mode" value="rematch">`;submit='确认终止并回库';}
 else if(d.type==='schedule'){title='设置排期';body=`<h3>上线计划 ${note('排期','配置项',['前置条件：系统已自动移交排播。','计划上线时间：由排播角色设置；记录后等待渠道发行结果。','状态同步：沿用现有发行系统，本地原型用操作演示结果同步。'])}</h3>${field('计划上线时间','date',p.schedule||'2026-11-10T10:00',{type:'datetime-local',required:true})}`;submit='保存排期';}
 else if(d.type==='supplier'){
 const x=state.suppliers.find(x=>x.id===d.id)||{name:'',account:'',roles:[],tags:[],scriptBusiness:'',productionBusiness:'',businesses:['matching'],distributionBusiness:''},script=x.roles.includes('script'),maker=x.roles.includes('maker');title=d.id?'编辑供应商':'创建供应商';
 body=`<h3>基础信息</h3><div class="form-grid">${field('供应商名称','supplierName',x.name,{required:true,max:20})}${field('登录账号','account',x.account,{required:true,max:20,readonly:!!d.id})}${!d.id?field('初始密码','initialPassword','',{required:true,type:'password'}):''}</div>
 <h3>合作业务 ${note('合作业务范围','配置项',['合作业务：撮合和代发行可分别勾选，同一主体复用供应商账号。','撮合业务：选择剧本方 / 承制方身份，并按身份分别单选对应商务；不配置制片。','代发行业务：身份为版权方，单独配置代发行商务，不要求撮合身份或题材。','项目关系：新提交或新选中带入供应商对应商务；已有项目不自动改派。'])}</h3><div class="check-grid supplier-lines">${Object.entries(A.lines).map(([k,l])=>`<label><input name="businesses" type="checkbox" value="${k}" ${x.businesses.includes(k)?'checked':''}>${l}</label>`).join('')}</div><fieldset class="business-fields" data-supplier-line="matching" ${x.businesses.includes('matching')?'':'hidden disabled'}><h3>撮合业务信息 ${note('撮合业务新增字段','配置项',['撮合身份：启用撮合业务时必选，剧本方、承制方可多选；至少保留一种身份。','剧本商务：勾选剧本方时展示，必填、下拉单选；选项为具有剧本商务角色的人员。','承制商务：勾选承制方时展示，必填、下拉单选；选项为具有承制商务角色的人员。','双身份：两个商务同时展示、分别保存；取消某身份勾选时隐藏对应商务，保存时清除该身份的商务配置。','擅长题材：勾选承制方时展示，支持多选、不限制数量，用于B级剧本匹配。','保存：与基础信息统一保存；校验不通过时保留填写内容，成功后返回供应商列表并提示成功；重新编辑回显已保存值。','取消：关闭弹窗，不保存修改。'])}</h3>
 <label class="field"><span><i>*</i> 业务身份</span></label><div class="check-grid supplier-roles">${[['script','剧本方'],['maker','承制方']].map(([v,l])=>`<label><input type="checkbox" name="roles" value="${v}" ${x.roles.includes(v)?'checked':''}>${l}</label>`).join('')}</div>
 <div class="form-grid supplier-business-fields"><fieldset class="supplier-role-fields" data-supplier-role="script" ${script?'':'hidden disabled'}>${field('剧本商务','scriptBusiness',x.scriptBusiness,{required:true,select:A.options(state,'matching','business').map(([,name])=>name)})}</fieldset><fieldset class="supplier-role-fields" data-supplier-role="maker" ${maker?'':'hidden disabled'}>${field('承制商务','productionBusiness',x.productionBusiness,{required:true,select:A.options(state,'matching','prodBusiness').map(([,name])=>name)})}</fieldset></div>
 <fieldset class="maker-fields supplier-role-fields" data-supplier-role="maker" ${maker?'':'hidden disabled'}><label class="field"><span>擅长题材</span><small>用于B级剧本匹配，可选择多个题材</small></label>${tagChecks(x.tags)}</fieldset></fieldset><fieldset class="business-fields" data-supplier-line="distribution" ${x.businesses.includes('distribution')?'':'hidden disabled'}><h3>代发行业务信息</h3><p class="subtle">业务身份：版权方</p>${field('代发行商务','distributionBusiness',x.distributionBusiness||'',{required:true,select:A.options(state,'distribution','business').map(([,name])=>name)})}</fieldset>`;submit=d.id?'保存':'创建供应商';
 }
 else if(['supplier-password','supplier-status'].includes(d.type)){
 const x=state.suppliers.find(x=>x.id===d.id),reset=d.type==='supplier-password',frozen=x.status==='frozen';title=reset?'重置密码':frozen?'恢复供应商账号':'冻结供应商账号';
 body=`<p>供应商：<strong>${E(x.name)}</strong></p><p>登录账号：${E(x.account)}</p><p>${reset?'确认演示该账号的密码重置？':frozen?'确认恢复此账号为正常状态？':'确认将此账号设为冻结状态？'}</p><p class="muted">本地原型仅演示操作结果，不连接正式账号系统。</p>`;submit=reset?'确认重置':frozen?'确认恢复':'确认冻结';
 }

 else if(d.type==='reset'){title='重置示例数据';body='<p>将本版原型恢复为初始示例。当前版本的测试操作与本机新建记录将清空，恢复全部初始测试场景。</p>';submit='重置本版示例';note('重置说明','评审工具',['重置：仅恢复当前新版原型的本地示例，取消则保留当前状态。']);}
 else if(d.type==='file'){
 const f=d.file||{name:d.id},blob=uploads.get(f.previewId||f.name),word=/\.docx?$/i.test(f.name);form=false;title=word?(f.reviewAttachment?'审核附件预览':'剧本在线预览'):'文件查看';
 if(word){
 body=readerBody(d,note('剧本在线阅读','操作项',['文件信息：展示所点击附件的名称和版本，预览不改变审核或合作状态。','阅读目录：识别正文中的标题或集数，点击定位到相应内容；不限制全集的阅读集数。','正文查找：输入关键词，定位上一处或下一处匹配；无结果时显示未找到。','字号：支持缩小或放大阅读文字，原Word内容不变。','下载原Word：可获取当前附件原件；关闭预览后返回原页面。','预览异常：展示原因并允许重试或下载；无权查看该附件的用户不能通过预览扩大访问范围。']));
 }else{
 const url=blob?.url||demoFileUrl(f);
 const media=url&&/\.(pdf|png|jpe?g|gif|webp|svg)$/i.test(f.name)?(/\.pdf$/i.test(f.name)?`<iframe class="attachment-frame" src="${url}" title="${E(f.name)}"></iframe>`:`<img class="attachment-image" src="${url}" alt="${E(f.name)}">`):url&&/\.(mp4|webm|mov)$/i.test(f.name)?`<video class="attachment-video" src="${url}" controls></video>`:url&&/\.(mp3|wav|ogg|m4a)$/i.test(f.name)?`<audio class="attachment-audio" src="${url}" controls></audio>`:url&&/\.(srt|vtt|txt)$/i.test(f.name)?`<pre class="attachment-text-preview">${E(d.textPreview||'正在读取文本…')}</pre>`:'';
 const actions=url?`${isSpreadsheet(f)?'':`<a class="btn" href="${url}" target="_blank" rel="noopener">打开文件</a>`}<a class="btn primary" href="${url}" download="${E(f.name)}">${f.demo?'下载合成示例':'下载文件'}</a>`:f.demo?'':button('恢复本地附件','recover-file',f.previewId);
 body=`<div class="file-preview"><div class="attachment-toolbar"><div><h3>${E(f.name)}</h3>${f.demo?'<p class="subtle">合成测试附件 · 仅供预览、下载与上传体验</p>':''}</div><div class="actions">${actions}</div></div>${media}${!url&&f.demo?'<p class="muted">此格式为演示占位，可上传本机文件测试。</p>':''}</div>`;
 if(isSpreadsheet(f))body+=spreadsheetPreview(d,{E,button});
 }
 }

 if(d.type!=='quality'&&d.work&&reviewNames[d.type]&&projectTasks(state,p).some(t=>reviewNames[t.action]&&!(t.action===d.type&&String(t.value??'')===String(d.value??''))))footer='<button type="submit" class="btn" name="intent" value="continue">提交并处理下一项</button>';if(d.work&&!reviewNames[d.type])body=taskNavigation(state,p,d,workHelpers())+body;context=title+'弹窗';return `<div class="modal-backdrop ${d.type.startsWith('permission-')?'permission-modal-backdrop':''}"><section class="modal ${d.work?'work-modal':''} ${['scriptMaterial','makerMaterial','confirmScript','confirmMaker','material-version'].includes(d.type)?'material-modal':''} ${isMaterialReview(d.type)?'material-review-modal':''} ${d.type==='push'?'match-modal':''} ${d.type==='demo-scenarios'?'scenario-modal':''} ${d.type==='file'&&/\.docx?$/i.test(d.file?.name||'')?'reader-modal':''}" role="dialog" aria-modal="true" aria-label="${title}"><header><h2>${title}</h2>${button('×','close','','close','aria-label="关闭弹窗"')}</header>${form?`<form id="modal-form" ${['scriptMaterial','makerMaterial'].includes(d.type)?'novalidate':''}><div class="modal-body">${body}<div class="form-error" role="alert"></div></div><footer>${['scriptMaterial','makerMaterial'].includes(d.type)?'<span class="material-submit-scope">本次提交包含全部分区的资料与附件</span>':''}${button('取消','close')}${footer}<button type="submit" class="btn primary" ${submitDisabled?'disabled':''}>${submit}</button></footer></form>`:`<div class="modal-body">${body}</div><footer>${d.makerProjectId&&M.latestOffer(state.projects.find(p=>p.id===d.makerProjectId),state.ui.supplier)?.status==='pending'?button('未选中','decline',d.makerProjectId)+button('确认选中','select',d.makerProjectId,'primary'):''}${button('关闭','close')}</footer>`}</section></div>`;
}
function render(){disposeMaterialNavigation?.();disposeMaterialNavigation=null;fileRefs.clear();M.expire(state);normalizeSupplierContext(state);N.normalize(state);let page;if(state.ui.view==='no-access'){context='暂无业务权限';page=heading(context,'当前账号尚未授权业务，请由管理员在用户权限分配中配置。')+empty('当前没有可访问的业务');}else if(state.ui.view==='dashboard'){context='撮合状态看板';page=dashboardPage(state,{E,heading,button,badge});}else if(state.ui.view==='permissions'){context='用户权限分配';page=permissionsPage(state,{E,heading,button,link});}else if(state.ui.view==='suppliers'){page=suppliersPage();}else if(state.ui.business==='distribution'){context=state.ui.view==='flow'?'代发行流程总览':N.title(state.ui.view);page=state.ui.view==='flow'?X().flow():X().distPage();}else{page=state.ui.id?detailPage():state.ui.view==='flow'?flowPage():N.existing.includes(state.ui.view)?existingPage():listPage();}let modal='';if(dialog){modal=modalContent();}const mergeNotes=overviewNotes(state,dialog);root.innerHTML=top()+`<div class="canvas ${state.ui.view==='permissions'?'permission-canvas':''} ${mergeNotes?'overview-canvas':''}"><div class="product"><div class="app-layout">${sidebar()}<main ${dialog?'inert':''}><header class="app-header ${platform()?'':'supplier-app-header'}">${platform()?`<span>版权服务中心 <i>/</i> ${N.settings.includes(state.ui.view)?'共用系统设置':A.lines[state.ui.business]}</span>`:supplierBusinessNavigation(state)}<span><i class="status-dot"></i> ${E(person())}</span></header><div class="page">${page}</div></main></div>${modal}</div>${state.ui.view==='permissions'?permissionNotes(state,dialog):mergeNotes}</div>`;document.querySelectorAll('[data-batch-partial="true"]').forEach(x=>x.indeterminate=true);M.save(state);if(dialog){restoreModalDraft();disposeMaterialNavigation=bindMaterialNavigation(document.querySelector('.modal'));document.querySelector('.modal .close')?.focus({preventScroll:true});if(dialog.workFiles){const active=dialog;updateWorkPreview(active,uploads,E,()=>dialog===active);}}}
function toast(t,error=false){const el=document.querySelector('#toast');el.textContent=t;el.className='visible '+(error?'error':'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.className='',4000);}
function commit(fn,msg='已保存'){const backup=structuredClone(state),position=dialog?.returnScroll;try{fn();M.save(state);dialog=null;render();if(position)window.scrollTo(position.x,position.y);toast(typeof msg==='function'?msg():msg);}catch(e){state=backup;const err=document.querySelector('.form-error');if(err){err.textContent=e.message;err.scrollIntoView({block:'nearest'});}else toast(e.message,true);}}
function open(type,id='',value=''){
 if(type==='file'&&!fileRefs.has(id)){toast('当前账号不可查看该文件',true);return;}
 captureModalDraft();const previousDialog=dialog&&(['file','recover-file','script-review-history','script-upload-history','material-review-history','material-version','terminate'].includes(type)||['select','decline'].includes(type)&&dialog.type==='file')?dialog:null;const previousReaderScroll=previousDialog?document.querySelector('.reader-scroll')?.scrollTop||0:0;
 const recoveryFile=type==='recover-file'?dialog?.file:null;dialog={file:recoveryFile,type,id,value,work:!!reviewNames[type],previousDialog,previousReaderScroll,returnScroll:{x:scrollX,y:scrollY}};if(type==='file'){dialog.file=fileRefs.get(id)||{name:id};dialog.reader={status:'loading',font:16,query:'',match:0};}
 if(type==='file'&&isSpreadsheet(dialog.file))dialog.spreadsheet={status:'loading'};
 render();window.scrollTo({left:0,top:0,behavior:'instant'});
 if(type==='file'&&isSpreadsheet(dialog.file))loadSheet(dialog);
 if(type==='file'&&/\.(srt|vtt|txt)$/i.test(dialog.file.name))loadTextFile(dialog);
 if(type==='file'&&/\.docx?$/i.test(dialog.file.name)){window.scrollTo({left:0,top:0,behavior:'instant'});loadReading(dialog);}
}
async function loadTextFile(target){
 try{const f=target.file,local=uploads.get(f.previewId||f.name)?.file,url=demoFileUrl(f);if(!local&&!url)throw new Error('附件暂不可用，可恢复本地原件后查看。');if(local?.size>2*1024*1024)throw new Error('文本较大，请下载原件查看。');const text=local?await local.text():await fetch(url).then(r=>{if(!r.ok)throw new Error('读取失败，请下载原件查看。');return r.text();});target.textPreview=text.length>100000?text.slice(0,100000)+'\n\n仅预览前100000字，请下载原件查看完整内容。':text||'文件内容为空';}catch(err){target.textPreview=err.message;}if(dialog===target)render();
}
async function loadSheet(target){
 target.spreadsheet={status:'loading'};
 try{const result=await loadSpreadsheet(target.file,uploads);if(dialog!==target)return;target.spreadsheet=result;render();}
 catch(error){if(dialog!==target)return;target.spreadsheet={status:'error',error:error.message};render();}
}
async function loadReading(target){
 target.reader.status='loading';
 try{
 const f=target.file,blob=uploads.get(f.previewId||f.name);let doc,source;
 if(blob){doc=await (f.reviewAttachment?readReviewWord:readWord)(blob.file);source='文本预览 · 版式以原Word为准';}
 else if(f.demo){doc=await readDemoWord(f,f.reviewAttachment?readReviewWord:readWord);source='合成测试附件 · 仅供业务流程体验';}
 else throw new Error('当前会话的文件已失效，请重新选择该附件后预览。正式系统从文件存储读取原件。');
 if(dialog!==target)return;Object.assign(target.reader,{...doc,source,status:'ready'});render();
 }catch(error){if(dialog!==target)return;Object.assign(target.reader,{status:'error',error:error.message});render();}
}
function markedReading(text,query,counter){
 if(!query)return E(text);let start=0,out='',at;const lower=text.toLocaleLowerCase(),q=query.toLocaleLowerCase();
 while((at=lower.indexOf(q,start))!==-1){out+=E(text.slice(start,at))+`<mark data-reader-match="${counter.n++}">${E(text.slice(at,at+query.length))}</mark>`;start=at+query.length;}
 return out+E(text.slice(start));
}
function readerBody(d,mark){
 const f=d.file,r=d.reader,blob=uploads.get(f.previewId||f.name),url=blob?.url||demoFileUrl(f),counter={n:0};
 const paragraphs=(r.paragraphs||[]).map(p=>`<${p.heading?'h3':'p'} id="reader-paragraph-${p.index}">${markedReading(p.text,r.query,counter)}</${p.heading?'h3':'p'}>`).join('');r.matches=counter.n;
 const annotations=`${r.annotationWarning?issue(E(r.annotationWarning)):''}${r.comments?.length?`<section class="word-annotations"><h3>审阅批注（${r.comments.length}）</h3>${r.comments.map((c,i)=>`<article><h4>批注 ${i+1} · ${E(c.author||'审核人')}</h4>${c.context?`<blockquote>${E(c.context)}</blockquote>`:''}<p>${E(c.text)}</p></article>`).join('')}</section>`:''}${r.revisions?.length?`<section class="word-annotations"><h3>修订记录（${r.revisions.length}）</h3>${r.revisions.map(c=>`<p><b>${c.kind}</b> · ${E(c.author)}：${E(c.text)}</p>`).join('')}</section>`:''}`;
 const fileInfo=`<div class="reader-file"><span class="word-icon">W</span><div><strong>${E(f.name)}</strong><small>${f.version?'V'+f.version+' · ':''}只读预览</small></div>${mark}${url?`<a class="btn" href="${url}" download="${E(f.name)}">${f.demo?'下载合成示例':'下载原Word'}</a>`:!f.demo?button('恢复本地附件','recover-file',f.previewId):''}</div>`;
 if(r.status!=='ready')return fileInfo+`<div class="reader-state" role="status"><span>${r.status==='loading'?'◷':'▤'}</span><h3>${r.status==='loading'?'正在生成预览…':'暂时无法预览'}</h3><p>${r.status==='error'?E(r.error):'文件就绪后将直接展示正文'}</p>${r.status==='error'?button('重试预览','reader-retry'):''}</div>`;
 return fileInfo+`<div class="reader-toolbar"><form id="reader-search"><input aria-label="在剧本中查找" name="query" maxlength="80" placeholder="查找剧本内容" value="${E(r.query)}"><button class="btn" type="submit">查找</button></form><span class="reader-count">${r.query?(counter.n?`${Math.min(r.match+1,counter.n)} / ${counter.n}处`:'未找到匹配内容'):'全文可读'}</span>${button('↑','reader-match','','','aria-label="上一处匹配" data-step="-1" '+(!counter.n?'disabled':''))}${button('↓','reader-match','','','aria-label="下一处匹配" data-step="1" '+(!counter.n?'disabled':''))}<div class="reader-font">${button('A−','reader-font','','','aria-label="缩小字号" data-step="-2" '+(r.font<=14?'disabled':''))}<span>${r.font}px</span>${button('A＋','reader-font','','','aria-label="放大字号" data-step="2" '+(r.font>=22?'disabled':''))}</div></div><div class="reader-mode">${E(r.source)}${f.reviewAttachment?' · 审阅批注 '+(r.comments?.length||0)+' 条 / 修订 '+(r.revisions?.length||0)+' 处':''}</div><div class="reader-workspace"><nav class="reader-toc" aria-label="剧本阅读目录"><h4>目录</h4>${r.chapters.map(x=>button(E(x.text),'reader-chapter',String(x.index),x.depth?'toc-child':'',`aria-label="${E(x.label||x.text)}"`)).join('')}</nav><div class="reader-scroll"><article class="reader-paper" style="--reader-font:${r.font}px">${paragraphs}${annotations}</article><div class="reader-end">已到文末 · ${r.characters.toLocaleString()}字</div></div></div>`;
}
function closeDialog(){const position=dialog?.returnScroll,previous=dialog?.previousDialog,readerScroll=dialog?.previousReaderScroll;dialog=previous||null;render();if(previous){if(previous.formScroll)modalScrollArea().scrollTop=previous.formScroll;const area=document.querySelector('.reader-scroll');if(area)area.scrollTop=readerScroll;}else if(position)window.scrollTo(position.x,position.y);}
function refreshReading(){const top=document.querySelector('.reader-scroll')?.scrollTop||0;render();const area=document.querySelector('.reader-scroll');if(area)area.scrollTop=top;}
function scrollReading(target,center=true){const area=document.querySelector('.reader-scroll');if(!target||!area)return;area.scrollTo({top:area.scrollTop+target.getBoundingClientRect().top-area.getBoundingClientRect().top-(center?area.clientHeight/2:20),behavior:'instant'});window.scrollTo({top:0,behavior:'instant'});}
function locateReadingMatch(){const r=dialog.reader;document.querySelectorAll('[data-reader-match]').forEach(x=>x.classList.toggle('current-match',+x.dataset.readerMatch===r.match));scrollReading(document.querySelector(`[data-reader-match="${r.match}"]`));}

function switchPage(v){crossDetailReturn=null;clearOverviewCross(state);state.ui.overviewMetric='all';state.ui.batchIds=[];state.ui.taskOnly=false;state.ui.view=v;state.ui.id=null;state.ui.keyword='';state.ui.stage='';state.ui.source='';state.ui.listTab='';state.ui.page=1;dialog=null;render();window.scrollTo(0,0);}
root.addEventListener('input',e=>{if(['scriptMaterial','makerMaterial'].includes(dialog?.type)&&e.target.form?.id==='modal-form')syncMaterialForm(e.target.form,dialog.type);});
root.addEventListener('click',e=>{
 const om=e.target.closest('[data-overview-note]');if(om){e.preventDefault();e.stopPropagation();document.querySelectorAll('.overview-note-section.highlight').forEach(el=>el.classList.remove('highlight'));const target=document.getElementById('overview-note-'+om.dataset.overviewNote);if(target){target.classList.add('highlight');target.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});}return;}
 const jump=e.target.closest('[data-material-jump]');if(jump){jumpMaterialSection(jump.dataset.materialJump);return;}
 const annotation=e.target.closest('[data-permission-note]');if(annotation){e.preventDefault();e.stopPropagation();const target=document.getElementById('permission-note-'+annotation.dataset.permissionNote);document.querySelectorAll('.permission-note-section.highlight').forEach(el=>el.classList.remove('highlight'));if(target){target.classList.add('highlight');target.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});}return;}
 const business=e.target.closest('[data-business]');if(business){if(dialog)return;if(!platform()){if(switchSupplierContext(state,{business:business.dataset.business})){crossDetailReturn=null;render();window.scrollTo(0,0);}}else if(state.ui.business!==business.dataset.business){state.ui.business=business.dataset.business;switchPage(A.menus(state)[0]||'no-access');}return;}
 const system=e.target.closest('[data-system]');if(system){if(dialog||state.ui.system===system.dataset.system)return;rememberSupplierContext(state);state.ui.system=system.dataset.system;if(platform())switchPage('projects');else{enterSupplierContext(state);crossDetailReturn=null;render();window.scrollTo(0,0);}return;}
 const identity=e.target.closest('[data-identity]');if(identity){if(dialog)return;if(switchSupplierContext(state,{identity:identity.dataset.identity})){crossDetailReturn=null;render();window.scrollTo(0,0);}return;}
 const view=e.target.closest('[data-view]');if(view){switchPage(view.dataset.view);return;}
 const tab=e.target.closest('[data-tab]');if(tab){state.ui.tab=tab.dataset.tab;render();return;}
 const listTab=e.target.closest('[data-list-tab]');if(listTab){clearOverviewCross(state);state.ui.batchIds=[];state.ui.listTab=listTab.dataset.listTab;state.ui.taskOnly=false;state.ui.stage='';state.ui.page=1;render();return;}
 const filt=e.target.closest('[data-filter-stage]');if(filt){state.ui.stage=filt.dataset.filterStage;state.ui.page=1;render();return;}
 const a=e.target.closest('[data-action]');if(!a||a.disabled)return;const action=a.dataset.action,id=a.dataset.id,value=a.dataset.value,p=(state.ui.business==='distribution'?state.distribution:state.projects).find(x=>x.id===id);
 if(action==='overview-filter'){if(chooseOverview(state,value)){render();window.scrollTo({left:0,top:0,behavior:'instant'});}return;}
 if(action==='overview-return'){returnOverview(state);render();window.scrollTo(0,0);return;}
 if(action==='overview-cross-clear'){clearOverviewCross(state);state.ui.listTab='all';state.ui.page=1;render();return;}
 if(['script-review-history','script-upload-history'].includes(action)){if(!canReadScriptHistory(state,p)){toast('当前账号不可查看该记录',true);return;}if(dialog?.type===action&&dialog.id===id){dialog.value=value;render();}else open(action,id,value||'all');return;}
 if(action==='work-open-file'){const file=dialog?.workFiles?.[Number(id)];if(!file)return;const key=file.previewId||`${dialog.id}|${file.name}`;fileRefs.set(key,file);open('file',key);return;}
 if(action==='spreadsheet-sheet'){dialog.spreadsheet.sheet=Number(id);render();return;}
 if(action==='spreadsheet-retry'){loadSheet(dialog);render();return;}
 if(action==='dashboard-filter'||action==='dashboard-source'){state.ui[action==='dashboard-filter'?'dashboardMetric':'dashboardSource']=value;state.ui.dashboardPage=1;render();return;}
 if(action==='dashboard-clear'){state.ui.dashboardKeyword='';state.ui.dashboardPage=1;render();return;}
 if(action==='dashboard-page'){state.ui.dashboardPage=Number(value);render();return;}
 if(action==='dashboard-open'){const row=dashboardRows(state).find(r=>r.id===id&&r.kind==='project'),target=dashboardTarget(state,row);if(!target?.view)return;crossDetailReturn={view:'dashboard',id:null};Object.assign(state.ui,{view:target.view,id:target.id,listTab:'all',keyword:'',stage:'',source:'',page:1});state.ui.tab=N.detailTab(state,row.project);render();window.scrollTo(0,0);return;}
 if(action==='dashboard-archive'){if(dashboardArchiveBody(state,id,value,{E,fileList,badge})!==null)open('dashboard-archive',id,value);return;}
 if(action==='demo-scenarios'){open('demo-scenarios');return;}
 if(action==='demo-open'){
  const line=dialog.demoBusiness||state.ui.business,actor=dialog.demoActor||'platform',record=(line==='matching'?state.projects:state.distribution).find(x=>x.id===id);
  if(!record?.demoScenario)return;
  const supplier=sceneSupplier(record,line,actor);if(actor!=='platform'&&!supplier){toast('此场景未关联当前供应商身份',true);return;}
  const view=line==='distribution'?(['evaluation','revision'].includes(record.stage)?'dist-evaluation':'dist-projects'):actor==='maker'?(record.selected===supplier?'content':'intake'):actor==='script'?(['review','ended'].includes(record.stage)&&!record.grade?'intake':'content'):record.selected?'projects':record.grade||M.isAwaitingRating(record)?'library':'intake';
  Object.assign(state.ui,{system:actor==='platform'?'platform':'supplier',business:line,user:actor==='platform'?'admin':state.ui.user,supplier:supplier||state.ui.supplier,identity:actor==='maker'?'maker':'script',view,id:record.id,keyword:record.id,stage:'',source:'',page:1,listTab:record.stage==='ended'?'ended':'all',taskOnly:false});
  state.ui.tab=line==='matching'?N.detailTab(state,record):'';dialog=null;crossDetailReturn=null;render();window.scrollTo(0,0);return;
 }
 if(action==='task-work'){const t=projectTasks(state,p).find(t=>t.key===value);if(!t){toast('当前待办已处理或无权操作',true);return;}captureModalDraft();const drafts=dialog?.taskDrafts||{},oldKey=dialog?dialog.type+':'+(dialog.value??''):null;if(oldKey)drafts[oldKey]=dialog.formDraft;open(t.action,id,t.value??'');dialog.work=true;dialog.taskDrafts=drafts;dialog.formDraft=drafts[t.action+':'+(t.value??'')];render();return;}
 if(action==='material-view'){
  if(!N.canOpenProject(state,p)||!['scriptMaterial','makerMaterial'].includes(value)){toast('当前账号不可查看该物料',true);return;}
  state.ui.view='projects';state.ui.id=p.id;state.ui.tab='release';render();
  const section=document.getElementById('material-'+value);section?.scrollIntoView({block:'start'});section?.focus({preventScroll:true});return;
 }
 if(action==='work-file'){dialog.workFileIndex=Number(id);document.querySelectorAll('.work-file-tabs button').forEach((x,i)=>x.classList.toggle('active',i===Number(id)));const active=dialog;updateWorkPreview(active,uploads,E,()=>dialog===active);return;}
 if(action==='supplier-progress'){state.ui.view='content';state.ui.id=id;state.ui.tab='release';render();return;}
 if(action==='recover-file'){const f=dialog?.file;if(!f)return;open('recover-file',id);dialog.file=f;render();return;}
 if(action==='batch-clear'){state.ui.batchIds=[];render();return;}
 if(action==='batch-match'){state.ui.batchIds=(state.ui.batchIds||[]).filter(id=>canBatchMatch(state,state.projects.find(x=>x.id===id)));if(!state.ui.batchIds.length){toast('请先勾选待匹配的剧本',true);return;}open('batch-match');return;}
 if(action==='maker-preview'){
  if(platform()||writer()||!p||!M.readableScriptFiles(state,p).includes(p.card)){toast('当前账号不可查看该文件',true);return;}
  fileList([p.card]);const f=p.card,key=f.previewId||`${state.ui.id||''}|${f.name}`;
  open('file',key);dialog.makerProjectId=p.id;render();return;
 }
 if(action==='production-workspace'||action==='maker-safety'){
  if(!p||!(platform()?N.canOpenProject(state,p):M.isMaker(state,p))){toast('当前账号不可访问该项目',true);return;}
  state.ui.view=platform()?'projects':'content';state.ui.id=p.id;state.ui.tab=action==='maker-safety'?'safety':'production';render();window.scrollTo(0,0);return;
 }
 if(action==='open-matching-project'||action==='open-script-library'){
  const target=action==='open-script-library'?'library':'projects';
  if(!(target==='library'?N.canOpenLibrary(state,p):N.canOpenProject(state,p))){toast('当前账号不可访问该记录',true);return;}
  crossDetailReturn=Object.fromEntries(['view','id','tab','listTab','keyword','stage','source','page'].map(k=>[k,state.ui[k]]));
  Object.assign(state.ui,{view:target,id:p.id,listTab:'all',keyword:'',stage:'',source:'',page:1});state.ui.tab=N.detailTab(state,p);render();window.scrollTo(0,0);return;
 }
 if(action==='library-match'){if(!N.canOpenLibrary(state,p)){toast('当前账号不可访问该剧本',true);return;}open('push',id);return;}
 if(action==='return-detail'){if(crossDetailReturn){Object.assign(state.ui,crossDetailReturn);crossDetailReturn=null;render();window.scrollTo(0,0);}return;}
 if(action==='permission-clear'){Object.assign(state.ui,{permissionUser:'',permissionBusiness:'',permissionRole:'',permissionKeyword:'',permissionPage:1});render();return;}
 if(action==='permission-page'){state.ui.permissionPage=Number(id);render();return;}
 if(action.startsWith('permission-')&&!A.isAdmin(state))return;
 if(action==='dist-detail'){state.ui.id=id;state.ui.tab='';render();window.scrollTo(0,0);return;}
 
 if(action==='data-sync'){commit(()=>{const t=p.channelTasks.find(x=>x.channel===value);M.assert(A.isAdmin(state)||B.channelCan(state,t,'channelOps')||B.channelCan(state,t,'channelLead'),'当前无数据同步权限');M.assert(t.status==='online','上线后可同步数据');t.syncedAt=new Date().toLocaleString('zh-CN')+'（演示）';},'已模拟同步时间，未拉取真实数据');return;}
 if(action==='reader-chapter'){scrollReading(document.querySelector('#reader-paragraph-'+id),false);return;}
 if(action==='reader-font'){dialog.reader.font=Math.max(14,Math.min(22,dialog.reader.font+Number(a.dataset.step)));refreshReading();return;}
 if(action==='reader-match'){const r=dialog.reader;r.match=(r.match+Number(a.dataset.step)+r.matches)%r.matches;refreshReading();locateReadingMatch();return;}
 if(action==='reader-retry'){const current=dialog;current.reader.status='loading';render();loadReading(current);return;}
 if(action==='close'){closeDialog();return;}if(action==='detail'){state.ui.id=id;state.ui.tab=N.detailTab(state,p);render();window.scrollTo(0,0);return;}
 if(action==='manage-project'){state.ui.view='content';state.ui.listTab='all';state.ui.keyword=state.ui.stage=state.ui.source='';state.ui.page=1;state.ui.id=id;state.ui.tab=N.detailTab(state,p);render();window.scrollTo(0,0);return;}if(action==='back'){state.ui.id=null;if(crossDetailReturn?.view==='dashboard'){state.ui.view='dashboard';crossDetailReturn=null;}render();return;}if(action==='return-business'){switchPage(platform()?'projects':'intake');return;}if(action==='flow'||action==='projects'){switchPage(action);return;}if(action==='clear'){state.ui.batchIds=[];state.ui.keyword=state.ui.stage=state.ui.source='';state.ui.page=1;render();return;}if(action==='page'){state.ui.page=+a.dataset.page;render();return;}
 if(action==='supplier-clear'){state.ui.supplierKeyword='';render();return;}
 if(action==='clock'){commit(()=>{state.clockOffset+=86400000;M.expire(state);},'演示时间已推进24小时，已收回超时推送');return;}
 if(['withdraw','unlock','channelConfirm','channelResubmit','online'].includes(action)){commit(()=>M.mutate(state,p,action,{supplier:value}),'操作已完成');return;}
 if(action==='noop')return;open(action,id,value);
});
root.addEventListener('change',e=>{const x=e.target;
 if(dialog?.type==='demo-scenarios'&&['demoBusiness','demoGroup','demoActor'].includes(x.name)){dialog[x.name]=x.value;if(x.name==='demoBusiness'){dialog.demoGroup='';dialog.demoActor='platform';}render();return;}
 if(x.hasAttribute('data-task-only')){state.ui.taskOnly=x.checked;state.ui.page=1;render();return;}
 if(x.name==='feedback'){syncChannelFeedback(x.value);}
 if(x.matches('[data-batch-project],[data-batch-all]')){
  const eligible=N.rows(state).filter(p=>canBatchMatch(state,p)).map(p=>p.id),ids=new Set((state.ui.batchIds||[]).filter(id=>eligible.includes(id)));
  if(x.hasAttribute('data-batch-all')){for(const id of eligible)x.checked?ids.add(id):ids.delete(id);}else if(eligible.includes(x.dataset.batchProject)){x.checked?ids.add(x.dataset.batchProject):ids.delete(x.dataset.batchProject);}
  state.ui.batchIds=[...ids];render();return;
 }

 if(['permission-new','permission-edit'].includes(dialog?.type)&&x.form?.id==='modal-form'){updatePermissionDraft(x.form,dialog,x.name);if(['userId','business','role','roles'].includes(x.name)){const scroll=document.querySelector('.modal-body')?.scrollTop||0;const name=x.name,value=x.value;render();document.querySelector('.modal-body').scrollTop=scroll;[...document.querySelectorAll('#modal-form [name]')].find(el=>el.name===name&&el.value===value)?.focus({preventScroll:true});}return;}
 if(x.name==='permissionSize'){state.ui.permissionSize=Number(x.value);state.ui.permissionPage=1;render();return;}
 if(x.name==='permissionBusiness'&&x.form?.id==='permission-filters'){const f=new FormData(x.form);Object.assign(state.ui,{permissionUser:f.get('permissionUser')||'',permissionBusiness:x.value,permissionRole:'',permissionPage:1});render();return;}

 if(x.dataset.switch){if(dialog)return;if(x.dataset.switch==='supplier'){if(switchSupplierContext(state,{supplier:x.value})){crossDetailReturn=null;render();window.scrollTo(0,0);}}else{state.ui[x.dataset.switch]=x.value;switchPage(menus()[0]);}return;}
 if(x.type==='checkbox'&&x.closest('[data-limit]')){const box=x.closest('[data-limit]');if(box.querySelectorAll('input:checked').length>+box.dataset.limit){x.checked=false;toast('剧本最多选择3个题材标签',true);}}
 if(dialog?.type==='supplier'&&x.name==='businesses'){document.querySelectorAll('[data-supplier-line]').forEach(fs=>{const active=[...document.querySelectorAll('.supplier-lines input:checked')].some(i=>i.value===fs.dataset.supplierLine);fs.hidden=!active;fs.disabled=!active;});}
 if(dialog?.type==='supplier'&&x.name==='roles'){const selected=[...document.querySelectorAll('.supplier-roles input:checked')].map(x=>x.value);document.querySelectorAll('.supplier-role-fields').forEach(fs=>{const active=selected.includes(fs.dataset.supplierRole);fs.hidden=!active;fs.disabled=!active;});}
 if(['scriptMaterial','makerMaterial'].includes(dialog?.type)&&x.form?.id==='modal-form')syncMaterialForm(x.form,dialog.type);
 if(x.type==='file'){const selected=x.closest('.file-field')?.querySelector('.file-selection');if(selected)selected.textContent=[...x.files].map(f=>f.name).join('、')||'尚未选择文件';}
});
function syncChannelFeedback(value){document.querySelectorAll('[data-channel-feedback]').forEach(el=>{el.hidden=el.dataset.channelFeedback!==value;el.querySelectorAll('input,select,textarea').forEach(x=>x.disabled=el.hidden);});}
function captureModalDraft(){if(!dialog)return;dialog.formScroll=modalScrollArea()?.scrollTop||0;const f=document.querySelector('#modal-form');if(!f)return;const fields={},files={};for(const el of f.elements){if(!el.name)continue;if(el.type==='file'){files[el.name]=[...el.files];if(!files[el.name].length&&dialog.formDraft?.files?.[el.name])files[el.name]=dialog.formDraft.files[el.name];}else if(['checkbox','radio'].includes(el.type)){fields[el.name]??=[];if(el.checked)fields[el.name].push(el.value);}else fields[el.name]=el.value;}dialog.formDraft={fields,files};dialog.formScroll=modalScrollArea()?.scrollTop||0;}
function restoreModalDraft(){const draft=dialog?.formDraft,f=document.querySelector('#modal-form');if(!draft||!f)return;for(const el of f.elements){if(!el.name)continue;if(el.type==='file'){const files=draft.files[el.name];if(files?.length){el.required=false;const hint=el.closest('.file-field')?.querySelector('.file-selection');if(hint)hint.textContent=files.map(x=>x.name).join('、');}}else if(['checkbox','radio'].includes(el.type)){if(Array.isArray(draft.fields[el.name]))el.checked=draft.fields[el.name].includes(el.value);}else if(el.name in draft.fields)el.value=draft.fields[el.name];}if(dialog.type==='channel-feedback')syncChannelFeedback(f.elements.feedback.value);if(['scriptMaterial','makerMaterial'].includes(dialog.type))syncMaterialForm(f,dialog.type);}
async function getFiles(form,name,word=false){const fs=[...(form.elements.namedItem(name)?.files||[])];if(!fs.length&&dialog?.formDraft?.files?.[name])fs.push(...dialog.formDraft.files[name]);const list=[];for(const f of fs){const data=word?await M.validateWord(f):{name:f.name,size:f.size,at:new Date().toLocaleString('zh-CN')};data.previewId=crypto.randomUUID();uploads.set(data.previewId,{url:URL.createObjectURL(f),file:f});data.localAttachment=true;list.push(data);}await persistReviewFiles(list,uploads);return list;}
root.addEventListener('submit',async e=>{e.preventDefault();const form=e.target,v=Object.fromEntries(new FormData(form));if(form.id==='dashboard-filters'){state.ui.dashboardKeyword=v.dashboardKeyword||'';state.ui.dashboardPage=1;render();return;}if(form.id==='reader-search'){dialog.reader.query=(v.query||'').trim();dialog.reader.match=0;refreshReading();locateReadingMatch();return;}if(form.id==='permission-filters'){Object.assign(state.ui,{permissionUser:v.permissionUser||'',permissionBusiness:v.permissionBusiness||'',permissionRole:v.permissionRole||'',permissionPage:1});render();return;}if(form.id==='supplier-filters'){state.ui.supplierKeyword=v.supplierKeyword||'';render();return;}if(form.id==='filters'){state.ui.batchIds=[];state.ui.keyword=v.keyword||'';state.ui.stage=v.stage||'';state.ui.source=v.source||'';state.ui.page=1;render();return;}if(form.id!=='modal-form')return;const d=dialog,p=(state.ui.business==='distribution'?state.distribution:state.projects).find(x=>x.id===d.id),submitter=e.submitter;submitter.disabled=true;
 try{
 let data={...v};const fd=new FormData(form);if(d.type==='recover-file'){const files=form.elements.recovery.files;M.assert(files.length===1,'请选择一份同名原件');await recoverAttachment(d.file,files[0],uploads);const previous=d.previousDialog;dialog=previous;render();if(previous&&isSpreadsheet(previous.file))loadSheet(previous);else if(previous?.reader&&/\.docx?$/i.test(previous.file?.name||''))loadReading(previous);else if(previous&&/\.(srt|vtt|txt)$/i.test(previous.file?.name||''))loadTextFile(previous);toast('已恢复附件，业务版本与审核状态未变更');return;}
 if(d.type==='batch-match'){let result;commit(()=>{result=M.batchPush(state,state.ui.batchIds||[],v.supplier);state.ui.batchIds=[];},()=>`已匹配${result.count}个剧本${result.skipped?'，跳过'+result.skipped+'个已有推送':''}`);return;}
 if(d.type==='deliver'){
  data.deliveries=[];for(const index of [0,1,2]){const files=await getFiles(form,'delivery'+index);if(files.length){files.forEach(f=>f.productionAttachment=true);data.deliveries.push({index,files});}}
  M.assert(data.deliveries.length,'请至少选择一项交付文件');await persistReviewFiles(data.deliveries.flatMap(x=>x.files),uploads);
 }
 if(d.type==='production')data.index=Number(d.value);

 if(['permission-new','permission-edit','permission-delete'].includes(d.type)){commit(()=>{if(d.type==='permission-delete')A.deletePermission(state,d.id);else if(d.type==='permission-edit')A.editPermission(state,d.id,permissionValues(form,d));else A.addPermission(state,permissionValues(form,d));},d.type==='permission-delete'?'权限已删除':d.type==='permission-new'?'权限已新增':'权限已保存');return;}
 if(d.type.startsWith('dist-')){data.key=d.value;if(d.type==='dist-contract'){data.files=await getFiles(form,'files');data.file=data.files[0];M.assert(data.files.every(f=>/\.(doc|docx|pdf)$/i.test(f.name)&&f.size<=100*1024*1024),'授权留档仅支持Word或PDF，单文件不超过100MB');}commit(()=>{const out=B.distAction(state,p,d.type,data);if(d.type==='dist-new'){state.ui.id=out.id;state.ui.tab='evaluation';}},'代发行项目已更新');return;}
 if(d.type.startsWith('channel-')||d.type==='release-schedule'){data.channel=d.value;data.channels=fd.getAll('channels');if(d.type==='channel-fix')data.files=await getFiles(form,'files');const channelAction=d.type==='channel-feedback'?(v.feedback==='online'?'channel-online':'channel-return'):d.type;commit(()=>B.channelAction(state,p,channelAction,data),'渠道任务已更新');return;}
 if(d.type==='match-safety-assign'){commit(()=>M.mutate(state,p,'safetyAssign',data),'已分配剧本安审');return;}
 if(d.type==='match-review-assign'){commit(()=>M.mutate(state,p,'reviewAssign',data),'已分配正片安审');return;}

 if(['intake','quality','safety','production','film','confirmScript','confirmMaker'].includes(d.type))M.assert(v.result==='approved'||v.opinion.trim(),['quality','safety'].includes(d.type)?'审核驳回或不通过时请填写审核意见':'退回时请填写修改意见');
 if(isMaterialReview(d.type)){data.materialVersion=d.materialVersion;data.reviewFiles=await getFiles(form,'reviewFiles');data.reviewFiles.forEach(f=>{f.reviewAttachment=true;f.materialReviewAttachment=true;});}
 if(['quality','safety'].includes(d.type)){data.files=await getFiles(form,'reviewFiles');for(const file of data.files){if(/\.docx?$/i.test(file.name))await M.validateWord(uploads.get(file.previewId).file);file.reviewAttachment=true;}await persistReviewFiles(data.files,uploads);}
 if(d.type==='new'){const card=(await getFiles(form,'card',true))[0],full=(await getFiles(form,'full',true))[0];data.alternates=[1,2,3,4,5].map(i=>v['alt'+i]?.trim()||'');commit(()=>{const p=M.create(state,data,card,full);state.ui.id=p.id;state.ui.tab='script';},'剧本已提交');return;}
 if(d.type==='internal-revise')data.alternates=[1,2,3,4,5].map(i=>v['alt'+i]?.trim()||'');
 if(['internal-revise','full','card','filmResubmit','channelFix','contract'].includes(d.type)){const fs=await getFiles(form,'files',['internal-revise','full','card'].includes(d.type));M.assert(fs.length,'请选择上传文件');data.file=fs[0];data.files=fs;if(d.type==='contract')data.kind=d.value;}
 if(d.type==='filmResubmit'){data.files.forEach(f=>f.productionAttachment=true);await persistReviewFiles(data.files,uploads);}
 if(d.type==='grade')data.tags=fd.getAll('tags');if(d.type==='push')data.suppliers=fd.getAll('suppliers');
 if(['scriptMaterial','makerMaterial'].includes(d.type)){
  const internal=d.type==='scriptMaterial'&&p.source==='internal';
  data={values:internal?{}:readMaterialForm(form,d.type),draft:submitter.value==='draft',files:[]};
  data.values=validateMaterialValues(d.type,data.values,{draft:data.draft,internal});
  if(d.type==='makerMaterial'){
   for(const [k] of F.producerFileFields){const files=await getFiles(form,k);files.forEach(f=>{f.slot=k;f.materialAttachment=true;});data.files.push(...files);}
  }else{const added=await getFiles(form,'materialFiles');added.forEach(f=>f.materialAttachment=true);data.files=added;M.assert(data.draft||data.files.length||(M.materialForEdit(p.scriptMaterial).files||[]).length||!internal,'请上传物料附件后再正式提交');}
 }

 if(d.type==='supplier'){
 const businesses=fd.getAll('businesses'),rs=businesses.includes('matching')?fd.getAll('roles'):[],ts=fd.getAll('tags'),name=v.supplierName.trim(),account=v.account.trim();
 M.assert(can('admin'),'仅管理员可维护供应商');M.assert(name&&account,'请填写供应商名称和登录账号');M.assert(!state.suppliers.some(x=>x.id!==d.id&&x.account===account),'该登录账号已存在');M.assert(businesses.length,'请至少选择一条合作业务');M.assert(!businesses.includes('matching')||rs.length,'启用撮合业务时，请选择至少一种业务身份');
 M.assert(!rs.includes('script')||A.options(state,'matching','business').some(([,n])=>n===v.scriptBusiness),'请选择剧本商务');M.assert(!rs.includes('maker')||A.options(state,'matching','prodBusiness').some(([,n])=>n===v.productionBusiness),'请选择承制商务');M.assert(!businesses.includes('distribution')||A.options(state,'distribution','business').some(([,n])=>n===v.distributionBusiness),'请选择代发行商务');
 commit(()=>{const old=state.suppliers.find(x=>x.id===d.id),data={name,account,businesses,roles:rs,scriptBusiness:rs.includes('script')?v.scriptBusiness:'',productionBusiness:rs.includes('maker')?v.productionBusiness:'',distributionBusiness:businesses.includes('distribution')?v.distributionBusiness:'',tags:rs.includes('maker')?ts:[]};if(old)Object.assign(old,data);else{state.suppliers.push({id:'s'+Date.now(),...data,status:'active',createdAt:new Date().toLocaleString('sv-SE')});state.ui.supplierKeyword='';}const active=state.suppliers.find(x=>x.id===state.ui.supplier);if(!active.roles.includes(state.ui.identity))state.ui.identity=active.roles[0]||'script';},d.id?'供应商已更新':'供应商已创建');return;
 }
 if(['supplier-password','supplier-status'].includes(d.type)){commit(()=>{M.assert(can('admin'),'仅管理员可维护供应商');const x=state.suppliers.find(x=>x.id===d.id);if(d.type==='supplier-status')x.status=x.status==='frozen'?'active':'frozen';else x.passwordResetAt=new Date().toISOString();},d.type==='supplier-password'?'示例密码重置已完成，正式账号未变更':'账号状态已更新');return;}

 if(d.type==='reset'){commit(()=>state=M.seed(),'已恢复本版初始示例');return;}
 commit(()=>{M.mutate(state,p,d.type,data);if(d.type==='terminate'){Object.assign(state.ui,{id:null,view:'library',listTab:'matching',keyword:p.name,stage:'',source:'',page:1});}if(d.type==='internal-revise'){state.ui.id=p.id;state.ui.tab='script';}if(d.type==='filmResubmit'){state.ui.tab='production';}if(d.type==='select'){clearOverviewCross(state);Object.assign(state.ui,{id:p.id,view:'content',overviewMetric:'developing',listTab:'all',tab:'production',keyword:'',stage:'',source:'',page:1});}},()=>d.type==='terminate'?'承制合作已终止，剧本已回库待匹配':d.type==='internal-revise'?'修改版已提交，内容审核与剧本安审均待审核':['quality','safety'].includes(d.type)&&M.isAwaitingRating(p)?'两项审核已通过，已移入剧本库待评级':d.type==='grade'?'评级、题材和项目制片已保存':d.type==='rename-project'?'项目名称已更新':d.type==='select'?'已确认选中，全集已同步，可以开始提交制作资料':d.type==='contract'?'合同已留档':data.draft?'草稿已保存':['scriptMaterial','makerMaterial'].includes(d.type)?'整份物料已提交核验':isMaterialReview(d.type)?'核验结果及审核附件已同步给提交方':'操作已完成');if(submitter.value==='continue'&&!dialog){const next=projectTasks(state,p).find(t=>reviewNames[t.action]);if(next)open(next.action,p.id,next.value??'');}
 }catch(err){const invalid=err.field?form.elements.namedItem(err.field):null;invalid?.focus?.();const box=document.querySelector('.form-error');if(box){box.textContent=err.message;box.scrollIntoView({block:'nearest'});}else toast(err.message,true);}finally{submitter.disabled=false;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog){closeDialog();}});
try{await restoreReviewFiles(state,uploads);}catch(error){console.warn(error.message);}
if(location.hash==='#permissions'&&platform()&&A.isAdmin(state)){state.ui.view='permissions';state.ui.id=null;}if(location.hash==='#flow'){state.ui.view='flow';state.ui.id=null;}if(location.hash==='#suppliers'&&platform()){state.ui.view='suppliers';state.ui.id=null;}render();
