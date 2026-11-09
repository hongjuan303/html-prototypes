import {demoFileUrl,readDemoWord} from './demo-assets-v8.js?v=20261109-overview-merge';
import * as M from './model-v2.js?v=20261109-overview-merge';
import {renderMaterialMetadata,groupedMaterialFiles,materialFileLabel} from './material-display-v14.js?v=20261109-overview-merge';
import {projectTasks} from './tasks-v7.js?v=20261109-overview-merge';
import {readReviewWord,readingDocument,demoReading} from './word-preview.js?v=20261109-overview-merge';

export const reviewNames={quality:'剧本内容审核',safety:'剧本安全审核',production:'制作审核',film:'正片安全审核',confirmScript:'剧本物料核验',confirmMaker:'制作物料核验'};
export function taskNavigation(s,p,d,h){
 const tasks=projectTasks(s,p),{E,button}=h;
 if(tasks.length<2)return '';
 return `<nav class="work-task-nav" aria-label="当前项目待办">${tasks.map(t=>button(E(t.label),'task-work',p.id,t.action===d.type&&String(t.value??'')===String(d.value??'')?'active':'',`data-value="${E(t.key)}"`)).join('')}</nav>`;
}
export function reviewSurface(s,p,d,h){
 const {E,field,fileInput,fileList}=h,script=['quality','safety'].includes(d.type),kind=d.type==='confirmScript'?'scriptMaterial':d.type==='confirmMaker'?'makerMaterial':null;
 const item=kind?p[kind]:d.type==='production'?p.production[Number(d.value)]:p[d.type];
 const files=script?[p.full].filter(Boolean):kind?item.files||[]:d.type==='film'?p.film.files||p.production[3].files||[]:item.files||[];
 d.workFiles=files;d.workFileIndex=Math.min(d.workFileIndex||0,Math.max(0,files.length-1));
 const title=reviewNames[d.type]+(d.type==='production'?' · '+M.productionNames[Number(d.value)]:'');
 const metadata=kind?renderMaterialMetadata(item.values||{},kind,{E}):'';
 const info=metadata?`<details class="work-metadata" open><summary>本次提交的物料信息</summary>${metadata}</details>`:'';
 const history=item.previousResults||item.history||[];
 const prior=history.length?`<details class="work-history"><summary>历史审核意见（${history.length}）</summary>${history.slice().reverse().map(x=>`<article><strong>${E(x.at||x.reviewedAt||'')} · ${E(M.audits[x.status]||x.status||'')}</strong><p>${E(x.opinion||'无补充意见')}</p>${kind?`<details class="supporting-file"><summary>查看该次提交资料</summary>${renderMaterialMetadata(x.values||{},kind,{E})}${groupedMaterialFiles(x.files||[],{E,fileList},kind)}</details>`:fileList(x.files?.filter(f=>f.reviewAttachment)||[])}</article>`).join('')}</details>`:'';
 const securityRevision=d.type==='production'&&Number(d.value)===2&&p.film.status==='waiting'&&p.film.opinion?`<div class="work-revision"><strong>本轮安全审核修改要求</strong><p>${E(p.film.opinion)}</p></div>`:'';
 const body=`${taskNavigation(s,p,d,h)}<div class="work-grid"><section class="work-source ${kind?'work-material-source'+(!files.length?' work-no-files':''):''}"><div class="work-source-head"><strong>${E(script?'剧本全集':kind?(kind==='scriptMaterial'?'剧本物料':'制作物料'):d.type==='film'?'全集终版':M.productionNames[Number(d.value)])}</strong><span>V${E(script?p.full?.version||1:item.version||1)} · ${E(p.name)}</span></div>${kind?`<p class="work-material-role">${kind==='makerMaterial'?'承制方提交 · 项目制片核验':p.source==='internal'?'剧本商务上传 · 总编核验':'剧本方提交 · 剧本商务核验'}</p>`:''}${info}<div class="work-file-tabs" aria-label="待审核附件">${files.map((f,i)=>`<button type="button" data-action="work-file" data-id="${i}" class="${i===d.workFileIndex?'active':''} ${kind?'work-material-file':''}" title="${E(f.name)}">${kind?`<small>${E(materialFileLabel(f,kind))}</small>`:''}<span>${E(f.name)}</span></button>`).join('')}</div>${files.length||!metadata?'<div id="work-preview" class="work-preview">正在读取附件…</div>':''}</section><aside class="work-decision"><div class="work-subject"><small>${E(p.id)}</small><h3>${E(p.name)}</h3><p>${E(title)}</p></div>${securityRevision}${field(kind?'核验结果':'审核结果','result','',{required:true,select:d.type==='quality'?[['approved','审核通过'],['revision','审核驳回 · 修改后重审'],['rejected','终止剧本']]:kind?[['approved','确认通过'],['revision','退回修改']]:[['approved','审核通过'],['revision','审核驳回 · 修改后重审']]})}${field(kind?'核验意见':'审核意见','opinion','',{area:true,help:kind?'退回修改时必填，请指出需补充或修改的资料。':'驳回或不通过时必填，请指出具体位置与修改要求。'})}${script?fileInput('reviewFiles','审核附件（选填）')+'<p class="subtle">支持上传带批注的 Word，剧本方可预览和下载。</p>':''}${prior}${d.type==='production'&&M.canTerminateProduction(s,p)?`<div class="work-termination"><p class="subtle">确认无法继续合作时，可终止本次承制合作。</p>${h.button('终止承制合作','terminate',p.id,'danger')}</div>`:''}</aside></div>`;
 return {title,body,submit:kind?'提交核验结果':'提交审核结果'};
}
export async function updateWorkPreview(d,uploads,E,isCurrent){
 const node=document.querySelector('#work-preview');if(!node)return;
 const f=d.workFiles?.[d.workFileIndex||0];if(!f){node.innerHTML='<div class="work-empty"><strong>暂无文件附件</strong><p>请结合本次提交的信息核验；资料不完整时可驳回补充。</p></div>';return;}
 const blob=uploads.get(f.previewId),url=blob?.url||demoFileUrl(f),download=url?`<a class="btn" href="${url}" download="${E(f.name)}">${f.demo?'下载合成示例':'下载原件'}</a>`:'';
 const fileHeader=`<div class="work-file-head"><span>${E(f.name)}</span><div class="actions">${url&&/\.(xlsx?|csv|tsv|ods)$/i.test(f.name)?`<button type="button" class="btn" data-action="work-open-file" data-id="${d.workFileIndex||0}">在线预览</button>`:''}${download}</div></div>`;
 const set=html=>{if(isCurrent()&&d.workFiles?.[d.workFileIndex||0]===f&&document.querySelector('#work-preview')===node)node.innerHTML=fileHeader+html;};
 node.innerHTML=fileHeader+'<div class="work-empty">正在加载预览…</div>';
 try{
  if(/\.docx?$/i.test(f.name)){
   let doc;if(blob)doc=await readReviewWord(blob.file);else if(f.demo)doc=await readDemoWord(f,readReviewWord);else throw Error('本地附件尚未恢复，请在文件详情中重新选择同名原件。');
   set(`<div class="work-read-label">${f.demo?'合成测试附件 · 仅供业务流程体验':'文本预览 · 版式以原 Word 为准'}</div><article class="work-paper">${doc.paragraphs.map(p=>`<${p.heading?'h3':'p'}>${E(p.text)}</${p.heading?'h3':'p'}>`).join('')}${doc.comments?.length?'<h3>审阅批注</h3>'+doc.comments.map(x=>`<blockquote>${E(x.context||'')}<p>${E(x.text)}</p></blockquote>`).join(''):''}</article>`);
  }else if(url&&/\.(png|jpe?g|gif|webp|svg)$/i.test(f.name))set(`<img class="work-image" src="${url}" alt="${E(f.name)}">`);
  else if(url&&/\.pdf$/i.test(f.name))set(`<iframe class="work-pdf" src="${url}" title="${E(f.name)}"></iframe>`);
  else if(url&&/\.(mp4|webm|mov)$/i.test(f.name))set(`<video class="work-video" controls src="${url}"></video>`);
  else if(url&&/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(f.name))set(`<audio class="work-audio" controls preload="metadata" src="${url}">此浏览器不支持播放，可下载原件查看。</audio>`);
  else if(url&&/\.(srt|vtt|txt)$/i.test(f.name)){
   let text;if(blob?.file)text=await blob.file.slice(0,1024*1024).text();else if(f.demo){const res=await fetch(url);if(!res.ok)throw Error('示例文本加载失败');text=(await res.text()).slice(0,1024*1024);}else throw Error('附件尚未恢复，请先选择原件。');
   set(`<div class="work-read-label">文本预览 · 最多显示前1MB，完整内容可下载查看</div><pre class="work-text-preview">${E(text)}</pre>`);
  }
  else set(`<div class="work-empty"><span>▤</span><strong>${E(f.name)}</strong><p>${f.demo&&url?'合成测试附件，可下载查看或用于上传体验。':f.demo?'此文件为演示占位，上传真实文件后可查看。':url?'该格式请下载原件查看，再在右侧完成审核。':'附件尚未恢复，可在文件详情中重新选择同名原件。'}</p></div>`);
 }catch(err){set(`<div class="work-empty"><strong>暂时无法预览</strong><p>${E(err.message)}</p>${download}</div>`);}
}
