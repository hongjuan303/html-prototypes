import * as A from './access-v3.js?v=20261109-overview-merge';

const identityNames={script:'剧本方',maker:'承制方'};
const listFields=['view','listTab','keyword','stage','source','page','dashboardMetric','dashboardSource','dashboardKeyword','dashboardPage','overviewMetric'];
const defaults={overviewMetric:'all',overviewLibraryPhase:'',overviewSelection:false,overviewReturn:null,listTab:'',keyword:'',stage:'',source:'',page:1,dashboardMetric:'ongoing',dashboardSource:'',dashboardKeyword:'',dashboardPage:1};
export const supplierIdentities=s=>['script','maker'].filter(r=>s.suppliers.find(x=>x.id===s.ui.supplier)?.roles?.includes(r));
export const supplierIdentityName=s=>s.ui.business==='distribution'?'版权方':identityNames[s.ui.identity]||'未配置身份';
const contextKey=s=>[s.ui.supplier,s.ui.business,s.ui.business==='matching'?s.ui.identity:'copyright'].join(':');

export function normalizeSupplierContext(s){
 if(s.ui.system!=='supplier')return;
 const available=A.available(s),u=s.ui;
 if(!available.includes(u.business))u.business=available[0]||'matching';
 if(u.business==='matching'&&!supplierIdentities(s).includes(u.identity)){
  const previous=u.supplierContexts?.[u.supplier]?.identity;
  u.identity=supplierIdentities(s).includes(previous)?previous:supplierIdentities(s)[0]||'';
  Object.assign(u,defaults,{id:null,tab:'',batchIds:[]});
 }
}

export function rememberSupplierContext(s){
 const u=s.ui;if(u.system!=='supplier')return;
 u.supplierContexts??={};u.supplierViews??={};
 const previous=u.supplierContexts[u.supplier]||{};
 u.supplierContexts[u.supplier]={business:u.business,identity:u.business==='matching'?u.identity:previous.identity||u.identity};
 if(A.menus(s).includes(u.view))u.supplierViews[contextKey(s)]=Object.fromEntries(listFields.map(k=>[k,u[k]]));
}

// Entering from the platform must never save that platform page as supplier navigation.
export function enterSupplierContext(s){
 const u=s.ui;if(u.system!=='supplier')return false;
 const previous=u.supplierContexts?.[u.supplier];
 u.business=previous?.business||A.available(s)[0]||'matching';
 u.identity=previous?.identity||(supplierIdentities(s).includes(u.identity)?u.identity:supplierIdentities(s)[0]||'');
 normalizeSupplierContext(s);
 const menus=A.menus(s),saved=u.supplierViews?.[contextKey(s)];
 Object.assign(u,defaults,{view:menus[0]||'no-access'});
 if(saved?.view==='dashboard'&&u.business==='matching'){u.view='content';u.overviewMetric=u.identity==='maker'&&saved.dashboardMetric==='awaiting'?'developing':['developing','unscheduled','scheduled','online','ongoing','ended',...(u.identity==='script'?['unassigned','awaiting']:[])].includes(saved.dashboardMetric)?saved.dashboardMetric:'all';u.keyword=saved.dashboardKeyword||'';}else if(saved&&menus.includes(saved.view)){for(const key of listFields)if(saved[key]!==undefined)u[key]=saved[key];if(saved.overviewMetric===undefined&&saved.view==='content')u.overviewMetric=({production:'developing',online:'online',ended:'ended'})[saved.listTab]||'all';}
 Object.assign(u,{id:null,tab:'',batchIds:[],taskOnly:false});return true;
}

// List context is preserved; detail IDs, dialogs and pending actions never cross identities.
export function switchSupplierContext(s,changes={}){
 const u=s.ui;if(u.system!=='supplier')return false;
 if(changes.business&&!A.available(s).includes(changes.business))return false;
 if(changes.identity&&(u.business!=='matching'||!supplierIdentities(s).includes(changes.identity)))return false;
 if(changes.supplier&&!s.suppliers.some(x=>x.id===changes.supplier))return false;
 if(Object.keys(changes).length&&Object.entries(changes).every(([k,v])=>u[k]===v))return false;
 rememberSupplierContext(s);Object.assign(u,changes);
 if(changes.supplier){
  const previous=u.supplierContexts?.[u.supplier];
  u.business=previous?.business||A.available(s)[0]||'matching';
  u.identity=previous?.identity||supplierIdentities(s)[0]||'';
 }else if(changes.business==='matching')u.identity=u.supplierContexts?.[u.supplier]?.identity||u.identity;
 normalizeSupplierContext(s);
 const saved=u.supplierViews?.[contextKey(s)],menus=A.menus(s);
 Object.assign(u,defaults,{view:menus[0]||'no-access'});
 if(saved?.view==='dashboard'&&u.business==='matching'){u.view='content';u.overviewMetric=u.identity==='maker'&&saved.dashboardMetric==='awaiting'?'developing':['developing','unscheduled','scheduled','online','ongoing','ended',...(u.identity==='script'?['unassigned','awaiting']:[])].includes(saved.dashboardMetric)?saved.dashboardMetric:'all';u.keyword=saved.dashboardKeyword||'';}else if(saved&&menus.includes(saved.view)){for(const key of listFields)if(saved[key]!==undefined)u[key]=saved[key];if(saved.overviewMetric===undefined&&saved.view==='content')u.overviewMetric=({production:'developing',online:'online',ended:'ended'})[saved.listTab]||'all';}
 Object.assign(u,{id:null,tab:'',batchIds:[],taskOnly:false});return true;
}

export function supplierBusinessNavigation(s){
 const available=A.available(s);
 return `<nav class="supplier-business-nav" aria-label="供应商业务切换">${available.map(k=>`<button type="button" data-business="${k}" ${s.ui.business===k?'aria-current="page"':''} class="${s.ui.business===k?'active':''}">${A.lines[k]}</button>`).join('')}</nav>`;
}

export function supplierIdentityNavigation(s){
 const roles=supplierIdentities(s),matching=s.ui.business==='matching';
 const description=matching?(s.ui.identity==='script'?'提交剧本 · 跟进审核':s.ui.identity==='maker'?'挑选剧本 · 制作交付':'请联系对接商务'):'提交成片 · 跟进发行';
 return `<section class="supplier-identity-panel" aria-label="当前供应商身份"><div class="supplier-identity-label">当前身份</div>${matching&&roles.length>1?`<div class="supplier-identity-options" role="group" aria-label="撮合业务身份">${roles.map(r=>`<button type="button" data-identity="${r}" aria-pressed="${s.ui.identity===r}" class="${s.ui.identity===r?'active':''}">${identityNames[r]}</button>`).join('')}</div>`:`<div class="supplier-identity-static">${supplierIdentityName(s)}</div>`}<p>${description}</p></section>`;
}
