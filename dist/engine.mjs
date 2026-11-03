import {cleanLabLogs} from './worlds.mjs';
// Book progress and migration of the original limited BASIC sample.
export const STORAGE_KEY = 'every-bit.v1';
export const LESSON_COUNT = 23;
export const toBits = value => (value & 255).toString(2).padStart(8, '0');
export const fromBits = bits => bits.reduce((n, bit) => n * 2 + Number(Boolean(bit)), 0);
export const glyphRows = pixels => Array.from({length: 8}, (_, y) => fromBits(pixels.slice(y * 8, y * 8 + 8)));
export const initialState = () => ({version: 2, labs: {}, completed: [], lastLesson: 0, bits: 0, pixels: Array(64).fill(0), tape: null, tapePowerCycle: false, program: {}, powered: false, largeType: false});
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
    if (!s || ![1,2].includes(s.version)) return base;
    const count = s.version === 1 ? 6 : LESSON_COUNT;
    if(s.version === 2) base.labs = cleanLabLogs(s.labs);
    base.completed = Array.isArray(s.completed) ? [...new Set(s.completed.filter(n => Number.isInteger(n) && n >= 0 && n < count))] : [];
    if (Number.isInteger(s.lastLesson) && s.lastLesson >= 0 && s.lastLesson < count) base.lastLesson = s.lastLesson;
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
