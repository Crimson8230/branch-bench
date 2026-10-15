import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { compareGeometry, benchmark } from '../src/benchmark.js';
import { branchCountForDepth, generateTree, MAX_BRANCHES, VALUES_PER_BRANCH } from '../src/tree.js';

const bytes = await readFile(new URL('../public/tree.wasm', import.meta.url));
const { instance } = await WebAssembly.instantiate(bytes, { env: { abort() { throw new Error('AssemblyScript aborted'); } } });
const wasmTree = {
  generateTree: instance.exports.generateTree,
  geometry: new Float64Array(instance.exports.memory.buffer, instance.exports.getGeometryPointer(), MAX_BRANCHES * VALUES_PER_BRANCH),
};

test('JavaScript and WebAssembly generate equivalent geometry across parameters', () => {
  for (const params of [
    { seed: 0, depth: 1, angle: 0, randomness: 0 },
    { seed: 12345, depth: 8, angle: 28, randomness: 9 },
    { seed: 4294967295, depth: 12, angle: 47, randomness: 20 },
    { seed: 48271, depth: 15, angle: 28, randomness: 9 },
  ]) {
    const count = branchCountForDepth(params.depth);
    const jsGeometry = new Float64Array(count * VALUES_PER_BRANCH);
    assert.equal(generateTree(params.seed, params.depth, params.angle, params.randomness, jsGeometry), count);
    assert.equal(wasmTree.generateTree(params.seed, params.depth, params.angle, params.randomness), count);
    assert.deepEqual(compareGeometry(jsGeometry, wasmTree.geometry, count), { equal: true, index: -1 });
  }
});

test('same seed produces the same JavaScript tree', () => {
  const first = new Float64Array(branchCountForDepth(9) * VALUES_PER_BRANCH);
  const second = new Float64Array(first.length);
  generateTree(7281, 9, 31, 12, first);
  generateTree(7281, 9, 31, 12, second);
  assert.deepEqual(first, second);
});

test('benchmark reports finite values and verifies the output', () => {
  const params = { seed: 48271, depth: 8, angle: 28, randomness: 9 };
  const jsGeometry = new Float64Array(MAX_BRANCHES * VALUES_PER_BRANCH);
  const result = benchmark(params, jsGeometry, wasmTree, 15);
  assert.equal(result.branches, 255);
  assert.equal(result.iterations, 15);
  assert.equal(result.equivalent.equal, true);
  assert.ok(Number.isFinite(result.jsMs) && result.jsMs > 0);
  assert.ok(Number.isFinite(result.wasmMs) && result.wasmMs > 0);
});
