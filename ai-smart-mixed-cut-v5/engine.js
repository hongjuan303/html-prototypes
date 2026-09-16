import {EPISODES,getEpisodes} from './story-data.js?v=20260916-publish1';
import {resolveSource} from './sources.js?v=20260916-publish1';
import {fullNarrationCandidates} from './full-narration.js?v=20260916-publish1';
export {getEpisodes};
export const clone=v=>JSON.parse(JSON.stringify(v));
export const CREATION_MODES=Object.freeze(['highlight','narrated']);
export const NARRATION_SPEEDS=Object.freeze([0.8,1,1.1,1.2,1.5]);
export function narrationSpeed(c){return c?.narrationSpeed??1;}
export function narrationBudget(c,seconds){const speed=narrationSpeed(c),english=c.language==='en';return {speed,targetSeconds:seconds,normalSpeedSeconds:round(seconds*speed),targetUnits:Math.round(seconds*speed*(english?2.35:4.1)),unit:english?'words':'characters',timing:'estimated'};}
export const MODES={original:{name:'原片混剪',short:'剧情压缩',desc:'保留原声，按因果顺序删减剧情',flow:['交代起因','保留关键对白','压缩过渡','留悬念']},highlight:{name:'高光混剪',short:'突出冲突',desc:'围绕一个冲突，补齐铺垫与反转',flow:['冲突开场','补足背景','冲突升级','悬念收尾']},narrated:{name:'AI 解说',short:'解说叙事',desc:'选择解说与原片搭配，或用完整解说贯穿全片',flow:['选择解说结构','依据剧情写稿','匹配画面与声音','检查完整成片']}};
export const RANGES={'30s':[27,35],'60s':[55,65],'90s':[85,95],'120s':[110,130],'1':[45,80],'3':[150,210],'5':[270,330],'10':[540,660],'3-5':[180,300],'5-7':[300,420]};
export const DEFAULT={mode:'highlight',source:{kind:'green',market:'domestic',collectionId:'collection-001',fileVersion:1},start:1,end:30,count:10,duration:'3-5',speed:1.5,narrationSpeed:1,narrationStructure:null,narrationSeconds:null,position:'intro',language:'zh',bgm:true,subtitles:true,title:false,titleText:'',music:'tension',bgmTrack:'auto'};
export const EVENTS=[
 {id:'e1',name:'合同附页暴露旧案',start:1,end:6,conflict:'身份被质疑，合同附页却暴露了旧案',motive:'争取当场核验与主创署名',endText:'公开比稿即将开始，规则由谁决定？',angles:['核验附页','追问日期','证人作证'],hooks:[1,2,5]},
 {id:'e2',name:'纸质底稿扭转比稿',start:7,end:12,conflict:'演示文件损坏，纸质底稿成为反击证据',motive:'在公平规则下证明设计能力',endText:'当年的申诉，为什么没有送达？',angles:['争取公平','需求缺页','文件故障'],hooks:[7,8,9]},
 {id:'e3',name:'预算疑点牵出旧记录',start:13,end:18,conflict:'新合作之前，旧预算的用途说明被发现有改动',motive:'先说清旧责任，再谈新合作',endText:'原版设计找到了，项目方会公开更正吗？',angles:['拒绝和解','预算异常','暂停付款'],hooks:[13,14,15]},
 {id:'e4',name:'恢复署名，独立谈判',start:19,end:24,conflict:'撤回指控还不够，她要求公开更正与独立合作',motive:'赢回公开认可与合作自主权',endText:'方案得到认可，小团队如何证明交付能力？',angles:['公开更正','合作条件','独立身份'],hooks:[19,21,22]},
 {id:'e5',name:'签约之前的最后核验',start:25,end:30,conflict:'团队通过审查，却发现供应商资料仍有遗漏',motive:'守住审核底线与交付责任',endText:'签约结束，新邮件里还有谁没有说出的秘密？',angles:['团队质疑','承担责任','名单异常'],hooks:[25,26,27]}
];
export const RULE={id:'R1',name:'投放通用标准',version:1,opening:'conflict',context:true,ending:'suspense',maxOverlap:85,note:'完整对白、事实可溯源、字幕同步和人声清晰为固定底线。',createdAt:'2026-09-15',tested:true};
export function assetKey(c){const s=c.source||{};return [s.kind,s.market||'unknown',s.collectionId||s.assetId||'manual-demo',s.fileVersion||1,c.language||'zh'].join(':');}
export function isFullNarration(c){return c?.mode==='narrated'&&c.narrationStructure==='full';}
export function targetSeconds(c){const exact={'30s':30,'60s':60,'90s':90,'120s':120};const range=RANGES[c.duration];return exact[c.duration]||(range?(range[0]+range[1])/2:0);}
export function productionRate(c){if(isFullNarration(c))return 32+Math.ceil(targetSeconds(c)/30)*18;return c.mode==='narrated'?50:c.mode==='highlight'?32:28;}
export function modeLabel(c){if(c.mode==='original')return '原片混剪（历史任务）';if(c.mode==='narrated')return c.narrationStructure==='full'?'AI 解说 · 全解说':c.narrationStructure==='mixed'?'AI 解说 · 解说＋原片':'AI 解说＋原片（历史任务）';return MODES[c.mode]?.name||'未知制作方式';}
export function normalizeCreationConfig(config){const c=clone({...DEFAULT,...config});if(!NARRATION_SPEEDS.includes(c.narrationSpeed))c.narrationSpeed=1;if(c.mode==='original')c.mode='highlight';if(!CREATION_MODES.includes(c.mode))c.mode='highlight';if(c.mode==='narrated'&&!['mixed','full'].includes(c.narrationStructure)){c.narrationStructure=null;c.narrationSeconds=null;}if(c.mode==='narrated'&&c.narrationStructure==='mixed'&&!Number.isFinite(c.narrationSeconds))c.narrationSeconds=null;if(c.mode!=='narrated'){c.narrationStructure=null;c.narrationSeconds=null;}if(c.narrationStructure==='full')c.narrationSeconds=null;return c;}
export function validate(c){const s=resolveSource(c);if(!s)return '片源已失效，请重新选择合集';if(!Number.isInteger(c.start)||!Number.isInteger(c.end)||c.start<1||c.start>c.end||c.end>s.totalEpisodes)return '请填写有效的起止集数';const missing=Array.from({length:c.end-c.start+1},(_,i)=>c.start+i).filter(id=>!s.availableEpisodes.includes(id));if(missing.length)return '所选第 '+missing.join('、')+' 集暂无片源，请调整范围';if(!Number.isInteger(c.count)||c.count<1||c.count>20)return '每批支持 1–20 条';if(!CREATION_MODES.includes(c.mode))return '请选择制作方式';if(c.mode==='narrated'&&!['mixed','full'].includes(c.narrationStructure))return '请选择解说结构：解说＋原片或全解说';if(!RANGES[c.duration])return '请选择成片时长';if(!isFullNarration(c)&&![1,1.1,1.2,1.5].includes(c.speed))return '请选择原片速度';if(c.mode==='narrated'&&!NARRATION_SPEEDS.includes(narrationSpeed(c)))return '请选择解说语速';if(!isFullNarration(c)&&c.duration.endsWith('s'))return '此时长适用于全解说，请重新选择成片时长';if(c.mode==='narrated'&&c.narrationStructure==='mixed'&&(!Number.isFinite(c.narrationSeconds)||c.narrationSeconds<5||c.narrationSeconds>120))return '请选择解说总时长，支持 5–120 秒';if(c.mode==='narrated'&&c.narrationStructure==='mixed'&&c.narrationSeconds>=RANGES[c.duration][1]-25)return '解说过长，请增加成片时长或缩短口播';if(c.title&&!String(c.titleText||'').trim())return '请输入引流小标题';if(c.title&&Array.from(String(c.titleText).trim()).length>24)return '引流小标题最多 24 字';return null;}
export function analysisInfo(state,c){const cache=state.assets[assetKey(c)];const ids=Array.from({length:Math.max(0,c.end-c.start+1)},(_,i)=>c.start+i);const reused=ids.filter(id=>cache?.episodes.includes(id));return {ids,reused,pending:ids.filter(id=>!reused.includes(id)),cache};}
export function analyze(state,c){const info=analysisInfo(state,c);const k=assetKey(c),old=state.assets[k];state.assets[k]={episodes:[...new Set([...(old?.episodes||[]),...info.ids])].sort((a,b)=>a-b),revision:old?.revision||1,character:old?.character||'林知夏',updatedAt:new Date().toISOString()};return {...info,cache:state.assets[k]};}
const round=x=>Math.round(x*100)/100;
function piece(ep,j){return {id:`ep${ep.id}-${j}`,type:'original',label:j===0?ep.title:'完整问答',sourceEp:ep.id,sourceStart:j===0?0:60,sourceEnd:j===0?50:170,text:j===0?ep.dialogues[0]:ep.dialogues[1]+' '+ep.dialogues[2],fact:ep.story,duration:j===0?50:110,reason:j===0?'保留关键事件与因果':'问句与回答作为完整单元保留'};}
function buildPlan(c,event,angle,rule,cache){
 const range=RANGES[c.duration],narr=c.mode==='narrated'?c.narrationSeconds:0;
 const ids=getEpisodes(c).filter(ep=>ep.id>=Math.max(c.start,event.start)&&ep.id<=Math.min(c.end,event.end));
 if(!ids.length)return null;
 const maxEps=Math.max(1,Math.floor((range[1]-narr)*c.speed/50));
 const windowSize=Math.min(ids.length,maxEps);let startOffset=Math.min(angle,Math.max(0,ids.length-windowSize));
 const eps=ids.slice(startOffset,startOffset+windowSize);
 if(eps.length<2&&range[0]>75)return null;
 let available=eps.flatMap(ep=>[0,1].map(j=>piece(ep,j)));
 let must=eps.map((ep,i)=>piece(ep,rule.ending==='complete'&&i===eps.length-1?1:0));
 // Every candidate keeps each event beat in its chosen window; optional complete
 // dialogue blocks fill time, never truncate a block to hit an exact duration.
 const target=(range[0]+range[1])/2;
 let selected=[...must];
 const alternatives=available.filter(p=>!must.some(m=>m.id===p.id));
 if(angle===1)alternatives.reverse();
 if(angle===2)alternatives.push(...alternatives.splice(0,Math.min(2,alternatives.length)));
 const length=()=>narr+selected.reduce((n,p)=>n+p.duration,0)/c.speed;
 for(const p of alternatives){if(length()>=target)break;if(length()+p.duration/c.speed<=range[1])selected.push(p);}
 if(length()<range[0]||length()>range[1])return null;
 selected.sort((a,b)=>a.sourceEp-b.sourceEp||a.sourceStart-b.sourceStart);
 const hook=selected.find(p=>p.sourceEp===event.hooks[angle])||selected[Math.min(angle,selected.length-1)];
 if(['highlight','narrated'].includes(c.mode)&&rule.opening==='conflict'){
  selected=[{...hook,label:'冲突开场',reason:'先呈现事件核心冲突'},...selected.filter(p=>p.id!==hook.id)];
  if(selected[1]?.sourceEp<hook.sourceEp)selected[1]={...selected[1],label:'稍早 · 补足背景',reason:'明确回叙时间，补齐冲突的前因'};
 }
 if(c.mode==='narrated'&&c.position==='intro'){
  // Original dialogue stays chronological. Narration describes only the first
  // chosen source event, not a conclusion that occurs outside this selection.
 }
 const bridgeIndex=c.position==='middle'?Math.min(2,selected.length-1):0;
 const source=selected[bridgeIndex];
 const character=cache?.character||'林知夏';
 const fact=source.fact.replaceAll('林知夏',character);
 const narration=c.language==='en'?`At this point in the story, the contract and the project are being questioned. Listen to what is said next.`:fact+'接下来，听听他们怎么说。';
 if(narr){selected.splice(bridgeIndex,0,{id:'narr-'+event.id+'-'+angle,type:'narration',label:c.position==='middle'?'剧情承接解说':'解说引入',duration:narr,narrationSpeed:narrationSpeed(c),normalSpeedDuration:round(narr*narrationSpeed(c)),narrationBudget:narrationBudget(c,narr),text:narration,sourceEp:source.sourceEp,sourceStart:source.sourceStart,sourceEnd:source.sourceEnd,reason:'文案依据为紧接的原片事件',evidence:fact});}
 let cursor=0;const segments=selected.map(p=>{const d=p.type==='original'?p.duration/c.speed:p.duration;const item={...p,text:p.text.replaceAll('林知夏',character),start:round(cursor),end:round(cursor+d)};cursor+=d;return item;});
 const original=segments.filter(p=>p.type==='original');
 const fullEvent=eps[0].id===event.start&&eps.at(-1).id===event.end;
 const title=fullEvent?event.name+' · '+event.angles[angle]:eps[0].title+' · '+['事件推进','人物回应','剧情切入'][angle];
 const conflict=fullEvent?event.conflict:eps[0].story;
 const ending=fullEvent&&rule.ending==='suspense'?event.endText:'保留原片结尾：'+original.at(-1).text;
 return {id:event.id+'-'+angle,selected:true,title,eventId:event.id,eventName:event.name,angle:fullEvent?event.angles[angle]:['事件推进','人物回应','剧情切入'][angle],perspective:angle===1?'陆承川 · 追查与判断':'林知夏 · 自证与反击',conflict,motive:fullEvent?event.motive:eps[0].story,ending,hook:original[0].text,episodes:[...new Set(original.map(p=>p.sourceEp))],segments,duration:round(cursor),narrationText:narr?narration:'',analysisRevision:cache?.revision||1,mode:c.mode,narrationStructure:c.mode==='narrated'?'mixed':null,narrationSpeed:c.mode==='narrated'?narrationSpeed(c):null,narrationBudget:narr?narrationBudget(c,narr):null,ruleId:rule.id,reason:(c.mode==='narrated'?['解说承接剧情','接入完整原片对白','原声推进剧情','悬念收尾']:MODES[c.mode].flow).map((v,i)=>i===3&&rule.ending==='complete'?'完整回应':v).join(' → '),removed:'删去无关过场和重复表达；保留上述事件节点及完整对白',simulated:true};
}
function footageIntervals(plan){const byEpisode=new Map();for(const p of plan.segments||[]){if(p.type!=='original'&&!p.footage)continue;if(!Number.isFinite(p.sourceStart)||!Number.isFinite(p.sourceEnd)||p.sourceEnd<=p.sourceStart)continue;const key=String(p.sourceEp);if(!byEpisode.has(key))byEpisode.set(key,[]);byEpisode.get(key).push([p.sourceStart,p.sourceEnd]);}for(const [key,intervals] of byEpisode){intervals.sort((a,b)=>a[0]-b[0]);const merged=[];for(const [start,end] of intervals){const last=merged.at(-1);if(last&&start<=last[1])last[1]=Math.max(last[1],end);else merged.push([start,end]);}byEpisode.set(key,merged);}return byEpisode;}
export function overlap(a,b){const x=footageIntervals(a),y=footageIntervals(b);let xa=0,ya=0,intersection=0;for(const intervals of x.values())for(const [s,e] of intervals)xa+=e-s;for(const intervals of y.values())for(const [s,e] of intervals)ya+=e-s;if(!xa||!ya)return 0;for(const [ep,intervals] of x)for(const [s,e] of intervals)for(const [t,u] of y.get(ep)||[])intersection+=Math.max(0,Math.min(e,u)-Math.max(s,t));return Math.min(100,Math.round(100*intersection/Math.min(xa,ya)));}
export function planBatch(c,rule,cache){const error=validate(c);if(error)return {candidates:[],excluded:0,capacity:0,error,reason:error};const candidates=[];let excluded=0;const available=isFullNarration(c)?fullNarrationCandidates(c,getEpisodes(c).filter(ep=>ep.id>=c.start&&ep.id<=c.end),rule,cache,targetSeconds(c)):EVENTS.flatMap(event=>[0,1,2].map(a=>buildPlan(c,event,a,rule,cache)).filter(Boolean));for(const p of available){const closest=candidates.reduce((best,q)=>Math.max(best,overlap(p,q)),0);if(closest>rule.maxOverlap){excluded++;continue;}p.maxOverlap=closest;candidates.push(p);}return {candidates,excluded,capacity:candidates.length,reason:!candidates.length&&isFullNarration(c)?'所选剧情不足以支撑此时长的完整解说，请增加集数或缩短成片时长；不会重复画面或重复文案凑长。':isFullNarration(c)&&candidates.length<c.count?'当前完整剧情可提供 '+candidates.length+' 个不同的画面方案，按可用方案生成。':null};}
export function estimate(state,c,count){const error=validate(c);if(error||!Number.isInteger(count)||count<0||count>20)return {analysis:0,production:0,total:0,unit:0,illustrative:true,valid:false,error:error||'请填写有效的生成条数'};const info=analysisInfo(state,c),rate=productionRate(c);return {analysis:info.pending.length,production:count*rate,total:info.pending.length+count*rate,unit:rate,illustrative:true,valid:true,pricing:isFullNarration(c)?{base:32,narration:Math.ceil(targetSeconds(c)/30)*18,seconds:targetSeconds(c),per30Seconds:18}:null};}
export function initialState(){const c=clone(DEFAULT);return {config:c,assets:{[assetKey(c)]:{episodes:Array.from({length:10},(_,i)=>i+1),revision:1,character:'林知夏',seeded:true}},rules:[clone(RULE)],activeRule:'R1',ruleDraft:null,ruleHistory:[],batches:[],syncJobs:[],customTags:[],syncScenario:'normal',balance:10000,ledger:[],feedback:[]};}
export function activeRule(state){return state.rules.find(r=>r.id===state.activeRule)||state.rules[0];}
export function outputCost(batch){const accepted=batch.outputs.filter(o=>o.confirmed&&o.confirmedVersion===o.contentVersion&&o.status==='ready').length;return {accepted,points:batch.cost.analysis+batch.cost.production,per:accepted?round((batch.cost.analysis+batch.cost.production)/100/accepted):null};}
let batchSequence=0;
export function createBatch(state,c,plans,analysisCharge=0){const error=validate(c);if(error)throw Error(error);if(!Array.isArray(plans)||!plans.length||plans.length>c.count)throw Error('请选择有效的制作方案');if(plans.some(p=>p.mode!==c.mode||(c.mode==='narrated'&&(p.narrationStructure!==c.narrationStructure||narrationSpeed(p)!==narrationSpeed(c)))||(isFullNarration(c)&&(!p.segments?.length||p.segments.some(s=>s.type!=='narration'||!s.footage||s.sourceAudio!=='muted')))))throw Error('制作方式已变化，请重新生成方案');const production=plans.length*productionRate(c),total=production;if(total>state.balance)throw Error('示例积分不足，请减少条数');const id='V5-'+Date.now().toString(36).toUpperCase()+'-'+(++batchSequence).toString(36).toUpperCase();const rule=clone(activeRule(state));const b={id,created:new Date().toISOString(),config:clone(c.mode==='narrated'?{...c,narrationSpeed:narrationSpeed(c)}:c),rule,sourceTitle:resolveSource(c).title,analysisSnapshot:clone(state.assets[assetKey(c)]||null),outputs:plans.map((p,i)=>({...clone(p),id:id+'-'+(i+1),planId:p.id,status:'pending',contentVersion:1,confirmedVersion:null,confirmed:false,issues:[],revisions:[]})),status:'running',cost:{analysis:analysisCharge,production:0,frozen:production,unit:productionRate(c)},simulated:true};state.balance-=total;state.ledger.unshift({id:id+'-freeze',batch:id,type:'冻结制作额度',points:-production,at:new Date().toISOString()});state.batches.unshift(b);return b;}
export function settleOutput(state,b,o,success){if(o.status!=='pending')return;const rate=b.cost.unit;b.cost.frozen-=rate;if(success){o.status='ready';b.cost.production+=rate;}else{o.status='failed';state.balance+=rate;state.ledger.unshift({id:o.id+'-release',batch:b.id,type:'生成失败 · 释放额度',points:rate,at:new Date().toISOString()});}if(!b.outputs.some(x=>x.status==='pending')){b.status='done';state.ledger.unshift({id:b.id+'-settled',batch:b.id,type:'制作已结算（从冻结扣除）',points:0,settled:b.cost.production,at:new Date().toISOString()});}}
export function revise(o,description){o.contentVersion++;o.confirmed=false;o.confirmedVersion=null;o.revisions.unshift({version:o.contentVersion,description,at:new Date().toISOString()});}
