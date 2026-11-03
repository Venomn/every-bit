import test from 'node:test';
import assert from 'node:assert/strict';
import {toBits, fromBits, glyphRows, restoreState} from '../dist/engine.mjs';

test('every byte round trips through its eight bits; glyph rows use the same weights', () => {
  for(let n=0;n<256;n++) assert.equal(fromBits([...toBits(n)].map(Number)),n);
  assert.deepEqual(glyphRows([...toBits(65),...Array(56).fill('0')].map(Number)),[65,0,0,0,0,0,0,0]);
});
test('storage restores known versions, validates values, and makes isolated tape copies', () => {
  assert.equal(restoreState('{broken').version,2);
  assert.deepEqual(restoreState('{"version":99,"completed":[0,1]}').completed,[]);
  const restored=restoreState(JSON.stringify({version:1,completed:[0,0,5,6,-1,'2'],bits:256,pixels:[1],program:{10:'PRINT 1',70000:'PRINT 2'},powered:true,tape:{name:'HELLO',program:{10:'PRINT 1'}}}));
  assert.deepEqual(restored.completed,[0,5]);assert.equal(restored.bits,0);assert.equal(restored.pixels.length,64);
  assert.deepEqual(restored.program,{10:'PRINT 1'});assert.equal(restored.powered,true);
  restored.program[10]='PRINT 9';assert.equal(restored.tape.program[10],'PRINT 1');
  assert.equal(restoreState(JSON.stringify({version:1,tape:{name:'<script>',program:{}}})).tape,null);
  assert.equal(restoreState(JSON.stringify({version:1,tapePowerCycle:true,tape:{name:'HELLO',program:{10:'PRINT 1'}}})).tapePowerCycle,true);
  assert.equal(restoreState(JSON.stringify({version:1,tapePowerCycle:true})).tapePowerCycle,false);
});
