import {assetKey,getEpisodes,EVENTS,overlap,isFullNarration} from './engine.js?v=20261008-interaction1';

const normalize=text=>String(text||'').replace(/[\s，。！？：；、“”‘’,.!?;:"'\-]/g,'').toLowerCase();
const eventFor=id=>EVENTS.find(e=>id>=e.start&&id<=e.end)?.id||'episode-'+id;
const events=plan=>[...new Set((plan.segments||[]).map(s=>eventFor(s.sourceEp)))].sort().join('|');
const samePoint=(a,b)=>!!a&&!!b&&(normalize(a.text)===normalize(b.text)||(!(a.type==='narration'&&b.type==='narration')&&a.sourceEp===b.sourceEp&&a.sourceStart===b.sourceStart&&a.sourceEnd===b.sourceEnd));
export function contentTags(text){
 const tags=[];
 if(/质疑|阻止|指控|拒绝|不利|对抗/.test(text))tags.push('冲突');
 if(/证明|暴露|被替换|发现|找回|记录|证据|秘密/.test(text))tags.push('信息揭露');
 if(/恢复|更正|反击|认可|让位|撤回/.test(text))tags.push('反转');
 if(/邀请|支持|合作条件|道歉|工作室|独立/.test(text))tags.push('关系变化');
 if(/不愿|离开|道歉|误会/.test(text))tags.push('人物情绪');
 return tags.length?tags:['剧情推进'];
}

// An internal, fictional candidate index. Never a new front-end selection step.
export function ensureContentPool(state,c){
 const key=assetKey(c),analysis=state.assets[key];if(!analysis)return {reused:0,added:0};
 const old=analysis.contentPool;
 const pool=old?.sourceKey===key&&old.analysisRevision===analysis.revision?old:{sourceKey:key,analysisRevision:analysis.revision,items:[]};
 const selected=getEpisodes(c).filter(ep=>ep.id>=c.start&&ep.id<=c.end&&analysis.episodes.includes(ep.id));
 const present=new Set(pool.items.map(item=>item.episode));let added=0;
 for(const ep of selected){if(present.has(ep.id))continue;pool.items.push({id:key+':ep'+ep.id,episode:ep.id,eventId:eventFor(ep.id),tags:contentTags(ep.story),fact:ep.story,units:[{start:0,end:50,text:ep.dialogues[0]},{start:60,end:170,text:ep.dialogues.slice(1).join(' ')}],simulated:true});added++;}
 analysis.contentPool=pool;return {reused:selected.length-added,added};
}

export function compareContent(a,b){
 const aa=a.segments||[],bb=b.segments||[],sameEvent=events(a)===events(b);
 const sameOpening=samePoint(aa[0],bb[0]),sameEnding=samePoint(aa.at(-1),bb.at(-1));
 const footage=overlap(a,b),full=a.narrationStructure==='full'&&b.narrationStructure==='full';
 const sameNarration=full&&normalize(a.narrationText)===normalize(b.narrationText);
 const exact=normalize(aa.map(s=>s.text).join(''))===normalize(bb.map(s=>s.text).join(''))&&aa.map(s=>`${s.sourceEp}:${s.sourceStart}:${s.sourceEnd}`).join('|')===bb.map(s=>`${s.sourceEp}:${s.sourceStart}:${s.sourceEnd}`).join('|');
 const reasons=[];
 if(sameEvent)reasons.push('同一剧情事件');
 if(sameOpening)reasons.push('开场相同');
 if(sameEnding)reasons.push('结尾相同');
 if(sameNarration)reasons.push('全篇解说文案相同');
 if(footage>=50)reasons.push(`原片区间重合 ${footage}%`);
 return {sameEvent,sameOpening,sameEnding,sameNarration,exact,footage,reasons,duplicate:exact||sameNarration||(sameEvent&&sameOpening&&sameEnding&&footage>60),priority:Number(sameNarration)*5+Number(sameOpening)*2+Number(sameEnding)*2+Number(sameEvent)+footage/100};
}

export function curateCandidates(candidates,c,state=null){
 const history=(state?.batches||[]).filter(b=>assetKey(b.config)===assetKey(c)).flatMap(b=>b.outputs.filter(o=>o.status!=='failed').flatMap(o=>[o,...(o.versionHistory||[]),...(o.reworkPending?.candidate?[o.reworkPending.candidate]:[])]));
 const groups=new Map();for(const p of candidates){const key=events(p);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 const ordered=[];while([...groups.values()].some(g=>g.length))for(const g of groups.values())if(g.length)ordered.push(g.shift());
 const selected=[];let contentExcluded=0;
 for(const p of ordered){if(selected.some(q=>compareContent(p,q).duplicate)||history.some(q=>{const comparison=compareContent(p,q);return comparison.exact||comparison.sameNarration;})){contentExcluded++;continue;}selected.push({...p,contentSelection:{sourceKey:assetKey(c),eventIds:events(p).split('|'),tags:[...new Set(p.segments.flatMap(s=>contentTags(s.fact||s.evidence||s.text)))].slice(0,3),policyVersion:'content-v1',simulated:true}});}
 return {candidates:selected,contentExcluded};
}

export function evidenceFor(b,o){
 const first=o.segments[0],last=o.segments.at(-1),full=isFullNarration(b.config),narr=o.segments.find(s=>s.type==='narration');
 const facts=o.segments.map(s=>s.fact||s.evidence||'').filter(Boolean);
 const tags=[...new Set(facts.flatMap(contentTags))].slice(0,3);
 const reasons=[{label:full?'叙述起点':'开场依据',text:first.evidence||first.fact||first.text,segment:first}];
 if(narr&&!full)reasons.push({label:'解说承接',text:narr.evidence||narr.fact||narr.text,segment:narr});
 const different=o.segments.find(s=>s!==first&&(s.evidence||s.fact)!==(first.evidence||first.fact));
 if(full&&different)reasons.push({label:'故事推进',text:different.evidence||different.fact||different.text,segment:different});
 if(last!==first)reasons.push({label:full?'叙述终点':'结尾依据',text:last.evidence||last.fact||last.text,segment:last});
 return {tags,reasons,rule:full?'按所选范围组织完整叙述，逐段对应原片画面':b.config.mode==='narrated'?'解说依据原片事实，衔接处保留完整原声':'保留完整对白与必要前因，优先组织不同事件',simulated:true};
}

export function relatedContent(state,b,o){
 const source=assetKey(b.config),items=[];
 for(const otherBatch of state.batches){if(assetKey(otherBatch.config)!==source)continue;for(const candidate of otherBatch.outputs){if(candidate.id===o.id||!['ready','issue'].includes(candidate.status))continue;const comparison=compareContent(o,candidate);if(!comparison.reasons.length)continue;items.push({batch:otherBatch,output:candidate,...comparison,inBatch:otherBatch.id===b.id});}}
 return items.sort((x,y)=>Number(y.inBatch)-Number(x.inBatch)||y.priority-x.priority).slice(0,3);
}

export function recordFeedback(state,b,o,{kind,reason,at=null,endAt=null,scope=null,detail='',operationId=null}){
 const item={id:'FB-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),kind,reason,at,endAt,scope,detail,operationId,sourceKey:assetKey(b.config),analysisVersion:b.analysisSnapshot?.revision||1,policyVersion:'content-v1',ruleId:b.rule?.id||null,ruleVersion:b.rule?.version||null,batch:b.id,output:o.id,version:o.contentVersion,createdAt:new Date().toISOString()};
 (state.feedback ||= []).unshift(item);return item;
}
