// 单次审核与投稿快照；仅兼容旧记录，不清空历史审核或用户材料。
export const REVIEWER = {id:'demo-operator',name:'容量运营'};
export const pending = w => ['待审核','待初审','待复审'].includes(w.status);
export const reviewStamp = w => {
  if(pending(w))return {name:'—',at:'—'};
  const r=(w.reviews||[]).at(-1);
  return {name:w.reviewerName||r?.reviewerName||'—',at:w.reviewedAt||r?.at||'—'};
};
export function upgradeWorkflow(s){
  for(const w of s.works){
    if(['待初审','待复审'].includes(w.status)){
      w.legacyReviewStatus??=w.status;
      w.status='待审核';
    }
  }
  // 仅为内置平台示例补可播放素材；不替换用户项目/旧投稿快照。
  for(const p of s.projects||[]){
    if(!['p1','p-history','p-sample'].includes(p.id)||!p.ready)continue;
    for(const [i,o] of (p.outputs||[]).entries()){
      if(!o.file&&!o.mediaUrl){o.demo=true;o.mediaUrl='./assets/preview-sample.webm';o.episodeNumber??=i+1;}
    }
    if(p.id==='p-history'&&!p.episodeDemoVersion){
      p.episodeDemoVersion=1;
      for(let n=2;n<=3;n++)if(!p.outputs.some(o=>o.id==='p-history-episode-'+n))p.outputs.push({id:'p-history-episode-'+n,title:'城市里的第七封信 · 第 '+n+' 集',episodeNumber:n,duration:'00:06',demo:true,mediaUrl:'./assets/preview-sample.webm'});
    }
  }
  return s;
}
export function orderedFiles(files){
  return files.map((f,i)=>({...f,episodeNumber:f.episodeNumber===undefined?i+1:Number(f.episodeNumber)})).sort((a,b)=>a.episodeNumber-b.episodeNumber);
}
export function validateEpisodes(files){
  const numbers=files.map(f=>Number(f.episodeNumber));
  if(numbers.some(n=>!Number.isInteger(n)||n<1)||new Set(numbers).size!==numbers.length)throw Error('请填写不重复的正整数集号');
}
export function workMaterials(w){
  if(w.materialSource==='external'&&w.externalMethod==='cloud')return w.cloudImport?.status==='ready'?structuredClone(w.cloudImport.files||[]):[];
  if(w.projectSnapshot?.episodes?.length)return structuredClone(w.projectSnapshot.episodes);
  const files=[...(w.files||[]),...(w.projectSnapshot?.file?[w.projectSnapshot.file]:[])];
  const unique=files.filter((f,i)=>files.findIndex(x=>x.id===f.id)===i);
  if(unique.length===1&&unique[0].demo&&w.track==='AI漫剧成片'&&['w4','w6'].includes(w.id))return [1,2,3].map(n=>({...unique[0],id:unique[0].id+'-'+n,episodeNumber:n,name:w.title+' · 第 '+n+' 集'}));
  if(unique.length)return orderedFiles(unique);
  if(w.project)return [{id:'legacy-'+w.id,name:w.projectSnapshot?.outputTitle||'历史平台作品',unavailable:true}];
  return [];
}
export const canManageAward=(s,a)=>{const e=s.events.find(e=>e.id===a?.event);return !!e&&!e.resultsPublished&&!['已取消','草稿'].includes(e.status);};
export const canFulfillAward=(s,a)=>{const e=s.events.find(e=>e.id===a?.event);return !!e&&e.resultsPublished&&e.status!=='已取消';};
