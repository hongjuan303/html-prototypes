/* Dedicated account list and QR authorization preview. No real auth requests. */
window.KSAccountManager=(()=>{
  const storeKey='kuaishou-native-series-accounts-v1',A=KSAccountModel;
  let ui,filters={q:'',operator:'',status:''},page=1,session=null,timer;
  const $=s=>document.querySelector(s);
  const employees=[{id:'staff-demo-01',name:'林晓'},{id:'staff-demo-02',name:'陈嘉'},{id:'staff-demo-03',name:'周宁'}];
  const currentEmployee=employees[0].id;
  const employee=id=>employees.find(e=>e.id===id)?.name||'—';
  const now=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
  function init(context){
    ui=context;
    let saved;try{saved=JSON.parse(localStorage.getItem(storeKey)||'null')}catch{}
    if(Array.isArray(saved))KSData.accounts.splice(0,KSData.accounts.length,...saved.map(a=>A.normalize(a,employees)));
    else KSData.accounts.forEach((a,i)=>Object.assign(a,{operatorId:employees[i%employees.length].id,updatedAt:'2026-10-20 09:30:00'}));
  }
  function persist(){try{localStorage.setItem(storeKey,JSON.stringify(KSData.accounts));return true}catch{ui.toast('本地保存失败，请保持页面打开后重试');return false}}
  const opts=(value,placeholder)=>`<option value="">${placeholder}</option>`+employees.map(e=>`<option value="${e.id}" ${e.id===value?'selected':''}>${e.name}（示例员工）</option>`).join('');
  function rows(){const q=filters.q.toLowerCase();return KSData.accounts.filter(a=>(!q||`${a.name} ${a.uid}`.toLowerCase().includes(q))&&(!filters.operator||a.operatorId===filters.operator)&&(!filters.status||(a.valid?'normal':'expired')===filters.status));}
  function render(){
    const all=rows(),pages=Math.max(1,Math.ceil(all.length/10));page=Math.min(page,pages);
    const items=all.slice((page-1)*10,page*10),{esc,btn,link,dot}=ui;
    return `<div class="page-heading"><h1>快手号管理</h1></div>
    <section class="panel account-management">
      <div class="filter-grid account-management-filters">
        <label><span>快手号</span><input id="accountSearch" placeholder="请输入快手号名称或ID" value="${esc(filters.q)}"></label>
        <label><span>运营人员</span><select id="accountOperatorFilter">${opts(filters.operator,'全部运营人员')}</select></label>
        <label><span>授权状态</span><select id="accountStatusFilter"><option value="">全部</option><option value="normal" ${filters.status==='normal'?'selected':''}>正常</option><option value="expired" ${filters.status==='expired'?'selected':''}>失效</option></select></label>
        <div class="filter-actions">${btn('搜索','account-query',true)}${btn('重置','account-reset')}</div>
      </div>
      <div class="toolbar"><strong>共 ${all.length} 个快手号</strong><div class="actions">${btn('新增快手号','account-add',true)}</div></div>
      <div class="table-wrap"><table class="data-table account-management-table"><colgroup><col><col style="width:175px"><col style="width:130px"><col style="width:100px"><col style="width:190px"><col style="width:190px"></colgroup><thead><tr><th>快手号名称</th><th>快手号ID</th><th>运营人员</th><th>授权状态</th><th>最近更新时间</th><th>操作</th></tr></thead><tbody>${items.length?items.map(a=>`<tr><td>${esc(a.name)}</td><td>${esc(a.uid)}</td><td>${esc(employee(a.operatorId))}</td><td>${dot(a.valid?'正常':'失效',a.valid?'green':'red')}</td><td>${esc(a.updatedAt||'—')}</td><td><div class="small-actions">${link('重新授权','account-reauth',`data-id="${esc(a.id)}"`)}${link('编辑','account-edit',`data-id="${esc(a.id)}"`)}</div></td></tr>`).join(''):'<tr><td colspan="6"><div class="account-empty">暂无符合条件的快手号</div></td></tr>'}</tbody></table></div>
      <div class="pagination"><span class="total">共 ${all.length} 条</span><span>10条 / 页</span>${btn('上一页','account-prev',false,page===1?'disabled':'')}<span>${page} / ${pages}</span>${btn('下一页','account-next',false,page===pages?'disabled':'')}</div>
    </section>`;
  }
  function edit(id){
    const row=KSData.accounts.find(a=>a.id===id);if(!row)return;
    ui.modal('编辑快手号',`<div class="account-edit-form"><div class="field"><label for="accountEditName">快手号名称</label><input id="accountEditName" value="${ui.esc(row.name)}" readonly></div><div class="field"><label for="accountEditId">快手号ID</label><input id="accountEditId" value="${ui.esc(row.uid)}" readonly></div><div class="field"><label class="require" for="accountEditOperator">运营人员</label><select id="accountEditOperator">${opts(row.operatorId,'请选择运营人员')}</select><div id="accountEditError" class="field-error" role="alert"></div></div></div>`,ui.btn('取消','close')+ui.btn('保存','account-save',true,`data-id="${ui.esc(id)}"`));
    $('#accountEditOperator').focus();
  }
  function qr(){
    const size=29,cells=[];
    const finder=(x,y)=>{for(let j=0;j<7;j++)for(let i=0;i<7;i++)if(i===0||j===0||i===6||j===6||(i>=2&&i<=4&&j>=2&&j<=4))cells.push(`<rect x="${x+i}" y="${y+j}" width="1" height="1"/>`);};
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      if((x<8&&y<8)||(x>20&&y<8)||(x<8&&y>20)||(x>8&&x<20&&y>10&&y<18))continue;
      if((x*x+3*y*y+7*x*y+x+session.generation)%11<5)cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
    finder(0,0);finder(22,0);finder(0,22);
    return `<svg viewBox="-2 -2 33 33" role="img" aria-label="授权二维码示意，不可用于真实授权" shape-rendering="crispEdges"><rect x="-2" y="-2" width="33" height="33" fill="white"/><g fill="#303030">${cells.join('')}</g><rect x="8" y="11" width="13" height="7" fill="white"/><text x="14.5" y="15.8" text-anchor="middle" font-size="3" fill="#777" shape-rendering="auto">示例码</text></svg>`;
  }
  function authBody(){
    const row=KSData.accounts.find(a=>a.id===session.targetId),state=session.status;
    const over=state!=='waiting';
    return `<div class="account-auth-content">
      <p class="account-auth-title">快手号授权</p>${row?`<p class="account-auth-identity">${ui.esc(row.name)} · ${ui.esc(row.uid)}</p>`:''}
      <div class="account-qr ${over?'unavailable':''}">${qr()}${over?`<div class="account-qr-cover"><strong>${state==='expired'?'二维码已过期':'授权未完成'}</strong>${ui.btn('刷新二维码','account-auth-refresh',true)}</div>`:''}</div>
      <p class="account-auth-notice" id="accountAuthNotice" role="status">${state==='expired'?'二维码已过期，请刷新后重新扫码':state==='failed'?'授权失败，请刷新二维码后重试':'注意：该授权二维码两分钟内有效，请及时操作'}</p>
      <div class="account-auth-divider"><span>授权方式登录步骤</span></div>
      <ol class="account-auth-steps"><li><i>1</i>打开快手 App</li><li><i>2</i>点击「扫一扫」</li><li><i>3</i>确认授权登录</li></ol>
      <p class="account-auth-help">请使用${row?'当前快手号':'需要添加的快手号'}扫码，并在手机端确认授权。</p>
    </div>`;
  }
  function auth(id=''){
    cleanup();session={targetId:id,status:'waiting',expires:Date.now()+120000,generation:1};
    ui.modal(id?'重新授权':'新增快手号',authBody(),`<span class="account-demo-label">原型演示</span><details class="account-auth-demo"><summary>演示授权结果</summary><div>${ui.link('授权成功','account-auth-success')}${ui.link('授权失败','account-auth-fail')}${ui.link('二维码过期','account-auth-expire')}</div></details>`);
    $('#overlay .dialog').classList.add('account-auth-dialog');
    timer=setInterval(()=>{if(session&&session.status==='waiting'&&Date.now()>=session.expires){session.status='expired';updateAuth();}},1000);
  }
  function updateAuth(){if(session)$('#overlay .dialog-body').innerHTML=authBody();}
  function cleanup(){clearInterval(timer);timer=null;session=null;}
  function success(){
    if(!session)return;
    if(session.status!=='waiting'||Date.now()>=session.expires){session.status='expired';updateAuth();return;}
    const existing=KSData.accounts.find(a=>a.id===session.targetId);
    let n=10004;while(KSData.accounts.some(a=>a.uid===`DEMO ${n}`))n++;
    const profile=existing?{id:existing.id,uid:existing.uid,name:existing.name}:{id:`ks-demo-${n}`,uid:`DEMO ${n}`,name:`新授权快手号${n-10003}`};
    const before=KSData.accounts.map(a=>({...a}));
    const result=A.authorize(KSData.accounts,{targetId:session.targetId,profile,operatorId:currentEmployee,time:now()});
    if(result.error){$('#accountAuthNotice').textContent=result.error;return;}
    if(!persist()){KSData.accounts.splice(0,KSData.accounts.length,...before);return;}
    ui.close();filters={q:'',operator:'',status:''};page=1;ui.render();ui.toast(result.created?'快手号添加成功':'重新授权成功');
  }
  function handle(action,id){
    if(!action.startsWith('account-'))return false;
    if(action==='account-query'){filters={q:$('#accountSearch').value.trim(),operator:$('#accountOperatorFilter').value,status:$('#accountStatusFilter').value};page=1;ui.render();}
    if(action==='account-reset'){filters={q:'',operator:'',status:''};page=1;ui.render();}
    if(action==='account-prev'||action==='account-next'){page+=action==='account-next'?1:-1;ui.render();}
    if(action==='account-edit')edit(id);
    if(action==='account-save'){
      const before=KSData.accounts.map(a=>({...a}));
      const result=A.setOperator(KSData.accounts,id,$('#accountEditOperator').value,employees,now());
      if(result.error){$('#accountEditError').textContent=result.error;$('#accountEditOperator').focus();}
      else if(persist()){ui.close();ui.render();ui.toast('运营人员已更新');}
      else KSData.accounts.splice(0,KSData.accounts.length,...before);
    }
    if(action==='account-add'||action==='account-reauth')auth(id);
    if(action==='account-auth-refresh'&&session){session.status='waiting';session.expires=Date.now()+120000;session.generation++;updateAuth();}
    if(action==='account-auth-success')success();
    if(action==='account-auth-fail'&&session){session.status='failed';updateAuth();}
    if(action==='account-auth-expire'&&session){session.status='expired';updateAuth();}
    return true;
  }
  return {init,render,handle,cleanup};
})();
