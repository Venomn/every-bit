// Deliberately small BASIC teaching interpreter. No eval, ROMs, or CPU emulation.
export const STORAGE_KEY = 'every-bit.v1';
export const LESSON_COUNT = 6;
export const toBits = value => (value & 255).toString(2).padStart(8, '0');
export const fromBits = bits => bits.reduce((n, bit) => n * 2 + Number(Boolean(bit)), 0);
export const glyphRows = pixels => Array.from({length: 8}, (_, y) => fromBits(pixels.slice(y * 8, y * 8 + 8)));
export const initialState = () => ({version: 1, completed: [], lastLesson: 0, bits: 0, pixels: Array(64).fill(0), tape: null, tapePowerCycle: false, program: {}, powered: false, largeType: false});
export function cleanProgram(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [key, line] of Object.entries(value).slice(0, 100)) {
    if (/^\d+$/.test(key) && +key >= 0 && +key <= 63999 && typeof line === 'string' && line.length <= 80 && /^[\x20-\x7e]*$/.test(line)) result[+key] = line;
  }
  return result;
}
export function restoreState(raw) {
  const base = initialState();
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1) return base;
    base.completed = Array.isArray(s.completed) ? [...new Set(s.completed.filter(n => Number.isInteger(n) && n >= 0 && n < LESSON_COUNT))] : [];
    if (Number.isInteger(s.lastLesson) && s.lastLesson >= 0 && s.lastLesson < LESSON_COUNT) base.lastLesson = s.lastLesson;
    if (Number.isInteger(s.bits) && s.bits >= 0 && s.bits <= 255) base.bits = s.bits;
    if (Array.isArray(s.pixels) && s.pixels.length === 64 && s.pixels.every(n => n === 0 || n === 1)) base.pixels = s.pixels;
    base.program = cleanProgram(s.program);
    base.powered = s.powered === true;
    base.largeType = s.largeType === true;
    if (s.tape && typeof s.tape === 'object' && typeof s.tape.name === 'string' && /^[A-Z0-9 -]{1,12}$/.test(s.tape.name)) base.tape = {name: s.tape.name, program: cleanProgram(s.tape.program)};
    base.tapePowerCycle = !!base.tape && s.tapePowerCycle === true;
  } catch { /* Broken browser storage should never prevent reading. */ }
  return base;
}

class BasicError extends Error {}
function tokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i])) {i++; continue;}
    const rest = text.slice(i);
    const num = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (num) { tokens.push({kind: 'number', value: Number(num[0])}); i += num[0].length; continue; }
    const name = rest.match(/^[A-Z][A-Z0-9]*/);
    if (name) {tokens.push({kind: 'name', value: name[0]}); i += name[0].length; continue;}
    if ('+-*/()'.includes(text[i])) {tokens.push({kind: text[i++]}); continue;}
    throw new BasicError('SYNTAX ERROR');
  }
  return tokens;
}
export function expression(text, vars = {}) {
  const tokens = tokenize(text.toUpperCase()); let at = 0;
  function primary() {
    const t = tokens[at++];
    if (!t) throw new BasicError('SYNTAX ERROR');
    if (t.kind === '+') return primary();
    if (t.kind === '-') return -primary();
    if (t.kind === 'number') return t.value;
    if (t.kind === 'name') return Object.hasOwn(vars, t.value) ? vars[t.value] : 0;
    if (t.kind === '(') {const v = add(); if (tokens[at++]?.kind !== ')') throw new BasicError('SYNTAX ERROR'); return v;}
    throw new BasicError('SYNTAX ERROR');
  }
  function multiply() {
    let v = primary();
    while (['*', '/'].includes(tokens[at]?.kind)) {const op = tokens[at++].kind; const b = primary(); if (op === '/' && b === 0) throw new BasicError('DIVISION BY ZERO'); v = op === '*' ? v * b : v / b;}
    return v;
  }
  function add() {
    let v = multiply();
    while (['+', '-'].includes(tokens[at]?.kind)) {const op = tokens[at++].kind; const b = multiply(); v = op === '+' ? v + b : v - b;}
    return v;
  }
  const value = add();
  if (at !== tokens.length) throw new BasicError('SYNTAX ERROR');
  if (!Number.isFinite(value) || Math.abs(value) > 1e38) throw new BasicError('OVERFLOW');
  return value;
}

export class BasicMachine {
  constructor(program = {}) {this.program = cleanProgram(program); this.vars = {}; this.running = false; this.pc = 0; this.steps = 0; this.currentLine = null;}
  list() {return Object.entries(this.program).sort((a,b) => +a[0] - +b[0]).map(([n,line]) => `${n} ${line}`);}
  stop() {const wasRunning = this.running; this.running = false; return wasRunning;}
  statement(text) {
    const line = text.trim(); let match;
    if (/^REM(?:\s|$)/.test(line) || !line) return {output: []};
    if ((match = line.match(/^(?:PRINT\s*|\?\s*)(.*)$/))) {
      const body = match[1].trim();
      if (!body) return {output: [''], printed: true};
      if (/^"[^"\r\n]*"$/.test(body)) return {output: [body.slice(1,-1)], printed: true};
      const chr = body.match(/^CHR\$\((.*)\)$/);
      if (chr) {const n = expression(chr[1], this.vars); if (!Number.isInteger(n) || n < 32 || n > 90) throw new BasicError('ILLEGAL QUANTITY'); return {output: [String.fromCharCode(n)], printed: true};}
      return {output: [String(expression(body, this.vars))], printed: true};
    }
    if ((match = line.match(/^(?:LET\s+)?([A-Z][A-Z0-9]*)\s*=\s*(.+)$/))) {this.vars[match[1]] = expression(match[2], this.vars); return {output: []};}
    if ((match = line.match(/^GOTO\s*(\d+)$/))) {
      const target = +match[1];
      if (!Object.hasOwn(this.program, target)) throw new BasicError('UNDEF\'D STATEMENT');
      return {output: [], goto: target};
    }
    if (/^(END|STOP)$/.test(line)) return {output: [], end: true};
    throw new BasicError('SYNTAX ERROR');
  }
  input(raw) {
    const text = raw.trim().toUpperCase();
    if (text.length > 80 || /[^\x20-\x7e]/.test(text)) return {output: ['?SYNTAX ERROR'], error: '请使用英文字符，最多 80 个字符。'};
    if (!text) return {output: []};
    if (this.running && !/^(STOP|END)$/.test(text)) return {output: [], error: '程序正在运行，先按 RUN/STOP 停下来。'};
    const stored = text.match(/^(\d+)\s*(.*)$/);
    if (stored) {
      const n = +stored[1]; if (n > 63999) return {output: ['?SYNTAX ERROR'], error: '行号范围是 0–63999。'};
      if (stored[2]) {
        if (!Object.hasOwn(this.program,n) && Object.keys(this.program).length >= 100) return {output: ['?OUT OF MEMORY ERROR'], error: '教学模式最多保存 100 行。'};
        this.program[n] = stored[2];
      } else delete this.program[n];
      return {output: [], stored: true};
    }
    if (text === 'LIST') return {output: this.list()};
    if (text === 'NEW') {this.program = {}; this.vars = {}; return {output: [], cleared: true};}
    if (text === 'RUN') {this.vars = {}; this.keys = Object.keys(this.program).map(Number).sort((a,b)=>a-b); this.pc = 0; this.steps = 0; this.currentLine = null; this.running = this.keys.length > 0; return {output: [], started: this.running, ended: !this.running};}
    try {
      const result = this.statement(text);
      if (result.goto !== undefined) return {output: ['?SYNTAX ERROR'], error: '教学模式请把 GOTO 写在带行号的程序中，再 RUN。'};
      if (result.end) this.running = false;
      return result;
    } catch(e) {return {output: [`?${e.message}`], error: e.message};}
  }
  step() {
    if (!this.running) return {output: [], ended: true};
    const number = this.keys[this.pc]; this.currentLine = number; this.steps++;
    try {
      const result = this.statement(this.program[number]);
      this.pc = result.goto === undefined ? this.pc + 1 : this.keys.indexOf(result.goto);
      if (result.end || this.pc >= this.keys.length) {this.running = false; result.ended = true;}
      return {...result, line: number};
    } catch(e) {this.running = false; return {output: [`?${e.message}`, ` IN ${number}`], error: e.message, ended: true};}
  }
}
