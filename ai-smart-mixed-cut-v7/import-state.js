// File import state is independent from AI analysis and video generation state.
export function importSummary(source={}){
 const p=source.importProgress,files=source.files||[];
 const requested=source.requestedRange?source.requestedRange.end-source.requestedRange.start+1:0;
 const total=Math.max(0,Number(p?.total)||requested||(source.kind==='cloud'?source.availableEpisodes?.length:source.totalEpisodes)||files.length||0);
 let status=p?.status;
 if(!['importing','complete','failed'].includes(status))status=source.importStatus==='pending'?'importing':source.importStatus==='failed'?'failed':files.some(f=>f.status==='error'||f.status==='unavailable')?'failed':'complete';
 const completed=status==='complete'?total:Math.min(total,Math.max(0,Number(p?.completed)||0));
 const label={importing:'导入中',complete:'导入完成',failed:'导入失败'}[status];
 const count=total?`${completed}/${total} 集`:'集数待获取';
 const detail=status==='complete'?'全部视频导入完成':status==='failed'?`${completed?'部分':'全部'}导入失败 · ${count}`:`${source.kind==='manual'?'视频上传中':'视频下载中'} · ${count}`;
 return {status,label,total,completed,count,detail};
}
export function importSelectionError(source){
 const {status}=importSummary(source);
 return status==='importing'?'导入中，完成后可使用':status==='failed'?'导入失败，请前往剧目管理重试':'';
}
export function renderImportStatus(source){
 const p=importSummary(source);
 return `<span class="import-state">${p.label}</span>`;
}
