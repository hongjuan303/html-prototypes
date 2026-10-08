import {mountPlatformShell,renderToolbox} from './platform-shell.js?v=20261008-interaction1';
import {claimEditingSession} from './demo-session.js?v=20261008-interaction1';
const toolbox=document.body.dataset.workspace==='toolbox';
mountPlatformShell(toolbox);
if(toolbox){
 renderToolbox();
 await import('./review-bridge.js?v=20261008-interaction1');
}else{
 const url=new URL(location.href);
 const showSession=(title,message,retry=false)=>{
  document.querySelector('#app').innerHTML=`<section class="section session-unavailable" role="status"><h1>${title}</h1><p>${message}</p>${retry?'<button id="reopenEditor" class="primary">在此继续</button>':''}</section>`;
  document.querySelector('#workspaceNav').hidden=true;
  document.querySelector('[data-action="demo-tools"]').hidden=true;
  document.querySelector('#breadcrumb').textContent='工具箱 / 智能混剪';
  document.querySelector('#reopenEditor')?.addEventListener('click',()=>{
   url.searchParams.delete('session');
   location.replace(url.href);
  });
 };
 if(url.searchParams.get('session')==='paused'){
  showSession('已在新页面继续','当前设置与任务记录已保留。',true);
 }else{
  showSession('正在打开智能混剪','正在读取当前设置与任务记录。');
  const session=await claimEditingSession({onWaiting:()=>showSession('正在接续当前任务','原页面有任务正在处理时，完成后将自动进入。')});
  if(session.writable){
   try{
    document.querySelector('#workspaceNav').hidden=false;
    document.querySelector('[data-action="demo-tools"]').hidden=false;
    const app=await import('./app.js?v=20261008-interaction1');
    session.setYieldHandler(()=>{
     if(!app.relinquishEditingSession())return false;
     url.searchParams.set('session','paused');
     location.replace(url.href);
     return true;
    });
   }catch(error){
    session.release();
    showSession('页面加载未完成','请重新进入，已有记录会继续保留。',true);
    console.error(error);
   }
  }else{
   showSession('暂时无法接续页面','请重新进入，已有记录会继续保留。',true);
  }
 }
 await import('./review-bridge.js?v=20261008-interaction1');
}
