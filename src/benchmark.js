import { branchCountForDepth, generateTree, VALUES_PER_BRANCH } from './tree.js';

export function compareGeometry(first, second, count, tolerance = 1e-9) {
  const length = count * VALUES_PER_BRANCH;
  for (let index = 0; index < length; index++) {
    if (!Number.isFinite(first[index]) || !Number.isFinite(second[index])) return { equal: false, index };
    if (Math.abs(first[index] - second[index]) > tolerance) return { equal: false, index };
  }
  return { equal: true, index: -1 };
}

export function iterationsForDepth(depth) {
  return Math.max(12, Math.min(1000, Math.floor(1_000_000 / branchCountForDepth(depth))));
}

export function benchmark(params, jsGeometry, wasmTree, iterations = iterationsForDepth(params.depth)) {
  const args = [params.seed, params.depth, params.angle, params.randomness];
  const expectedCount = branchCountForDepth(params.depth);
  const runJavaScript = () => generateTree(...args, jsGeometry);
  const runWasm = () => wasmTree.generateTree(...args);

  for (let index = 0; index < 5; index++) {
    runJavaScript();
    runWasm();
  }

  let checksum = 0;
  function measure(run, geometry) {
    const start = performance.now();
    for (let index = 0; index < iterations; index++) {
      const count = run();
      if (count !== expectedCount) throw new Error('Unexpected branch count');
      checksum += geometry[(count - 1) * VALUES_PER_BRANCH + 3];
    }
    return (performance.now() - start) / iterations;
  }

  const jsMs = measure(runJavaScript, jsGeometry);
  const wasmMs = measure(runWasm, wasmTree.geometry);
  const equivalent = compareGeometry(jsGeometry, wasmTree.geometry, expectedCount);
  return { jsMs, wasmMs, speedup: jsMs / wasmMs, iterations, branches: expectedCount, equivalent, checksum };
}
