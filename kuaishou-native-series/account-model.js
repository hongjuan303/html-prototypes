/* Account identity and authorization rules; prototype data only. */
(function(root){
  'use strict';
  const normalize=(row,employees)=>({...row,operatorId:employees.some(e=>e.id===row.operatorId)?row.operatorId:'',updatedAt:row.updatedAt||''});
  function setOperator(rows,id,operatorId,employees,time){
    const row=rows.find(a=>a.id===id);
    if(!row)return {error:'快手号不存在，请刷新列表'};
    if(!employees.some(e=>e.id===operatorId))return {error:'请选择有效的容量员工账号'};
    row.operatorId=operatorId;row.updatedAt=time;
    return {row};
  }
  function authorize(rows,{targetId,profile,operatorId,time}){
    if(!profile?.uid||!profile?.name)return {error:'未获取到快手号信息，请重新授权'};
    const existing=rows.find(a=>a.uid===profile.uid);
    if(targetId){
      const row=rows.find(a=>a.id===targetId);
      if(!row)return {error:'快手号不存在，请刷新列表'};
      if(row.uid!==profile.uid)return {error:'扫码快手号与当前账号不一致，请使用当前快手号重新授权'};
      row.name=profile.name;row.valid=true;row.updatedAt=time;
      return {row,created:false};
    }
    if(existing)return {error:'该快手号已添加，请在列表中重新授权'};
    const row={id:profile.id,name:profile.name,uid:profile.uid,company:'示例经营主体',valid:true,operatorId,updatedAt:time};
    if(!row.id||rows.some(a=>a.id===row.id))return {error:'账号信息冲突，请刷新授权码'};
    rows.unshift(row);
    return {row,created:true};
  }
  const api={normalize,setOperator,authorize};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.KSAccountModel=api;
})(typeof window!=='undefined'?window:this);
