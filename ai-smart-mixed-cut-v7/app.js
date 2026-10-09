import {createBgmUI} from './bgm-ui.js?v=20261009-update11';
import {assertBgmAvailable} from './bgm-model.js?v=20261009-update11';
import {SOURCE_ACCESS_SCENARIOS,sourceAccess,canAccessMarket,sourcePermissionError,isConfiguredSource,clearUnavailableSource} from './source-access.js?v=20261009-update11';
import {createLocalUpload} from './local-upload.js?v=20261009-update11';
import {feedbackForm,feedbackItems} from './feedback-ui.js?v=20261009-update11';
import {feedbackRange,recordOutputIssue,ISSUE_TYPES,issueRangeLabel} from './feedback-model.js?v=20261009-update11';
import {ensureContentPool,curateCandidates,recordFeedback} from './content-model.js?v=20261009-update11';
import {contentSimilarity} from './content-ui.js?v=20261009-update11';
import {reviewable,beginRework,finishRework,beginNarrationUpdate,finishNarrationUpdate} from './workflow-model.js?v=20261009-update11';
import {qualitySummary} from './workflow-ui.js?v=20261009-update11';
import {MIXED_CUT_STORAGE_KEY} from './platform-context.js?v=20261009-update11';
import {updatePlatformBalance} from './platform-shell.js?v=20261009-update11';
import {isFullNarration,productionRate,modeLabel,normalizeCreationConfig,targetSeconds,MODES,RANGES,clone,assetKey,validate,analysisInfo,analyze,planBatch,estimate,initialState,activeRule,createBatch,settleOutput,revise,applyOutputSpeed,speedSummary} from './engine.js?v=20261009-update11';
import {listCollections,getCollection} from './sources.js?v=20261009-update11';
import {createSyncUI} from './sync-ui.js?v=20261009-update11';
import {dramaKey,registerDrama,listDramas,findDrama,renameDrama} from './dramas.js?v=20261009-update11';
import {renderLibrary} from './library-ui.js?v=20261009-update11';
import {createForm,renderCreationPreview} from './creation-ui.js?v=20261009-update11';
import {renderMaterials,materialMatches} from './tasks-ui.js?v=20261009-update11';
import {fullNarrationPanel,mixedNarrationPanel,narrationActions} from './narration-ui.js?v=20261009-update11';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const button=(label,action,cls='secondary',attrs='')=>`<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const tag=(t,c='')=>`<span class="tag ${c}">${esc(t)}</span>`;
const icon=()=>'<svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor"/><path d="m8 6 5 4-5 4V7Z" fill="currentColor"/></svg>';
const KEY=MIXED_CUT_STORAGE_KEY;let state;try{state=JSON.parse(localStorage.getItem(KEY))||initialState();}catch{state=initialState();}
state.config=normalizeCreationConfig(state.config);
if(state.sourceAccessScenario===undefined)state.sourceAccessScenario='domestic';clearUnavailableSource(state);
let view='create',currentBatch=null,currentOutput=null,busy=false,reviewTab='junction',picker=null,localVideo=null,playerTimer=null,playerAt=0,genTimers=new Set(),toolsScenario='normal',selectionBatchId=null;
const taskSelections=new Map();
function selectionFor(id=currentBatch){if(!id)return new Set();if(!taskSelections.has(id))taskSelections.set(id,new Set());return taskSelections.get(id);}
function clearTaskSelection(){taskSelections.clear();selectionBatchId=null;}
function canSelectMaterial(b,o){return o.status==='ready'&&reviewable(o)&&!o.narrationDraft&&!syncUI.locked(b,o);}
function filteredMaterials(){
 const dramas=new Map(listDramas(state).map(d=>[d.id,d]));
 return state.batches.flatMap(b=>b.outputs.map(o=>({b,o,drama:dramas.get(dramaKey(b.config))}))).filter(({b,o})=>(taskFilters.drama==='all'||dramaKey(b.config)===taskFilters.drama)&&materialMatches(o,b.config,taskFilters));
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
let libraryFilters={query:'',market:'all',status:'all'},taskFilters={drama:'all',mode:'all',status:'all'};
const batch=()=>state.batches.find(b=>b.id===currentBatch),output=()=>batch()?.outputs.find(o=>o.id===currentOutput);
let editingSessionActive=true,generationPending=false;
const save=()=>{if(!editingSessionActive)return;clearUnavailableSource(state);if(isConfiguredSource(state.config))registerDrama(state,state.config,{touch:false});try{localStorage.setItem(KEY,JSON.stringify(state));updatePlatformBalance(state.balance);}catch{toast('本地存储空间不足，本次刷新后可能无法保留');}};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>$('#toast').classList.remove('visible'),3300);}
function modal(title,body,actions=button('关闭','close')){$('#dialog').className='';$('#dialog [aria-label="关闭弹窗"]').disabled=false;delete $('#dialog').dataset.syncJob;$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=body;$('#dialogActions').innerHTML=actions;if(!$('#dialog').open)$('#dialog').showModal();}
function closeModal(){if(localUpload.isBusy()||bgmUI.isBusy())return;localUpload.cancel();bgmUI.cancel();narrationApplyContext=null;feedbackContext=null;$('#dialog').close();}
function stopPlayer(){clearInterval(playerTimer);playerTimer=null;const control=$('[data-action="play"]');if(control)control.textContent='▶';}
function nav(next){stopPlayer();window.speechSynthesis?.cancel();playerAt=0;if(next==='create'){state.config=normalizeCreationConfig(state.config);save();}if(next!=='review')relatedOrigin=null;view=next;clearTaskSelection();render();window.scrollTo({top:0});}
function sourceLabel(c=state.config){const s=c.source;return s?.kind==='green'?(s.market==='domestic'?'国内短剧':'海外短剧'):'本地上传';}
function heading(title,desc,actions='',eyebrow=''){return `<div class="page-head"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div><div class="head-actions">${actions}</div></div>`;}
const option=(value,label,current)=>`<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(label)}</option>`;
function episodeSummary(ids){return ids.length>4?'第 '+ids[0]+'–'+ids.at(-1)+' 集 · '+ids.length+' 集取材':'第 '+ids.join('、')+' 集';}
function field(label,control,help=''){return `<div class="field"><label>${label}</label>${control}${help?`<small>${help}</small>`:''}</div>`;}
function footer(main,help,actions){$('#actionBar').hidden=false;$('#actionBar').innerHTML=`<div><div class="price-line">${main}</div><p class="footer-help">${help}</p></div><div class="actions">${actions}</div>`;}
const uiHelpers={heading,button,esc,tag,option,sourceLabel,fmt,field,footer};
const localUpload=createLocalUpload({modal,closeModal,button,esc,toast,onImport:source=>{
 registerDrama(state,state.config,{touch:false});
 state.config={...state.config,source,start:1,end:source.totalEpisodes};state.plan=null;
 registerDrama(state,state.config);localVideo=null;save();
 nav(view==='assets'?'assets':'create');
},onAppend:(source,previous)=>{
 if(!editingSessionActive||state.config.source.kind!=='manual'||state.config.source.assetId!==previous.assetId||(Number(state.config.source.fileVersion)||1)!==(Number(previous.fileVersion)||1))throw Error('当前片源已变化，请重新添加视频');
 const oldTotal=previous.files.length,nextConfig={...state.config,source,end:Number(state.config.end)===oldTotal?source.totalEpisodes:state.config.end};
 const fileIdentity=file=>JSON.stringify([file.id,file.order,file.name,file.size,file.lastModified??null]);
 const currentFiles=state.config.source.files||[];
 const unchanged=currentFiles.length===oldTotal&&previous.files.every((file,index)=>fileIdentity(file)===fileIdentity(currentFiles[index])&&fileIdentity(file)===fileIdentity(source.files[index]));
 if(!unchanged)throw Error('已有片源已变化，请重新添加视频');
 const nextState={...state,config:nextConfig,plan:null,dramas:clone(state.dramas||{}),assets:{...state.assets}};
 const oldKey=assetKey(state.config),cache=state.assets[oldKey];
 if(previous.simulated===false&&cache&&cache.seeded!==true&&cache.simulated!==true&&Array.isArray(cache.episodes)){
  const readyEpisodes=new Set(previous.files.map((file,index)=>!file.status||file.status==='ready'?index+1:null).filter(Boolean));
  const inherited=clone(cache);inherited.episodes=[...new Set(inherited.episodes.filter(id=>readyEpisodes.has(id)))];
  delete inherited.contentPool;
  nextState.assets[assetKey(nextConfig)]=inherited;
 }
 registerDrama(nextState,nextConfig);
 // Persist the complete new source before adopting it, keeping the old source
 // and selection intact if browser storage rejects the append.
 localStorage.setItem(KEY,JSON.stringify(nextState));
 state=nextState;localVideo=null;updatePlatformBalance(state.balance);nav('create');
}});
$('#dialog').addEventListener('cancel',event=>{if(localUpload.isBusy()||bgmUI.isBusy())event.preventDefault();});
$('#dialog').addEventListener('close',()=>localUpload.cancel());
function openRenameDrama(id){const d=findDrama(state,id);if(!d||d.config.source?.kind!=='manual'){toast('仅本地上传的剧目支持重命名');return;}
 modal('重命名剧目',`<div class="field rename-drama-field"><label for="dramaRename">剧目名称 <span class="required">*</span></label><input id="dramaRename" aria-label="剧目名称" maxlength="160" value="${esc(d.title)}"><small>修改剧目名称，不改变原片文件名。</small></div>`,button('取消','close')+button('保存','save-drama-name','primary',`data-id="${esc(id)}"`));$('#dramaRename').focus();}

function createView(){return createForm(state,{busy},uiHelpers);}
function refreshCreationPreview(){if(view!=='create')return;const panel=$('.preview-panel');if(panel)panel.innerHTML=renderCreationPreview(state.config,uiHelpers);createForm(state,{busy},uiHelpers);const info=analysisInfo(state,state.config),label=$('.analysis-bar>span');if(label)label.innerHTML=`已分析可复用 <b>${info.reused.length}</b> 集 · 本次新增 <b>${info.pending.length}</b> 集`;}
const bgmUI=createBgmUI({getConfig:()=>state.config,modal,closeModal,toast,button,esc,onApply:selection=>{
 if(!editingSessionActive)throw Error('当前页面已在其他窗口继续');
 const nextState={...state,config:normalizeCreationConfig({...state.config,...selection,bgm:true}),plan:null};
 localStorage.setItem(KEY,JSON.stringify(nextState));state=nextState;render();
}});
function openBgmPicker(){bgmUI.open();}
function validateSourceSelection(c){return validate({...c,mode:'highlight',duration:'3-5',speed:1.5,count:1,title:false,bgm:false});}

function refreshSyncState(){if(['assets','tasks'].includes(view))render();else if(view==='review'){const b=batch(),o=output();if(!b||!o)return;const a=$('#reviewSyncActions'),n=$('.sync-review-notice');if(a)a.innerHTML=o.confirmed?syncUI.reviewActions(b,o):'';if(n)n.outerHTML=syncUI.reviewNotice(b,o);const q=$('.review-queue');if(q)q.outerHTML=reviewQueueBar(b,o);}}
const syncUI=createSyncUI({getState:()=>state,save,render,refreshSyncState,toast,modal,closeModal,button,esc,icon,formatTime:fmt,getBatch:batch,getOutput:output,getSelectedOutputs:()=>batch()?.id===selectionBatchId?selectedVisibleMaterials():[]});
// Let a newly opened demo take over only after every local write operation settles.
// The old document then navigates away before its Web Lock can be acquired again.
export function relinquishEditingSession(){
 if(!editingSessionActive||busy||generationPending||genTimers.size||localUpload.isBusy()||bgmUI.isBusy()||syncUI.isBusy()||state.batches.some(b=>b.outputs.some(o=>o.status==='pending'||o.repairing||o.reworkPending)))return false;
 editingSessionActive=false;
 document.documentElement.inert=true;
 stopPlayer();bgmUI.cancel();
 window.speechSynthesis?.cancel();
 for(const type of ['click','input','change','keydown','submit'])document.addEventListener(type,event=>{event.preventDefault();event.stopImmediatePropagation();},{capture:true});
 return true;
}
function render(){clearUnavailableSource(state);stopPlayer();const names={create:'制作素材',assets:'剧目管理',tasks:'成片管理',review:'成片预览'};$('#breadcrumb').innerHTML=`<a href="./toolbox.html${window.parent!==window?'?review=1':''}">工具箱</a><span> / </span><span>智能混剪</span><b hidden>${names[view]}</b>`;updatePlatformBalance(state.balance);$$('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===(view==='review'?'tasks':view)));$('#actionBar').hidden=true;$('#app').innerHTML=({create:createView,assets:libraryView,tasks:tasksView,review:reviewView}[view]||createView)();if(view==='review'&&output())locate(Math.min(playerAt,output().duration));}
// Page functions are declared below. They are resolved before the first render.
function remainingPlans(){const p=state.plan;if(!p)return [];const used=new Set(state.batches.filter(b=>b.planSession===p.id).flatMap(b=>b.outputs.filter(o=>o.status!=='failed').map(o=>o.planId)));return p.candidates.filter(x=>!used.has(x.id));}
function libraryView(){return renderLibrary(state,libraryFilters,uiHelpers);}
function openDramaOutputs(id){
 const d=findDrama(state,id);if(!d){toast('剧目已失效，请重新选择');return;}
 taskFilters={drama:id,mode:'all',status:'all'};currentBatch=d.batches[0]?.id||null;nav('tasks');
}
function makeDrama(id){
 const d=findDrama(state,id);if(!d){toast('剧目已失效，请重新选择');return;}
 const error=sourcePermissionError(state,d.config);if(error){toast(error);return;}
 registerDrama(state,state.config,{touch:false});state.config=clone(d.config);if(d.displayName)state.config.source.displayName=d.displayName;
 if(localVideo)URL.revokeObjectURL(localVideo);localVideo=null;save();nav('create');
}
function tasksView(){
 const dramas=listDramas(state),drama=dramas.find(d=>d.id===taskFilters.drama),rows=filteredMaterials();
 if(selectionBatchId){
  const visible=new Set(rows.filter(({b,o})=>b.id===selectionBatchId&&canSelectMaterial(b,o)).map(({o})=>o.id));
  for(const id of selectionFor(selectionBatchId))if(!visible.has(id))selectionFor(selectionBatchId).delete(id);
  if(!state.batches.some(b=>b.id===selectionBatchId)||!rows.some(({b})=>b.id===selectionBatchId))clearTaskSelection();
 }
 const selected=selectionFor(selectionBatchId),selectedRows=selectedVisibleMaterials();
 const makeButton=drama?button('新建剪辑','make-drama','primary',`data-id="${esc(drama.id)}"`):button('制作素材','create','primary');
 const noOutputs=drama&&!state.batches.some(b=>dramaKey(b.config)===drama.id&&b.outputs.length);
 const empty=`<div class="empty"><h2>${noOutputs?'该剧暂无成片':'暂无符合条件的素材'}</h2><p>${drama?'可以为当前剧目新建剪辑，或调整筛选条件。':'选择片源和制作方式，开始制作素材。'}</p>${makeButton}${taskFilters.drama!=='all'||taskFilters.mode!=='all'||taskFilters.status!=='all'?button('清空筛选','clear-task-filters','text-btn'):''}</div>`;
 return heading('成片管理','',makeButton)+`<div class="library-filters"><select id="taskDrama" aria-label="按剧目名称筛选素材">${option('all','全部剧目',taskFilters.drama)}${dramas.map(d=>option(d.id,d.title,taskFilters.drama)).join('')}</select><select id="taskMode" aria-label="按制作方式筛选素材">${option('all','全部制作方式',taskFilters.mode)}${Object.entries(MODES).filter(([v])=>v!=='original').map(([v,m])=>option(v,m.name,taskFilters.mode)).join('')}</select><select id="taskStatus" aria-label="按素材状态筛选">${[['all','全部状态'],['running','制作中'],['review','待确认'],['failed','制作失败']].map(([v,l])=>option(v,l,taskFilters.status)).join('')}</select>${button('清空筛选','clear-task-filters','text-btn')}</div>`+(rows.length?renderMaterials(rows,{h:uiHelpers,syncUI,selected,selectionBatchId,selectedRows,canSelect:canSelectMaterial}):empty);
}

function reviewView(){
 const b=batch(),o=output();if(!o)return tasksView();
 const full=isFullNarration(b.config),narrated=b.config.mode==='narrated',locked=syncUI.locked(b,o)||o.repairing||Boolean(o.reworkPending);
 const blocked=locked||Boolean(o.narrationDraft),records=feedbackItems(b,o,blocked,uiHelpers);
 const script=narrated?(full?fullNarrationPanel:mixedNarrationPanel)(b,o,{open:reviewTab==='narration',locked},uiHelpers):'';
 const versions=o.revisions.length?`<details class="review-versions"><summary>版本记录</summary>${o.revisions.map(r=>`<p>V${r.version} · ${esc(r.description)}</p>`).join('')}</details>`:'';
 return heading(o.title,`${modeLabel(b.config)} · ${fmt(o.duration)} · ${speedSummary(b.config)} · V${o.contentVersion}`,button('返回成片管理','back-tasks')+button('单条返工','rework','secondary',`data-batch="${b.id}" data-id="${o.id}" ${blocked?'disabled':''}`)+`<span id="reviewSyncActions">${o.confirmed?syncUI.reviewActions(b,o):''}</span>`)
 +(relatedOrigin?`<div class="review-origin">${button('返回原素材','return-related','text-btn')}</div>`:'')+reviewQueueBar(b,o)+qualitySummary(o,uiHelpers)+syncUI.reviewNotice(b,o)
 +narrationDraftNotice(o)
 +`<div class="review-grid review-simple" data-review-mode="${full?'full':narrated?'narrated':'highlight'}"><aside class="player"><div class="story-screen"><img src="./assets/drama-confrontation.jpg" alt="虚构剧情故事板"><span class="screen-mark">故事板 · 无真实音轨</span><div class="screen-text" id="screenText">${esc(o.segments[0]?.text||'')}</div></div><div class="player-controls">${button('▶','play','icon-btn','aria-label="播放故事板"')}<input type="range" min="0" max="${o.duration}" value="0" aria-label="故事板进度" id="scrubber"><span id="playerTime">0:00 / ${fmt(o.duration)}</span></div><div class="player-feedback">${button('反馈问题','report-issue','secondary',blocked?'disabled':'')}</div></aside><div class="review-main">${contentSimilarity(state,b,o,uiHelpers)}${script}<section class="section issue-section" id="feedbackRecords"><div class="section-heading"><h2>反馈记录</h2></div>${records||'<p class="feedback-empty">暂无反馈</p>'}${versions}</section></div></div>`;
}
function quoteDialog(){const c=state.config,q=estimate(state,c,c.count);modal('费用明细',`<p>由平台积分账户结算。当前展示演示费率，正式费率沿用平台配置。</p>${isFullNarration(c)?`<div class="subtle-box">计划解说约 ${targetSeconds(c)} 秒；每条制作 32 分＋解说 ${Math.ceil(targetSeconds(c)/30)} 档 × 18 分（每 30 秒一档）。</div>`:''}<div class="cost-breakdown"><span>新增分析 ${q.analysis} 集 × 1 分</span><strong>${q.analysis} 分</strong><span>${modeLabel(c)} ${c.count} 条 × ${q.unit} 分</span><strong>${q.production} 分</strong><span>预计最高消耗</span><strong>${q.total} 分</strong></div><div class="info">提交生成后先分析新增剧集，完成后结算；有效分析可复用。开始制作时按实际条数冻结额度，成功结算、失败释放。数量不足时先确认实际条数；返回调整不收制作费。</div><p class="helper">系统问题修复与素材同步不重复收费。</p>`);}
function openPicker(){
 const access=sourceAccess(state);if(!access.canUseCollections){localUpload.open();return;}
 const source=state.config.source,market=access.markets.includes(source?.market)?source.market:access.markets[0];
 picker={market,id:source?.kind==='green'&&source.market===market?source.collectionId:null,start:state.config.start,end:state.config.end,query:''};renderPicker();
}
function renderPicker(){
 const access=sourceAccess(state);if(!access.canUseCollections){picker=null;localUpload.open();return;}
 if(!picker||!canAccessMarket(state,picker.market)){picker={market:access.markets[0],id:null,start:1,end:1,query:''};}
 const items=listCollections(picker.market,picker.query),picked=getCollection(picker.market,picker.id);
 const controls=access.markets.length>1?access.markets.map(market=>button(market==='domestic'?'国内短剧':'海外短剧','picker-market',picker.market===market?'active':'',`data-value="${market}"`)).join(''):'';
 modal('选择合集',`<div class="pills">${controls}${button('本地上传','upload','')}</div><input class="search" id="collectionSearch" aria-label="搜索合集" placeholder="搜索合集名称或 ID" value="${esc(picker.query)}"><div class="source-picker"><div class="collection-list">${items.map(item=>`<button class="collection ${picker.id===item.id?'active':''}" data-action="picker-collection" data-id="${item.id}"><img class="poster" src="${esc(item.cover||'./assets/drama-confrontation.jpg')}" alt="合集封面"><div><strong>${esc(item.title)}</strong><p>${item.id} · 可用 ${item.availableEpisodes.length} / ${item.totalEpisodes} 集</p></div></button>`).join('')||'<div class="empty">没有找到合集</div>'}</div><div class="subtle-box"><h3>${picked?'配置混剪集数':'先选择一个合集'}</h3>${picked?`<p class="helper">${esc(picked.description)}</p><div class="range-row">第 <input aria-label="合集起始集数" id="pickerStart" type="number" value="${picker.start}"> — <input aria-label="合集结束集数" id="pickerEnd" type="number" value="${picker.end}"> 集</div><div class="pills" style="margin-top:15px">${[10,20,30].map(n=>button('前'+n+'集','picker-range','',`data-value="${n}"`)).join('')}</div>`:''}</div></div>`,button('取消','close')+button('使用合集与选集','apply-source','primary',picked?'':'disabled'));$('#dialog').classList.add('wide');
}
function applySourceAccess(scenario){
 state.sourceAccessScenario=SOURCE_ACCESS_SCENARIOS.some(item=>item.id===scenario)?scenario:'unmatched';
 if(busy&&sourcePermissionError(state,prepare.config||state.config)){prepare.operation=null;busy=false;}
 clearUnavailableSource(state);libraryFilters.market='all';picker=null;
 for(const b of state.batches){if(!sourcePermissionError(state,b.config))continue;for(const o of b.outputs){
  if(o.status==='pending'){o.attempt=(o.attempt||0)+1;settleOutput(state,b,o,false);o.permissionRevoked=true;}
  if(o.reworkPending)finishRework(state,b,o,false);
  if(o.repairing)o.repairing=false;
 }}
}
function showCapacityDialog(){
 const p=state.plan,count=Math.min(remainingPlans().length,p.config.count);
 const reason=p.reason||(count?'所选剧情可用高光有限，已排除重复或过度相似的内容。':'所选剧情无法满足当前制作时长，请增加集数或调整时长。');
 modal('可生成数量不足',`<div class="capacity-summary"><h3>计划 ${p.config.count} 条，可生成 ${count} 条</h3><p class="helper">${esc(reason)}</p>${p.excluded?`<p class="helper">已排除 ${p.excluded} 个内容过度相似的方向。</p>`:''}</div><div class="cost-breakdown"><span>已完成分析</span><strong>${p.analysisCharge} 积分</strong><span>本次制作 · ${count} 条</span><strong>${count*productionRate(p.config)} 积分</strong></div><p class="helper">按实际生成条数计费；返回调整不收制作费，已完成分析可复用。</p>`,button('返回调整','create')+(count?button('生成 '+count+' 条','generate-available','primary'):''));
}
async function prepare(){
 if(busy)return;
 if(state.config.source?.kind==='manual'&&state.config.source.simulated===false){toast('本地片源已保存；当前原型尚未接入真实剧情分析与视频生成。');return;}
 const c=clone(state.config),error=sourcePermissionError(state,c)||validate(c);
 if(error){toast(error);return;}
 const info=analysisInfo(state,c),required=estimate(state,c,c.count).total;
 if(required>state.balance){toast('积分不足，请减少条数或调整时长');return;}
 busy=true;const operation=Symbol('prepare');prepare.operation=operation;prepare.config=c;render();
 try{await assertBgmAvailable(c);}catch(error){if(prepare.operation===operation){busy=false;render();toast(error.message);}return;}
 if(prepare.operation!==operation)return;
 if(sourcePermissionError(state,c)){busy=false;render();toast('合集权限已变化，请重新选择片源');return;}
 modal('整理所选剧情',`<h3>${info.pending.length?'补分析 '+info.pending.length+' 集':'复用已有剧情分析'}</h3><p class="helper">复用 ${info.reused.length} 集 · 新增 ${info.pending.length} 集，分析完成扣 ${info.pending.length} 积分。</p><div class="progress-track"><i></i></div>`,button('取消分析','cancel-analysis'));
 await new Promise(r=>setTimeout(r,1100));if(prepare.operation!==operation)return;
 if(sourcePermissionError(state,c)){busy=false;closeModal();clearUnavailableSource(state);save();render();toast('合集权限已变化，请重新选择片源');return;}
 const result=analyze(state,c);ensureContentPool(state,c);state.balance-=info.pending.length;
 if(info.pending.length)state.ledger.unshift({id:'AN-'+Date.now(),type:'新增剧集分析',points:-info.pending.length,at:new Date().toISOString()});
 busy=false;const rule=clone(activeRule(state));registerDrama(state,c);
 const planned=planBatch(c,rule,result.cache);const curated=curateCandidates(planned.candidates,c,state);planned.candidates=curated.candidates;planned.capacity=curated.candidates.length;planned.excluded+=curated.contentExcluded;if(curated.contentExcluded&&planned.capacity<c.count)planned.reason='已排除内容重复的候选，剩余 '+planned.capacity+' 个可用方向；可调整集数、时长或生成现有条数。';
 state.plan={id:'PLAN-'+Date.now(),config:c,rule,...planned,reused:info.reused.length,newCount:info.pending.length,analysisCharge:info.pending.length,analysisAllocated:false,analysisRevision:result.cache.revision};
 save();closeModal();nav('create');
 if(planned.capacity>=c.count)generate();else showCapacityDialog();
}
function generate(){
 const p=state.plan;if(!p)return;
 const error=sourcePermissionError(state,p.config)||validate(p.config);if(error){toast(error);return;}
 const plans=remainingPlans().slice(0,p.config.count);
 if(!plans.length){toast('当前没有可生成的内容，请调整片源或时长');return;}
 if(state.assets[assetKey(p.config)]?.revision!==p.analysisRevision||p.rule.id!==state.activeRule){
  modal('制作依据已更新','<p>剧情分析或制作标准已更新，请重新提交生成。</p>',button('返回调整','create','primary'));return;
 }
 doGenerate(plans);
}
async function doGenerate(plans){const p=state.plan;if(!p||generationPending)return;const error=sourcePermissionError(state,p.config)||validate(p.config);if(error){toast(error);return;}generationPending=true;try{await assertBgmAvailable(p.config);if(state.plan!==p||!editingSessionActive||sourcePermissionError(state,p.config))throw Error('制作配置或权限已变化，请重新生成');const b=createBatch(state,p.config,plans,p.analysisAllocated?0:p.analysisCharge);b.rule=clone(p.rule);b.planSession=p.id;registerDrama(state,p.config);p.analysisAllocated=true;currentBatch=b.id;view='tasks';taskFilters={drama:'all',mode:'all',status:'all'};clearTaskSelection();save();render();b.outputs.forEach((o,i)=>scheduleGenerated(b,o,i,toolsScenario));}catch(e){toast(e.message);}finally{generationPending=false;}}

function retime(o){let t=0;for(const s of o.segments){const d=s.end-s.start;s.start=Math.round(t*100)/100;t+=d;s.end=Math.round(t*100)/100;}o.duration=Math.round(t*100)/100;}
function locate(t){const o=output();if(!o)return;playerAt=t;const s=o.segments.find(x=>t>=x.start&&t<x.end)||o.segments.at(-1);if($('#screenText'))$('#screenText').textContent=s.text;if($('#scrubber'))$('#scrubber').value=t;if($('#playerTime'))$('#playerTime').textContent=fmt(t)+' / '+fmt(o.duration);}
function exportPlans(outputs,b=batch()){if(outputs.some(o=>o.narrationDraft)){toast('请先应用或放弃文案修改，再导出');return;}if(!outputs.length){toast('请先选择素材');return;}const blob=new Blob([JSON.stringify({demo:true,notice:'故事板方案，非真实视频',source:b.config.source,config:b.config,rule:b.rule,analysis:b.analysisSnapshot,outputs},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mixed-cut-v7-'+b.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已导出包含来源与版本的剪辑方案');}
document.addEventListener('click',async e=>{const el=e.target.closest('button,[data-action]');if(!el||el.disabled)return;if(el.dataset.nav){nav(el.dataset.nav);return;}const a=el.dataset.action;if(!a)return;const contextBatch=el.dataset.batch;if(contextBatch&&!['review-related','return-related','submit-narration-update','apply-issue','apply-full-issue'].includes(a)){if(!state.batches.some(b=>b.id===contextBatch)){toast('制作任务已失效，请刷新后重试');return;}currentBatch=contextBatch;}if(a.startsWith('local-')){await localUpload.handle(a,el);return;}if(a.startsWith('bgm-')&&a!=='bgm-picker'){await bgmUI.handle(a,el);return;}if(view==='review'&&output()?.narrationDraft&&['confirm-output','confirm-next','confirm-sync','report-issue','repair','rework'].includes(a)){toast('请先应用或放弃文案修改');reviewTab='narration';render();return;}if(a.startsWith('sync-')){if(el.dataset.batch)currentBatch=el.dataset.batch;syncUI.handle(a,el);return;}if(['save-narration','save-full-narration','apply-narration','report-issue','repair','confirm-output','confirm-next','confirm-sync'].includes(a)&&batch()&&output()&&(syncUI.locked(batch(),output())||output().repairing||output().reworkPending)){toast('当前版本同步中或待核实，请先查询同步结果');return;}
 switch(a){
 case 'close':closeModal();break;
 case 'create':case 'assets':case 'tasks':closeModal();nav(a);break;
 case 'mode':{const c=state.config;if(isFullNarration(c))c.fullDuration=c.duration;else c.mixedDuration=c.duration;c.mode=el.dataset.value;c.duration=isFullNarration(c)?c.fullDuration||'':c.mixedDuration||'3-5';state.config=normalizeCreationConfig(c);save();render();break;}
 case 'narration-structure':{const c=state.config;if(c.narrationStructure==='full')c.fullDuration=c.duration;else c.mixedDuration=c.duration;c.narrationStructure=el.dataset.value;c.duration=isFullNarration(c)?c.fullDuration||'':c.mixedDuration||'3-5';state.config=normalizeCreationConfig(c);save();render();break;}
 case 'range':state.config.start=1;state.config.end=Number(el.dataset.value);save();render();break;
 case 'speed':state.config.speed=Number(el.dataset.value);save();render();break;
 case 'count':state.config.count=Number(el.dataset.value);save();render();break;
 case 'count-plus':case 'count-minus':state.config.count=Math.max(1,Math.min(20,state.config.count+(a==='count-plus'?1:-1)));save();render();break;
 case 'quote':quoteDialog();break;
 case 'direct':prepare();break;
 case 'generate-available':closeModal();generate();break;
 case 'cancel-analysis':prepare.operation=null;busy=false;closeModal();render();toast('已取消本次模拟分析，未扣积分');break;
 case 'source-picker':openPicker();break;
 case 'add-drama':openPicker();break;
 case 'open-drama':openDramaOutputs(el.dataset.id);break;
 case 'rename-drama':openRenameDrama(el.dataset.id);break;
 case 'save-drama-name':{const name=$('#dramaRename').value.trim();if(!name||Array.from(name).length>80){toast('请输入1–80字的剧目名称');return;}const renamed=renameDrama(state,el.dataset.id,name);if(!renamed){toast('仅本地上传的剧目支持重命名');return;}if(dramaKey(state.config)===el.dataset.id)state.config.source.displayName=name;save();closeModal();render();toast('剧目名称已更新');break;}
 case 'make-drama':makeDrama(el.dataset.id);break;
 case 'current-drama':if(isConfiguredSource(state.config)&&!sourcePermissionError(state,state.config))openDramaOutputs(dramaKey(state.config));break;
 case 'clear-drama-filters':libraryFilters={query:'',market:'all',status:'all'};render();break;
 case 'clear-task-filters':taskFilters={drama:'all',mode:'all',status:'all'};clearTaskSelection();render();break;
 case 'batch-drama':if(batch())openDramaOutputs(dramaKey(batch().config));break;
 case 'review-item':startReview(el.dataset.batch,el.dataset.id);break;
 case 'picker-market':if(!picker||!canAccessMarket(state,el.dataset.value)){toast('暂无此合集权限');return;}picker.market=el.dataset.value;picker.id=null;picker.query='';renderPicker();break;
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
 case 'rework':openRework(el.dataset.batch||currentBatch,el.dataset.id||currentOutput,{kind:el.dataset.kind,direction:el.dataset.direction,reason:el.dataset.reason,preferenceId:el.dataset.preference});break;
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
 case 'issue-scope':{const all=el.dataset.value==='all';$$('[data-action="issue-scope"]').forEach(b=>{const active=b===el;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('#issueTimeRange').hidden=all;break;}
 case 'apply-full-issue':case 'apply-issue':{try{const d=feedbackContext,b=state.batches.find(b=>b.id===d?.batchId),o=b?.outputs.find(o=>o.id===d?.outputId);if(!o||currentBatch!==d.batchId||currentOutput!==d.outputId||o.contentVersion!==d.version||!reviewable(o)||syncUI.locked(b,o)||o.narrationDraft){toast('素材状态已变化，请重新打开问题反馈');return;}const scope=$('[data-action="issue-scope"].active').dataset.value,range=feedbackRange({scope,start:$('#issueStart').value,end:$('#issueEnd').value},o.duration),item=recordOutputIssue(o,b.config,$('#issueType').value,range,$('#issueDetail').value);recordFeedback(state,b,o,{kind:item.category==='quality'?'quality':'creative-preference',reason:item.label,...range,detail:item.detail});save();closeModal();render();}catch(error){toast(error.message);}break;}
 case 'repair':{const b=batch(),o=output();if(sourcePermissionError(state,b.config)){toast(sourcePermissionError(state,b.config));return;}const i=Number(el.dataset.index),issue=o.issues[i];if(o.repairing||o.reworkPending||!issue)return;o.repairing=true;save();render();afterWork(()=>{if(!o.repairing||sourcePermissionError(state,b.config)){o.repairing=false;save();render();return;}o.issues=o.issues.filter(x=>x!==issue);o.repairing=false;o.status=o.issues.length?'issue':'ready';revise(o,'局部修复：'+issue.label);o.quality={status:o.issues.length?'attention':'passed',repaired:true,checkedAt:new Date().toISOString()};recordFeedback(state,b,o,{kind:'remedy',reason:'局部修复完成',at:issue.at,endAt:issue.endAt??null,scope:issue.scope||'segment',detail:issue.label});save();if(['review','assets','tasks'].includes(view))render();toast('局部修复完成，未新增扣费；请重新检查');},900);break;}
 case 'cancel-one-generation':{const b=batch(),o=b?.outputs.find(o=>o.id===el.dataset.id);if(!o||o.status!=='pending')return;o.attempt=(o.attempt||0)+1;settleOutput(state,b,o,false);o.cancelled=true;save();render();toast('已取消这条素材，冻结积分已释放');break;}
 case 'retry-output':{if(el.dataset.batch)currentBatch=el.dataset.batch;const b=batch(),o=b?.outputs.find(o=>o.id===el.dataset.id);if(!o)return;const accessError=sourcePermissionError(state,b.config);if(accessError){toast(accessError);return;}if(o.status!=='failed')return;if(state.balance<b.cost.unit){toast('示例积分不足');return;}state.balance-=b.cost.unit;b.cost.frozen+=b.cost.unit;o.status='pending';delete o.cancelled;b.status='running';state.ledger.unshift({id:'RE-'+Date.now(),batch:b.id,type:'补生成冻结',points:-b.cost.unit,at:new Date().toISOString()});scheduleGenerated(b,o,0,'normal');save();render();break;}
 case 'export-selected':exportPlans(selectedVisibleMaterials());break;
 case 'new-source-version':closeModal();state.config.source.fileVersion=(state.config.source.fileVersion||1)+1;save();render();toast('已切换新的示例原片版本，需要重新分析');break;
 case 'demo-tools':modal('演示设置',`<div class="list-row"><div><b>员工合集权限</b></div><select id="employeeAccessScenario" aria-label="员工合集权限">${SOURCE_ACCESS_SCENARIOS.map(item=>option(item.id,item.label,sourceAccess(state).scenario)).join('')}</select></div><div class="list-row"><div><b>生成场景</b><p>仅影响下一批</p></div><select id="generationScenario" aria-label="生成场景">${option('normal','全部成功',toolsScenario)}${option('partial','最后一条制作失败',toolsScenario)}${option('qc-repair','自动修复后通过',toolsScenario)}${option('qc-attention','一条需人工核对',toolsScenario)}${option('qc-fail','一条检查失败释放积分',toolsScenario)}</select></div><div class="list-row"><div><b>单条返工场景</b><p>不影响其他成片</p></div><select id="reworkScenario" aria-label="单条返工场景">${option('normal','成功生成新版本',state.reworkScenario||'normal')}${option('failed','失败保留原片',state.reworkScenario||'normal')}</select></div><div class="list-row"><div><b>素材同步场景</b><p>同步为本地模拟</p></div><select id="syncScenario" aria-label="素材同步场景">${option('normal','全部成功',state.syncScenario)}${option('partial','最后一条失败',state.syncScenario)}${option('unknown','结果待核实',state.syncScenario)}</select></div><div class="list-row"><div><b>原片版本</b><p>演示重新分析新版本</p></div>${button('更换原片版本','new-source-version','secondary')}</div><div class="list-row"><div><b>手动片源示例</b><p>同步时选择国内或海外</p></div>${button('切换','manual-source','secondary')}</div><div class="list-row"><div><b>重置本版演示</b><p>只清除 V7 本机示例记录</p></div>${button('重置','reset-prompt','text-btn danger')}</div>`,button('保存设置','save-tools','primary'));break;
 case 'save-tools':{const scenario=$('#employeeAccessScenario').value;toolsScenario=$('#generationScenario').value;state.syncScenario=$('#syncScenario').value;state.reworkScenario=$('#reworkScenario').value;applySourceAccess(scenario);save();closeModal();render();toast('演示设置已保存');break;}
 case 'reset-prompt':modal('重置 V7 演示','<p>清除本机 V7 示例任务、分析、标准与积分记录。其他版本不受影响。</p>',button('取消','close')+button('重置示例','reset','primary'));break;
 case 'reset':genTimers.forEach(clearTimeout);genTimers.clear();prepare.operation=null;busy=false;state=initialState();clearTaskSelection();libraryFilters={query:'',market:'all',status:'all'};taskFilters={drama:'all',mode:'all',status:'all'};syncUI.reset();currentBatch=null;currentOutput=null;reviewQueue=null;confirmFollowup=null;reworkDraft=null;narrationApplyContext=null;relatedOrigin=null;toolsScenario='normal';localVideo=null;save();closeModal();nav('create');break;
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
 const attempt=(o.attempt||0)+1;o.attempt=attempt;o.quality={status:'generating'};
 const active=()=>{if(o.attempt!==attempt||o.status!=='pending'||!state.batches.includes(b))return false;if(sourcePermissionError(state,b.config)){o.attempt++;settleOutput(state,b,o,false);o.permissionRevoked=true;save();if(['assets','tasks','review'].includes(view))render();return false;}return true;};
 const paint=()=>{save();if(['assets','tasks','review'].includes(view))render();};
 const finish=(success,status='passed',repaired=false)=>{
  if(!active())return;
  settleOutput(state,b,o,success);o.quality={status,repaired,repairType:repaired?'music':null,checkedAt:new Date().toISOString()};
  if(status==='attention'){o.status='issue';o.issues.push({type:'continuity',label:'剧情衔接需核对',at:Math.round(o.segments[1]?.start||0),detail:'这一处回叙承接需人工核对，可定位检查或申请整条修复。',source:'auto'});}
  paint();
 };
 afterWork(()=>{
  if(!active())return;
  const special=index===b.outputs.length-1||b.outputs.length===1;
  if(special&&scenario==='partial'){finish(false,'failed');return;}
  o.quality={status:'checking'};paint();
  afterWork(()=>{
   if(!active())return;
   if(special&&scenario==='qc-fail'){finish(false,'failed');return;}
   if(special&&scenario==='qc-attention'){finish(true,'attention');return;}
   if(special&&scenario==='qc-repair'){o.quality={status:'repairing'};paint();afterWork(()=>finish(true,'passed',true),700);return;}
   finish(true);
  },650);
 },650+index*200);
}
function startReview(batchId,outputId,ids=null,{related=false}={}){
 const b=state.batches.find(b=>b.id===batchId),o=b?.outputs.find(o=>o.id===outputId);
 if(!o||!reviewable(o)){toast('这条素材正在处理，请稍后检查');return;}
 if(!related)relatedOrigin=null;currentBatch=b.id;currentOutput=o.id;reviewTab='junction';
 const all=ids||b.outputs.filter(reviewable).map(o=>o.id),at=all.indexOf(o.id);reviewQueue={batchId:b.id,ids:[...all.slice(at),...all.slice(0,at)],index:0};
 nav('review');
}
function reviewQueueBar(b,o){
 if(!reviewQueue||reviewQueue.batchId!==b.id||!reviewQueue.ids.includes(o.id))reviewQueue={batchId:b.id,ids:b.outputs.filter(reviewable).map(o=>o.id),index:0};
 reviewQueue.index=reviewQueue.ids.indexOf(o.id);
 const at=reviewQueue.index,last=at===reviewQueue.ids.length-1,locked=syncUI.locked(b,o)||!reviewable(o),confirmed=o.confirmed&&o.confirmedVersion===o.contentVersion;
 const confirmable=o.status==='ready'&&!o.narrationDraft&&!locked;
 return `<div class="review-queue"><div class="queue-position">检查 ${at+1} / ${reviewQueue.ids.length}<small>当前任务 · 逐条检查</small></div><div class="actions">${button('上一条','review-prev','secondary',at>0?'':'disabled')}${button(last?'完成本轮':'稍后处理，下一条','review-defer','text-btn')}${confirmed?button('取消确认','confirm-output','text-btn',locked||o.narrationDraft?'disabled':''):button('确认并同步','confirm-sync','secondary',confirmable?'':'disabled')}${button(confirmed?(last?'查看检查结果':'已确认，下一条'):(last?'确认并完成':'确认并下一条'),'confirm-next','primary',confirmable?'':'disabled')}</div></div>`;
}
function moveReview(delta){
 if(!reviewQueue)return;
 const b=batch();let at=reviewQueue.index+delta;
 while(at>=0&&at<reviewQueue.ids.length){const o=b.outputs.find(o=>o.id===reviewQueue.ids[at]);if(o&&reviewable(o)){reviewQueue.index=at;currentOutput=o.id;reviewTab='junction';nav('review');return;}at+=delta;}
 if(delta<0)return;
 const items=reviewQueue.ids.map(id=>b.outputs.find(o=>o.id===id)).filter(Boolean),confirmed=items.filter(o=>o.confirmed&&o.confirmedVersion===o.contentVersion).length;
 modal('本轮检查完成',`<div id="reviewCompletion"><h3>本轮检查已结束</h3><div class="completion-numbers"><div><b>${items.length}</b><span>本轮素材</span></div><div><b>${confirmed}</b><span>已确认</span></div><div><b>${items.length-confirmed}</b><span>待处理</span></div></div></div>`,button('返回成片管理','back-tasks')+(items.length>confirmed?button('查看待处理素材','review-remaining','primary'):''));
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

function confirmModal(items,followup=null){confirmFollowup=followup;if(items.some(o=>o.narrationDraft)){toast('所选素材有未应用的文案，请先应用或放弃修改');return;}if(!items.length||items.some(o=>o.status!=='ready'||!reviewable(o)||syncUI.locked(batch(),o))){toast('请选择已生成且无待处理问题的当前版本');return;}modal('确认 '+items.length+' 条素材可用',`<p>${isFullNarration(batch().config)?'请检查全文解说是否完整、文案与画面是否对应、配音时长和字幕是否合适，原片人声是否关闭。':'请检查剧情是否连贯、对白是否完整、字幕与 BGM 是否合适。'}系统检查通过不等于已经人工验收。</p><label class="check-confirm"><input id="confirmCheck" type="checkbox">已检查所选素材，确认当前版本可以使用</label>`,button('返回检查','close')+button(followup==='sync'?'确认并填写上传信息':followup==='next'?'确认并继续':'确认可用','apply-confirm','primary',`data-batch="${esc(batch().id)}" data-versions="${esc(JSON.stringify(items.map(o=>({id:o.id,version:o.contentVersion}))))}"`));}
document.addEventListener('change',e=>{const el=e.target;if(el.id==='issueType'){const item=ISSUE_TYPES.find(t=>t.id===el.value);$('#issueCategoryHint').textContent=item?.category==='creative'?'创作调整将在重做前确认费用。':'质量问题按修复流程处理。';return;}if(el.id==='reworkFeedback'&&reworkDraft){reworkDraft.reason=el.value;return;}if(el.name==='reworkDirection'&&reworkDraft){reworkDraft.direction=el.value;return;}const filters={dramaMarket:[libraryFilters,'market'],taskDrama:[taskFilters,'drama'],taskMode:[taskFilters,'mode'],taskStatus:[taskFilters,'status']};if(filters[el.id]){filters[el.id][0][filters[el.id][1]]=el.value;if(el.id.startsWith('task'))clearTaskSelection();render();return;}if(el.dataset.config){const key=el.dataset.config;if(key==='titleText')return;if(key==='bgm'&&el.checked){render();openBgmPicker();return;}if(key==='outputSpeed')applyOutputSpeed(state.config,Number(el.value));else if(key==='independentNarrationSpeed'){state.config.independentNarrationSpeed=el.checked;if(!el.checked)state.config.narrationSpeed=state.config.outputSpeed;else state.config.narrationSpeed=state.config.narrationSpeedOverride||1;}else if(key==='narrationSpeed'){state.config.narrationSpeedOverride=Number(el.value);state.config.narrationSpeed=Number(el.value);}else state.config[key]=el.type==='checkbox'?el.checked:['start','end','count','speed','narrationSpeed'].includes(key)?Number(el.value):el.value;state.config=normalizeCreationConfig(state.config);save();if(!$('#dialog').open){if(el.type==='number'){refreshCreationPreview();return;}render();if(key==='title'&&state.config.title)$('[data-config="titleText"]')?.focus();}}if(el.dataset.output){const b=state.batches.find(b=>b.id===el.dataset.batch),o=b?.outputs.find(o=>o.id===el.dataset.output);if(!o)return;if(el.checked&&canSelectMaterial(b,o)){const selected=selectTaskContext(b.id,{notify:true});selected.add(o.id);}else if(selectionBatchId===b.id)selectionFor(b.id).delete(o.id);render();}if(el.id==='pickerStart')picker.start=Number(el.value);if(el.id==='pickerEnd')picker.end=Number(el.value);if(el.id==='localFile'){localUpload.add([...el.files]);}});
document.addEventListener('input',e=>{if(e.target.id==='dramaRename'){if(Array.from(e.target.value).length>80)e.target.value=Array.from(e.target.value).slice(0,80).join('');return;}if(e.target.id==='reworkReason'&&reworkDraft){reworkDraft.instruction=e.target.value;return;}if(e.target.id==='narrationEdit'||e.target.hasAttribute('data-full-narration')){const o=output();if(!o||o.reworkPending||o.repairing||syncUI.locked(batch(),o))return;const hadDraft=Boolean(o.narrationDraft),full=isFullNarration(batch().config),texts=full?$$('[data-full-narration]').map(el=>el.value):[e.target.value],original=full?o.segments.filter(s=>s.type==='narration').map(s=>s.text):[o.narrationText||''];if(texts.some((text,index)=>String(text).trim()!==String(original[index]||'').trim()))o.narrationDraft=texts;else {delete o.narrationDraft;delete o.narrationSavedDraft;delete o.narrationDraftSavedAt;}save();const notice=$('#narrationDraftNotice');if(notice)notice.outerHTML=narrationDraftNotice(o);const actions=$('#narrationScript .narration-actions');if(actions)actions.outerHTML=narrationActions(batch(),o,false,uiHelpers);if(hadDraft!==Boolean(o.narrationDraft)){refreshSyncState();$$('.page-head [data-action="rework"],.player-feedback [data-action="report-issue"],#feedbackRecords [data-action="repair"],#feedbackRecords [data-action="rework"]').forEach(button=>button.disabled=Boolean(o.narrationDraft));}return;}if(e.target.id==='dramaSearch'){const pos=e.target.selectionStart;libraryFilters.query=e.target.value;render();$('#dramaSearch').focus();$('#dramaSearch').setSelectionRange(pos,pos);return;}if(e.target.dataset.config&&(e.target.type==='number'||e.target.dataset.config==='titleText')){state.config[e.target.dataset.config]=e.target.type==='number'?Number(e.target.value):e.target.value;save();refreshCreationPreview();}if(e.target.id==='collectionSearch'){const pos=e.target.selectionStart;picker.query=e.target.value;renderPicker();$('#collectionSearch').focus();$('#collectionSearch').setSelectionRange(pos,pos);}if(e.target.id==='scrubber'){stopPlayer();locate(Number(e.target.value));}});
// An interrupted local simulation releases pending work, never fabricates success.
for(const b of state.batches){for(const o of b.outputs){if(o.status==='pending')settleOutput(state,b,o,false);if(o.repairing)o.repairing=false;if(o.reworkPending)finishRework(state,b,o,false);} }
save();render();
// Optional agent access uses the same local demo actions as the visible UI.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const registrations=[
  {name:'inspect_mixed_cut_demo',title:'查看混剪演示状态',description:'Read the current local fictional demo configuration, planned count and example balance; does not call AI or external systems.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({view,config:clone(state.config),balance:state.balance,plans:state.plan?.candidates.length||0,batches:state.batches.length,simulated:true})},
  {name:'configure_and_generate_mixed_cut_demo',title:'配置并生成混剪演示素材',description:'Configure and submit the same generation flow as the UI. Automatically analyzes and generates fictional outputs, deducting example points; insufficient content opens quantity confirmation. Does not call AI, spend money, or sync outputs.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['highlight','narrated']},start:{type:'integer',minimum:1},end:{type:'integer',minimum:1,maximum:40},count:{type:'integer',minimum:1,maximum:20},narrationStructure:{type:'string',enum:['mixed','full']},outputSpeed:{type:'number',enum:[0.8,1,1.1,1.2,1.5]},independentNarrationSpeed:{type:'boolean'},narrationSpeed:{type:'number',enum:[0.8,1,1.1,1.2,1.5]},duration:{type:'string',enum:Object.keys(RANGES)}},required:['mode','start','end','count'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(!editingSessionActive)throw Error('Editor session has moved');if(busy)throw Error('分析进行中');if(localVideo)throw Error('本地文件仅预览，请先切换虚构片源');if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['mode','start','end','count','narrationStructure','outputSpeed','independentNarrationSpeed','narrationSpeed','duration'].includes(k)))throw Error('无效配置');const c=normalizeCreationConfig({...state.config,...input,...(input.narrationSpeed!==undefined?{narrationSpeedOverride:input.narrationSpeed}:{})});const error=sourcePermissionError(state,c)||validate(c);if(error)throw Error(error);state.config=c;save();await prepare();return {view,candidates:state.plan?.candidates.length||0,balance:state.balance,simulated:true};}}
 ];for(const tool of registrations){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

document.addEventListener('toggle',event=>{if(event.target.id==='narrationScript')reviewTab=event.target.open?'narration':'junction';},true);
