// Robi PNG z wektorowego logo (assets/*.svg) – do filmu, ikonek i social media.
//
//   node tools/render_logos.js
//
// Wymaga Playwright (Chromium renderuje SVG dokładnie tak jak przeglądarka na stronie).
// Wynik w assets/: logo-on-dark.png (1400 px), logo.png (1400 px), logo-icon.png (512),
// apple-touch-icon.png (180) oraz favicon-32.png / favicon-16.png.
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PW || 'playwright');

const A = path.join(__dirname, '..', 'assets');
const JOBS = [
  ['logo-on-dark.svg', 'logo-on-dark.png', 1400],
  ['logo.svg', 'logo.png', 1400],
  ['logo-icon.svg', 'logo-icon.png', 512],
  ['logo-icon.svg', 'apple-touch-icon.png', 180],
  ['logo-icon.svg', 'favicon-32.png', 32],
  ['logo-icon.svg', 'favicon-16.png', 16],
];

(async () => {
  const browser = await chromium.launch();
  for (const [src, out, w] of JOBS) {
    const svg = fs.readFileSync(path.join(A, src), 'utf8');
    const vb = svg.match(/viewBox="([\d. -]+)"/)[1].split(/\s+/).map(Number);
    const h = Math.round(w * vb[3] / vb[2]);
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(`<body style="margin:0"><img style="display:block;width:${w}px;height:${h}px"
      src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body>`);
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(A, out), omitBackground: true });
    await page.close();
    console.log(out, `${w}×${h}`);
  }
  await browser.close();
})();
