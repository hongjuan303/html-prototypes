// All uploaded attachments stay in this browser, independently of their business role.
let database;
const storageError=()=>new Error('附件保存失败，请检查浏览器存储空间后重试。');
function openDatabase(){
 if(typeof indexedDB==='undefined')return Promise.reject(new Error('当前浏览器不支持本地附件存储。'));
 if(!database)database=new Promise((resolve,reject)=>{
  const request=indexedDB.open('juhui-review-files',1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('files'))request.result.createObjectStore('files');};
  request.onsuccess=()=>{
   const db=request.result;
   db.onversionchange=()=>{db.close();database=undefined;};
   resolve(db);
  };
  request.onerror=()=>reject(storageError());
  request.onblocked=()=>reject(new Error('附件存储暂被其他页面占用，请关闭重复的原型页面后重试。'));
 }).catch(error=>{database=undefined;throw error;});
 return database;
}

export function collectAttachmentReferences(state){
 const refs=new Map(),seen=new WeakSet();
 function collect(value){
  if(!value||typeof value!=='object'||seen.has(value))return;
  seen.add(value);
  if(typeof value.previewId==='string'&&value.previewId&&typeof value.name==='string')refs.set(value.previewId,value);
  for(const item of Object.values(value))collect(item);
 }
 collect(state);
 return refs;
}

export async function persistReviewFiles(files=[],uploads){
 const saved=[],missing=[],entries=new Map();
 for(const meta of files){
  if(!meta)continue;
  const id=meta.previewId,entry=id?uploads?.get(id):undefined;
  if(!id||!entry?.file||typeof Blob==='undefined'||!(entry.file instanceof Blob)){
   missing.push({previewId:id||null,name:meta.name||'未命名附件',reason:id?'当前会话没有该附件原件':'缺少附件标识'});
   continue;
  }
  entries.set(id,entry.file);
 }
 if(!entries.size)return {saved,missing};
 const db=await openDatabase();
 await new Promise((resolve,reject)=>{
  let transaction;
  try{
   transaction=db.transaction('files','readwrite');
   transaction.oncomplete=resolve;
   transaction.onerror=transaction.onabort=()=>reject(storageError());
   const store=transaction.objectStore('files');
   for(const [id,file]of entries)store.put(file,id);
  }catch(error){try{transaction?.abort();}catch{}reject(storageError());}
 });
 saved.push(...entries.keys());
 return {saved,missing};
}

export async function restoreReviewFiles(state,uploads){
 const refs=collectAttachmentReferences(state),restored=[],missing=[];
 if(!refs.size)return {restored,missing};
 const db=await openDatabase();
 await Promise.all([...refs].map(([id,meta])=>new Promise(resolve=>{
  if(uploads.get(id)?.file){resolve();return;}
  let request;
  const unavailable=reason=>{missing.push({previewId:id,name:meta.name,reason});resolve();};
  try{request=db.transaction('files','readonly').objectStore('files').get(id);}
  catch{unavailable('本地附件暂时无法读取');return;}
  request.onsuccess=()=>{
   const original=request.result;
   if(typeof Blob==='undefined'||!(original instanceof Blob)){unavailable('本地原件已失效，可选择同名原件恢复');return;}
   if(Number.isFinite(meta.size)&&meta.size!==original.size){unavailable('本地原件大小与附件记录不一致');return;}
   try{
    const file=new File([original],meta.name,{type:original.type,lastModified:original.lastModified||Date.now()});
    uploads.set(id,{file,url:URL.createObjectURL(file)});restored.push(id);resolve();
   }catch{unavailable('本地附件暂时无法恢复');}
  };
  request.onerror=()=>unavailable('本地附件暂时无法读取');
 })));
 return {restored,missing};
}
