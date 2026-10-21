// Interaction fixture only. A production adapter must return the authorized
// share's real file IDs, episode numbers and availability; no share is fetched here.
export function shareLink(value){
 const text=String(value||'').trim(),match=text.match(/https?:\/\/[^\s<>"，。]+/i);
 if(!match)return null;
 try{const url=new URL(match[0]);if(url.username||url.password||!url.hostname.includes('.'))return null;return {url:url.href,code:text.match(/(?:提取码|密码)\s*[:：]?\s*([a-zA-Z0-9]{4,8})/)?.[1]||url.searchParams.get('pwd')||''};}catch{return null;}
}
export function cloudRangeError(start,end){
 return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=1&&start<=end?'':'请填写有效集数：起始和结束为正整数，起始不大于结束';
}
export function createCloudImport({modal,closeModal,button,esc,onImport,toast,localUpload}){
 let draft=null,localOpened=false;
 const required='<span class="required">*</span>';
 function formValues(){
  if(!draft)return;
  draft.title=document.querySelector('#cloudTitle')?.value??draft.title;
  draft.market=document.querySelector('#cloudMarket')?.value??draft.market;
  draft.link=document.querySelector('#cloudLink')?.value??draft.link;
  const start=document.querySelector('#cloudStart'),end=document.querySelector('#cloudEnd');
  if(start)draft.start=start.value===''?null:Number(start.value);
  if(end)draft.end=end.value===''?null:Number(end.value);
 }
 function commonHeader(){
  const disabled=localUpload.isBusy()?'disabled':'';
  return `<div class="import-mode-tabs" id="importModes" role="tablist" aria-label="导入方式">${[['cloud','网盘导入'],['local','本地上传']].map(([value,label])=>button(label,'cloud-mode',draft.mode===value?'active':'',`data-mode="${value}" role="tab" aria-selected="${draft.mode===value}" ${disabled}`)).join('')}</div>
   <section id="cloudBasics"><div class="field"><label for="cloudTitle">短剧名称 ${required}</label><input id="cloudTitle" maxlength="80" placeholder="请输入短剧名称" value="${esc(draft.title)}" required ${disabled}></div>
   <div class="field"><label for="cloudMarket">业务类型 ${required}</label><select id="cloudMarket" required ${disabled}><option value="">请选择业务类型</option><option value="domestic" ${draft.market==='domestic'?'selected':''}>国内短剧</option><option value="overseas" ${draft.market==='overseas'?'selected':''}>海外短剧</option></select></div></section>`;
 }
 function metadata(){
  formValues();const title=draft.title.trim();
  draft.error=!title?'请输入短剧名称':Array.from(title).length>80?'短剧名称最多80字':!['domestic','overseas'].includes(draft.market)?'请选择业务类型':'';
  return draft.error?null:{title,market:draft.market};
 }
 function localForm(){
  const options={isVisible:()=>draft?.mode==='local',header:()=>`<div class="cloud-form local-import-basics">${commonHeader()}<p id="cloudError" class="cloud-error" role="alert" ${draft.error?'':'hidden'}>${esc(draft.error||'')}</p></div>`,metadata};
  if(!localOpened){localOpened=true;localUpload.open(options);}else localUpload.refresh();
 }
 function render(){
  if(!draft)return;
  if(draft.mode==='local'){localForm();return;}

  modal('导入合集',`<div class="cloud-form">
   ${commonHeader()}
   <section id="cloudShare"><div class="field"><label for="cloudLink">网盘链接 ${required}</label><textarea id="cloudLink" rows="2" placeholder="粘贴完整网盘分享内容（含链接和提取码）" required>${esc(draft.link)}</textarea></div></section>
   <section id="cloudEpisodes"><label class="cloud-section-label">选集 ${required}</label><div class="cloud-range"><label for="cloudStart">第</label><input id="cloudStart" type="number" min="1" step="1" aria-label="导入起始集数" value="${draft.start??''}"><span>—</span><input id="cloudEnd" type="number" min="1" step="1" aria-label="导入结束集数" value="${draft.end??''}"><span>集</span></div><div class="cloud-shortcuts">${[10,20,30].map(n=>button('前'+n+'集','cloud-range','',`data-count="${n}"`)).join('')}</div></section>
   <p id="cloudError" class="cloud-error" role="alert" ${draft.error?'':'hidden'}>${esc(draft.error||'')}</p>
  </div>`,button('取消','close')+button('导入合集','cloud-confirm','primary'));
  document.querySelector('#dialog').classList.add('cloud-import-dialog');document.querySelector('#dialog').dataset.importMode='cloud';
 }
 function input(el){
  if(!draft||!el.id?.startsWith('cloud'))return;
  formValues();draft.error='';
  const error=document.querySelector('#cloudError');if(error)error.hidden=true;
 }
 async function handle(action,el){
  if(!draft)return;formValues();
  if(action==='cloud-mode'){if(localUpload.isBusy()||!['cloud','local'].includes(el.dataset.mode))return;draft.mode=el.dataset.mode;draft.error='';render();return;}
  if(action==='cloud-range'){draft.start=1;draft.end=Number(el.dataset.count);render();return;}
  if(action==='cloud-confirm'){
   const basics=metadata();
   if(!basics){render();return;}
   const share=shareLink(draft.link);
   draft.error=!share?'请输入有效的网盘分享链接':cloudRangeError(draft.start,draft.end);
   if(draft.error){render();return;}
   // Store the request, not a fabricated file list. The server resolves it asynchronously.
   const source={kind:'cloud',assetId:'cloud-'+crypto.randomUUID(),...basics,shareUrl:share.url,shareText:draft.link.trim(),fileVersion:1,importStatus:'pending',requestedRange:{start:draft.start,end:draft.end},totalEpisodes:0,availableEpisodes:[],files:[],cover:'',simulated:false,mockImport:true};
   try{onImport(source,draft.start,draft.end);closeModal();toast('导入已提交，后台处理中');}catch{draft.error='导入提交失败，请重试';render();}
  }
 }
 return {open(){localUpload.cancel();localOpened=false;draft={mode:'cloud',title:'',market:'',link:'',start:1,end:30,error:''};render();},cancel(){draft=null;localOpened=false;localUpload.cancel();},input,handle};
}
