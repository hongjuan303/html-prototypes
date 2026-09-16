import {REVIEW_NOTES} from './review-notes.js?v=20260916-publish1';
if(new URLSearchParams(location.search).get('review')==='1'&&window.parent!==window){
  const dialog=document.querySelector('#dialog');
  document.querySelector('.brand').setAttribute('href','./?review=1');
  const layer=document.createElement('div');layer.className='review-pin-layer';layer.setAttribute('aria-label','原型需求编号');document.body.append(layer);
  let context='',signature='',visible=true,targets=[],scheduled=false,highlightTimer;
  const titles={'从绿台选择合集':'source-picker','导入本地原片':'upload','本地原片预览':'local-preview','调整本次选集':'drama-range','选择BGM':'bgm-picker','整理所选剧情':'analysis','沿用已整理方案的标准':'standard-change','比较两个内容方向':'compare','纠正人物称呼':'character','记录全解说问题':'issue-full','记录当前成片的问题':'issue','选择同步到的素材管理':'sync-target','上传素材':'sync-form','素材同步记录':'sync-detail','同步到素材管理的记录':'sync-records','费用明细':'quote','演示设置':'demo-tools','重置 V5 演示':'reset'};
  function send(type,extra={}){window.parent.postMessage({channel:'mixed-cut-v5-review',type,...extra},location.origin);}
  function currentContext(){if(dialog.open){const title=document.querySelector('#dialogTitle').textContent.trim();if(titles[title])return titles[title];if(title.startsWith('剧情依据 · '))return 'plan-detail';if(/^第 \d+ 集 · /.test(title))return 'episode';if(/^确认 \d+ 条素材可用$/.test(title))return 'confirm';return 'event';}const name=document.querySelector('#breadcrumb b')?.textContent.trim();
    const views={'制作素材':'create','内容方案':'plans','剧目与剧情':'assets','任务与成片':'tasks','积分与用量':'costs'};
    if(name==='剧目详情')return 'drama-'+(document.querySelector('[data-action="drama-tab"].active')?.dataset.value||'plot');
    if(name==='检查与修复'){const tab=document.querySelector('[data-action="review-tab"].active')?.dataset.value||'junction';if(document.querySelector('.full-narration-meta'))return 'review-full-'+tab;return tab==='narration'&&!document.querySelector('#narrationEdit')?'review-highlight-narration':'review-'+tab;}
    return views[name]||'create';}
  function targetFor(anchor){if(!anchor?.selector)return null;let list;try{list=[...document.querySelectorAll(anchor.selector)];}catch{return null;}return list[anchor.index||0]||null;}
  function isRendered(element){if(!element?.isConnected)return false;const r=element.getBoundingClientRect(),style=getComputedStyle(element);return r.width>0&&r.height>0&&style.visibility!=='hidden'&&style.display!=='none'&&!element.closest('[hidden]');}
  function canLocate(element){if(!element?.isConnected||element.closest('[hidden]'))return false;if(isRendered(element))return true;let closed=false;for(let parent=element.parentElement;parent;parent=parent.parentElement){if(getComputedStyle(parent).display==='none')return false;if(parent.tagName==='DETAILS'&&!parent.open)closed=true;}return closed;}
  function sync(){scheduled=false;const next=currentContext();const notes=REVIEW_NOTES[next];if(!notes){layer.replaceChildren();return;}context=next;const parent=dialog.open?dialog:document.body;if(layer.parentElement!==parent)parent.append(layer);targets=notes.sections.map(section=>({...section,element:targetFor(section.anchor)})).filter(section=>canLocate(section.element));const nextSignature=JSON.stringify([context,targets.map(section=>section.number)]);if(nextSignature!==signature){signature=nextSignature;send('context',{context,available:targets.map(section=>section.number)});}layer.replaceChildren(...targets.map(section=>{const pin=document.createElement('button');pin.type='button';pin.className='review-pin';pin.textContent=section.number;pin.dataset.number=section.number;pin.setAttribute('aria-label',`需求说明 ${section.number}：${section.title}`);pin.title=`${section.number} · ${section.title}`;pin.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();send('select',{context,number:section.number});});return pin;}));position();}
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(sync);}}
  function position(){
    layer.hidden=!visible;const placed=[];
    for(const section of targets){
      const pin=layer.querySelector(`[data-number="${section.number}"]`);if(!pin)continue;
      const rect=section.element.getBoundingClientRect(),placement=section.anchor.placement||'left';
      const body=section.element.closest('#dialogBody'),bodyRect=body?.getBoundingClientRect();
      const footer=document.querySelector('#actionBar');
      let top=bodyRect?bodyRect.top:0,bottom=bodyRect?bodyRect.bottom:innerHeight;
      if(!dialog.open&&!footer.hidden&&!section.element.closest('#actionBar'))bottom=Math.min(bottom,footer.getBoundingClientRect().top);
      pin.hidden=!isRendered(section.element)||rect.bottom<=top||rect.top>=bottom||rect.right<0||rect.left>innerWidth;
      if(pin.hidden)continue;
      let x=placement==='right'?rect.right+5:placement==='top'?rect.left+12:rect.left-29;
      let y=placement==='top'?rect.top-13:rect.top+Math.min(14,Math.max(0,(rect.height-24)/2));
      x=Math.max(5,Math.min(innerWidth-29,x));y=Math.max(top+4,Math.min(bottom-28,y));
      for(const previous of placed){if(Math.abs(previous.x-x)<27&&Math.abs(previous.y-y)<27)y=previous.y+29;}
      if(y>bottom-28){pin.hidden=true;continue;}
      placed.push({x,y});pin.style.left=x+'px';pin.style.top=y+'px';
    }
  }
  const observer=new MutationObserver(records=>{if(records.some(record=>{const element=record.target.nodeType===Node.ELEMENT_NODE?record.target:record.target.parentElement;return !element?.closest?.('#screenText,#screenSource,#playerTime');}))schedule();});
  for(const selector of ['#app','#actionBar','#dialogBody','#dialogActions','#dialogTitle','#breadcrumb'])observer.observe(document.querySelector(selector),{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  observer.observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('scroll',position,true);window.addEventListener('resize',position);document.addEventListener('toggle',schedule,true);
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent||event.data?.channel!=='mixed-cut-v5-review')return;const data=event.data;if(data.type==='ready'){signature='';schedule();}if(data.type==='markers'){visible=Boolean(data.visible);position();}if(data.type==='locate'&&data.context===context){const section=targets.find(item=>item.number===data.number);if(!section)return;document.querySelector('.review-location-highlight')?.classList.remove('review-location-highlight');clearTimeout(highlightTimer);let ancestor=section.element.parentElement;while(ancestor){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}section.element.classList.add('review-location-highlight');section.element.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});highlightTimer=setTimeout(()=>section.element.classList.remove('review-location-highlight'),5000);position();}});
  new ResizeObserver(position).observe(document.documentElement);
  schedule();
}
