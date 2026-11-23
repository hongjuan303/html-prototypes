import { CFB } from './vendor/xlsx.mjs';

export const isWordFile = file => /\.(doc|docx)$/i.test(file?.name||'');

export async function readWordFile(file){
  const result={name:file.name,size:file.size,file,content:null,error:''};
  if(!file.size){result.error='Word正文文件为空';return result;}
  try{
    const buffer=await file.arrayBuffer(),bytes=new Uint8Array(buffer);
    if(/\.docx$/i.test(file.name)){
      if(bytes[0]!==80||bytes[1]!==75)throw Error('文件内容不是有效的Word文档，请勿仅修改后缀');
      if(!window.mammoth)throw Error('Word读取组件加载失败，请刷新后重试');
      let text;
      try{text=(await window.mammoth.extractRawText({arrayBuffer:buffer})).value;}
      catch{throw Error('Word文档无法读取，可能已损坏、加密或格式不符');}
      if(!text?.trim())throw Error('Word文档没有可读取的正文文字');
      result.content=text;
    }else if(/\.doc$/i.test(file.name)){
      const signature=[208,207,17,224,161,177,26,225];
      if(!signature.every((value,i)=>bytes[i]===value))throw Error('文件内容不是有效的Word文档，请勿仅修改后缀');
      let document;
      try{document=CFB.find(CFB.read(bytes,{type:'array'}),'WordDocument');}
      catch{throw Error('Word文档无法读取，可能已损坏或加密');}
      if(!document?.content?.length)throw Error('文件内容不是有效的Word文档');
      // The legacy binary format is accepted as a Word upload. Its text and
      // character count must come from server conversion; do not guess them.
      result.pendingContentCheck=true;
    }else throw Error('请选择Word正文文件（.doc或.docx）');
  }catch(error){result.error=error.message;}
  return result;
}
