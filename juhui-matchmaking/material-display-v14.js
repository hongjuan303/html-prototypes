import * as F from './fields.js?v=20261109-channels';
import {normalizeMaterialValues,isMaterialFieldVisible,formatMaterialValue} from './material-data-v14.js?v=20261109-channels';

const groupLabels={basic:'剧集资料',writer:'编剧资料',story:'剧情介绍',characters:'人物介绍',ip:'发行与IP信息',production:'制作信息',team:'主创资料',delivery:'成片与分轨资料',tools:'AIGC工具',commercial:'商务资料'};
const fallbackGroups={alternates:'basic',type:'basic',tags:'basic',provider:'basic',providerOther:'basic',writerName:'writer',writerGender:'writer',writerIntro:'writer',shortIntro:'story',outlineShort:'story',outlineLong:'story',recommendation:'story',heroine:'characters',heroineIntro:'characters',hero:'characters',heroIntro:'characters',releaseType:'ip',tomatoIp:'ip',ipSource:'ip',company:'production',dramaType:'production',episodes:'production',projectType:'production',directorName:'team',directorGender:'team',directorIntro:'team',producerName:'team',producerGender:'team',producerIntro:'team',averageDuration:'delivery',durationUnit:'delivery',firstDuration:'delivery',totalDuration:'delivery',previewLink:'delivery',copyrightLink:'delivery',otherLink:'delivery',tracksInfo:'delivery',aigc:'tools',aigcOther:'tools',paidEpisodes:'commercial',cost:'commercial'};
const hasValue=value=>Array.isArray(value)?value.some(x=>String(x??'').trim()):value!==undefined&&value!==null&&String(value).trim()!=='';
const displayValue=formatMaterialValue;

// Material URLs remain external links. Only http(s) is made clickable; all other
// text, including markup and unsupported URI schemes, stays escaped text.
export function linkedText(value,E){
 const text=displayValue(value),pattern=/https?:\/\/[^\s<>"'，。；）】]+/gi;
 let result='',at=0;
 for(const match of text.matchAll(pattern)){
  result+=E(text.slice(at,match.index));
  let valid=false;try{valid=['http:','https:'].includes(new URL(match[0]).protocol);}catch{}
  result+=valid?`<a href="${E(match[0])}" target="_blank" rel="noopener noreferrer">${E(match[0])}</a>`:E(match[0]);
  at=match.index+match[0].length;
 }
 return result+E(text.slice(at));
}

export function renderMaterialMetadata(values={},kind='makerMaterial',{E}={}){
 values=normalizeMaterialValues(kind,values);
 const fields=kind==='scriptMaterial'?F.scriptMetadataFields:F.producerMetadataFields;
 const groups=new Map();
 for(const field of fields){
  if(!hasValue(values[field.key])||!isMaterialFieldVisible(field,values))continue;
  const key=field.group||fallbackGroups[field.key]||'basic';
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(field);
 }
 if(!groups.size)return '';
 return `<div class="material-readout">${[...groups].map(([key,items])=>`<section class="material-readout-group"><h4>${E(groupLabels[key]||'补充资料')}</h4><dl>${items.map(field=>{
  const wide=field.type==='textarea'||/Link|tracksInfo|alternates/.test(field.key);
  const content=/Link|tracksInfo/.test(field.key)?linkedText(values[field.key],E):E(displayValue(values[field.key]));
  return `<div class="${wide?'material-value-wide':''}"><dt>${E(field.label)}</dt><dd>${content}</dd></div>`;
 }).join('')}</dl></section>`).join('')}</div>`;
}

export function materialFileLabel(file,kind='makerMaterial'){
 if(kind!=='makerMaterial')return '剧本物料';
 return F.producerFileFields.find(([key])=>key===file.slot)?.[1]||'其他附件';
}

export function groupedMaterialFiles(files=[],{E,fileList},kind='makerMaterial'){
 if(kind!=='makerMaterial'||!files.length)return fileList(files);
 const known=new Set(F.producerFileFields.map(([key])=>key));
 const groups=F.producerFileFields.map(([key,label])=>({label,files:files.filter(file=>file.slot===key)}));
 groups.push({label:'其他附件',files:files.filter(file=>!known.has(file.slot))});
 return `<div class="material-file-groups">${groups.filter(group=>group.files.length).map(group=>`<section class="material-file-group"><h4>${E(group.label)}<span>${group.files.length} 个文件</span></h4>${fileList(group.files)}</section>`).join('')}</div>`;
}
