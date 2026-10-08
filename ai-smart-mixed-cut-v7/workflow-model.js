import {compareContent,curateCandidates} from './content-model.js?v=20261008-interaction1';
import {clone,planBatch,assetKey} from './engine.js?v=20261008-interaction1';

const round=value=>Math.round(value*100)/100;
const amount=value=>Number.isFinite(value)?Math.max(0,value):0;
const now=()=>new Date().toISOString();
let sequence=0;

// A released reservation never became a charge. Refunds only reverse settled
// charges; keeping these apart prevents a failed render from lowering net cost.
export function costSummary(state,b){
 const c=b.cost||{},analysis=amount(c.analysis),production=amount(c.production),frozen=amount(c.frozen);
 const released=Number.isFinite(c.released)?amount(c.released):(state.ledger||[]).filter(row=>row.batch===b.id&&/释放/.test(row.type||'')).reduce((sum,row)=>sum+amount(row.points),0);
 const refunded=amount(c.refunded),net=round(Math.max(0,analysis+production-refunded));
 const quoted=Number.isFinite(c.quoted)?amount(c.quoted):round(analysis+production+frozen+released);
 const accepted=(b.outputs||[]).filter(o=>reviewable(o)&&o.status==='ready'&&o.confirmed&&o.confirmedVersion===o.contentVersion&&!o.narrationDraft).length;
 return {quoted,analysis,production,net,frozen,released,refunded,accepted,perAccepted:accepted?round(net/accepted):null};
}

export function reviewable(o){return !!o&&['ready','issue'].includes(o.status)&&!o.repairing&&!o.reworkPending;}

// Compare the actual ordered footage and words. Different titles, angle labels,
// or plan IDs are not enough to count as a different creative result.
const signature=p=>JSON.stringify((p.segments||[]).map(s=>[s.type,s.sourceEp,s.sourceStart,s.sourceEnd,s.text,s.sourceAudio||'',s.duration,s.start,s.end]));
const opening=p=>signature({segments:(p.segments||[]).slice(0,1)});
const sourceSet=p=>new Set((p.segments||[]).map(s=>[s.type,s.sourceEp,s.sourceStart,s.sourceEnd].join(':')));
const sameSources=(a,b)=>{const x=sourceSet(a),y=sourceSet(b);return x.size===y.size&&[...x].every(value=>y.has(value));};

function candidatesFor(b,rule=b.rule){
 const result=planBatch(clone(b.config),clone(rule),clone(b.analysisSnapshot||{}));
 if(result.error)throw Error(result.error);
 return curateCandidates(result.candidates,b.config).candidates;
}

function qualityCandidate(b,o){
 if(o.qualityBaseline?.segments?.length)return clone(o.qualityBaseline);
 const candidate=candidatesFor(b).find(p=>p.id===o.planId);
 if(!candidate)throw Error('原制作方案已失效，请返回制作素材重新生成');
 return candidate;
}

function creativeCandidate(state,b,o,direction){
 const history=state.batches.filter(item=>assetKey(item.config)===assetKey(b.config)).flatMap(item=>item.outputs.filter(p=>p.status!=='failed').flatMap(p=>[p,...(p.versionHistory||[]),...(p.reworkPending?.candidate?[p.reworkPending.candidate]:[])]));
 // All candidates use this task's source range and analysis snapshot. A context
 // request can additionally use chronological presentation of those same facts.
 const rules=direction==='context'?[{...b.rule,opening:'chronological'},b.rule]:[b.rule,{...b.rule,opening:'chronological'}];
 const used=new Set((b.outputs||[]).map(signature));
 for(const item of b.outputs||[])if(item.reworkPending?.candidate)used.add(signature(item.reworkPending.candidate));
 const seen=new Set();
 const candidates=rules.flatMap(rule=>candidatesFor(b,rule).map(candidate=>({...candidate,reworkRule:clone(rule)}))).filter(candidate=>{
  const key=signature(candidate);if(used.has(key)||seen.has(key)||(b.outputs||[]).some(item=>compareContent(candidate,item).duplicate)||history.some(item=>{const comparison=compareContent(candidate,item);return comparison.exact||comparison.sameNarration;}))return false;seen.add(key);return true;
 });
 const priority=candidate=>{
  const sameEvent=candidate.eventId===o.eventId;
  if(direction==='opening')return (sameEvent?8:0)+(opening(candidate)!==opening(o)?4:0)+(sameSources(candidate,o)?2:0);
  if(direction==='context')return (sameEvent?8:0)+(candidate.reworkRule.opening==='chronological'?4:0)+(!sameSources(candidate,o)?2:0);
  return (sameEvent?4:0)+(candidate.angle!==o.angle?8:0)+(!sameSources(candidate,o)?2:0);
 };
 candidates.sort((a,b)=>priority(b)-priority(a));
 if(!candidates.length)throw Error('当前片源没有可用的差异方案，请增加集数或调整制作配置；本次未扣费');
 return candidates[0];
}

export function beginRework(state,b,o,{kind='creative',direction='opening',instruction=''}={}){
 if(o.reworkPending)return o.reworkPending;
 if(!reviewable(o))throw Error('请等待当前素材处理完成后再重新制作');
 if(o.narrationDraft)throw Error('请先保存或放弃文案修改');
 if(!['quality','creative'].includes(kind))throw Error('请选择重新制作方式');
 if(kind==='quality'&&!o.issues?.length)throw Error('请先标记质量问题，再进行免费修复');
 if(kind==='creative'&&!['opening','context','angle'].includes(direction))throw Error('请选择调整方向');
 const cost=kind==='creative'?amount(b.cost.unit):0;
 if(cost>amount(state.balance))throw Error('积分不足，请减少制作数量或补充积分');
 const candidate=kind==='quality'?qualityCandidate(b,o):creativeCandidate(state,b,o,direction);
 const operationId='RW-'+Date.now().toString(36).toUpperCase()+'-'+(++sequence).toString(36).toUpperCase();
 const job={operationId,kind,direction,instruction:String(instruction||'').trim().slice(0,500),cost,candidate:clone(candidate),fromVersion:o.contentVersion,startedAt:now()};
 // Validation and candidate selection finish before any wallet or content write.
 const summary=costSummary(state,b);
 b.cost.quoted=summary.quoted+cost;b.cost.released=summary.released;b.cost.refunded=summary.refunded;
 if(cost){state.balance=round(state.balance-cost);b.cost.frozen=round(amount(b.cost.frozen)+cost);state.ledger.unshift({id:operationId+'-freeze',batch:b.id,output:o.id,operationId,type:'创作重做 · 冻结制作额度',points:-cost,at:job.startedAt});}
 o.reworkPending=job;
 return job;
}

export function finishRework(state,b,o,success=true){
 const job=o.reworkPending;
 if(!job)return o.lastReworkResult||{success:false,ignored:true,reason:'no-pending-job'};
 // If another action changed content, release this job instead of overwriting it.
 if(o.contentVersion!==job.fromVersion)success=false;
 const cost=amount(job.cost),at=now();
 b.cost.frozen=round(Math.max(0,amount(b.cost.frozen)-cost));
 if(!success){
  if(cost){state.balance=round(state.balance+cost);b.cost.released=round(amount(b.cost.released)+cost);state.ledger.unshift({id:job.operationId+'-release',batch:b.id,output:o.id,operationId:job.operationId,type:'重做失败 · 释放额度',points:cost,at});}
  const result={success:false,operationId:job.operationId,cost,version:o.contentVersion,released:cost};
  delete o.reworkPending;o.lastReworkResult=result;return result;
 }
 const previous=clone(o);
 delete previous.reworkPending;delete previous.versionHistory;delete previous.qualityBaseline;delete previous.lastReworkResult;
 const history={...previous,version:o.contentVersion,archivedAt:at,reason:job.kind==='quality'?'质量问题修复':'创作重新制作'};
 const id=o.id,version=o.contentVersion+1,revisions=o.revisions||[],versionHistory=o.versionHistory||[];
 const candidate=clone(job.candidate);delete candidate.reworkRule;
 // Sync jobs live outside outputs and retain their original (id, version) keys.
 // Only this output is replaced; sibling materials are never changed here.
 Object.assign(o,candidate,{id,planId:candidate.id,contentVersion:version,confirmed:false,confirmedVersion:null,status:'ready',issues:[],revisions,versionHistory:[history,...versionHistory],qualityBaseline:clone(candidate)});
 delete o.confirmedAt;delete o.narrationDraft;delete o.narrationTimingDirty;delete o.repairing;delete o.reworkPending;
 delete o.mixLevel;
 o.revisions.unshift({version,description:job.kind==='quality'?'恢复完整制作方案，待重新检查':'按'+({opening:'更换开头',context:'加强铺垫',angle:'更换剧情角度'}[job.direction])+'选择差异方案，待重新检查',at,operationId:job.operationId});
 o.creationRequests=[...(o.creationRequests||[]),{operationId:job.operationId,kind:job.kind,direction:job.direction,instruction:job.instruction,instructionApplied:false,at}];
 if(cost){b.cost.production=round(amount(b.cost.production)+cost);state.ledger.unshift({id:job.operationId+'-settled',batch:b.id,output:o.id,operationId:job.operationId,type:'创作重做已结算（从冻结扣除）',points:0,settled:cost,at});}
 const result={success:true,operationId:job.operationId,cost,version};o.lastReworkResult=result;return result;
}
