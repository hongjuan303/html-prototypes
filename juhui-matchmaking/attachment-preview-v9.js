import {demoFileUrl} from './demo-assets-v8.js?v=20261109-overview-merge';

export const isSpreadsheet=f=>/\.(xlsx|xls|csv|tsv|ods)$/i.test(f?.name||'');
export async function loadSpreadsheet(file,uploads){
 const stored=uploads?.get(file.previewId||file.name),url=stored?.url||demoFileUrl(file);
 let bytes;
 if(stored?.file)bytes=await stored.file.arrayBuffer();
 else if(file.demo&&url){const res=await fetch(url);if(!res.ok)throw Error('示例表格加载失败，请重试。');bytes=await res.arrayBuffer();}
 else throw Error('本机未找到该附件原件，请先恢复附件。');
 const XLSX=await import('./vendor/xlsx.mjs');
 if(/\.xls$/i.test(file.name))XLSX.set_cptable(await import('./vendor/cpexcel.full.mjs'));
 let workbook;
 try{
  if(/\.(csv|tsv)$/i.test(file.name)){
   let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{text=new TextDecoder('gb18030').decode(bytes);}
   workbook=XLSX.read(text,{type:'string',raw:true,FS:/\.tsv$/i.test(file.name)?'\t':undefined});
  }else workbook=XLSX.read(bytes,{type:'array',cellHTML:false,cellNF:false,cellStyles:false});
 }catch{throw Error('表格无法解析，可能已损坏、加密或格式不匹配。可下载原件查看。');}
 const sheets=workbook.SheetNames.map(name=>{
  const sheet=workbook.Sheets[name],range=sheet['!ref']?XLSX.utils.decode_range(sheet['!ref']):null;
  const totalRows=range?range.e.r+1:0,totalColumns=range?range.e.c+1:0;
  const rows=[];
  for(let r=0;r<Math.min(totalRows,500);r++){
   const row=[];for(let c=0;c<Math.min(totalColumns,60);c++){
    const cell=sheet[XLSX.utils.encode_cell({r,c})];
    // Formulas are displayed as cached values, never executed; links are plain text.
    row.push(cell?cell.w??XLSX.utils.format_cell(cell)??'':'');
   }rows.push(row);
  }
  return {name,rows,totalRows,totalColumns,truncated:totalRows>500||totalColumns>60};
 });
 if(!sheets.length)throw Error('未找到可预览的工作表。');
 return {status:'ready',sheets,sheet:0};
}

export function spreadsheetPreview(d,h){
 const {E,button}=h,r=d.spreadsheet||{status:'loading'},f=d.file;
 if(r.status!=='ready')return `<div class="reader-state" role="status"><h3>${r.status==='error'?'暂时无法预览':'正在读取表格…'}</h3><p>${E(r.error||'正在加载工作表内容')}</p>${r.status==='error'?button('重试预览','spreadsheet-retry'):''}</div>`;
 const index=Math.max(0,Math.min(r.sheet||0,r.sheets.length-1)),sheet=r.sheets[index];
 const column=i=>{let name='',n=i+1;while(n){name=String.fromCharCode(65+(n-1)%26)+name;n=Math.floor((n-1)/26);}return name;};
 return `<div class="spreadsheet-preview"><div class="spreadsheet-tabs" role="group" aria-label="工作表">${r.sheets.map((s,i)=>button(E(s.name),'spreadsheet-sheet',String(i),i===index?'primary':'',`aria-pressed="${i===index}"`)).join('')}</div><p class="subtle">${E(sheet.name)} · ${sheet.totalRows} 行 · ${sheet.totalColumns} 列${sheet.truncated?' · 预览前500行、60列；完整内容可下载查看':''}</p><div class="spreadsheet-scroll">${sheet.totalRows?`<table class="spreadsheet-table"><thead><tr><th></th>${Array.from({length:Math.min(sheet.totalColumns,60)},(_,i)=>`<th>${column(i)}</th>`).join('')}</tr></thead><tbody>${sheet.rows.map((row,i)=>`<tr><th>${i+1}</th>${row.map(value=>`<td>${E(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<p class="muted">此工作表暂无内容。</p>'}</div><p class="subtle">单元格内容预览；排版与公式以原文件为准。</p></div>`;
}
