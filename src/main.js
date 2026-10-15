import './style.css';
import { benchmark, iterationsForDepth } from './benchmark.js';
import { branchCountForDepth, generateTree, MAX_BRANCHES, VALUES_PER_BRANCH } from './tree.js';
import { renderTree } from './renderer.js';
import { loadWasmTree } from './wasm-tree.js';

const canvas = document.querySelector('#tree');
const seedInput = document.querySelector('#seed');
const depthInput = document.querySelector('#depth');
const angleInput = document.querySelector('#angle');
const randomnessInput = document.querySelector('#randomness');
const status = document.querySelector('#status');
const generateButton = document.querySelector('#generate');
const benchmarkButton = document.querySelector('#benchmark');
const jsGeometry = new Float64Array(MAX_BRANCHES * VALUES_PER_BRANCH);
let wasmTree;

function readParams() {
  const seed = Number(seedInput.value);
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Seed muss zwischen 0 und 4294967295 liegen.');
  return { seed, depth: Number(depthInput.value), angle: Number(angleInput.value), randomness: Number(randomnessInput.value) };
}

function setBusy(busy) {
  generateButton.disabled = busy || !wasmTree;
  benchmarkButton.disabled = busy || !wasmTree;
}

function displayTree(params) {
  const count = generateTree(params.seed, params.depth, params.angle, params.randomness, jsGeometry);
  renderTree(canvas, jsGeometry, count);
  document.querySelector('#tree-label').textContent = `${count.toLocaleString('de-DE')} Äste · Seed ${params.seed}`;
}

function updateSliders() {
  document.querySelector('#depth-value').textContent = depthInput.value;
  document.querySelector('#angle-value').textContent = `${angleInput.value}°`;
  document.querySelector('#randomness-value').textContent = `${randomnessInput.value}°`;
}

for (const input of [depthInput, angleInput, randomnessInput]) input.addEventListener('input', updateSliders);

generateButton.addEventListener('click', () => {
  try {
    const params = readParams();
    displayTree(params);
    document.querySelector('#results').hidden = true;
    status.textContent = 'Baum erzeugt.';
  } catch (error) { status.textContent = error.message; }
});

benchmarkButton.addEventListener('click', () => {
  let params;
  try { params = readParams(); } catch (error) { status.textContent = error.message; return; }
  setBusy(true);
  status.textContent = `Benchmark mit ${iterationsForDepth(params.depth)} Wiederholungen läuft …`;
  setTimeout(() => {
    try {
      const result = benchmark(params, jsGeometry, wasmTree);
      renderTree(canvas, jsGeometry, result.branches);
      document.querySelector('#tree-label').textContent = `${result.branches.toLocaleString('de-DE')} Äste · Seed ${params.seed}`;
      document.querySelector('#branches').textContent = result.branches.toLocaleString('de-DE');
      document.querySelector('#iterations').textContent = result.iterations.toLocaleString('de-DE');
      document.querySelector('#js-time').textContent = `${result.jsMs.toFixed(3)} ms`;
      document.querySelector('#wasm-time').textContent = `${result.wasmMs.toFixed(3)} ms`;
      document.querySelector('#speedup').textContent = `${result.speedup.toFixed(2)}×`;
      document.querySelector('#equivalent').textContent = result.equivalent.equal ? 'Gleichwertig ✓' : `Abweichung bei Wert ${result.equivalent.index}`;
      document.querySelector('#results').hidden = false;
      status.textContent = result.equivalent.equal ? 'Benchmark abgeschlossen.' : 'Die Ergebnisse weichen voneinander ab.';
    } catch (error) { status.textContent = error.message; }
    finally { setBusy(false); }
  }, 20);
});

updateSliders();
try {
  wasmTree = await loadWasmTree();
  setBusy(false);
  displayTree(readParams());
  status.textContent = 'Bereit für den Benchmark.';
} catch (error) {
  status.textContent = `WebAssembly konnte nicht geladen werden: ${error.message}`;
}
