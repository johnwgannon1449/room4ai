// Generates client/public/preview.png — 1200x630 social preview image
// Run: node scripts/generate-preview.js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1200;
const H = 630;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1E3A5F';
ctx.fillRect(0, 0, W, H);

// Subtle grid
ctx.strokeStyle = 'rgba(255,255,255,0.04)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 40) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
}
for (let y = 0; y < H; y += 40) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
}

// Decorative ambient glow circles
ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
ctx.beginPath(); ctx.arc(100, 100, 200, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(1100, 530, 240, 0, Math.PI * 2); ctx.fill();

// "Room4AI" — render word by word to handle amber "4"
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
const titleY = 290;
const fontSize = 128;
ctx.font = `bold ${fontSize}px Arial, sans-serif`;

// Measure each part
const roomW = ctx.measureText('Room').width;
const fourW = ctx.measureText('4').width;
const aiW = ctx.measureText('AI').width;
const totalW = roomW + fourW + aiW;
let startX = W / 2 - totalW / 2;

ctx.textAlign = 'left';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('Room', startX, titleY);

ctx.fillStyle = '#F59E0B';
ctx.fillText('4', startX + roomW, titleY);

ctx.fillStyle = '#FFFFFF';
ctx.fillText('AI', startX + roomW + fourW, titleY);

// Tagline
ctx.textAlign = 'center';
ctx.font = `400 44px Arial, sans-serif`;
ctx.fillStyle = '#F59E0B';
ctx.fillText('Lesson planning, elevated.', W / 2, 375);

// Subtitle
ctx.font = `400 26px Arial, sans-serif`;
ctx.fillStyle = 'rgba(255,255,255,0.45)';
ctx.fillText('AI-powered lesson planning for California K-12 educators', W / 2, 450);

// Bottom accent bar
ctx.fillStyle = '#F59E0B';
ctx.globalAlpha = 0.8;
ctx.fillRect(0, H - 6, W, 6);
ctx.globalAlpha = 1;

// Save
const outPath = path.join(__dirname, '../client/public/preview.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`✓ Preview image saved to ${outPath} (${W}x${H})`);
