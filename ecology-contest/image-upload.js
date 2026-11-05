import {storeFiles,getFile} from './model.js?v=20261102-v1';

const placeholder='./assets/cover-placeholder.svg';
const cache=new Map();
const safeURL=value=>/^(https?:\/\/|\.\/assets\/|data:image\/(png|jpeg|webp);base64,)/i.test(value||'')?value:'';
export function validateImageFile(file,maxMB){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('请选择 JPG、PNG 或 WebP 图片');
  if(!file.size||file.size>maxMB*1024*1024)throw Error('图片大小须大于 0 且不超过 '+maxMB+' MB');
}
function storedImage(ref,esc,alt,cls=''){
  return '<img class="'+cls+'" data-stored-image="'+esc(ref.id)+'" src="'+placeholder+'" alt="'+esc(alt)+'">';
}
export function coverImage(e,esc,alt='赛事封面'){
  return e.coverFile?storedImage(e.coverFile,esc,alt):'<img src="'+esc(e.image?'./assets/'+e.image:placeholder)+'" alt="'+esc(alt)+'">';
}
export function qrImage(e,kind,esc){
  const ref=e[kind+'QRFile'],url=safeURL(e[kind+'QR']),alt=(kind==='award'?'领奖':'咨询')+'商务二维码';
  return ref?storedImage(ref,esc,alt,'business-qr'):url?'<img class="business-qr" src="'+esc(url)+'" alt="'+alt+'">':'<div class="qr-placeholder"><span>⌗</span><b>商务二维码待配置</b><small>示意占位 · 不可扫码</small></div>';
}
export async function hydrateImages(root=document){
  await Promise.all([...root.querySelectorAll('[data-stored-image]')].map(async img=>{
    const id=img.dataset.storedImage;
    try{
      if(!cache.has(id))cache.set(id,getFile(id).then(blob=>{if(!blob)throw Error('图片不存在');return URL.createObjectURL(blob);}));
      const url=await cache.get(id);
      if(img.isConnected&&img.dataset.storedImage===id)img.src=url;
    }catch{cache.delete(id);if(img.isConnected){img.alt='图片暂不可用，请重新上传';img.title=img.alt;}}
  }));
}
export function imageUploadControl(key,e,esc){
  const cover=key==='cover',ref=e[cover?'coverFile':key+'QRFile'],legacy=cover?e.image:e[key+'QR'];
  const title=cover?'赛事封面':key==='consult'?'参赛咨询二维码':'获奖领奖二维码';
  return '<div class="image-upload-control '+(cover?'cover-upload':'qr-upload')+'" data-image-control="'+key+'"><span class="image-upload-title">'+title+'</span><div class="image-upload-content"><div class="image-upload-preview">'+(cover?coverImage(e,esc):qrImage(e,key,esc))+'</div><div><label class="btn image-upload-button">'+(ref||legacy?'更换图片':'上传图片')+'<input type="file" data-image-upload="'+key+'" aria-label="'+title+'" accept="image/jpeg,image/png,image/webp"></label><small>'+(cover?'建议 1920 × 1080 px（16:9）；支持 JPG / PNG / WebP，最大 5 MB。':'支持 JPG / PNG / WebP，最大 2 MB；建议上传清晰的正方形二维码。')+'</small><small class="image-upload-filename">'+esc(ref?.name||(legacy?'已配置图片':'尚未上传'))+'</small><p class="image-upload-error" role="alert"></p></div></div></div>';
}
export function bindImageUploads(form){
  const selected=new Map(),pending=new Map(),urls=new Set();
  let closed=false;
  form.querySelectorAll('[data-image-upload]').forEach(input=>{
    input.addEventListener('change',async()=>{
      const file=input.files[0],key=input.dataset.imageUpload,control=input.closest('[data-image-control]'),error=control.querySelector('.image-upload-error');
      input.value='';if(!file)return;
      const token={};pending.set(key,token);error.textContent='正在检查图片…';
      let url;
      try{
        validateImageFile(file,key==='cover'?5:2);
        url=URL.createObjectURL(file);urls.add(url);
        await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>img.naturalWidth&&img.naturalHeight?resolve():reject(Error('图片无法读取，请重新选择'));img.onerror=()=>reject(Error('图片无法读取，请重新选择'));img.src=url;});
        if(closed||pending.get(key)!==token)return;
        selected.set(key,file);
        const preview=control.querySelector('.image-upload-preview');preview.replaceChildren();
        const img=document.createElement('img');img.src=url;img.alt=control.querySelector('.image-upload-title').textContent;preview.append(img);
        control.querySelector('.image-upload-filename').textContent=file.name+' · 待保存';
        error.textContent='';
      }catch(e){if(!closed&&pending.get(key)===token)error.textContent=e.message+'；原图片保持不变。';if(url){URL.revokeObjectURL(url);urls.delete(url);}}
      finally{if(pending.get(key)===token)pending.delete(key);}
    });
  });
  return {
    async prepare(){
      if(closed)throw Error('本次配置已取消');
      if(pending.size)throw Error('图片仍在检查中，请稍后保存');
      const patch={};
      for(const[key,file]of selected){
        const [ref]=await storeFiles([file]);
        if(closed)throw Error('本次配置已取消');
        patch[key==='cover'?'coverFile':key+'QRFile']=ref;
        if(key!=='cover')patch[key+'QR']='';
      }
      return patch;
    },
    cleanup(){closed=true;for(const url of urls)URL.revokeObjectURL(url);}
  };
}
