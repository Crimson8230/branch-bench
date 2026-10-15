import { MAX_BRANCHES, VALUES_PER_BRANCH } from './tree.js';

export async function loadWasmTree(url = '/tree.wasm') {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`WebAssembly download failed: ${response.status}`);
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, { env: { abort() { throw new Error('AssemblyScript aborted'); } } });
  const { memory, generateTree, getGeometryPointer } = instance.exports;
  const pointer = getGeometryPointer();
  const geometry = new Float64Array(memory.buffer, pointer, MAX_BRANCHES * VALUES_PER_BRANCH);
  return { generateTree, geometry };
}
