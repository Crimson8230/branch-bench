const MAX_DEPTH: i32 = 15;
const MAX_BRANCHES: i32 = (1 << MAX_DEPTH) - 1;
const VALUES_PER_BRANCH: i32 = 4;
const geometry = new StaticArray<f64>(MAX_BRANCHES * VALUES_PER_BRANCH);

let randomState: u32 = 0;
let branchCount: i32 = 0;
let spreadRadians: f64 = 0;
let randomnessRadians: f64 = 0;

function nextRandom(): f64 {
  randomState = randomState * 1664525 + 1013904223;
  return <f64>randomState / 4294967296.0;
}

function branch(x: f64, y: f64, length: f64, angle: f64, remaining: i32): void {
  const endX = x + Math.sin(angle) * length;
  const endY = y + Math.cos(angle) * length;
  const index = branchCount * VALUES_PER_BRANCH;
  unchecked(geometry[index] = x);
  unchecked(geometry[index + 1] = y);
  unchecked(geometry[index + 2] = endX);
  unchecked(geometry[index + 3] = endY);
  branchCount++;

  if (remaining <= 1) return;

  const leftJitter = (nextRandom() * 2.0 - 1.0) * randomnessRadians;
  const rightJitter = (nextRandom() * 2.0 - 1.0) * randomnessRadians;
  const childLength = length * 0.72;
  branch(endX, endY, childLength, angle - spreadRadians + leftJitter, remaining - 1);
  branch(endX, endY, childLength, angle + spreadRadians + rightJitter, remaining - 1);
}

export function generateTree(seed: u32, depth: i32, angleDegrees: f64, randomnessDegrees: f64): i32 {
  if (depth < 1 || depth > MAX_DEPTH) return 0;
  randomState = seed;
  branchCount = 0;
  spreadRadians = angleDegrees * Math.PI / 180.0;
  randomnessRadians = randomnessDegrees * Math.PI / 180.0;
  branch(0.0, 0.0, 1.0, 0.0, depth);
  return branchCount;
}

export function getGeometryPointer(): usize {
  return changetype<usize>(geometry);
}
