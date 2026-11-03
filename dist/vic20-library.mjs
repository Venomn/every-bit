import {vicDecode,vicReadPRG} from './vic20.mjs';
export const VIC_STORE='every-bit.vic20.v1';
export const vicDefaultSource='10 PRINT "HELLO, MY COMPUTER!"\n20 PRINT 2+3\n30 GOTO 10';
export function vicRestoreLibrary(raw,legacy={}){
  const base={version:1,draft:vicDefaultSource,name:'我的第一个程序',expanded:false,session:null,works:[]};
  const oldSource=p=>Object.entries(p||{}).sort((a,b)=>+a[0]-b[0]).map(([n,s])=>`${n} ${s}`).join('\n');
  try{
    const data=typeof raw==='string'?JSON.parse(raw):raw;
    if(data?.version!==1){
      const old=oldSource(legacy.program);if(old)base.draft=old;
      const tape=oldSource(legacy.tape?.program);if(tape)base.works.push({id:'legacy-tape',name:legacy.tape.name||'以前的磁带',source:tape,prg:null,expanded:false,date:0});
      return base;
    }
    if(typeof data.draft==='string'&&data.draft.length<=32000)base.draft=data.draft;
    if(typeof data.name==='string')base.name=data.name.slice(0,60);
    base.expanded=data.expanded===true;
    const clean=p=>{
      if(!p||typeof p.prg!=='string'||p.prg.length>40000)return null;
      try{vicReadPRG(vicDecode(p.prg),p.expanded?4609:4097);return {prg:p.prg,expanded:p.expanded===true};}catch{return null;}
    };
    base.session=clean(data.session);
    for(const p of Array.isArray(data.works)?data.works.slice(0,40):[]){
      if(typeof p?.id!=='string'||typeof p?.name!=='string'||typeof p?.source!=='string'||p.source.length>32000)continue;
      const binary=p.prg?clean(p):null;if(p.prg&&!binary)continue;
      base.works.push({id:p.id.slice(0,80),name:p.name.slice(0,60),source:p.source,prg:binary?.prg||null,expanded:p.expanded===true,date:Number.isFinite(p.date)?p.date:0});
    }
  }catch{}
  return base;
}
export const vicStarters=[
  {id:'hello',icon:'↺',title:'一声招呼，无限回声',hint:'把 HELLO 换成你的名字。循环会一直跑，按 STOP 就能停。',source:vicDefaultSource},
  {id:'maze',icon:'╱',title:'让电脑画一条无尽的路',hint:'把 205.5 改成 204.5，迷宫会变成什么？',source:'10 PRINT CHR$(205.5+RND(1));\n20 GOTO 10'},
  {id:'guess',icon:'?',title:'我想了一个秘密数字',hint:'在“对电脑说”里输入猜测。改掉 20，扩大秘密数字的范围。',source:'10 N=INT(RND(1)*20)+1\n20 INPUT "GUESS 1-20";A\n30 IF A<N THEN PRINT "TOO SMALL":GOTO 20\n40 IF A>N THEN PRINT "TOO BIG":GOTO 20\n50 PRINT "YOU GOT IT!"\n60 END'},
  {id:'star',icon:'✳',title:'星星听你的指挥',hint:'点电视后用 A / D 移动，或用屏幕下方的 A / D 键。改掉 42 换个角色。',source:'10 PRINT CHR$(147):S=PEEK(648)*256\n20 X=10:Y=10\n30 POKE S+Y*22+X,42\n40 GET A$:IF A$="" THEN 40\n50 POKE S+Y*22+X,32\n60 IF A$="A" AND X>0 THEN X=X-1\n70 IF A$="D" AND X<21 THEN X=X+1\n80 GOTO 30'},
  {id:'music',icon:'♫',title:'给老电脑一段旋律',hint:'先打开声音。修改 DATA 后面的数字，为它作一首曲子。',source:'10 POKE 36878,10\n20 FOR I=1 TO 8:READ N\n30 POKE 36875,N\n40 FOR T=1 TO 180:NEXT T\n50 NEXT I:POKE 36875,0:END\n60 DATA 195,201,207,209,215,219,223,225'},
  {id:'colors',icon:'▧',title:'改变整台电视的颜色',hint:'这里的 POKE 真的写入 VIC 芯片寄存器。把 31 换成 15 再试。',source:'10 FOR C=0 TO 31\n20 POKE 36879,C\n30 FOR T=1 TO 300:NEXT T\n40 NEXT C\n50 GOTO 10'}
];

export function vicGlyphSource(rows){
 if(rows.length!==8||rows.some(n=>!Number.isInteger(n)||n<0||n>255))throw new Error("字形需要 8 个字节。");
 return '10 PRINT CHR$(147);\n20 FOR I=0 TO 511\n30 POKE 7168+I,PEEK(32768+I):NEXT I\n40 FOR I=0 TO 7:READ B:POKE 7176+I,B:NEXT\n50 POKE 36869,255\n60 FOR J=1 TO 44:PRINT CHR$(65);:NEXT\n70 DATA '+rows.join(',');
}

export function vicWriteLibrary(storage,library,expected){
 const current=storage.getItem(VIC_STORE);
 if(current!==expected)throw new Error("另一页修改了作品。本页暂停自动保存，请先下载备份，再刷新以打开最新作品。");
 const next=JSON.stringify(library);if(next!==current)storage.setItem(VIC_STORE,next);return next;
}
