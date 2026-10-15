import { readFile } from 'node:fs/promises';
import { benchmark } from '../src/benchmark.js';
import { MAX_BRANCHES, VALUES_PER_BRANCH } from '../src/tree.js';

const bytes = await readFile(new URL('../public/tree.wasm', import.meta.url));
const { instance } = await WebAssembly.instantiate(bytes, { env: { abort() { throw new Error('AssemblyScript aborted'); } } });
const wasmTree = {
  generateTree: instance.exports.generateTree,
  geometry: new Float64Array(instance.exports.memory.buffer, instance.exports.getGeometryPointer(), MAX_BRANCHES * VALUES_PER_BRANCH),
};
const jsGeometry = new Float64Array(MAX_BRANCHES * VALUES_PER_BRANCH);

for (const depth of [8, 11, 14]) {
  const result = benchmark({ seed: 48271, depth, angle: 28, randomness: 9 }, jsGeometry, wasmTree);
  console.log(JSON.stringify({ depth, branches: result.branches, iterations: result.iterations, jsMs: result.jsMs, wasmMs: result.wasmMs, speedup: result.speedup, equivalent: result.equivalent.equal }));
}
