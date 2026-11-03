import {VIC20_WASM} from './vic20-wasm.mjs';
import {VIC20_ROMS} from './vic20-roms.mjs';

export const VIC_TOKENS = ('END|FOR|NEXT|DATA|INPUT#|INPUT|DIM|READ|LET|GOTO|RUN|IF|RESTORE|GOSUB|RETURN|REM|STOP|ON|WAIT|LOAD|SAVE|VERIFY|DEF|POKE|PRINT#|PRINT|CONT|LIST|CLR|CMD|SYS|OPEN|CLOSE|GET|NEW|TAB(|TO|FN|SPC(|THEN|NOT|STEP|+|-|*|/|^|AND|OR|>|=|<|SGN|INT|ABS|USR|FRE|POS|SQR|RND|LOG|EXP|COS|SIN|TAN|ATN|PEEK|LEN|STR$|VAL|ASC|CHR$|LEFT$|RIGHT$|MID$|GO').split('|');
export const vicDecode = value => Uint8Array.from(atob(value), c=>c.charCodeAt(0));
export const vicEncode = bytes => btoa(Array.from(bytes,c=>String.fromCharCode(c)).join(''));
export function vicInput(text, program=false) {
  const upper=String(text).replace(/\r\n?/g,'\n').toUpperCase();
  const lines=upper.split('\n').filter(line=>line.trim());
  const seen=new Set();
  for(const [index,line] of lines.entries()) {
    if(/[^\x20-\x5F\x61-\x7A{}]/.test(line)) throw new Error(`第 ${index+1} 行：老电脑请用英文字母、数字和英文标点。`);
    if(line.length>88) throw new Error(`第 ${index+1} 行超过 VIC-20 的 88 个字符，请拆成几行。`);
    if(program) {
      const m=line.match(/^\s*(\d+)\s*/);
      if(!m||+m[1]>63999) throw new Error(`第 ${index+1} 行需要 0–63999 之间的行号，例如 10 PRINT "HELLO"。`);
      if(seen.has(+m[1])) throw new Error(`行号 ${+m[1]} 重复了，给它另一个号码。`);
      seen.add(+m[1]);
    }
  }
  if(upper.length>32000) throw new Error('这份笔记太大了，请拆成几个作品。');
  return lines.join('\r')+(lines.length?'\r':'');
}
// Read a linked, tokenized BASIC program. Validation happens before any RAM write.
export function vicReadPRG(bytes, expectedStart) {
  if(!(bytes instanceof Uint8Array)||bytes.length<4||bytes.length>28674) throw new Error('这不是完整的 VIC-20 BASIC PRG 文件。');
  const start=bytes[0]+256*bytes[1];
  if((start===4097&&start+bytes.length-2>7680)||(start===4609&&start+bytes.length-2>32768))throw new Error('PRG 超出了这台电脑的 BASIC 内存。');
  if(expectedStart!==undefined&&start!==expectedStart) throw new Error(`程序起点是 $${start.toString(16)}，与这台电脑的内存配置不同。请切换内存后重试。`);
  if(start!==4097&&start!==4609) throw new Error('目前作品盒支持 BASIC PRG（未扩展或 24K 扩展），不载入磁带、卡带和任意机器码文件。');
  let offset=2, previous=-1;const lines=[];
  while(offset+1<bytes.length) {
    const next=bytes[offset]+256*bytes[offset+1];
    if(!next) {
      if(offset+2!==bytes.length) throw new Error('PRG 尾部有无法识别的数据。');
      return {start,end:start+bytes.length-2,source:lines.join('\n')};
    }
    const target=next-start+2;
    if(target<=offset+4||target>bytes.length-2||bytes[target-1]!==0) throw new Error('PRG 的行链接损坏，原来的作品没有被替换。');
    const number=bytes[offset+2]+256*bytes[offset+3];
    if(number<=previous||number>63999) throw new Error('PRG 的行号无效。');
    previous=number;let quote=false, rem=false, data=false, code='';
    for(let i=offset+4;i<target-1;i++) {
      const c=bytes[i];
      if(c===34)quote=!quote;
      if(!quote&&!rem&&c===58)data=false;
      if(!quote&&!rem&&!data&&c>=128&&c<128+VIC_TOKENS.length) {
        code+=VIC_TOKENS[c-128];if(c===143)rem=true;if(c===131)data=true;
      } else if(c>=32&&c<=95)code+=String.fromCharCode(c);
      else code+=`{PET:${c}}`;
    }
    lines.push(`${number} ${code}`);offset=target;
  }
  throw new Error('PRG 缺少结束标记。');
}
export class VIC20 {
  static async create() {
    const result=await WebAssembly.instantiate(vicDecode(VIC20_WASM),{});
    const vic=new VIC20(result.instance.exports);
    new Uint8Array(vic.core.memory.buffer,vic.core.rom_ptr(),20480).set(vicDecode(VIC20_ROMS));
    return vic;
  }
  constructor(core){this.core=core;this.queue=[];this.delay=0;this.expanded=false;this.powered=false;this.typed=0;}
  boot(expanded=false){this.expanded=expanded;this.core.init_machine(expanded?1:0);this.queue=[];this.delay=0;this.powered=true;this.advance(expanded?2000000:1200000);if(expanded)this.advance(1000000);}
  peek(address){return this.core.peek(address);}
  word(address){return this.peek(address)+256*this.peek(address+1);}
  setWord(address,value){this.core.poke_ram(address,value&255);this.core.poke_ram(address+1,value>>8);}
  advance(us=20000){
    if(!this.powered)return;
    // Bounded slices: an infinite 6502 loop never takes control of the browser.
    for(let remaining=Math.min(us,2000000);remaining>0;remaining-=2000){
      this.core.exec_us(Math.min(remaining,2000));this.delay-=2000;
      if(this.queue.length&&this.delay<=0&&this.core.type_character(this.queue[0])) {
        const c=this.queue.shift();this.typed++;this.delay=c===13?100000:2000;
      }
    }
  }
  get busy(){return !!this.queue.length||this.delay>0;}
  type(text){
    if(!this.powered)throw new Error('先按开机键。');
    const input=vicInput(text).replace(/\{PET:(\d{1,3})\}/g,(_,n)=>{
      if(+n>255)throw new Error('PETSCII 字节必须在 0–255 之间。');return String.fromCharCode(+n);
    });
    if(this.queue.length+input.length>33000)throw new Error('电脑还在接收上一段输入，稍等一下。');
    this.queue.push(...Array.from(input,c=>c.charCodeAt(0)));
  }
  key(code,down=true){if(this.powered)this.core[down?'key_down':'key_up'](code);}
  stop(){this.queue=[];this.delay=0;this.core.poke_ram(198,0);this.key(3);this.advance(120000);this.key(3,false);this.advance(120000);}
  release(){this.core.release_keys();}
  loadSource(source,run=true){
    const text=vicInput(source,true); // Validate before reboot/replacement.
    this.boot(this.expanded);this.type('NEW');this.type(text);if(run)this.type('RUN');
  }
  program(){
    if(!this.powered||this.busy)return null;
    const start=this.word(43),end=this.word(45),limit=this.expanded?32768:7680;
    if(![4097,4609].includes(start)||end<start+2||end>limit)return null;
    const bytes=new Uint8Array(end-start+2);bytes[0]=start&255;bytes[1]=start>>8;
    for(let a=start;a<end;a++)bytes[a-start+2]=this.peek(a);
    try{vicReadPRG(bytes,start);return bytes;}catch{return null;}
  }
  loadPRG(bytes){
    const start=this.word(43);const info=vicReadPRG(bytes,start);
    if(info.end>(this.expanded?32768:7680))throw new Error('内存装不下这个作品。可以试试 24K 扩展。');
    this.stop();new Uint8Array(this.core.memory.buffer,this.core.transfer_ptr(),bytes.length).set(bytes);
    if(!this.core.load_prg(bytes.length))throw new Error('PRG 载入失败。');
    for(const p of [45,47,49])this.setWord(p,info.end);
    return info;
  }
  frame(){return new Uint8ClampedArray(this.core.memory.buffer,this.core.render_frame(),232*272*4);}
  audio(){const data=new Float32Array(this.core.memory.buffer,this.core.audio_ptr(),this.core.audio_count()).slice();this.core.audio_clear();return data;}
  screenText(){
    const base=this.peek(648)*256;const rows=[];
    for(let y=0;y<23;y++){
      let line='';for(let x=0;x<22;x++){const c=this.peek(base+y*22+x)&127;line+=c<32?String.fromCharCode(c+64):c<=95?String.fromCharCode(c):'·';}rows.push(line.trimEnd());
    }
    return rows.join('\n');
  }
}
