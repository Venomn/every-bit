import {VIC20,vicInput,vicReadPRG,vicEncode,vicDecode} from './vic20.mjs';
import {VIC_STORE,vicRestoreLibrary,vicDefaultSource,vicStarters,vicWriteLibrary} from './vic20-library.mjs';
const vicEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function vicDeskMarkup(compact=false){
 return `<section id="vic-desk" class="vic-desk ${compact?'vic-compact':''}" aria-label="VIC-20 自由电脑桌">
 <div class="desk-heading"><div><span class="eyebrow">YOUR OWN LITTLE COMPUTER · 1981</span><h2>这台电脑，听你的。</h2></div>${compact?'<a class="plain-link" href="#computer">展开电脑桌 ↗</a>':'<a class="plain-link" href="#read/0">回到故事 ↗</a>'}</div>
 <div class="desk-layout"><div class="desk-machine"><div class="vic-tv"><div class="vic-tv-bezel"><canvas id="vic-screen" width="232" height="272" tabindex="0" aria-label="VIC-20 电视屏幕，点击后可直接使用键盘；Escape 是 RUN/STOP"></canvas><div class="vic-off" id="vic-off">把椅子拉近一点。<br><b>按下开机键，开始玩。</b></div><div class="vic-dials" aria-hidden="true"><i></i><i></i><span>COLOUR<br>TELEVISION</span></div></div><div class="vic-tv-label"><span>COMMODORE <b>VIC-20</b></span><span id="vic-power-led">●</span></div></div><div class="vic-tv-foot"></div>
 <div class="vic-controls"><button class="button primary small-button" data-vic="power" id="vic-power">● 开机</button><button class="button secondary small-button" data-vic="stop">■ RUN/STOP</button><button class="text-button" data-vic="sound" id="vic-sound" aria-pressed="false">♫ 打开声音</button><button class="text-button" data-vic="pause" id="vic-pause">暂停</button></div>
 <div class="vic-keyboard" aria-label="触屏游戏键盘">${[['A',65],['←',8],['↑',11],['↓',10],['→',9],['D',68],['SPACE',32],['RETURN',13],['DEL',1]].map(([label,code])=>`<button class="vic-key" data-vic-key="${code}" aria-label="${label}">${label}</button>`).join('')}</div>
 <details class="vic-full-keyboard"><summary>展开老键盘 · 字母、符号与功能键</summary><div class="old-keyboard">${['1234567890+-','QWERTYUIOP@*','ASDFGHJKL:;','ZXCVBNM,./'].map(row=>`<div>${[...row].map(key=>`<button data-vic-key="${key.charCodeAt(0)}">${key}</button>`).join('')}</div>`).join('')}<div>${[34,40,41,61,36,63].map(code=>`<button data-vic-key="${code}">${vicEsc(String.fromCharCode(code))}</button>`).join('')}${[1,3,5,7].map(n=>`<button data-vic-key="${240+n}">f ${n}</button>`).join('')}</div></div></details><form id="vic-command-form"><label for="vic-command">对电脑说 <span>命令、INPUT 的回答，都可以写在这里</span></label><div class="vic-command-line"><span>›</span><input id="vic-command" aria-label="BASIC 命令或回答" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder='PRINT "HELLO"' maxlength="88"><button type="submit">RETURN ↵</button></div></form>
 <div class="vic-quick">${['PRINT "HELLO"','LIST','RUN','CONT'].map(c=>`<button data-vic-command="${vicEsc(c)}">${vicEsc(c)}</button>`).join('')}</div>
 <p class="vic-status" id="vic-status" role="status">第一次来，先开机。不会写也没关系，下面有几颗灵感种子。</p>
 <details class="vic-screen-reader"><summary>读出屏幕上的文字</summary><pre id="vic-screen-text"></pre></details>
 </div><div class="code-notebook"><div class="notebook-top"><span class="eyebrow">我的代码本</span><span id="vic-save-status">自动保存草稿</span></div><label class="sr-only" for="vic-name">作品名称</label><input id="vic-name" class="vic-name" maxlength="60" placeholder="给作品起个名字"><label for="vic-source" class="code-label">每行前面写个号码。改好后，送进电脑。</label><textarea id="vic-source" spellcheck="false" autocapitalize="characters" autocorrect="off" aria-label="BASIC 程序代码本"></textarea><div class="notebook-actions"><button class="button primary" data-vic="run-source">送进电脑并 RUN ↗</button><button class="button secondary small-button" data-vic="send-source">只送进去</button></div><div class="notebook-tools"><button class="text-button" data-vic="read-machine">从电脑取回代码</button><button class="text-button" data-vic="new">新的一页 ＋</button><button class="text-button" data-vic="save-draft">存代码本</button></div><p class="notebook-tip">代码本是草稿；送进去后，电视里的电脑才会执行。每次送入会重新开机，旧程序会先放进作品盒。</p></div></div>
 <section class="vic-inspiration"><div class="section-heading"><h3>从一个小念头开始。</h3><span>拿来玩，改成你的。</span></div><div class="starter-grid">${vicStarters.map(s=>`<button class="starter-card" data-vic-starter="${s.id}"><span>${s.icon}</span><b>${s.title}</b><small>${s.hint}</small><em>放进代码本 ↗</em></button>`).join('')}</div></section>
 <section class="vic-works"><div class="section-heading"><h3>我的作品盒 <span id="vic-work-count"></span></h3><button class="text-button" data-vic="save-machine">存下电脑里的程序 ＋</button></div><div id="vic-work-list" class="work-list"></div><div class="vic-file-tools"><button class="button secondary small-button" data-vic="export-bas">下载代码本 .bas</button><button class="button secondary small-button" data-vic="export-prg">下载电脑程序 .prg</button><label class="button secondary small-button import-label">打开 .bas / .prg<input type="file" id="vic-import" accept=".bas,.txt,.prg"></label></div><p class="small muted" id="vic-storage-note">作品留在当前浏览器。下载一份，就能带到另一台电脑；清理浏览器会清掉本地作品。</p></section>
 <details class="vic-help"><summary>卡住了？翻翻桌边的小手册 <span>＋</span></summary><div class="manual-grid"><div><h4>三个随时可以试的动作</h4><p>① 改一个数字，再 RUN。② 点电视，直接敲键盘；Shift + 字母可以试图形字符。③ 按 RUN/STOP 停下来，输入 LIST 看代码。</p><p>INPUT 在等你输入一整行并按 RETURN；GET 每次读一个按键，适合游戏。</p></div><div><h4>报错也可以成为线索</h4><p>SYNTAX ERROR：检查英文引号、括号和拼写。UNDEF'D STATEMENT：跳转的行号不存在。OUT OF MEMORY：先保存作品，再尝试扩展内存。</p><p>连 STOP 都没有回应？按“重新开机”。草稿和作品盒还在。</p></div><div><h4>可以动的地方</h4><p>PRINT 显示，FOR / NEXT 重复，IF 判断，INPUT / GET 接收输入，POKE 改内存，PEEK 读内存。还可以写 DATA、数组、子程序和 SYS 机器码。</p><a href="https://museo.inf.uva.es/img/Computadores/VIC-20/Mas/ManualUsuario.pdf" target="_blank" rel="noopener">翻原版 VIC-20 手册 ↗</a></div><div><h4>电脑的设置</h4><label class="vic-memory-label">内存 <select id="vic-memory"><option value="base">原版 · 3583 bytes free</option><option value="expanded">加装 24K 扩展</option></select></label><button class="button secondary small-button" data-vic="reset">重新开机</button><p>更换内存会重启，先把电脑里的程序放进作品盒。声音默认关闭；切到别的页面时电脑暂停。</p></div></div><p class="vic-provenance">此处实际运行 6502、VIA 与 VIC 芯片模拟和原版 BASIC / KERNAL ROM，程序不在网页里解释。作品盒读写真实 BASIC PRG；没有连接磁带机或磁盘机，原机 SAVE / LOAD 会等待设备。芯片实现与许可见 <a href="https://github.com/Venomn/every-bit/tree/main/emulator" target="_blank" rel="noopener">源码与来源</a>。书中后面几章仍是教学模型。</p></details>
 </section>`;
}
export class VICDesk {
 constructor({legacy={},onDiscover=()=>{}}={}){
  this.onDiscover=onDiscover;this.storageOK=true;
  try{this.savedRaw=localStorage.getItem(VIC_STORE);this.library=vicRestoreLibrary(this.savedRaw,legacy);}catch{this.library=vicRestoreLibrary(null,legacy);this.storageOK=false;}
  this.root=null;this.vic=null;this.loading=null;this.frameID=0;this.paused=false;this.sound=false;this.didRun=false;this.lastSave=0;this.lastRead=0;this.audioNodes=new Set();this.pendingPrint=false;this.powerCycled=false;
 }
 persist(capture=true){
  if(capture&&this.vic?.powered){const prg=this.vic.program();if(prg)this.library.session={prg:vicEncode(prg),expanded:this.vic.expanded};}
  try{this.savedRaw=vicWriteLibrary(localStorage,this.library,this.savedRaw??null);this.storageOK=true;}catch(error){this.storageOK=false;this.saveError=error.message;}
  const label=this.root?.querySelector('#vic-save-status');if(label)label.textContent=this.storageOK?'草稿已保存在本机':'保存失败，请下载备份';
  const note=this.root?.querySelector('#vic-storage-note');if(note&&!this.storageOK)note.textContent=this.saveError?.includes('另一页')?this.saveError:'浏览器无法保存（可能空间不足或禁止存储）。请立即下载 .bas 或 .prg 备份，刷新后可能丢失。';
  return this.storageOK;
 }
 say(message){const el=this.root?.querySelector('#vic-status');if(el)el.textContent=message;}
 async ensure(){
  if(!this.loading)this.loading=VIC20.create().then(v=>{this.vic=v;return v;}).catch(e=>{this.loading=null;throw new Error('模拟器没能启动。请使用支持 WebAssembly 的现代浏览器，再按开机重试。');});
  return this.loading;
 }
 async power(restore=true){
  this.say('电视正在亮起来……');const v=await this.ensure();v.boot(this.library.expanded);this.paused=false;this.didRun=false;
  if(restore&&this.library.session){v.boot(this.library.session.expanded);v.loadPRG(vicDecode(this.library.session.prg));this.library.expanded=v.expanded;this.say('欢迎回来。上次的程序已回到内存；输入 RUN 就能继续玩。');}
  else this.say('READY. 电脑准备好了。试着对它说 PRINT "HELLO"。');
  this.onDiscover(0);this.sync();this.persist();
 }
 sync(){
  if(!this.root)return;const powered=!!this.vic?.powered;
  this.root.querySelector('#vic-off').hidden=powered;
  this.root.querySelector('#vic-power').textContent=powered?'○ 关机':'● 开机';
  this.root.querySelector('#vic-power-led').classList.toggle('lit',powered);
  this.root.querySelector('#vic-memory').value=this.library.expanded?'expanded':'base';
  this.root.querySelector('#vic-pause').textContent=this.paused?'继续':'暂停';
  this.root.querySelector('#vic-sound').textContent=this.sound?'♫ 关闭声音':'♫ 打开声音';this.root.querySelector('#vic-sound').setAttribute('aria-pressed',String(this.sound));
 }
 mount(root){
  this.unmount();this.root=root;this.paused=false;
  root.querySelector('#vic-name').value=this.library.name;root.querySelector('#vic-source').value=this.library.draft;
  this.sync();this.renderWorks();this.persist(false);
  root.addEventListener('input',e=>{if(e.target.id==='vic-source')this.library.draft=e.target.value.slice(0,32000);else if(e.target.id==='vic-name')this.library.name=e.target.value;else return;this.persist(false);});
  root.addEventListener('submit',e=>{if(e.target.id==='vic-command-form'){e.preventDefault();this.guard(async()=>{await this.send(root.querySelector('#vic-command').value);root.querySelector('#vic-command').value='';});}});
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
   if(b.dataset.vic)this.guard(()=>this.action(b.dataset.vic));
   if(b.dataset.vicCommand){root.querySelector('#vic-command').value=b.dataset.vicCommand;root.querySelector('#vic-command').focus();}
   if(b.dataset.vicStarter)this.guard(()=>this.starter(b.dataset.vicStarter));
   if(b.dataset.vicOpen)this.guard(()=>this.openWork(b.dataset.vicOpen));
   if(b.dataset.vicDelete)this.guard(()=>this.deleteWork(b.dataset.vicDelete));
   if(b.dataset.vicKey&&e.detail===0&&this.vic?.powered){const code=+b.dataset.vicKey;this.vic.key(code);setTimeout(()=>this.vic?.key(code,false),120);}
  });
  root.addEventListener('change',e=>{if(e.target.id==='vic-import')this.guard(()=>this.importFile(e.target.files[0]));if(e.target.id==='vic-memory')this.guard(async()=>{const expanded=e.target.value==='expanded';if(!this.archiveMachine()) {this.sync();return;}this.library.expanded=expanded;await this.power(false);this.say('内存已更换。旧程序在作品盒里，可以重新载入合适的作品。');});});
  const canvas=root.querySelector('#vic-screen');
  canvas.addEventListener('keydown',e=>{const code=this.keyCode(e);if(code===null||!this.vic?.powered)return;e.preventDefault();if(e.key==='Escape'){this.action('stop');return;}if(!e.repeat)this.vic.key(code);});
  canvas.addEventListener('keyup',e=>{const code=this.keyCode(e);if(code!==null){e.preventDefault();this.vic?.key(code,false);if(/^[a-z]$/i.test(e.key)){this.vic?.key(e.key.toUpperCase().charCodeAt(0),false);this.vic?.key(e.key.toLowerCase().charCodeAt(0),false);}}});
  canvas.addEventListener('blur',()=>this.vic?.release());
  root.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-vic-key]');if(!b||!this.vic?.powered)return;e.preventDefault();b.setPointerCapture(e.pointerId);this.vic.key(+b.dataset.vicKey);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(event,e=>{const b=e.target.closest('[data-vic-key]');if(b)this.vic?.key(+b.dataset.vicKey,false);});
  this.lastTick=performance.now();this.loop();
  if(!this.vic&&this.library.session)this.guard(()=>this.power());
 }
 prepareReset(){
  if(this.vic?.busy)this.vic.stop();
  try{this.archiveMachine();}catch(error){if(!confirm(error.message+'\n仍要重新开机吗？当前内存将丢失，代码本与已有作品会保留。'))throw new Error('没有重启，电脑还停在原处。');}
 }
 keyCode(e){if(e.ctrlKey||e.metaKey||e.altKey)return null;const map={Enter:13,Backspace:1,Delete:1,ArrowLeft:8,ArrowRight:9,ArrowDown:10,ArrowUp:11,Escape:3,F1:241,F2:242,F3:243,F4:244,F5:245,F6:246,F7:247,F8:248};return map[e.key]??(e.key.length===1&&e.key.charCodeAt(0)>=32&&e.key.charCodeAt(0)<=126?(e.shiftKey&&/^[a-z]$/i.test(e.key)?e.key.toLowerCase():e.key.toUpperCase()).charCodeAt(0):null);}
 unmount(){if(!this.root)return;cancelAnimationFrame(this.frameID);this.vic?.release();this.persist();this.silence();this.root=null;}
 hidden(){this.vic?.release();this.silence();this.persist();}
 loop(){
  if(!this.root)return;const now=performance.now();
  if(this.vic?.powered&&!this.paused&&!document.hidden){try{
   this.vic.advance(Math.min(40000,Math.max(0,now-this.lastTick)*1000));
   const c=this.root.querySelector('#vic-screen');c.getContext('2d').putImageData(new ImageData(this.vic.frame(),232,272),0,0);
   this.playAudio(this.vic.audio());
   if(this.vic.busy)this.say(`正在把代码敲进老电脑……还剩 ${this.vic.queue.length} 个字符。RUN/STOP 可中断。`);
   else if(this.wasBusy){this.say('输入送到了。看看电视：它会运行程序，也会用报错告诉你哪里需要修改。');this.persist();}
   this.wasBusy=this.vic.busy;
   if(now-this.lastRead>700){const screen=this.vic.screenText();this.root.querySelector('#vic-screen-text').textContent=screen;this.lastRead=now;if(this.pendingPrint&&!this.vic.busy){if(!screen.includes('?')&&screen.includes('READY.'))this.onDiscover(1);this.pendingPrint=false;}}
  }catch{this.paused=true;this.vic.release();this.silence();this.sync();this.say('电脑卡住了，时间已暂停。代码本还在；打开小手册，按“重新开机”可以重新开始。');}}
  if(now-this.lastSave>1500){this.persist();this.lastSave=now;}
  this.lastTick=now;this.frameID=requestAnimationFrame(()=>this.loop());
 }
 async guard(fn){try{await fn();}catch(e){this.say(e.message||'这次没成功，原来的草稿还在。');}}
 async send(text){if(!text.trim())return;if(!this.vic?.powered)throw new Error('先按开机键，再对电脑说话。');if(this.paused){this.paused=false;this.sync();}vicInput(text);this.vic.type(text);if(/^PRINT\b/i.test(text.trim()))this.pendingPrint=true;if(/^RUN\b/i.test(text.trim()))this.didRun=true;this.say('指令已经送到原机键盘缓冲区。');}
 setDraft(source,name){this.library.draft=source;this.library.name=name;this.root.querySelector('#vic-source').value=source;this.root.querySelector('#vic-name').value=name;this.persist(false);}
 addWork(source,prg=null,name=this.library.name){
  const expanded=this.vic?.powered?this.vic.expanded:this.library.expanded;
  if(this.library.works.some(w=>w.source===source&&w.prg===prg&&w.expanded===expanded))return true;
  if(this.library.works.length>=40)throw new Error('作品盒的 40 个位置满了。先下载并移走一个旧作品，再继续。');
  const work={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,source,prg,name:name.trim()||'未命名作品',expanded,date:Date.now()};
  this.library.works.unshift(work);
  if(!this.persist(false)){this.library.works.shift();throw new Error('浏览器没能保存这份作品。请先下载备份，再进行替换。');}
  this.renderWorks();return true;
 }
 archiveDraft(){return !this.library.draft.trim()||this.addWork(this.library.draft,null,this.library.name);}
 archiveMachine(){
  if(!this.vic?.powered)return true;
  if(this.vic.busy)throw new Error('电脑还在接收代码。等它收完，或者按 RUN/STOP 后再试。');
  const p=this.vic.program();if(!p)throw new Error('目前无法完整读取电脑程序。先尝试 STOP；代码本可以单独下载。');
  if(p.length<=4)return true;return this.addWork(vicReadPRG(p).source,vicEncode(p),this.library.name+' · 电脑');
 }
 starter(id){const s=vicStarters.find(x=>x.id===id);if(!s)return;this.archiveDraft();this.setDraft(s.source,s.title);this.say(s.hint+' 代码本准备好了，按“送进电脑并 RUN”。');this.root.querySelector('#vic-source').focus({preventScroll:true});}
 async action(action){
  switch(action){
   case 'power':if(this.vic?.powered){this.prepareReset();this.vic.release();this.vic.powered=false;this.library.session=null;this.powerCycled=true;this.silence();this.persist(false);this.sync();this.say('电源关了，内存清空。你的代码本和作品盒还在。');}else await this.power();break;
   case 'stop':if(this.vic?.powered){this.paused=false;this.vic.stop();if(this.didRun){this.onDiscover(2);this.didRun=false;}this.sync();this.say('RUN/STOP 已按下。输入 LIST 查看程序，CONT 可以尝试接着运行。');this.persist();}break;
   case 'pause':this.paused=!this.paused;this.silence();this.sync();this.say(this.paused?'时间暂停了，内存还在。按“继续”回到刚才那一刻。':'电脑继续运行。');break;
   case 'run-source':case 'send-source':{
    vicInput(this.library.draft,true);if(!this.library.draft.trim())throw new Error('先在代码本写一行，例如 10 PRINT "HELLO"。');
    this.archiveMachine();const v=await this.ensure();v.expanded=this.library.expanded;v.loadSource(this.library.draft,action==='run-source');this.paused=false;this.didRun=action==='run-source';this.onDiscover(0);this.sync();break;
   }
   case 'reset':this.prepareReset();await this.power(false);this.say('电脑重新开机了。之前的程序在作品盒里，代码本也还在。');break;
   case 'read-machine':{
    if(this.vic?.busy)throw new Error('等代码敲完，再取回来。');const p=this.vic?.program();if(!p)throw new Error('先开机，或按 STOP 后重试。');this.archiveDraft();this.setDraft(vicReadPRG(p).source,this.library.name);this.say('这是从真实程序内存读回的代码。可以修改后再送进去。');break;
   }
   case 'new':this.archiveDraft();this.setDraft('','新的小念头');this.root.querySelector('#vic-source').focus();this.say('旧草稿已放进作品盒。新的空白页，交给你了。');break;
   case 'save-draft':this.addWork(this.library.draft);this.say('代码本已放进作品盒。');break;
   case 'save-machine':this.archiveMachine();this.say('电脑里的程序已存进作品盒；现在可以关机，再打开作品找回来。');break;
   case 'export-bas':this.download(this.library.draft,'bas');this.say('代码本已交给浏览器下载。');break;
   case 'export-prg':{const p=this.vic?.program();if(!p)throw new Error('先开机，等输入结束后再下载电脑程序。');this.download(p,'prg');this.say('真实 BASIC PRG 已交给浏览器下载，可以在兼容模拟器中载入。');break;}
   case 'sound':await this.toggleSound();break;
  }
 }
 renderWorks(){if(!this.root)return;this.root.querySelector('#vic-work-count').textContent=`${this.library.works.length}/40`;
  this.root.querySelector('#vic-work-list').innerHTML=this.library.works.length?this.library.works.map(w=>`<article class="work-card"><span aria-hidden="true">▣</span><div><b>${vicEsc(w.name)}</b><small>${w.prg?'电脑程序 · PRG':'代码本草稿'} · ${w.expanded?'24K 扩展':'原版内存'}</small></div><button class="text-button" data-vic-open="${vicEsc(w.id)}">打开</button><button class="text-button work-delete" data-vic-delete="${vicEsc(w.id)}" aria-label="移走 ${vicEsc(w.name)}">×</button></article>`).join(''):'<p class="empty-works">盒子还是空的。把一个小念头变成程序，再存下来吧。</p>';
 }
 async openWork(id){const w=this.library.works.find(x=>x.id===id);if(!w)return;this.archiveDraft();if(w.prg){this.archiveMachine();const v=await this.ensure();v.boot(w.expanded);v.loadPRG(vicDecode(w.prg));this.paused=false;if(this.powerCycled)this.onDiscover(5);this.powerCycled=false;}
  this.library.expanded=w.expanded;this.setDraft(w.source,w.name);this.sync();this.say(w.prg?'程序回到内存了。输入 LIST 或 RUN，和老朋友再玩一次。':'草稿已打开。按“送进电脑并 RUN”试试。');
 }
 deleteWork(id){const w=this.library.works.find(x=>x.id===id);if(!w)return;if(!confirm(`移走“${w.name}”？需要带走的话，请先打开并下载。当前代码本不会被清空。`))return;this.library.works=this.library.works.filter(x=>x.id!==id);this.persist(false);this.renderWorks();}
 download(data,extension){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:extension==='bas'?'text/plain;charset=utf-8':'application/octet-stream'}));a.href=url;a.download=(this.library.name.replace(/[\\/:*?"<>|]/g,'_').slice(0,50)||'my-program')+'.'+extension;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 async importFile(file){if(!file)return;const mount=this.root;if(file.size>40000)throw new Error('这个文件太大，请选择一个小于 40KB 的 BASIC 源码或 PRG。');
  if(/\.prg$/i.test(file.name)){
   const bytes=new Uint8Array(await file.arrayBuffer());if(this.root!==mount)return;const info=vicReadPRG(bytes);this.archiveDraft();this.archiveMachine();const v=await this.ensure();v.boot(info.start===4609);v.loadPRG(bytes);this.library.expanded=v.expanded;this.setDraft(info.source,file.name.replace(/\.prg$/i,''));this.paused=false;this.sync();this.persist();this.say('PRG 已放进真实内存。输入 RUN，看看它会做什么。');
  }else if(/\.(bas|txt)$/i.test(file.name)){const source=await file.text();if(this.root!==mount)return;vicInput(source,true);this.archiveDraft();this.setDraft(source,file.name.replace(/\.[^.]+$/,''));this.say('源码已放进代码本，还没有运行。');}else throw new Error('请选择 .bas、.txt 或 BASIC .prg 文件。');
 }
 async toggleSound(){if(!this.audioContext){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('这个浏览器暂不支持声音。');this.audioContext=new Audio({sampleRate:44100});}
  await this.audioContext.resume();this.sound=!this.sound;this.silence();this.root.querySelector('#vic-sound').textContent=this.sound?'♫ 关闭声音':'♫ 打开声音';this.root.querySelector('#vic-sound').setAttribute('aria-pressed',String(this.sound));this.say(this.sound?'声音打开了。试试旋律程序。':'声音已关闭。');
 }
 silence(){for(const node of this.audioNodes){try{node.stop();}catch{}}this.audioNodes.clear();this.audioTime=0;}
 playAudio(samples){const c=this.audioContext;if(!this.sound||!c||c.state!=='running'||!samples.length)return;const buffer=c.createBuffer(1,samples.length,44100);buffer.copyToChannel(samples,0);const node=c.createBufferSource();node.buffer=buffer;node.connect(c.destination);this.audioTime=Math.max(this.audioTime||0,c.currentTime+.015);if(this.audioTime>c.currentTime+.25){this.silence();this.audioTime=c.currentTime+.015;}node.start(this.audioTime);this.audioTime+=samples.length/44100;this.audioNodes.add(node);node.onended=()=>this.audioNodes.delete(node);}
}
