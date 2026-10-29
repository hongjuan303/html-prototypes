import {renderImportStatus} from './import-state.js?v=20261029-update21e';
// Interaction fixture only. No share is fetched here. Production replaces
// analyzeShare with its authorized file-list API; this is not AI plot analysis.
export function shareLink(value){
 const text=String(value||'').trim(),match=text.match(/https?:\/\/[^\s<>"，。]+/i);
 if(!match)return null;
 try{const url=new URL(match[0]);if(url.username||url.password||!url.hostname.includes('.'))return null;return {url:url.href,code:text.match(/(?:提取码|密码)\s*[:：]?\s*([a-zA-Z0-9]{4,8})/)?.[1]||url.searchParams.get('pwd')||''};}catch{return null;}
}
export function cloudRangeError(start,end,files){
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||start>end)return '请填写有效集数：起始和结束为正整数，起始不大于结束';
 if(!files?.length)return '请先分析网盘链接';
 const selected=files.filter(file=>file.episode>=start&&file.episode<=end);
 if(selected.length!==end-start+1)return '所选范围存在缺集，请调整起始和结束集数';
 if(selected.some(file=>file.status==='unavailable'))return '所选剧集中有不可用文件，请调整范围或更换链接';
 return '';
}
export function normalizeCloudFiles(files){
 if(!Array.isArray(files)||!files.length)throw Error('未找到可导入的视频，请更换链接后重新分析');
 const ids=new Set(),episodes=new Set();
 const result=files.map(file=>{
  if(!file||!file.id||!file.name||!Number.isSafeInteger(file.episode)||file.episode<1)throw Error('无法识别剧集编号，请整理文件后重新分析');
  if(ids.has(file.id)||episodes.has(file.episode))throw Error('存在重复集号，请整理文件后重新分析');
  ids.add(file.id);episodes.add(file.episode);return {...file};
 });
 return result.sort((a,b)=>a.episode-b.episode);
}
export async function analyzeCloudShareDemo(){
 await new Promise(resolve=>setTimeout(resolve,700));
 // Fixed 30-episode fixture, never claimed as real source metadata or durations.
 return Array.from({length:30},(_,i)=>({id:'fixture-episode-'+(i+1),episode:i+1,name:`第${String(i+1).padStart(2,'0')}集.mp4`}));
}
export function createCloudImport({modal,closeModal,button,esc,onImport,toast,localUpload,getDramas=()=>[],onSelectDrama,analyzeShare=analyzeCloudShareDemo}){
 let draft=null,revision=0,localOpened=false;
 const required='<span class="required" aria-hidden="true">*</span>';
 function formValues(){
  if(!draft)return;
  draft.title=document.querySelector('#cloudTitle')?.value??draft.title;
  draft.market=document.querySelector('#cloudMarket')?.value??draft.market;
  draft.link=document.querySelector('#cloudLink')?.value??draft.link;
  const start=document.querySelector('#cloudStart'),end=document.querySelector('#cloudEnd');
  if(start)draft.start=start.value===''?null:Number(start.value);
  if(end)draft.end=end.value===''?null:Number(end.value);
  draft.libraryQuery=document.querySelector('#cloudLibraryQuery')?.value??draft.libraryQuery;
  draft.libraryMarket=document.querySelector('#cloudLibraryMarket')?.value??draft.libraryMarket;
 }
 function modeTabs(){
  return `<div class="import-mode-tabs" id="importModes" role="tablist" aria-label="导入方式">${[['cloud','网盘导入'],['local','本地上传'],...(draft.allowLibrary?[['library','剧目管理']]:[])].map(([value,label])=>button(label,'cloud-mode',draft.mode===value?'active':'',`data-mode="${value}" role="tab" aria-selected="${draft.mode===value}" ${localUpload.isBusy()||draft.loading?'disabled':''}`)).join('')}</div>`;
 }
 function commonHeader(){
  const disabled=localUpload.isBusy()?'disabled':'';
  return `${modeTabs()}
   <section id="cloudBasics"><div class="field"><label for="cloudTitle">${required}短剧名称</label><input id="cloudTitle" maxlength="80" placeholder="请输入短剧名称" value="${esc(draft.title)}" required ${disabled}></div>
   <div class="field"><label for="cloudMarket">${required}业务类型</label><select id="cloudMarket" required ${disabled}><option value="">请选择业务类型</option><option value="domestic" ${draft.market==='domestic'?'selected':''}>国内短剧</option><option value="overseas" ${draft.market==='overseas'?'selected':''}>海外短剧</option></select></div></section>`;
 }
 function metadata(){
  formValues();const title=draft.title.trim();
  draft.error=!title?'请输入短剧名称':Array.from(title).length>80?'短剧名称最多80字':!['domestic','overseas'].includes(draft.market)?'请选择业务类型':'';
  return draft.error?null:{title,market:draft.market};
 }
 function localForm(){
  const options={title:'导入合集',isVisible:()=>draft?.mode==='local',header:()=>`<div class="cloud-form local-import-basics">${commonHeader()}<p id="cloudError" class="cloud-error" role="alert" ${draft.error?'':'hidden'}>${esc(draft.error||'')}</p></div>`,metadata};
  if(!localOpened){localOpened=true;localUpload.open(options);}else localUpload.refresh();
 }
 function episodesHTML(){
  if(!draft.files.length)return `<label class="cloud-section-label">${required}选集</label><div class="cloud-empty" role="status">${draft.loading?'正在分析网盘链接…':'分析链接后选择导入集数'}</div>`;
  const max=draft.files.at(-1).episode,min=draft.files[0].episode;
  return `<div class="cloud-result-heading"><label class="cloud-section-label">${required}选集</label><span>已识别 ${draft.files.length} 集</span></div><div class="cloud-range"><label for="cloudStart">第</label><input id="cloudStart" type="number" min="${min}" max="${max}" step="1" required aria-label="导入起始集数" value="${draft.start??''}"><span>—</span><input id="cloudEnd" type="number" min="${min}" max="${max}" step="1" required aria-label="导入结束集数" value="${draft.end??''}"><span>集</span></div><div class="cloud-shortcuts">${[10,20,30].filter(n=>!cloudRangeError(1,n,draft.files)).map(n=>button('前'+n+'集','cloud-range','',`data-start="1" data-end="${n}"`)).join('')}${!cloudRangeError(min,max,draft.files)?button('全部','cloud-range','',`data-start="${min}" data-end="${max}"`):''}</div><div class="cloud-file-list" aria-label="网盘剧集列表">${draft.files.map(f=>`<div class="cloud-file" data-episode="${f.episode}"><span>第 ${f.episode} 集</span><span class="cloud-filename" title="${esc(f.name)}">${esc(f.name)}</span><span class="cloud-file-selection">${f.status==='unavailable'?'不可用':''}</span></div>`).join('')}</div><div class="cloud-count" id="cloudCount" role="status"></div>`;
 }
 function render(){
  if(!draft)return;
  if(draft.mode==='local'){localForm();return;}
  if(draft.mode==='library'){libraryForm();return;}
  modal('导入合集',`<div class="cloud-form">
   ${commonHeader()}
   <section id="cloudShare"><div class="field"><label for="cloudLink">${required}网盘链接</label><textarea id="cloudLink" rows="2" placeholder="粘贴完整网盘分享内容（含链接和提取码）" required>${esc(draft.link)}</textarea></div><div class="cloud-link-actions">${button(draft.loading?'分析中':'分析链接','cloud-analyze','secondary',draft.loading?'disabled':'')}</div><p id="cloudAnalyzeError" class="cloud-error" role="alert" ${draft.analysisError?'':'hidden'}>${esc(draft.analysisError||'')}</p></section>
   <section id="cloudEpisodes" aria-busy="${Boolean(draft.loading)}">${episodesHTML()}</section>
   <p id="cloudError" class="cloud-error" role="alert" ${draft.error?'':'hidden'}>${esc(draft.error||'')}</p>
  </div>`,button('取消','close')+button('导入合集','cloud-confirm','primary',!draft.files.length||draft.loading?'disabled':''));
  document.querySelector('#dialog').classList.add('cloud-import-dialog');document.querySelector('#dialog').dataset.importMode='cloud';refreshRange();
 }
 function libraryRows(){
  const all=getDramas(),{query,market}=draft.libraryFilters;
  return {all,rows:all.filter(d=>(market==='all'||d.source.market===market)&&(!query||d.title.toLowerCase().includes(query.toLowerCase())))};
 }
 function refreshLibrarySelection(){
  const selected=libraryRows().rows.find(d=>d.id===draft.libraryId&&!d.selectionError);
  document.querySelectorAll('[data-library-row]').forEach(row=>{const radio=row.querySelector('input');radio.checked=Boolean(selected&&radio.dataset.id===selected.id);row.classList.toggle('selected',radio.checked);});
  document.querySelector('#cloudLibrarySelected').textContent=selected?'已选：'+selected.title:'未选择剧目';
  document.querySelector('[data-action="cloud-library-confirm"]').disabled=!selected;
 }
 function libraryForm(){
  const {all,rows}=libraryRows();
  if(!rows.some(d=>d.id===draft.libraryId&&!d.selectionError))draft.libraryId='';
  modal('导入合集',`<div class="cloud-form">${modeTabs()}
   <div class="import-library-filters" id="cloudLibraryFilters"><input id="cloudLibraryQuery" aria-label="搜索已有剧目" placeholder="剧目名称" value="${esc(draft.libraryQuery)}"><select id="cloudLibraryMarket" aria-label="筛选业务类型">${[['all','全部业务类型'],['domestic','国内短剧'],['overseas','海外短剧']].map(([value,label])=>`<option value="${value}" ${draft.libraryMarket===value?'selected':''}>${label}</option>`).join('')}</select>${button('查询','cloud-library-query','primary')}${button('重置','cloud-library-reset')}</div>
   <div class="import-library-list" id="cloudLibraryList"><table><thead><tr><th aria-label="选择"></th><th>剧目名称</th><th>业务类型</th><th>导入状态</th><th>集数</th></tr></thead><tbody>${rows.map((d,index)=>`<tr data-library-row class="${d.id===draft.libraryId?'selected':''} ${d.selectionError?'unavailable':''}"><td><input id="cloudLibraryChoice${index}" type="radio" name="libraryDrama" aria-label="选择${esc(d.title)}" data-action="cloud-library-select" data-id="${esc(d.id)}" ${d.selectionError?'disabled':''} ${d.id===draft.libraryId?'checked':''}></td><td><label class="import-library-name" for="cloudLibraryChoice${index}"><span class="import-library-cover">${d.source.cover?`<img src="${esc(d.source.cover)}" alt="">`:'▹'}</span><span><strong title="${esc(d.title)}">${esc(d.title)}</strong>${d.selectionError&&!d.selectionError.startsWith('导入')?`<small>${esc(d.selectionError)}</small>`:''}</span></label></td><td>${{domestic:'国内短剧',overseas:'海外短剧'}[d.source.market]||'—'}</td><td>${renderImportStatus(d.source,esc)}</td><td>${d.totalEpisodes??'—'}</td></tr>`).join('')||`<tr><td colspan="5" class="import-library-empty">${all.length?'没有符合条件的剧目':'暂无导入完成的剧目'}</td></tr>`}</tbody></table></div>
   <div class="import-library-summary"><span>共 ${rows.length} 部</span><span id="cloudLibrarySelected" role="status"></span></div><p id="cloudError" class="cloud-error" role="alert" ${draft.error?'':'hidden'}>${esc(draft.error||'')}</p>
  </div>`,button('取消','close')+button('使用剧目','cloud-library-confirm','primary','disabled'));
  document.querySelector('#dialog').classList.add('cloud-import-dialog');document.querySelector('#dialog').dataset.importMode='library';refreshLibrarySelection();
 }
 function refreshRange(){
  if(!draft?.files.length)return;
  const error=cloudRangeError(draft.start,draft.end,draft.files);
  document.querySelectorAll('.cloud-file').forEach(row=>{const file=draft.files.find(file=>file.episode===Number(row.dataset.episode));const selected=!error&&file.episode>=draft.start&&file.episode<=draft.end;row.classList.toggle('selected',selected);row.querySelector('.cloud-file-selection').textContent=file.status==='unavailable'?'不可用':selected?'已选':'';});
  const count=document.querySelector('#cloudCount');count.textContent=error||`已选 ${draft.end-draft.start+1} 集`;count.classList.toggle('cloud-error',Boolean(error));
  document.querySelector('[data-action="cloud-confirm"]').disabled=Boolean(error)||draft.loading;
 }
 function input(el){
  if(!draft||!el.id?.startsWith('cloud'))return;
  const previous=draft.link;formValues();draft.error='';
  if(el.id==='cloudLink'&&previous!==draft.link){
   revision++;draft.loading=false;draft.files=[];draft.parsedText='';draft.analysisError='';draft.start=null;draft.end=null;
   document.querySelector('#cloudEpisodes').innerHTML=episodesHTML();document.querySelector('#cloudEpisodes').setAttribute('aria-busy','false');
   const analyze=document.querySelector('[data-action="cloud-analyze"]');analyze.disabled=false;analyze.textContent='分析链接';
   document.querySelector('[data-action="cloud-confirm"]').disabled=true;
   document.querySelectorAll('[data-action="cloud-mode"]').forEach(button=>button.disabled=false);
   document.querySelector('#cloudAnalyzeError').hidden=true;
  }
  if(['cloudStart','cloudEnd'].includes(el.id))refreshRange();
  const error=document.querySelector('#cloudError');if(error)error.hidden=true;
 }
 async function handle(action,el){
  if(!draft)return;formValues();
  if(action==='cloud-mode'){if(localUpload.isBusy()||draft.loading||!['cloud','local',...(draft.allowLibrary?['library']:[])].includes(el.dataset.mode))return;draft.mode=el.dataset.mode;draft.error='';render();return;}
  if(action.startsWith('cloud-library-')){
   if(draft.mode!=='library'||!draft.allowLibrary)return;
   if(action==='cloud-library-query'){draft.libraryFilters={query:draft.libraryQuery.trim(),market:draft.libraryMarket};libraryForm();}
   if(action==='cloud-library-reset'){draft.libraryQuery='';draft.libraryMarket='all';draft.libraryFilters={query:'',market:'all'};libraryForm();}
   if(action==='cloud-library-select'){draft.libraryId=el.dataset.id;draft.error='';refreshLibrarySelection();document.querySelector('#cloudError').hidden=true;}
   if(action==='cloud-library-confirm'){
    try{if(!draft.libraryId)throw Error('请选择剧目');onSelectDrama(draft.libraryId);closeModal();toast('已使用所选剧目');}
    catch(error){draft.error=error.message||'选择失败，请重试';libraryForm();}
   }
   return;
  }
  if(action==='cloud-range'){draft.start=Number(el.dataset.start);draft.end=Number(el.dataset.end);draft.error='';render();return;}
  if(action==='cloud-analyze'){
   if(draft.loading)return;
   const share=shareLink(draft.link);
   if(!share){draft.analysisError='请输入有效的网盘分享链接';render();return;}
   draft.loading=true;draft.files=[];draft.analysisError='';draft.error='';draft.parsedText='';draft.start=null;draft.end=null;
   const current=++revision,submitted=draft.link;render();
   try{
    const files=normalizeCloudFiles(await analyzeShare(share));
    if(!draft||current!==revision||draft.link!==submitted)return;
    draft.files=files;draft.parsedText=submitted;draft.parsedUrl=share.url;
    // Default to the first consecutive usable range, at most 30 episodes.
    const first=files.findIndex(file=>file.status!=='unavailable');
    if(first<0)throw Error('未找到可用剧集，请更换链接后重新分析');
    draft.start=files[first].episode;draft.end=draft.start;
    for(let i=first+1;i<files.length&&i<first+30;i++){if(files[i].episode!==draft.end+1||files[i].status==='unavailable')break;draft.end=files[i].episode;}
   }catch(error){
    if(!draft||current!==revision)return;
    draft.files=[];draft.analysisError=/^(未找到|无法识别|存在重复集号)/.test(error.message)?error.message:'分析失败，请检查分享链接及提取码后重试';
   }
   if(!draft||current!==revision)return;draft.loading=false;render();return;
  }
  if(action==='cloud-confirm'){
   if(draft.loading)return;
   const basics=metadata();if(!basics){render();return;}
   draft.error=draft.parsedText!==draft.link?'链接已变化，请重新分析':cloudRangeError(draft.start,draft.end,draft.files);
   if(draft.error){render();return;}
   const selected=draft.files.filter(file=>file.episode>=draft.start&&file.episode<=draft.end);
   const source={kind:'cloud',assetId:'cloud-'+crypto.randomUUID(),...basics,shareUrl:draft.parsedUrl,shareText:draft.link.trim(),fileVersion:1,importStatus:'resolved',requestedRange:{start:draft.start,end:draft.end},totalEpisodes:draft.files.at(-1).episode,availableEpisodes:selected.map(file=>file.episode),files:selected,cover:'',simulated:false,mockImport:true};
   try{onImport(source,draft.start,draft.end);closeModal();toast('导入已提交，可前往剧目管理查看进度');}catch{draft.error='导入提交失败，请重试';render();}
  }
 }
 return {open({allowLibrary=false}={}){localUpload.cancel();localOpened=false;revision++;draft={mode:'cloud',title:'',market:'',link:'',files:[],parsedText:'',start:null,end:null,error:'',analysisError:'',loading:false,allowLibrary,libraryId:'',libraryQuery:'',libraryMarket:'all',libraryFilters:{query:'',market:'all'}};render();},cancel(){revision++;draft=null;localOpened=false;localUpload.cancel();},refreshLibrary(){if(draft?.mode==='library')libraryForm();},input,handle};
}
