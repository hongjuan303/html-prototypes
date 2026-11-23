import * as XLSX from './vendor/xlsx.mjs';
import { isWordFile, readWordFile } from './word-files.mjs';
import { sampleRequirements } from './samples/sample-data.mjs';

const root = document.querySelector('#batchOverlay');
const notes = document.querySelector('#prototypeNotes');
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pin = n => `<button class="pin" data-note="${n}" aria-label="查看说明${n}">${n}</button>`;
const bodyMatchesTitle = (fileName,title) => isWordFile({name:fileName})&&fileName.replace(/\.(doc|docx)$/i,'')===String(title||'').trim();
const fields = [
  {key:'name',label:'小说名称',required:true,max:50},
  {key:'intro',label:'简介',required:true,max:500,type:'textarea'},
  {key:'finish',label:'完结日期',required:true,type:'date'},
  {key:'author',label:'作者笔名',required:true,max:10},
  {key:'owner',label:'责编',options:['梁洁敏','蔡兴达','严润璐']},
  {key:'channel',label:'男女频',required:true,options:['男频','女频']},
  {key:'type',label:'小说类型',required:true,options:['长篇','短篇']},
  {key:'tags',label:'标签'},
  {key:'listing',label:'上架类型',required:true,options:['签约','精修','原创']},
  {key:'cost',label:'成本',type:'money'},
  {key:'copyright',label:'版权类型',required:true,options:['自有版权','非自有版权']},
  {key:'tomato',label:'授权番茄',required:true,options:['是','否'],default:'否'},
  {key:'exclusive',label:'是否独家',options:['是','否'],default:'否'},
  {key:'fileName',label:'正文文件名',required:true},
  {key:'protagonist',label:'主角名',max:6},
  {key:'remark',label:'备注',max:500,type:'textarea'},
];
let step = 0;
let rows = [];
let bodyFiles = [];
let sheetName = '';
let results = [];
let editIndex = null;
let demoFailure = false;
let message = '';
let isBusy = false;
let lastFocus = null;
let askClose = false;
let draftStep = 1;
let replacementRow = null;
let busyText = '正在处理本批小说，请稍候…';

function noteSection(n,title,items){return `<section id="note-${n}" class="note-section"><h2><span class="pin">${n}</span>${title}</h2><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></section>`;}
function renderNotes(){
  let page='小说管理列表';
  let content='';
  if (step===0) content=noteSection(1,'操作项',['批量上传小说：位于筛选下方、列表上方，与新建小说并列；点击打开批量上传弹窗。','全部上传成功：关闭上传弹窗、刷新小说列表，toast提示“新建小说成功”','列表其他字段及操作沿用现有小说管理，本次只补充批量上传。']);
  else if (editIndex!==null){
    page='批量上传小说－修改小说信息';
    content=noteSection(1,'配置项 · 小说信息',[
      '小说名称：必填，最多50字。','简介：必填，最多500字。','完结日期：必填，有效日期。','作者笔名：必填，最多10字。','责编：选填，沿用既有人员字典；示例为梁洁敏、蔡兴达、严润璐。','主角名：选填，本草案沿用单项最多6字。'
    ])+noteSection(2,'配置项 · 内容与版权',[
      '男女频：必填，男频/女频。','小说类型：必填，长篇/短篇。','标签：选填，多个以顿号分隔；正式标签字典及录入方式待确认。','上架类型：必填，签约/精修/原创。','成本：上架类型为签约时必填；单位元，非负金额，最多两位小数；其他类型隐藏并清空。','版权类型：必填，自有版权/非自有版权。','授权番茄：必填，是/否，默认否。','是否独家：授权番茄为是时显示并必填，默认否；选择否后隐藏并清空独家关系。'
    ])+noteSection(3,'配置项 · 正文与备注',[
      '正文文件名：必填，从已选择的Word文档中选择，完整文件名精确匹配；去掉.doc/.docx后缀后的文件名须与小说名称一致。不匹配时不参与导入，缺失文件名保留显示，补选正文后可重新匹配。','备注：选填，最多500字。'
    ])+noteSection(4,'操作项',[
      '保存修改：将当前行修改带回校验列表，重新执行整批校验；错误仍在列表逐项提示，不能跳过校验提交。','取消/关闭：放弃当前行未保存的修改，返回校验列表，保留其他行及所选文件。'
    ]);
  }else if(step===1){
    page='批量上传小说－上传文件';
    content=noteSection(1,'配置项 · 小说信息表',[
      '下载空白模板：下载未填写的Excel模板；含“小说信息”与“填写说明”两个工作表，一行对应一本小说。','上传Excel：选择.xlsx文件，仅解析“小说信息”工作表。缺失表头、工作表、有效数据或文件解析失败时在弹窗提示，保留此前有效草稿。重新选择成功后替换本批信息表。','字段：小说名称、简介、完结日期、作者笔名、责编、男女频、小说类型、标签、上架类型、成本、版权类型、授权番茄、是否独家、正文文件名、主角名、备注。字段枚举、长度及条件必填同修改表单。'
    ])+noteSection(2,'配置项 · 小说正文',[
      '选择正文文件：支持多选或拖入Word文档（.doc、.docx），完整文件名与Excel“正文文件名”精确匹配；同一文件名出现多份时提示歧义，不任意覆盖。','正文文件：<ul><li>使用Word文档，校验文件格式、缺失正文及重复引用；</li><li>空文件、损坏或不可读的文档提示错误；</li><li>word文件名与excel小说名称不匹配的，不参与导入；</li></ul>','移除：从本批选择中移除该文件，不删除本地源文件；信息表匹配结果同步更新。'
    ])+noteSection(3,'操作项',[
      '下一步：至少选择有效Excel和一份正文，进入校验信息步骤并检查每行。','取消/关闭：已有草稿时可选择保留并返回列表，或清空本批草稿；未提交时不创建小说。重新打开默认恢复本批草稿。'
    ]);
  }else if(step===2){
    page='批量上传小说－校验信息';
    content=noteSection(1,'列表项',[
      'Excel行号：对应源表实际行号，方便定位。','小说名称：显示本行小说名。','作者笔名：显示作者，未填显示“未填写”。','男女频/小说类型：展示分类及长篇/短篇。','上架类型/成本：签约时显示成本，统一两位小数，单位元；其他类型显示“—”。','正文文件：默认显示Excel填写的完整文件名；手动替换后显示新文件名。文件名去掉Word后缀后须与小说名称一致，校验匹配及有效性。','校验结果：显示通过或本行全部失败原因，顶部同步通过/异常数量。','校验范围：必填、长度、日期、枚举、签约成本、番茄联动、正文匹配及重复；草案用书名＋作者检查批内及已有记录重复，不覆盖已有小说。'
    ])+noteSection(2,'操作项 · 列表',[
      '修改：打开当前行表单，可修正信息或重新指定已选正文文件；保存后重新校验。','替换正文：点击打开本地文件选择器，单选与当前小说同名的Word正文（.doc、.docx）。通过文件校验后替换当前行正文，自动更新正文文件名并重新校验全批；保留该行其他小说信息。','替换失败/取消：取消选择或文件不符合要求时保留原正文；文件名与小说名称不匹配或已被其他小说使用时提示，不覆盖其他小说正文。替换中禁止重复操作，成功提示“正文替换成功，已重新校验”。','移除：只从本批草稿移除此行，保留Excel与本地文件；至少保留一条通过记录才能提交。'
    ])+noteSection(3,'操作项 · 提交',[
      '上一步：返回上传文件步骤，保留草稿及所选正文；可以补选正文或更换信息表。','确认上传：草案按所有保留行均校验通过后启用；确认后再校验，处理中禁用重复提交及关闭。','全部成功：直接关闭上传弹窗、刷新小说列表，toast提示“新建小说成功”，不展示成功结果弹窗。','存在失败：保留失败反馈及重试入口，成功项进入列表且不重复创建，明确失败项保留原信息。本原型只演示结果，不调用生产上传服务。'
    ]);
  }else{
    page='批量上传小说－失败处理';
    content=noteSection(1,'列表项',[
      'Excel行号：源表行号。','小说名称：本次处理的小说。','作者笔名：本行作者。','正文文件：本次提交匹配的Word文档。','上传结果：逐条显示成功或失败；成功显示新小说ID，失败显示原因。顶部汇总成功、失败数量。'
    ])+noteSection(2,'操作项',[
      '重试失败项：仅重试本批明确失败的记录，已成功记录不重复创建；全部成功后直接关闭弹窗并toast提示“新建小说成功”。正式接口若超时，应先核实服务端结果再重试，此能力待接入。','返回列表：关闭失败反馈弹窗，返回小说管理列表；成功项显示在示例列表顶部，草案默认下架。','下载失败明细：导出失败行、原信息及失败原因，便于修正重传。'
    ]);
  }
  const dataSource=step===0?'数据源：小说信息来自Excel，正文来自本地Word文档；人员、分类及权限应沿用后台现有配置；':'数据源：小说信息来自用户Excel，正文来自本地Word文档；人员、分类及权限应沿用后台现有配置，本地原型使用示例字典与数据。';
  const extraNotes=step===0?'':'<li class="attention">2026.11.23：用户已确认Excel信息表＋Word正文；重名规则、整批校验、默认下架仍为草案，待确认。</li><li class="attention">待确认：单批数量与文件大小、章节拆分、封面与版权附件、权限与默认状态。</li>';
  const footerNotes=step===1?'':`<h2>其他注意说明</h2><ul><li>${dataSource}</li>${extraNotes}</ul>`;
  notes.innerHTML=`<h1>#页面说明</h1><ul><li>本页是“小说管理 / ${page}”页。</li></ul><h1>#原型说明</h1><ul><li><b>背景：</b>运营需连续录入多本小说，逐本新建和选择正文操作重复。</li><li><b>需求：</b>用Excel填写信息并匹配正文，集中校验后批量新增，逐条反馈结果。</li></ul>${content}${footerNotes}`;
}

function reset(){rows=[];bodyFiles=[];sheetName='';results=[];message='';step=1;draftStep=1;editIndex=null;askClose=false;demoFailure=false;replacementRow=null;}
function open(){lastFocus=document.activeElement;if(!step)step=draftStep;root.hidden=false;render();root.querySelector('button')?.focus();}
function hide(){root.hidden=true;step=0;editIndex=null;askClose=false;renderNotes();lastFocus?.focus();}
function dataRows(){return rows.map(r=>r.data);}
function errorsFor(row,index){
  const d=row.data, errors=[];
  for(const f of fields){
    if(f.key==='exclusive'&&d.tomato!=='是')continue;
    if(f.key==='cost'&&d.listing!=='签约')continue;
    const v=String(d[f.key]??'').trim();
    if((f.required||(f.key==='cost'&&d.listing==='签约')||(f.key==='exclusive'&&d.tomato==='是'))&&!v){errors.push(`${f.label}未填写`);continue;}
    if(v&&f.max&&v.length>f.max)errors.push(`${f.label}超过${f.max}字`);
    if(v&&f.options&&!f.options.includes(v))errors.push(`${f.label}不在允许范围`);
    if(f.type==='date'&&v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))errors.push('完结日期无效');
    if(f.type==='money'&&v&&!/^\d+(\.\d{1,2})?$/.test(v))errors.push('成本需为非负金额，最多两位小数');
  }
  const matches=bodyFiles.filter(f=>f.name===d.fileName);
  if(d.fileName){
    if(!bodyMatchesTitle(d.fileName,d.name))errors.push('正文文件名与小说名称不匹配，不参与导入');
    if(!matches.length)errors.push('未匹配到正文文件');
    if(matches.length>1)errors.push('存在多个同名正文文件');
    if(matches.length===1&&matches[0].error)errors.push(matches[0].error);
    if(rows.some((r,i)=>i!==index&&r.data.fileName===d.fileName))errors.push('正文文件被多行引用');
  }
  if(d.name&&d.author){
    if(rows.some((r,i)=>i!==index&&r.data.name===d.name&&r.data.author===d.author))errors.push('本批书名和作者重复');
    if(novels.some(n=>n.name===d.name&&n.author===d.author))errors.push('已有相同书名和作者的小说');
  }
  return errors;
}
function allErrors(){return rows.map(errorsFor);}
function stepper(){const steps=step===3?['上传文件','校验信息','失败处理']:['上传文件','校验信息'];return `<div class="stepper">${steps.map((t,i)=>`${i?`<span class="step-line ${step>i?'done':''}"></span>`:''}<div class="step ${step===i+1?'active':step>i+1?'done':''}"><i>${step>i+1?'✓':i+1}</i><span>${t}</span></div>`).join('')}</div>`;}
function footer(html,hint=''){return `<footer class="batch-footer"><span class="footer-hint">${hint}</span>${html}</footer>`;}
function button(action,label,primary=false,disabled=false){return `<button type="button" data-action="${action}" class="${primary?'primary':'secondary'}" ${disabled?'disabled':''}>${label}</button>`;}
const icon='<svg class="upload-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 19v7h18v-7M16 22V5M10 11l6-6 6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function renderUpload(){
  return `<section class="upload-section"><div class="upload-caption"><h2>${pin(1)}小说信息表 <small>一行对应一本小说</small></h2><button class="text-button" data-action="template">下载空白模板</button></div>${sheetName?`<div class="file-summary"><span class="file-icon">XLSX</span><span class="file-name">${esc(sheetName)}<small>已读取 ${rows.length} 本小说</small></span><button data-action="chooseExcel">重新选择</button></div>`:`<div class="upload-zone" data-drop="excel" role="button" tabindex="0" aria-label="上传小说信息表">${icon}<p>将Excel拖到此处，或 <span class="text-button">点击上传</span></p><small>使用下载模板填写，支持 .xlsx</small></div>`}<input type="file" accept=".xlsx" id="excelInput" hidden></section><section class="upload-section"><div class="upload-caption"><h2>${pin(2)}小说正文 <small>可一次选择多个Word文档（.doc、.docx）</small></h2>${bodyFiles.length?'<button class="text-button" data-action="chooseBody">继续添加</button>':''}</div><div class="upload-zone" data-drop="body" role="button" tabindex="0" aria-label="选择小说正文文件">${icon}<p>将正文文件拖到此处，或 <span class="text-button">选择文件</span></p><small>Word文件名（不含后缀）须与小说名称一致，完整文件名填写在Excel“正文文件名”中，如：春日来信.docx</small></div><input type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple id="bodyInput" hidden>${bodyFiles.length?`<div class="body-files">${bodyFiles.map((f,i)=>`<div class="body-file"><span>${esc(f.name)}</span><small>${f.error?`<span class="error-text">${esc(f.error)}</span>`:f.size<1024?`${f.size} B`:`${(f.size/1024).toFixed(1)} KB`}</small><button data-remove-file="${i}" aria-label="移除${esc(f.name)}">×</button></div>`).join('')}</div><p class="matched-count">已选 ${bodyFiles.length} 个文件${rows.length?` · 匹配 ${rows.filter(r=>bodyMatchesTitle(r.data.fileName,r.data.name)&&bodyFiles.filter(f=>f.name===r.data.fileName).length===1).length} / ${rows.length} 本小说`:''}</p>`:''}</section><div class="notice">请先核对模板字段与正文文件名。上传后会逐行校验，异常信息可在下一步修正。</div>`;
}
function renderCheck(){
  const errors=allErrors(),bad=errors.filter(x=>x.length).length;
  return `<div class="check-heading"><h2>${pin(1)}小说信息校验</h2><div class="check-count"><span>共 ${rows.length} 本</span><span class="success-text">通过 ${rows.length-bad}</span><span class="error-text">异常 ${bad}</span></div></div>${bad?'<div class="notice error">请修改或移除异常记录，全部通过后可确认上传。</div>':'<div class="notice success">所有保留记录均已通过校验，可以确认上传。</div>'}<div class="batch-table-wrap"><table class="batch-table"><thead><tr><th>Excel行号</th><th>小说名称</th><th>作者笔名</th><th>男女频 / 小说类型</th><th>上架类型 / 成本</th><th>正文文件</th><th>校验结果</th><th class="sticky-action">操作 ${pin(2)}</th></tr></thead><tbody>${rows.length?rows.map((r,i)=>`<tr><td>${r.line}</td><td>${esc(r.data.name)||'<span class="muted">未填写</span>'}</td><td>${esc(r.data.author)||'<span class="error-text">未填写</span>'}</td><td>${esc(r.data.channel)||'—'}<small>${esc(r.data.type)||'—'}</small></td><td>${esc(r.data.listing)||'—'}<small>${r.data.listing==='签约'&&r.data.cost!==''&&Number.isFinite(Number(r.data.cost))?'¥'+Number(r.data.cost).toFixed(2):'—'}</small></td><td>${esc(r.data.fileName)||'—'}</td><td>${errors[i].length?`<div class="error-text">${errors[i].map(esc).join('<br>')}</div>`:'<span class="badge">校验通过</span>'}</td><td class="sticky-action"><div class="table-actions"><button class="text-button" data-edit-row="${i}">修改</button><button class="text-button" data-replace-row="${i}">替换正文</button><button class="text-button" data-remove-row="${i}">移除</button></div></td></tr>`).join(''):'<tr><td colspan="8" class="check-empty">本批记录已全部移除，请返回上一步重新选择Excel。</td></tr>'}</tbody></table></div>`;
}
function renderResult(){
  const bad=results.filter(r=>r.status==='failure').length;
  return `<div class="result-title partial"><span class="result-icon">!</span><h2>本批上传完成，部分记录失败</h2><p>共 ${results.length} 本，成功 ${results.length-bad} 本${bad?`，失败 ${bad} 本`:''}</p></div><div class="check-heading"><h2>${pin(1)}上传结果</h2>${bad?'<button class="text-button" data-action="failedExport">下载失败明细</button>':''}</div><div class="batch-table-wrap"><table class="batch-table"><thead><tr><th>Excel行号</th><th>小说名称</th><th>作者笔名</th><th>正文文件</th><th>上传结果</th></tr></thead><tbody>${results.map(r=>`<tr><td>${r.row.line}</td><td>${esc(r.row.data.name)}</td><td>${esc(r.row.data.author)}</td><td>${esc(r.row.data.fileName)}</td><td><span class="badge ${r.status==='failure'?'error':''}">${r.status==='failure'?'上传失败':'上传成功'}</span><small class="${r.status==='failure'?'error-text':''}">${r.status==='failure'?esc(r.reason):`小说ID：${r.id}`}</small></td></tr>`).join('')}</tbody></table></div>`;
}
function inputField(f,d){
  let options=f.options;
  if(f.key==='fileName')options=[...new Set(bodyFiles.map(x=>x.name))];
  const val=d[f.key]??'';
  const html=options?`<select name="${f.key}"><option value="">请选择</option>${[...new Set([...options,...(val&&!options.includes(val)?[val]:[])])].map(v=>`<option ${v===val?'selected':''} value="${esc(v)}">${esc(v)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea name="${f.key}" maxlength="${f.max}">${esc(val)}</textarea>`:`<input name="${f.key}" value="${esc(val)}" type="${f.type==='date'?'date':'text'}" ${f.type==='money'?'inputmode="decimal"':''} ${f.max?`maxlength="${f.max}"`:''}>`;
  return `<label class="${f.required||(f.key==='cost'&&d.listing==='签约')||(f.key==='exclusive'&&d.tomato==='是')?'required':''} ${f.type==='textarea'?'full':''}" data-field="${f.key}" ${f.key==='cost'&&d.listing!=='签约'||f.key==='exclusive'&&d.tomato!=='是'?'hidden':''}><span>${f.label}${f.key==='cost'?'（元）':''}</span>${html}</label>`;
}
function renderEdit(){
  const d=rows[editIndex].data;
  const groups=[['小说信息',1,['name','intro','finish','author','owner','protagonist']],['内容与版权',2,['channel','type','tags','listing','cost','copyright','tomato','exclusive']],['正文与备注',3,['fileName','remark']]];
  return `<form id="batchEditForm" novalidate>${groups.map(([title,n,keys])=>`<section class="edit-group"><h2>${pin(n)}${title}</h2><div class="edit-grid">${keys.map(k=>inputField(fields.find(f=>f.key===k),d)).join('')}</div></section>`).join('')}</form>`;
}
function render(){
  renderNotes();
  const isEdit=editIndex!==null;
  const title=askClose?'离开批量上传':isEdit?`修改小说信息 · Excel第${rows[editIndex].line}行`:'批量上传小说';
  let body='',foot='';
  if(askClose){body='<div class="close-confirm"><h2>是否保留本批上传草稿？</h2><p>已选信息表、正文文件和修改内容可以保留。<br>清空草稿只移除本批选择，不删除本地源文件。</p></div>';foot=footer(button('continue','继续编辑')+button('discard','清空并离开')+button('keep','保留草稿并离开',true));}
  else if(isBusy){body=`<div class="busy" role="status"><div class="spinner"></div><p>${esc(busyText)}</p></div>`;foot=footer(button('submit','处理中',true,true));}
  else if(isEdit){body=renderEdit();foot=footer(pin(4)+button('cancelEdit','取消')+button('saveEdit','保存修改',true));}
  else if(step===1){body=renderUpload();foot=footer(pin(3)+button('cancel','取消')+button('next','下一步',true,!rows.length||!bodyFiles.length),'校验前不会创建小说');}
  else if(step===2){body=renderCheck();foot=footer(pin(3)+button('back','上一步')+button('submit','确认上传',true,!rows.length||allErrors().some(e=>e.length)),`本批 ${rows.length} 本小说`);}
  else{body=renderResult();foot=footer(pin(2)+button('retry','重试失败项',true)+button('finish','返回列表'));}
  root.innerHTML=`<section class="batch-dialog" role="dialog" aria-modal="true" aria-labelledby="batchTitle"><header class="batch-header"><h1 id="batchTitle">${title}</h1><button class="dialog-close" data-action="close" aria-label="关闭批量上传" ${isBusy?'disabled':''}>×</button></header>${askClose||isEdit?'':stepper()}<div class="batch-body">${message?`<div class="notice error" role="alert">${esc(message)}</div>`:''}${body}</div>${foot}<input type="file" id="replaceBodyInput" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-label="选择替换正文" hidden></section>`;
}

function closeRequest(){if(isBusy)return;if(editIndex!==null){editIndex=null;render();return;}if(step===3){rows=[];bodyFiles=[];sheetName='';results=[];hide();return;}if(rows.length||bodyFiles.length){askClose=true;render();}else hide();}
function normalDate(value){if(value instanceof Date&&!Number.isNaN(value.valueOf()))return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;if(typeof value==='number'){const d=XLSX.SSF.parse_date_code(value);if(d)return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;}return String(value??'').trim().replace(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/,(_,y,m,d)=>`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);}
async function loadExcel(file){
  if(!file)return;
  try{
    if(!/\.xlsx$/i.test(file.name))throw Error('请选择.xlsx格式的小说信息表');
    const book=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});
    const sheet=book.Sheets['小说信息'];if(!sheet)throw Error('缺少“小说信息”工作表，请下载并使用模板');
    const table=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',blankrows:true,raw:true});
    const headers=(table[0]||[]).map(v=>String(v).trim());
    const missing=fields.filter(f=>!headers.includes(f.label));if(missing.length)throw Error(`表头缺失：${missing.map(f=>f.label).join('、')}，请使用最新模板`);
    if(new Set(headers.filter(Boolean)).size!==headers.filter(Boolean).length)throw Error('表头重复，请核对模板');
    const loaded=[];
    table.slice(1).forEach((values,i)=>{if(values.every(v=>String(v).trim()===''))return;const data={};fields.forEach(f=>{let v=values[headers.indexOf(f.label)]??'';if(f.type==='date')v=normalDate(v);data[f.key]=String(v).trim()||f.default||'';});if(data.tomato!=='是')data.exclusive='否';if(data.listing!=='签约')data.cost='';loaded.push({line:i+2,data});});
    if(!loaded.length)throw Error('信息表没有有效数据，请填写后重新选择');
    rows=loaded;sheetName=file.name;results=[];message='';
  }catch(e){message=`信息表未载入：${e.message}`;}render();
}
async function loadBodies(files){
  const selected=Array.from(files);const invalid=selected.filter(f=>!isWordFile(f));
  const loaded=await Promise.all(selected.filter(isWordFile).map(readWordFile));
  bodyFiles.push(...loaded);message=invalid.length?`未添加不支持的文件：${invalid.map(f=>f.name).join('、')}，请选择Word正文（.doc或.docx）`:'';render();
}
async function replaceBody(row,file){
  if(!file||!rows.includes(row)||isBusy)return;
  const rowIndex=rows.indexOf(row);
  try{
    if(!isWordFile(file))throw Error('请选择Word正文文件（.doc或.docx）');
    if(!bodyMatchesTitle(file.name,row.data.name))throw Error('Word文件名须与小说名称一致（不含.doc/.docx后缀）');
    if(rows.some(r=>r!==row&&r.data.fileName===file.name))throw Error('该文件名已被其他小说使用，请选择其他文件或修改文件名');
    isBusy=true;busyText='正在读取替换正文，请稍候…';message='';render();
    const replacement=await readWordFile(file);
    if(replacement.error)throw Error(replacement.error);
    const oldName=row.data.fileName;
    const oldNameUsedElsewhere=rows.some(r=>r!==row&&r.data.fileName===oldName);
    bodyFiles=bodyFiles.filter(f=>f.name!==replacement.name&&(f.name!==oldName||oldNameUsedElsewhere));
    bodyFiles.push(replacement);
    row.data.fileName=replacement.name;
    message='';
    showToast('正文替换成功，已重新校验');
  }catch(e){message=`正文未替换：${e.message}`;}
  finally{
    isBusy=false;busyText='正在处理本批小说，请稍候…';render();
    root.querySelector(`[data-replace-row="${rowIndex}"]`)?.focus();
  }
}
function downloadBook(book,name){const bytes=XLSX.write(book,{bookType:'xlsx',type:'array'});const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function template(){
  const wb=XLSX.utils.book_new();const sheet=XLSX.utils.aoa_to_sheet([fields.map(f=>f.label)]);sheet['!cols']=fields.map(f=>({wch:f.key==='intro'?45:f.key==='fileName'?30:18}));XLSX.utils.book_append_sheet(wb,sheet,'小说信息');
  const help=[['字段','填写规则'],...fields.map(f=>[f.label,`${sampleRequirements[f.key]||(f.required?'必填':'选填')}${f.options?'；'+f.options.join('/'):''}${f.max?'；最多'+f.max+'字':''}${f.type==='date'?'；YYYY-MM-DD':''}${f.key==='cost'?'；签约时必填，单位元，最多两位小数':''}${f.key==='exclusive'?'；授权番茄为是时必填，默认否':''}${f.key==='fileName'?'；完整文件名，含.doc或.docx后缀；去掉后缀后须与小说名称一致':''}${f.default?'；默认'+f.default:''}`]),['草案范围','正文使用Word文档（.doc/.docx），每份对应一本小说；其他规则待确认。']];const instruction=XLSX.utils.aoa_to_sheet(help);instruction['!cols']=[{wch:18},{wch:90}];XLSX.utils.book_append_sheet(wb,instruction,'填写说明');downloadBook(wb,'批量上传小说模板.xlsx');
}
function storeSuccess(row){const d=row.data;const id=String(Math.max(...novels.map(n=>Number(n.id)))+1);novels.unshift({id,name:d.name,review:'未送审',author:d.author,editor:'—',owner:d.owner||'—',channel:d.channel,type:d.type,tags:d.tags||'—',clone:'原小说',checkpoint:'—',chapters:'—',words:bodyFiles.find(f=>f.name===d.fileName)?.content?.replace(/\s/g,'').length??'—',listing:d.listing,cost:d.listing==='签约'?Number(d.cost).toFixed(2):'',tomato:d.tomato==='是',exclusive:d.tomato==='是'&&d.exclusive==='是',copyright:d.copyright,file:'—',department:'—',status:'下架',createdAt:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',dateStyle:'short',timeStyle:'medium'}).format(new Date()),cover:'blue'});return id;}
async function submit(retry=false){
  if(isBusy)return;
  if(!retry&&(!rows.length||allErrors().some(e=>e.length))){message='仍有异常记录，请先修改后提交';render();return;}
  isBusy=true;message='';render();await new Promise(r=>setTimeout(r,700));
  if(retry){for(const r of results.filter(r=>r.status==='failure')){r.id=storeSuccess(r.row);r.status='success';r.reason='';}}
  else results=rows.map((row,i)=>demoFailure&&i===1?{row,status:'failure',reason:'文件接收失败，请重试',id:''}:{row,status:'success',reason:'',id:storeSuccess(row)});
  isBusy=false;renderRows();
  if(results.length&&results.every(r=>r.status==='success')){
    reset();hide();root.innerHTML='';showToast('新建小说成功');return;
  }
  step=3;render();
}
function loadDemo(mode){
  reset();demoFailure=mode==='failure';sheetName='小说信息_示例.xlsx';
  const samples=[['春日来信','鹿眠','女频'],['长街灯火','青山','男频'],['与你重逢','南栀','女频']];
  rows=samples.map(([name,author,channel],i)=>({line:i+2,data:{name,intro:'关于成长与选择的故事。',finish:'2026-11-18',author:mode==='invalid'&&i===1?'':author,owner:'梁洁敏',channel,type:'短篇',tags:'情感',listing:'签约',cost:String(1000+i*500),copyright:'自有版权',tomato:i===0?'是':'否',exclusive:'否',fileName:name+'.docx',protagonist:'',remark:''}}));
  bodyFiles=samples.map(([name])=>({name:name+'.docx',size:18436,content:'第一章 春天的来信\n那是一个平常的下午，一封信改变了她的人生。',error:''}));
  step=2;root.hidden=false;render();root.querySelector('button')?.focus();
}
root.addEventListener('click',async e=>{
  const b=e.target.closest('[data-action]');
  if(b){const a=b.dataset.action;if(b.disabled)return;
    if(a==='close'||a==='cancel')closeRequest();
    else if(a==='chooseExcel')root.querySelector('#excelInput').click();
    else if(a==='chooseBody')root.querySelector('#bodyInput').click();
    else if(a==='template')template();
    else if(a==='next'){step=2;message='';render();}
    else if(a==='back'){step=1;message='';render();}
    else if(a==='cancelEdit'){editIndex=null;render();}
    else if(a==='saveEdit'){const values=Object.fromEntries(new FormData(root.querySelector('#batchEditForm')));for(const k of Object.keys(values))values[k]=values[k].trim();if(values.listing!=='签约')values.cost='';if(values.tomato!=='是')values.exclusive='否';rows[editIndex].data=values;editIndex=null;render();}
    else if(a==='submit')await submit();
    else if(a==='retry')await submit(true);
    else if(a==='finish'){reset();hide();showToast('已返回小说管理列表');}
    else if(a==='continue'){askClose=false;render();}
    else if(a==='keep'){askClose=false;draftStep=step;step=0;root.hidden=true;renderNotes();lastFocus?.focus();}
    else if(a==='discard'){reset();hide();}
    else if(a==='failedExport'){const book=XLSX.utils.book_new();const table=[['Excel行号',...fields.map(f=>f.label),'失败原因'],...results.filter(r=>r.status==='failure').map(r=>[r.row.line,...fields.map(f=>r.row.data[f.key]),r.reason])];XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet(table),'失败明细');downloadBook(book,'小说上传失败明细.xlsx');}
    return;
  }
  const edit=e.target.closest('[data-edit-row]');if(edit){editIndex=Number(edit.dataset.editRow);render();return;}
  const replace=e.target.closest('[data-replace-row]');if(replace){if(isBusy)return;replacementRow=rows[Number(replace.dataset.replaceRow)];const input=root.querySelector('#replaceBodyInput');input.value='';input.click();return;}
  const remove=e.target.closest('[data-remove-row]');if(remove){rows.splice(Number(remove.dataset.removeRow),1);render();return;}
  const removeFile=e.target.closest('[data-remove-file]');if(removeFile){bodyFiles.splice(Number(removeFile.dataset.removeFile),1);render();return;}
  const zone=e.target.closest('[data-drop]');if(zone)root.querySelector(zone.dataset.drop==='excel'?'#excelInput':'#bodyInput').click();
});
root.addEventListener('change',async e=>{
  if(e.target.id==='replaceBodyInput'){const row=replacementRow;replacementRow=null;await replaceBody(row,e.target.files[0]);return;}
  if(e.target.id==='excelInput')await loadExcel(e.target.files[0]);
  if(e.target.id==='bodyInput')await loadBodies(e.target.files);
  if(editIndex!==null&&['listing','tomato'].includes(e.target.name)){
    const f=root.querySelector('#batchEditForm');
    if(e.target.name==='listing'){const wrap=f.querySelector('[data-field="cost"]');wrap.hidden=e.target.value!=='签约';wrap.classList.toggle('required',!wrap.hidden);if(wrap.hidden)f.elements.cost.value='';}
    else{const wrap=f.querySelector('[data-field="exclusive"]');wrap.hidden=e.target.value!=='是';wrap.classList.toggle('required',!wrap.hidden);f.elements.exclusive.value='否';}
  }
});
root.addEventListener('cancel',e=>{if(e.target.id==='replaceBodyInput')replacementRow=null;});
root.addEventListener('dragover',e=>{const z=e.target.closest('[data-drop]');if(z){e.preventDefault();z.classList.add('dragover');}});
root.addEventListener('dragleave',e=>e.target.closest('[data-drop]')?.classList.remove('dragover'));
root.addEventListener('drop',async e=>{const z=e.target.closest('[data-drop]');if(z){e.preventDefault();if(z.dataset.drop==='excel')await loadExcel(e.dataTransfer.files[0]);else await loadBodies(e.dataTransfer.files);}});
root.addEventListener('keydown',e=>{const z=e.target.closest('[data-drop]');if(z&&['Enter',' '].includes(e.key)){e.preventDefault();z.click();}});
document.querySelector('#batchButton').addEventListener('click',open);
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>loadDemo(b.dataset.demo)));
document.querySelector('#goNotes').addEventListener('click',()=>notes.scrollIntoView({behavior:'smooth',block:'start',inline:'start'}));
document.addEventListener('click',e=>{const p=e.target.closest('button[data-note]');if(!p)return;e.preventDefault();e.stopPropagation();const section=document.querySelector(`#note-${p.dataset.note}`);section?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});section?.classList.add('highlight');setTimeout(()=>section?.classList.remove('highlight'),1800);});
document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'){e.preventDefault();closeRequest();}if(e.key==='Tab'){const targets=[...root.querySelectorAll('button:not(:disabled),input,textarea,select,[tabindex="0"]')].filter(n=>n.getClientRects().length);const first=targets[0],last=targets.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
renderNotes();
if(new URLSearchParams(location.search).get('view')!=='list')open();
