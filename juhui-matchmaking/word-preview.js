// Local text preview. Production should use an authenticated document conversion service.
export function readingDocument(text){
 const lines=text.replace(/\r\n?/g,'\n').split('\n').map(x=>x.trim()).filter(Boolean);
 const heading=/^(人物小传|分集大纲|剧本正文|故事梗概|第[0-9一二三四五六七八九十百零〇]+[集章节](?:\s.*)?|(?:一卡|全集)预览效果示例)$/;
 const paragraphs=lines.map((text,index)=>({text,index,heading:heading.test(text)}));
 let section='';const chapters=paragraphs.filter(x=>x.heading).map(x=>{const episode=/^第/.test(x.text);if(!episode)section=x.text;return {...x,depth:episode&&section?1:0,label:episode&&section?section+' · '+x.text:x.text};});
 return {paragraphs,chapters:chapters.length?chapters:[{index:0,text:'正文'}],characters:lines.join('').length};
}
export async function readWord(file){
 if(/\.doc$/i.test(file.name))throw new Error('此旧版 .doc 需文档服务转换后预览。本地原型尚未接入通用转码，可先下载原文件查看。');
 if(!/\.docx$/i.test(file.name))throw new Error('请选择 Word 文件（.doc 或 .docx）。');
 if(!window.mammoth)throw new Error('预览组件加载失败，请重试。');
 let result;try{result=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});}catch{throw new Error('文件解析失败，可能已损坏或加密。请重试，或下载原件查看。');}
 if(!result.value.trim())throw new Error('未读取到可预览的文字，可能为图片型、加密或损坏文档，请下载原件查看。');
 return readingDocument(result.value);
}
async function wordXmlParts(file){
 const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer),parts={};
 let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
 if(end<0)throw Error('未找到文档目录');
 let position=view.getUint32(end+16,true);
 for(let i=0;i<view.getUint16(end+10,true);i++){
  if(view.getUint32(position,true)!==0x02014b50)throw Error('文档目录异常');
  const method=view.getUint16(position+10,true),size=view.getUint32(position+20,true),nameLength=view.getUint16(position+28,true),extra=view.getUint16(position+30,true),comment=view.getUint16(position+32,true),offset=view.getUint32(position+42,true);
  const name=new TextDecoder().decode(bytes.slice(position+46,position+46+nameLength));
  if(['word/document.xml','word/comments.xml'].includes(name)){
   const start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true),compressed=bytes.slice(start,start+size);
   const content=method===0?compressed:method===8?new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()):null;
   if(!content)throw Error('文档压缩格式暂不支持');
   parts[name]=new DOMParser().parseFromString(new TextDecoder().decode(content),'application/xml');
  }
  position+=46+nameLength+extra+comment;
 }
 return parts;
}
export async function readReviewWord(file){
 const result=await readWord(file);
 try{
  const parts=await wordXmlParts(file),ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const nodes=(node,name)=>[...(node?.getElementsByTagNameNS(ns,name)||[])];
  const attr=(node,name)=>node.getAttributeNS(ns,name)||'';
  const text=node=>nodes(node,'t').map(x=>x.textContent).join('');
  const document=parts['word/document.xml'];
  result.comments=nodes(parts['word/comments.xml'],'comment').map(node=>{
   const id=attr(node,'id'),range=nodes(document,'commentRangeStart').find(x=>attr(x,'id')===id);
   let paragraph=range;while(paragraph&&paragraph.localName!=='p')paragraph=paragraph.parentElement;
   return {author:attr(node,'author'),date:attr(node,'date'),text:text(node),context:paragraph?text(paragraph):''};
  });
  result.revisions=['ins','del'].flatMap(kind=>nodes(document,kind).map(node=>({kind:kind==='ins'?'新增':'删除',author:attr(node,'author'),text:kind==='ins'?text(node):nodes(node,'delText').map(x=>x.textContent).join('')}))).filter(x=>x.text);
 }catch{result.annotationWarning='批注或修订暂未完整解析，请下载原Word查看完整标注。';}
 return result;
}
export function demoReading(name){
 const kind=name.includes('一卡')?'一卡':'全集';const title=name.replace(/_(一卡|全集)\.docx?$/i,'');
 return readingDocument(`《${title}》\n${kind}预览效果示例\n以下为原型演示文字，用于说明剧本在线阅读的布局与交互，不是该附件的实际剧本。\n第1集\n1-1 日 内 城市书店\n人物：林沐、陈舟\n△ 林沐推门走进书店，将一封未拆开的信放在柜台上。\n林沐：我想找这封信的主人。\n陈舟翻到信封背面，认出了那个许久未见的地址。\n第2集\n2-1 傍晚 外 旧街\n人物：林沐、陈舟\n△ 两人沿着地图来到旧街，原来的门牌已换成新的名字。\n林沐：地址变了，但总会有人记得。\n陈舟：先从隔壁问起吧。\n第3集\n3-1 夜 内 工作室\n人物：林沐\n△ 林沐把线索整理在桌上，一张照片让散乱的信息有了联系。\n林沐：原来答案一直在这里。\n示例结束。正式预览应显示当前附件的全部可读内容。`);
}
