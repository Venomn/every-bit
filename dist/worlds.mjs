// Small, deterministic teaching worlds. No network, shell, or downloaded code.
export const LAB_KEYS = ['schedule','memory','branch','color','cpu','drivers','files','patch','modem','packets','dns','web','touch','unicode','cloud','learn','message'];
export const LAB_ACTION_LIMIT = 256;
const labRules = {
  schedule: {tick: true, pause: [0,1]}, memory: {address:[0,15], value:[0,255], write:true, read:true},
  branch:{step:true,rule:true}, color:{select:[0,3],paint:[0,15],depth:[1,2]},
  cpu:{step:true}, drivers:{toggle:['keyboard','disk'],key:true,save:true},
  files:{command:'text'}, patch:{fix:true,test:true,share:true},
  modem:{flip:[0,7],send:true,speed:[1,4]}, packets:{deliver:[0,3],drop:[0,3]},
  dns:{name:['book.test','moon.test','missing.test'],lookup:true,move:true,expire:true,visit:true},
  web:{title:'text',path:['/','/moon','/missing'],request:true,follow:true},
  touch:{tap:[0,15]}, unicode:{text:'text',byte:[0,127]},
  cloud:{online:true,edit:['A','B'],sync:['A','B'],resolve:['A','B']},
  learn:{label:['round','long'],sample:[0,5],test:true},
  message:{text:'text',encode:true,send:true,deliver:[0,31],store:true,open:true}
};
export function cleanLabAction(key, event) {
  if (!LAB_KEYS.includes(key) || !event || typeof event !== 'object' || !Object.hasOwn(labRules[key],event.type)) return null;
  const rule=labRules[key][event.type];
  if(rule===true) return {type:event.type};
  if(rule==='text') return typeof event.value==='string'?{type:event.type,value:[...event.value].slice(0,key==='files'?80:24).join('')}:null;
  if(typeof rule[0]==='number') return Number.isInteger(event.value)&&event.value>=rule[0]&&event.value<=rule[1]?{type:event.type,value:event.value}:null;
  return rule.includes(event.value)?{type:event.type,value:event.value}:null;
}
export function cleanLabLogs(raw) {
  const result={};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
  for(const key of LAB_KEYS) if(Array.isArray(raw[key])) result[key]=raw[key].slice(0,LAB_ACTION_LIMIT).map(e=>cleanLabAction(key,e)).filter(Boolean);
  return result;
}
export const utfBytes = text => [...new TextEncoder().encode(text)];
export const byteChunks = text => {const bytes=utfBytes(text);return Array.from({length:Math.ceil(bytes.length/3)},(_,i)=>bytes.slice(i*3,i*3+3));};
export const fruitSamples = [{shape:0,label:'round'},{shape:1,label:'round'},{shape:2,label:'round'},{shape:8,label:'long'},{shape:9,label:'long'},{shape:10,label:'long'}];
export function predictFruit(samples, shape=7) {
  if(!samples.length)return null;
  return [...samples].sort((a,b)=>Math.abs(a.shape-shape)-Math.abs(b.shape-shape)||a.shape-b.shape)[0].label;
}
export function initialLab(key) {
  const common={done:false,feedback:'动手试一试。'};
  const data={
    schedule:{counts:[0,0],paused:[false,false],turn:0,last:-1,ticks:0},
    memory:{cells:Array(16).fill(0),address:0,value:65,written:false,read:false},
    branch:{position:0,rule:false,crashed:false},
    color:{pixels:Array(16).fill(0),selected:1,depth:1,painted:false},
    cpu:{pc:0,phase:0,acc:0,output:null,ir:null,cycles:0},
    drivers:{keyboard:false,disk:false,buffer:'',file:'',blocked:false},
    files:{cwd:'/',dirs:['/','/notes'],files:{'/hello.txt':'HELLO, LINUX!'},output:['输入 help 看命令。'],created:false},
    patch:{fixed:false,tests:null,shared:false,friendFixed:false},
    modem:{bits:[0,1,0,0,0,0,0,1],speed:1,received:null,sentSeconds:null,sentSlow:false,sentFast:false},
    packets:{received:[],dropped:[],arrivals:[],duplicates:0},
    dns:{name:'book.test',cache:{},servers:{'book.test':'192.0.2.1','moon.test':'192.0.2.2'},address:null,moved:false,stale:false},
    web:{title:'我的第一张网页',path:'/',loaded:null,requested:false,followed:false},
    touch:{cell:null,apps:[]}, unicode:{text:'A',selected:0,seen:[]},
    cloud:{online:false,server:{text:'一颗星',rev:1},A:{text:'一颗星',base:1,dirty:false},B:{text:'一颗星',base:1,dirty:false},conflict:null,hadConflict:false,resolved:false,edits:0},
    learn:{label:'round',samples:[],prediction:null,tested:false},
    message:{text:'你好🌱',encoded:false,chunks:[],sent:false,received:[],stored:null,opened:false}
  };
  return {...common,...structuredClone(data[key])};
}
function labPath(cwd,name) {
  if(name==='..')return cwd==='/'?'/':cwd.slice(0,cwd.lastIndexOf('/'))||'/';
  if(name==='/')return '/';
  if(!/^[a-zA-Z0-9_.-]{1,20}$/.test(name)||name==='.'||name==='..')return null;
  return `${cwd==='/'?'':cwd}/${name}`;
}
export function stepLab(key, previous, raw) {
  const action=cleanLabAction(key,raw);if(!action)return previous;
  const s=structuredClone(previous), {type:t,value:v}=action;
  switch(key) {
    case 'schedule':
      if(t==='pause'){s.paused[v]=!s.paused[v];s.feedback=`任务 ${v?'B':'A'} ${s.paused[v]?'暂停':'恢复'}。`;}
      else {let next=s.turn;if(s.paused[next]||s.counts[next]>=8)next=1-next;
        if(s.paused[next]||s.counts[next]>=8){s.last=-1;s.feedback='CPU 空闲：恢复一个未完成的任务吧。';break;}
        s.counts[next]++;s.last=next;s.turn=1-next;s.ticks++;s.feedback=`第 ${s.ticks} 拍：CPU 只帮 ${next?'B':'A'} 做了 1 步。`;
        s.done=s.counts.every(n=>n>=6);}
      break;
    case 'memory':
      if(t==='address')s.address=v;
      if(t==='value')s.value=v;
      if(t==='write'){s.cells[s.address]=s.value;s.written ||= s.address===9&&s.value===65;s.feedback=`已把 ${s.value} 写入地址 ${s.address}。`;}
      if(t==='read'){s.value=s.cells[s.address];s.read=true;s.feedback=`地址 ${s.address} → ${s.value}${s.value===65?' → A':''}`;s.done ||= s.written&&s.address===9&&s.value===65;}
      break;
    case 'branch':
      if(t==='rule'){s.rule=!s.rule;s.feedback=s.rule?'装上规则：前面有石头，就跳过去。':'卸下规则：每次都向前走。';}
      if(t==='step'&&s.position<6){if(s.position===2&&!s.rule){s.crashed=true;s.feedback='撞到石头！现在改变规则，再试一次。';}else{s.position+=s.position===2?2:1;s.feedback=s.position===4?'条件成立 → 跳过石头。':'向前走一步。';s.done=s.position===6;}}
      break;
    case 'color':
      if(t==='select')s.selected=v;
      if(t==='depth')s.depth=v;
      if(t==='paint'){s.pixels[v]=s.selected;s.painted=true;}
      s.feedback=`${s.depth} bit / 像素 → ${2**s.depth} 种颜色。16 个像素需要 ${16*s.depth/8} byte。`;
      s.done ||= s.depth===2&&s.pixels.includes(2)&&s.pixels.includes(3);break;
    case 'cpu': {
      if(s.pc>=4){s.feedback='程序结束。重置可以再看一次。';break;}
      const program=[['LOAD',2],['ADD',3],['OUT',0],['HALT',0]];
      if(s.phase===0){s.ir=program[s.pc];s.feedback=`取指：把地址 ${s.pc} 的 ${s.ir[0]} 放进指令寄存器。`;}
      if(s.phase===1)s.feedback=`译码：${{LOAD:'把 2 放进小盒子',ADD:'给小盒子加 3',OUT:'把小盒子的值送到屏幕',HALT:'停止取下一条'}[s.ir[0]]}。`;
      if(s.phase===2){const [op,arg]=s.ir;if(op==='LOAD')s.acc=arg;if(op==='ADD')s.acc+=arg;if(op==='OUT')s.output=s.acc;s.pc++;s.feedback=`执行 ${op} 完成。`;s.done=s.pc===4&&s.output===5;}
      s.phase=(s.phase+1)%3;s.cycles++;break;
    }
    case 'drivers':
      if(t==='toggle'){s[v]=!s[v];s.feedback=`${v==='disk'?'磁盘':'键盘'}驱动${s[v]?'已接通':'已断开'}。`;}
      if(t==='key'){if(s.keyboard){s.buffer='A';s.feedback='键盘 → 驱动 → 操作系统 → 程序：A';}else{s.blocked=true;s.feedback='键盘有输入，但缺少驱动来读懂它。';}}
      if(t==='save'){if(s.disk&&s.buffer){s.file=s.buffer;s.done=true;s.feedback='程序 → 操作系统 → 磁盘驱动 → 磁盘：A 已保存。';}else{s.blocked=true;s.feedback=s.disk?'先让键盘送来一个 A。':'缺少磁盘驱动，暂时写不进去。';}}
      break;
    case 'files': {
      const text=v.trim(), parts=text.split(/\s+/),cmd=parts.shift(),name=parts.shift();const path=labPath(s.cwd,name||'');
      let out='不认识这条命令。输入 help 看看。';
      if(cmd==='help')out='ls · pwd · cd notes · cd .. · mkdir 名字 · write 名字 内容 · cat 名字';
      if(cmd==='pwd')out=s.cwd;
      if(cmd==='ls'){const prefix=s.cwd==='/'?'/':s.cwd+'/';out=[...s.dirs.filter(p=>p!==s.cwd).map(p=>p+'/'),...Object.keys(s.files)].filter(p=>p.startsWith(prefix)&&!p.slice(prefix.length).replace(/\/$/,'').includes('/')).map(p=>p.slice(prefix.length)).join('   ')||'（空文件夹）';}
      if(cmd==='cd'){if(path&&s.dirs.includes(path)){s.cwd=path;out=path;}else out='找不到这个文件夹。';}
      if(cmd==='mkdir'){if(!path)out='名字请用 1–20 个英文字母、数字、点、横线。';else if(s.dirs.includes(path)||Object.hasOwn(s.files,path))out='这个名字已经存在。';else if(s.dirs.length>=12)out='小磁盘最多放 12 个文件夹。';else{s.dirs.push(path);out='已创建 '+path;}}
      if(cmd==='write'){if(!path||s.dirs.includes(path))out='请选择有效的文件名。';else if(Object.keys(s.files).length>=16&&!Object.hasOwn(s.files,path))out='小磁盘最多放 16 个文件。';else{s.files[path]=parts.join(' ');s.created=true;out='已保存 '+path;}}
      if(cmd==='cat'){if(path&&Object.hasOwn(s.files,path)){out=s.files[path];s.done ||= s.created&&path!=='/hello.txt';}else out='找不到这个文件。';}
      s.output=[...s.output,`${s.cwd} > ${text}`,out].slice(-10);s.feedback=out;break;
    }
    case 'patch':
      if(t==='fix'){s.fixed=!s.fixed;s.tests=null;s.shared=false;s.feedback='修改后，记得重新测试。';}
      if(t==='test'){s.tests=s.fixed;s.feedback=s.fixed?'3 个例子都通过了！可以分享这个修正。':'2+3 得到 -1，测试没通过。';}
      if(t==='share'){if(s.tests===true){s.shared=true;s.friendFixed=s.fixed;s.done=true;s.feedback='你的改动到了朋友的副本里。朋友的 2+3 也等于 5。';}else s.feedback='先让测试通过，再分享。';}break;
    case 'modem':
      if(t==='flip'){s.bits[v]=1-s.bits[v];s.received=null;}
      if(t==='speed')s.speed=v;
      if(t==='send'){s.received=[...s.bits];s.sentSeconds=8/s.speed;if(s.speed===1)s.sentSlow=true;else s.sentFast=true;s.done=s.sentSlow&&s.sentFast;s.feedback=`8 bit ÷ ${s.speed} bit/秒 = ${8/s.speed} 秒（教学慢速）。`;}break;
    case 'packets':
      if(t==='drop'){if(!s.received.includes(v)&&!s.dropped.includes(v))s.dropped.push(v);s.feedback=`包 ${v+1} 丢在路上了，可以重新送。`;}
      if(t==='deliver'){if(s.received.includes(v)){s.duplicates++;s.feedback=`包 ${v+1} 重复了，只保留一份。`;}else{s.received.push(v);s.arrivals.push(v);s.dropped=s.dropped.filter(n=>n!==v);s.feedback=`包 ${v+1} 到达；接收方按编号放回位置。`;}s.done=s.received.length===4;}break;
    case 'dns':
      if(t==='name'){s.name=v;s.address=null;}
      if(t==='lookup'){s.address=s.cache[s.name]||s.servers[s.name]||null;if(s.address)s.cache[s.name]=s.address;s.feedback=s.address?`${s.name} → ${s.address}`:'查无此名；不能连接。';}
      if(t==='move'){s.servers['book.test']='192.0.2.9';s.moved=true;s.feedback='book.test 搬到 192.0.2.9，旧缓存还没过期。';}
      if(t==='expire'){s.cache={};s.address=null;s.feedback='缓存过期。再查一次地址。';}
      if(t==='visit'){if(s.address&&s.address===s.servers[s.name]){s.feedback='找到服务器，连接成功。';s.done ||= s.moved&&s.name==='book.test';}else{s.stale ||= !!s.address;s.feedback=s.address?'地址已经过时。让缓存过期，再查询。':'先查询名字对应的地址。';}}break;
    case 'web':
      if(t==='title'){s.title=v;s.loaded=null;}
      if(t==='path'){s.path=v;s.loaded=null;}
      if(t==='request'){s.loaded=s.path;s.requested=true;s.feedback=s.path==='/missing'?'HTTP 404 · 没找到这一页。':'HTTP 200 · 收到 HTML，可以显示了。';}
      if(t==='follow'&&s.loaded==='/'){s.path='/moon';s.loaded='/moon';s.followed=true;s.done=true;s.feedback='点击链接 → 再发一个请求 → 月球页面。';}break;
    case 'touch':
      s.cell=v;{const app=v<4?'相机':v<8?'音乐':v<12?'地图':'便笺';if(!s.apps.includes(app))s.apps.push(app);s.feedback=`触点 (${v%4}, ${Math.floor(v/4)}) → ${app} 区域 → 打开${app}。`;s.done=s.apps.length===4;}break;
    case 'unicode':
      if(t==='text'){s.text=v;s.selected=0;const length=utfBytes(v).length;if(!s.seen.includes(length)&&length)s.seen.push(length);s.feedback=`${[...v].length} 个 Unicode 码点 → ${length} 个 UTF-8 字节。`;s.done=s.seen.includes(1)&&s.seen.includes(3)&&s.seen.includes(4);}
      if(t==='byte')s.selected=Math.min(v,Math.max(0,utfBytes(s.text).length-1));break;
    case 'cloud':
      if(t==='online'){s.online=!s.online;s.feedback=s.online?'网络接通。可以尝试同步。':'网络断开。本地仍能编辑。';}
      if(t==='edit'){s.edits++;s[v].text=`${v==='A'?'两':'三'}颗星 · 修改 ${s.edits}`;s[v].dirty=true;s.feedback=`设备 ${v} 留下了自己的修改。`;}
      if(t==='sync'){
        if(!s.online){s.feedback='离线：改动留在这台设备，还没送到云端。';break;}
        if(s.conflict){s.feedback='先处理两个版本的冲突。';break;}
        const d=s[v];if(d.dirty&&d.base!==s.server.rev){s.conflict=v;s.hadConflict=true;s.feedback='两个版本都变了！请选择保留哪一份。';}
        else {if(d.dirty){s.server={text:d.text,rev:s.server.rev+1};}s[v]={text:s.server.text,base:s.server.rev,dirty:false};s.feedback=`设备 ${v} 与云端已同步。`;}
      }
      if(t==='resolve'&&s.conflict&&s.online){s.server={text:s[v].text,rev:s.server.rev+1};s.A={text:s.server.text,base:s.server.rev,dirty:false};s.B={...s.A};s.conflict=null;s.resolved=true;s.feedback=`保留设备 ${v} 的版本，三处现在相同。`;}
      s.done=s.hadConflict&&s.resolved&&s.A.text===s.B.text&&s.A.text===s.server.text;break;
    case 'learn':
      if(t==='label')s.label=v;
      if(t==='sample'){const f=fruitSamples[v];s.samples=s.samples.filter(x=>x.shape!==f.shape);s.samples.push({shape:f.shape,label:s.label});s.prediction=null;}
      if(t==='test'){s.prediction=predictFruit(s.samples);s.tested=true;s.feedback=s.prediction?`这个形状最接近你标注为“${s.prediction==='round'?'圆果':'长果'}”的例子。`:'先给至少一个例子贴标签。';s.done ||= s.samples.some(x=>x.label==='round')&&s.samples.some(x=>x.label==='long')&&!!s.prediction;}break;
    case 'message':
      if(t==='text'){s.text=v;s.encoded=false;s.chunks=[];s.sent=false;s.received=[];s.stored=null;s.opened=false;}
      if(t==='encode'){s.chunks=byteChunks(s.text);s.encoded=true;s.sent=false;s.received=[];s.stored=null;s.opened=false;s.feedback=s.chunks.length?'文字变成字节，再分成小包。':'先写一点内容。';}
      if(t==='send'&&s.encoded&&s.chunks.length){s.sent=true;s.feedback='包出发了。随意选择到达顺序，也可以重复送。';}
      if(t==='deliver'&&s.sent&&v<s.chunks.length){if(!s.received.includes(v))s.received.push(v);s.feedback=`收到 ${s.received.length}/${s.chunks.length} 个不同的包。`;}
      if(t==='store'){if(s.sent&&s.chunks.length&&s.received.length===s.chunks.length){s.stored=s.chunks.flat();s.feedback='按编号拼好，字节已写入远方磁盘。';}else s.feedback='还有包没收到，暂时不能保存完整消息。';}
      if(t==='open'){if(s.stored){s.opened=true;s.done=true;s.feedback='字节 → 解码 → 字形 → 屏幕。你好，又见面了！';}else s.feedback='先把完整消息保存下来。';}break;
  }
  return s;
}
export function replayLab(key, events=[]) {
  return events.reduce((s,event)=>stepLab(key,s,event),initialLab(key));
}
