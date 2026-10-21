// Stable visible numbers coexist with historical storage keys. Never rewrite
// wallet, source-cache or sync-request identities just to change a UI label.
export function nextTaskNumber(state){
 const used=[...(state.productionJobs||[]).map(j=>j.number||j.id),...(state.batches||[]).map(b=>b.taskNumber)].filter(x=>/^\d+$/.test(String(x))).map(Number);
 state.nextTaskNumber=Math.max(90008000,Number(state.nextTaskNumber)||0,...used)+1;
 return String(state.nextTaskNumber);
}
export function materialDate(value){
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return null;
 return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replaceAll('-','');
}
export function nameBatch(b,number,created){
 b.taskNumber=String(number);b.productionCreatedAt ||= created||b.created;
 const date=materialDate(b.productionCreatedAt),version=b.taskVersion||1;
 b.outputs.forEach((o,i)=>{
  o.materialSequence ||= i+1;
  const sequence=String(o.materialSequence).padStart(2,'0');
  // Migrate only the prototype's former auto-generated names; preserve custom names.
  const legacy=o.materialName&&o.materialName.endsWith('_'+b.taskNumber+'_'+sequence)&&/_(高光混剪|高光顺剪|原片混剪|AI解说)_/.test(o.materialName);
  if(!o.materialName||(legacy&&date)){
   if(legacy)o.previousMaterialName ||= o.materialName;
   else o.contentTitle ||= o.title;
   const title=String(b.sourceTitle||'本地剧目').replace(/[\\/:*?"<>|\r\n]/g,'_');
   const mode=b.config.mode==='narrated'?'AI解说':'高光顺剪';
   o.materialName=title+'_'+mode+'_'+(date?date+'_v'+version:b.taskNumber)+'_'+sequence;
  }
  o.title=o.materialName;
 });
}
export function ensureMaterialIdentity(state){
 const jobs=state.productionJobs||[];
 for(const j of [...jobs].sort((a,b)=>a.created.localeCompare(b.created)))j.number ||= /^\d+$/.test(j.id)?j.id:nextTaskNumber(state);
 for(const b of [...(state.batches||[])].sort((a,b)=>a.created.localeCompare(b.created))){const j=jobs.find(j=>j.batchId===b.id);nameBatch(b,j?.number||b.taskNumber||nextTaskNumber(state),j?.created);}
}
export function productionTime(value){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(value));}
