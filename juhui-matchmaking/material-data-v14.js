import {scriptMetadataFields,producerMetadataFields} from './fields.js?v=20261109-overview-merge';

const has=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key);
const text=value=>value==null?'':String(value).trim();
const unique=values=>[...new Set(values.map(text).filter(Boolean))];
const otherLabel='若无对应选项,可自定义输入';
const submittedValue=(p,kind,key)=>['none','draft'].includes(p[kind]?.status)?'':text(p[kind]?.values?.[key]);

export function materialReleaseType(p){
 if(has(p,'materialReleaseType'))return text(p.materialReleaseType);
 return submittedValue(p,'scriptMaterial','releaseType')||submittedValue(p,'makerMaterial','releaseType');
}
export function materialReleaseReadOnly(p,kind){return kind==='makerMaterial'&&!!materialReleaseType(p);}

export function normalizeMaterialValues(kind,values={}){
 const next=structuredClone(values||{});
 for(const key of Object.keys(next))if(typeof next[key]==='string')next[key]=next[key].trim();
 if(kind==='scriptMaterial'&&has(next,'alternates'))next.alternates=unique(Array.isArray(next.alternates)?next.alternates:String(next.alternates||'').split(/\r?\n/));
 if(kind==='makerMaterial'&&has(next,'aigc')){
  const raw=Array.isArray(next.aigc)?next.aigc:[next.aigc];
  next.aigc=unique(raw.flatMap(x=>text(x)===otherLabel||text(x)==='若无对应选项，可自定义输入'?['其他']:text(x).split(/[,，、\n]/))).map(x=>x===otherLabel?'其他':x);
 }
 return next;
}

export function materialValues(s,p,kind,editValues,options={}){
 const saved=editValues??p[kind]?.draft?.values??p[kind]?.values??{};
 const supplier=id=>s.suppliers.find(x=>x.id===id)?.name||'';
 const defaults=kind==='scriptMaterial'?{
  alternates:structuredClone(p.alternates||[]),type:p.category||'',tags:structuredClone(p.tags||[]),provider:supplier(p.supplier)
 }:{company:supplier(p.selected),episodes:p.episodes??''};
 const values={...defaults,...structuredClone(saved)};
 const shared=materialReleaseType(p);
 const draft=options.draft??!!p[kind]?.draft;
 // A supplier's unfinished draft cannot replace a value already shared by the project.
 if(materialReleaseReadOnly(p,kind)||kind==='makerMaterial'&&!options.submit&&!draft&&has(p,'materialReleaseType'))values.releaseType=shared;
 else if(!has(saved,'releaseType'))values.releaseType=shared;
 return normalizeMaterialValues(kind,values);
}

export function isMaterialFieldVisible(field,values={}){
 if(!field.when)return true;
 const actual=values[field.when.key];
 return Array.isArray(actual)?actual.includes(field.when.value):actual===field.when.value;
}
export function formatMaterialValue(value){return Array.isArray(value)?value.map(text).filter(Boolean).join('、'):value==null?'':String(value);}

export function validateMaterialValues(kind,values,{draft=false,internal=false}={}){
 const next=normalizeMaterialValues(kind,values);
 if(draft||internal&&kind==='scriptMaterial')return next;
 const fail=(field,message)=>{const error=new Error(message);error.field=field.key;throw error;};
 const fields=kind==='scriptMaterial'?scriptMetadataFields:producerMetadataFields;
 for(const field of fields){
  if(!isMaterialFieldVisible(field,next))continue;
  const value=next[field.key],str=formatMaterialValue(value).trim();
  if(!str){if(field.required)fail(field,'请填写'+field.label);continue;}
  if(field.type==='number'){
   const numeric=Number(value);
   if(!Number.isFinite(numeric))fail(field,'请填写有效的'+field.label);
   if(field.min!==undefined&&numeric<field.min)fail(field,field.label+'不能小于'+field.min);
   if(field.step===1&&!Number.isInteger(numeric))fail(field,field.label+'需填写正整数');
  }else{
   const count=Array.from(str).length;
   if(field.min&&count<field.min)fail(field,field.label+'至少填写'+field.min+'字');
   if(field.max&&count>field.max)fail(field,field.label+'不能超过'+field.max+'字');
  }
 }
 return next;
}
