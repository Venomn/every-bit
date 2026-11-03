import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {VIC20,vicReadPRG,vicInput,vicEncode,vicDecode} from '../dist/vic20.mjs';
import {VIC20_WASM} from '../dist/vic20-wasm.mjs';
import {VIC20_ROMS} from '../dist/vic20-roms.mjs';
import {vicRestoreLibrary,vicStarters,vicGlyphSource,vicWriteLibrary} from '../dist/vic20-library.mjs';
const advance=(v,seconds=3)=>{for(let t=0;t<seconds*50;t++)v.advance(20000);};
const make=async(expanded=false)=>{const v=await VIC20.create();v.boot(expanded);return v;};
const run=(v,source,seconds=5)=>{v.loadSource(source);advance(v,seconds);};

test('pinned ROM identity and a WASM core with no host imports',()=>{
 const rom=vicDecode(VIC20_ROMS);
 assert.deepEqual([rom.slice(0,4096),rom.slice(4096,12288),rom.slice(12288)].map(b=>createHash('sha256').update(b).digest('hex')),[
 'bda280726cfe069ca70ef5e2f2d95a29f69d3950c859a12e6979464963fcf502',
 '8be2d882e0eeb1c6923a43660236ea69d43ca8a3bd0613b1b6c910601584fbed',
 'ff6d1416b91a71f5240a5bb8adc9fdc1b955374c48322ca47b3e436334f168fb']);
 assert.deepEqual(WebAssembly.Module.imports(new WebAssembly.Module(vicDecode(VIC20_WASM))),[]);
});
test('ROM boots in both actual memory configurations',async()=>{
 const v=await make();assert.match(v.screenText(),/3583 BYTES FREE/);assert.equal(v.word(43),4097);
 v.boot(true);assert.match(v.screenText(),/28159 BYTES FREE/);assert.equal(v.word(43),4609);
 assert.equal(v.frame().length,232*272*4);assert.ok(new Set(new Uint32Array(v.frame().buffer,v.frame().byteOffset,232*272)).size>=3);
});
test('ROM executes freely written FOR/NEXT, DIM, READ/DATA, IF and GOSUB',async()=>{
 const v=await make();run(v,'10 DIM A(3):S=0\n20 FOR I=1 TO 3:READ A(I):S=S+A(I):NEXT I\n30 IF S=42 THEN GOSUB 100\n40 END\n100 PRINT "ANSWER";S:RETURN\n200 DATA 10,12,20');
 assert.match(v.screenText(),/ANSWER 42/);assert.doesNotMatch(v.screenText(),/ERROR/);
 assert.match(vicReadPRG(v.program()).source,/200 DATA 10,12,20/);
});
test('INPUT consumes typed answer; physical GET accepts a real key press',async()=>{
 const v=await make();run(v,'10 INPUT "NAME";N$\n20 PRINT "HI ";N$',2);v.type('LINUS');advance(v);assert.match(v.screenText(),/HI LINUS/);
 run(v,'10 GET A$:IF A$="" THEN 10\n20 PRINT "KEY=";A$',2);v.key(65);advance(v,.15);v.key(65,false);advance(v,.4);assert.match(v.screenText(),/KEY=A/);
});
test('POKE changes real screen RAM, VIC registers and rendered frame',async()=>{
 const v=await make();const before=v.frame().slice();v.type('POKE 7680,42:POKE 36879,26');advance(v);
 assert.equal(v.peek(7680),42);assert.equal(v.peek(36879),26);assert.notDeepEqual(v.frame(),before);
});
test('tone program produces nonconstant audio samples from the VIC chip',async()=>{
 const v=await make();v.type('POKE 36878,15:POKE 36875,210');advance(v,1);v.audio();advance(v,.1);
 const sound=v.audio();assert.ok(sound.length>1000);assert.ok(Math.max(...sound)-Math.min(...sound)>.01);
});
test('SYS executes arbitrary user 6502 machine code, beyond BASIC interpretation',async()=>{
 const v=await make();run(v,'10 FOR I=0 TO 5:READ A:POKE 828+I,A:NEXT\n20 SYS 828\n30 PRINT PEEK(5120)\n40 DATA 169,42,141,0,20,96');
 assert.equal(v.peek(5120),42);assert.match(v.screenText(),/ 42/);
});
test('infinite programs exceed 80 iterations, STOP interrupts, CONT resumes',async()=>{
 const v=await make();run(v,'10 A=A+1:POKE 5120,A AND 255:GOTO 10',4);const first=v.peek(5120);advance(v,1);assert.notEqual(v.peek(5120),first);
 v.stop();advance(v,.2);assert.match(v.screenText(),/BREAK IN 10/);const stopped=v.peek(5120);advance(v,1);assert.equal(v.peek(5120),stopped);
 v.type('CONT');advance(v,1);assert.notEqual(v.peek(5120),stopped);
});
test('actual ROM syntax errors and line replacement/deletion',async()=>{
 const v=await make();v.type('10 PRINT "OLD"\n10 PRINT "NEW"\n20 GOTO 999\nRUN');advance(v,3);assert.match(v.screenText(),/NEW/);assert.match(v.screenText(),/UNDEF.D STATEMENT/);
 v.type('20\n10 POTATO\nRUN');advance(v,3);assert.match(v.screenText(),/SYNTAX.*ERROR IN 10/s);
});
test('PRG roundtrip survives power cycle and executes unchanged',async()=>{
 const v=await make();run(v,'10 FOR I=1 TO 5:PRINT I*I:NEXT\n20 PRINT "BACK AGAIN"');const prg=v.program();assert.ok(prg);
 v.boot();assert.equal(vicReadPRG(v.program()).source,'');v.loadPRG(prg);assert.deepEqual(v.program(),prg);v.type('RUN');advance(v);assert.match(v.screenText(),/BACK AGAIN/);
 const fresh=await make();fresh.loadPRG(vicDecode(vicEncode(prg)));fresh.type('RUN');advance(fresh);assert.match(fresh.screenText(),/BACK AGAIN/);
});
test('PRG validator rejects malformed links, unknown formats and wrong memory without mutation',async()=>{
 const v=await make();run(v,'10 PRINT "SAFE"');const before=v.program();const broken=before.slice();broken[2]=0xff;broken[3]=0xff;
 assert.throws(()=>v.loadPRG(broken),/链接/);assert.deepEqual(v.program(),before);
 assert.throws(()=>vicReadPRG(new Uint8Array([0,128,1,2,3,4])),/BASIC PRG/);
 v.boot(true);assert.throws(()=>v.loadPRG(before),/内存配置/);
});
test('all editable starters tokenize and run without ROM errors',async()=>{
 const v=await make();
 for(const s of vicStarters){run(v,s.source,7);assert.equal(v.busy,false,s.id);assert.ok(v.program(),s.id);assert.doesNotMatch(v.screenText(),/\?\w.*ERROR/,s.id);}
});
test('source validation is before replacement; quotes, DATA and REM detokenize safely',async()=>{
 const v=await make();run(v,'10 PRINT "FOR NEXT GOTO"\n20 DATA "PRINT",42\n30 REM IF THEN');const before=v.program();
 assert.equal(vicReadPRG(before).source,'10 PRINT "FOR NEXT GOTO"\n20 DATA "PRINT",42\n30 REM IF THEN');
 assert.throws(()=>v.loadSource('10 PRINT "你好"'),/英文字母/);assert.deepEqual(v.program(),before);
 assert.throws(()=>vicInput('10 PRINT 1\n10 PRINT 2',true),/重复/);assert.throws(()=>vicInput('PRINT 1',true),/行号/);
 assert.throws(()=>vicInput('10 REM '+'X'.repeat(90),true),/88/);
});
test('library migration preserves old drafts/tape, sanitizes corrupt binary and keeps independent copies',async()=>{
 const old={program:{10:'PRINT "OLD"'},tape:{name:'HELLO',program:{10:'PRINT "TAPE"'}}};
 const migrated=vicRestoreLibrary(null,old);assert.equal(migrated.draft,'10 PRINT "OLD"');assert.equal(migrated.works[0].source,'10 PRINT "TAPE"');
 const v=await make();run(v,'10 PRINT "SAVED"');const prg=vicEncode(v.program());
 const lib=vicRestoreLibrary(JSON.stringify({version:1,draft:'UNSENT',session:{prg,expanded:false},works:[{id:'ok',name:'My Game',source:'10 PRINT "SAVED"',prg,expanded:false,date:12},{id:'bad',name:'Broken',source:'',prg:'bad'}]}));
 assert.equal(lib.draft,'UNSENT');assert.equal(lib.works.length,1);assert.equal(lib.session.prg,prg);v.boot();assert.equal(lib.session.prg,prg);
 assert.equal(vicRestoreLibrary('{broken').version,1);assert.equal(vicRestoreLibrary({version:1,session:{prg,expanded:true}}).session,null);
});

test("pixel studio bytes reach actual character RAM and VIC character generator",async()=>{
 const v=await make(),rows=[60,66,165,129,165,153,66,60];run(v,vicGlyphSource(rows),15);
 assert.deepEqual(rows.map((_,i)=>v.peek(7176+i)),rows);assert.equal(v.peek(36869),255);assert.equal(v.peek(7680),1);
});

test('library writes detect stale tabs and storage failure without overwriting the saved work',()=>{
 let raw=null;const storage={getItem:()=>raw,setItem:(_key,value)=>{raw=value;}};
 const first=vicRestoreLibrary(null);const saved=vicWriteLibrary(storage,first,null);
 const other={...first,draft:'10 PRINT "OTHER TAB"'};const next=vicWriteLibrary(storage,other,saved);
 assert.throws(()=>vicWriteLibrary(storage,{...first,draft:'MY UNSAVED WORK'},saved),/另一页/);assert.equal(raw,next);
 const full={getItem:()=>raw,setItem:()=>{throw new Error('quota');}};
 assert.throws(()=>vicWriteLibrary(full,first,next),/quota/);assert.equal(raw,next);
});
