import * as A from './access-v3.js?v=20261109-overview-merge';
import {marker} from './permission-notes-v10.js?v=20261109-overview-merge';

export const businesses={matching:'撮合业务',distribution:'代发行业务',shared:'共用管理'};
const channelRole=r=>['channelLead','channelOps'].includes(r);
const aliasRole=r=>['business','prodBusiness'].includes(r);
const roleName=(b,r)=>b==='shared'?'管理员':A.label(r,b);
const roleOptions=b=>b==='shared'?[['admin','管理员']]:Object.entries(A.definitions[b]||{}).map(([k,v])=>[k,v[0]]);

export function permissionsPage(s,h){
 const {E,heading,button,link}=h,ui=s.ui;
 const all=A.permissionRecords(s),business=ui.permissionBusiness||'',role=ui.permissionRole||'',user=ui.permissionUser||'';
 const filtered=all.filter(g=>(!business||g.business===business)&&(!role||g.business+':'+g.role===role)&&(!user||g.userId===user));
 const size=Number(ui.permissionSize)||10,pages=Math.max(1,Math.ceil(filtered.length/size)),page=Math.min(Math.max(1,Number(ui.permissionPage)||1),pages);ui.permissionPage=page;
 const select=(label,name,options,value)=>`<label class="field"><span>${label}</span><select name="${name}"><option value="">全部</option>${options.map(([k,l])=>`<option value="${E(k)}" ${k===value?'selected':''}>${E(l)}</option>`).join('')}</select></label>`;
 const roles=Object.keys(businesses).filter(b=>!business||business===b).flatMap(b=>roleOptions(b).map(([k,l])=>[b+':'+k,(business?'':businesses[b]+' · ')+l]));
 return heading('用户权限分配','按业务分配角色与渠道，同一用户可拥有多条授权。')+
 `<section class="panel permission-filter-panel"><div class="panel-body"><form id="permission-filters" class="permission-filters"><div class="permission-filter-title">筛选条件 ${marker(1)}</div>${select('用户','permissionUser',s.users.map(u=>[u.id,u.name+' · '+u.account]),user)}${select('业务类型','permissionBusiness',Object.entries(businesses),business)}${select('角色','permissionRole',roles,role)}<div class="permission-query"><button class="btn primary">搜索</button>${button('重置','permission-clear')}</div></form></div></section>`+
 `<section class="panel"><header><h3>权限列表 ${marker(3)} <small>共 ${filtered.length} 条授权</small></h3><div class="actions">${marker(2)}${button('＋ 新增权限','permission-new','','primary')}</div></header><div class="panel-body"><table class="permission-record-table"><thead><tr><th>序号</th><th>用户</th><th>业务类型</th><th>关联角色</th><th>关联渠道</th><th>化名</th><th>创建时间</th><th>操作 ${marker(4)}</th></tr></thead><tbody>${filtered.slice((page-1)*size,page*size).map((g,i)=>{const u=s.users.find(u=>u.id===g.userId);return `<tr><td>${(page-1)*size+i+1}</td><td><strong>${E(u?.name||g.userId)}</strong><small>${E(u?.account||'')}</small></td><td><span class="permission-business ${g.business}">${businesses[g.business]}</span></td><td>${E(roleName(g.business,g.role))}</td><td>${E(g.channels?.join('、')||'—')}</td><td>${E(g.alias||'—')}</td><td class="permission-date">${E(g.createdAt?new Date(g.createdAt).toLocaleString('zh-CN',{hour12:false}):'—')}</td><td class="permission-row-actions">${link('编辑','permission-edit',g.id)}${link('删除','permission-delete',g.id)}</td></tr>`;}).join('')||'<tr><td colspan="8" class="permission-empty">暂无符合条件的授权记录</td></tr>'}</tbody></table><div class="permission-pagination"><span>共 ${filtered.length} 条</span><label>每页 <select aria-label="每页授权条数" name="permissionSize">${[10,20,50,100].map(n=>`<option ${n===size?'selected':''}>${n}</option>`).join('')}</select> 条</label>${button('上一页','permission-page',String(page-1),'',page<=1?'disabled':'')}<span>${page} / ${pages}</span>${button('下一页','permission-page',String(page+1),'',page>=pages?'disabled':'')}</div></div></section>`;
}

export function permissionModal(s,d,h){
 if(!['permission-new','permission-edit','permission-delete'].includes(d.type))return null;
 const {E,field}=h,records=A.permissionRecords(s),record=records.find(g=>g.id===d.id),editing=d.type==='permission-edit';
 if(d.type==='permission-delete'){
  const u=s.users.find(u=>u.id===record?.userId);
  return {title:'删除用户权限',submit:'确认删除',body:`<h3>确认删除这条授权？ ${marker(1)}</h3><dl class="permission-delete-summary"><dt>用户</dt><dd>${E(u?.name)} · ${E(u?.account)}</dd><dt>业务类型</dt><dd>${E(businesses[record?.business])}</dd><dt>关联角色</dt><dd>${E(roleName(record?.business,record?.role))}</dd><dt>关联渠道</dt><dd>${E(record?.channels?.join('、')||'—')}</dd></dl><p class="permission-delete-hint">${marker(2)} 删除后该条授权立即失效，用户账号及其他授权保留。</p>`};
 }
 d.permissionDraft??={userId:record?.userId||'',business:record?.business||'matching',roles:record?[record.role]:[],channels:[...(record?.channels||[])],alias:record?.alias||''};
 const v=d.permissionDraft,b=v.business,grants=records.filter(g=>g.userId===v.userId&&g.id!==d.id),existing=grants.filter(g=>g.business===b).map(g=>g.role),isAdmin=grants.some(g=>g.business==='shared');
 const userField=field('用户','userId',v.userId,{required:true,select:s.users.map(u=>[u.id,u.name+' · '+u.account])});
 const businessField=editing?`<label class="field"><span>业务类型</span><input value="${E(businesses[b])}" readonly><small>业务类型固定；其他业务请新增授权。</small></label>`:field('业务类型','business',b,{required:true,placeholder:false,select:Object.entries(businesses)});
 const existingMarkup=grants.length?grants.map(g=>`<span>${E(businesses[g.business])} · ${E(roleName(g.business,g.role))}${g.channels?.length?'（'+E(g.channels.join('、'))+'）':''}</span>`).join(''):'<span class="muted">暂无其他授权</span>';
 const unavailable=r=>existing.includes(r)||(b==='shared'?grants.length>0:isAdmin)||(b==='distribution'&&['groupA','groupB','groupC'].includes(r)&&grants.some(g=>g.business===b&&['groupA','groupB','groupC'].includes(g.role)&&g.role!==r));
 const roles=editing?`<label class="field"><span><i>*</i> 关联角色</span><select name="role" required><option value="">请选择</option>${roleOptions(b).map(([r,l])=>`<option value="${r}" ${v.roles.includes(r)?'selected':''} ${unavailable(r)?'disabled':''}>${E(l)}${existing.includes(r)?'（已授权）':''}</option>`).join('')}</select></label>`:
 `<div class="permission-role-options">${roleOptions(b).map(([r,l])=>`<label class="${unavailable(r)?'unavailable':''}"><input type="checkbox" name="roles" value="${r}" ${v.roles.includes(r)?'checked':''} ${!v.userId||unavailable(r)?'disabled':''}><span>${E(l)}${existing.includes(r)?'<small>已授权</small>':''}</span></label>`).join('')}</div>`;
 const needsChannel=v.roles.some(channelRole),needsAlias=v.roles.some(aliasRole);
 return {title:editing?'编辑用户权限':'新增用户权限',submit:editing?'保存权限':'确认新增',body:`<h3>基本配置 ${marker(1)}</h3><div class="form-grid">${userField}${businessField}</div><div class="permission-existing"><strong>该用户已有授权${editing?'（不含当前记录）':''}</strong><div>${v.userId?existingMarkup:'<span class="muted">选择用户后展示</span>'}</div></div><h3>角色配置 ${marker(2)}</h3>${!editing?'<p class="subtle">可选择多个角色，每个角色分别生成一条授权记录。</p>':''}${roles}${isAdmin&&b!=='shared'?'<p class="permission-warning">该用户已是管理员，不能同时分配业务角色。</p>':''}${b==='shared'?'<p class="subtle">管理员共用两条业务。已有业务角色的用户需先移除业务授权。</p>':''}${needsChannel||needsAlias?`<h3>关联信息 ${marker(3)}</h3>${needsChannel?`<div class="field"><span><i>*</i> 关联渠道</span><div class="check-grid">${A.channels.map(c=>`<label><input type="checkbox" name="channels" value="${E(c)}" ${v.channels.includes(c)?'checked':''}>${E(c)}</label>`).join('')}</div><small>仅作用于本次渠道角色授权；新增多个渠道角色时使用相同渠道。</small></div>`:''}${needsAlias?field('化名','alias',v.alias,{max:20,help:'选填，最多20个字符。'}):''}`:''}<p class="permission-save-note">${marker(needsChannel||needsAlias?4:3)} ${editing?'仅更新当前授权，其他授权保持不变。':'新增后立即生效，已有授权保留。'}</p>`};
}

export function permissionValues(form,d){
 const f=new FormData(form),roles=d.type==='permission-edit'?[f.get('role')].filter(Boolean):f.getAll('roles');
 return {userId:f.get('userId'),business:d.permissionDraft.business,roles,role:roles[0],channels:roles.some(channelRole)?f.getAll('channels'):[],alias:roles.some(aliasRole)?String(f.get('alias')||''):''};
}

export function updatePermissionDraft(form,d,changed){
 const v=permissionValues(form,d);
 if(changed==='userId'||changed==='business'){
  v.business=changed==='business'?form.elements.business.value:d.permissionDraft.business;
  if(d.type==='permission-new'){v.roles=[];v.channels=[];v.alias='';}
 }
 d.permissionDraft=v;
}
