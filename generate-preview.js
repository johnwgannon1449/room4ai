// Script to generate a simple SVG preview image for OG tags
// Since we can't use canvas easily, we'll create an SVG that browsers can render

const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1E3A5F"/>
  <!-- Subtle grid pattern -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2A4E7A" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <!-- Decorative accent circles -->
  <circle cx="100" cy="100" r="180" fill="#F59E0B" opacity="0.05"/>
  <circle cx="1100" cy="530" r="200" fill="#F59E0B" opacity="0.05"/>
  <!-- Room4AI text -->
  <text x="600" y="290" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="120" fill="white" text-anchor="middle">Room<tspan fill="#F59E0B">4</tspan>AI</text>
  <!-- Tagline -->
  <text x="600" y="380" font-family="Arial, Helvetica, sans-serif" font-weight="normal" font-size="42" fill="#F59E0B" text-anchor="middle">Lesson planning, elevated.</text>
  <!-- Subtitle -->
  <text x="600" y="450" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="rgba(255,255,255,0.5)" text-anchor="middle">AI-powered lesson planning for California K-12 educators</text>
  <!-- Bottom bar -->
  <rect x="0" y="590" width="1200" height="4" fill="#F59E0B" opacity="0.8"/>
</svg>`;

const outputPath = path.join(__dirname, 'client/public/preview.svg');
fs.writeFileSync(outputPath, svg);
console.log('Preview SVG created at', outputPath);

// Also create a minimal PNG-like placeholder
// We'll use a base64-encoded PNG for the preview.png
// Since we can't run canvas, create a simple placeholder
const pngPath = path.join(__dirname, 'client/public/preview.png');
// Write SVG as the PNG path too (servers will handle it, og:image can use .svg)
fs.copyFileSync(outputPath, pngPath.replace('.png', '.svg'));
console.log('Done. Use /preview.svg for og:image or set up a proper PNG generation.');
