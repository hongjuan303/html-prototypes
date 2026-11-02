import {cloudReady,cloudLabel,isCloudWork} from './cloud-import.js?v=20261028-v9';
import {workMaterials,reviewStamp,pending} from './workflow.js?v=20261028-v9';
import {getFile,eventBy,TODAY} from './model.js?v=20261028-v9';
import {trackTypeLabel} from './config.js?v=20261028-v9';

export const filterWorks=(s,f)=>s.works.filter(w=>w.status!=='草稿'&&(!f.q||(w.title+w.identity.name+w.identity.phone).includes(f.q))&&(!f.event||w.event===f.event)&&(!f.status||w.status===f.status)&&(!f.track||w.track===f.track));
export const safeName=v=>String(v||'未命名').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/^\.+/,'_').slice(0,90);
export function csv(rows){return '\ufeff'+rows.map(row=>row.map(value=>{let v=String(value??'');if(/^\s*[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
const encoder=new TextEncoder();
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=data=>{let n=0xffffffff;for(const b of data)n=crcTable[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0;};
// STORE ZIP: videos are already compressed. UTF-8 names, CRC checks, no external upload.
export async function zipBlob(entries,signal){
  const parts=[],directory=[];let offset=0;
  if(entries.length>65535)throw Error('文件过多，需使用正式后台批量导出服务');
  for(const entry of entries){
    signal?.throwIfAborted();const data=new Uint8Array(await entry.blob.arrayBuffer()),name=encoder.encode(entry.name),crc=crc32(data);
    const head=new Uint8Array(30),h=new DataView(head.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);
    const central=new Uint8Array(46),c=new DataView(central.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);
    parts.push(head,name,data);directory.push(central,name);offset+=head.length+name.length+data.length;
    if(offset>0xffffffff)throw Error('导出包过大，需使用正式后台批量导出服务');
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  signal?.throwIfAborted();const length=directory.reduce((n,v)=>n+v.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);e.setUint32(12,length,true);e.setUint32(16,offset,true);
  return new Blob([...parts,...directory,end],{type:'application/zip'});
}
const LIMIT=200*1024*1024; // Local prototype guard, not a business upload/export limit.
async function fetchMaterial(url,signal,remaining){
  const parsed=new URL(url,location.href);if(!['http:','https:'].includes(parsed.protocol))throw Error('附件地址无效');
  const res=await fetch(parsed.href,{signal});if(!res.ok)throw Error('附件下载失败（'+res.status+'）');
  if(Number(res.headers.get('content-length'))>remaining)throw Error('超出本地演示打包容量');
  const reader=res.body.getReader(),chunks=[];let bytes=0;
  try{while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>remaining)throw Error('超出本地演示打包容量');chunks.push(value);}}catch(error){await reader.cancel();throw error;}
  return new Blob(chunks,{type:res.headers.get('content-type')||'application/octet-stream'});
}
export async function buildWorkExport(s,works,{signal,onProgress=()=>{},readFile=getFile,fetchBlob=fetchMaterial}={}){
  const entries=[],issues=[],manifest=[['作品名称','原提交文件名','集号','包内文件路径','导出状态']],rows=[['作品名称','所属赛事','主办单位','参赛赛道','参赛主体','参赛身份','联系人','联系电话','提交时间','审核状态','审核人','审核时间','操作','联系微信','联系邮箱','作品简介','作品版本','作品来源','附件目录']];let bytes=0,demoCount=0;
  for(const [i,w] of works.entries()){
    signal?.throwIfAborted();const e=eventBy(s,w.event),r=reviewStamp(w),folder='作品附件/'+String(i+1).padStart(3,'0')+'_'+safeName(w.title),materials=workMaterials(w);
    const allowed=cloudReady(w)&&pending(w)&&e&&!e.resultsPublished&&e.status!=='已取消'&&!(e.status==='征集中'&&TODAY<=e.tracks.find(t=>t.name===w.track)?.end);
    rows.push([w.title,e?.title||'—',e?.host||'—',trackTypeLabel(w.track),w.identity.entity,w.identity.type,w.identity.name,w.identity.phone,w.submittedAt||w.created,w.status,r.name,r.at,allowed?'预览 / 审核':'预览',w.identity.wechat||'—',w.identity.email||'—',w.summary,'V'+w.version,w.project?'万相平台作品':isCloudWork(w)?'网盘链接导入':'本地上传作品',folder]);
    if(!materials.length){const reason=isCloudWork(w)?cloudLabel(w)+'，尚无可导出的视频文件':'缺少投稿附件';issues.push(w.title+'：'+reason);manifest.push([w.title,'—','—','—',reason]);}
    for(const [j,f] of materials.entries()){
      signal?.throwIfAborted();onProgress('正在整理 '+(i+1)+' / '+works.length+'：'+w.title);
      let filename=safeName(f.name),blob;
      try{
        if(f.unavailable)throw Error('历史投稿未留存文件快照');
        if(f.demo){demoCount++;filename='演示素材_'+safeName(w.title)+(w.track==='剧本'?'.txt':'_第'+(f.episodeNumber||j+1)+'集.webm');blob=w.track==='剧本'?new Blob(['演示剧本，非真实投稿原件。\n\n'+w.title+'\n'+w.summary],{type:'text/plain'}):await fetchBlob('./assets/preview-sample.webm',signal,LIMIT-bytes);}
        else if(f.mediaUrl)blob=await fetchBlob(f.mediaUrl,signal,LIMIT-bytes);
        else blob=await readFile(f.id);
        signal?.throwIfAborted();if(!blob)throw Error('本机未找到原始附件');if(bytes+blob.size>LIMIT)throw Error('超出本地演示打包容量');
        if(!/\.[a-z0-9]{2,6}$/i.test(filename)){const ext={'video/mp4':'.mp4','video/webm':'.webm','application/pdf':'.pdf'}[blob.type.split(';')[0]];filename+=ext||'.bin';}
        const path=folder+'/'+String(j+1).padStart(3,'0')+'_'+filename;entries.push({name:path,blob});bytes+=blob.size;
        manifest.push([w.title,f.name,f.episodeNumber||j+1,path,f.demo?'演示素材，非真实投稿原件':'已包含投稿文件']);
      }catch(error){signal?.throwIfAborted();issues.push(w.title+' / '+f.name+'：'+error.message);manifest.push([w.title,f.name,f.episodeNumber||j+1,'—','未包含：'+error.message]);}
    }
  }
  entries.unshift({name:'参赛作品列表.csv',blob:new Blob([csv(rows)],{type:'text/csv;charset=utf-8'})},{name:'附件清单.csv',blob:new Blob([csv(manifest)],{type:'text/csv;charset=utf-8'})});
  entries.push({name:'导出说明.txt',blob:new Blob(['导出范围：当前已应用筛选条件下全部记录（包含所有分页）。\n附件仅取本次投稿快照。\n'+(demoCount?'演示记录的素材明确带「演示素材」前缀，不代表真实投稿原件。\n':'')+(issues.length?'以下附件未包含，请按附件清单核对并重试：\n'+issues.join('\n'):'全部可用附件已包含。')],{type:'text/plain'})});
  onProgress('正在生成压缩包…');return {blob:await zipBlob(entries,signal),issues,demoCount,count:works.length,entries};
}
export function createWorkExport(ctx){
  return function openExport(){
    const s=structuredClone(ctx.getState()),filters={...ctx.getFilters()},works=filterWorks(s,filters);
    if(!works.length){ctx.toast('当前筛选下没有可导出的参赛作品');return;}
    const scope=[filters.q?'关键词：'+filters.q:'',filters.event?'赛事：'+eventBy(s,filters.event)?.title:'全部赛事',filters.status||'全部状态',filters.track?trackTypeLabel(filters.track):'全部赛道'].filter(Boolean).join(' · ');
    ctx.modal('导出参赛作品',`<p>导出当前筛选的全部 <b>${works.length}</b> 条记录，包含所有分页。</p><p class="muted">${ctx.esc(scope)}</p><p>压缩包包含列表表格、附件清单和投稿文件；多集成片按投稿集号整理。</p><div id="export-status" class="export-status" role="status"></div><progress class="export-progress" hidden></progress><ul class="export-issues" hidden></ul><p class="muted">本地演示不连接正式媒资；示例素材会单独标明。大型文件需正式后台导出服务处理。</p><div class="form-actions">${ctx.button('关闭','close')}<button class="btn" id="export-retry" hidden>重新生成</button><button class="btn primary" id="export-download" hidden>下载导出包</button></div>`);
    const status=document.querySelector('#export-status'),progress=document.querySelector('.export-progress'),list=document.querySelector('.export-issues'),download=document.querySelector('#export-download'),retry=document.querySelector('#export-retry');
    let controller,url,disposed=false;
    ctx.setCleanup(()=>{disposed=true;controller?.abort();if(url)URL.revokeObjectURL(url);});
    async function run(){
      controller?.abort();controller=new AbortController();if(url)URL.revokeObjectURL(url);url='';download.hidden=true;retry.hidden=true;progress.hidden=false;list.hidden=true;status.className='export-status';
      try{const result=await buildWorkExport(s,works,{signal:controller.signal,onProgress:text=>status.textContent=text});if(disposed)return;
        progress.hidden=true;url=URL.createObjectURL(result.blob);const partial=result.issues.length>0;
        status.textContent=partial?'有 '+result.issues.length+' 项附件未包含，请核对下方清单；可重试或下载已生成部分。':'导出包已生成，共 '+works.length+' 条记录'+(result.demoCount?'（含明确标识的演示素材）':'')+'。';
        status.classList.toggle('error',partial);list.hidden=!partial;list.innerHTML=result.issues.map(t=>'<li>'+ctx.esc(t)+'</li>').join('');download.textContent=partial?'下载已生成部分':'下载导出包';download.hidden=false;retry.hidden=false;
        download.onclick=()=>{const a=document.createElement('a');a.href=url;a.download='参赛作品_'+new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+(partial?'_部分附件':'')+'.zip';a.click();};
      }catch(error){if(disposed||controller.signal.aborted)return;progress.hidden=true;status.className='export-status error';status.textContent='导出失败：'+error.message;retry.hidden=false;}
    }
    retry.onclick=run;run();
  };
}
