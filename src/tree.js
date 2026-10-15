export const MAX_DEPTH = 15;
export const MAX_BRANCHES = 2 ** MAX_DEPTH - 1;
export const VALUES_PER_BRANCH = 4;

export function branchCountForDepth(depth) {
  return 2 ** depth - 1;
}

export function generateTree(seed, depth, angleDegrees, randomnessDegrees, geometry) {
  if (!Number.isInteger(depth) || depth < 1 || depth > MAX_DEPTH) {
    throw new RangeError(`Depth must be between 1 and ${MAX_DEPTH}`);
  }
  const needed = branchCountForDepth(depth) * VALUES_PER_BRANCH;
  if (geometry.length < needed) throw new RangeError('Geometry buffer is too small');

  let randomState = seed >>> 0;
  let count = 0;
  const spreadRadians = angleDegrees * Math.PI / 180;
  const randomnessRadians = randomnessDegrees * Math.PI / 180;

  function nextRandom() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  }

  function branch(x, y, length, angle, remaining) {
    const endX = x + Math.sin(angle) * length;
    const endY = y + Math.cos(angle) * length;
    const index = count * VALUES_PER_BRANCH;
    geometry[index] = x;
    geometry[index + 1] = y;
    geometry[index + 2] = endX;
    geometry[index + 3] = endY;
    count++;

    if (remaining <= 1) return;

    const leftJitter = (nextRandom() * 2 - 1) * randomnessRadians;
    const rightJitter = (nextRandom() * 2 - 1) * randomnessRadians;
    const childLength = length * 0.72;
    branch(endX, endY, childLength, angle - spreadRadians + leftJitter, remaining - 1);
    branch(endX, endY, childLength, angle + spreadRadians + rightJitter, remaining - 1);
  }

  branch(0, 0, 1, 0, depth);
  return count;
}
