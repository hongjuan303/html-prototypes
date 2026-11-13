(() => {
'use strict';
// One request prepares the whole lesson. Playing a prepared clip stays synchronous
// with the tap, including on mobile browsers that require a user gesture.
const manifest=window.LESSON_AUDIO_PACKS||{};
const clips=new Map(),lessons=new Map();
const cacheName='little-english-audio-packs-v1';
let active=null;
function touch(id){const paths=lessons.get(id);if(paths){lessons.delete(id);lessons.set(id,paths);}}
function trim(){
 while(lessons.size>3){
  const [id,paths]=lessons.entries().next().value;lessons.delete(id);
  const retained=new Set([...lessons.values()].flat());
  for(const path of paths)if(!retained.has(path)){URL.revokeObjectURL(clips.get(path));clips.delete(path);}
 }
}
async function unpack(response){
 const blob=await response.blob();
 if(blob.size<4||blob.size>5*1024*1024)throw new Error('Invalid lesson audio size');
 const size=new DataView(await blob.slice(0,4).arrayBuffer()).getUint32(0,true);
 if(size<1||size>65536||size+4>blob.size)throw new Error('Invalid lesson audio header');
 const header=JSON.parse(await blob.slice(4,size+4).text());
 if(header.version!==1||!Array.isArray(header.clips)||!header.clips.length)throw new Error('Invalid lesson audio format');
 let offset=size+4;
 const entries=header.clips.map(([path,length,type])=>{
  if(typeof path!=='string'||!/^assets\/audio\/[a-zA-Z0-9/_.-]+\.(mp3|m4a)$/.test(path)||!Number.isInteger(length)||length<1||!['audio/mpeg','audio/mp4'].includes(type)||offset+length>blob.size)throw new Error('Invalid lesson clip');
  const entry={path,blob:blob.slice(offset,offset+length,type)};offset+=length;return entry;
 });
 if(offset!==blob.size)throw new Error('Incomplete lesson audio');
 return entries;
}
function cancel(){if(active){active.controller.abort();active=null;}}
function warm(id){
 id=String(id);
 if(active&&active.id!==id)cancel();
 if(lessons.has(id)){touch(id);return Promise.resolve(true);}
 if(active?.id===id)return active.promise;
 if(!manifest[id])return Promise.resolve(false);
 const controller=new AbortController(),request={id,controller};active=request;
 request.promise=(async()=>{
  const url=new URL(manifest[id],document.baseURI).href;
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
   let cache=null,entries=null;
   try{if('caches'in window)cache=await window.caches.open(cacheName);}catch{}
   if(cache){
    try{const saved=await cache.match(url);if(saved)entries=await unpack(saved);}catch{try{await cache.delete(url);}catch{}}
   }
   if(!entries){
    const response=await fetch(url,{signal:controller.signal});
    if(!response.ok)throw new Error('Lesson audio unavailable');
    const copy=cache?response.clone():null;
    entries=await unpack(response);
    if(copy)cache.put(url,copy).catch(()=>{});
   }
   if(controller.signal.aborted)return false;
   for(const {path,blob} of entries)if(!clips.has(path))clips.set(path,URL.createObjectURL(blob));
   lessons.set(id,entries.map(entry=>entry.path));trim();return true;
  }catch{return false;}
  finally{clearTimeout(timer);if(active===request)active=null;}
 })();
 return request.promise;
}
window.LESSON_AUDIO={warm,cancel,source:path=>clips.get(path)||'./'+path};
})();
