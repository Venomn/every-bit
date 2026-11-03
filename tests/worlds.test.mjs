import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {initialLab,stepLab,replayLab,cleanLabLogs,cleanLabAction,LAB_KEYS,utfBytes,predictFruit,LAB_ACTION_LIMIT} from '../dist/worlds.mjs';
import {renderLab} from '../dist/labs.mjs';
import {restoreState,LESSON_COUNT} from '../dist/engine.mjs';
import {lessons,eras,sources} from '../dist/book.mjs';
const a=(type,value)=>value===undefined?{type}:{type,value};
const steps=(key,events)=>replayLab(key,events.map(e=>Array.isArray(e)?a(...e):a(e)));

test('all five chapters have contiguous, playable lessons with sources and an ending',()=>{
 assert.equal(lessons.length,LESSON_COUNT);assert.equal(eras.length,5);
 assert.deepEqual(eras.flatMap(e=>Array.from({length:e.end-e.start},(_,j)=>e.start+j)),Array.from({length:23},(_,i)=>i));
 assert.deepEqual(lessons.slice(6).map(l=>l.lab),LAB_KEYS);
 for(const l of lessons){assert.ok(l.title&&l.task&&l.takeaway);for(const k of l.source)assert.ok(sources[k]?.url.startsWith('https://'));}
 for(const key of LAB_KEYS)assert.match(renderLab(key,initialLab(key)),/data-world/);
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const script=html.match(/<script>\n([\s\S]*)<\/script>/)[1];new vm.Script(script);
});
test('scheduler shares one CPU, skips paused or finished jobs, and never gives two ticks at once',()=>{
 let s=initialLab('schedule');for(let i=0;i<12;i++){const before=s.counts.reduce((a,b)=>a+b);s=stepLab('schedule',s,a('tick'));assert.equal(s.counts.reduce((a,b)=>a+b),before+1);}assert.deepEqual(s.counts,[6,6]);assert.equal(s.done,true);
 s=steps('schedule',[['pause',0],'tick','tick']);assert.deepEqual(s.counts,[0,2]);s=stepLab('schedule',s,a('pause',1));const frozen=stepLab('schedule',s,a('tick'));assert.deepEqual(frozen.counts,[0,2]);
});
test('address and data are independent; writes survive address changes and reads',()=>{
 const s=steps('memory',[['address',9],['value',65],'write',['address',0],'read',['address',9],'read']);assert.equal(s.value,65);assert.equal(s.cells[0],0);assert.equal(s.done,true);
 assert.equal(cleanLabAction('memory',a('address',16)),null);assert.equal(cleanLabAction('memory',a('value',NaN)),null);
});
test('conditional robot can recover from hitting a rock; color depth does not erase its picture',()=>{
 let s=steps('branch',['step','step','step']);assert.equal(s.position,2);assert.equal(s.crashed,true);for(const e of ['rule','step','step','step'])s=stepLab('branch',s,a(e));assert.equal(s.position,6);assert.equal(s.done,true);
 const c=steps('color',[['select',2],['paint',0],['select',3],['paint',1],['depth',2],['depth',1]]);assert.deepEqual(c.pixels.slice(0,2),[2,3]);assert.equal(c.done,true);
});
test('CPU fetch/decode do not execute; execution updates register, PC and output once',()=>{
 let s=initialLab('cpu');for(let i=0;i<2;i++)s=stepLab('cpu',s,a('step'));assert.equal(s.acc,0);s=stepLab('cpu',s,a('step'));assert.equal(s.acc,2);assert.equal(s.pc,1);
 for(let i=0;i<9;i++)s=stepLab('cpu',s,a('step'));assert.equal(s.output,5);assert.equal(s.done,true);assert.equal(stepLab('cpu',s,a('step')).pc,4);
});
test('hardware requires its driver, and file commands stay inside a bounded toy filesystem',()=>{
 let s=steps('drivers',['key','save']);assert.equal(s.file,'');s=steps('drivers',[['toggle','keyboard'],'key',['toggle','disk'],'save']);assert.equal(s.file,'A');assert.equal(s.done,true);
 const f=steps('files',[['command','cd notes'],['command','write dream.txt HELLO WORLD'],['command','cat dream.txt']]);assert.equal(f.done,true);assert.equal(f.files['/notes/dream.txt'],'HELLO WORLD');
 for(const text of ['cd /etc','write ../../x BAD','mkdir ../x','$(touch /tmp/bad)','cat missing']){const next=stepLab('files',f,a('command',text));assert.deepEqual(next.files,f.files);assert.deepEqual(next.dirs,f.dirs);}
 const collision=stepLab('files',f,a('command','mkdir dream.txt'));assert.equal(collision.dirs.length,2);
});
test('patch sharing is gated by passing tests for the current edit',()=>{
 let s=steps('patch',['share']);assert.equal(s.shared,false);s=steps('patch',['fix','test','fix','share']);assert.equal(s.shared,false);assert.equal(s.friendFixed,false);
 s=steps('patch',['test','fix','test','share']);assert.equal(s.friendFixed,true);assert.equal(s.done,true);
});
test('modem delivery records its original speed; later controls do not rewrite history',()=>{
 const s=steps('modem',['send',['speed',4]]);assert.equal(s.sentSeconds,8);const fast=stepLab('modem',s,a('send'));assert.equal(fast.sentSeconds,2);assert.equal(fast.done,true);
});
test('out-of-order packets, missing packets, retries and duplicates reconstruct exactly once',()=>{
 let s=steps('packets',[['deliver',3],['drop',1],['deliver',0],['deliver',3],['deliver',2]]);assert.equal(s.done,false);assert.deepEqual(s.received,[3,0,2]);assert.equal(s.duplicates,1);
 s=stepLab('packets',s,a('deliver',1));assert.equal(s.done,true);assert.deepEqual(s.dropped,[]);assert.deepEqual(s.arrivals,[3,0,2,1]);
});
test('DNS cache can become stale; misses and expired entries cannot be treated as connections',()=>{
 let s=steps('dns',['lookup','visit','move','lookup','visit']);assert.equal(s.done,false);assert.equal(s.stale,true);s=stepLab('dns',s,a('expire'));assert.equal(s.address,null);s=stepLab('dns',s,a('lookup'));s=stepLab('dns',s,a('visit'));assert.equal(s.done,true);
 const miss=steps('dns',[['name','missing.test'],'lookup','visit']);assert.equal(miss.address,null);assert.equal(miss.done,false);
});
test('web requests and links distinguish a missing page; user content is escaped',()=>{
 let s=steps('web',[['path','/missing'],'request','follow']);assert.equal(s.done,false);s=steps('web',[['title','<img src=x onerror=1>'],'request','follow']);assert.equal(s.done,true);
 const html=renderLab('web',steps('web',[['title','<img src=x onerror=1>'],'request']));assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
});
test('touch coordinates map to app regions; Unicode preserves multibyte and combined symbols',()=>{
 assert.equal(steps('touch',[['tap',0],['tap',4],['tap',8],['tap',12]]).done,true);
 assert.deepEqual(utfBytes('A'),[65]);assert.deepEqual(utfBytes('你'),[228,189,160]);assert.equal(utfBytes('🌱').length,4);assert.equal(utfBytes('é').length,3);
 assert.equal(steps('unicode',[['text','A'],['text','你'],['text','🌱']]).done,true);
});
test('offline edits survive reload, create a real version conflict, and require online resolution',()=>{
 const log=[a('edit','A'),a('edit','B'),a('sync','A')];let s=replayLab('cloud',log);assert.equal(s.server.rev,1);assert.equal(s.A.dirty,true);
 const restored=restoreState(JSON.stringify({version:2,labs:{cloud:log}}));s=replayLab('cloud',restored.labs.cloud);for(const e of [a('online'),a('sync','A'),a('sync','B')])s=stepLab('cloud',s,e);assert.equal(s.conflict,'B');assert.equal(s.done,false);
 s=stepLab('cloud',s,a('online'));const offline=stepLab('cloud',s,a('resolve','B'));assert.equal(offline.conflict,'B');s=stepLab('cloud',offline,a('online'));s=stepLab('cloud',s,a('resolve','B'));assert.equal(s.done,true);assert.equal(s.server.text,s.B.text);assert.deepEqual(s.A,s.B);
});
test('nearest-example model responds to incorrect labels rather than a hidden correct answer',()=>{
 const samples=[{shape:2,label:'round'},{shape:8,label:'long'}];assert.equal(predictFruit(samples,7),'long');samples[1].label='round';assert.equal(predictFruit(samples,7),'round');assert.equal(predictFruit([]),null);
 assert.equal(steps('learn',[['sample',0],['label','long'],['sample',5],'test']).done,true);
});
test('final pipeline cannot store incomplete data, deduplicates, reorders and decodes across packet boundaries',()=>{
 let s=steps('message',[['text','A🌱你'],'encode','send',['deliver',1],['deliver',1],'store','open']);assert.equal(s.stored,null);assert.equal(s.done,false);
 for(const n of [2,0])s=stepLab('message',s,a('deliver',n));s=stepLab('message',s,a('store'));s=stepLab('message',s,a('open'));assert.equal(new TextDecoder().decode(new Uint8Array(s.stored)),'A🌱你');assert.equal(s.done,true);
 s=stepLab('message',s,a('text','new'));assert.equal(s.stored,null);assert.equal(s.sent,false);assert.equal(s.opened,false);
});
test('real v1-shaped state migrates without awarding new lessons; v2 logs replay safely and idempotently',()=>{
 const legacy={version:1,completed:[0,1,2,3,4,5,6],lastLesson:5,bits:65,pixels:Array(64).fill(1),powered:false,program:{},tape:{name:'HELLO',program:{10:'PRINT "HELLO"'}},tapePowerCycle:true,largeType:true};
 const migrated=restoreState(JSON.stringify(legacy));assert.equal(migrated.version,2);assert.deepEqual(migrated.completed,[0,1,2,3,4,5]);assert.equal(migrated.tapePowerCycle,true);assert.equal(migrated.tape.program[10],'PRINT "HELLO"');assert.equal(migrated.bits,65);assert.deepEqual(restoreState(JSON.stringify(migrated)),migrated);
 const logs=cleanLabLogs({schedule:[a('tick'),a('pause',999),a('__proto__')],wat:[a('tick')],message:[a('text','🌱'.repeat(200))]});assert.equal(logs.schedule.length,1);assert.equal([...logs.message[0].value].length,24);assert.ok(!Object.hasOwn(logs,'wat'));
 assert.equal(cleanLabLogs({cpu:Array(300).fill(a('step'))}).cpu.length,LAB_ACTION_LIMIT);
 for(const key of LAB_KEYS){const log=[...Array(3)].map(()=>a('step'));const clean=cleanLabLogs({[key]:log})[key];assert.deepEqual(replayLab(key,clean),replayLab(key,JSON.parse(JSON.stringify(clean))));}
});
