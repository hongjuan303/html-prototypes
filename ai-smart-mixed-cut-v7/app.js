import {feedbackForm,feedbackItems} from './feedback-ui.js?v=20261008-interaction1';
import {feedbackRange,recordOutputIssue,ISSUE_TYPES,issueRangeLabel} from './feedback-model.js?v=20261008-interaction1';
import {ensureContentPool,curateCandidates,recordFeedback} from './content-model.js?v=20261008-interaction1';
import {contentEvidence,compareContentDialog} from './content-ui.js?v=20261008-interaction1';
import {costSummary,reviewable,beginRework,finishRework} from './workflow-model.js?v=20261008-interaction1';
import {outputTable,qualitySummary,costBreakdown} from './workflow-ui.js?v=20261008-interaction1';
import {MIXED_CUT_STORAGE_KEY} from './platform-context.js?v=20261008-interaction1';
import {updatePlatformBalance} from './platform-shell.js?v=20261008-interaction1';
import {isFullNarration,productionRate,modeLabel,normalizeCreationConfig,targetSeconds,MODES,RANGES,clone,assetKey,validate,analysisInfo,analyze,planBatch,estimate,initialState,activeRule,outputCost,createBatch,settleOutput,revise,applyOutputSpeed,speedSummary} from './engine.js?v=20261008-interaction1';
import {listCollections,getCollection} from './sources.js?v=20261008-interaction1';
import {createSyncUI} from './sync-ui.js?v=20261008-interaction1';
import {dramaKey,registerDrama,listDramas,findDrama} from './dramas.js?v=20261008-interaction1';
import {renderLibrary,renderTaskTable,renderDrama,renderDramaOutputs,taskMatches} from './library-ui.js?v=20261008-interaction1';
import {createForm,renderCreationPreview,BGM_MOODS,BGM_TRACKS,bgmSelectionLabel} from './creation-ui.js?v=20261008-interaction1';
import {renderTaskCards} from './tasks-ui.js?v=20261008-interaction1';
import {fullNarrationPanel} from './narration-ui.js?v=20261008-interaction1';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const button=(label,action,cls='secondary',attrs='')=>`<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const tag=(t,c='')=>`<span class="tag ${c}">${esc(t)}</span>`;
const icon=()=>'<svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor"/><path d="m8 6 5 4-5 4V7Z" fill="currentColor"/></svg>';
const KEY=MIXED_CUT_STORAGE_KEY;let state;try{state=JSON.parse(localStorage.getItem(KEY))||initialState();}catch{state=initialState();}
state.config=normalizeCreationConfig(state.config);
let view='create',currentBatch=null,currentOutput=null,selected=new Set(),busy=false,reviewTab='junction',picker=null,localVideo=null,playerTimer=null,playerAt=0,genTimers=new Set(),toolsScenario='normal',taskExpanded=true;
let currentDrama=dramaKey(state.config),dramaTab='tasks',dramaOutputFilter='all';
let reviewQueue=null,confirmFollowup=null,reworkDraft=null;
let libraryFilters={query:'',market:'all',status:'all'},taskFilters={drama:'all',mode:'all',status:'all'};
const batch=()=>state.batches.find(b=>b.id===currentBatch),output=()=>batch()?.outputs.find(o=>o.id===currentOutput);
let editingSessionActive=true;
const save=()=>{if(!editingSessionActive)return;registerDrama(state,state.config,{touch:false});try{localStorage.setItem(KEY,JSON.stringify(state));updatePlatformBalance(state.balance);}catch{toast('本地存储空间不足，本次刷新后可能无法保留');}};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>$('#toast').classList.remove('visible'),3300);}
function modal(title,body,actions=button('关闭','close')){$('#dialog').className='';delete $('#dialog').dataset.syncJob;$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=body;$('#dialogActions').innerHTML=actions;if(!$('#dialog').open)$('#dialog').showModal();}
function closeModal(){$('#dialog').close();}
function stopPlayer(){clearInterval(playerTimer);playerTimer=null;const control=$('[data-action="play"]');if(control)control.textContent='▶';}
function nav(next){stopPlayer();window.speechSynthesis?.cancel();playerAt=0;if(next==='create'){state.config=normalizeCreationConfig(state.config);save();}view=next;selected.clear();render();window.scrollTo({top:0});}
function sourceLabel(c=state.config){const s=c.source;return s?.kind==='green'?(s.market==='domestic'?'国内短剧':'海外短剧'):'手动片源 · 类型未确定';}
function heading(title,desc,actions='',eyebrow=''){return `<div class="page-head"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div><div class="head-actions">${actions}</div></div>`;}
const option=(value,label,current)=>`<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(label)}</option>`;
function episodeSummary(ids){return ids.length>4?'第 '+ids[0]+'–'+ids.at(-1)+' 集 · '+ids.length+' 集取材':'第 '+ids.join('、')+' 集';}
function field(label,control,help=''){return `<div class="field"><label>${label}</label>${control}${help?`<small>${help}</small>`:''}</div>`;}
function footer(main,help,actions){$('#actionBar').hidden=false;$('#actionBar').innerHTML=`<div><div class="price-line">${main}</div><p class="footer-help">${help}</p></div><div class="actions">${actions}</div>`;}
const uiHelpers={heading,button,esc,tag,option,sourceLabel,fmt,field,footer};
function createView(){return createForm(state,{busy},uiHelpers);}
function refreshCreationPreview(){if(view!=='create')return;const panel=$('.preview-panel');if(panel)panel.innerHTML=renderCreationPreview(state.config,uiHelpers);createForm(state,{busy},uiHelpers);const info=analysisInfo(state,state.config),label=$('.analysis-bar>span');if(label)label.innerHTML=`已分析可复用 <b>${info.reused.length}</b> 集 · 本次新增 <b>${info.pending.length}</b> 集`;}
function openBgmPicker(){const c=state.config,track=BGM_TRACKS.some(t=>t.id===c.bgmTrack)?c.bgmTrack:'auto';modal('选择BGM',`<div class="field"><label for="bgmMood">剧情情绪</label><select id="bgmMood" aria-label="BGM情绪" ${track!=='auto'?'disabled':''}>${BGM_MOODS.map(m=>option(m.id,m.name,c.music)).join('')}</select></div><div class="bgm-options" role="radiogroup" aria-label="BGM选择">${BGM_TRACKS.map(t=>`<label class="bgm-option"><input type="radio" name="bgmTrack" value="${t.id}" ${track===t.id?'checked':''}><span><b>${t.name}</b><small>${t.id==='auto'?'按所选情绪自动匹配':BGM_MOODS.find(m=>m.id===t.mood)?.name+' · 示例BGM'}</small></span></label>`).join('')}</div><p class="helper">曲目为虚构示例，未接入真实曲库。</p>`,button('取消','close')+button('使用BGM','apply-bgm','primary'));}
function applyBgm(){const id=$('input[name="bgmTrack"]:checked')?.value,track=BGM_TRACKS.find(t=>t.id===id);if(!track){toast('请选择BGM');return;}const mood=track.mood||$('#bgmMood').value;if(!BGM_MOODS.some(m=>m.id===mood)){toast('请选择剧情情绪');return;}state.config.bgm=true;state.config.music=mood;state.config.bgmTrack=id;save();closeModal();render();}
function validateSourceSelection(c){return validate({...c,mode:'highlight',duration:'3-5',speed:1.5,count:1,title:false});}

function refreshSyncState(){if(['assets','drama','tasks'].includes(view))render();else if(view==='review'){const b=batch(),o=output();if(!b||!o)return;const a=$('#reviewSyncActions'),n=$('.sync-review-notice');if(a)a.innerHTML=o.confirmed?syncUI.reviewActions(b,o):'';if(n)n.outerHTML=syncUI.reviewNotice(b,o);const q=$('.review-queue');if(q)q.outerHTML=reviewQueueBar(b,o);}}
const syncUI=createSyncUI({getState:()=>state,save,render,refreshSyncState,toast,modal,closeModal,button,esc,icon,formatTime:fmt,getBatch:batch,getOutput:output,getSelectedOutputs:()=>batch()?.outputs.filter(o=>selected.has(o.id))||[]});
// Let a newly opened demo take over only after every local write operation settles.
// The old document then navigates away before its Web Lock can be acquired again.
export function relinquishEditingSession(){
 if(!editingSessionActive||busy||genTimers.size||syncUI.isBusy()||state.batches.some(b=>b.outputs.some(o=>o.status==='pending'||o.repairing||o.reworkPending)))return false;
 editingSessionActive=false;
 document.documentElement.inert=true;
 stopPlayer();
 window.speechSynthesis?.cancel();
 for(const type of ['click','input','change','keydown','submit'])document.addEventListener(type,event=>{event.preventDefault();event.stopImmediatePropagation();},{capture:true});
 return true;
}
function render(){stopPlayer();const names={create:'制作素材',assets:'剧目管理',tasks:'成片管理',review:'成片预览',drama:'剧目详情'};$('#breadcrumb').innerHTML=`<a href="./toolbox.html${window.parent!==window?'?review=1':''}">工具箱</a><span> / </span><span>智能混剪</span><b hidden>${names[view]}</b>`;updatePlatformBalance(state.balance);$$('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===(view==='drama'?'assets':view==='review'?'tasks':view)));$('#actionBar').hidden=true;$('#app').innerHTML=({create:createView,assets:libraryView,drama:dramaView,tasks:tasksView,review:reviewView}[view]||createView)();if(view==='review'&&output())locate(Math.min(playerAt,output().duration));}
// Page functions are declared below. They are resolved before the first render.
function remainingPlans(){const p=state.plan;if(!p)return [];const used=new Set(state.batches.filter(b=>b.planSession===p.id).flatMap(b=>b.outputs.filter(o=>o.status!=='failed').map(o=>o.planId)));return p.candidates.filter(x=>!used.has(x.id));}
function libraryView(){return renderLibrary(state,libraryFilters,uiHelpers);}
function dramaView(){const d=findDrama(state,currentDrama);if(!d)return libraryView();const body=dramaTab==='tasks'?renderTaskTable(d.batches,uiHelpers):renderDramaOutputs(d,dramaOutputFilter,uiHelpers,state,rows=>outputTable(rows,{h:uiHelpers,syncUI}));return renderDrama(d,dramaTab,body,uiHelpers);}
function openDrama(id,tab='tasks',make=false){const d=findDrama(state,id);if(!d){toast('剧目已失效，请重新选择');return;}registerDrama(state,state.config,{touch:false});state.config=clone(d.config);currentDrama=id;dramaTab=tab;dramaOutputFilter='all';if(localVideo)URL.revokeObjectURL(localVideo);localVideo=null;save();nav(make?'create':'drama');}

function tasksView(){const dramas=listDramas(state),list=state.batches.filter(b=>(taskFilters.drama==='all'||dramaKey(b.config)===taskFilters.drama)&&(taskFilters.mode==='all'||(b.config.mode==='original'?'highlight':b.config.mode)===taskFilters.mode)&&taskMatches(b,taskFilters.status));if(list.length&&!list.some(b=>b.id===currentBatch)){currentBatch=list[0].id;taskExpanded=true;selected.clear();}return heading('成片管理','',button('制作素材','create','primary'))+`<div class="library-filters"><select id="taskDrama" aria-label="按剧目筛选任务">${option('all','全部剧目',taskFilters.drama)}${dramas.map(d=>option(d.id,d.title+' · '+sourceLabel(d.config),taskFilters.drama)).join('')}</select><select id="taskMode" aria-label="按制作方式筛选任务">${option('all','全部制作方式',taskFilters.mode)}${Object.entries(MODES).filter(([v])=>v!=='original').map(([v,m])=>option(v,m.name,taskFilters.mode)).join('')}</select><select id="taskStatus" aria-label="按任务状态筛选">${[['all','全部状态'],['running','制作中'],['review','有待检查成片'],['failed','需补生成']].map(([v,l])=>option(v,l,taskFilters.status)).join('')}</select>${button('清空筛选','clear-task-filters','text-btn')}</div>`+renderTaskCards(list,currentBatch,taskExpanded,uiHelpers,batchOutputsView);}

function batchOutputsView(b){
 const c=costSummary(state,b),ready=b.outputs.filter(o=>['ready','issue'].includes(o.status)).length;
 return `<div class="task-output-summary"><span>已生成 <b>${ready}/${b.outputs.length}</b></span><span>已确认 <b>${c.accepted}</b></span><span class="money-stat">实际扣除 <b>${c.net} 积分</b></span>${c.frozen?`<span>冻结 <b>${c.frozen} 积分</b></span>`:''}${c.released?`<span>已释放 <b>${c.released} 积分</b></span>`:''}${button('费用明细','batch-cost','text-btn cost-link',`data-id="${esc(b.id)}"`)}</div>${b.outputs.some(o=>o.status==='pending')?'<div class="info"><b>正在制作并自动检查素材</b><div class="progress-track"><i></i></div>'+button('取消未完成','cancel-generation','text-btn')+'</div>':''}<div class="toolbar"><div class="actions">${button('选已确认未同步','select-syncable','text-btn')}${button('确认选中可用','confirm-selected','secondary',selected.size?'':'disabled')}${button('同步选中素材','sync-open-selected','primary',selected.size&&b.outputs.filter(o=>selected.has(o.id)).every(o=>syncUI.canSync(b,o))?'':'disabled')}</div></div>${outputTable(b.outputs.map(o=>({b,o})),{h:uiHelpers,syncUI,selected,selectable:true})}<div class="table-footer"><span>已选 ${selected.size} 条</span><details class="workflow-more"><summary>更多</summary>${button('导出选中方案','export-selected','text-btn',selected.size?'':'disabled')}</details></div>`;
}

function segmentHTML(s,i){return `<button class="segment ${s.type}" data-action="segment" data-index="${i}"><div class="time-label">${fmt(s.start)}<small>${fmt(s.end)}</small></div><div><strong>${esc(s.label)}</strong><p>${esc(s.text)}</p><small>第 ${s.sourceEp} 集 ${fmt(s.sourceStart)}–${fmt(s.sourceEnd)} · ${esc(s.reason)}</small></div></button>`;}
function reviewView(){const b=batch(),o=output();if(!o)return tasksView();const full=isFullNarration(b.config);const locked=syncUI.locked(b,o)||o.repairing||Boolean(o.reworkPending);const junctions=o.segments.slice(1).map((s,i)=>({left:o.segments[i],right:s,at:s.start}));return heading(o.title,`${modeLabel(b.config)} · ${fmt(o.duration)} · ${speedSummary(b.config)}${full?' · 原片人声关闭':''} · 内容 V${o.contentVersion}`,button('返回成片管理','back-tasks')+button('单条返工','rework','secondary',`data-batch="${b.id}" data-id="${o.id}" ${locked?'disabled':''}`)+`<span id="reviewSyncActions">${o.confirmed?syncUI.reviewActions(b,o):''}</span>`)+reviewQueueBar(b,o)+qualitySummary(o,uiHelpers)+syncUI.reviewNotice(b,o)+`<div id="narrationDraftNotice" class="warning" ${o.narrationDraft?'':'hidden'}>文案修改尚未保存。${button('查看并保存','review-tab','text-btn','data-value="narration"')}${button('放弃修改','discard-narration','text-btn')}</div><div class="review-grid"><aside class="player"><div class="story-screen"><img src="./assets/drama-confrontation.jpg" alt="虚构剧情故事板"><span class="screen-mark">故事板 · 无真实音轨</span><div class="screen-text" id="screenText">${esc(o.segments[0].text)}</div><span class="screen-source" id="screenSource">第 ${o.segments[0].sourceEp} 集 · 来源示意</span></div><div class="player-controls">${button('▶','play','icon-btn','aria-label="播放故事板"')}<input type="range" min="0" max="${o.duration}" value="0" aria-label="故事板进度" id="scrubber"><span id="playerTime">0:00 / ${fmt(o.duration)}</span></div><div class="player-feedback">${button('这里有问题','report-issue','secondary',locked?'disabled':'')}</div><div class="preview-note"><b>${full?'检查全篇解说与画面对应':'优先检查衔接位置'}</b>点击右侧片段可定位。</div><div class="review-summary">${tag(b.config.bgm?'BGM 开启':'未加配乐')}${full?tag('原片人声关闭'):tag('原片原声保留')}${tag(b.config.subtitles?'字幕开启':full?'未加解说字幕':'保留原字幕')}${tag(b.config.title?'小标题开启':'无小标题')}</div><div class="actions"><details class="workflow-more"><summary>辅助文件</summary>${button('导出剪辑方案','export-one','text-btn')}${button('导出示例字幕','export-srt','text-btn')}</details></div></aside><div>${contentEvidence(state,b,o,uiHelpers)}<section class="section">${full?fullNarrationPanel(b,o,{reviewTab,locked},uiHelpers):`<div class="tabs">${[['junction','接点检查'],['timeline','完整结构'],['narration',o.mode==='narrated'?'解说与包装':'字幕与配乐']].map(([id,l])=>button(l,'review-tab',reviewTab===id?'active':'',`data-value="${id}"`)).join('')}</div>${reviewTab==='timeline'?`<p class="helper" style="margin-bottom:15px">${esc(o.reason)}。${esc(o.removed)}</p><div class="timeline-list">${o.segments.map(segmentHTML).join('')}</div>`:reviewTab==='narration'?`${o.mode==='narrated'?`<label for="narrationEdit">解说文案 · 依据已选原片</label><textarea id="narrationEdit" rows="5" ${o.mode==='narrated'&&!locked?'':'disabled'}>${esc(o.narrationDraft?.[0]??o.narrationText??'')}</textarea><div class="actions" style="margin-top:12px">${button('保存文案','save-narration','secondary',o.mode==='narrated'&&!locked?'':'disabled')}${button('试听文案','speak','text-btn',o.mode==='narrated'?'':'disabled')}</div><p class="helper">修改后升级版本并重新确认；浏览器试听不代表生产配音。</p>`:''}<div class="list-row"><div><b>有人声时自动降低 BGM 音量</b><p>${b.config.bgm?'配乐方案开启 · 接入原声时降低伴奏':'未添加 BGM'}</p></div>${tag('混音示意')}</div><div class="list-row"><div><b>字幕与小标题</b><p>${b.config.subtitles?'对白与口播分别对齐':'保留原片字幕'} · ${b.config.title?'小标题避开字幕区':'不添加小标题'}</p></div></div>`:`<div class="toolbar"><h2>${junctions.length} 个衔接点</h2>${button('连续看接点','play-junctions','text-btn',junctions.length?'':'disabled')}</div>${junctions.map((j,i)=>`<div class="junction"><div class="inline-row"><strong>${fmt(j.at)} · ${j.left.type==='narration'?'解说 → 原片':j.right.type==='narration'?'原片 → 解说':'原片 → 原片'}</strong>${button('定位','junction','text-btn',`data-index="${i+1}"`)}</div><div class="from">上一段结尾</div><blockquote>${esc(j.left.text)}</blockquote><div class="to">接入完整句 · 第 ${j.right.sourceEp} 集 ${fmt(j.right.sourceStart)}</div><blockquote>${esc(j.right.text)}</blockquote>${j.left.type==='narration'?`<details class="source-evidence"><summary>剧情依据</summary><p>${esc(j.left.evidence||j.left.fact)}</p></details>`:''}</div>`).join('')}`}`}</section><section class="section issue-section"><div class="section-heading"><h2>问题反馈</h2>${button('反馈问题','report-issue','secondary',locked?'disabled':'')}</div><p class="helper">确认前请完成以下检查。</p>${feedbackItems(b,o,locked,uiHelpers)}<div class="check-list"><div>${full?'解说完整':'完整对白'}<small>${full?'全文与逐段配音边界':'首尾字与句子边界'}</small></div><div>${full?'图文对应':'剧情可理解'}<small>${full?'文案事实与所用画面一致':'前因、冲突与承接'}</small></div><div>音乐与字幕<small>不压人声，不遮挡对白</small></div><div>画面异常<small>检查黑屏、卡帧</small></div></div>${o.revisions.length?`<div class="success" style="margin-top:15px;margin-bottom:0"><details><summary>版本修改记录</summary>${o.revisions.map(r=>`<p>V${r.version} · ${esc(r.description)}</p>`).join('')}</details></div>`:''}</section></div></div>`;}
function quoteDialog(){const c=state.config,q=estimate(state,c,c.count);modal('费用明细',`<p>由平台积分账户结算。当前展示演示费率，正式费率沿用平台配置。</p>${isFullNarration(c)?`<div class="subtle-box">计划解说约 ${targetSeconds(c)} 秒；每条制作 32 分＋解说 ${Math.ceil(targetSeconds(c)/30)} 档 × 18 分（每 30 秒一档）。</div>`:''}<div class="cost-breakdown"><span>新增分析 ${q.analysis} 集 × 1 分</span><strong>${q.analysis} 分</strong><span>${modeLabel(c)} ${c.count} 条 × ${q.unit} 分</span><strong>${q.production} 分</strong><span>预计最高消耗</span><strong>${q.total} 分</strong></div><div class="info">提交生成后先分析新增剧集，完成后结算；有效分析可复用。开始制作时按实际条数冻结额度，成功结算、失败释放。数量不足时先确认实际条数；返回调整不收制作费。</div><p class="helper">系统问题修复与素材同步不重复收费。</p>`);}
function openPicker(){picker={market:state.config.source.market||'domestic',id:state.config.source.kind==='green'?state.config.source.collectionId:null,start:state.config.start,end:state.config.end,query:''};renderPicker();}
function renderPicker(){const items=listCollections(picker.market,picker.query),picked=getCollection(picker.market,picker.id);modal('选择合集',`<div class="pills">${[['domestic','国内短剧'],['overseas','海外短剧']].map(([v,l])=>button(l,'picker-market',picker.market===v?'active':'',`data-value="${v}"`)).join('')}${button('本地上传','upload','')}</div><input class="search" id="collectionSearch" aria-label="搜索合集" placeholder="搜索合集名称或 ID" value="${esc(picker.query)}"><div class="source-picker"><div class="collection-list">${items.map(item=>`<button class="collection ${picker.id===item.id?'active':''}" data-action="picker-collection" data-id="${item.id}"><img class="poster" src="./assets/drama-confrontation.jpg" alt="示例封面"><div><strong>${esc(item.title)}</strong><p>${item.id} · 可用 ${item.availableEpisodes.length} / ${item.totalEpisodes} 集</p></div></button>`).join('')||'<div class="empty">没有找到合集</div>'}</div><div class="subtle-box"><h3>${picked?'配置混剪集数':'先选择一个合集'}</h3>${picked?`<p class="helper">${esc(picked.description)}</p><div class="range-row">第 <input aria-label="合集起始集数" id="pickerStart" type="number" value="${picker.start}"> — <input aria-label="合集结束集数" id="pickerEnd" type="number" value="${picker.end}"> 集</div><div class="pills" style="margin-top:15px">${[10,20,30].map(n=>button('前'+n+'集','picker-range','',`data-value="${n}"`)).join('')}</div><p class="helper">未准备和缺失的剧集不能提交。</p>`:'<p class="helper">国内与海外分别读取各自的合集数据源。</p>'}</div></div>`,button('取消','close')+button('使用合集与选集','apply-source','primary',picked?'':'disabled'));$('#dialog').classList.add('wide');}
function showCapacityDialog(){
 const p=state.plan,count=Math.min(remainingPlans().length,p.config.count);
 const reason=p.reason||(count?'所选剧情可用高光有限，已排除重复或过度相似的内容。':'所选剧情无法满足当前制作时长，请增加集数或调整时长。');
 modal('可生成数量不足',`<div class="capacity-summary"><h3>计划 ${p.config.count} 条，可生成 ${count} 条</h3><p class="helper">${esc(reason)}</p>${p.excluded?`<p class="helper">已排除 ${p.excluded} 个内容过度相似的方向。</p>`:''}</div><div class="cost-breakdown"><span>已完成分析</span><strong>${p.analysisCharge} 积分</strong><span>本次制作 · ${count} 条</span><strong>${count*productionRate(p.config)} 积分</strong></div><p class="helper">按实际生成条数计费；返回调整不收制作费，已完成分析可复用。</p>`,button('返回调整','create')+(count?button('生成 '+count+' 条','generate-available','primary'):''));
}
async function prepare(){
 if(busy)return;
 if(localVideo){toast('当前文件仅供本地预览，请先选择片源');return;}
 const c=clone(state.config),error=validate(c);
 if(error){toast(error);return;}
 const info=analysisInfo(state,c),required=estimate(state,c,c.count).total;
 if(required>state.balance){toast('积分不足，请减少条数或调整时长');return;}
 busy=true;render();
 modal('整理所选剧情',`<h3>${info.pending.length?'补分析 '+info.pending.length+' 集':'复用已有剧情分析'}</h3><p class="helper">复用 ${info.reused.length} 集 · 新增 ${info.pending.length} 集，分析完成扣 ${info.pending.length} 积分。</p><div class="progress-track"><i></i></div>`,button('取消分析','cancel-analysis'));
 const operation=Date.now();prepare.operation=operation;
 await new Promise(r=>setTimeout(r,1100));if(prepare.operation!==operation)return;
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
 const error=validate(p.config);if(error){toast(error);return;}
 const plans=remainingPlans().slice(0,p.config.count);
 if(!plans.length){toast('当前没有可生成的内容，请调整片源或时长');return;}
 if(state.assets[assetKey(p.config)]?.revision!==p.analysisRevision||p.rule.id!==state.activeRule){
  modal('制作依据已更新','<p>剧情分析或制作标准已更新，请重新提交生成。</p>',button('返回调整','create','primary'));return;
 }
 doGenerate(plans);
}
function doGenerate(plans){const p=state.plan;try{const b=createBatch(state,p.config,plans,p.analysisAllocated?0:p.analysisCharge);b.rule=clone(p.rule);b.planSession=p.id;registerDrama(state,p.config);p.analysisAllocated=true;currentBatch=b.id;view='tasks';taskExpanded=true;taskFilters={drama:'all',mode:'all',status:'all'};selected.clear();save();render();b.outputs.forEach((o,i)=>scheduleGenerated(b,o,i,toolsScenario));}catch(e){toast(e.message);}}

function retime(o){let t=0;for(const s of o.segments){const d=s.end-s.start;s.start=Math.round(t*100)/100;t+=d;s.end=Math.round(t*100)/100;}o.duration=Math.round(t*100)/100;}
function locate(t){const o=output();if(!o)return;playerAt=t;const s=o.segments.find(x=>t>=x.start&&t<x.end)||o.segments.at(-1);if($('#screenText'))$('#screenText').textContent=s.text;if($('#screenSource'))$('#screenSource').textContent=`第 ${s.sourceEp} 集 ${fmt(s.sourceStart)} · ${s.label}`;if($('#scrubber'))$('#scrubber').value=t;if($('#playerTime'))$('#playerTime').textContent=fmt(t)+' / '+fmt(o.duration);}
function exportPlans(outputs,b=batch()){if(outputs.some(o=>o.narrationDraft)){toast('请先保存或放弃文案修改，再导出');return;}if(!outputs.length){toast('请先选择素材');return;}const blob=new Blob([JSON.stringify({demo:true,notice:'故事板方案，非真实视频',source:b.config.source,config:b.config,rule:b.rule,analysis:b.analysisSnapshot,outputs},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mixed-cut-v7-'+b.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已导出包含来源与版本的剪辑方案');}
document.addEventListener('click',async e=>{const el=e.target.closest('button,[data-action]');if(!el||el.disabled)return;if(el.dataset.nav){nav(el.dataset.nav);return;}const a=el.dataset.action;if(!a)return;if(view==='review'&&output()?.narrationDraft&&['confirm-output','confirm-next','confirm-sync','speak','report-issue','repair','rework','export-one','export-srt'].includes(a)){toast('请先保存或放弃文案修改');reviewTab='narration';render();return;}if(a.startsWith('sync-')){if(el.dataset.batch)currentBatch=el.dataset.batch;syncUI.handle(a,el);return;}if(['save-narration','save-full-narration','report-issue','repair','confirm-output','confirm-next','confirm-sync'].includes(a)&&batch()&&output()&&(syncUI.locked(batch(),output())||output().repairing||output().reworkPending)){toast('当前版本同步中或待核实，请先查询同步结果');return;}
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
 case 'open-drama':openDrama(el.dataset.id);break;
 case 'make-drama':openDrama(el.dataset.id,'tasks',true);break;
 case 'current-drama':currentDrama=dramaKey(state.config);dramaTab='tasks';save();nav('drama');break;
 case 'drama-tab':dramaTab=el.dataset.value==='outputs'?'outputs':'tasks';render();break;
 case 'clear-drama-filters':libraryFilters={query:'',market:'all',status:'all'};render();break;
 case 'clear-task-filters':taskFilters={drama:'all',mode:'all',status:'all'};render();break;
 case 'batch-drama':openDrama(dramaKey(batch().config),'tasks');break;
 case 'repeat-batch':{const b=state.batches.find(b=>b.id===el.dataset.id);if(!b)return;registerDrama(state,state.config,{touch:false});state.config=clone(b.config);currentDrama=dramaKey(b.config);localVideo=null;save();nav('create');break;}
 case 'review-drama-output':case 'review-item':startReview(el.dataset.batch,el.dataset.id);break;
 case 'picker-market':picker.market=el.dataset.value;picker.id=null;picker.query='';renderPicker();break;
 case 'picker-collection':picker.id=el.dataset.id;picker.start=1;picker.end=Math.min(30,getCollection(picker.market,picker.id).totalEpisodes);renderPicker();break;
 case 'picker-range':picker.start=1;picker.end=Number(el.dataset.value);renderPicker();break;
 case 'apply-source':{const c={...state.config,source:{kind:'green',market:picker.market,collectionId:picker.id,fileVersion:1},start:Number($('#pickerStart').value),end:Number($('#pickerEnd').value)};const err=validateSourceSelection(c);if(err){toast(err);return;}registerDrama(state,state.config,{touch:false});state.config=c;registerDrama(state,c);localVideo=null;currentDrama=dramaKey(c);dramaTab='tasks';save();closeModal();if(['assets','drama'].includes(view))nav('drama');else render();break;}
 case 'upload':modal('导入本地原片','<p>请选择需要导入的原片视频。</p><input class="file-input" type="file" id="localFile" aria-label="选择原片视频" accept="video/*">',button('取消','close'));break;
 case 'manual-source':registerDrama(state,state.config,{touch:false});state.config.source={kind:'manual',simulated:true,fileVersion:1,assetId:'manual-'+crypto.randomUUID()};state.config.start=1;state.config.end=30;localVideo=null;save();closeModal();nav('create');break;
 case 'bgm-picker':openBgmPicker();break;
 case 'apply-bgm':applyBgm();break;
 case 'open-task':currentBatch=el.dataset.id;taskExpanded=true;taskFilters={drama:'all',mode:'all',status:'all'};nav('tasks');break;
 case 'toggle-task':if(currentBatch===el.dataset.id)taskExpanded=!taskExpanded;else {currentBatch=el.dataset.id;taskExpanded=true;selected.clear();}render();break;
 case 'review':startReview(currentBatch,el.dataset.id);break;
 case 'back-tasks':closeModal();taskExpanded=true;taskFilters={drama:'all',mode:'all',status:'all'};nav('tasks');break;
 case 'select-all':{const items=batch().outputs.filter(o=>o.status==='ready'&&reviewable(o)&&!o.narrationDraft&&!syncUI.locked(batch(),o));selected=items.every(o=>selected.has(o.id))?new Set():new Set(items.map(o=>o.id));render();break;}
 case 'select-syncable':selected=new Set(batch().outputs.filter(o=>syncUI.canSync(batch(),o)).map(o=>o.id));render();break;
 case 'review-prev':moveReview(-1);break;
 case 'review-next':moveReview(1);break;
 case 'review-defer':if(output()){output().deferredAt=new Date().toISOString();save();}moveReview(1);break;
 case 'review-remaining':{const b=batch(),ids=reviewQueue.ids.filter(id=>{const o=b.outputs.find(o=>o.id===id);return o&&!(o.confirmed&&o.confirmedVersion===o.contentVersion)&&reviewable(o);});closeModal();if(ids.length)startReview(b.id,ids[0],ids);else nav('tasks');break;}
 case 'confirm-next':if(output().confirmed&&output().confirmedVersion===output().contentVersion)moveReview(1);else confirmModal([output()],'next');break;
 case 'confirm-sync':confirmModal([output()],'sync');break;
 case 'quality-locate':stopPlayer();locate(Number(el.dataset.at));break;
 case 'compare-content':{const otherBatch=state.batches.find(b=>b.id===el.dataset.batch),other=otherBatch?.outputs.find(o=>o.id===el.dataset.id);if(other&&output()){stopPlayer();modal('成片内容对比',compareContentDialog(batch(),output(),otherBatch,other,uiHelpers));$('#dialog').classList.add('wide');}break;}
 case 'batch-cost':{const b=state.batches.find(b=>b.id===el.dataset.id);if(b)modal('任务费用明细',costBreakdown(costSummary(state,b),uiHelpers));break;}
 case 'rework':openRework(el.dataset.batch||currentBatch,el.dataset.id||currentOutput,{kind:el.dataset.kind,direction:el.dataset.direction,reason:el.dataset.reason,preferenceId:el.dataset.preference});break;
 case 'rework-kind':reworkDraft.kind=el.dataset.value;showRework();break;
 case 'submit-rework':submitRework();break;
 case 'confirm-output':{const o=output();if(o.confirmed){o.confirmed=false;o.confirmedVersion=null;save();render();}else confirmModal([o]);break;}
 case 'confirm-selected':confirmModal(batch().outputs.filter(o=>selected.has(o.id)));break;
 case 'apply-confirm':{if(!$('#confirmCheck').checked){toast('请先确认检查完成');return;}const versions=JSON.parse(el.dataset.versions),items=versions.map(v=>batch().outputs.find(o=>o.id===v.id));if(items.some((o,i)=>!o||o.status!=='ready'||!reviewable(o)||o.narrationDraft||o.contentVersion!==versions[i].version||syncUI.locked(batch(),o))){toast('素材状态已变化，请重新检查');return;}items.forEach(o=>{recordFeedback(state,batch(),o,{kind:'acceptance',reason:'人工确认可用'});o.confirmed=true;o.confirmedVersion=o.contentVersion;o.confirmedAt=new Date().toISOString();delete o.deferredAt;});const follow=confirmFollowup;confirmFollowup=null;save();closeModal();render();if(follow==='next')moveReview(1);else if(follow==='sync')syncUI.open(batch(),items);else toast('当前版本已确认，可同步到素材管理');break;}
 case 'discard-narration':delete output().narrationDraft;save();render();toast('已恢复保存的文案');break;
 case 'review-tab':stopPlayer();reviewTab=el.dataset.value;render();break;
 case 'segment':case 'junction':locate(output().segments[Number(el.dataset.index)].start);break;
 case 'play':if(playerTimer){stopPlayer();el.textContent='▶';}else{if(playerAt>=output().duration)locate(0);el.textContent='Ⅱ';playerTimer=setInterval(()=>{if(playerAt>=output().duration){stopPlayer();return;}locate(Math.min(playerAt+1,output().duration));},1000);}break;
 case 'play-junctions':{stopPlayer();const segments=output().segments.slice(1);if(!segments.length){toast('当前只有一个完整片段，没有衔接点');return;}let i=0;locate(Math.max(0,segments[0].start-3));playerTimer=setInterval(()=>{if(i>=segments.length){stopPlayer();return;}const at=segments[i].start;locate(playerAt+1);if(playerAt>=at+3){i++;if(segments[i])locate(Math.max(0,segments[i].start-3));}},1000);break;}
 case 'save-full-narration':{const o=output();if(o.repairing){toast('正在修复，请稍后编辑');return;}if(syncUI.locked(batch(),o)){toast('当前版本同步中，请先查询结果');return;}const fields=$$('[data-full-narration]'),texts=fields.map(el=>el.value.trim());if(texts.some(t=>!t)){toast('每段解说都需要完整文案');return;}if(!fields.some((el,i)=>o.segments[Number(el.dataset.fullNarration)].text!==texts[i])){delete o.narrationDraft;save();render();toast('文案没有变化');return;}const changed=new Set(fields.filter((el,i)=>o.segments[Number(el.dataset.fullNarration)].text!==texts[i]).map(el=>o.segments[Number(el.dataset.fullNarration)].id));fields.forEach((el,i)=>{o.segments[Number(el.dataset.fullNarration)].text=texts[i];});o.issues=o.issues.filter(issue=>!(issue.type==='narration'&&changed.has(issue.segmentId)));o.status=o.issues.length?'issue':'ready';o.narrationText=o.segments.map(s=>s.text).join('\n\n');delete o.narrationDraft;o.narrationTimingDirty=true;revise(o,'修改全解说分段文案，需重新检查配音时长与画面对应');updateQualityBaselineText(o);save();render();toast('全文已保存到故事板，配音时长需重新检查');break;}
 case 'save-narration':{const o=output(),text=$('#narrationEdit').value.trim();if(!text){toast('文案不能为空');return;}if(o.narrationText===text){delete o.narrationDraft;save();render();toast('文案没有变化');return;}delete o.narrationDraft;o.narrationText=text;o.segments.filter(s=>s.type==='narration').forEach(s=>s.text=text);o.narrationTimingDirty=true;revise(o,'修改解说文案，配音与时长需重新检查');updateQualityBaselineText(o);save();render();toast('已保存到方案，未生成真实配音');break;}
 case 'speak':{if(!window.speechSynthesis){toast('当前浏览器不支持试听');return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(output().narrationText);utterance.rate=Number(batch().config.narrationSpeed||1);utterance.lang=batch().config.language==='en'?'en-US':'zh-CN';speechSynthesis.speak(utterance);toast('浏览器语音示例，不代表生产音色');break;}
 case 'report-issue':{stopPlayer();const o=output(),full=isFullNarration(batch().config);modal(full?'记录全解说问题':'记录当前成片的问题',feedbackForm(batch().config,o,playerAt,uiHelpers),button('取消','close')+button('记录问题',full?'apply-full-issue':'apply-issue','primary'));break;}
 case 'issue-scope':{const all=el.dataset.value==='all';$$('[data-action="issue-scope"]').forEach(b=>{const active=b===el;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('#issueTimeRange').hidden=all;break;}
 case 'apply-full-issue':case 'apply-issue':{try{const o=output(),scope=$('[data-action="issue-scope"].active').dataset.value,range=feedbackRange({scope,start:$('#issueStart').value,end:$('#issueEnd').value},o.duration),item=recordOutputIssue(o,batch().config,$('#issueType').value,range,$('#issueDetail').value);recordFeedback(state,batch(),o,{kind:item.category==='quality'?'quality':'creative-preference',reason:item.label,...range,detail:item.detail});save();closeModal();render();}catch(error){toast(error.message);}break;}
 case 'repair':{const b=batch(),o=output(),i=Number(el.dataset.index),issue=o.issues[i];if(o.repairing||o.reworkPending||!issue)return;o.repairing=true;save();render();afterWork(()=>{o.issues=o.issues.filter(x=>x!==issue);o.repairing=false;o.status=o.issues.length?'issue':'ready';revise(o,'局部修复：'+issue.label);o.quality={status:o.issues.length?'attention':'passed',repaired:true,checkedAt:new Date().toISOString()};recordFeedback(state,b,o,{kind:'remedy',reason:'局部修复完成',at:issue.at,endAt:issue.endAt??null,scope:issue.scope||'segment',detail:issue.label});save();if(['review','assets','drama','tasks'].includes(view))render();toast('局部修复完成，未新增扣费；请重新检查');},900);break;}
 case 'cancel-generation':{const b=batch();b.outputs.filter(o=>o.status==='pending').forEach(o=>{o.attempt=(o.attempt||0)+1;settleOutput(state,b,o,false);});save();render();toast('未完成条目的冻结积分已释放');break;}
 case 'retry-output':{if(el.dataset.batch)currentBatch=el.dataset.batch;const b=batch(),o=b.outputs.find(o=>o.id===el.dataset.id);if(o.status!=='failed')return;if(state.balance<b.cost.unit){toast('示例积分不足');return;}state.balance-=b.cost.unit;b.cost.frozen+=b.cost.unit;o.status='pending';b.status='running';state.ledger.unshift({id:'RE-'+Date.now(),batch:b.id,type:'补生成冻结',points:-b.cost.unit,at:new Date().toISOString()});scheduleGenerated(b,o,0,'normal');save();render();break;}
 case 'export-srt':{const o=output();const time=t=>{const ms=Math.round(t*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(v=>String(v).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0');};const text=o.segments.map((s,i)=>`${i+1}\n${time(s.start)} --> ${time(s.end)}\n${s.text}\n`).join('\n');const u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=o.id+'-V'+o.contentVersion+'-示例.srt';a.click();setTimeout(()=>URL.revokeObjectURL(u),500);toast('字幕时间按故事板示意，不能作为实际口播对齐结果');break;}
 case 'export-one':exportPlans([output()]);break;case 'export-selected':exportPlans(batch().outputs.filter(o=>selected.has(o.id)));break;
 case 'new-source-version':closeModal();state.config.source.fileVersion=(state.config.source.fileVersion||1)+1;save();render();toast('已切换新的示例原片版本，需要重新分析');break;
 case 'demo-tools':modal('演示设置',`<div class="list-row"><div><b>生成场景</b><p>仅影响下一批</p></div><select id="generationScenario" aria-label="生成场景">${option('normal','全部成功',toolsScenario)}${option('partial','最后一条制作失败',toolsScenario)}${option('qc-repair','自动修复后通过',toolsScenario)}${option('qc-attention','一条需人工核对',toolsScenario)}${option('qc-fail','一条检查失败释放积分',toolsScenario)}</select></div><div class="list-row"><div><b>单条返工场景</b><p>不影响其他成片</p></div><select id="reworkScenario" aria-label="单条返工场景">${option('normal','成功生成新版本',state.reworkScenario||'normal')}${option('failed','失败保留原片',state.reworkScenario||'normal')}</select></div><div class="list-row"><div><b>素材同步场景</b><p>同步为本地模拟</p></div><select id="syncScenario" aria-label="素材同步场景">${option('normal','全部成功',state.syncScenario)}${option('partial','最后一条失败',state.syncScenario)}${option('unknown','结果待核实',state.syncScenario)}</select></div><div class="list-row"><div><b>原片版本</b><p>演示重新分析新版本</p></div>${button('更换原片版本','new-source-version','secondary')}</div><div class="list-row"><div><b>手动片源示例</b><p>同步时选择国内或海外</p></div>${button('切换','manual-source','secondary')}</div><div class="list-row"><div><b>重置本版演示</b><p>只清除 V7 本机示例记录</p></div>${button('重置','reset-prompt','text-btn danger')}</div>`,button('保存设置','save-tools','primary'));break;
 case 'save-tools':toolsScenario=$('#generationScenario').value;state.syncScenario=$('#syncScenario').value;state.reworkScenario=$('#reworkScenario').value;save();closeModal();toast('演示设置已保存');break;
 case 'reset-prompt':modal('重置 V7 演示','<p>清除本机 V7 示例任务、分析、标准与积分记录。其他版本不受影响。</p>',button('取消','close')+button('重置示例','reset','primary'));break;
 case 'reset':genTimers.forEach(clearTimeout);genTimers.clear();prepare.operation=null;busy=false;state=initialState();currentDrama=dramaKey(state.config);dramaTab='tasks';libraryFilters={query:'',market:'all',status:'all'};taskFilters={drama:'all',mode:'all',status:'all'};syncUI.reset();currentBatch=null;currentOutput=null;reviewQueue=null;confirmFollowup=null;reworkDraft=null;toolsScenario='normal';localVideo=null;save();closeModal();nav('create');break;
 }
});
function updateQualityBaselineText(o){if(!o.qualityBaseline)return;for(const seg of o.qualityBaseline.segments){const current=o.segments.find(s=>s.id===seg.id);if(current)seg.text=current.text;}o.qualityBaseline.narrationText=o.narrationText;o.qualityBaseline.narrationTimingDirty=Boolean(o.narrationTimingDirty);}
function afterWork(fn,ms){const timer=setTimeout(()=>{genTimers.delete(timer);fn();},ms);genTimers.add(timer);return timer;}
function scheduleGenerated(b,o,index,scenario){
 const attempt=(o.attempt||0)+1;o.attempt=attempt;o.quality={status:'generating'};
 const active=()=>o.attempt===attempt&&o.status==='pending'&&state.batches.includes(b);
 const paint=()=>{save();if(['assets','drama','tasks','review'].includes(view))render();};
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
function startReview(batchId,outputId,ids=null){
 const b=state.batches.find(b=>b.id===batchId),o=b?.outputs.find(o=>o.id===outputId);
 if(!o||!reviewable(o)){toast('这条素材正在处理，请稍后检查');return;}
 currentBatch=b.id;currentOutput=o.id;reviewTab='junction';
 const all=ids||b.outputs.filter(reviewable).map(o=>o.id),at=all.indexOf(o.id);reviewQueue={batchId:b.id,ids:[...all.slice(at),...all.slice(0,at)],index:0};
 nav('review');
}
function reviewQueueBar(b,o){
 if(!reviewQueue||reviewQueue.batchId!==b.id||!reviewQueue.ids.includes(o.id))reviewQueue={batchId:b.id,ids:b.outputs.filter(reviewable).map(o=>o.id),index:0};
 reviewQueue.index=reviewQueue.ids.indexOf(o.id);
 const at=reviewQueue.index,last=at===reviewQueue.ids.length-1,locked=syncUI.locked(b,o)||!reviewable(o),confirmed=o.confirmed&&o.confirmedVersion===o.contentVersion;
 const confirmable=o.status==='ready'&&!o.narrationDraft&&!locked;
 return `<div class="review-queue"><div class="queue-position">检查 ${at+1} / ${reviewQueue.ids.length}<small>当前任务 · 逐条检查</small></div><div class="actions">${button('上一条','review-prev','secondary',at>0?'':'disabled')}${button(last?'完成本轮':'稍后处理，下一条','review-defer','text-btn')}${confirmed?button('取消确认','confirm-output','text-btn',locked?'disabled':''):button('确认并同步','confirm-sync','secondary',confirmable?'':'disabled')}${button(confirmed?(last?'查看检查结果':'已确认，下一条'):(last?'确认并完成':'确认并下一条'),'confirm-next','primary',confirmable?'':'disabled')}</div></div>`;
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
 if(!b||!o||!reviewable(o)||syncUI.locked(b,o)){toast('当前素材正在处理或同步，请稍后操作');return;}
 if(o.narrationDraft){toast('请先保存或放弃文案修改');return;}
 const preference=(o.preferences||[]).find(p=>p.id===options.preferenceId);reworkDraft={batchId,outputId,kind:options.kind||(o.issues.length?'quality':'creative'),direction:options.direction||'opening',reason:options.reason||'opening',instruction:preference?.detail||''};showRework();
}
function showRework(){
 const d=reworkDraft,b=state.batches.find(b=>b.id===d.batchId),o=b.outputs.find(o=>o.id===d.outputId),quality=d.kind==='quality';
 modal('单条返工',`<p><strong>${esc(o.title)}</strong></p><div class="pills" id="reworkKind">${button('修复质量问题','rework-kind',quality?'active':'',`data-value="quality" ${o.issues.length?'':'disabled title="先记录需要修复的问题"'}`)}${button('更换创作方向','rework-kind',!quality?'active':'','data-value="creative"')}</div>${quality?`<div class="subtle-box">${o.issues.map(i=>`<p>${esc(i.label)} · ${issueRangeLabel(i)}</p>`).join('')}</div>`:`<div class="field"><label for="reworkFeedback">调整原因</label><select id="reworkFeedback" aria-label="调整原因">${[['opening','开场不够吸引'],['slow','铺垫太长'],['similar','与已有素材相似'],['angle','想尝试其他方向']].map(([value,label])=>option(value,label,d.reason)).join('')}</select></div><div class="field"><label>希望优先调整</label><div class="rework-options">${[['opening','强化开头'],['context','补足铺垫'],['angle','更换剧情切入']].map(([value,label])=>`<label><input type="radio" name="reworkDirection" value="${value}" ${d.direction===value?'checked':''}>${label}</label>`).join('')}</div></div><div class="field"><label for="reworkReason">补充要求（选填）</label><textarea id="reworkReason" rows="3" maxlength="200" placeholder="例如：从女主受到质疑的场景开场">${esc(d.instruction)}</textarea></div>`}<div id="reworkQuote"><div><b>${quality?'系统质量补救':'重新制作这一条'}</b><p class="helper">${quality?'不新增积分消耗':'开始时冻结，成功后扣除；失败释放'}</p></div><strong>${quality?0:b.cost.unit} 积分</strong></div><p class="rework-note">新版本完成后需重新检查；失败保留原片。已同步的旧版本不会被替换。</p>`,button('取消','close')+button(quality?'免费修复这一条':'确认重做 · '+b.cost.unit+' 积分','submit-rework','primary'));
}
function submitRework(){
 const d=reworkDraft;if(!d)return;const b=state.batches.find(b=>b.id===d.batchId),o=b?.outputs.find(o=>o.id===d.outputId);
 if(!o||syncUI.locked(b,o)){toast('当前版本同步中，请先查询同步结果');return;}
 if(d.kind==='creative'){d.direction=$('input[name="reworkDirection"]:checked')?.value||d.direction;d.instruction=$('#reworkReason').value.trim();d.reason=$('#reworkFeedback').value;}
 try{
  const job=beginRework(state,b,o,{kind:d.kind,direction:d.direction,instruction:d.instruction});
  recordFeedback(state,b,o,{kind:d.kind==='quality'?'remedy-request':'creative-preference',reason:d.kind==='quality'?'修复已记录质量问题':({opening:'开场不够吸引',slow:'铺垫太长',similar:'与已有素材相似',angle:'想尝试其他方向'}[d.reason]),detail:d.instruction,operationId:job.operationId});const fail=state.reworkScenario==='failed';reworkDraft=null;save();closeModal();render();toast('正在重新制作这一条');
  afterWork(()=>{if(o.reworkPending?.operationId!==job.operationId)return;const result=finishRework(state,b,o,!fail);if(result.success)o.quality={status:'passed',repaired:job.kind==='quality',checkedAt:new Date().toISOString()};recordFeedback(state,b,o,{kind:'rework-result',reason:result.success?'返工完成':'返工失败',operationId:job.operationId});save();render();toast(result.success?'新版本已完成，请重新检查':'重做未完成，已保留原片并释放新增冻结积分');},1300);
 }catch(e){toast(e.message);}
}

function confirmModal(items,followup=null){confirmFollowup=followup;if(items.some(o=>o.narrationDraft)){toast('所选素材有未保存的文案，请先保存或放弃修改');return;}if(!items.length||items.some(o=>o.status!=='ready'||!reviewable(o)||syncUI.locked(batch(),o))){toast('请选择已生成且无待处理问题的当前版本');return;}modal('确认 '+items.length+' 条素材可用',`<p>${isFullNarration(batch().config)?'请检查全文解说是否完整、文案与画面是否对应、配音时长和字幕是否合适，原片人声是否关闭。':'请检查剧情是否连贯、对白是否完整、字幕与 BGM 是否合适。'}系统检查通过不等于已经人工验收。</p><label class="check-confirm"><input id="confirmCheck" type="checkbox">已检查所选素材，确认当前版本可以使用</label>`,button('返回检查','close')+button(followup==='sync'?'确认并填写上传信息':followup==='next'?'确认并继续':'确认可用','apply-confirm','primary',`data-versions="${esc(JSON.stringify(items.map(o=>({id:o.id,version:o.contentVersion}))))}"`));}
document.addEventListener('change',e=>{const el=e.target;if(el.id==='issueType'){const item=ISSUE_TYPES.find(t=>t.id===el.value);$('#issueCategoryHint').textContent=item?.category==='creative'?'创作调整将在重做前确认费用。':'质量问题按修复流程处理。';return;}if(el.id==='reworkFeedback'&&reworkDraft){reworkDraft.reason=el.value;return;}if(el.name==='reworkDirection'&&reworkDraft){reworkDraft.direction=el.value;return;}if(el.name==='bgmTrack'){const track=BGM_TRACKS.find(t=>t.id===el.value),mood=$('#bgmMood');if(track&&mood){mood.disabled=Boolean(track.mood);if(track.mood)mood.value=track.mood;}return;}const filters={dramaMarket:[libraryFilters,'market'],dramaStatus:[libraryFilters,'status'],taskDrama:[taskFilters,'drama'],taskMode:[taskFilters,'mode'],taskStatus:[taskFilters,'status']};if(filters[el.id]){filters[el.id][0][filters[el.id][1]]=el.value;render();return;}if(el.id==='dramaOutputFilter'){dramaOutputFilter=el.value;render();return;}if(el.dataset.config){const key=el.dataset.config;if(key==='titleText')return;if(key==='bgm'&&el.checked){render();openBgmPicker();return;}if(key==='outputSpeed')applyOutputSpeed(state.config,Number(el.value));else if(key==='independentNarrationSpeed'){state.config.independentNarrationSpeed=el.checked;if(!el.checked)state.config.narrationSpeed=state.config.outputSpeed;else state.config.narrationSpeed=state.config.narrationSpeedOverride||1;}else if(key==='narrationSpeed'){state.config.narrationSpeedOverride=Number(el.value);state.config.narrationSpeed=Number(el.value);}else state.config[key]=el.type==='checkbox'?el.checked:['start','end','count','speed','narrationSpeed'].includes(key)?Number(el.value):el.value;state.config=normalizeCreationConfig(state.config);save();if(!$('#dialog').open){if(el.type==='number'){refreshCreationPreview();return;}render();if(key==='title'&&state.config.title)$('[data-config="titleText"]')?.focus();}}if(el.dataset.output){el.checked?selected.add(el.dataset.output):selected.delete(el.dataset.output);render();}if(el.id==='pickerStart')picker.start=Number(el.value);if(el.id==='pickerEnd')picker.end=Number(el.value);if(el.id==='localFile'&&el.files[0]){if(localVideo)URL.revokeObjectURL(localVideo);localVideo=URL.createObjectURL(el.files[0]);modal('本地原片预览',`<video class="source-preview-video" controls src="${localVideo}"></video><p class="helper">文件仅在本机预览，尚未导入。</p>`,button('关闭','close'));}});
document.addEventListener('input',e=>{if(e.target.id==='reworkReason'&&reworkDraft){reworkDraft.instruction=e.target.value;return;}if(e.target.id==='narrationEdit'||e.target.hasAttribute('data-full-narration')){const o=output();if(!o)return;const full=isFullNarration(batch().config),texts=full?$$('[data-full-narration]').map(el=>el.value):[e.target.value],original=full?o.segments.map(s=>s.text):[o.narrationText];if(texts.some((t,i)=>t!==original[i]))o.narrationDraft=texts;else delete o.narrationDraft;save();if($('#narrationDraftNotice'))$('#narrationDraftNotice').hidden=!o.narrationDraft;return;}if(e.target.id==='dramaSearch'){const pos=e.target.selectionStart;libraryFilters.query=e.target.value;render();$('#dramaSearch').focus();$('#dramaSearch').setSelectionRange(pos,pos);return;}if(e.target.dataset.config&&(e.target.type==='number'||e.target.dataset.config==='titleText')){state.config[e.target.dataset.config]=e.target.type==='number'?Number(e.target.value):e.target.value;save();refreshCreationPreview();}if(e.target.id==='collectionSearch'){const pos=e.target.selectionStart;picker.query=e.target.value;renderPicker();$('#collectionSearch').focus();$('#collectionSearch').setSelectionRange(pos,pos);}if(e.target.id==='scrubber'){stopPlayer();locate(Number(e.target.value));}});
// An interrupted local simulation releases pending work, never fabricates success.
for(const b of state.batches){for(const o of b.outputs){if(o.status==='pending')settleOutput(state,b,o,false);if(o.repairing)o.repairing=false;if(o.reworkPending)finishRework(state,b,o,false);} }
save();render();
// Optional agent access uses the same local demo actions as the visible UI.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const registrations=[
  {name:'inspect_mixed_cut_demo',title:'查看混剪演示状态',description:'Read the current local fictional demo configuration, planned count and example balance; does not call AI or external systems.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({view,config:clone(state.config),balance:state.balance,plans:state.plan?.candidates.length||0,batches:state.batches.length,simulated:true})},
  {name:'configure_and_generate_mixed_cut_demo',title:'配置并生成混剪演示素材',description:'Configure and submit the same generation flow as the UI. Automatically analyzes and generates fictional outputs, deducting example points; insufficient content opens quantity confirmation. Does not call AI, spend money, or sync outputs.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['highlight','narrated']},start:{type:'integer',minimum:1},end:{type:'integer',minimum:1,maximum:40},count:{type:'integer',minimum:1,maximum:20},narrationStructure:{type:'string',enum:['mixed','full']},outputSpeed:{type:'number',enum:[0.8,1,1.1,1.2,1.5]},independentNarrationSpeed:{type:'boolean'},narrationSpeed:{type:'number',enum:[0.8,1,1.1,1.2,1.5]},duration:{type:'string',enum:Object.keys(RANGES)}},required:['mode','start','end','count'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(!editingSessionActive)throw Error('Editor session has moved');if(busy)throw Error('分析进行中');if(localVideo)throw Error('本地文件仅预览，请先切换虚构片源');if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['mode','start','end','count','narrationStructure','outputSpeed','independentNarrationSpeed','narrationSpeed','duration'].includes(k)))throw Error('无效配置');const c=normalizeCreationConfig({...state.config,...input,...(input.narrationSpeed!==undefined?{narrationSpeedOverride:input.narrationSpeed}:{})});const error=validate(c);if(error)throw Error(error);state.config=c;save();await prepare();return {view,candidates:state.plan?.candidates.length||0,balance:state.balance,simulated:true};}}
 ];for(const tool of registrations){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
