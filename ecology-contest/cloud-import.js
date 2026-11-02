// Prototype-only import lifecycle. No share link is fetched or sent to a remote service.
export const isCloudWork = w => w?.materialSource === 'external' && w?.externalMethod === 'cloud';
export const cloudReady = w => !isCloudWork(w) || (w.cloudImport?.status === 'ready' && !!w.cloudImport.files?.length);
export const cloudLabel = w => ({draft:'待提交',importing:'视频导入中',failed:'视频导入失败',ready:'视频已导入'}[w.cloudImport?.status] || '等待导入');
export function validateCloudLink(link){
  let url;try{url=new URL(String(link||'').trim());}catch{throw Error('请填写完整的网盘分享链接');}
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.'))throw Error('请填写有效的 HTTP 或 HTTPS 网盘分享链接');
  return url.href;
}
export function cloudSubmission(payload,draft){
  const link=String(payload.cloudLink||'').trim(),code=String(payload.cloudCode||'').trim();
  if(!draft||link)validateCloudLink(link);
  return {link,code,status:draft?'draft':'importing',files:[],error:'',attempt: draft?0:1};
}
export function simulateCloudImport(w,action){
  if(!isCloudWork(w)||!['待审核','待初审','待复审'].includes(w.status))throw Error('当前作品不能重新导入');
  const job=w.cloudImport;
  if(!job||job.status==='ready')throw Error('已生成的视频快照不能重新覆盖');
  if(action==='retry'){
    if(job.status!=='failed')throw Error('仅导入失败时可重试');
    job.status='importing';job.error='';job.attempt=(job.attempt||1)+1;return;
  }
  if(job.status!=='importing')throw Error('请先重试导入');
  if(action==='failure'){job.status='failed';job.error='分享链接失效、访问受限或未找到可导入的视频，请联系参赛者核实。';return;}
  if(action!=='success')throw Error('无效的演示操作');
  job.files=Array.from({length:w.track==='AI漫剧成片'?3:1},(_,i)=>({id:w.id+'-cloud-demo-'+(i+1),name:'演示视频_第'+(i+1)+'集.webm',episodeNumber:i+1,size:0,demo:true,cloud:true}));
  job.status='ready';job.demo=true;job.completedAt=new Date().toISOString();
}
export function cloudPanel(w,esc,admin=false){
  if(!isCloudWork(w))return '';
  const job=w.cloudImport||{},ready=cloudReady(w),failed=job.status==='failed';
  return `<section class="cloud-import-panel" aria-label="网盘视频导入"><div class="cloud-import-heading"><b>网盘链接导入</b><span class="tag">${cloudLabel(w)}</span></div><p>${job.status==='draft'?'当前仅保存分享信息，正式提交后才开始导入视频。':ready?'已生成 '+job.files.length+' 个视频文件，按本次投稿快照预览。':failed?esc(job.error||'导入失败，请核实分享链接及访问权限。'):'提交已接收，正在生成视频文件列表。导入完成后即可在线预览，运营再进行审核。'}</p><dl><div><dt>网盘链接</dt><dd>${esc(job.link||'—')}</dd></div><div><dt>提取码</dt><dd>${esc(job.code||'无需提取码')}</dd></div></dl>${admin&&!ready&&['importing','failed'].includes(job.status)?`<div class="cloud-demo-controls"><small>本地流程演示，不读取真实网盘；成功状态使用示例视频。</small><div>${failed?'<button type="button" class="btn" data-cloud-action="retry">重试导入</button>':'<button type="button" class="btn" data-cloud-action="success">演示导入成功</button><button type="button" class="btn" data-cloud-action="failure">演示导入失败</button>'}</div></div>`:job.demo?'<small class="cloud-demo-note">当前列表为演示视频，非该网盘的真实文件。</small>':''}</section>`;
}
