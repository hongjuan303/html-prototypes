// Public fixtures are synthetic. User-uploaded files never use these fallbacks.
export function demoFileUrl(file){
 if(!file?.demo)return '';
 const name=file.name||'',ext=name.split('.').pop().toLowerCase();
 let asset='';
 if(['doc','docx'].includes(ext))asset=file.reviewAttachment||/批注|审核|意见/.test(name)?'review.docx':/一卡/.test(name)?'card.docx':'full.docx';
 else asset=({pdf:'material.pdf',xlsx:'materials.xlsx',xls:'materials.xlsx',png:'poster.png',jpg:'poster.png',jpeg:'poster.png',svg:'poster.svg',zip:'test-fixtures.zip'})[ext]||'';
 return asset?new URL('./demo-assets/'+asset,import.meta.url).href:'';
}
export async function readDemoWord(file,read){
 const response=await fetch(demoFileUrl(file));if(!response.ok)throw Error('合成示例附件加载失败，请重试。');
 const data=await response.blob();return read(new File([data],file.name.replace(/\.doc$/i,'.docx'),{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}));
}
