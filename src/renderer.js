export function renderTree(canvas, geometry, count) {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#f2f0e7';
  context.fillRect(0, 0, width, height);

  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;
  for (let index = 0; index < count * 4; index += 4) {
    minX = Math.min(minX, geometry[index], geometry[index + 2]);
    maxX = Math.max(maxX, geometry[index], geometry[index + 2]);
    maxY = Math.max(maxY, geometry[index + 1], geometry[index + 3]);
  }
  const margin = 42;
  const scale = Math.min((width - margin * 2) / Math.max(maxX - minX, 0.1), (height - margin * 2) / Math.max(maxY, 0.1));
  const centerX = (minX + maxX) / 2;
  context.strokeStyle = '#304a37';
  context.lineCap = 'round';
  context.lineWidth = count > 15000 ? 0.6 : count > 3000 ? 0.85 : 1.2;
  context.beginPath();
  for (let index = 0; index < count * 4; index += 4) {
    context.moveTo(width / 2 + (geometry[index] - centerX) * scale, height - margin - geometry[index + 1] * scale);
    context.lineTo(width / 2 + (geometry[index + 2] - centerX) * scale, height - margin - geometry[index + 3] * scale);
  }
  context.stroke();
}
