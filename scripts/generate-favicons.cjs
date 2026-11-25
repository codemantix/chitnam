// Builds rounded favicons from the logo mark (the open book with "CP").
const sharp = require("sharp");
// Usage: node scripts/generate-favicons.cjs  (writes to public/)
const out = process.argv[2] || "public";

async function mark() {
  // Top part of the logo (the mark only), with surrounding white/transparent trimmed.
  const { data, info } = await sharp("public/images/logo.png")
    .extract({ left: 140, top: 0, width: 310, height: 142 })
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 20 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // The logo has a white background: turn near-white pixels transparent,
  // with a soft ramp so anti-aliased edges stay smooth.
  for (let i = 0; i < data.length; i += 4) {
    const light = Math.min(data[i], data[i + 1], data[i + 2]);
    const alpha = light >= 245 ? 0 : light <= 200 ? 255 : Math.round(((245 - light) / 45) * 255);
    data[i + 3] = alpha;
  }
  const png = await sharp(data, { raw: info }).png().toBuffer();
  return { data: png, info };
}

async function tile(size, { rounded, pad, fill = "#d7f0e1" }) {
  const { data } = await mark();
  const inner = Math.round(size * (1 - pad * 2));
  const markPng = await sharp(data).resize(inner, inner, { fit: "inside", kernel: "lanczos3" }).png().toBuffer();
  const r = Math.round(size * 0.22);
  const bg = rounded
    ? Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${fill}"/></svg>`)
    : Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${fill}"/></svg>`);
  return sharp(bg).composite([{ input: markPng, gravity: "center" }]).png({ compressionLevel: 9 }).toBuffer();
}

if (require.main === module) (async () => {
  const fs = require("fs");
  // Browser tab icons: rounded white tile, transparent corners.
  fs.writeFileSync(`${out}/icon-32.png`, await tile(32, { rounded: true, pad: 0.06 }));
  fs.writeFileSync(`${out}/icon-192.png`, await tile(192, { rounded: true, pad: 0.12 }));
  fs.writeFileSync(`${out}/icon-512.png`, await tile(512, { rounded: true, pad: 0.12 }));
  // iOS rounds home-screen icons itself and fills transparent corners with
  // black, so this one stays a full square.
  fs.writeFileSync(`${out}/apple-touch-icon.png`, await tile(180, { rounded: false, pad: 0.12 }));
  console.log("ok");
})();
