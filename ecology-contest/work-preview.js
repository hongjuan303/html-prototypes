import {cloudReady,cloudPanel,simulateCloudImport} from './cloud-import.js?v=20261028-v9';
import {pending,reviewStamp,workMaterials} from './workflow.js?v=20261028-v9';
import {getFile,reviewWork,eventBy,workBy,TODAY} from './model.js?v=20261028-v9';
import {trackTypeLabel} from './config.js?v=20261028-v9';

export function createWorkPreview(ctx){
  const {getState,esc,button,modal,closeModal,bindForm,persist,render,toast,setCleanup}=ctx;
  return function openWork(id,edit=false){
    const s=getState(),w=workBy(s,id),e=eventBy(s,w?.event);if(!w||!e)return;
    const isScript=w.track==='剧本',isFilm=w.track==='AI漫剧成片',stamp=reviewStamp(w);
    const allowed=cloudReady(w)&&pending(w)&&!e.resultsPublished&&e.status!=='已取消'&&!(e.status==='征集中'&&TODAY<=e.tracks.find(t=>t.name===w.track)?.end);
    let materials=workMaterials(w),index=0,zoom=100,sequence=0,disposed=false,auto=true,urls=[],textPages=[],pdfDoc=null,pdfRender=0,pdfObserver=null;
    if(!isScript&&materials.length===1&&materials[0].demo&&isFilm&&['w4','w6'].includes(w.id))materials=[1,2,3].map(n=>({...materials[0],id:materials[0].id+'-'+n,episodeNumber:n,name:w.title+' · 第 '+n+' 集'}));
    const metadata=`<section class="preview-info"><dl>${[['所属赛事',e.title],['参赛主体',w.identity.entity],['参赛身份',w.identity.type],['联系人',w.identity.name],['联系电话',w.identity.phone],['联系微信',w.identity.wechat||'—'],['联系邮箱',w.identity.email||'—'],['作品简介',w.summary]].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
    const review=edit&&allowed?`<form id="review-form"><h3>审核作品</h3><p class="muted">${isFilm?'整件作品统一审核，不逐集判定。':'审核结果及评语将同步给参赛者。'}</p><div class="radio-group"><label><input type="radio" name="result" value="通过" required> 审核通过</label><label><input type="radio" name="result" value="拒绝"> 拒绝</label></div><label class="field"><span id="review-note-label">评语（通过选填，拒绝必填）</span><textarea name="note" rows="5" maxlength="500" placeholder="填写评价或未通过原因"></textarea></label><div class="review-note-help"><small>评语仅对应参赛者可见</small><span data-note-count>0 / 500</span></div><p class="muted">审核人：容量运营（演示账号）<br>审核时间：提交成功时自动记录</p><div class="form-error" role="alert"></div><div class="form-actions">${button('取消','close')}<button class="btn primary">确认审核</button></div></form>`:`<section class="preview-review-record"><h3>审核记录</h3><p><span class="tag">${pending(w)?'待审核':esc(w.status)}</span></p><dl><div><dt>审核人</dt><dd>${esc(stamp.name)}</dd></div><div><dt>审核时间</dt><dd>${esc(stamp.at)}</dd></div></dl>${pending(w)?`<p class="muted">${!cloudReady(w)?'网盘视频尚未导入完成，暂不能审核。':allowed?'此处为只读预览，可返回列表进行审核。':e.resultsPublished?'名单已发布，不能审核。':e.status==='已取消'?'赛事已取消，不能审核。':'该赛道征集截止后开启审核。'}</p>`:''}${(w.reviews||[]).map(r=>`<article class="preview-history"><small>${esc(r.at)} · ${esc(r.reviewerName||'历史记录')} · ${esc(r.result==='拒绝'?'未通过':'通过')}</small><p>${esc(r.note||'未填写评语')}</p></article>`).join('')}${!w.reviews?.length&&w.reason?`<p>${esc(w.reason)}</p>`:''}</section>`;
    modal(edit&&allowed?'作品预览与审核':'参赛作品预览',`<div class="preview-work-heading"><div><span>${esc(trackTypeLabel(w.track))} · V${w.version}</span><h3>${esc(w.title)}</h3></div><span class="tag">${pending(w)?'待审核':esc(w.status)}</span></div><div class="work-review-grid"><section class="preview-column"><div class="preview-material-top"><b>${isScript?'剧本预览':isFilm?'成片预览':'样片预览'}</b><small>仅查看本次投稿内容</small></div>${cloudPanel(w,esc,true)}<div class="media-layout ${isScript?'script-layout':''}"><div class="media-main"><div id="material-screen" aria-live="polite"></div><div id="media-navigation"></div></div><aside class="episode-panel"><h4>${isScript?'提交文件':'选集'} <small>共 ${materials.length} ${isScript?'份':'集'}</small></h4><div id="material-items"></div>${!isScript?'<label class="continuous-play"><input type="checkbox" id="continuous-play" checked> 连续播放</label>':''}</aside></div>${metadata}</section><aside class="review-column">${review}</aside></div>`,'',true);
    document.querySelector('.modal').classList.add('work-review-modal');
    const screen=document.querySelector('#material-screen'),nav=document.querySelector('#media-navigation'),items=document.querySelector('#material-items');
    function cleanupMedia(){screen.querySelector('video')?.pause();urls.forEach(u=>URL.revokeObjectURL(u));urls=[];pdfRender++;pdfObserver?.disconnect();pdfObserver=null;pdfDoc?.destroy();pdfDoc=null;}
    setCleanup(()=>{disposed=true;sequence++;cleanupMedia();});
    function drawItems(){items.innerHTML=materials.map((f,i)=>`<button type="button" data-preview-index="${i}" title="${esc(f.name)}" class="episode-choice ${i===index?'active':''}" aria-pressed="${i===index}"><b>${isScript?esc(f.name):'第 '+(f.episodeNumber||i+1)+' 集'}</b><small>${i===index?(isScript?'正在阅读':'当前播放'):isScript?'点击阅读':esc(f.name)}</small></button>`).join('');items.querySelectorAll('[data-preview-index]').forEach(b=>b.onclick=()=>load(Number(b.dataset.previewIndex),false));}
    function textView(){
      const position=screen.querySelector('.document-view')?.scrollTop||0;
      screen.innerHTML=`<div class="document-view" tabindex="0" aria-label="剧本连续阅读"><article class="document-page" style="font-size:${16*zoom/100}px"><h3>${esc(materials[index]?.name||w.title)}</h3><p class="pre-line">${esc(textPages.join('\n\n')||'文件没有可读取的正文')}</p></article></div>`;
      nav.innerHTML=`<span>上下滚动阅读</span>${zoomControl()}`;
      screen.querySelector('.document-view').scrollTop=position;
      nav.querySelector('#doc-zoom').onchange=x=>{zoom=Number(x.target.value);textView();};
    }
    function zoomControl(){return `<label>缩放 <select id="doc-zoom">${[80,100,125,150].map(v=>`<option ${zoom===v?'selected':''} value="${v}">${v}%</option>`).join('')}</select></label>`;}
    function errorView(message){screen.innerHTML=`<div class="preview-error"><span>!</span><h4>暂时无法预览</h4><p>${esc(message)}</p><button type="button" class="btn" id="preview-retry">重新加载</button></div>`;screen.querySelector('#preview-retry').onclick=()=>load(index,false);}
    async function pdfView(){
      const doc=pdfDoc,renderToken=++pdfRender;if(!doc)return;
      const old=screen.querySelector('.document-view'),fraction=old?old.scrollTop/Math.max(1,old.scrollHeight):0;
      pdfObserver?.disconnect();
      screen.innerHTML='<div class="document-view pdf-canvas-view" tabindex="0" aria-label="PDF 连续阅读"></div>';
      nav.innerHTML=`<span>共 ${doc.numPages} 页 · 上下滚动阅读</span>${zoomControl()}`;
      nav.querySelector('#doc-zoom').onchange=x=>{zoom=Number(x.target.value);pdfView();};
      try{
        const first=await doc.getPage(1);if(disposed||renderToken!==pdfRender)return;
        const view=screen.querySelector('.document-view'),base=first.getViewport({scale:1}),scale=Math.max(0.4,(screen.clientWidth-40)/base.width)*zoom/100;
        view.innerHTML=Array.from({length:doc.numPages},(_,i)=>`<section class="pdf-sheet" data-page="${i+1}" style="min-height:${base.height*scale}px"><small>第 ${i+1} 页</small><div class="pdf-page-loading">正在加载…</div></section>`).join('');
        let queue=Promise.resolve();
        async function draw(sheet){
          if(disposed||renderToken!==pdfRender)return;
          try{const p=await doc.getPage(Number(sheet.dataset.page));if(disposed||renderToken!==pdfRender)return;
            const viewport=p.getViewport({scale}),ratio=Math.min(devicePixelRatio||1,2),canvas=document.createElement('canvas');
            canvas.setAttribute('aria-label','剧本 PDF 第 '+sheet.dataset.page+' 页');canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
            sheet.querySelector('.pdf-page-loading')?.remove();sheet.append(canvas);sheet.style.minHeight='';
            await p.render({canvasContext:canvas.getContext('2d'),viewport,transform:ratio!==1?[ratio,0,0,ratio,0,0]:null}).promise;
          }catch(err){if(disposed||renderToken!==pdfRender)return;sheet.innerHTML='<p>本页加载失败</p><button type="button" class="btn">重试本页</button>';sheet.querySelector('button').onclick=()=>{sheet.innerHTML='<div class="pdf-page-loading">正在加载…</div>';draw(sheet);};}
        }
        pdfObserver=new IntersectionObserver(entries=>entries.filter(x=>x.isIntersecting).forEach(({target})=>{pdfObserver.unobserve(target);queue=queue.then(()=>draw(target));}),{root:view,rootMargin:'600px 0px'});
        view.querySelectorAll('.pdf-sheet').forEach(sheet=>pdfObserver.observe(sheet));view.scrollTop=fraction*view.scrollHeight;
      }catch(err){if(!disposed&&renderToken===pdfRender)errorView('PDF 阅读失败：'+err.message);}
    }
    async function load(i,start){
      cleanupMedia();index=i;const token=++sequence;drawItems();nav.innerHTML='';screen.innerHTML='<div class="preview-loading">正在加载作品…</div>';
      const f=materials[i];if(!f){errorView('尚无可预览的投稿材料。');return;}
      try{
        if(f.unavailable)throw Error('历史平台作品未留存可播放版本，需接入投稿时的视频快照；不会用项目最新内容替代。');
        if(isScript&&f.demo){textPages=[`演示剧本 · 非真实参赛附件\n\n故事大纲\n${w.summary}\n\n主人公沿山路寻找一封迟到的信。旅途中的三次相遇，让她重新理解家人与故乡。故事以信件的归处为主线，呈现人与文化记忆的连接。`,`演示剧本 · 人物小传\n\n林溪，26 岁，返乡录音师。习惯用声音记住一个地方，却一直回避与家人的对话。\n\n周叔，58 岁，邮递员。即将退休，仍想把一封旧信交到收信人手里。\n\n人物关系\n两人因一次委托同行，从互不理解走向信任。`,`演示剧本 · 正文\n\n第一场 山路 日 外\n清晨，雾气在山谷散开。林溪打开录音机，周叔推着旧自行车停在她面前。\n\n周叔：你找的是声音，还是听见它的人？\n林溪没有回答。风吹动信封，她伸手按住。\n\n第二场 老屋 日 内\n窗边的木桌铺着旧地图。两人沿信封上的地址，找到一段被遗忘的往事。`];textView();return;}
        let url='',blob;
        if(f.demo&&!isScript)url='./assets/preview-sample.webm';
        else if(f.mediaUrl){const parsed=new URL(f.mediaUrl,location.href);if(!['https:','http:'].includes(parsed.protocol))throw Error('作品地址无效');url=parsed.href;}
        else{blob=await getFile(f.id);if(disposed||token!==sequence)return;if(!blob)throw Error('本机未找到该附件，请保留原投稿文件；此演示不连接正式媒资服务。');url=URL.createObjectURL(blob);urls.push(url);}
        if(disposed||token!==sequence)return;
        if(isScript){
          const ext=f.name.split('.').pop().toLowerCase();
          if(ext==='pdf'){const pdf=await import('./vendor/pdf.min.mjs');pdf.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.mjs',import.meta.url).href;const doc=await pdf.getDocument({url,isEvalSupported:false,cMapUrl:new URL('./vendor/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/standard_fonts/',import.meta.url).href}).promise;if(disposed||token!==sequence){doc.destroy();return;}pdfDoc=doc;await pdfView();return;}
          let text='';if(ext==='docx'&&blob){
            if(!window.mammoth)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./vendor/mammoth.browser.min.js';script.onload=resolve;script.onerror=()=>reject(Error('文档阅读组件加载失败'));document.head.append(script);});
            text=(await window.mammoth.extractRawText({arrayBuffer:await blob.arrayBuffer()})).value;
          }else if(['txt','md'].includes(ext)&&blob)text=await blob.text();
          else throw Error('该格式需要文档转换服务。本地版未接入旧版 DOC 等格式转换，可用 DOCX、PDF 或文本验证在线阅读。');
          if(disposed||token!==sequence)return;
          textPages=[text||'文件没有可读取的正文'];textView();return;
        }
        screen.innerHTML=`<video id="work-video" controls playsinline preload="metadata" src="${esc(url)}"></video>${f.demo?'<p class="preview-demo">示例短片，仅演示播放器与选集，非真实参赛内容</p>':''}<p id="video-status" role="status"></p>`;
        nav.innerHTML=`<button type="button" class="btn" data-episode-prev ${i===0?'disabled':''}>上一集</button><span>第 ${f.episodeNumber||i+1} 集 / 共 ${materials.length} 集</span><button type="button" class="btn" data-episode-next ${i===materials.length-1?'disabled':''}>下一集</button>`;
        nav.querySelector('[data-episode-prev]').onclick=()=>load(index-1,false);nav.querySelector('[data-episode-next]').onclick=()=>load(index+1,false);
        const video=screen.querySelector('video');video.onerror=()=>{if(token===sequence)errorView('视频无法播放或编码暂不兼容。正式服务需提供转码版本；请重试，不会自动跳过或判定审核失败。');};
        video.onended=()=>{if(auto&&index<materials.length-1)load(index+1,true);else screen.querySelector('#video-status').textContent=index===materials.length-1?'已播放至最后一集':'本集播放结束';};
        if(start)video.play().catch(()=>{if(token===sequence)screen.querySelector('#video-status').textContent='请点击播放，继续观看下一集';});
      }catch(err){if(!disposed&&token===sequence)errorView(err.message);}
    }
    document.querySelector('#continuous-play')?.addEventListener('change',x=>{auto=x.target.checked;});
    const form=document.querySelector('#review-form');
    if(form){const note=form.elements.note;note.oninput=()=>form.querySelector('[data-note-count]').textContent=note.value.length+' / 500';form.onchange=()=>{note.required=form.elements.result.value==='拒绝';};
      bindForm('review-form',d=>{reviewWork(getState(),id,d.result,d.note);persist();closeModal();render();toast('审核完成，已记录审核人和审核时间');});}
    document.querySelectorAll('[data-cloud-action]').forEach(b=>b.onclick=()=>{
      try{simulateCloudImport(w,b.dataset.cloudAction);persist();closeModal();render();openWork(id,edit);}catch(error){toast(error.message);}
    });
    if(!cloudReady(w)){screen.innerHTML='<div class="preview-loading">视频文件列表尚未生成，导入完成后可在线预览。</div>';document.querySelector('.episode-panel').hidden=true;}else load(0,false);
  };
}
