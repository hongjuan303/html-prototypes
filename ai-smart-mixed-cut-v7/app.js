import {importSummary,importSelectionError} from './import-state.js?v=20261029-update21d';
import {applyDramaImport,retryDramaImport,removeFailedDrama,advanceDemoImports,ensureImportExamples} from './drama-import.js?v=20261029-update21d';
import {ensureDefaultRetryExamples} from './default-task-examples.js?v=20261029-update21d';
import {validateSavedAnalysis,beginTaskRetry,finishTaskRetries} from './task-retry.js?v=20261029-update21d';
import {bgmVolumeError,TITLE_CONTROLS,TITLE_COLORS,titleControlError} from './packaging.js?v=20261029-update21d';
import {createVideoPreview} from './video-preview.js?v=20261029-update21d';
import {emptyCreationConfig,ensureTaskVersions,taskCards,taskListPage,renderTaskCards,renderTaskDetail,GENERATION_ERROR} from './task-center.js?v=20261029-update21d';
import {durationRange,durationInput,durationDisplay,durationError} from './duration-range.js?v=20261029-update21d';
import {regenerationAvailability,prepareFailedRegeneration} from './failure-regeneration.js?v=20261029-update21d';
import {ensureMaterialIdentity,nameBatch,productionTime} from './material-identity.js?v=20261029-update21d';
import {failedOutputs,failedRevision,JOB_STAGES,FAILURE_TYPES,failureOf,newJob,taskEntries,activeTasks,progressLine,progressDrawer,progressPage,progressPagination} from './production-tasks.js?v=20261029-update21d';
import {createBgmUI} from './bgm-ui.js?v=20261029-update21d';
import {assertBgmAvailable} from './bgm-model.js?v=20261029-update21d';
import {SOURCE_ACCESS_SCENARIOS,sourceAccess,canAccessMarket,sourcePermissionError,isConfiguredSource,clearUnavailableSource} from './source-access.js?v=20261029-update21d';
import {createCloudImport} from './cloud-import.js?v=20261029-update21d';
import {importableDramas,librarySelectionConfig} from './library-selection.js?v=20261029-update21d';
import {createLocalUpload} from './local-upload.js?v=20261029-update21d';
import {feedbackForm,feedbackItems,readFeedbackTime} from './feedback-ui.js?v=20261029-update21d';
import {feedbackRange,recordOutputIssue,ISSUE_TYPES,issueRangeLabel} from './feedback-model.js?v=20261029-update21d';
import {ensureContentPool,curateCandidates,recordFeedback} from './content-model.js?v=20261029-update21d';
import {contentSimilarity} from './content-ui.js?v=20261029-update21d';
import {reviewable,beginRework,finishRework,beginNarrationUpdate,finishNarrationUpdate} from './workflow-model.js?v=20261029-update21d';
import {qualitySummary} from './workflow-ui.js?v=20261029-update21d';
import {MIXED_CUT_STORAGE_KEY} from './platform-context.js?v=20261029-update21d';
import {updatePlatformBalance} from './platform-shell.js?v=20261029-update21d';
import {isFullNarration,productionRate,modeLabel,normalizeCreationConfig,targetSeconds,MODES,RANGES,clone,assetKey,validate,analysisInfo,analyze,planBatch,estimate,initialState,activeRule,createBatch,settleOutput,revise,applyOutputSpeed,speedSummary} from './engine.js?v=20261029-update21d';
import {listCollections,getCollection,collectionNumber} from './sources.js?v=20261029-update21d';
import {createSyncUI} from './sync-ui.js?v=20261029-update21d';
import {dramaKey,registerDrama,listDramas,findDrama,renameDrama} from './dramas.js?v=20261029-update21d';
import {renderLibrary,filteredDramas,sourceName} from './library-ui.js?v=20261029-update21d';
import {createForm,renderCreationPreview} from './creation-ui.js?v=20261029-update21d';
import {renderMaterials,materialMatches} from './tasks-ui.js?v=20261029-update21d';
import {fullNarrationPanel,mixedNarrationPanel,narrationActions} from './narration-ui.js?v=20261029-update21d';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const button=(label,action,cls='secondary',attrs='')=>`<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const tag=(t,c='')=>`<span class="tag ${c}">${esc(t)}</span>`;
const icon=()=>'<svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor"/><path d="m8 6 5 4-5 4V7Z" fill="currentColor"/></svg>';
const KEY=MIXED_CUT_STORAGE_KEY;let state;try{state=JSON.parse(localStorage.getItem(KEY))||initialState();}catch{state=initialState();}
ensureTaskVersions(state);
ensureMaterialIdentity(state);
state.config=normalizeCreationConfig(state.config);
if(state.sourceAccessScenario===undefined)state.sourceAccessScenario='domestic';clearUnavailableSource(state);
ensureDefaultRetryExamples(state);
ensureImportExamples(state);
let view=['create','assets','tasks','task-detail'].includes(state.ui?.view)?state.ui.view:'create',currentBatch=null,currentOutput=null,busy=false,reviewTab='junction',picker=null,localVideo=null,playerTimer=null,playerAt=0,genTimers=new Set(),toolsScenario='normal',selectionBatchId=null;
let selectedTaskId=state.ui?.selectedTaskId||null,taskPaging={page:1,pageSize:10,...state.ui?.taskPaging},submissionJobId=null;
const taskSelections=new Map();
function selectionFor(id=currentBatch){if(!id)return new Set();if(!taskSelections.has(id))taskSelections.set(id,new Set());return taskSelections.get(id);}
function clearTaskSelection(){taskSelections.clear();selectionBatchId=null;}
function canSelectMaterial(b,o){return (o.status==='ready'&&reviewable(o)&&!o.narrationDraft&&!syncUI.locked(b,o));}
function filteredMaterials(){
 const dramas=new Map(listDramas(state).map(d=>[d.id,d]));
 return state.batches.flatMap(b=>b.outputs.map(o=>({b,o,drama:dramas.get(dramaKey(b.config))}))).filter(({b,o})=>(taskFilters.drama==='all'||dramaKey(b.config)===taskFilters.drama)&&(taskFilters.task==='all'||b.id===taskFilters.task||b.productionJobId===taskFilters.task)&&materialMatches(o,b.config,taskFilters));
}
function selectTaskContext(id,{notify=false}={}){
 if(selectionBatchId&&selectionBatchId!==id){taskSelections.clear();if(notify)toast('已切换制作任务，请重新勾选素材');}
 selectionBatchId=id;currentBatch=id;return selectionFor(id);
}
function selectedVisibleMaterials(){
 const b=state.batches.find(b=>b.id===selectionBatchId);if(!b)return [];
 const visible=new Set(filteredMaterials().filter(row=>row.b.id===b.id&&canSelectMaterial(b,row.o)).map(row=>row.o.id));
 return b.outputs.filter(o=>visible.has(o.id)&&selectionFor(b.id).has(o.id));
}
let reviewQueue=null,confirmFollowup=null,reworkDraft=null,narrationApplyContext=null,relatedOrigin=null,feedbackContext=null;
const defaultLibraryFilters=()=>({query:'',market:'all'}),defaultTaskFilters=()=>({drama:'all',mode:'all',status:'all',task:'all'});
let libraryFilters={...defaultLibraryFilters(),...state.ui?.libraryFilters},taskFilters={...defaultTaskFilters(),...state.ui?.taskFilters};
if(!['all','domestic','overseas'].includes(libraryFilters.market))libraryFilters.market='all';
if(!['all','highlight'].includes(taskFilters.mode))taskFilters.mode='all';
let libraryDraft={...libraryFilters,...state.ui?.libraryDraft},taskDraft={...taskFilters,...state.ui?.taskDraft},replacementContext=null;
if(!['all','domestic','overseas'].includes(libraryDraft.market))libraryDraft.market='all';
if(!['all','highlight'].includes(taskDraft.mode))taskDraft.mode='all';
if(!['all','running','done','partial','failed'].includes(taskFilters.status))taskFilters.status='all';
if(!['all','running','done','partial','failed'].includes(taskDraft.status))taskDraft.status='all';
state.productionJobs||=[];
function persistUI(){state.ui={view:view==='review'?'task-detail':view,selectedTaskId,taskPaging,libraryFilters,taskFilters,libraryDraft,taskDraft};}
const batch=()=>state.batches.find(b=>b.id===currentBatch),output=()=>batch()?.outputs.find(o=>o.id===currentOutput);
let editingSessionActive=true,generationPending=false;
const save=()=>{if(!editingSessionActive)return;persistUI();clearUnavailableSource(state);if(isConfiguredSource(state.config))registerDrama(state,state.config,{touch:false});try{localStorage.setItem(KEY,JSON.stringify(state));updatePlatformBalance(state.balance);}catch{toast('本地存储空间不足，本次刷新后可能无法保留');}};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>$('#toast').classList.remove('visible'),3300);}
function modal(title,body,actions=button('关闭','close')){$('#dialog').className='';delete $('#dialog').dataset.failureJob;$('#dialog [aria-label="关闭弹窗"]').disabled=false;delete $('#dialog').dataset.syncJob;$('#dialogTitle').textContent=title;$('#dialogTitle').title=title;$('#dialogBody').innerHTML=body;$('#dialogActions').innerHTML=actions;if(!$('#dialog').open)$('#dialog').showModal();}
function completeSubmission(){if(!submissionJobId)return;submissionJobId=null;state.config=emptyCreationConfig();state.plan=null;replacementContext=null;localVideo=null;save();render();}
function closeModal(){if(localUpload.isBusy()||bgmUI.isBusy())return;completeSubmission();localUpload.cancel();cloudImport.cancel();bgmUI.cancel();narrationApplyContext=null;feedbackContext=null;$('#dialog').close();if(view==='assets')render();}
function stopPlayer(){clearInterval(playerTimer);playerTimer=null;const control=$('[data-action="play"]');if(control)control.textContent='▶';}
function nav(next){stopPlayer();window.speechSynthesis?.cancel();playerAt=0;if(next==='create'){state.config=normalizeCreationConfig(state.config);save();}if(next!=='review')relatedOrigin=null;view=next;clearTaskSelection();save();render();window.scrollTo({top:0});}
function sourceLabel(c=state.config){const s=c.source;return ['green','cloud'].includes(s?.kind)?(s.market==='domestic'?'国内短剧':'海外短剧'):'本地上传';}
function heading(title,desc,actions='',eyebrow=''){return `<div class="page-head"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div><div class="head-actions">${actions}</div></div>`;}
const option=(value,label,current)=>`<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(label)}</option>`;
function episodeSummary(ids){return ids.length>4?'第 '+ids[0]+'–'+ids.at(-1)+' 集 · '+ids.length+' 集取材':'第 '+ids.join('、')+' 集';}
function field(label,control,help=''){return `<div class="field"><label>${label}</label>${control}${help?`<small>${help}</small>`:''}</div>`;}
function footer(main,help,actions){$('#actionBar').hidden=false;$('#actionBar').innerHTML=`<div><div class="price-line">${main}</div><p class="footer-help">${help}</p></div><div class="actions">${actions}</div>`;}
const uiHelpers={heading,button,esc,tag,option,sourceLabel,fmt,field,footer};
const videoPreview=createVideoPreview({modal,esc,fmt,toast});
function acceptImportedSource(source,start,end){
 if(!editingSessionActive)throw Error('当前页面已在其他窗口继续');
 const inLibrary=view==='assets',next={...state,dramas:clone(state.dramas||{}),config:clone(state.config)};
 applyDramaImport(next,source,start,end,{inLibrary});
 localStorage.setItem(KEY,JSON.stringify(next));state=next;
 if(inLibrary){libraryFilters=defaultLibraryFilters();libraryDraft={...libraryFilters};}
 else localVideo=null;
 nav(inLibrary?'assets':'create');
}
function retryImport(id){
 if(!editingSessionActive){toast('当前页面已在其他窗口继续');return;}
 try{
  const next={...state,dramas:clone(state.dramas||{}),config:clone(state.config)};
  retryDramaImport(next,id);
  localStorage.setItem(KEY,JSON.stringify(next));state=next;
  render();toast('视频重新导入中');
 }catch(error){toast(error.message||'重试提交失败，请重试');}
}
function confirmDeleteImport(id){
 const drama=findDrama(state,id);if(!drama||importSummary(drama.source).status!=='failed'){toast('仅导入失败的剧目可删除');return;}
 modal('删除失败剧目',`<div class="import-delete-summary" id="importDeleteSummary"><strong>确定删除“${esc(drama.title)}”？</strong><p>删除该失败剧目记录及未被任务引用的已导入片源。</p><p>已关联的历史制作任务和成片保留。删除后如需继续制作，请重新导入。</p></div>`,button('取消','close')+button('确认删除','confirm-delete-import','danger',`data-id="${esc(id)}"`));
}
const localUpload=createLocalUpload({modal,closeModal,button,esc,toast,onImport:source=>{
 acceptImportedSource(source,1,source.totalEpisodes);
},onAppend:(source,previous)=>{
 source.importProgress={status:'complete',total:source.files.length,completed:source.files.length};
 if(!editingSessionActive||state.config.source.kind!=='manual'||state.config.source.assetId!==previous.assetId||(Number(state.config.source.fileVersion)||1)!==(Number(previous.fileVersion)||1))throw Error('当前片源已变化，请重新添加视频');
 const currentFiles=state.config.source.files||[];
 if(JSON.stringify(currentFiles)!==JSON.stringify(previous.files))throw Error('已有片源已变化，请重新添加视频');
 const oldTotal=previous.files.length,kept=new Map(source.files.map((file,index)=>[file.id,index+1]));
 const oldSelection=previous.files.slice(Math.max(0,state.config.start-1),state.config.end).map(file=>kept.get(file.id)).filter(Boolean);
 const fullRange=state.config.start===1&&state.config.end===oldTotal;
 const nextConfig={...state.config,source,start:fullRange||!oldSelection.length?1:Math.min(...oldSelection),end:fullRange||!oldSelection.length?source.totalEpisodes:Math.max(...oldSelection)};
 const nextState={...state,config:nextConfig,plan:null,dramas:clone(state.dramas||{}),assets:{...state.assets}};
 const cache=state.assets[assetKey(state.config)];
 if(previous.simulated===false&&cache&&cache.seeded!==true&&cache.simulated!==true&&Array.isArray(cache.episodes)){
  const inherited=clone(cache);inherited.episodes=[...new Set(cache.episodes.map(id=>kept.get(previous.files[id-1]?.id)).filter(Boolean))];delete inherited.contentPool;
  nextState.assets[assetKey(nextConfig)]=inherited;
 }
 registerDrama(nextState,nextConfig);
 // Persist the complete new source before adopting it, keeping the old source
 // and selection intact if browser storage rejects the append.
 localStorage.setItem(KEY,JSON.stringify(nextState));
 state=nextState;localVideo=null;updatePlatformBalance(state.balance);nav('create');
}});
const cloudImport=createCloudImport({modal,closeModal,button,esc,toast,localUpload,onImport:acceptImportedSource,
 getDramas:()=>importableDramas(state),onSelectDrama:id=>{
  if(!editingSessionActive)throw Error('当前页面已在其他窗口继续');
  const config=librarySelectionConfig(state,id),next={...state,config,plan:null,dramas:clone(state.dramas||{})};
  registerDrama(next,state.config,{touch:false});
  registerDrama(next,config,{touch:false});
  localStorage.setItem(KEY,JSON.stringify(next));state=next;
  if(localVideo)URL.revokeObjectURL(localVideo);localVideo=null;nav('create');
 }});
$('#dialog').addEventListener('cancel',event=>{if(localUpload.isBusy()||bgmUI.isBusy())event.preventDefault();});
$('#dialog').addEventListener('close',()=>{completeSubmission();localUpload.cancel();cloudImport.cancel();});
function openRenameDrama(id){const d=findDrama(state,id);if(!d){toast('剧目已失效，请重新选择');return;}
 modal('重命名剧目',`<div class="field rename-drama-field"><label for="dramaRename">剧目名称 <span class="required">*</span></label><input id="dramaRename" aria-label="剧目名称" maxlength="160" value="${esc(d.title)}"><small>修改剧目名称，不改变原片文件名。</small></div>`,button('取消','close')+button('保存','save-drama-name','primary',`data-id="${esc(id)}"`));$('#dramaRename').focus();}

function createView(){return (replacementContext?`<div class="replacement-banner">${tag('调整后重做')}<span>仅重做 ${replacementContext.outputIds?.length||replacementContext.count} 条；已有成功素材保留。</span>${button('取消调整','cancel-replacement','text-btn')}</div>`:'')+createForm(state,{busy},uiHelpers);}
function refreshCreationPreview(){if(view!=='create')return;const panel=$('.preview-panel');if(panel)panel.innerHTML=renderCreationPreview(state.config,uiHelpers);createForm(state,{busy},uiHelpers);}
const bgmUI=createBgmUI({getConfig:()=>state.config,modal,closeModal,toast,button,esc,onApply:selection=>{
 if(!editingSessionActive)throw Error('当前页面已在其他窗口继续');
 const nextState={...state,config:normalizeCreationConfig({...state.config,...selection,bgm:true}),plan:null};
 localStorage.setItem(KEY,JSON.stringify(nextState));state=nextState;render();
}});
function openBgmPicker(){bgmUI.open();}
function validateSourceSelection(c){return validate({...c,mode:'highlight',duration:'3-5',speed:1.5,count:1,title:false,bgm:false});}

function refreshSyncState(){if(['assets','tasks'].includes(view))render();else if(view==='review'){const b=batch(),o=output();if(!b||!o)return;const a=$('#reviewSyncActions'),n=$('.sync-review-notice');if(a)a.innerHTML=reviewDelivery(b,o);if(n)n.outerHTML=syncUI.reviewNotice(b,o);const q=$('.review-queue');if(q)q.outerHTML=reviewQueueBar(b,o);}}
const syncUI=createSyncUI({getState:()=>state,save,render,refreshSyncState,toast,modal,closeModal,button,esc,icon,formatTime:fmt,getBatch:batch,getOutput:output,getSelectedOutputs:()=>batch()?.id===selectionBatchId?selectedVisibleMaterials():[]});
// Let a newly opened demo take over only after every local write operation settles.
// The old document then navigates away before its Web Lock can be acquired again.
export function relinquishEditingSession(){
 if(!editingSessionActive||busy||runningJobs.size||startingBatches.size||generationPending||genTimers.size||localUpload.isBusy()||bgmUI.isBusy()||syncUI.isBusy()||state.batches.some(b=>b.outputs.some(o=>o.status==='pending'&&!o.demoHeld||o.repairing||o.reworkPending)))return false;
 editingSessionActive=false;
 document.documentElement.inert=true;
 stopPlayer();bgmUI.cancel();
 window.speechSynthesis?.cancel();
 for(const type of ['click','input','change','keydown','submit'])document.addEventListener(type,event=>{event.preventDefault();event.stopImmediatePropagation();},{capture:true});
 return true;
}
function render(){const focused=document.activeElement,focusId=focused?.id,selectionStart=focused?.selectionStart;clearUnavailableSource(state);stopPlayer();const names={create:'制作素材',assets:'剧目管理',tasks:'成片管理','task-detail':'任务详情',review:'成片预览'};$('#breadcrumb').innerHTML=`<a href="./toolbox.html${window.parent!==window?'?review=1':''}">工具箱</a><span> / </span><span>智能混剪</span><b hidden>${names[view]}</b>`;updatePlatformBalance(state.balance);$$('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===(['review','task-detail'].includes(view)?'tasks':view)));$('#actionBar').hidden=true;$('#app').innerHTML=({create:createView,assets:libraryView,tasks:tasksView,'task-detail':taskDetailView,review:reviewView}[view]||createView)();if(view==='review'&&output())locate(Math.min(playerAt,output().duration));if(focusId){const target=document.getElementById(focusId);if(target&&target!==focused){target.focus({preventScroll:true});if(typeof selectionStart==='number'&&target.setSelectionRange)try{target.setSelectionRange(selectionStart,selectionStart);}catch{}}}}
// Page functions are declared below. They are resolved before the first render.
function remainingPlans(){const p=state.plan;if(!p)return [];const used=new Set(state.batches.filter(b=>b.planSession===p.id).flatMap(b=>b.outputs.filter(o=>o.status!=='failed').map(o=>o.planId)));return p.candidates.filter(x=>!used.has(x.id));}
function libraryView(){return renderLibrary(state,libraryFilters,uiHelpers,libraryDraft);}
function openDramaOutputs(id){
 const d=findDrama(state,id);if(!d){toast('剧目已失效，请重新选择');return;}
 taskPaging.page=1;taskFilters={...defaultTaskFilters(),drama:id};taskDraft={...taskFilters};currentBatch=d.batches[0]?.id||null;nav('tasks');
}
function makeDrama(id){
 const d=findDrama(state,id);if(!d){toast('剧目已失效，请重新选择');return;}
 const error=sourcePermissionError(state,d.config)||importSelectionError(d.source);if(error){toast(error);return;}
 registerDrama(state,state.config,{touch:false});state.config=normalizeCreationConfig(d.config);if(d.displayName)state.config.source.displayName=d.displayName;
 if(localVideo)URL.revokeObjectURL(localVideo);localVideo=null;save();nav('create');
}
function tasksView(){
 const dramas=listDramas(state),p=taskListPage(state,taskFilters,taskPaging);taskPaging={page:p.page,pageSize:p.pageSize};
 const fields=`<div class="library-filters" id="materialFilters"><select id="taskDrama" aria-label="按剧目筛选任务">${option('all','全部剧目',taskDraft.drama)}${dramas.map(d=>option(d.id,d.title,taskDraft.drama)).join('')}</select><select id="taskMode" aria-label="剪辑类型">${option('all','全部剪辑类型',taskDraft.mode)}${option('highlight','高光顺剪',taskDraft.mode)}</select><select id="taskStatus" aria-label="剪辑状态">${[['all','全部状态'],['running','剪辑中'],['done','已完成'],['partial','部分失败'],['failed','已失败']].map(([v,l])=>option(v,l,taskDraft.status)).join('')}</select><div class="filter-actions">${button('查询','query-tasks','primary')}${button('重置','clear-task-filters','secondary')}</div></div>`;
 return heading('成片管理','')+fields+renderTaskCards(p,uiHelpers);
}
function openTask(id){const j=taskCards(state).find(j=>j.id===id||j.batchId===id);if(!j){toast('任务不存在，请刷新后重试');return;}selectedTaskId=j.id;currentBatch=j.batchId||null;closeModal();nav('task-detail');}
function taskDetailView(){const j=taskCards(state).find(j=>j.id===selectedTaskId);if(!j)return heading('任务详情','',button('返回任务列表','back-tasks'))+'<div class="empty">任务不存在，请返回列表查看。</div>';currentBatch=j.batchId||null;return renderTaskDetail(j,{...uiHelpers,fmt});}

function reviewView(){return taskDetailView();}


function openPicker(){
 const access=sourceAccess(state);if(!access.canUseCollections){localUpload.open();return;}
 const source=state.config.source,market=access.markets.includes(source?.market)?source.market:access.markets[0];
 picker={market,id:source?.kind==='green'&&source.market===market?source.collectionId:null,start:state.config.start,end:state.config.end,query:''};renderPicker();
}
function renderPicker(){
 const access=sourceAccess(state);if(!access.canUseCollections){picker=null;localUpload.open();return;}
 if(!picker){picker={market:access.markets[0],id:null,start:1,end:1,query:''};}
 const permitted=canAccessMarket(state,picker.market),items=permitted?listCollections(picker.market,picker.query):[],picked=permitted?getCollection(picker.market,picker.id):null;
 const controls=['domestic','overseas'].map(market=>button(market==='domestic'?'国内合集':'海外合集','picker-market',picker.market===market?'active':'',`data-value="${market}"`)).join('');
 modal('选择合集',`<div class="pills">${controls}</div><input class="search" id="collectionSearch" aria-label="搜索合集" placeholder="搜索合集名称或 ID" value="${esc(picker.query)}"><div class="source-picker"><div class="collection-list">${items.map(item=>`<button class="collection ${picker.id===item.id?'active':''}" data-action="picker-collection" data-id="${item.id}"><img class="poster" src="${esc(item.cover||'./assets/drama-confrontation.jpg')}" alt="合集封面"><div><strong>${esc(item.title)}</strong><p>${collectionNumber(item.id)} · 可用 ${item.availableEpisodes.length} / ${item.totalEpisodes} 集</p></div></button>`).join('')||(permitted?'<div class="empty">没有找到合集</div>':'<div class="empty">暂无此数据源的访问权限</div>')}</div><div class="subtle-box"><h3>${picked?'配置混剪集数':'先选择一个合集'}</h3>${picked?`<p class="helper">${esc(picked.description)}</p><div class="range-row">第 <input aria-label="合集起始集数" id="pickerStart" type="number" value="${picker.start}"> — <input aria-label="合集结束集数" id="pickerEnd" type="number" value="${picker.end}"> 集</div><div class="pills" style="margin-top:15px">${[10,20,30].map(n=>button('前'+n+'集','picker-range','',`data-value="${n}"`)).join('')}</div>`:''}</div></div>`,button('取消','close')+button('使用合集与选集','apply-source','primary',picked?'':'disabled'));$('#dialog').classList.add('wide');
}
function applySourceAccess(scenario){
 state.sourceAccessScenario=SOURCE_ACCESS_SCENARIOS.some(item=>item.id===scenario)?scenario:'unmatched';
  clearUnavailableSource(state);libraryFilters.market='all';picker=null;
 for(const b of state.batches){if(!sourcePermissionError(state,b.config))continue;for(const o of b.outputs){
  if(o.status==='pending'){o.attempt=(o.attempt||0)+1;settleOutput(state,b,o,false);o.permissionRevoked=true;o.failure={kind:'source',label:'合集访问权限已变化'};}
  if(o.reworkPending)finishRework(state,b,o,false);
  if(o.repairing)o.repairing=false;
 }}
}
const runningJobs=new Map(),startingBatches=new Set();
let progressPaging={page:1,pageSize:10};
function refreshWork(){finishTaskRetries(state);save();if(['tasks','assets','task-detail'].includes(view))render();if($('#dialog').open&&$('#dialog').classList.contains('production-drawer'))renderProgress();else if($('#dialog').open&&$('#dialog').dataset.failureJob)showTaskFailures($('#dialog').dataset.failureJob);}
function focusTask(id){openTask(id);}
function renderProgress({scrollTop=false}={}){
 const p=progressPage(state,progressPaging);progressPaging={page:p.page,pageSize:p.pageSize};
 const body=$('#dialogBody'),top=body.scrollTop,focused=document.activeElement,focusId=focused?.id;
 const draft=focusId==='progressPageNumber'?focused.value:null;
 body.innerHTML=progressDrawer(state,uiHelpers,p);$('#dialogActions').innerHTML=progressPagination(p,uiHelpers);
 body.scrollTop=scrollTop?0:top;
 if(!scrollTop&&['progressPageNumber','progressPageSize'].includes(focusId)){const input=document.getElementById(focusId);if(input){if(draft!==null)input.value=draft;input.focus({preventScroll:true});}}
}
function openProgress(){closeModal();nav('tasks');}

function changeProgressPage(value){
 const p=progressPage(state,progressPaging),next=Number(value);
 if(!String(value).trim()||!Number.isInteger(next)||next<1||next>p.pages){toast('请输入1至'+p.pages+'之间的整数页码');$('#progressPageNumber').value=p.page;return;}
 progressPaging.page=next;renderProgress({scrollTop:true});
}

// Opt-in review fixtures use the normal local job lifecycle; never reset user work.
async function addTaskExamples(samples=[['partial-three',10],['all-fail',3],['analysis-fail',3]]){
 samples=samples.filter(([kind])=>!state.productionJobs.some(j=>j.demoExampleKind===kind));
 if(!samples.length){closeModal();nav('tasks');openProgress();return;}
 const template=normalizeCreationConfig(initialState().config);
 if(!canAccessMarket(state,'domestic'))template.source=canAccessMarket(state,'overseas')?{...template.source,market:'overseas'}:{kind:'manual',simulated:true,assetId:'failure-example-source',displayName:'失败处理示例剧目'};
 const version=Date.now(),configs=samples.map(([kind,count],i)=>({kind,config:{...clone(template),count,source:{...clone(template.source),fileVersion:version+i}}}));
 if(configs.reduce((sum,{config})=>sum+estimate(state,config,config.count).total,0)>state.balance){toast('示例积分不足，暂不能添加任务样例');return;}
 const jobs=configs.map(({kind,config})=>{const j=newJob(state,config,kind);j.demoExampleKind=kind;registerDrama(state,config);return j;});
 save();closeModal();nav('tasks');openProgress();
 for(const j of jobs)await runJob(j);
}
function showCapacityDialog(id){
 const j=state.productionJobs.find(j=>j.id===id),p=j?.plan;if(!p||j.stage!=='waiting')return;
 const count=Math.min(p.candidates.length,j.requestedCount);
 modal('可生成数量不足',`<div class="capacity-summary"><h3>计划 ${j.requestedCount} 条，可生成 ${count} 条</h3><p>${esc(p.reason||'所选剧情可用方向有限，请确认实际制作条数。')}</p></div><div class="cost-breakdown"><span>已完成分析</span><strong>${p.analysisCharge} 积分</strong><span>制作 ${count} 条</span><strong>${count*productionRate(j.config)} 积分</strong></div>`,button('稍后处理','close')+button('调整制作','adjust-job','secondary',`data-job="${j.id}"`)+(count?button('生成 '+count+' 条','generate-available','primary',`data-job="${j.id}"`):''));
}
async function prepare(){
 if(busy||submissionJobId)return;const c=clone(state.config),error=sourcePermissionError(state,c)||validate(c);
 if(error){toast(error);return;}if(c.source?.importStatus!=='pending'&&estimate(state,c,c.count).total>state.balance){toast('积分不足，请减少条数或调整时长');return;}
 const previous=clone(state);let j;
 try{j=newJob(state,c,toolsScenario);registerDrama(state,c);persistUI();localStorage.setItem(KEY,JSON.stringify(state));}
 catch{state=previous;toast('任务提交失败，请稍后重试');return;}
 submissionJobId=j.id;
 modal('任务已提交','<div class="submission-message" id="submissionMessage"><span class="submission-icon" aria-hidden="true">✓</span><h3>视频生成中</h3><p>稍后可前往成片管理查看任务进度。</p></div>',button('继续制作','close','secondary')+button('查看任务','submitted-task','primary',`data-job="${esc(j.id)}"`));
 $('#dialog').classList.add('submission-dialog');runJob(j);
}

async function runJob(j){
 if(runningJobs.has(j.id)||!['analyzing','planning'].includes(j.stage))return;
 const token=Symbol(j.id);runningJobs.set(j.id,token);const valid=()=>runningJobs.get(j.id)===token&&state.productionJobs.includes(j)&&['analyzing','planning'].includes(j.stage);
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 try{
  if(sourcePermissionError(state,j.config))throw {kind:'source',message:'所选合集暂无访问权限，请处理片源'};
  try{await assertBgmAvailable(j.config);}catch(e){throw {kind:'config',message:e.message};}
  if(!valid())return;
  if(j.stage==='analyzing'){
   if(importSummary(j.config.source).status==='importing'){
    const due=j.config.source.mockImportDue;
    if(due)await wait(Math.max(0,due-Date.now())+900);
    if(!valid())return;
    const current=findDrama(state,dramaKey(j.config));
    if(!current||importSummary(current.source).status!=='complete')throw {kind:'source',message:'原片导入未完成，请检查剧目管理'};
    j.config.source=clone(current.config.source);
   }
   await wait(1300);if(!valid())return;
   if(['manual','cloud'].includes(j.config.source.kind)&&j.config.source.simulated===false)throw {kind:'source',message:'片源分析暂不可用，请稍后重试'};
   if(j.scenario==='analysis-fail')throw {kind:'timeout',message:'片源分析服务暂时异常'};
   if(sourcePermissionError(state,j.config))throw {kind:'source',message:'合集访问权限已变化'};
   const info=analysisInfo(state,j.config);
   if(!j.analysisSettled){if(state.balance<info.pending.length)throw {kind:'config',message:'当前积分不足，请补充后重新制作'};analyze(state,j.config);ensureContentPool(state,j.config);j.analysisCharge=info.pending.length;j.analysisSettled=true;state.balance-=info.pending.length;if(info.pending.length)state.ledger.unshift({id:j.id+'-analysis',jobId:j.id,batch:j.id,type:'新增剧集分析',points:-info.pending.length,at:new Date().toISOString()});}
   j.analysisResult={raw:JSON.stringify(state.assets[assetKey(j.config)]),sourceKey:assetKey(j.config),start:j.config.start,end:j.config.end};
   if(['analysis-parse','analysis-validation','analysis-invalid'].includes(j.scenario)){if(j.scenario==='analysis-invalid')j.analysisResult.raw='invalid-json';throw {kind:j.scenario==='analysis-parse'?'analysis_parse':'analysis_validation',message:'视频理解结果解析或校验失败'};}
   j.stage='planning';refreshWork();
  }
  await wait(850);if(!valid())return;
  const rule=clone(activeRule(state)),cache=state.assets[assetKey(j.config)],planned=planBatch(j.config,rule,cache);
  const curated=curateCandidates(planned.candidates,j.config,state);planned.candidates=curated.candidates;planned.capacity=curated.candidates.length;planned.excluded+=curated.contentExcluded;
  j.plan={id:'PLAN-'+j.id,config:clone(j.config),rule,...planned,analysisCharge:j.analysisCharge||0,analysisRevision:cache?.revision};state.plan=j.plan;
  if(!planned.capacity){j.failedStage='planning';j.stage='failed';j.failureKind='content';j.error=planned.reason||GENERATION_ERROR;j.completedAt=new Date().toISOString();refreshWork();return;}
  j.stage='waiting';refreshWork();
  await generateJob(j);
 }catch(e){if(valid()){j.failedStage=j.stage;j.stage='failed';j.failureKind=e.kind||'timeout';j.error=e.message||GENERATION_ERROR;j.completedAt=new Date().toISOString();refreshWork();}}
 finally{if(runningJobs.get(j.id)===token)runningJobs.delete(j.id);}
}
function retryTask(id){
 const j=state.productionJobs.find(j=>j.id===id),b=state.batches.find(b=>b.id===j?.batchId);
 if(!editingSessionActive||!j)return;
 try{
  const error=sourcePermissionError(state,j.config);if(error)throw Error(error);
  const scope=beginTaskRetry(state,j,b);refreshWork();
  if(scope.kind==='analysis'){toast('正在重新校验已有分析结果');runSavedValidation(j);}
  else{scope.outputIds.forEach((id,i)=>scheduleGenerated(b,b.outputs.find(o=>o.id===id),i,'normal'));toast('已提交 '+scope.outputIds.length+' 条失败素材重试');}
 }catch(e){toast(e.message);}
}
async function runSavedValidation(j){
 if(j.stage!=='validating'||runningJobs.has(j.id))return;
 const token=Symbol(j.id);runningJobs.set(j.id,token);
 try{
  await new Promise(resolve=>setTimeout(resolve,1600));
  if(runningJobs.get(j.id)!==token||j.stage!=='validating'||!state.productionJobs.includes(j))return;
  const result=validateSavedAnalysis(j),cache=state.assets[assetKey(j.config)];
  if(!cache||cache.revision!==result.revision)throw Error('原片分析版本已变化');
  state.assets[assetKey(j.config)]=result; // Reuse persisted analysis only. Never call analyze here.
  j.stage='planning';j.scenario='normal';delete j.failureKind;refreshWork();
 }catch(e){j.stage='failed';j.error=e.message;j.failureKind='analysis_validation';j.completedAt=new Date().toISOString();refreshWork();toast('校验未通过，可重试；若仍失败，请联系技术排查');}
 finally{if(runningJobs.get(j.id)===token)runningJobs.delete(j.id);}
 if(j.stage==='planning')runJob(j);
}
async function generateJob(j){
 if(j.stage!=='waiting'||j.batchId||startingBatches.has(j.id))return;startingBatches.add(j.id);
 try{
  const error=sourcePermissionError(state,j.config)||validate(j.config);if(error)throw Error(error);
  await assertBgmAvailable(j.config);if(j.stage!=='waiting'||!state.productionJobs.includes(j))return;
  const p=j.plan;if(!p||state.assets[assetKey(j.config)]?.revision!==p.analysisRevision)throw Error('片源分析已变化，请调整后重新制作');
  const plans=p.candidates.slice(0,j.requestedCount);const b=createBatch(state,j.config,plans,j.analysisCharge||0);
  b.rule=clone(p.rule);b.planSession=p.id;b.productionJobId=j.id;b.taskVersion=j.taskVersion;b.parentTask=j.replacement||null;nameBatch(b,j.number,j.created);j.batchId=b.id;j.stage='generating';currentBatch=b.id;
  refreshWork();b.outputs.forEach((o,i)=>scheduleGenerated(b,o,i,j.scenario));
 }catch(e){j.failedStage='generating';j.stage='failed';j.failureKind='config';j.error=e.message;j.completedAt=new Date().toISOString();refreshWork();}
 finally{startingBatches.delete(j.id);}
}
let failureSelection=new Set(),failureRegenerationBusy=false,failureRegenerationError='';
function showTaskFailures(id){
 const entry=taskEntries(state).find(j=>j.id===id),b=state.batches.find(b=>b.id===entry?.batchId);if(!b)return;
 if(!$('#dialog').open||$('#dialog').dataset.failureJob!==id){failureSelection=new Set();failureRegenerationError='';}
 const items=[...failedOutputs(b),...b.outputs.filter(failedRevision)],eligible=items.filter(o=>regenerationAvailability(o).kind&&!syncUI.locked(b,o));
 const allowed=new Set(eligible.map(o=>o.id));failureSelection=new Set([...failureSelection].filter(id=>allowed.has(id)));
 const count=failureSelection.size,all=eligible.length>0&&count===eligible.length;
 const rows=items.map(o=>{const availability=regenerationAvailability(o),kind=failedRevision(o),reason=kind?(kind==='narration'?'文案应用失败':'重做失败'):failureOf(o).label,extra=availability.reason||(!allowed.has(o.id)?'当前素材同步中':'');return `<tr><td class="failure-select"><input type="checkbox" data-failure-output="${esc(o.id)}" aria-label="选择失败素材 ${esc(o.title)}" ${failureSelection.has(o.id)?'checked':''} ${!allowed.has(o.id)||failureRegenerationBusy?'disabled':''}></td><td class="failure-name">${esc(o.title)}</td><td>${esc(reason)}${extra?`<small>${esc(extra)}</small>`:''}</td></tr>`;}).join('');
 modal('处理失败',`<div class="failure-table table-wrap" id="failureItems"><table><thead><tr><th class="failure-select"><input id="failureSelectAll" type="checkbox" aria-label="全选可重新生成的失败素材" ${all?'checked':''} ${!eligible.length||failureRegenerationBusy?'disabled':''}></th><th>素材名称</th><th>失败原因</th></tr></thead><tbody>${rows||'<tr><td colspan="3">暂无失败素材</td></tr>'}</tbody></table></div>${failureRegenerationError?`<p class="error-text" role="alert">${esc(failureRegenerationError)}</p>`:''}`,button('返回制作进度','production-progress')+button(failureRegenerationBusy?'提交中…':'重新生成'+(count?'（'+count+'）':''),'regenerate-failures','primary',`data-batch="${b.id}" ${!count||failureRegenerationBusy?'disabled':''}`));
 $('#dialog').classList.add('failure-dialog');$('#dialog').dataset.failureJob=id;$('#failureSelectAll').indeterminate=count>0&&!all;
}
async function regenerateFailures(b){
 if(failureRegenerationBusy||!failureSelection.size)return;
 const ids=[...failureSelection],jobId=$('#dialog').dataset.failureJob;failureRegenerationBusy=true;failureRegenerationError='';showTaskFailures(jobId);
 try{
  const error=sourcePermissionError(state,b.config);if(error)throw Error(error);await assertBgmAvailable(b.config);
  const jobs=prepareFailedRegeneration(state,b,ids,o=>syncUI.locked(b,o));
  for(const [i,id] of jobs.initial.entries())scheduleGenerated(b,b.outputs.find(o=>o.id===id),i,'normal');
  for(const job of jobs.revisions){const o=b.outputs.find(o=>o.id===job.id);afterWork(()=>{if(o.reworkPending?.operationId!==job.operationId)return;const success=!sourcePermissionError(state,b.config),result=job.kind==='narration'?finishNarrationUpdate(state,b,o,success):finishRework(state,b,o,success);recordFeedback(state,b,o,{kind:job.kind==='narration'?'narration-update-result':'rework-result',reason:result.success?'重新生成完成':'重新生成失败',operationId:job.operationId});refreshWork();},1300);}
  failureSelection.clear();closeModal();refreshWork();openProgress();toast('已提交 '+ids.length+' 条素材重新生成');
 }catch(e){failureRegenerationError=e.message;toast(e.message);}
 finally{failureRegenerationBusy=false;if($('#dialog').open&&$('#dialog').dataset.failureJob===jobId)showTaskFailures(jobId);}
}
document.addEventListener('change',e=>{
 const el=e.target,id=$('#dialog').dataset.failureJob;if(!id||failureRegenerationBusy)return;
 if(el.dataset.failureOutput){el.checked?failureSelection.add(el.dataset.failureOutput):failureSelection.delete(el.dataset.failureOutput);showTaskFailures(id);}
 else if(el.id==='failureSelectAll'){const entry=taskEntries(state).find(j=>j.id===id),b=state.batches.find(b=>b.id===entry?.batchId);failureSelection=new Set(el.checked?b.outputs.filter(o=>regenerationAvailability(o).kind&&!syncUI.locked(b,o)).map(o=>o.id):[]);showTaskFailures(id);}
});
function showFailure(b,o){const f=failureOf(o);modal('制作失败',`<div id="failureSummary"><h3>${esc(o.title)}</h3><p class="error-text">${esc(f.label)}</p><p>${esc(f.help)}</p>${o.failure?.episode?`<p>问题剧集：第 ${o.failure.episode} 集</p>`:''}<p class="helper">本条未成功制作的积分已释放；其他素材保留。</p></div>`,button('关闭','close')+(o.replacementJobId?button('查看重做任务','view-job','primary',`data-job="${o.replacementJobId}"`):button(f.action,f.retryable?'retry-output':'adjust-failed','primary',`data-batch="${b.id}" data-id="${o.id}"`)));}
function showJobFailure(j){if(!j)return;const f=FAILURE_TYPES[j.failureKind]||FAILURE_TYPES.timeout;modal('制作失败',`<div id="failureSummary"><h3>${esc(j.sourceTitle)}</h3><p>任务 ${esc(j.number)} · 失败阶段：${esc(JOB_STAGES[j.failedStage||'analyzing'])}</p><p class="error-text">${esc(j.error)}</p><p>${esc(f.help)}</p><p class="helper">尚未创建成片。已完成的有效分析保留。</p></div>`,button('关闭','close')+button(f.retryable?'重试':f.action,f.retryable?'retry-job':'adjust-job','primary',`data-job="${j.id}"`));}
function adjustFailed(b,ids){const items=b.outputs.filter(o=>ids.includes(o.id)&&o.status==='failed');if(!items.length)return;replacementContext={batchId:b.id,outputIds:items.map(o=>o.id),count:items.length};state.config=normalizeCreationConfig(clone(b.config));state.config.count=items.length;const d=findDrama(state,dramaKey(b.config));if(d)state.config.source=clone(d.config.source);closeModal();save();nav('create');}
async function retryOutputs(b,items){
 if(!items.length||items.some(o=>o.status!=='failed'||o.cancelled||o.replacementJobId||!failureOf(o).retryable)){toast('包含需先处理片源或配置的素材，请分别处理');return;}
 if(items.some(o=>o.retryStarting))return;items.forEach(o=>o.retryStarting=true);
 try{const error=sourcePermissionError(state,b.config);if(error)throw Error(error);await assertBgmAvailable(b.config);
  if(items.some(o=>o.status!=='failed'||o.cancelled||o.replacementJobId))throw Error('素材状态已变化，请重新选择');
  const amount=items.length*b.cost.unit;if(state.balance<amount)throw Error('积分不足，请减少重试数量');
  state.balance-=amount;b.cost.frozen+=amount;b.status='running';const owner=state.productionJobs.find(j=>j.batchId===b.id);if(owner)delete owner.dismissed;state.ledger.unshift({id:'RE-'+crypto.randomUUID(),batch:b.id,type:'失败项重试冻结',points:-amount,at:new Date().toISOString()});
  for(const [index,o] of items.entries()){(o.failureHistory||=[]).push({failure:clone(o.failure||{}),at:new Date().toISOString(),attempt:o.attempt});o.status='pending';delete o.failure;delete o.failureDismissed;scheduleGenerated(b,o,index,'normal');}
  closeModal();clearTaskSelection();refreshWork();openProgress();toast('正在重试 '+items.length+' 条素材');
 }catch(e){toast(e.message);}finally{items.forEach(o=>delete o.retryStarting);}
}
function exportDramaList(){const rows=filteredDramas(state,libraryFilters),cell=x=>'"'+String(x??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const text='\ufeff'+[['剧目名称','来源','集数','导入状态','成功导入数','制作任务','成片数量'],...rows.map(d=>[d.title,sourceName(d),d.totalEpisodes??'—',importSummary(d.source).label,importSummary(d.source).count,d.taskCount,d.generatedCount])].map(row=>row.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='剧目列表.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已导出 '+rows.length+' 部剧目');}

function downloadMaterials(items){if(!items.length)return;if(items.some(o=>!o.mediaUrl)){toast('成片下载文件尚未就绪');return;}for(const o of items){const a=document.createElement('a');a.href=o.mediaUrl;a.download=o.title+'.mp4';a.click();}}
function retime(o){let t=0;for(const s of o.segments){const d=s.end-s.start;s.start=Math.round(t*100)/100;t+=d;s.end=Math.round(t*100)/100;}o.duration=Math.round(t*100)/100;}
function locate(t){const o=output();if(!o)return;playerAt=t;const s=o.segments.find(x=>t>=x.start&&t<x.end)||o.segments.at(-1);if($('#screenText'))$('#screenText').textContent=s.text;if($('#scrubber'))$('#scrubber').value=t;if($('#playerTime'))$('#playerTime').textContent=fmt(t)+' / '+fmt(o.duration);}
function exportPlans(outputs,b=batch()){if(outputs.some(o=>o.narrationDraft)){toast('请先应用或放弃文案修改，再导出');return;}if(!outputs.length){toast('请先选择素材');return;}const blob=new Blob([JSON.stringify({demo:true,notice:'故事板方案，非真实视频',source:b.config.source,config:b.config,rule:b.rule,analysis:b.analysisSnapshot,outputs},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mixed-cut-v7-'+b.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已导出包含来源与版本的剪辑方案');}

function refreshDurationInputs(skipInput=null){
 const c=state.config,[min,max]=durationRange(c),box=$('#durationConfig');if(!box)return;
 for(const side of ['Min','Max']){
  const seconds=c['duration'+side+'Seconds'],unit=c['duration'+side+'Unit']||'m',input=$('#duration'+side),slider=$('#duration'+side+'Slider');
  if(input&&input!==skipInput)input.value=durationDisplay(seconds,unit);
  if(slider)slider.value=Number.isFinite(seconds)?Math.max(10,Math.min(1200,seconds)):10;
 }
 const track=box.querySelector('.duration-slider');track.style.setProperty('--range-start',((Number(min)||10)-10)/1190*100+'%');track.style.setProperty('--range-end',((Number(max)||10)-10)/1190*100+'%');
 const error=durationError(c);$('#durationError').textContent=error;$('#durationError').hidden=!error;
 box.querySelectorAll('[data-action="duration-preset"]').forEach(b=>b.classList.toggle('active',Number(b.dataset.min)===min&&Number(b.dataset.max)===max));
 refreshCreationPreview();
}
document.addEventListener('input',e=>{
 const el=e.target,key=el.dataset.titleStyle,colorKey=el.dataset.titleColor;
 if(colorKey&&['titleColor','titleStrokeColor'].includes(colorKey)&&TITLE_COLORS.some(p=>p.value===el.value)){state.config[colorKey]=el.value;save();refreshCreationPreview();return;}
 if(!key||!TITLE_CONTROLS.some(p=>p.key===key))return;
 const control=TITLE_CONTROLS.find(p=>p.key===key);state.config[key]=el.value===''?null:Number(el.value);
 const error=titleControlError(state.config,key);
 document.querySelectorAll(`[data-title-style="${key}"]`).forEach(peer=>{if(peer!==el)peer.value=peer.type==='range'&&error?control.value:(state.config[key]??'');peer.setAttribute('aria-invalid',String(Boolean(error)));});
 const hint=document.getElementById(key+'Error');if(hint){hint.textContent=error||'';hint.hidden=!error;}
 save();refreshCreationPreview();
});
document.addEventListener('input',e=>{if(e.target.hasAttribute('data-bgm-volume')){const el=e.target;state.config.bgmVolume=el.value===''?null:Number(el.value);const error=bgmVolumeError(state.config);document.querySelectorAll('[data-bgm-volume]').forEach(peer=>{if(peer!==el)peer.value=state.config.bgmVolume??'';peer.setAttribute('aria-invalid',String(Boolean(error)));});const hint=$('#bgmVolumeError');if(hint){hint.textContent=error||'';hint.hidden=!error;}save();refreshCreationPreview();return;}
 const el=e.target,side=el.dataset.durationBound||el.dataset.durationSlider;if(!side)return;
 let value=el.dataset.durationSlider?Number(el.value):durationInput(el.value,state.config['duration'+side+'Unit']);
 if(el.dataset.durationSlider){const other=state.config[side==='Min'?'durationMaxSeconds':'durationMinSeconds'];if(Number.isFinite(other))value=side==='Min'?Math.min(value,other):Math.max(value,other);}
 state.config['duration'+side+'Seconds']=value;save();refreshDurationInputs(el);
});
document.addEventListener('change',e=>{const side=e.target.dataset.durationUnit;if(!side)return;state.config['duration'+side+'Unit']=e.target.value;const input=$('#duration'+side);input.min=e.target.value==='s'?'10':'0.167';input.max=e.target.value==='s'?'1200':'20';input.step=e.target.value==='s'?'1':'any';save();refreshDurationInputs();});

document.addEventListener('click',async e=>{const el=e.target.closest('button,[data-action]');if(!el||el.disabled)return;if(el.dataset.nav){nav(el.dataset.nav);return;}const a=el.dataset.action;if(!a)return;if(a==='duration-preset'){state.config.durationMinSeconds=Number(el.dataset.min);state.config.durationMaxSeconds=Number(el.dataset.max);state.config.durationMinUnit=Number(el.dataset.min)<60?'s':'m';state.config.durationMaxUnit=Number(el.dataset.max)<60?'s':'m';save();render();return;}if(a==='duration-step'){const side=el.dataset.side,key='duration'+side+'Seconds',unit=state.config['duration'+side+'Unit'],current=state.config[key];state.config[key]=Math.max(10,Math.min(1200,(Number.isFinite(current)?current:side==='Min'?180:300)+Number(el.dataset.step)*(unit==='s'?1:60)));save();refreshDurationInputs();return;}const contextBatch=el.dataset.batch;if(contextBatch&&!['review-related','return-related','submit-narration-update','apply-issue','apply-full-issue'].includes(a)){if(!state.batches.some(b=>b.id===contextBatch)){toast('制作任务已失效，请刷新后重试');return;}currentBatch=contextBatch;}if(a.startsWith('cloud-')){await cloudImport.handle(a,el);return;}if(a.startsWith('local-')){await localUpload.handle(a,el);return;}if(a.startsWith('bgm-')&&a!=='bgm-picker'){await bgmUI.handle(a,el);return;}if(view==='review'&&output()?.narrationDraft&&['confirm-output','confirm-next','confirm-sync','report-issue','repair','rework'].includes(a)){toast('请先应用或放弃文案修改');reviewTab='narration';render();return;}if(a.startsWith('sync-')||['confirm-sync','confirm-output','confirm-selected','confirm-row','apply-confirm','retry-job','retry-output','retry-selected','regenerate-failures','handle-failures','failure-detail','job-error','adjust-failed','adjust-job'].includes(a)){return;}if(a.startsWith('sync-')){if(el.dataset.batch)currentBatch=el.dataset.batch;syncUI.handle(a,el);return;}if(['save-narration','save-full-narration','apply-narration','report-issue','repair','confirm-output','confirm-next','confirm-sync'].includes(a)&&batch()&&output()&&(syncUI.locked(batch(),output())||output().repairing||output().reworkPending)){toast('当前版本同步中或待核实，请先查询同步结果');return;}
 switch(a){
 case 'submitted-task':openTask(el.dataset.job);break;
 case 'task-detail':openTask(el.dataset.job);break;
 case 'back-task-detail':openTask(selectedTaskId);break;
 case 'task-page':taskPaging.page=Number(el.dataset.page);save();render();break;
 case 'production-progress':openProgress({preservePage:el.textContent.trim()==='返回制作进度'});break;
 case 'progress-page':changeProgressPage(el.dataset.page);break;
 case 'failure-examples':await addTaskExamples();break;
 case 'progress-example':await addTaskExamples([['progress-hold',10]]);break;
 case 'finish-progress-example':{for(const j of state.productionJobs.filter(j=>j.demoExampleKind==='progress-hold')){const b=state.batches.find(b=>b.id===j.batchId);if(!b)continue;j.scenario='normal';for(const [i,o] of b.outputs.entries())if(o.status==='pending'&&o.demoHeld){delete o.demoHeld;scheduleGenerated(b,o,i,'normal');}}closeModal();refreshWork();openProgress();break;}
 case 'retry-task':retryTask(el.dataset.job);break;
 case 'handle-failures':showTaskFailures(el.dataset.job);break;
 case 'view-job-progress':openProgress({jobId:el.dataset.job});document.querySelector('[data-job-id="'+el.dataset.job+'"]')?.scrollIntoView({block:'center'});break;
 case 'regenerate-failures':{const b=batch();if(b)await regenerateFailures(b);break;}
 case 'retry-revision':{const b=batch(),o=b?.outputs.find(o=>o.id===el.dataset.id);if(!o)return;const kind=failedRevision(o);closeModal();currentBatch=b.id;currentOutput=o.id;nav('review');if(kind==='narration'){reviewTab='narration';render();openNarrationApply();}else openRework(b.id,o.id);break;}
 case 'view-job':focusTask(el.dataset.job);break;
 case 'job-capacity':showCapacityDialog(el.dataset.job);break;
 case 'job-error':showJobFailure(state.productionJobs.find(j=>j.id===el.dataset.job));break;
 case 'failure-detail':{const b=batch(),o=b?.outputs.find(o=>o.id===el.dataset.id);if(o)showFailure(b,o);break;}
 case 'retry-output':{const b=batch(),o=b?.outputs.find(o=>o.id===el.dataset.id);if(o)await retryOutputs(b,[o]);break;}
 case 'retry-selected':{const b=batch();if(b)await retryOutputs(b,selectedVisibleMaterials());break;}
 case 'clear-selection':clearTaskSelection();render();break;
 case 'retry-job':{const j=state.productionJobs.find(j=>j.id===el.dataset.job);if(!j||j.stage!=='failed'||j.batchId)return;delete j.error;j.stage=j.analysisSettled?'planning':'analyzing';j.scenario='normal';delete j.dismissed;closeModal();refreshWork();openProgress();runJob(j);break;}
 case 'adjust-failed':{const b=batch();if(b)adjustFailed(b,[el.dataset.id]);break;}
 case 'adjust-job':{const j=state.productionJobs.find(j=>j.id===el.dataset.job);if(!j)return;replacementContext={jobId:j.id,count:j.requestedCount};state.config=normalizeCreationConfig(clone(j.config));closeModal();save();nav('create');break;}
 case 'cancel-replacement':replacementContext=null;render();break;
 case 'cancel-job-prompt':case 'dismiss-job-prompt':{const j=taskEntries(state).find(j=>j.id===el.dataset.job);if(!j)return;if(a==='cancel-job-prompt'&&(j.running||j.stage!=='waiting')){toast('制作中的任务不支持取消');return;}modal(a==='cancel-job-prompt'?'取消待确认任务':'不再处理此任务',`<p>${a==='cancel-job-prompt'?'取消此待确认任务，已完成的有效分析保留。':'保留失败记录，将任务移出待处理列表。'}</p>`,button('返回','close')+button('确认','resolve-job','primary',`data-job="${j.id}" data-dismiss="${a==='dismiss-job-prompt'}"`));break;}
 case 'resolve-job':{const entry=taskEntries(state).find(j=>j.id===el.dataset.job);if(!entry)return;const j=state.productionJobs.find(j=>j.id===entry.id),b=state.batches.find(b=>b.id===entry.batchId),dismiss=el.dataset.dismiss==='true';if(!dismiss&&(entry.running||entry.stage!=='waiting')){toast('任务状态已变化，无法取消');return;}if(j){if(dismiss)j.dismissed=true;else if(!j.batchId){j.stage='cancelled';runningJobs.delete(j.id);}}
  for(const o of b?.outputs||[]){if(dismiss&&o.status==='failed')o.failureDismissed=true;if(dismiss&&failedRevision(o))o.dismissedRevisionFailures=[...(o.dismissedRevisionFailures||[]),o.lastReworkResult?.operationId,o.lastNarrationResult?.operationId].filter(Boolean);if(!dismiss&&o.status==='pending'){o.attempt=(o.attempt||0)+1;settleOutput(state,b,o,false);o.cancelled=true;}}
  closeModal();refreshWork();toast(dismiss?'已移出待处理任务':'待确认任务已取消');break;}
 case 'download-one':{const o=batch()?.outputs.find(o=>o.id===el.dataset.id);if(o)downloadMaterials([o]);break;}
 case 'download-selected':downloadMaterials(selectedVisibleMaterials());break;
 case 'close':closeModal();break;
 case 'create':case 'assets':case 'tasks':closeModal();nav(a);break;
 case 'mode':{const c=state.config;if(isFullNarration(c))c.fullDuration=c.duration;else c.mixedDuration=c.duration;c.mode=el.dataset.value;c.duration=isFullNarration(c)?c.fullDuration||'':c.mixedDuration||'3-5';state.config=normalizeCreationConfig(c);save();render();break;}
 case 'narration-structure':{const c=state.config;if(c.narrationStructure==='full')c.fullDuration=c.duration;else c.mixedDuration=c.duration;c.narrationStructure=el.dataset.value;c.duration=isFullNarration(c)?c.fullDuration||'':c.mixedDuration||'3-5';state.config=normalizeCreationConfig(c);save();render();break;}
 case 'range':state.config.start=1;state.config.end=Number(el.dataset.value);save();render();break;
 case 'speed':state.config.speed=Number(el.dataset.value);save();render();break;
 case 'count':state.config.count=Number(el.dataset.value);save();render();break;
 case 'count-plus':case 'count-minus':state.config.count=Math.max(1,Math.min(20,(Number(state.config.count)||0)+(a==='count-plus'?1:-1)));save();render();break;
 case 'direct':prepare();break;
 case 'generate-available':{const j=state.productionJobs.find(j=>j.id===el.dataset.job);closeModal();if(j)await generateJob(j);break;}
 case 'new-drama':case 'import-collection':case 'source-picker':cloudImport.open({allowLibrary:view==='create'});break;

 case 'retry-import-drama':retryImport(el.dataset.id);break;
 case 'delete-import-drama':confirmDeleteImport(el.dataset.id);break;
 case 'confirm-delete-import':{
  try{const next={...state,config:clone(state.config),dramas:clone(state.dramas||{}),deletedDramaIds:[...(state.deletedDramaIds||[])]};removeFailedDrama(next,el.dataset.id);localStorage.setItem(KEY,JSON.stringify(next));state=next;closeModal();save();render();toast('已删除失败剧目');}catch(error){toast(error.message||'删除失败，请重试');}break;
 }
 case 'open-drama':openDramaOutputs(el.dataset.id);break;
 case 'rename-drama':openRenameDrama(el.dataset.id);break;
 case 'save-drama-name':{const name=$('#dramaRename').value.trim();if(!name||Array.from(name).length>80){toast('请输入1–80字的剧目名称');return;}const renamed=renameDrama(state,el.dataset.id,name);if(!renamed){toast('剧目已失效，请重新选择');return;}if(dramaKey(state.config)===el.dataset.id)state.config.source.displayName=name;save();closeModal();render();toast('剧目名称已更新');break;}
 case 'make-drama':makeDrama(el.dataset.id);break;
 case 'current-drama':if(isConfiguredSource(state.config)&&!sourcePermissionError(state,state.config))openDramaOutputs(dramaKey(state.config));break;
 case 'query-dramas':libraryFilters={...libraryDraft};save();render();break;
 case 'export-dramas':exportDramaList();break;
 case 'clear-drama-filters':libraryFilters=defaultLibraryFilters();libraryDraft={...libraryFilters};save();render();break;
 case 'query-tasks':taskPaging.page=1;taskFilters={...taskDraft};clearTaskSelection();save();render();break;
 case 'clear-task-filters':taskPaging.page=1;taskFilters=defaultTaskFilters();taskDraft={...taskFilters};clearTaskSelection();save();render();break;
 case 'clear-task-scope':taskFilters.task='all';taskDraft.task='all';clearTaskSelection();save();render();break;
 case 'batch-drama':if(batch())openDramaOutputs(dramaKey(batch().config));break;
 case 'review-item':startReview(el.dataset.batch,el.dataset.id);break;
 case 'picker-market':if(!picker||!['domestic','overseas'].includes(el.dataset.value))return;picker.market=el.dataset.value;picker.id=null;picker.query='';renderPicker();break;
 case 'picker-collection':if(!picker||!canAccessMarket(state,picker.market)||!getCollection(picker.market,el.dataset.id)){toast('合集不可用，请重新选择');return;}picker.id=el.dataset.id;picker.start=1;picker.end=Math.min(30,getCollection(picker.market,picker.id).totalEpisodes);renderPicker();break;
 case 'picker-range':if(!picker||!canAccessMarket(state,picker.market))return;picker.start=1;picker.end=Number(el.dataset.value);renderPicker();break;
 case 'apply-source':{if(!picker||!canAccessMarket(state,picker.market)){toast('合集权限已变化，请重新选择');return;}const c={...state.config,source:{kind:'green',market:picker.market,collectionId:picker.id,fileVersion:1},start:Number($('#pickerStart').value),end:Number($('#pickerEnd').value)};const err=validateSourceSelection(c);if(err){toast(err);return;}registerDrama(state,state.config,{touch:false});state.config=c;state.plan=null;registerDrama(state,c);localVideo=null;save();closeModal();if(view==='assets')nav('assets');else render();break;}
 case 'upload':localUpload.open();break;
 case 'append-local-source':localUpload.openAppend(state.config.source);break;
 case 'manual-source':registerDrama(state,state.config,{touch:false});state.config.source={kind:'manual',simulated:true,fileVersion:1,assetId:'manual-'+crypto.randomUUID()};state.config.start=1;state.config.end=30;localVideo=null;save();closeModal();nav('create');break;
 case 'bgm-picker':openBgmPicker();break;
 case 'review':startReview(currentBatch,el.dataset.id);break;
 case 'back-tasks':closeModal();nav('tasks');break;
 case 'select-all':{const rows=filteredMaterials(),id=selectionBatchId||rows.find(({b,o})=>canSelectMaterial(b,o))?.b.id;if(!id)return;const selected=selectTaskContext(id),items=rows.filter(({b,o})=>b.id===id&&canSelectMaterial(b,o));taskSelections.set(id,items.length&&items.every(({o})=>selected.has(o.id))?new Set():new Set(items.map(({o})=>o.id)));render();break;}
 case 'select-syncable':{const rows=filteredMaterials(),id=selectionBatchId||rows.find(({b,o})=>syncUI.canSync(b,o))?.b.id;if(!id)return;selectTaskContext(id);taskSelections.set(id,new Set(rows.filter(({b,o})=>b.id===id&&syncUI.canSync(b,o)).map(({o})=>o.id)));render();break;}
 case 'review-prev':moveReview(-1);break;
 case 'review-next':moveReview(1);break;
 case 'review-defer':if(output()){output().deferredAt=new Date().toISOString();save();}moveReview(1);break;
 case 'review-remaining':{const b=batch(),ids=reviewQueue.ids.filter(id=>{const o=b.outputs.find(o=>o.id===id);return o&&!(o.confirmed&&o.confirmedVersion===o.contentVersion)&&reviewable(o);});closeModal();if(ids.length)startReview(b.id,ids[0],ids);else nav('tasks');break;}
 case 'confirm-next':if(output().confirmed&&output().confirmedVersion===output().contentVersion)moveReview(1);else confirmModal([output()],'next');break;
 case 'confirm-sync':confirmModal([output()],'sync');break;
 case 'quality-locate':stopPlayer();locate(Number(el.dataset.at));break;
 case 'review-related':{const b=batch(),o=output();if(!b||!o)return;relatedOrigin||={batchId:b.id,outputId:o.id,queue:clone(reviewQueue),playerAt,reviewTab};startReview(el.dataset.batch,el.dataset.id,null,{related:true});break;}
 case 'return-related':{const origin=relatedOrigin,b=state.batches.find(b=>b.id===origin?.batchId),o=b?.outputs.find(o=>o.id===origin?.outputId);if(!o||!reviewable(o)){toast('原素材正在处理，请稍后返回');return;}currentBatch=b.id;currentOutput=o.id;reviewQueue=origin.queue;reviewTab=origin.reviewTab;relatedOrigin=null;nav('review');locate(Math.min(origin.playerAt,o.duration));break;}
 case 'rework':toast('本版仅记录反馈，请下载后调整或新建制作任务');break;
 case 'legacy-rework':openRework(el.dataset.batch||currentBatch,el.dataset.id||currentOutput,{kind:el.dataset.kind,direction:el.dataset.direction,reason:el.dataset.reason,preferenceId:el.dataset.preference});break;
 case 'rework-kind':reworkDraft.kind=el.dataset.value;showRework();break;
 case 'submit-rework':submitRework();break;
 case 'confirm-output':{const o=output();if(o.confirmed){o.confirmed=false;o.confirmedVersion=null;save();render();}else confirmModal([o]);break;}
 case 'confirm-row':{const b=batch(),o=b?.outputs.find(o=>o.id===el.dataset.id);if(!o)return;confirmModal([o]);break;}
 case 'confirm-selected':{const b=state.batches.find(b=>b.id===selectionBatchId);if(!b)return;currentBatch=b.id;confirmModal(selectedVisibleMaterials());break;}
 case 'apply-confirm':{if(!$('#confirmCheck').checked){toast('请先确认检查完成');return;}const versions=JSON.parse(el.dataset.versions),items=versions.map(v=>batch().outputs.find(o=>o.id===v.id));if(items.some((o,i)=>!o||o.status!=='ready'||!reviewable(o)||o.narrationDraft||o.contentVersion!==versions[i].version||syncUI.locked(batch(),o))){toast('素材状态已变化，请重新检查');return;}items.forEach(o=>{recordFeedback(state,batch(),o,{kind:'acceptance',reason:'人工确认可用'});o.confirmed=true;o.confirmedVersion=o.contentVersion;o.confirmedAt=new Date().toISOString();delete o.deferredAt;});const follow=confirmFollowup;confirmFollowup=null;save();closeModal();render();if(follow==='next')moveReview(1);else if(follow==='sync')syncUI.open(batch(),items);else toast('当前版本已确认，可同步到素材管理');break;}
 case 'discard-narration':{const o=output();if(!o||o.reworkPending||o.repairing||syncUI.locked(batch(),o))return;reviewTab='narration';delete o.narrationDraft;delete o.narrationSavedDraft;delete o.narrationDraftSavedAt;save();render();toast('已恢复当前成片文案');break;}
 case 'narration-locate':stopPlayer();locate(Number(el.dataset.at));break;
 case 'play':if(playerTimer){stopPlayer();el.textContent='▶';}else{if(playerAt>=output().duration)locate(0);el.textContent='Ⅱ';playerTimer=setInterval(()=>{if(playerAt>=output().duration){stopPlayer();return;}locate(Math.min(playerAt+1,output().duration));},1000);}break;
 case 'save-full-narration':case 'save-narration':saveNarrationDraft();break;
 case 'apply-narration':openNarrationApply();break;
 case 'submit-narration-update':submitNarrationUpdate();break;
 case 'speak':{const o=output();if(!o)return;const texts=o.narrationDraft||(isFullNarration(batch().config)?o.segments.filter(s=>s.type==='narration').map(s=>s.text):[o.narrationText||'']);if(!texts.length||texts.some(text=>!String(text).trim())){toast('请填写完整解说文案后试听');return;}if(!window.speechSynthesis){toast('当前浏览器不支持试听');return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(texts.map(text=>String(text).trim()).join('\n\n'));utterance.rate=Number(normalizeCreationConfig(batch().config).narrationSpeed||1);utterance.lang=batch().config.language==='en'?'en-US':'zh-CN';speechSynthesis.speak(utterance);toast('浏览器语音试听');break;}
 case 'report-issue':{stopPlayer();const b=batch(),o=output();if(!o||!reviewable(o)||syncUI.locked(b,o))return;const full=isFullNarration(b.config);feedbackContext={batchId:b.id,outputId:o.id,version:o.contentVersion};modal(full?'记录全解说问题':'记录当前成片的问题',feedbackForm(b.config,o,playerAt,uiHelpers),button('取消','close')+button('记录问题',full?'apply-full-issue':'apply-issue','primary',`data-batch="${esc(b.id)}" data-id="${esc(o.id)}" data-version="${o.contentVersion}"`));break;}
 case 'issue-scope':{const all=el.dataset.value==='all';$$('[data-action="issue-scope"]').forEach(b=>{const active=b===el;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('#issueTimeRange').hidden=all;$$('#issueTimeRange input').forEach(input=>{input.disabled=all;if(input.id.startsWith('issueStart')){input.required=!all;input.setAttribute('aria-required',String(!all));}});break;}
 case 'apply-full-issue':case 'apply-issue':{try{const d=feedbackContext,b=state.batches.find(b=>b.id===d?.batchId),o=b?.outputs.find(o=>o.id===d?.outputId);if(!o||currentBatch!==d.batchId||currentOutput!==d.outputId||o.contentVersion!==d.version||!reviewable(o)||syncUI.locked(b,o)||o.narrationDraft){toast('素材状态已变化，请重新打开问题反馈');return;}const scope=$('[data-action="issue-scope"].active').dataset.value,range=feedbackRange({scope,start:scope==='all'?0:readFeedbackTime(document,'issueStart','开始时间',{required:true}),end:scope==='all'?'':readFeedbackTime(document,'issueEnd','结束时间')},o.duration),item=recordOutputIssue(o,b.config,$('#issueType').value,range,$('#issueDetail').value);recordFeedback(state,b,o,{kind:item.category==='quality'?'quality':'creative-preference',reason:item.label,...range,detail:item.detail});save();closeModal();render();}catch(error){toast(error.message);}break;}
 case 'repair':{const b=batch(),o=output();if(sourcePermissionError(state,b.config)){toast(sourcePermissionError(state,b.config));return;}const i=Number(el.dataset.index),issue=o.issues[i];if(o.repairing||o.reworkPending||!issue)return;o.repairing=true;save();render();afterWork(()=>{if(!o.repairing||sourcePermissionError(state,b.config)){o.repairing=false;save();render();return;}o.issues=o.issues.filter(x=>x!==issue);o.repairing=false;o.status=o.issues.length?'issue':'ready';revise(o,'局部修复：'+issue.label);o.quality={status:o.issues.length?'attention':'passed',repaired:true,checkedAt:new Date().toISOString()};recordFeedback(state,b,o,{kind:'remedy',reason:'局部修复完成',at:issue.at,endAt:issue.endAt??null,scope:issue.scope||'segment',detail:issue.label});save();if(['review','assets','tasks'].includes(view))render();toast('局部修复完成，未新增扣费；请重新检查');},900);break;}
 case 'export-selected':exportPlans(selectedVisibleMaterials());break;
 case 'new-source-version':closeModal();state.config.source.fileVersion=(state.config.source.fileVersion||1)+1;save();render();toast('已切换新的示例原片版本，需要重新分析');break;
 case 'demo-tools':modal('演示设置',`<div class="list-row"><div><b>制作中样例</b><p>3条成功、7条制作中；保持进度供评审。</p></div><div class="actions">${button(state.productionJobs.some(j=>j.demoExampleKind==='progress-hold')?'查看样例':'添加样例','progress-example','secondary')}${state.batches.some(b=>b.outputs.some(o=>o.status==='pending'&&o.demoHeld))?button('完成样例','finish-progress-example','secondary'):''}</div></div><div class="list-row"><div><b>制作失败样例</b><p>部分失败、全部失败、分析失败；使用示例片源与积分。</p></div>${button(state.productionJobs.some(j=>['partial-three','all-fail','analysis-fail'].includes(j.demoExampleKind))?'查看样例':'添加样例','failure-examples','secondary')}</div><div class="list-row"><div><b>员工合集权限</b></div><select id="employeeAccessScenario" aria-label="员工合集权限">${SOURCE_ACCESS_SCENARIOS.map(item=>option(item.id,item.label,sourceAccess(state).scenario)).join('')}</select></div><div class="list-row"><div><b>生成场景</b><p>仅影响下一批</p></div><select id="generationScenario" aria-label="生成场景">${option('normal','全部成功',toolsScenario)}${option('partial','最后一条制作失败',toolsScenario)}${option('partial-three','最后三条分别失败：超时/片源/配置',toolsScenario)}${option('all-fail','全部制作失败',toolsScenario)}${option('analysis-fail','分析阶段失败（无成片）',toolsScenario)}${option('qc-repair','自动修复后通过',toolsScenario)}${option('qc-attention','一条需人工核对',toolsScenario)}${option('qc-fail','一条检查失败释放积分',toolsScenario)}</select></div><div hidden class="list-row"><div><b>单条返工场景</b><p>不影响其他成片</p></div><select id="reworkScenario" aria-label="单条返工场景">${option('normal','成功生成新版本',state.reworkScenario||'normal')}${option('failed','失败保留原片',state.reworkScenario||'normal')}</select></div><div class="list-row"><div><b>原片版本</b><p>演示重新分析新版本</p></div>${button('更换原片版本','new-source-version','secondary')}</div><div class="list-row"><div><b>手动片源示例</b><p>使用虚构故事板验证制作流程</p></div>${button('切换','manual-source','secondary')}</div><div class="list-row"><div><b>重置本版演示</b><p>只清除 V7 本机示例记录</p></div>${button('重置','reset-prompt','text-btn danger')}</div>`,button('保存设置','save-tools','primary'));break;
 case 'save-tools':{const scenario=$('#employeeAccessScenario').value;toolsScenario=$('#generationScenario').value;state.reworkScenario=$('#reworkScenario').value;applySourceAccess(scenario);save();closeModal();render();toast('演示设置已保存');break;}
 case 'reset-prompt':modal('重置 V7 演示','<p>清除本机 V7 示例任务、分析、标准与积分记录。其他版本不受影响。</p>',button('取消','close')+button('重置示例','reset','primary'));break;
 case 'reset':genTimers.forEach(clearTimeout);genTimers.clear();prepare.operation=null;busy=false;state=initialState();ensureDefaultRetryExamples(state);ensureImportExamples(state);runningJobs.clear();startingBatches.clear();replacementContext=null;clearTaskSelection();libraryFilters=defaultLibraryFilters();libraryDraft={...libraryFilters};taskFilters=defaultTaskFilters();taskDraft={...taskFilters};syncUI.reset();currentBatch=null;currentOutput=null;reviewQueue=null;confirmFollowup=null;reworkDraft=null;narrationApplyContext=null;relatedOrigin=null;toolsScenario='normal';localVideo=null;save();closeModal();nav('create');break;
 }
});
function savedNarrationReady(o){return Array.isArray(o?.narrationDraft)&&Array.isArray(o.narrationSavedDraft)&&o.narrationSavedDraft.length>0&&JSON.stringify(o.narrationDraft.map(text=>String(text).trim()))===JSON.stringify(o.narrationSavedDraft)&&o.narrationSavedDraft.every(text=>String(text).trim());}
function narrationDraftNotice(o){const saved=savedNarrationReady(o);return `<div id="narrationDraftNotice" class="warning" role="status" ${o.narrationDraft?'':'hidden'}>${o.reworkPending?.kind==='narration'?'正在应用文案修改。':saved?'文案已保存，尚未应用。':'文案修改尚未保存。'}</div>`;}
function saveNarrationDraft(){
 const b=batch(),o=output();if(!o||!reviewable(o)||syncUI.locked(b,o))return;
 const full=isFullNarration(b.config),texts=(full?$$('[data-full-narration]').map(el=>el.value):[$('#narrationEdit')?.value??'']).map(text=>String(text).trim());
 if(!texts.length||texts.some(text=>!text)){toast('请填写完整解说文案');return;}
 const media=full?o.segments.filter(s=>s.type==='narration').map(s=>s.text):[o.narrationText||''];
 if(JSON.stringify(texts)===JSON.stringify(media.map(text=>String(text).trim()))){reviewTab='narration';delete o.narrationDraft;delete o.narrationSavedDraft;delete o.narrationDraftSavedAt;save();render();toast('文案没有变化');return;}
 reviewTab='narration';o.narrationDraft=clone(texts);o.narrationSavedDraft=clone(texts);o.narrationDraftSavedAt=new Date().toISOString();save();render();toast('草稿已保存');
}
function openNarrationApply(){
 const b=batch(),o=output();if(b&&sourcePermissionError(state,b.config)){toast(sourcePermissionError(state,b.config));return;}if(!o||!reviewable(o)||syncUI.locked(b,o))return;
 if(!savedNarrationReady(o)){toast('请先保存当前文案，再应用修改');return;}
 const cost=Number(b.cost.unit)||0;
 narrationApplyContext={batchId:b.id,outputId:o.id,version:o.contentVersion,texts:clone(o.narrationSavedDraft),cost};
 modal('应用文案修改',`<div id="narrationApplySummary"><strong>${esc(o.title)} · V${o.contentVersion}</strong><p class="helper">仅重新制作当前素材，生成后需重新确认。</p></div><div id="narrationApplyTexts">${o.narrationSavedDraft.map((text,index)=>`<div class="narration-quote-script"><b>${isFullNarration(b.config)?'第 '+(index+1)+' 段':'解说文案'}</b><p>${esc(text)}</p></div>`).join('')}</div><div id="narrationApplyQuote"><span>应用修改</span><strong>${cost} 积分</strong><p>开始冻结，成功扣除；失败释放并保留旧成片和草稿。</p></div><label class="check-confirm"><input id="narrationApplyConfirm" type="checkbox">已核对文案与费用</label>`,button('取消','close')+button('确认应用 · '+cost+' 积分','submit-narration-update','primary',`data-batch="${esc(b.id)}" data-id="${esc(o.id)}"`));
}
function submitNarrationUpdate(){
 const d=narrationApplyContext;if(!d)return;if(!$('#narrationApplyConfirm')?.checked){toast('请先核对文案与费用');return;}
 const b=state.batches.find(b=>b.id===d.batchId),o=b?.outputs.find(o=>o.id===d.outputId);
 if(!o||sourcePermissionError(state,b.config)||currentBatch!==d.batchId||currentOutput!==d.outputId||o.contentVersion!==d.version||!reviewable(o)||syncUI.locked(b,o)||!savedNarrationReady(o)||JSON.stringify(o.narrationSavedDraft)!==JSON.stringify(d.texts)||(Number(b.cost.unit)||0)!==d.cost){toast('素材或文案状态已变化，请重新确认');return;}
 try{
  const job=beginNarrationUpdate(state,b,o,d.texts),failed=state.reworkScenario==='failed';
  recordFeedback(state,b,o,{kind:'narration-update-request',reason:'应用解说文案修改',operationId:job.operationId});save();closeModal();render();
  afterWork(()=>{if(o.reworkPending?.operationId!==job.operationId)return;const result=finishNarrationUpdate(state,b,o,!failed&&!sourcePermissionError(state,b.config));recordFeedback(state,b,o,{kind:'narration-update-result',reason:result.success?'文案应用完成':'文案应用失败',operationId:job.operationId});save();render();toast(result.success?'文案已应用，请重新确认成片':'应用失败，已保留旧成片和草稿并释放冻结积分');},1300);
 }catch(error){toast(error.message);}
}
function afterWork(fn,ms){const timer=setTimeout(()=>{genTimers.delete(timer);fn();},ms);genTimers.add(timer);return timer;}
function scheduleGenerated(b,o,index,scenario){
 const attempt=(o.attempt||0)+1;o.attempt=attempt;o.quality={status:'generating'};o.generationScenario=scenario;
 // Keep an explicit review fixture in progress across reloads; regular jobs still finish.
 if(scenario==='progress-hold'&&index>=3){o.demoHeld=true;delete o.simulatedDueAt;save();return;}
 const active=()=>{if(o.attempt!==attempt||o.status!=='pending'||!state.batches.includes(b))return false;if(sourcePermissionError(state,b.config)){o.attempt++;settleOutput(state,b,o,false);o.failure={kind:'source',label:'合集访问权限已变化'};refreshWork();return false;}return true;};
 const finish=(success,status='passed',kind=null)=>{if(!active())return;settleOutput(state,b,o,success);o.quality={status,checkedAt:new Date().toISOString()};if(!success)o.failure={kind:kind||'timeout',...(['timeout','interrupted','temporary_io'].includes(kind)?{stage:'composition',recoverable:true,code:kind}:{}),...(kind==='source'?{episode:b.config.start,label:'第 '+b.config.start+' 集无法读取'}:{})};else{delete o.failure;o.generatedAt=new Date().toISOString();}if(status==='attention'){o.status='issue';o.issues.push({type:'continuity',label:'剧情衔接需核对',at:Math.round(o.segments[1]?.start||0),detail:'请核对回叙衔接。',source:'auto'});}refreshWork();};
 const delay=Math.max(250,(o.simulatedDueAt||Date.now()+2600+index*450)-Date.now());o.simulatedDueAt=Date.now()+delay;save();
 afterWork(()=>{if(!active())return;const special=index===b.outputs.length-1;
  if(scenario==='partial-two'&&index>=b.outputs.length-2){finish(false,'failed',index===b.outputs.length-2?'interrupted':'temporary_io');return;}
  if(scenario==='mixed-retry'&&index>=b.outputs.length-3){finish(false,'failed',['timeout','temporary_io','source'][index-(b.outputs.length-3)]);return;}
  if(scenario==='all-fail'){o.autoRetryCount=2;finish(false,'failed','timeout');return;}
  if(scenario==='partial-three'&&index>=Math.max(0,b.outputs.length-3)){const offset=index-Math.max(0,b.outputs.length-3),kind=['timeout','source','config'][offset];o.autoRetryCount=kind==='timeout'?2:0;finish(false,'failed',kind);return;}
  if(special&&scenario==='partial'){o.autoRetryCount=2;finish(false,'failed','timeout');return;}
  if(special&&scenario==='qc-fail'){finish(false,'failed','quality');return;}
  if(special&&scenario==='qc-attention'){finish(true,'attention');return;}
  if(special&&scenario==='qc-repair'){o.quality={status:'repairing'};refreshWork();afterWork(()=>finish(true),700);return;}
  finish(true);
 },delay);
}

function startReview(batchId,outputId){
 const b=state.batches.find(b=>b.id===batchId),o=b?.outputs.find(o=>o.id===outputId);
 if(!o||!reviewable(o)){toast('这条素材正在处理，请稍后查看');return;}
 currentBatch=b.id;currentOutput=o.id;videoPreview.open(o);
}

function reviewDelivery(){return '';}

function reviewQueueBar(b,o){
 if(!reviewQueue||reviewQueue.batchId!==b.id||!reviewQueue.ids.includes(o.id))reviewQueue={batchId:b.id,ids:b.outputs.filter(reviewable).map(o=>o.id),index:0};
 reviewQueue.index=reviewQueue.ids.indexOf(o.id);
 const at=reviewQueue.index,canMove=dir=>reviewQueue.ids.some((id,i)=>(dir<0?i<at:i>at)&&reviewable(b.outputs.find(o=>o.id===id))),locked=syncUI.locked(b,o)||!reviewable(o)||o.narrationDraft,attrs=`data-batch="${b.id}" data-id="${o.id}"`;
 return `<div class="review-queue"><div class="actions review-navigation">${button('上一条','review-prev','secondary',canMove(-1)?'':'disabled')}${button('下一条','review-next','secondary',canMove(1)?'':'disabled')}</div><div class="actions review-delivery">${button('下载','download-one','secondary',attrs+(!reviewable(o)?' disabled':''))}</div></div>`;
}
function moveReview(delta){
 if(!reviewQueue)return;const b=batch();let at=reviewQueue.index+delta;
 while(at>=0&&at<reviewQueue.ids.length){const o=b.outputs.find(o=>o.id===reviewQueue.ids[at]);if(o&&reviewable(o)){reviewQueue.index=at;currentOutput=o.id;reviewTab='junction';nav('review');return;}at+=delta;}
}
function openRework(batchId,outputId,options={}){
 const b=state.batches.find(b=>b.id===batchId),o=b?.outputs.find(o=>o.id===outputId);
 if(b&&sourcePermissionError(state,b.config)){toast(sourcePermissionError(state,b.config));return;}
 if(!b||!o||!reviewable(o)||syncUI.locked(b,o)){toast('当前素材正在处理或同步，请稍后操作');return;}
 if(o.narrationDraft){toast('请先应用或放弃文案修改');return;}
 const preference=(o.preferences||[]).find(p=>p.id===options.preferenceId);reworkDraft={batchId,outputId,kind:options.kind||(o.issues.length?'quality':'creative'),direction:options.direction||'opening',reason:options.reason||'opening',instruction:preference?.detail||''};showRework();
}
function showRework(){
 const d=reworkDraft,b=state.batches.find(b=>b.id===d.batchId),o=b.outputs.find(o=>o.id===d.outputId),quality=d.kind==='quality';
 modal('单条返工',`<p><strong>${esc(o.title)}</strong></p><div class="pills" id="reworkKind">${button('修复质量问题','rework-kind',quality?'active':'',`data-value="quality" ${o.issues.length?'':'disabled title="先记录需要修复的问题"'}`)}${button('更换创作方向','rework-kind',!quality?'active':'','data-value="creative"')}</div>${quality?`<div class="subtle-box">${o.issues.map(i=>`<p>${esc(i.label)} · ${issueRangeLabel(i)}</p>`).join('')}</div>`:`<div class="field"><label for="reworkFeedback">调整原因</label><select id="reworkFeedback" aria-label="调整原因">${[['opening','开场不够吸引'],['slow','铺垫太长'],['similar','与已有素材相似'],['angle','想尝试其他方向']].map(([value,label])=>option(value,label,d.reason)).join('')}</select></div><div class="field"><label>希望优先调整</label><div class="rework-options">${[['opening','强化开头'],['context','补足铺垫'],['angle','更换剧情切入']].map(([value,label])=>`<label><input type="radio" name="reworkDirection" value="${value}" ${d.direction===value?'checked':''}>${label}</label>`).join('')}</div></div><div class="field"><label for="reworkReason">补充要求（选填）</label><textarea id="reworkReason" rows="3" maxlength="200" placeholder="例如：从女主受到质疑的场景开场">${esc(d.instruction)}</textarea></div>`}<div id="reworkQuote"><div><b>${quality?'系统质量补救':'重新制作这一条'}</b><p class="helper">${quality?'不新增积分消耗':'开始时冻结，成功后扣除；失败释放'}</p></div><strong>${quality?0:b.cost.unit} 积分</strong></div><p class="rework-note">新版本完成后需重新检查；失败保留原片。已同步的旧版本不会被替换。</p>`,button('取消','close')+button(quality?'免费修复这一条':'确认重做 · '+b.cost.unit+' 积分','submit-rework','primary'));
}
function submitRework(){
 const d=reworkDraft;if(!d)return;const b=state.batches.find(b=>b.id===d.batchId),o=b?.outputs.find(o=>o.id===d.outputId);
 if(!o||syncUI.locked(b,o)){toast('当前版本同步中，请先查询同步结果');return;}
 if(sourcePermissionError(state,b.config)){toast(sourcePermissionError(state,b.config));return;}
 if(d.kind==='creative'){d.direction=$('input[name="reworkDirection"]:checked')?.value||d.direction;d.instruction=$('#reworkReason').value.trim();d.reason=$('#reworkFeedback').value;}
 try{
  const job=beginRework(state,b,o,{kind:d.kind,direction:d.direction,instruction:d.instruction});
  recordFeedback(state,b,o,{kind:d.kind==='quality'?'remedy-request':'creative-preference',reason:d.kind==='quality'?'修复已记录质量问题':({opening:'开场不够吸引',slow:'铺垫太长',similar:'与已有素材相似',angle:'想尝试其他方向'}[d.reason]),detail:d.instruction,operationId:job.operationId});const fail=state.reworkScenario==='failed';reworkDraft=null;save();closeModal();render();toast('正在重新制作这一条');
  afterWork(()=>{if(o.reworkPending?.operationId!==job.operationId)return;const result=finishRework(state,b,o,!fail&&!sourcePermissionError(state,b.config));if(result.success)o.quality={status:'passed',repaired:job.kind==='quality',checkedAt:new Date().toISOString()};recordFeedback(state,b,o,{kind:'rework-result',reason:result.success?'返工完成':'返工失败',operationId:job.operationId});save();render();toast(result.success?'新版本已完成，请重新检查':'重做未完成，已保留原片并释放新增冻结积分');},1300);
 }catch(e){toast(e.message);}
}

function confirmModal(items,followup=null){confirmFollowup=followup;if(items.some(o=>o.narrationDraft)){toast('所选素材有未应用的文案，请先应用或放弃修改');return;}if(!items.length||items.some(o=>o.status!=='ready'||!reviewable(o)||syncUI.locked(batch(),o))){toast('请选择已生成且无待处理问题的当前版本');return;}modal('确认 '+items.length+' 条素材可用',`<label class="check-confirm"><input id="confirmCheck" type="checkbox">已检查所选素材，确认当前版本可以使用</label>`,button('返回检查','close')+button(followup==='sync'?'确认并填写上传信息':followup==='next'?'确认并继续':'确认可用','apply-confirm','primary',`data-batch="${esc(batch().id)}" data-versions="${esc(JSON.stringify(items.map(o=>({id:o.id,version:o.contentVersion}))))}"`));}
document.addEventListener('keydown',e=>{if(e.target.id==='progressPageNumber'&&e.key==='Enter'){e.preventDefault();changeProgressPage(e.target.value);}});
document.addEventListener('change',e=>{const el=e.target;if(el.id?.startsWith('cloud')){cloudImport.input(el);return;}if(el.id==='taskPageSize'){taskPaging={page:1,pageSize:Number(el.value)};save();render();return;}if(el.id==='progressPageSize'){progressPaging={page:1,pageSize:Number(el.value)};renderProgress({scrollTop:true});return;}if(el.id==='progressPageNumber'){changeProgressPage(el.value);return;}if(el.id==='issueType'){const item=ISSUE_TYPES.find(t=>t.id===el.value);$('#issueCategoryHint').textContent=item?.category==='creative'?'提交后记录该素材的调整建议。':'提交后记录该素材的问题。';return;}if(el.id==='reworkFeedback'&&reworkDraft){reworkDraft.reason=el.value;return;}if(el.name==='reworkDirection'&&reworkDraft){reworkDraft.direction=el.value;return;}const filters={dramaMarket:[libraryDraft,'market'],taskDrama:[taskDraft,'drama'],taskMode:[taskDraft,'mode'],taskStatus:[taskDraft,'status']};if(filters[el.id]){filters[el.id][0][filters[el.id][1]]=el.value;save();return;}if(el.dataset.config){const key=el.dataset.config;if(key==='titleText')return;if(key==='bgm'&&el.checked){render();openBgmPicker();return;}if(key==='outputSpeed')applyOutputSpeed(state.config,el.value===''?null:Number(el.value));else if(key==='independentNarrationSpeed'){state.config.independentNarrationSpeed=el.checked;if(!el.checked)state.config.narrationSpeed=state.config.outputSpeed;else state.config.narrationSpeed=state.config.narrationSpeedOverride||1;}else if(key==='narrationSpeed'){state.config.narrationSpeedOverride=Number(el.value);state.config.narrationSpeed=Number(el.value);}else state.config[key]=el.type==='checkbox'?el.checked:['start','end','count','speed','narrationSpeed','narrationSeconds'].includes(key)?Number(el.value):el.value;state.config=normalizeCreationConfig(state.config);save();if(!$('#dialog').open){if(el.type==='number'){refreshCreationPreview();return;}render();if(key==='title'&&state.config.title)$('[data-config="titleText"]')?.focus();}}if(el.dataset.output){const b=state.batches.find(b=>b.id===el.dataset.batch),o=b?.outputs.find(o=>o.id===el.dataset.output);if(!o)return;if(el.checked&&canSelectMaterial(b,o)){const selected=selectTaskContext(b.id,{notify:true});selected.add(o.id);}else if(selectionBatchId===b.id)selectionFor(b.id).delete(o.id);render();}if(el.id==='pickerStart')picker.start=Number(el.value);if(el.id==='pickerEnd')picker.end=Number(el.value);if(el.id==='localFile'){localUpload.add([...el.files]);}});
document.addEventListener('input',e=>{if(e.target.id?.startsWith('cloud')){cloudImport.input(e.target);return;}if(e.target.id==='dramaRename'){if(Array.from(e.target.value).length>80)e.target.value=Array.from(e.target.value).slice(0,80).join('');return;}if(e.target.id==='reworkReason'&&reworkDraft){reworkDraft.instruction=e.target.value;return;}if(e.target.id==='narrationEdit'||e.target.hasAttribute('data-full-narration')){const o=output();if(!o||o.reworkPending||o.repairing||syncUI.locked(batch(),o))return;const hadDraft=Boolean(o.narrationDraft),full=isFullNarration(batch().config),texts=full?$$('[data-full-narration]').map(el=>el.value):[e.target.value],original=full?o.segments.filter(s=>s.type==='narration').map(s=>s.text):[o.narrationText||''];if(texts.some((text,index)=>String(text).trim()!==String(original[index]||'').trim()))o.narrationDraft=texts;else {delete o.narrationDraft;delete o.narrationSavedDraft;delete o.narrationDraftSavedAt;}save();const notice=$('#narrationDraftNotice');if(notice)notice.outerHTML=narrationDraftNotice(o);const actions=$('#narrationScript .narration-actions');if(actions)actions.outerHTML=narrationActions(batch(),o,false,uiHelpers);if(hadDraft!==Boolean(o.narrationDraft)){refreshSyncState();$$('.review-queue [data-action="rework"],.player-feedback [data-action="report-issue"],#feedbackRecords [data-action="repair"],#feedbackRecords [data-action="rework"]').forEach(button=>button.disabled=Boolean(o.narrationDraft));}return;}if(e.target.id==='dramaSearch'){libraryDraft.query=e.target.value;save();return;}if(e.target.dataset.config&&(e.target.type==='number'||e.target.dataset.config==='titleText')){state.config[e.target.dataset.config]=e.target.type==='number'?Number(e.target.value):e.target.value;save();refreshCreationPreview();}if(e.target.id==='collectionSearch'){const pos=e.target.selectionStart;picker.query=e.target.value;renderPicker();$('#collectionSearch').focus();$('#collectionSearch').setSelectionRange(pos,pos);}if(e.target.id==='scrubber'){stopPlayer();locate(Number(e.target.value));}});
// Restore durable simulated job records. Real services run independently of the page.
for(const b of state.batches){for(const o of b.outputs){if(o.repairing)o.repairing=false;if(o.reworkPending)finishRework(state,b,o,false);} }
advanceDemoImports(state);save();render();
const importProgressTimer=setInterval(()=>{
 if(!editingSessionActive||!advanceDemoImports(state))return;
 save();if(!$('#dialog').open&&['assets','create'].includes(view))render();
 cloudImport.refreshLibrary();
},800);
window.addEventListener('pagehide',()=>clearInterval(importProgressTimer),{once:true});
for(const j of state.productionJobs){if(j.stage==='validating')runSavedValidation(j);else if(['analyzing','planning'].includes(j.stage))runJob(j);}
for(const b of state.batches)for(const [index,o] of b.outputs.entries())if(o.status==='pending')scheduleGenerated(b,o,index,o.generationScenario||'normal');
// Optional agent access uses the same local demo actions as the visible UI.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const registrations=[
  {name:'inspect_mixed_cut_demo',title:'查看混剪演示状态',description:'Read the current local fictional demo configuration, planned count and example balance; does not call AI or external systems.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({view,config:clone(state.config),balance:state.balance,plans:state.plan?.candidates.length||0,batches:state.batches.length,simulated:true})},
  {name:'configure_and_generate_mixed_cut_demo',title:'配置并生成混剪演示素材',description:'Configure and submit the same generation flow as the UI. Automatically analyzes and generates fictional outputs, deducting example points; partial output availability is reflected in task status. Does not call AI, spend money, or sync outputs.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['highlight']},start:{type:'integer',minimum:1},end:{type:'integer',minimum:1,maximum:40},count:{type:'integer',minimum:1,maximum:20},outputSpeed:{type:'number',enum:[0.8,1,1.1,1.2,1.5]},durationMinSeconds:{type:'integer',minimum:10,maximum:1200},durationMaxSeconds:{type:'integer',minimum:10,maximum:1200}},required:['mode','start','end','count'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(!editingSessionActive)throw Error('Editor session has moved');if(busy)throw Error('分析进行中');if(localVideo)throw Error('本地文件仅预览，请先切换虚构片源');if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['mode','start','end','count','narrationStructure','outputSpeed','independentNarrationSpeed','narrationSpeed','durationMinSeconds','durationMaxSeconds'].includes(k)))throw Error('无效配置');const c=normalizeCreationConfig({...state.config,...input,...(input.narrationSpeed!==undefined?{narrationSpeedOverride:input.narrationSpeed}:{})});const error=sourcePermissionError(state,c)||validate(c);if(error)throw Error(error);state.config=c;save();await prepare();return {view,candidates:state.plan?.candidates.length||0,balance:state.balance,simulated:true};}}
 ];for(const tool of registrations){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

document.addEventListener('toggle',event=>{if(event.target.id==='narrationScript')reviewTab=event.target.open?'narration':'junction';},true);

document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='dramaSearch'){libraryFilters={...libraryDraft};save();render();}});
