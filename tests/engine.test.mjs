import test from 'node:test';
import assert from 'node:assert/strict';
import {BasicMachine, expression, toBits, fromBits, glyphRows, restoreState} from '../dist/engine.mjs';

test('every byte round trips through its eight bits; glyph rows use the same weights', () => {
  for(let n=0;n<256;n++) assert.equal(fromBits([...toBits(n)].map(Number)),n);
  assert.deepEqual(glyphRows([...toBits(65),...Array(56).fill('0')].map(Number)),[65,0,0,0,0,0,0,0]);
});
test('BASIC expressions honor precedence, unary signs, parentheses and variables', () => {
  assert.equal(expression('2+3*4'),14);
  assert.equal(expression('-(2+3)*4'),-20);
  assert.equal(expression('A/2+1',{A:8}),5);
  assert.equal(expression('NOTSET+1'),1);
  assert.throws(()=>expression('1/0'),/DIVISION BY ZERO/);
  assert.throws(()=>expression('3 4'),/SYNTAX/);
  assert.throws(()=>expression('2+(3'),/SYNTAX/);
  assert.throws(()=>expression('globalThis.alert(1)'),/SYNTAX/);
});
test('direct commands print text, calculations, a character and reject malformed strings', () => {
  const m=new BasicMachine();
  assert.deepEqual(m.input('print "hello"').output,['HELLO']);
  assert.deepEqual(m.input('PRINT 2+3').output,['5']);
  assert.deepEqual(m.input('PRINT CHR$(65)').output,['A']);
  assert.match(m.input('PRINT "HELLO').output[0],/SYNTAX/);
  assert.match(m.input('PRINT CHR$(999)').output[0],/ILLEGAL QUANTITY/);
  assert.ok(m.input('PRINT "你好"').error);
  assert.ok(m.input('A'.repeat(81)).error);
});
test('program stores numeric line order, replaces and deletes lines, and starts fresh variables', () => {
  const m=new BasicMachine();
  m.input('20 PRINT A'); m.input('10 LET A=5'); m.input('30 END');
  assert.deepEqual(m.list(),['10 LET A=5','20 PRINT A','30 END']);
  m.input('10 LET A=7');m.input('RUN');
  m.step();assert.deepEqual(m.step().output,['7']);assert.equal(m.step().ended,true);
  m.input('10');assert.deepEqual(m.list(),['20 PRINT A','30 END']);
  m.input('RUN');assert.deepEqual(m.step().output,['0']);m.stop();
  m.input('NEW');assert.deepEqual(m.program,{});assert.equal(m.input('RUN').started,false);
});
test('loop can be stopped; missing line and malformed stored code fail on execution', () => {
  const m=new BasicMachine();m.input('10 PRINT "HELLO"');m.input('20 GOTO 10');m.input('RUN');
  assert.deepEqual(m.step().output,['HELLO']);assert.equal(m.step().goto,10);assert.deepEqual(m.step().output,['HELLO']);
  assert.ok(m.input('NEW').error);assert.equal(m.stop(),true);assert.equal(m.running,false);
  m.input('20 GOTO 30');m.input('RUN');m.step();assert.match(m.step().error,/UNDEF/);assert.equal(m.running,false);
  m.input('10 WHATEVER');m.input('RUN');assert.match(m.step().error,/SYNTAX/);assert.equal(m.running,false);
});
test('line and program bounds are explicit', () => {
  const m=new BasicMachine();assert.ok(m.input('64000 PRINT 1').error);
  for(let n=0;n<100;n++)m.input(`${n} PRINT 1`);
  assert.match(m.input('100 PRINT 1').error,/100/);
  assert.equal(m.input('99 PRINT 2').stored,true);
  m.input('99');assert.equal(m.input('100 PRINT 1').stored,true);
});
test('storage restores known versions, validates values, and makes isolated tape copies', () => {
  assert.equal(restoreState('{broken').version,1);
  assert.deepEqual(restoreState('{"version":2,"completed":[0,1]}').completed,[]);
  const restored=restoreState(JSON.stringify({version:1,completed:[0,0,5,6,-1,'2'],bits:256,pixels:[1],program:{10:'PRINT 1',70000:'PRINT 2'},powered:true,tape:{name:'HELLO',program:{10:'PRINT 1'}}}));
  assert.deepEqual(restored.completed,[0,5]);assert.equal(restored.bits,0);assert.equal(restored.pixels.length,64);
  assert.deepEqual(restored.program,{10:'PRINT 1'});assert.equal(restored.powered,true);
  const m=new BasicMachine(restored.tape.program);m.input('10 PRINT 9');assert.equal(restored.tape.program[10],'PRINT 1');
  assert.equal(restoreState(JSON.stringify({version:1,tape:{name:'<script>',program:{}}})).tape,null);
  assert.equal(restoreState(JSON.stringify({version:1,tapePowerCycle:true,tape:{name:'HELLO',program:{10:'PRINT 1'}}})).tapePowerCycle,true);
  assert.equal(restoreState(JSON.stringify({version:1,tapePowerCycle:true})).tapePowerCycle,false);
});
