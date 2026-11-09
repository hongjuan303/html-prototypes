// Requirements for the shared authorization page and its record-level dialogs.
export const marker=n=>`<button type="button" class="permission-marker" data-permission-note="${Number(n)}" aria-label="查看说明${Number(n)}">${Number(n)}</button>`;

const item=(name,text)=>`<li><b>${name}：</b>${text}</li>`;
const list=items=>`<ul>${items.join('')}</ul>`;
const section=(n,title,items)=>`<section id="permission-note-${n}" class="permission-note-section" tabindex="-1"><h3><span class="permission-note-number">${n}</span>${title}</h3>${list(items)}</section>`;
const intro=(page,background,need)=>`<h2>#页面说明</h2>${list([`<li>本页是共用系统设置 · 用户权限分配${page}。</li>`])}<h2>#原型说明</h2>${list([item('背景',background),item('需求',need)])}`;

function pageNotes(){
 return intro('页','撮合与代发行使用同一人员体系，业务岗位和数据范围需要分别授权。','沿用单条用户角色授权的新增、编辑、删除方式，增加业务类型；同一用户可以分别获得两条业务的岗位权限。')+
 section(1,'筛选项',[
  item('用户','从平台已有用户中选择，按该用户筛选授权记录。'),
  item('业务类型','可选撮合业务、代发行业务、共用管理；不选时展示全部。共用管理仅包含管理员。'),
  item('角色','选项随业务类型联动；不同业务的同名角色分别标明业务。切换业务类型后清空不适用的角色条件。')
 ])+
 section(2,'操作项 · 新增权限',[
  item('新增权限','从列表工具栏打开新增弹窗，选择已有用户、业务类型和角色。一次可以新增多个角色，每个角色分别生成一条授权记录。'),
  item('授权边界','仅管理员可维护权限；新增业务角色后，该用户按对应岗位及项目、任务、渠道关系取得可见范围。')
 ])+
 section(3,'列表项',[
  item('序号','按当前筛选结果及分页连续显示；列表一行代表一条授权，数量不是用户人数。'),
  item('用户','展示该条授权对应的用户姓名及账号；同一用户可以出现多行。'),
  item('业务类型','标明撮合业务、代发行业务或共用管理。'),
  item('关联角色','展示本条记录的一个角色；同名岗位在不同业务中独立授权。'),
  item('关联渠道','只展示本条角色授权的渠道；不同业务、不同角色之间不合并渠道权限。非渠道角色显示“—”。'),
  item('化名','展示本条商务授权填写的化名；未填写或非商务角色显示“—”。'),
  item('创建时间','显示该条授权的创建时间；历史记录无时间时显示“—”，编辑不改变创建时间。'),
  item('分页','按授权记录分页，每页可选10、20、50、100条；筛选后回到第一页，新增、编辑或删除后刷新当前筛选结果。')
 ])+
 section(4,'操作项 · 编辑与删除',[
  item('编辑','只编辑当前授权记录，角色单选。业务类型固定；跨业务授权需另行新增，原业务权限按需单独删除。'),
  item('删除','二次确认后删除当前授权，保留用户账号及其他角色、其他业务授权。至少保留一名管理员。'),
  item('生效','保存成功后更新对应用户的菜单、可见数据和操作权限；当前用户授权变化时同步刷新自身入口。校验失败时保留输入并提示原因。')
 ])+
 `<section class="permission-note-section"><h3>其他注意说明</h3>${list([
  item('存量授权','正式系统原有普通业务授权归入代发行，不自动复制为撮合授权；已有明确业务归属的授权保留原归属。'),
  item('共用管理员','只维护一份全局管理员授权，与两条业务的普通角色互斥。本原型按已确认的测试约定开放管理员全部操作，业务状态及必填校验仍生效。')
 ])}<p class="permission-notes-local">本次为本地原型评审，操作不修改正式系统账号。</p></section>`;
}

function formNotes(d){
 const edit=d.type==='permission-edit',v=d.permissionDraft||{},roles=v.roles||[],channel=roles.some(r=>['channelLead','channelOps'].includes(r)),alias=roles.some(r=>['business','prodBusiness'].includes(r));
 let html=intro(edit?' · 编辑用户权限弹窗':' · 新增用户权限弹窗','同一人可在不同业务承担不同岗位，需要明确本次变更的授权范围。',edit?'只更新所选的一条授权，保留该用户其余授权。':'为已有用户新增所选业务的角色，不覆盖已有授权。');
 html+=section(1,'配置项 · 基本配置',[
  item('用户','必填，从平台已有用户中单选；切换用户后同步展示其已有授权，并重新校验可选角色。此处不创建账号。'),
  item('业务类型',edit?'展示当前记录的业务类型，不可修改。需要其他业务权限时另行新增授权。':'必填，单选撮合业务、代发行业务或共用管理；角色选项随之切换，不继承另一业务的角色、渠道。')
 ]);
 html+=section(2,'配置项 · 角色配置',[
  item('已有授权','显示所选用户已关联的角色及所属业务，避免混淆两条业务中的同名岗位。'),
  item('关联角色',edit?'必填、单选。可以更换本条记录的角色；不能与该用户其他授权形成重复。':'必填、可多选，至少选择一个角色。该用户在本业务已拥有的角色不可重复新增。'),
  item('共用管理','角色仅为管理员；管理员与撮合、代发行普通业务角色互斥。'),
  item('角色互斥','代发行的审核组评估、红果评估、运营评估三者互斥；校验同时覆盖本次选择和该用户已有授权。')
 ]);
 if(channel||alias){
  const entries=[];
  if(channel)entries.push(item('关联渠道','选择渠道负责人或渠道运营时展示且必填，可多选。新增同时选择两个渠道角色时，本次渠道分别写入各自授权；保存后可逐条编辑，互不扩大权限。'));
  if(alias)entries.push(item('化名','选择商务、剧本商务或承制商务时展示；选填，最多20字。跟随本条商务授权保存，不改写其他业务的化名。'));
  html+=section(3,'配置项 · 关联信息',entries);
 }
 html+=section(channel||alias?4:3,'操作项 · 保存与取消',[
  item(edit?'保存权限':'确认新增',edit?'校验用户、角色及条件字段后，只更新当前记录；成功后关闭弹窗，刷新列表并提示保存成功。':'校验用户、业务类型、角色及条件字段后，一次保存本次全部选择；成功后关闭弹窗，刷新列表并提示新增成功。'),
  item('防重复','同一用户、同一业务类型、同一角色只能有一条授权；已有其他业务的同名角色不构成本业务重复。'),
  item('失败处理','缺少必填项、角色互斥或重复、渠道未选时，提示具体原因并保留输入；本次提交不部分生效。修改后的授权中至少保留一名管理员。'),
  item('取消／关闭','关闭弹窗，放弃本次未保存修改，保留原授权。')
 ]);
 return html;
}

function deleteNotes(){
 return intro(' · 删除权限弹窗','一个用户可以拥有多条授权，撤销时需明确对应业务与角色。','只撤销当前选中的授权记录，保留账号及其余授权。')+
 section(1,'配置项 · 待删除授权',[
  item('用户','显示本条授权对应的用户姓名及账号。'),
  item('业务类型','显示当前授权所属业务，或共用管理。'),
  item('关联角色','显示本次将删除的角色。'),
  item('关联渠道','显示当前记录的渠道，删除时随该授权一并撤销。')
 ])+
 section(2,'操作项 · 确认与取消',[
  item('确认删除','仅管理员可操作。确认后删除本条授权并提示成功；该用户其他业务、其他角色的授权不变，用户账号仍保留。'),
  item('管理员保护','系统至少保留一名管理员；删除最后一名管理员时提示原因，不执行删除。'),
  item('权限生效','撤销后刷新该用户对应的菜单、数据与操作权限；已完成的业务记录保留。'),
  item('取消／关闭','关闭确认弹窗，不改变授权。')
 ]);
}

export function permissionNotes(s,d=null){
 const type=d?.type,content=type==='permission-delete'?deleteNotes():['permission-new','permission-edit'].includes(type)?formNotes(d):pageNotes();
 return `<aside class="permission-notes" aria-label="需求说明"><div class="permission-notes-meta">用户权限分配 <span>2026.11.08 更新</span></div>${content}</aside>`;
}
