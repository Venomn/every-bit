import {BasicMachine, STORAGE_KEY, restoreState, toBits, glyphRows} from './engine.mjs';
import {lessons, eras, sources} from './book.mjs';
import {replayLab, cleanLabAction, LAB_ACTION_LIMIT} from './worlds.mjs';
import {renderLab} from './labs.mjs';
const totalLessons = lessons.length;

const $ = (s, root = document) => root.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageOK = true;
let state;
try {state = restoreState(localStorage.getItem(STORAGE_KEY));} catch {state = restoreState(null); storageOK = false;}
let machine = new BasicMachine(state.program);
let screen = [];
let timer = null;
let loopVisited = false;
let selectedRow = 0;
let rowSelected = false;
let current = -1;
let toastTimer;
let lastFocused;
const boot = ['**** CBM BASIC V2 ****', '', ' 3583 BYTES FREE', '', 'READY.'];
if (state.powered) screen = [...boot];
function save() {
  state.program = {...machine.program};
  try {localStorage.setItem(STORAGE_KEY, JSON.stringify(state));} catch {storageOK = false;}
  $('#storage-note').textContent = storageOK ? '手记和磁带保存在当前浏览器中，不会跨设备同步。' : '当前浏览器无法保存。离开或刷新后，手记和磁带可能丢失。';
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 5000);
}
function complete(index) {
  if (state.completed.includes(index)) return;
  state.completed.push(index); save(); updateProgress();
  toast(`发现 ${index + 1}/${totalLessons}：${lessons[index].takeaway}`);
}
function updateProgress() {
  $('#header-progress').textContent = `${state.completed.length}/${totalLessons}`;
  document.querySelectorAll('[data-lesson-marker]').forEach(el => {const i = +el.dataset.lessonMarker; el.textContent = state.completed.includes(i) ? '✓' : String(i+1).padStart(2,'0'); el.classList.toggle('done',state.completed.includes(i));});
  const foot = $('#lesson-status');
  if (foot && current >= 0) foot.textContent = state.completed.includes(current) ? '✓ 这个发现，已收入手记' : '慢慢试，发现就在你的指尖。';
  const fill = $('#progress-fill'); if(fill) fill.style.width = `${state.completed.length/totalLessons*100}%`;
}

function keyboard(interactive = false) {
  const rows = [['1','2','3','4','5','6','7','8','9','0','+','-','DEL'],['Q','W','E','R','T','Y','U','I','O','P','@','*'],['A','S','D','F','G','H','J','K','L',':',';','RETURN'],['SHIFT','Z','X','C','V','B','N','M',',','.','/','"'],['RUN/STOP','SPACE']];
  return `<div class="keyboard-body"><div class="keyboard-brand"><span class="commodore-mark">C<span>═</span></span> commodore <b>VIC-20</b><i class="power-led ${state.powered?'on':''}"></i><small>POWER</small></div><div class="key-area"><div class="key-main">${rows.map(row=>`<div class="key-row">${row.map(key=>interactive ? `<button type="button" data-key="${esc(key)}" class="key ${key==='SPACE'?'space-key':''} ${key.length>1?'wide-key':''}" aria-label="${key==='SPACE'?'空格':key==='DEL'?'删除':key}">${key==='SPACE'?'':esc(key)}</button>` : `<span class="key ${key==='SPACE'?'space-key':''} ${key.length>1?'wide-key':''}">${key==='SPACE'?'':esc(key)}</span>`).join('')}</div>`).join('')}</div><div class="function-keys" aria-hidden="true"><span>f 1</span><span>f 3</span><span>f 5</span><span>f 7</span></div></div></div>`;
}
function computer({interactive = false, cover = false} = {}) {
  return `<div class="computer-scene ${cover?'cover-computer':''}"><div class="monitor"><div class="monitor-bezel"><div class="crt-border ${cover||state.powered?'is-on':''}"><div class="crt-screen"><pre ${interactive?'id="screen-output"':''} aria-label="模拟电脑屏幕">${esc((cover?boot:screen).join('\n'))}</pre><span class="cursor" aria-hidden="true">▊</span><div class="off-message">等你开机</div></div></div><div class="monitor-side" aria-hidden="true"><div class="tv-dial"></div><div class="tv-dial small-dial"></div><div class="speaker-grille"></div><span>COLOUR<br>TELEVISION</span></div></div><div class="monitor-label"><span>一台家用电视</span><span>●</span></div></div><div class="monitor-stand"></div>${keyboard(interactive)}${cover?'<span class="scene-note">一切，从一个闪烁的光标开始。</span>':''}</div>`;
}
function cover() {
  return `<div class="cover-page"><section class="cover-hero"><div class="cover-copy"><div class="edition"><span class="mini-star">✳</span> TIME TRAVEL, ONE BIT AT A TIME</div><h1>回到电脑<br>等你<span class="marked">发号施令</span><br>的年代<span class="orange-dot">。</span></h1><p class="hero-description">坐到小时候的 Linus 接触过的电脑前。<br>敲下第一行程序，让好奇心带你出发。</p><div class="cover-actions"><a class="button primary" href="#read/${state.completed.length?state.lastLesson:0}">${state.completed.length?'继续我的探索':'翻开第一章'} <span>↗</span></a><a class="plain-link" href="#journey">看看时光目录 <span>↓</span></a></div><div class="cover-meta"><span>给好奇的孩子，也给曾经的孩子</span><span>阅读 + 亲手试一试</span></div></div><div class="hero-art"><div class="orbit-label">HELLO,<br><strong>1980s.</strong></div><span class="art-cross cross-one">✳</span><span class="art-cross cross-two">+</span>${computer({cover:true})}<div class="machine-caption"><span>第一站 / 芬兰 · 赫尔辛基</span><b>COMMODORE VIC-20</b></div></div></section><section class="invitation"><div class="invitation-number">01<span>THE BEGINNING</span></div><div><span class="eyebrow">第一章 · 外祖父的电脑</span><h2>那时，“玩电脑”也可以是<br>亲手写出一个可以玩的东西。</h2><p>读说明书，把程序敲进去，改掉一个数字，看看会发生什么。<br>我们也从这里开始，一点一点理解屏幕背后的世界。</p></div><a href="#read/0" class="round-link" aria-label="进入第一章">↗</a></section><section class="chapter-preview"><div class="section-heading"><h2>五个时代，23 次亲手发现</h2><span>不用先读懂。点一下，就开始。</span></div><div class="era-cards">${eras.map((e,i)=>`<a class="era-card" href="#read/${e.start}"><span class="era-card-icon">${e.icon}</span><span class="eyebrow">0${i+1} / ${e.year}</span><h3>${e.title}</h3><p>${e.machine}</p><b>${state.completed.filter(n=>n>=e.start&&n<e.end).length}/${e.end-e.start} 个发现 ↗</b></a>`).join('')}</div></section><section class="next-teaser"><span class="eyebrow">从 HELLO 到你好</span><h2>机器变了。好奇心一直在。</h2><p>拨时钟、接线路、送数据包。走到今天，再回头认出熟悉的每一个 bit。</p><a class="plain-link" href="#journey">展开全书时光目录 ↗</a></section></div>`;
}
function journey() {
  return `<section class="journey-page"><a class="back-link" href="#cover">← 回到封面</a><div class="journey-title"><span class="eyebrow">THE JOURNEY / 时光目录</span><h1>和电脑一起，<br>慢慢长大。</h1><p>5 个时代 · 23 个实验。每次玩一小节，也可以随时跳到好奇的地方。</p></div><div class="timeline">${eras.map((e,i)=>`<article class="era current-era"><div class="era-date">${e.year}<span class="timeline-dot"></span></div><div class="era-content"><span class="era-state">已发现 ${state.completed.filter(n=>n>=e.start&&n<e.end).length} / ${e.end-e.start}</span><h2>${e.title}</h2><span class="era-machine">${e.machine}</span><p>${e.text}</p><div class="era-lessons">${lessons.slice(e.start,e.end).map((l,j)=>`<a href="#read/${e.start+j}"><span>${state.completed.includes(e.start+j)?'✓':'○'}</span>${l.short} ↗</a>`).join('')}</div></div><span class="era-index" aria-hidden="true">0${i+1}</span></article>`).join('')}</div><div class="editor-note"><details><summary>给同行的大人 · 历史、故事与模型</summary><p>前几站以 Linus 本人的机器经历为线索；从互联网到今天，镜头转向更广的计算机世界。年代是叙事背景，不表示各个概念都在那时首次发明。每页展开项说明史料出处与模型边界。</p><p>情境插画、练习程序与小游戏均为本书创作，不声称复原人物原话或家中布置。所有实验在当前浏览器内运行；“分享”“联网”“云端”都是教学模拟。</p><div class="sources">${Object.values(sources).map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`).join('')}</div></details></div><a href="#ending" class="plain-link">去最后一页 · 看看我的旅程 ↗</a></section>`;
}

function sidebar() {
  const chapter=lessons[current].chapter, era=eras[chapter];
  return `<aside class="reader-sidebar"><a class="back-link" href="#journey">← 时光目录</a><div class="sidebar-chapter"><span class="eyebrow">CHAPTER 0${chapter+1}</span><h2>${era.title}</h2><span>${era.year} / ${era.machine}</span></div><nav aria-label="本章小节">${lessons.slice(era.start,era.end).map((l,j)=>{const i=era.start+j;return `<a href="#read/${i}" ${current===i?'aria-current="step"':''}><span data-lesson-marker="${i}">${String(i+1).padStart(2,'0')}</span>${l.short}${current===i?'<b>→</b>':''}</a>`;}).join('')}</nav><div class="sidebar-bottom"><span>一点一点，认识每一个 bit。</span><div class="progress-track"><i id="progress-fill"></i></div><div class="era-dots">${eras.map((e,i)=>`<a href="#read/${e.start}" aria-label="第 ${i+1} 章 ${e.title}" ${chapter===i?'aria-current="true"':''}>0${i+1}</a>`).join('')}</div></div></aside>`;
}

function labHeader(label, name) {return `<div class="lab-heading"><span><i></i> ${label}</span><b>${name}</b></div>`;}
function terminalLab() {
  return `${labHeader('年代实验室','COMMODORE VIC-20')}<div class="lab-computer">${computer({interactive:true})}</div><div class="machine-toolbar"><button class="button small-button ${state.powered?'secondary':'primary'}" id="power-button" data-action="power">${state.powered?'关机（清空内存）':'● 按下开机键'}</button><button class="button small-button secondary" data-action="stop" id="stop-button" ${machine.running?'':'disabled'}>■ RUN/STOP</button><span class="machine-status" id="machine-status">${state.powered?'READY · 等待指令':'POWER OFF'}</span></div><form id="command-form"><label for="command">输入 BASIC 指令 <span>按 Enter / RETURN 执行</span></label><div class="command-line"><span aria-hidden="true">›</span><input id="command" type="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" maxlength="80" placeholder='PRINT "HELLO"' ${state.powered?'':'disabled'} aria-describedby="command-feedback"><button type="submit" ${state.powered?'':'disabled'}>RETURN ↵</button></div></form><p id="command-feedback" class="command-feedback" role="status">${state.powered?'光标准备好了，试着和它说句话。':'先开机，再敲下第一行命令。'}</p>${current===2?'<div class="sample-program"><div><span class="eyebrow">把这段程序送进电脑</span><code>10 PRINT "HELLO"<br>20 GOTO 10</code></div><button class="button small-button secondary" data-action="insert-loop">填入两行程序 ↗</button></div>':''}${current===5?tapeLab():''}<div class="command-chips"><span>试一试</span><button data-command='PRINT "HELLO"'>PRINT "HELLO"</button><button data-command="PRINT 2+3">PRINT 2+3</button><button data-command="LIST">LIST</button><button data-command="RUN">RUN</button></div><details class="lab-help"><summary>可以输入哪些命令？</summary><p>支持 PRINT "文字"、PRINT 2+3*4、PRINT CHR$(65)、LET A=5、PRINT A、带行号的指令、GOTO、RUN、STOP、LIST、NEW、SAVE "HELLO"、LOAD "HELLO"。输入行号本身会删除那一行。</p><p>这是放慢速度的 BASIC 教学模拟。请用英文字符；暂不支持完整 BASIC、游戏载入、硬件 POKE 或中文显示。</p></details><p class="simulation-note">情境插画与 BASIC 教学模拟 · 非完整硬件仿真</p>`;
}
function tapeLab() {
  return `<div class="tape-panel"><div class="cassette" aria-hidden="true"><span>EVERY BIT · DATA</span><div class="tape-window"><i></i><b>╱╲╱╲</b><i></i></div><strong>${esc(state.tape?.name || 'BLANK TAPE')}</strong></div><div class="tape-copy"><h3>你的第一盘程序磁带</h3><p id="tape-status">${state.tape?`已录制 ${esc(state.tape.name)} · ${Object.keys(state.tape.program).length} 行程序`:'磁带还是空白的。'}</p><div class="tape-buttons"><button class="text-button" data-action="prepare-tape">① 准备程序</button><button class="text-button" data-action="save-tape">② SAVE</button><button class="text-button" data-action="load-tape">③ LOAD</button></div><small>保存后记得关机、开机，再 LOAD。</small></div></div>`;
}
function bitsLab() {
  return `${labHeader('拆开看看','ONE BYTE / 8 BITS')}<div class="bits-intro"><span class="eyebrow">把这些开关拨到 65</span><h3>点一下，就是一个 bit。</h3><p>亮着的开关贡献自己的分量，熄灭的贡献 0。</p></div><div class="bit-switches">${Array.from({length:8},(_,i)=>{const weight=128>>i;const on=!!(state.bits&weight);return `<div class="bit-column"><span>${weight}</span><button data-bit="${i}" aria-label="分量 ${weight} 的比特" aria-pressed="${on}" class="bit-switch ${on?'active':''}"><i></i><b>${on?1:0}</b></button></div>`;}).join('')}</div><div class="bit-sum" id="bit-sum"></div><div class="byte-readout"><div><span>二进制</span><strong id="binary-readout"></strong></div><b>→</b><div><span>数字</span><strong id="decimal-readout"></strong></div><b>→</b><div class="letter-result"><span>PETSCII 大写字母</span><strong id="letter-readout"></strong></div></div><div class="bit-feedback" role="status" id="bit-feedback"></div><div class="lab-bottom-actions"><button class="button small-button secondary" data-action="reset-bits">全部归零</button><span>目标提示：64 + 1</span></div><div class="margin-note"><span>✳</span><p>数字本身没有“字母”的意思。<br>是大家约定的编码，让 65 和 A 对上了号。</p></div>`;
}
function pixelLab() {
  return `${labHeader('拆开看看','8 × 8 PIXEL STUDIO')}<div class="bits-intro"><span class="eyebrow">画一个属于你的像素朋友</span><h3>每个小方格，都算数。</h3><p>点亮或熄灭一个点，再选一行看看它的数字。</p></div><div class="pixel-studio"><div class="pixel-grid" role="group" aria-label="8乘8像素画布">${state.pixels.map((v,i)=>`<button data-pixel="${i}" aria-label="第 ${Math.floor(i/8)+1} 行第 ${i%8+1} 列" aria-pressed="${!!v}" class="pixel ${v?'lit':''}"></button>`).join('')}</div><div class="pixel-data"><span class="eyebrow">每一行 = 1 BYTE</span>${glyphRows(state.pixels).map((n,i)=>`<button data-row="${i}" class="pixel-row ${selectedRow===i?'selected':''}" aria-pressed="${selectedRow===i}"><span>${i+1}</span><code>${toBits(n)}</code><b>${n}</b></button>`).join('')}</div></div><div id="pixel-explanation" class="pixel-explanation" role="status"></div><div class="lab-bottom-actions"><button class="button small-button secondary" data-action="clear-pixels">清空画布</button><span>64 个点 = 64 bit = 8 byte</span></div><p class="simulation-note">单色字形教学模型 · 不包含颜色或文件头的空间</p>`;
}
function reader() {
  const l=lessons[current], era=eras[l.chapter], isEnd=current===era.end-1;
  return `<div class="reader-layout era-theme-${l.chapter}">${sidebar()}<article class="reader-content"><div class="reader-topline"><span>${era.year} <i></i> ${era.machine}</span><span>第 ${current-era.start+1} / ${era.end-era.start} 节</span></div><div class="reading-spread"><div class="story-column"><span class="eyebrow">${l.kicker||`CHAPTER 0${l.chapter+1} / 亲手试一试`}</span><h1>${l.title.replace('\n','<br>')}</h1><p class="story-intro">${l.intro}</p><div class="mission"><span class="mission-star">✳</span><div><span class="eyebrow">你的挑战</span><p>${l.task}</p></div></div><details class="deeper"><summary>为什么会这样？ <span>+</span></summary>${l.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<p>${l.deeper}</p></details><details class="source-details"><summary>年代与资料 ↗</summary><div class="sources">${l.source.map(s=>`<a href="${sources[s].url}" target="_blank" rel="noopener noreferrer">${sources[s].label} ↗</a>`).join('')}</div></details></div><section class="lab ${l.lab?'world-lab':''}" aria-label="${l.short}互动实验">${l.lab?labHeader('年代实验室',era.machine)+`<div id="world-content">${renderLab(l.lab,replayLab(l.lab,state.labs[l.lab]))}</div>`:current===3?bitsLab():current===4?pixelLab():terminalLab()}</section></div><div class="lesson-footer"><div><span id="lesson-status"></span><p>${l.takeaway}</p></div><div class="lesson-pagination">${current>0?`<a class="previous" href="#read/${current-1}" aria-label="上一节">←</a>`:''}<a class="button primary" href="${current<totalLessons-1?`#read/${current+1}`:'#ending'}">${current===totalLessons-1?'翻到最后一页':isEnd?'进入下一个时代':'下一小节'} →</a></div></div>${isEnd?`<div class="chapter-ending"><span class="eyebrow">这一站，你带走了什么？</span><h2>${['你开始告诉电脑，<br>可以怎么玩。','机器能做更多事。<br>你也能问更多问题。','打开的源码，<br>让好奇心继续传递。','房间很小，<br>网络把世界接了进来。','外形一直变，<br>每一个 bit 都有迹可循。'][l.chapter]}</h2></div>`:''}</article></div>`;
}
function ending() {
  const next=lessons.findIndex((_,i)=>!state.completed.includes(i));
  return `<section class="ending-page"><span class="eyebrow">THE END / 也是新的开始</span><h1>好奇心，<br>是最好的开机键。</h1><div class="ending-bit">0 <span>→</span> 1</div><p>从外祖父的电脑，到口袋里的世界。<br>你已经亲手留下 ${state.completed.length} / ${totalLessons} 个发现。</p><div class="ending-path">${eras.map((e,i)=>`<a href="#read/${e.start}"><span>${e.icon}</span><b>0${i+1}</b><small>${state.completed.filter(n=>n>=e.start&&n<e.end).length}/${e.end-e.start}</small></a>`).join('')}</div><p>电脑的故事还在继续。<br>下一次，你想让它做什么？</p><div class="world-controls">${next>=0?`<a class="button primary" href="#read/${next}">继续一个还没完成的发现 ↗</a>`:'<button class="button primary" id="ending-notebook">翻开我的探索手记 ↗</button>'}<a class="plain-link" href="#journey">重新走一遍时光目录</a></div></section>`;
}
function refreshWorld(focus) {
  const key=lessons[current]?.lab;if(!key)return;
  const model=replayLab(key,state.labs[key]);
  $('#world-content').innerHTML=renderLab(key,model);
  if(model.done)complete(current);
  if(focus){const target=[...document.querySelectorAll('[data-world]')].find(el=>el.dataset.world===focus.type&&el.dataset.value===focus.value);target?.focus({preventScroll:true});}
}
function actWorld(type,value,focus,render=true) {
  const key=lessons[current]?.lab;if(!key)return;
  if(['pause','address','value','select','paint','depth','flip','speed','deliver','drop','tap','byte','sample'].includes(type))value=Number(value);
  const event=cleanLabAction(key,{type,value});if(!event){toast('请输入这个实验允许的值。');return false;}
  const log=state.labs[key]||[];
  if(log.length>=LAB_ACTION_LIMIT){toast('这个实验已经操作 256 次。重置后可以继续，手记里的发现会保留。');return;}
  state.labs[key]=[...log,event];save();if(render)refreshWorld(focus);return true;
}

function route() {
  if (machine.running) {halt(false); toast('离开这一页时，程序已暂停。回到电脑前可再次 RUN。');}
  const hash = location.hash || '#cover';
  const match = hash.match(/^#read\/(\d{1,2})$/);
  current = match && +match[1]<totalLessons ? +match[1] : -1;
  if (current >= 0) {state.lastLesson = current; save();}
  $('#main').innerHTML = current>=0?reader():hash==='#journey'?journey():hash==='#ending'?ending():cover();
  document.body.classList.toggle('reading',current>=0);
  document.body.classList.toggle('large-type',state.largeType);
  document.title = current>=0?`${lessons[current].short} · Every Bit`:'Every Bit · 可以玩的计算机小史';
  updateProgress(); updateScreen(); if(current===3) updateBits(); if(current===4) updatePixels();
  window.scrollTo({top:0,behavior:'instant'});
  $('#main').focus({preventScroll:true});
}
function updateScreen() {
  const pre = $('#screen-output'); if(pre) pre.textContent = screen.slice(-22).join('\n');
  const screenBorder = $('.lab .crt-border'); if(screenBorder) screenBorder.classList.toggle('is-on',state.powered);
  const led = $('.lab .power-led'); if(led) led.classList.toggle('on',state.powered);
  const cmd = $('#command'); if(cmd) cmd.disabled=!state.powered||machine.running;
  const submit = $('#command-form button'); if(submit) submit.disabled=!state.powered||machine.running;
  const stop = $('#stop-button'); if(stop) stop.disabled=!machine.running;
  const power = $('#power-button'); if(power) {power.textContent=state.powered?'关机（清空内存）':'● 按下开机键'; power.classList.toggle('primary',!state.powered);power.classList.toggle('secondary',state.powered);}
  const status = $('#machine-status'); if(status) status.textContent = !state.powered?'POWER OFF':machine.running?`RUNNING · 第 ${machine.currentLine ?? '…'} 行`:'READY · 等待指令';
}
function write(lines) {
  for(const line of lines) {
    if(!line) {screen.push('');continue;}
    for(let i=0;i<line.length;i+=22) screen.push(line.slice(i,i+22));
  }
  screen=screen.slice(-22); updateScreen();
}
function feedback(message) {const el=$('#command-feedback');if(el)el.textContent=message;}
function power() {
  if(state.powered) {
    halt(false); state.powered=false; machine=new BasicMachine();screen=[]; state.tapePowerCycle=!!state.tape;
    feedback('电源关了，程序内存清空了。磁带上的副本还在。');
  } else {state.powered=true;screen=[...boot];feedback('READY. 它在等你的第一句话。');complete(0);}
  save();updateScreen();
}
function halt(user=true) {
  clearInterval(timer);timer=null;
  const running=machine.stop();
  if(running) {write(['BREAK','READY.']);if(user&&loopVisited)complete(2);}
  loopVisited=false; updateScreen();save();
  if(user)feedback('停下来了。改掉第 10 行的文字，再 RUN 试试。');
}
function startRun() {
  clearInterval(timer);loopVisited=false;
  timer=setInterval(()=>{
    const result=machine.step();
    if(result.goto!==undefined&&machine.steps>2) loopVisited=true;
    write(result.output);
    if(result.error) feedback(`程序停在这里：${result.error}。用 LIST 看看，再修改对应行。`);
    if(result.ended) {clearInterval(timer);timer=null;write(['READY.']);save();}
    else if(machine.steps>=80) {halt(false);feedback('教学模式已在 80 步后暂停。可以修改程序，或再次 RUN。');}
    updateScreen();
  },180);
  updateScreen();
}
function command(raw) {
  if(!state.powered) {feedback('先按开机键。');return;}
  if(machine.running) {feedback('先用 RUN/STOP 停下程序。');return;}
  const text=raw.trim().toUpperCase();if(!text)return;
  write([text]);
  const tape=text.match(/^(SAVE|LOAD)\s+"([A-Z0-9 -]{1,12})"$/);
  if(tape) {
    if(tape[1]==='SAVE') {
      if(!Object.keys(machine.program).length) {write(['?NO PROGRAM','READY.']);feedback('内存里还没有程序。先输入带行号的程序，或点“准备程序”。');return;}
      state.tape={name:tape[2],program:{...machine.program}};state.tapePowerCycle=false;
      write(['SAVING '+tape[2],'READY.']);feedback('存好了！按“关机”，再开机，然后 LOAD "'+tape[2]+'"。');
    } else {
      if(!state.tape||state.tape.name!==tape[2]) {write(['?FILE NOT FOUND','READY.']);feedback('这盘磁带没有这个名字的程序。先 SAVE，或者检查文件名。');return;}
      machine=new BasicMachine(state.tape.program);write(['LOADING '+tape[2],'READY.']);
      feedback('程序回到内存了！输入 LIST 查看，或 RUN 运行。');
      if(state.tapePowerCycle){complete(5);state.tapePowerCycle=false;}
    }
    save(); const panel=$('.tape-panel');if(panel)panel.outerHTML=tapeLab();updateScreen();return;
  }
  const result=machine.input(text);write(result.output);
  if(result.printed&&!result.error) {complete(1);feedback('它回应你了！改改引号里的文字，或者让它算一道题。');}
  else if(result.error) feedback(`没关系，再试一次。${result.error==='SYNTAX ERROR'?'检查拼写、英文引号和括号。':result.error}`);
  else if(result.stored) feedback('已记住这一行。输入 LIST 查看，输入 RUN 运行。');
  else if(result.cleared) feedback('程序已清空。你可以重新输入一段程序。');
  else feedback(result.started?'程序开始运行了，随时可以按 RUN/STOP。':'READY. 可以继续输入。');
  if(result.started)startRun();else if(!result.stored)write(['READY.']);
  save();updateScreen();
}
function insertLoop() {
  if(!state.powered)power();
  halt(false);command('10 PRINT "HELLO"');command('20 GOTO 10');
  feedback('两行程序已经放进内存。输入 RUN，然后按 RUN/STOP 停下来。');
}
function updateBits() {
  const bits=toBits(state.bits);
  document.querySelectorAll('[data-bit]').forEach(el=>{const on=bits[+el.dataset.bit]==='1';el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));$('b',el).textContent=on?'1':'0';});
  $('#binary-readout').textContent=bits;$('#decimal-readout').textContent=state.bits;
  $('#letter-readout').textContent=state.bits>=65&&state.bits<=90?String.fromCharCode(state.bits):'—';
  const terms=Array.from({length:8},(_,i)=>128>>i).filter(n=>state.bits&n);
  $('#bit-sum').textContent=`${terms.length?terms.join(' + '):'没有亮着的开关'} = ${state.bits}`;
  $('#bit-feedback').textContent=state.bits===65?'你找到 A 了！01000001 → 65 → A。':state.bits>=65&&state.bits<=90?`你找到了 ${String.fromCharCode(state.bits)}。再试试 A 的号码 65。`:'这里先显示 65–90 对应的大写字母。其他数值也有各自的编码含义。';
}
function updatePixels() {
  const rows=glyphRows(state.pixels);
  document.querySelectorAll('[data-pixel]').forEach(el=>{const v=!!state.pixels[+el.dataset.pixel];el.classList.toggle('lit',v);el.setAttribute('aria-pressed',String(v));});
  document.querySelectorAll('[data-row]').forEach(el=>{const row=+el.dataset.row;el.classList.toggle('selected',row===selectedRow);el.setAttribute('aria-pressed',String(row===selectedRow));$('code',el).textContent=toBits(rows[row]);$('b',el).textContent=rows[row];});
  $('#pixel-explanation').textContent=`第 ${selectedRow+1} 行：${toBits(rows[selectedRow])} → ${rows[selectedRow]}。全画布已点亮 ${state.pixels.reduce((a,b)=>a+b,0)} 个点。`;
  if(rowSelected&&state.pixels.reduce((a,b)=>a+b,0)>=8)complete(4);
}
function notebook() {
  lastFocused=document.activeElement;
  $('#notebook-content').innerHTML=`<p class="notebook-summary">${state.completed.length===totalLessons?'整本书的 23 个发现，你都亲手试过了！':`已经收集 ${state.completed.length} / ${totalLessons} 个小发现。`}</p><div class="notebook-list">${lessons.map((l,i)=>`<a href="#read/${i}" data-notebook-link><span class="note-check ${state.completed.includes(i)?'done':''}">${state.completed.includes(i)?'✓':'○'}</span><div><b>${l.short}</b><p>${state.completed.includes(i)?l.takeaway:'去这一页，亲手试一试。'}</p></div><span>↗</span></a>`).join('')}</div>`;
  save();$('#notebook').showModal();
}
document.addEventListener('click',e=>{
  const t=e.target.closest('button,a');if(!t)return;
  if(t.classList.contains('skip-link')) {e.preventDefault();$('#main').focus();$('#main').scrollIntoView();return;}
  if(t.id==='notebook-button'||t.id==='ending-notebook')notebook();
  if(t.hasAttribute('data-world')){
    if(t.dataset.world==='write'&&lessons[current]?.lab==='memory'){
      const input=$('.byte-input'), value=Number(input.value);
      if(input.value===''||!Number.isInteger(value)||value<0||value>255){toast('字节请输入 0 到 255 之间的整数。');input.focus();return;}
      const model=replayLab('memory',state.labs.memory);
      if(model.value!==value&&!actWorld('value',value,null,false))return;
    }
    actWorld(t.dataset.world,t.dataset.value,{type:t.dataset.world,value:t.dataset.value});return;
  }
  if(t.hasAttribute('data-world-reset')){const key=lessons[current]?.lab;if(key){state.labs[key]=[];save();refreshWorld();}return;}
  if(t.matches('[data-close-dialog],[data-notebook-link]'))$('#notebook').close();
  if(t.id==='font-toggle') {state.largeType=!state.largeType;document.body.classList.toggle('large-type',state.largeType);t.setAttribute('aria-pressed',String(state.largeType));save();}
  if(t.dataset.command) {if(!state.powered) {feedback('先按开机键，就可以输入指令了。');return;}const input=$('#command');input.value=t.dataset.command;input.focus();}
  if(t.dataset.key) {
    if(!state.powered||machine.running){feedback(!state.powered?'先按开机键。':'先按 RUN/STOP 停下来。');if(t.dataset.key==='RUN/STOP')halt();return;}
    const input=$('#command');const key=t.dataset.key;
    if(key==='RETURN') {command(input.value);input.value='';}
    else if(key==='RUN/STOP')halt();
    else if(key==='SHIFT') {feedback('教学键盘直接使用大写字母；引号有单独的按键。');}
    else if(key==='DEL')input.value=input.value.slice(0,-1);
    else if(input.value.length<80)input.value+=key==='SPACE'?' ':key;
  }
  if(t.hasAttribute('data-bit')) {state.bits^=128>>+t.dataset.bit;save();updateBits();if(state.bits===65)complete(3);}
  if(t.hasAttribute('data-pixel')) {const i=+t.dataset.pixel;state.pixels[i]=1-state.pixels[i];selectedRow=Math.floor(i/8);save();updatePixels();}
  if(t.hasAttribute('data-row')) {selectedRow=+t.dataset.row;rowSelected=true;updatePixels();}
  switch(t.dataset.action) {
    case 'power':power();break;
    case 'stop':halt();break;
    case 'insert-loop':insertLoop();break;
    case 'reset-bits':state.bits=0;save();updateBits();break;
    case 'clear-pixels':state.pixels.fill(0);save();updatePixels();break;
    case 'prepare-tape':if(!state.powered)power();halt(false);if(Object.keys(machine.program).length){feedback('内存已有程序，直接 SAVE 就能保存。');}else{command('10 PRINT "HELLO"');command('20 PRINT "I AM BACK"');feedback('两行程序准备好了，点 SAVE 存入磁带。');}break;
    case 'save-tape':command('SAVE "HELLO"');break;
    case 'load-tape':command(`LOAD "${state.tape?.name||'HELLO'}"`);break;
  }
});
document.addEventListener('change',e=>{if(e.target.hasAttribute('data-world-input')){
  const value=Number(e.target.value);
  if(e.target.value!==''&&actWorld(e.target.dataset.worldInput,value,null,false)){const code=$('.big-code');if(code)code.textContent=`${toBits(value)} = ${value}${value===65?' = A':''}`;}
  else {e.target.value=replayLab(lessons[current].lab,state.labs[lessons[current].lab]).value;toast('字节请输入 0 到 255 之间的整数。');}
}});
document.addEventListener('submit',e=>{if(e.target.hasAttribute('data-world-form')){e.preventDefault();actWorld(e.target.dataset.worldForm,new FormData(e.target).get('value'));return;}if(e.target.id==='command-form'){e.preventDefault();const input=$('#command');command(input.value);input.value='';}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&machine.running){e.preventDefault();halt();}});
$('#notebook').addEventListener('close',()=>lastFocused?.isConnected&&lastFocused.focus());
$('#notebook').addEventListener('click',e=>{if(e.target===$('#notebook')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
window.addEventListener('hashchange',route);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&machine.running){halt(false);feedback('切换到后台时，教学程序已暂停。输入 RUN 可以重来。');}});
window.addEventListener('pagehide',()=>{halt(false);save();});
$('#font-toggle').setAttribute('aria-pressed',String(state.largeType));
route();save();
