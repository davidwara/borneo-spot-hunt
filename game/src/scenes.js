// Borneo Spot Hunt — the eight scenes. Every scene is drawn procedurally
// with Canvas 2D primitives; there are no image files anywhere in the game.
//
// Each scene: { id, name, diffs, draw(ctx, w, h, side) }.
//   side 0 = left panel (the original), side 1 = right panel (changed).
//   diffs[i] = { x, y, r, kind, note } with x/y relative (0..1) in the panel
//   and r the hit radius in panel pixels. The draw function reads the same
//   diff index to decide what differs on the right panel, so every listed
//   difference is really visible in the art.
// Kinds: missing | color | added | moved | size | shadow | pattern.
import { seeded } from './config.js';

function sky(ctx, w, h, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function text(ctx, str, x, y, size, color, align) {
  ctx.fillStyle = color;
  ctx.font = 'bold ' + size + 'px sans-serif';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function cloud(ctx, x, y, s, color) {
  circle(ctx, x, y, 26 * s, color);
  circle(ctx, x + 24 * s, y + 4 * s, 20 * s, color);
  circle(ctx, x - 24 * s, y + 6 * s, 18 * s, color);
  ellipse(ctx, x, y + 10 * s, 46 * s, 14 * s, color);
}

function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(x - 9 * s, y, 9 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 9 * s, y, 9 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function leafCluster(ctx, x, y, r, color, seed) {
  const rnd = seeded(seed);
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * r * 0.7;
    ellipse(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 16 + rnd() * 14, 9 + rnd() * 7, color);
  }
}

function fish(ctx, x, y, s, body, tail) {
  ellipse(ctx, x, y, 22 * s, 11 * s, body);
  poly(ctx, [[x - 18 * s, y], [x - 32 * s, y - 10 * s], [x - 32 * s, y + 10 * s]], tail);
  circle(ctx, x + 12 * s, y - 2 * s, 2.5 * s, '#10222e');
}

// ---------------------------------------------------------------- scene 1
// Kanopi hutan hujan + bekantan. Diffs:
// 0 missing bird | 1 color nose | 2 added mushroom | 3 moved sun
// 4 size flower | 5 shadow monkey | 6 pattern leaf dots
const scene1 = {
  id: 0,
  name: 'Kanopi Hutan Hujan',
  diffs: [
    { x: 0.72, y: 0.16, r: 30, kind: 'missing', note: 'Burung di langit hilang' },
    { x: 0.46, y: 0.47, r: 26, kind: 'color', note: 'Hidung bekantan berubah warna' },
    { x: 0.82, y: 0.60, r: 26, kind: 'added', note: 'Jamur muncul di dahan' },
    { x: 0.16, y: 0.14, r: 42, kind: 'moved', note: 'Matahari pindah tempat' },
    { x: 0.12, y: 0.82, r: 30, kind: 'size', note: 'Bunga membesar' },
    { x: 0.46, y: 0.66, r: 46, kind: 'shadow', note: 'Bayangan bekantan hilang' },
    { x: 0.68, y: 0.38, r: 34, kind: 'pattern', note: 'Pola daun berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#7ec8e3', '#c8f0c0');
    const sunX = side === 0 ? w * 0.16 : w * 0.86;
    circle(ctx, sunX, h * 0.14, 34, '#ffd94d');
    circle(ctx, sunX, h * 0.14, 46, 'rgba(255,217,77,0.35)');
    cloud(ctx, w * 0.45, h * 0.10, 0.9, 'rgba(255,255,255,0.9)');
    cloud(ctx, w * 0.88, h * 0.26, 0.7, 'rgba(255,255,255,0.8)');
    if (side === 0) bird(ctx, w * 0.72, h * 0.16, 1, '#2b4a5a');
    bird(ctx, w * 0.30, h * 0.24, 0.8, '#2b4a5a');
    // big canopy trees
    rect(ctx, w * 0.06, h * 0.42, 26, h * 0.5, '#6b4423');
    rect(ctx, w * 0.88, h * 0.38, 26, h * 0.55, '#6b4423');
    leafCluster(ctx, w * 0.10, h * 0.38, 90, '#2f8f4e', 11);
    leafCluster(ctx, w * 0.90, h * 0.34, 95, '#37a05a', 12);
    leafCluster(ctx, w * 0.68, h * 0.38, 70, '#2f8f4e', 13);
    // pattern diff: dots on the right canopy
    const rnd = seeded(7);
    const dots = side === 0 ? 3 : 6;
    for (let i = 0; i < dots; i++) {
      circle(ctx, w * 0.68 + (rnd() - 0.5) * 90, h * 0.38 + (rnd() - 0.5) * 60, 5, '#ffd94d');
    }
    // branch + proboscis monkey
    line(ctx, w * 0.28, h * 0.62, w * 0.66, h * 0.58, '#7a4a21', 14);
    if (side === 0) ellipse(ctx, w * 0.46, h * 0.66, 52, 10, 'rgba(0,0,0,0.25)');
    ellipse(ctx, w * 0.46, h * 0.55, 34, 40, '#c98a4b');
    circle(ctx, w * 0.46, h * 0.44, 24, '#d9a05b');
    circle(ctx, w * 0.40, h * 0.42, 7, '#d9a05b');
    circle(ctx, w * 0.52, h * 0.42, 7, '#d9a05b');
    // nose: pink on the left, purple on the right
    ellipse(ctx, w * 0.46, h * 0.47, 9, 14, side === 0 ? '#ff7d9c' : '#9b59d0');
    circle(ctx, w * 0.44, h * 0.435, 2.5, '#10222e');
    circle(ctx, w * 0.48, h * 0.435, 2.5, '#10222e');
    line(ctx, w * 0.40, h * 0.60, w * 0.34, h * 0.72, '#c98a4b', 9);
    line(ctx, w * 0.52, h * 0.60, w * 0.58, h * 0.72, '#c98a4b', 9);
    // added diff: mushroom on the branch, right panel only
    if (side === 1) {
      rect(ctx, w * 0.82, h * 0.585, 8, 16, '#fff3d6');
      ellipse(ctx, w * 0.82, h * 0.58, 20, 10, '#e74c3c');
      circle(ctx, w * 0.815, h * 0.575, 3, '#fff');
      circle(ctx, w * 0.83, h * 0.585, 2.5, '#fff');
    }
    // ground + flowers; size diff on the left flower
    rect(ctx, 0, h * 0.86, w, h * 0.14, '#3f9e4d');
    const f = side === 0 ? 1 : 1.9;
    circle(ctx, w * 0.12, h * 0.82, 12 * f, '#ff5e8a');
    circle(ctx, w * 0.12, h * 0.82, 5 * f, '#ffd94d');
    circle(ctx, w * 0.30, h * 0.88, 10, '#ff8f5e');
    circle(ctx, w * 0.78, h * 0.90, 10, '#b678ff');
    text(ctx, 'HUTAN HUJAN KALIMANTAN', w * 0.5, h * 0.95, 15, 'rgba(255,255,255,0.85)');
  },
};

// ---------------------------------------------------------------- scene 2
// Pasar terapung. Diffs:
// 0 missing paddle | 1 color umbrella | 2 added oranges | 3 moved lantern
// 4 size fish | 5 shadow boat | 6 pattern awning stripes
const scene2 = {
  id: 1,
  name: 'Pasar Terapung',
  diffs: [
    { x: 0.30, y: 0.62, r: 30, kind: 'missing', note: 'Dayung perahu hilang' },
    { x: 0.62, y: 0.30, r: 40, kind: 'color', note: 'Payung berubah warna' },
    { x: 0.85, y: 0.70, r: 30, kind: 'added', note: 'Keranjang jeruk muncul' },
    { x: 0.18, y: 0.22, r: 26, kind: 'moved', note: 'Lampion pindah tempat' },
    { x: 0.50, y: 0.86, r: 30, kind: 'size', note: 'Ikan membesar' },
    { x: 0.42, y: 0.74, r: 52, kind: 'shadow', note: 'Bayangan perahu hilang' },
    { x: 0.62, y: 0.44, r: 40, kind: 'pattern', note: 'Garis awning berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#ffe9a8', '#ffb36b');
    circle(ctx, w * 0.82, h * 0.14, 30, '#fff3b0');
    cloud(ctx, w * 0.35, h * 0.12, 0.8, 'rgba(255,255,255,0.85)');
    // river
    rect(ctx, 0, h * 0.60, w, h * 0.40, '#2f8fb8');
    line(ctx, 0, h * 0.68, w, h * 0.68, 'rgba(255,255,255,0.5)', 3);
    line(ctx, 0, h * 0.82, w, h * 0.82, 'rgba(255,255,255,0.35)', 3);
    // lantern: left top-left, right top-right
    const lx = side === 0 ? w * 0.18 : w * 0.86;
    ellipse(ctx, lx, h * 0.22, 14, 18, '#ff3b30');
    line(ctx, lx, h * 0.16, lx, h * 0.10, '#7a4a21', 3);
    // main boat
    if (side === 0) ellipse(ctx, w * 0.42, h * 0.74, 130, 14, 'rgba(0,0,0,0.22)');
    poly(ctx, [[w * 0.18, h * 0.66], [w * 0.66, h * 0.66], [w * 0.60, h * 0.74], [w * 0.24, h * 0.74]], '#8a5a2b');
    rect(ctx, w * 0.30, h * 0.56, 10, 60, '#6b4423');
    rect(ctx, w * 0.54, h * 0.56, 10, 60, '#6b4423');
    // awning: stripes differ (3 left, 5 right)
    const stripes = side === 0 ? 3 : 5;
    for (let i = 0; i < stripes; i++) {
      rect(ctx, w * 0.26 + i * (w * 0.075), h * 0.50, w * 0.037, 14, i % 2 ? '#fff' : '#ff5e5e');
    }
    // vendor + umbrella (red left, blue right)
    circle(ctx, w * 0.42, h * 0.52, 16, '#8a5a2b');
    ellipse(ctx, w * 0.42, h * 0.60, 22, 16, '#e2583e');
    ellipse(ctx, w * 0.62, h * 0.30, 62, 16, side === 0 ? '#e74c3c' : '#2f7fe0');
    line(ctx, w * 0.62, h * 0.30, w * 0.62, h * 0.52, '#6b4423', 5);
    // fruit piles
    circle(ctx, w * 0.30, h * 0.63, 10, '#ff9f1c');
    circle(ctx, w * 0.34, h * 0.63, 10, '#ff9f1c');
    circle(ctx, w * 0.32, h * 0.615, 10, '#ffd23e');
    circle(ctx, w * 0.52, h * 0.63, 10, '#7bc043');
    circle(ctx, w * 0.56, h * 0.63, 10, '#7bc043');
    // added: basket of oranges, right panel only
    if (side === 1) {
      rect(ctx, w * 0.82, h * 0.68, 44, 20, '#a5692e');
      circle(ctx, w * 0.835, h * 0.67, 9, '#ff9f1c');
      circle(ctx, w * 0.865, h * 0.67, 9, '#ff9f1c');
      circle(ctx, w * 0.85, h * 0.655, 9, '#ffd23e');
    }
    // paddle: left panel only
    if (side === 0) line(ctx, w * 0.30, h * 0.58, w * 0.24, h * 0.78, '#5a3a1a', 7);
    // fish in the river: bigger on the right
    fish(ctx, w * 0.50, h * 0.86, side === 0 ? 0.8 : 1.6, '#ffb703', '#ff7b00');
    fish(ctx, w * 0.78, h * 0.92, 0.7, '#e0f7ff', '#7fb8c9');
    text(ctx, 'PASAR TERAPUNG', w * 0.5, h * 0.96, 15, 'rgba(255,255,255,0.9)');
  },
};

// ---------------------------------------------------------------- scene 3
// Perahu klotok di sungai. Diffs:
// 0 missing kingfisher | 1 color roof | 2 added buoy | 3 moved cloud
// 4 size smoke | 5 shadow boat | 6 pattern windows
const scene3 = {
  id: 2,
  name: 'Perahu Klotok',
  diffs: [
    { x: 0.78, y: 0.30, r: 28, kind: 'missing', note: 'Burung raja udang hilang' },
    { x: 0.45, y: 0.38, r: 44, kind: 'color', note: 'Atap klotok berubah warna' },
    { x: 0.12, y: 0.80, r: 26, kind: 'added', note: 'Pelampung muncul di sungai' },
    { x: 0.30, y: 0.12, r: 40, kind: 'moved', note: 'Awan pindah tempat' },
    { x: 0.62, y: 0.30, r: 34, kind: 'size', note: 'Asap membesar' },
    { x: 0.45, y: 0.72, r: 56, kind: 'shadow', note: 'Bayangan perahu hilang' },
    { x: 0.45, y: 0.52, r: 40, kind: 'pattern', note: 'Jumlah jendela berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#aee2ff', '#e8f7ff');
    const cx = side === 0 ? w * 0.30 : w * 0.78;
    cloud(ctx, cx, h * 0.12, 0.9, '#ffffff');
    cloud(ctx, w * 0.60, h * 0.08, 0.6, 'rgba(255,255,255,0.9)');
    // jungle banks
    rect(ctx, 0, h * 0.55, w * 0.16, h * 0.45, '#2f8f4e');
    rect(ctx, w * 0.84, h * 0.55, w * 0.16, h * 0.45, '#2f8f4e');
    leafCluster(ctx, w * 0.08, h * 0.55, 60, '#37a05a', 21);
    leafCluster(ctx, w * 0.92, h * 0.55, 60, '#2f8f4e', 22);
    // river
    rect(ctx, 0, h * 0.62, w, h * 0.38, '#3a9bc2');
    line(ctx, 0, h * 0.72, w, h * 0.72, 'rgba(255,255,255,0.45)', 3);
    line(ctx, 0, h * 0.88, w, h * 0.88, 'rgba(255,255,255,0.3)', 3);
    // kingfisher: left panel only
    if (side === 0) {
      ellipse(ctx, w * 0.78, h * 0.30, 12, 8, '#1e90d6');
      poly(ctx, [[w * 0.79, h * 0.30], [w * 0.86, h * 0.29], [w * 0.79, h * 0.32]], '#ff7b00');
      line(ctx, w * 0.78, h * 0.32, w * 0.78, h * 0.42, '#5a3a1a', 3);
    }
    // klotok boat
    if (side === 0) ellipse(ctx, w * 0.45, h * 0.72, 150, 13, 'rgba(0,0,0,0.22)');
    poly(ctx, [[w * 0.24, h * 0.58], [w * 0.66, h * 0.58], [w * 0.62, h * 0.68], [w * 0.28, h * 0.68]], '#7a4a21');
    rect(ctx, w * 0.30, h * 0.44, w * 0.30, 56, '#f4e3c2');
    poly(ctx, [[w * 0.28, h * 0.44], [w * 0.62, h * 0.44], [w * 0.45, h * 0.34]], side === 0 ? '#c0392b' : '#2f7fe0');
    // windows: 2 left, 4 right
    const wins = side === 0 ? 2 : 4;
    for (let i = 0; i < wins; i++) {
      rect(ctx, w * (0.33 + i * 0.06), h * 0.50, 18, 18, '#2b4a5a');
    }
    // chimney smoke: bigger on the right
    const s = side === 0 ? 1 : 1.8;
    circle(ctx, w * 0.62, h * 0.30, 12 * s, 'rgba(255,255,255,0.85)');
    circle(ctx, w * 0.64, h * 0.26, 9 * s, 'rgba(255,255,255,0.7)');
    rect(ctx, w * 0.60, h * 0.32, 8, 22, '#5a3a1a');
    // added buoy, right panel only
    if (side === 1) {
      circle(ctx, w * 0.12, h * 0.80, 14, '#ff3b30');
      rect(ctx, w * 0.12 - 14, h * 0.78, 28, 6, '#fff');
    }
    text(ctx, 'SUNGAI BARITO', w * 0.5, h * 0.96, 15, 'rgba(255,255,255,0.9)');
  },
};

// ---------------------------------------------------------------- scene 4
// Api unggun malam hutan. Diffs:
// 0 missing star | 1 color tent | 2 added firefly | 3 moved moon
// 4 size log | 5 shadow tent | 6 pattern constellation
const scene4 = {
  id: 3,
  name: 'Api Unggun Malam',
  diffs: [
    { x: 0.80, y: 0.18, r: 26, kind: 'missing', note: 'Satu bintang hilang' },
    { x: 0.24, y: 0.55, r: 44, kind: 'color', note: 'Tenda berubah warna' },
    { x: 0.68, y: 0.34, r: 24, kind: 'added', note: 'Kunang-kunang muncul' },
    { x: 0.70, y: 0.14, r: 36, kind: 'moved', note: 'Bulan pindah tempat' },
    { x: 0.50, y: 0.78, r: 34, kind: 'size', note: 'Kayu bakar membesar' },
    { x: 0.24, y: 0.72, r: 48, kind: 'shadow', note: 'Bayangan tenda hilang' },
    { x: 0.45, y: 0.22, r: 36, kind: 'pattern', note: 'Pola rasi bintang berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#141b3d', '#3b2a63');
    const moonX = side === 0 ? w * 0.70 : w * 0.18;
    circle(ctx, moonX, h * 0.14, 30, '#fff3b0');
    circle(ctx, moonX + 10, h * 0.13, 6, '#e8d98a');
    // stars: one missing on the right; constellation dots 3 vs 5
    const rnd = seeded(31);
    for (let i = 0; i < 26; i++) {
      const sx = rnd() * w, sy = rnd() * h * 0.4;
      if (side === 1 && Math.abs(sx - w * 0.80) < 24 && Math.abs(sy - h * 0.18) < 24) continue;
      circle(ctx, sx, sy, 1.5 + rnd() * 1.5, 'rgba(255,255,255,0.9)');
    }
    const stars = side === 0 ? 3 : 5;
    for (let i = 0; i < stars; i++) {
      circle(ctx, w * (0.40 + i * 0.05), h * (0.20 + (i % 2) * 0.05), 4, '#ffe97d');
    }
    line(ctx, w * 0.40, h * 0.20, w * 0.50, h * 0.25, 'rgba(255,233,125,0.5)', 2);
    // ground
    rect(ctx, 0, h * 0.72, w, h * 0.28, '#1d3320');
    // tent (orange left, teal right)
    if (side === 0) ellipse(ctx, w * 0.24, h * 0.72, 66, 9, 'rgba(0,0,0,0.4)');
    poly(ctx, [[w * 0.12, h * 0.70], [w * 0.24, h * 0.42], [w * 0.36, h * 0.70]], side === 0 ? '#ff7b2e' : '#1abc9c');
    poly(ctx, [[w * 0.21, h * 0.70], [w * 0.24, h * 0.58], [w * 0.27, h * 0.70]], '#2b1d12');
    // campfire
    const logS = side === 0 ? 1 : 1.7;
    line(ctx, w * 0.44, h * 0.80, w * 0.56, h * 0.74, '#5a3a1a', 8 * logS);
    line(ctx, w * 0.56, h * 0.80, w * 0.44, h * 0.74, '#5a3a1a', 8 * logS);
    poly(ctx, [[w * 0.47, h * 0.76], [w * 0.50, h * 0.58], [w * 0.53, h * 0.76]], '#ff9f1c');
    poly(ctx, [[w * 0.485, h * 0.76], [w * 0.50, h * 0.66], [w * 0.515, h * 0.76]], '#ffe97d');
    circle(ctx, w * 0.50, h * 0.60, 22, 'rgba(255,159,28,0.25)');
    // added firefly, right panel only
    if (side === 1) {
      circle(ctx, w * 0.68, h * 0.34, 4, '#c8ff5e');
      circle(ctx, w * 0.68, h * 0.34, 10, 'rgba(200,255,94,0.3)');
    }
    // marshmallow sticks + pine silhouettes
    line(ctx, w * 0.66, h * 0.72, w * 0.60, h * 0.60, '#8a5a2b', 4);
    circle(ctx, w * 0.60, h * 0.59, 6, '#fff3d6');
    poly(ctx, [[w * 0.86, h * 0.72], [w * 0.90, h * 0.48], [w * 0.94, h * 0.72]], '#0f2412');
    poly(ctx, [[w * 0.06, h * 0.72], [w * 0.09, h * 0.52], [w * 0.12, h * 0.72]], '#0f2412');
    text(ctx, 'MALAM DI HUTAN', w * 0.5, h * 0.95, 15, 'rgba(255,255,255,0.85)');
  },
};

// ---------------------------------------------------------------- scene 5
// Suaka orangutan. Diffs:
// 0 missing banana | 1 color sign | 2 added butterfly | 3 moved basket
// 4 size leaf | 5 shadow orangutan | 6 pattern bark rings
const scene5 = {
  id: 4,
  name: 'Suaka Orangutan',
  diffs: [
    { x: 0.60, y: 0.62, r: 28, kind: 'missing', note: 'Pisang di tangan hilang' },
    { x: 0.16, y: 0.30, r: 34, kind: 'color', note: 'Papan nama berubah warna' },
    { x: 0.80, y: 0.26, r: 26, kind: 'added', note: 'Kupu-kupu muncul' },
    { x: 0.72, y: 0.70, r: 32, kind: 'moved', note: 'Keranjang pindah tempat' },
    { x: 0.28, y: 0.20, r: 30, kind: 'size', note: 'Daun membesar' },
    { x: 0.45, y: 0.76, r: 50, kind: 'shadow', note: 'Bayangan orangutan hilang' },
    { x: 0.88, y: 0.50, r: 34, kind: 'pattern', note: 'Pola kulit kayu berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#bfe8a8', '#fff3c4');
    cloud(ctx, w * 0.55, h * 0.10, 0.8, 'rgba(255,255,255,0.9)');
    // trees
    rect(ctx, w * 0.06, h * 0.30, 24, h * 0.55, '#6b4423');
    rect(ctx, w * 0.86, h * 0.28, 24, h * 0.57, '#6b4423');
    leafCluster(ctx, w * 0.08, h * 0.28, 80, '#2f8f4e', 41);
    leafCluster(ctx, w * 0.90, h * 0.26, 80, '#37a05a', 42);
    // bark rings: 2 left, 4 right
    const rings = side === 0 ? 2 : 4;
    for (let i = 0; i < rings; i++) {
      ctx.strokeStyle = '#4a2c14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w * 0.88, h * 0.50, 12 + i * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    // sign (green left, red right)
    rect(ctx, w * 0.10, h * 0.28, 6, 34, '#6b4423');
    rect(ctx, w * 0.06, h * 0.22, 130, 40, side === 0 ? '#2f8f4e' : '#c0392b');
    text(ctx, 'SUAKA', w * 0.16, h * 0.28, 18, '#fff');
    // big leaf: bigger on the right
    const ls = side === 0 ? 1 : 1.8;
    ellipse(ctx, w * 0.28, h * 0.20, 26 * ls, 12 * ls, '#37a05a');
    // feeding platform
    rect(ctx, w * 0.30, h * 0.60, w * 0.34, 12, '#8a5a2b');
    line(ctx, w * 0.34, h * 0.61, w * 0.34, h * 0.84, '#6b4423', 8);
    line(ctx, w * 0.60, h * 0.61, w * 0.60, h * 0.84, '#6b4423', 8);
    // orangutan
    if (side === 0) ellipse(ctx, w * 0.45, h * 0.76, 56, 10, 'rgba(0,0,0,0.25)');
    ellipse(ctx, w * 0.45, h * 0.64, 36, 42, '#c96a2e');
    circle(ctx, w * 0.45, h * 0.52, 24, '#d97b3f');
    circle(ctx, w * 0.43, h * 0.51, 3, '#10222e');
    circle(ctx, w * 0.47, h * 0.51, 3, '#10222e');
    ellipse(ctx, w * 0.45, h * 0.55, 12, 7, '#f4c99b');
    line(ctx, w * 0.36, h * 0.62, w * 0.28, h * 0.52, '#c96a2e', 10);
    line(ctx, w * 0.54, h * 0.62, w * 0.60, h * 0.58, '#c96a2e', 10);
    // banana in hand: left panel only
    if (side === 0) {
      poly(ctx, [[w * 0.585, h * 0.56], [w * 0.62, h * 0.62], [w * 0.60, h * 0.66]], '#ffd23e');
    }
    // basket: left at 0.72, right at 0.20
    const bx = side === 0 ? w * 0.72 : w * 0.20;
    rect(ctx, bx - 20, h * 0.70, 40, 18, '#a5692e');
    circle(ctx, bx - 8, h * 0.695, 8, '#ff9f1c');
    circle(ctx, bx + 8, h * 0.695, 8, '#ffd23e');
    // butterfly: right panel only
    if (side === 1) {
      ellipse(ctx, w * 0.78, h * 0.26, 10, 7, '#ff5e8a');
      ellipse(ctx, w * 0.82, h * 0.26, 10, 7, '#ff5e8a');
      ellipse(ctx, w * 0.78, h * 0.30, 8, 5, '#b678ff');
      ellipse(ctx, w * 0.82, h * 0.30, 8, 5, '#b678ff');
    }
    rect(ctx, 0, h * 0.86, w, h * 0.14, '#3f9e4d');
    text(ctx, 'SUAKA ORANGUTAN', w * 0.5, h * 0.95, 15, 'rgba(255,255,255,0.9)');
  },
};

// ---------------------------------------------------------------- scene 6
// Terumbu karang + penyelam. Diffs:
// 0 missing fish | 1 color coral | 2 added shell | 3 moved turtle
// 4 size bubble | 5 shadow diver | 6 pattern fish stripes
const scene6 = {
  id: 5,
  name: 'Terumbu Karang',
  diffs: [
    { x: 0.22, y: 0.30, r: 30, kind: 'missing', note: 'Ikan kuning hilang' },
    { x: 0.78, y: 0.72, r: 38, kind: 'color', note: 'Karang berubah warna' },
    { x: 0.60, y: 0.88, r: 26, kind: 'added', note: 'Kerang muncul di pasir' },
    { x: 0.70, y: 0.50, r: 40, kind: 'moved', note: 'Penyu pindah tempat' },
    { x: 0.48, y: 0.24, r: 28, kind: 'size', note: 'Gelembung membesar' },
    { x: 0.45, y: 0.60, r: 50, kind: 'shadow', note: 'Bayangan penyelam hilang' },
    { x: 0.36, y: 0.44, r: 32, kind: 'pattern', note: 'Garis ikan berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#0b6fa4', '#37c6e8');
    // light rays
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    poly(ctx, [[w * 0.2, 0], [w * 0.3, 0], [w * 0.45, h], [w * 0.3, h]], 'rgba(255,255,255,0.10)');
    poly(ctx, [[w * 0.6, 0], [w * 0.66, 0], [w * 0.8, h], [w * 0.7, h]], 'rgba(255,255,255,0.10)');
    // sand
    ellipse(ctx, w * 0.5, h * 0.94, w * 0.55, h * 0.08, '#f4e3b2');
    // yellow fish: left panel only
    if (side === 0) fish(ctx, w * 0.22, h * 0.30, 1, '#ffd23e', '#ff9f1c');
    // blue fish with stripes: 2 left, 4 right
    fish(ctx, w * 0.36, h * 0.44, 1.1, '#4db2ff', '#2f7fe0');
    const stripes = side === 0 ? 2 : 4;
    for (let i = 0; i < stripes; i++) {
      line(ctx, w * (0.33 + i * 0.02), h * 0.425, w * (0.33 + i * 0.02), h * 0.455, '#10222e', 2.5);
    }
    fish(ctx, w * 0.15, h * 0.62, 0.8, '#ff8fb2', '#e2583e');
    // diver
    if (side === 0) ellipse(ctx, w * 0.45, h * 0.60, 60, 10, 'rgba(0,0,0,0.25)');
    ellipse(ctx, w * 0.45, h * 0.50, 40, 16, '#1f6fb2');
    circle(ctx, w * 0.52, h * 0.48, 12, '#f4c99b');
    circle(ctx, w * 0.52, h * 0.48, 15, 'rgba(200,230,255,0.5)');
    rect(ctx, w * 0.40, h * 0.46, 14, 22, '#ffb703');
    poly(ctx, [[w * 0.41, h * 0.50], [w * 0.36, h * 0.56], [w * 0.41, h * 0.55]], '#ff7b00');
    line(ctx, w * 0.42, h * 0.52, w * 0.38, h * 0.58, '#1f6fb2', 7);
    // bubbles: bigger on the right
    const bs = side === 0 ? 1 : 2;
    circle(ctx, w * 0.48, h * 0.24, 7 * bs, 'rgba(255,255,255,0.7)');
    circle(ctx, w * 0.52, h * 0.18, 5 * bs, 'rgba(255,255,255,0.6)');
    circle(ctx, w * 0.44, h * 0.30, 4 * bs, 'rgba(255,255,255,0.5)');
    // turtle: left at 0.70/0.50, right at 0.24/0.52
    const tx = side === 0 ? w * 0.70 : w * 0.24;
    const ty = side === 0 ? h * 0.50 : h * 0.52;
    ellipse(ctx, tx, ty, 30, 20, '#2f8f4e');
    circle(ctx, tx + 32, ty - 4, 10, '#37a05a');
    line(ctx, tx - 28, ty + 6, tx - 40, ty + 14, '#2f8f4e', 5);
    line(ctx, tx - 28, ty - 6, tx - 40, ty - 14, '#2f8f4e', 5);
    // corals (right one changes color)
    poly(ctx, [[w * 0.76, h * 0.88], [w * 0.78, h * 0.66], [w * 0.80, h * 0.88]], side === 0 ? '#ff6b9d' : '#7b5eff');
    poly(ctx, [[w * 0.80, h * 0.88], [w * 0.83, h * 0.70], [w * 0.86, h * 0.88]], side === 0 ? '#ff6b9d' : '#7b5eff');
    poly(ctx, [[w * 0.10, h * 0.88], [w * 0.12, h * 0.72], [w * 0.14, h * 0.88]], '#ff9f1c');
    poly(ctx, [[w * 0.14, h * 0.88], [w * 0.17, h * 0.76], [w * 0.20, h * 0.88]], '#ff9f1c');
    // shell: right panel only
    if (side === 1) {
      ellipse(ctx, w * 0.60, h * 0.88, 16, 10, '#ffb6c9');
      line(ctx, w * 0.60, h * 0.88, w * 0.60, h * 0.80, '#e2583e', 2);
    }
    text(ctx, 'TERUMBU KARANG DERAWAN', w * 0.5, h * 0.97, 14, 'rgba(255,255,255,0.9)');
  },
};

// ---------------------------------------------------------------- scene 7
// Festival rumah panjang Dayak. Diffs:
// 0 missing gong | 1 color banner | 2 added drum | 3 moved torch
// 4 size mask | 5 shadow dancer | 6 pattern banner motif
const scene7 = {
  id: 6,
  name: 'Festival Rumah Panjang',
  diffs: [
    { x: 0.84, y: 0.42, r: 32, kind: 'missing', note: 'Gong di dinding hilang' },
    { x: 0.50, y: 0.18, r: 40, kind: 'color', note: 'Spanduk berubah warna' },
    { x: 0.16, y: 0.74, r: 30, kind: 'added', note: 'Gendang muncul' },
    { x: 0.72, y: 0.55, r: 28, kind: 'moved', note: 'Obor pindah tempat' },
    { x: 0.50, y: 0.38, r: 30, kind: 'size', note: 'Topeng membesar' },
    { x: 0.50, y: 0.82, r: 48, kind: 'shadow', note: 'Bayangan penari hilang' },
    { x: 0.50, y: 0.18, r: 40, kind: 'pattern', note: 'Motif spanduk berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#ffcf7d', '#ff8f5e');
    circle(ctx, w * 0.86, h * 0.14, 28, '#fff3b0');
    // longhouse
    rect(ctx, w * 0.08, h * 0.34, w * 0.84, h * 0.40, '#8a5a2b');
    poly(ctx, [[w * 0.05, h * 0.36], [w * 0.50, h * 0.14], [w * 0.95, h * 0.36]], '#5a3a1a');
    // banner (red left, purple right); motif dots 3 vs 6
    rect(ctx, w * 0.34, h * 0.16, w * 0.32, 30, side === 0 ? '#c0392b' : '#7b2fbe');
    const dots = side === 0 ? 3 : 6;
    for (let i = 0; i < dots; i++) {
      circle(ctx, w * (0.37 + i * 0.05), h * 0.185, 4, '#ffd94d');
    }
    // windows + door
    for (let i = 0; i < 4; i++) rect(ctx, w * (0.14 + i * 0.18), h * 0.44, 30, 34, '#ffd94d');
    rect(ctx, w * 0.46, h * 0.56, 44, 72, '#3a2410');
    // gong: left panel only
    if (side === 0) {
      circle(ctx, w * 0.84, h * 0.42, 22, '#d4a017');
      circle(ctx, w * 0.84, h * 0.42, 12, '#b8860b');
    }
    // mask: bigger on the right
    const ms = side === 0 ? 1 : 1.7;
    ellipse(ctx, w * 0.50, h * 0.38, 16 * ms, 20 * ms, '#f4e3c2');
    circle(ctx, w * 0.49, h * 0.375, 3 * ms, '#10222e');
    circle(ctx, w * 0.51, h * 0.375, 3 * ms, '#10222e');
    // torches: left at 0.72, right at 0.26
    const tx = side === 0 ? w * 0.72 : w * 0.26;
    line(ctx, tx, h * 0.55, tx, h * 0.70, '#5a3a1a', 5);
    poly(ctx, [[tx - 7, h * 0.55], [tx, h * 0.46], [tx + 7, h * 0.55]], '#ff9f1c');
    line(ctx, w * 0.28, h * 0.55, w * 0.28, h * 0.70, '#5a3a1a', 5);
    poly(ctx, [[w * 0.28 - 7, h * 0.55], [w * 0.28, h * 0.46], [w * 0.28 + 7, h * 0.55]], '#ff9f1c');
    // dancer
    if (side === 0) ellipse(ctx, w * 0.50, h * 0.82, 52, 9, 'rgba(0,0,0,0.3)');
    circle(ctx, w * 0.50, h * 0.66, 14, '#f4c99b');
    poly(ctx, [[w * 0.47, h * 0.64], [w * 0.50, h * 0.56], [w * 0.53, h * 0.64]], '#e74c3c');
    ellipse(ctx, w * 0.50, h * 0.74, 18, 22, '#2f7fe0');
    line(ctx, w * 0.44, h * 0.72, w * 0.36, h * 0.62, '#f4c99b', 7);
    line(ctx, w * 0.56, h * 0.72, w * 0.64, h * 0.62, '#f4c99b', 7);
    // drum: right panel only
    if (side === 1) {
      ellipse(ctx, w * 0.16, h * 0.74, 22, 14, '#a5692e');
      rect(ctx, w * 0.16 - 22, h * 0.74, 44, 18, '#8a5a2b');
      ellipse(ctx, w * 0.16, h * 0.74, 22, 6, '#f4e3c2');
    }
    rect(ctx, 0, h * 0.86, w, h * 0.14, '#6b4423');
    text(ctx, 'FESTIVAL RUMAH PANJANG', w * 0.5, h * 0.95, 15, 'rgba(255,255,255,0.9)');
  },
};

// ---------------------------------------------------------------- scene 8
// Matahari terbit pegunungan. Diffs:
// 0 missing eagle | 1 color sun | 2 added pine | 3 moved cloud
// 4 size rock | 5 shadow peak | 6 pattern snow cap
const scene8 = {
  id: 7,
  name: 'Matahari Terbit Pegunungan',
  diffs: [
    { x: 0.66, y: 0.22, r: 28, kind: 'missing', note: 'Elang di langit hilang' },
    { x: 0.50, y: 0.30, r: 40, kind: 'color', note: 'Matahari berubah warna' },
    { x: 0.16, y: 0.66, r: 30, kind: 'added', note: 'Pohon pinus muncul' },
    { x: 0.22, y: 0.14, r: 40, kind: 'moved', note: 'Awan pindah tempat' },
    { x: 0.80, y: 0.78, r: 32, kind: 'size', note: 'Batu membesar' },
    { x: 0.50, y: 0.72, r: 52, kind: 'shadow', note: 'Bayangan gunung hilang' },
    { x: 0.30, y: 0.42, r: 36, kind: 'pattern', note: 'Pola salju berubah' },
  ],
  draw(ctx, w, h, side) {
    sky(ctx, w, h, '#ffd98e', '#ff9e7d');
    // sun (orange left, red right)
    circle(ctx, w * 0.50, h * 0.30, 40, side === 0 ? '#ff9f1c' : '#e74c3c');
    circle(ctx, w * 0.50, h * 0.30, 56, 'rgba(255,159,28,0.3)');
    const cx = side === 0 ? w * 0.22 : w * 0.80;
    cloud(ctx, cx, h * 0.14, 0.9, 'rgba(255,255,255,0.9)');
    cloud(ctx, w * 0.55, h * 0.08, 0.6, 'rgba(255,255,255,0.8)');
    // eagle: left panel only
    if (side === 0) bird(ctx, w * 0.66, h * 0.22, 1.2, '#3a2410');
    // mountains
    poly(ctx, [[w * 0.02, h * 0.78], [w * 0.30, h * 0.34], [w * 0.58, h * 0.78]], '#7d6a9e');
    poly(ctx, [[w * 0.42, h * 0.78], [w * 0.68, h * 0.28], [w * 0.98, h * 0.78]], '#5e4a7a');
    // snow caps: zigzag 3 peaks left, 5 right
    const peaks = side === 0 ? 3 : 5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w * 0.30 - 42, h * 0.42);
    for (let i = 0; i < peaks; i++) {
      ctx.lineTo(w * (0.30 - 0.07 + i * 0.028), h * (0.36 + (i % 2) * 0.05));
    }
    ctx.lineTo(w * 0.30 + 42, h * 0.42);
    ctx.lineTo(w * 0.30, h * 0.34);
    ctx.closePath();
    ctx.fill();
    poly(ctx, [[w * 0.68 - 30, h * 0.38], [w * 0.68, h * 0.28], [w * 0.68 + 30, h * 0.38]], '#ffffff');
    // lake
    ellipse(ctx, w * 0.50, h * 0.86, w * 0.42, h * 0.08, '#4db2d6');
    ellipse(ctx, w * 0.50, h * 0.86, w * 0.30, h * 0.05, 'rgba(255,255,255,0.35)');
    if (side === 0) ellipse(ctx, w * 0.50, h * 0.72, 90, 12, 'rgba(0,0,0,0.18)');
    // rock: bigger on the right
    const rs = side === 0 ? 1 : 1.9;
    poly(ctx, [[w * 0.80 - 22 * rs, h * 0.80], [w * 0.80, h * 0.70], [w * 0.80 + 22 * rs, h * 0.80]], '#6b6b6b');
    // pines; one added on the right
    poly(ctx, [[w * 0.86, h * 0.78], [w * 0.90, h * 0.56], [w * 0.94, h * 0.78]], '#1d5c2e');
    poly(ctx, [[w * 0.06, h * 0.78], [w * 0.09, h * 0.60], [w * 0.12, h * 0.78]], '#1d5c2e');
    if (side === 1) poly(ctx, [[w * 0.13, h * 0.78], [w * 0.16, h * 0.60], [w * 0.19, h * 0.78]], '#2f8f4e');
    text(ctx, 'PEGUNUNGAN MERATUS', w * 0.5, h * 0.96, 15, 'rgba(255,255,255,0.9)');
  },
};

export const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];
