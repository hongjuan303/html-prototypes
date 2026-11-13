(() => {
'use strict';
const D=window.ENGLISH_DATA;
const P=window.CARD_PRACTICE||{};
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>';
const store={read(k,f){try{return JSON.parse(localStorage.getItem('little-english-'+k))??f;}catch{return f;}},write(k,v){try{localStorage.setItem('little-english-'+k,JSON.stringify(v));}catch{}}};
const known=new Set(store.read('known',[]));
const daysDone=new Set(store.read('days',[]));
const params=new URLSearchParams(location.search);
const state={view:'learn',group:params.get('topic')||store.read('topic','move'),lesson:Number(params.get('lesson'))||store.read('lesson',1),chinese:store.read('chinese',true),bilingual:store.read('bilingual',true),speed:store.read('speed',1),playlist:null,wordIndex:0};
if(!D.groups.some(g=>g.id===state.group))state.group='move';
if(!D.groups.find(g=>g.id===state.group).lessons.includes(state.lesson))state.lesson=D.groups.find(g=>g.id===state.group).lessons[0];
const group=()=>D.groups.find(g=>g.id===state.group);
const lesson=()=>D.lessons.find(l=>l.id===state.lesson);
const getLesson=id=>D.lessons.find(l=>l.id===id);
const wordById=id=>D.lessons.flatMap(l=>l.words).find(w=>w.id===id);
const getSequence=()=>state.playlist?state.playlist.lessons:group().lessons;
const allWords=D.lessons.flatMap(l=>l.words);
const visualMap=new Map(allWords.filter(w=>w.image).map(w=>[w.en,w.image]));
const abstract={'daytime':'☀️','nighttime':'🌙','light':'☀️','dark':'🌌','owls':'🦉','owl':'🦉'};
function picture(w){const src=w.image||visualMap.get(w.en);return src?`<img src="./${escape(src)}" alt="${escape(w.zh)}" loading="lazy">`:`<span class="fallback-image" aria-hidden="true">${abstract[w.en]||'🌱'}</span>`;}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
function persist(){for(const key of ['chinese','bilingual','speed','topic','lesson'])store.write(key,key==='topic'?state.group:state[key]);}
function updateProgress(){const count=allWords.filter(w=>known.has(w.id)).length;$('#progressBar').style.width=(count/allWords.length*100)+'%';$('#progressText').textContent=`已认识 ${count} / ${allWords.length} 个词条`;}
function renderNav(){
 $('#topicNav').innerHTML=D.groups.map(g=>`<button class="topic ${g.id===state.group?'active':''}" data-group="${g.id}" aria-current="${g.id===state.group?'true':'false'}"><span class="topic-icon" style="background:${g.color}" aria-hidden="true">${g.icon}</span><span><strong>${g.title}</strong><small>${g.en}</small></span><span class="topic-arrow" aria-hidden="true">›</span></button>`).join('');
 updateProgress();
}
function settings(){return `<div class="tools"><label class="switch-label"><input type="checkbox" data-setting="chinese" ${state.chinese?'checked':''}>显示中文</label><label class="switch-label"><input type="checkbox" data-setting="bilingual" ${state.bilingual?'checked':''}>双语连读</label><select aria-label="朗读速度" data-setting="speed"><option value="0.8" ${state.speed===.8?'selected':''}>慢速 0.8×</option><option value="1" ${state.speed===1?'selected':''}>正常 1×</option></select></div>`;}
function renderHeader(subtitle){return `<div class="section-top"><div><div class="topic-label">${escape(group().en.toUpperCase())}</div><h2>${group().icon} ${escape(group().title)}</h2><p>${escape(subtitle)} <span id="audioReady" class="audio-ready" role="status"></span></p></div>${settings()}</div>`;}
function playlistLabel(){return state.playlist?`<div class="playlist-label"><span>第 ${state.playlist.day} 天的复习清单 · ${state.playlist.lessons.length} 个小节，可分次完成</span><button data-action="exitPlaylist">退出清单</button></div>`:'';}
function renderChips(){return `<div class="lesson-strip" aria-label="学习小节">${getSequence().map(id=>`<button class="lesson-chip ${id===state.lesson?'active':''}" data-lesson="${id}" aria-pressed="${id===state.lesson}">${escape(getLesson(id).title)}</button>`).join('')}</div>`;}
function voice(o,lang,kind,index){return `<button class="voice-button ${lang==='zh'?'zh':''}" data-speech="${kind}" data-index="${index}" data-lang="${lang}" aria-label="朗读${lang==='en'?'英文':'中文'} ${escape(o[lang])}">${icon}<span>${lang==='en'?'英文':'中文'}</span></button>`;}
function currentPractice(){return P[lesson().words[state.wordIndex]?.id]||[];}
function practiceMarkup(){
 const w=lesson().words[state.wordIndex],pairs=currentPractice();
 return `<div class="practice-head"><div class="practice-thumb">${picture(w)}</div><div><span class="practice-caption">看这张图，说一句</span><h3 id="practiceHeading" lang="en-GB">${escape(w.en)}</h3><small class="translation">${escape(w.zh)}</small></div></div>
 <div class="practice-dialogue">${pairs.map((pair,i)=>`${i===0||pair.question.en!==pairs[i-1].question.en?`<div class="practice-line practice-question"><span class="speaker-label">家长问</span><p lang="en-GB">${escape(pair.question.en)}</p><small class="translation">${escape(pair.question.zh)}</small><div class="practice-voices">${voice(pair.question,'en','practice-q',i)}${voice(pair.question,'zh','practice-q',i)}</div></div>`:''}<div class="practice-line practice-answer"><span class="speaker-label">${escape(pair.label||'宝宝答')}</span><p lang="en-GB">${escape(pair.answer.en)}</p><small class="translation">${escape(pair.answer.zh)}</small><div class="practice-voices">${voice(pair.answer,'en','practice-a',i)}${voice(pair.answer,'zh','practice-a',i)}</div></div>`).join('')}</div>
 <button class="practice-play" data-action="practiceAll">${icon} 听这组问答</button><p class="practice-note">回答示例可按真实情况调整，愿意跟说就很棒。</p>`;
}
function positionPracticePanel(){
 const panel=$('#cardPractice'),grid=$('.learn-layout .word-grid'),dock=$('.practice-dock');
 if(!panel||!grid||!dock)return;
 if(matchMedia('(max-width:900px)').matches){
  const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  const cards=[...grid.querySelectorAll(':scope > .word-card')];
  const rowEnd=Math.min(cards.length-1,Math.floor(state.wordIndex/columns)*columns+columns-1);
  if(panel.previousElementSibling!==cards[rowEnd])cards[rowEnd]?.insertAdjacentElement('afterend',panel);
 }else if(panel.parentElement!==dock)dock.append(panel);
}
function selectPracticeCard(index,scroll=false){
 const next=Math.min(lesson().words.length-1,Math.max(0,Number(index)));
 state.wordIndex=next;
 document.querySelectorAll('.learn-layout .word-card').forEach((card,i)=>{
  card.classList.toggle('selected',i===next);
  const button=card.querySelector('.practice-trigger');if(button){button.setAttribute('aria-expanded',String(i===next));button.lastElementChild.textContent=i===next?'↗':'↓';}
 });
 const panel=$('#cardPractice');if(panel)panel.innerHTML=practiceMarkup();positionPracticePanel();
 if(scroll&&matchMedia('(max-width:900px)').matches){
  const grid=$('.learn-layout .word-grid'),columns=getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  const rowStart=Math.floor(next/columns)*columns;
  const card=grid.querySelectorAll(':scope > .word-card')[rowStart];
  const bottom=panel.getBoundingClientRect().bottom,top=card.getBoundingClientRect().top;
  if(top<0||bottom>innerHeight-16)card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
 }
}
function renderLearn(){const l=lesson();
 state.wordIndex=Math.min(state.wordIndex,l.words.length-1);
 const seq=getSequence(),position=seq.indexOf(l.id),next=seq[(position+1)%seq.length];
 return `${playlistLabel()}${renderHeader('选一张卡片，看图、听词，再练一句相关问答。')}${renderChips()}
 <div class="lesson-heading" id="wordSection"><div><h3>${escape(l.title)}</h3><span class="tag">${l.words.length} 个词条</span></div><button class="small-button" data-action="readAll">${icon} 一起听</button></div>
 <p class="review-guide">点图片${state.bilingual?'听英文＋中文':'听英文'}，相关问答跟着卡片走 · 点 ☆ 标记“认识了”</p>
 <div class="learn-layout"><div class="word-grid">${l.words.map((w,i)=>`<article class="word-card ${known.has(w.id)?'known':''} ${i===state.wordIndex?'selected':''}" data-word="${w.id}"><button class="word-visual" data-action="word" data-index="${i}" aria-label="点读 ${escape(w.en)} ${escape(w.zh)}">${picture(w)}<strong lang="en-GB">${escape(w.en)}</strong><small class="translation">${escape(w.zh)}</small></button><div class="word-actions">${voice(w,'en','word',i)}${voice(w,'zh','word',i)}<button class="known-button" data-known="${w.id}" aria-label="${escape(w.en)} 认识了" aria-pressed="${known.has(w.id)}" title="认识了">${known.has(w.id)?'★':'☆'}</button></div><button class="practice-trigger" data-practice="${i}" aria-controls="cardPractice" aria-expanded="${i===state.wordIndex}"><span>练问答</span><span aria-hidden="true">${i===state.wordIndex?'↗':'↓'}</span></button></article>`).join('')}</div><aside class="practice-dock"><section class="card-practice" id="cardPractice" aria-labelledby="practiceHeading">${practiceMarkup()}</section></aside></div>
 <div class="study-support"><aside class="coach"><h3><span aria-hidden="true">🌿</span>陪娃这样玩</h3><p>${escape(l.tip)}</p><div class="coach-step"><b>先听懂</b> → 指图或做动作　<b>再模仿</b> → 愿意就说</div>${l.note?`<p class="note">${escape(l.note)}</p>`:''}</aside><details class="sentence-reference"><summary>本小节完整句型 · ${l.sentences.length} 句</summary><p class="reference-hint">卡片旁边可直接练相关问答。这里保留原小节的完整表达，方便家长查阅。</p><div class="sentences">${l.sentences.map((s,i)=>`<div class="sentence"><div><p lang="en-GB">${escape(s.en)}</p><small class="translation">${escape(s.zh)}</small></div><div class="voice-controls">${voice(s,'en','sentence',i)}${voice(s,'zh','sentence',i)}</div></div>`).join('')}</div></details></div>
 <details class="original"><summary>对照原卷 · 第 ${l.id} 张学习图</summary><img src="./${l.original}" alt="原卷第${l.id}张学习图 ${escape(l.title)}" loading="lazy"><p>Talk & Tell：看图说一说。Point to an image：指一张图。Ask：提问。Say：说一说。原图中的留空问答可参考上方句子，按图片或真实情境替换。</p></details><div class="lesson-footer"><span>这一小节可以分几次玩，<br>宝宝累了就休息。</span><button class="primary" data-lesson="${next}">${position===seq.length-1?'回到第一个小节':'下一个小节'} <span>→</span></button></div>`;
}
let game=null;
function eligibleWords(){const seen=new Set();return group().lessons.flatMap(id=>getLesson(id).words).filter(w=>{if(['light','dark'].includes(w.en)||!(w.image||visualMap.has(w.en))||seen.has(w.en))return false;seen.add(w.en);return true;});}
function shuffle(a){return [...a].sort(()=>Math.random()-.5);}
function startGame(){const pool=eligibleWords();game={questions:shuffle(pool).slice(0,Math.min(5,pool.length)),index:0,answered:false,finished:false,choiceWords:[],pool};prepareQuestion();render();}
function prepareQuestion(){const q=game.questions[game.index];const wrong=shuffle(game.pool.filter(w=>w.en!==q.en&&w.zh!==q.zh)).slice(0,2);game.choiceWords=shuffle([q,...wrong]);game.answered=false;}
function renderGame(){
 const head=renderHeader('听一个英文词，找到对应的图片。每轮最多 5 题。');
 if(!game)return `${head}<div class="game-box"><div class="game-start"><div class="game-icon" aria-hidden="true">🎧</div><h3 class="game-title">小耳朵，准备好了吗？</h3><p class="game-help">先听，再找图片。<br>选错也没关系，可以再听一次。<br>本轮主题：${escape(group().title)}</p><button class="primary" data-action="startGame">开始听音找图 <span>→</span></button></div></div>`;
 if(game.finished)return `${head}<div class="game-box game-finish"><div class="game-icon" aria-hidden="true">🌟</div><h3 class="game-title">今天的小耳朵真认真！</h3><p class="game-help">一起认识了 ${game.questions.length} 个词。<br>现在离开屏幕，用实物或动作再玩一小会儿吧。</p><button class="primary" data-action="startGame">再玩一轮</button><button class="small-button" data-view="learn">回到看图点读</button></div>`;
 return `${head}<div class="game-box"><div class="game-topline"><span>听音选图</span><span>第 ${game.index+1} / ${game.questions.length} 题</span></div><h3 class="game-title">它说的是哪一张？</h3><p class="game-help">先点小喇叭听英文，再选图片。</p><button class="listen-big" data-action="gameListen" aria-label="听本题英文">${icon}</button><div class="answers">${game.choiceWords.map((w,i)=>`<button class="answer" data-answer="${i}" aria-label="选择 ${escape(w.zh)}">${picture(w)}<span>${escape(w.zh)}</span></button>`).join('')}</div><div class="game-feedback" role="status" aria-live="polite" id="gameFeedback">不着急，想听几遍都可以。</div><button class="primary" data-action="gameNext" id="gameNext" hidden>下一题 <span>→</span></button></div>`;
}
function renderParents(){return `<div class="section-top"><div><div class="topic-label">A LITTLE EVERY DAY</div><h2>陪宝宝复习，其实可以很轻松</h2><p>10 天是参考节奏。同一天可以重复，内容多的那天可以拆开。</p></div></div><div class="plan-intro"><p>每天先选 <strong>3–5 个词和 1–2 组问答</strong>，约 10 分钟即可；愿意继续再加一点。先听懂、会指，再跟说。短时间、常重复，比一次学完一整张更合适。</p><div class="routine"><div><b>① 唤醒耳朵 · 2 分钟</b><small>点读今天的词，家长和宝宝一起听。</small></div><div><b>② 动手玩 · 4 分钟</b><small>用指图、动作或实物做小游戏。</small></div><div><b>③ 轮流说 · 3 分钟</b><small>家长先示范，再给宝宝回应的时间。</small></div><div><b>④ 轻松收尾 · 1 分钟</b><small>复现一个会的词，具体夸奖后结束。</small></div></div></div><div class="day-list">${D.plan.map(d=>`<article class="day ${daysDone.has(d.day)?'done':''}" id="day-${d.day}"><div class="day-no"><small>DAY</small>${String(d.day).padStart(2,'0')}</div><div><h3>${escape(d.title)}</h3><span class="game-name">${escape(d.game)}</span><p>${escape(d.steps)}</p><p class="goal">观察一下：${escape(d.goal)}</p></div><div class="day-controls"><button class="small-button filled" data-day="${d.day}">打开当天点读 ↗</button><button class="done-button" data-day-done="${d.day}" aria-pressed="${daysDone.has(d.day)}">${daysDone.has(d.day)?'✓ 今天一起玩过了':'○ 标记今天玩过了'}</button></div></article>`).join('')}</div><div class="parent-notes"><h3>家长可以直接照着做</h3><ul><li>先示范一句或一个动作，再给宝宝一点回应的时间。不急着连续追问，也不要求每个词都翻译成中文。</li><li>宝宝暂时只指图、做动作，也是在理解。只说出 water 时，可以自然接成 I want water，再邀请一起说。</li><li>说错时，用正确表达自然回应一次。例如宝宝说 I can running，家长接 Yes, you can run；这次不展开讲语法。</li><li>具体说“你听到 jump 就跳起来了”，比笼统地夸聪明更容易让宝宝知道自己做到了什么。</li><li>不要求拼写、默写或用汉字谐音记发音。发音先跟着点读模仿，家长不会读也能一起听。</li><li>隔天先复现前一天的 2 个词。出现疲倦或抗拒就收尾，下一次从喜欢的主题开始。</li></ul><h3>怎样判断复习到哪一步</h3><p>听到词能指图或做动作 → 愿意模仿 → 能独立说出词或短句。给孩子记录实际做到的一步，不把全部背出来作为唯一目标。星星由家长手动标记，表示这个词条已经认识，不是自动评分。</p><h3>原卷里的英文指令</h3><div class="instruction-glossary">${[['Talk & Tell','看图说一说'],['Point to an image','指一张图'],['Ask','提问'],['Say','说一说'],['Look and say','看图说话'],['Look and choose','看图选答案'],['Vocabulary','词汇'],['Learning Objectives','学习目标'],['Summary','课程总结'],['Scores','得分']].map(([en,zh])=>`<p><b>${en}</b>：${zh}</p>`).join('')}</div><h3>阅读参考</h3><p>短时、经常重复、通过游戏和生活情境练习的思路，可参考 <a href="https://learnenglishkids.britishcouncil.org/parents/helping-your-child/how-start-teaching-kids-english-home" target="_blank" rel="noopener noreferrer">British Council 的家庭英语启蒙建议</a>。这里的 10 天顺序和每天用量，是结合这份试卷提供的复习安排，可按宝宝状态调整。</p><p class="plan-note">网页不录音、不自动评价口语，也不需要填写孩子姓名。点读和“玩过了”的记录只在当前浏览器保存，换设备不会同步。</p><button class="small-button" data-action="resetProgress">清除本机学习记录</button></div>`;}
function render(){document.body.classList.toggle('hide-chinese',!state.chinese);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));$('#workspace').innerHTML=state.view==='parents'?renderParents():state.view==='game'?renderGame():renderLearn();renderNav();persist();positionPracticePanel();prepareLessonAudio();}
function scrollWorkspace(){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;$('.view-tabs').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
function selectLesson(id){stopPlayback();state.lesson=Number(id);state.wordIndex=0;const owner=D.groups.find(g=>g.lessons.includes(state.lesson));if(owner)state.group=owner.id;state.view='learn';game=null;render();}

// One reusable audio element keeps clips exclusive and supports user-initiated mobile playback.
const audio=new Audio();audio.id='lessonAudio';audio.hidden=true;audio.preload='auto';audio.preservesPitch=true;document.body.append(audio);
const audioCache=window.LESSON_AUDIO||{warm:()=>Promise.resolve(false),cancel(){},source:path=>'./'+path};
let serial=0,finishPending=null;
function prepareLessonAudio(){
 if(state.view==='parents'){audioCache.cancel();return;}
 const target=state.view==='game'&&game&&!game.finished?D.lessons.find(l=>l.words.some(w=>w.id===game.questions[game.index].id)):lesson();
 const status=$('#audioReady');if(status)status.textContent='语音准备中…';
 audioCache.warm(target.id).then(ready=>{if(status&&status===$('#audioReady'))status.textContent=ready?'语音已就绪':'点读时加载语音';});
}
function stopPlayback(){serial++;if(finishPending){const done=finishPending;finishPending=null;done(false);}audio.pause();try{audio.currentTime=0;}catch{}audio.dataset.state='idle';if('speechSynthesis'in window)window.speechSynthesis.cancel();$('#playerBar').hidden=true;document.querySelectorAll('.playing').forEach(e=>e.classList.remove('playing'));}
function speechFallback(item,lang,token){return new Promise(resolve=>{if(lang==='en'||token!==serial||!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){resolve(false);return;}const u=new SpeechSynthesisUtterance(item.zh);u.lang='zh-CN';u.rate=state.speed;const voices=window.speechSynthesis.getVoices();const found=voices.find(v=>v.lang.replace('_','-').toLowerCase()==='zh-cn')||voices.find(v=>v.lang.startsWith('zh'));if(found)u.voice=found;finishPending=resolve;u.onend=()=>{finishPending=null;resolve(true);};u.onerror=()=>{finishPending=null;resolve(false);};window.speechSynthesis.speak(u);});}
function clip(item,lang,token){return new Promise(resolve=>{
 if(token!==serial){resolve(false);return;}
 let settled=false;
 const done=value=>{if(settled)return;settled=true;clearTimeout(timer);audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.onwaiting=null;if(value!==true)audio.pause();if(finishPending===done)finishPending=null;resolve(value);};
 finishPending=done;const timer=setTimeout(()=>done(false),25000);
 const source=audioCache.source(item[lang+'Audio']),started=performance.now();
 audio.dataset.source=source.startsWith('blob:')?'prepared':'network';audio.dataset.state='loading';audio.dataset.startDelayMs='';
 if(audio.getAttribute('src')!==source)audio.src=source;else try{audio.currentTime=0;}catch{}
 audio.playbackRate=Number(state.speed);
 const label=(lang==='en'?'英文 · ':'中文 · ')+item[lang];
 $('#playerText').textContent='正在加载语音 · '+item[lang];
 audio.onwaiting=()=>{$('#playerText').textContent='正在加载语音 · '+item[lang];};
 audio.onplaying=()=>{audio.dataset.state='playing';audio.dataset.startDelayMs=String(Math.round(performance.now()-started));$('#playerText').textContent=label;};
 audio.onended=()=>{audio.dataset.state='ended';done(true);};audio.onerror=()=>done('fallback');
 const play=audio.play();if(play)play.catch(err=>{if(token===serial)done(err.name==='NotAllowedError'?'blocked':'fallback');else done(false);});
 });}
function listeningPause(ms,token){return new Promise(resolve=>{if(token!==serial){resolve(false);return;}const done=value=>{clearTimeout(timer);if(finishPending===done)finishPending=null;resolve(value);};const timer=setTimeout(()=>done(token===serial),ms);finishPending=done;});}
async function playItems(items,lang='en',highlight=null){stopPlayback();const token=serial;$('#playerBar').hidden=false;$('#playerText').textContent='正在加载点读音频…';if(highlight)document.querySelector(`[data-word="${highlight}"]`)?.classList.add('playing');let ok=true;for(let i=0;i<items.length;i++){const item=items[i],langs=lang==='both'?['en','zh']:[lang];for(let j=0;j<langs.length;j++){const l=langs[j];if(token!==serial)return;$('#playerText').textContent=(l==='en'?'英文 · ':'中文 · ')+item[l];let result=await clip(item,l,token);if(result==='fallback'&&token===serial)result=await speechFallback(item,l,token);if(result!==true){ok=false;break;}if(j<langs.length-1&&!await listeningPause(500,token))return;}if(!ok)break;if(i<items.length-1&&!await listeningPause(1000,token))return;}if(token!==serial)return;$('#playerBar').hidden=true;document.querySelectorAll('.playing').forEach(e=>e.classList.remove('playing'));if(!ok)toast('暂时无法播放。请检查网络和媒体音量，或用系统浏览器打开后重试。');}

document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.group){stopPlayback();state.group=b.dataset.group;state.lesson=group().lessons[0];state.wordIndex=0;state.playlist=null;game=null;state.view='learn';render();return;}
 if(b.dataset.view){stopPlayback();state.view=b.dataset.view;render();return;}
 if(b.dataset.lesson){selectLesson(b.dataset.lesson);return;}
 if(b.dataset.known){const id=b.dataset.known;known.has(id)?known.delete(id):known.add(id);store.write('known',[...known]);const card=b.closest('.word-card');card?.classList.toggle('known',known.has(id));b.setAttribute('aria-pressed',String(known.has(id)));b.textContent=known.has(id)?'★':'☆';updateProgress();return;}
 if(b.dataset.practice!==undefined){stopPlayback();selectPracticeCard(b.dataset.practice,true);return;}
 if(b.dataset.speech){const kind=b.dataset.speech,index=Number(b.dataset.index);if(kind==='word')selectPracticeCard(index,true);const item=kind==='word'?lesson().words[index]:kind==='sentence'?lesson().sentences[index]:currentPractice()[index]?.[kind==='practice-q'?'question':'answer'];if(item)playItems([item],b.dataset.lang,kind==='word'?item.id:null);return;}
 if(b.dataset.day){stopPlayback();const d=D.plan.find(x=>x.day===Number(b.dataset.day));state.playlist=d;state.lesson=d.lessons[0];state.wordIndex=0;state.group=D.groups.find(g=>g.lessons.includes(state.lesson)).id;state.view='learn';game=null;render();scrollWorkspace();return;}
 if(b.dataset.dayDone){const n=Number(b.dataset.dayDone);daysDone.has(n)?daysDone.delete(n):daysDone.add(n);store.write('days',[...daysDone]);b.closest('.day').classList.toggle('done',daysDone.has(n));b.setAttribute('aria-pressed',String(daysDone.has(n)));b.textContent=daysDone.has(n)?'✓ 今天一起玩过了':'○ 标记今天玩过了';return;}
 if(b.dataset.answer!==undefined&&game&&!game.answered){const chosen=game.choiceWords[Number(b.dataset.answer)];const target=game.questions[game.index];if(chosen.id===target.id){game.answered=true;b.classList.add('correct');document.querySelectorAll('.answer').forEach(el=>el.disabled=true);$('#gameFeedback').textContent=`找到了！${target.en}，${target.zh}。` ;$('#gameNext').hidden=false;$('#gameNext').textContent=game.index===game.questions.length-1?'完成这一轮 ✓':'下一题 →';playItems([target],'both');}else{b.classList.add('retry');$('#gameFeedback').textContent='再听一次，慢慢找。可以请爸爸妈妈一起帮忙。';playItems([target],'en');}return;}
 switch(b.dataset.action){
  case 'word':{selectPracticeCard(b.dataset.index,true);const w=lesson().words[state.wordIndex];playItems([w],state.bilingual?'both':'en',w.id);break;}
  case 'practiceAll':playItems(currentPractice().flatMap(p=>[p.question,p.answer]),state.bilingual?'both':'en');break;
  case 'readAll':playItems(lesson().words,state.bilingual?'both':'en');break;
  case 'exitPlaylist':state.playlist=null;stopPlayback();render();break;
  case 'startGame':stopPlayback();startGame();break;
  case 'gameListen':if(game)playItems([game.questions[game.index]],'en');break;
  case 'gameNext':if(!game?.answered)break;stopPlayback();game.index++;if(game.index>=game.questions.length)game.finished=true;else prepareQuestion();render();break;
  case 'resetProgress':if(confirm('清除当前浏览器的星星和每日复习记录？')){known.clear();daysDone.clear();store.write('known',[]);store.write('days',[]);render();toast('学习记录已清除，可以重新开始。');}break;
 }
});
document.addEventListener('change',e=>{const k=e.target.dataset.setting;if(!k)return;state[k]=k==='speed'?Number(e.target.value):e.target.checked;persist();if(k==='speed')audio.playbackRate=state.speed;else if(k==='chinese')document.body.classList.toggle('hide-chinese',!state.chinese);else if(state.view==='learn'){stopPlayback();render();}});
$('#stopAudio').addEventListener('click',stopPlayback);
$('#beginLearning').addEventListener('click',()=>{state.view='learn';render();scrollWorkspace();});
$('#parentShortcut').addEventListener('click',()=>{stopPlayback();state.view='parents';render();scrollWorkspace();});
$('#audioHelp').addEventListener('click',()=>$('#helpDialog').showModal());
document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>$('#helpDialog').close()));
$('#helpDialog').addEventListener('click',e=>{if(e.target===$('#helpDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('.brand').addEventListener('click',e=>{e.preventDefault();stopPlayback();state.view='learn';state.playlist=null;state.group='move';state.lesson=1;state.wordIndex=0;game=null;render();window.scrollTo({top:0,behavior:'smooth'});});
window.addEventListener('resize',()=>{cancelAnimationFrame(positionPracticePanel.frame);positionPracticePanel.frame=requestAnimationFrame(positionPracticePanel);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
window.addEventListener('pagehide',stopPlayback);
render();
})();
