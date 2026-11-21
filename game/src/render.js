// Borneo Spot Hunt — everything drawn on the one canvas: the HUD, the two
// panels with found markers, and every screen (title, map, pause, level
// done, game over, all done). The HUD is always visible while playing.
import { GAME, SCENE_LIST } from './config.js';
import { SCENES } from './scenes.js';

const W = GAME.width;
const H = GAME.height;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = (weight || 'bold') + ' ' + size + 'px sans-serif';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function button(ctx, x, y, w, h, label, bg, fg) {
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, 18, fg || '#fff');
}

function panelFrame(ctx, x, tag) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  roundRect(ctx, x, GAME.panelY, GAME.panelWidth, GAME.panelHeight, 12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, x + 10, GAME.panelY + 10, 96, 28, 8);
  ctx.fill();
  text(ctx, tag, x + 58, GAME.panelY + 25, 15, '#fff');
}

function drawPanel(ctx, state, side) {
  const scene = SCENES[state.level];
  const x = side === 0 ? GAME.leftX : GAME.rightX;
  const y = GAME.panelY;
  const pw = GAME.panelWidth;
  const ph = GAME.panelHeight;
  ctx.save();
  roundRect(ctx, x, y, pw, ph, 12);
  ctx.clip();
  ctx.translate(x, y);
  scene.draw(ctx, pw, ph, side);
  ctx.restore();
  panelFrame(ctx, x, side === 0 ? 'ASLI' : 'BERUBAH');
  // found markers: green ring + check on BOTH panels
  scene.diffs.forEach((d, i) => {
    if (!state.found.has(i)) return;
    const mx = x + d.x * pw;
    const my = y + d.y * ph;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(mx, my, d.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(34,197,94,0.25)';
    ctx.beginPath();
    ctx.arc(mx, my, d.r, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, '✓', mx, my, 26, '#16a34a');
  });
  // hint pulse on the hinted difference
  if (state.hintDiff !== null && state.hintDiff !== undefined) {
    const d = scene.diffs[state.hintDiff];
    if (d && !state.found.has(state.hintDiff)) {
      const pulse = 1 + 0.18 * Math.sin(state.now / 180);
      const mx = x + d.x * pw;
      const my = y + d.y * ph;
      ctx.strokeStyle = '#ffd94d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(mx, my, d.r * pulse + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // wrong-click red X marks, fading
  state.wrongMarks.forEach((m) => {
    if (m.side !== side) return;
    const mx = x + m.x * pw;
    const my = y + m.y * ph;
    const a = Math.max(0, m.life);
    ctx.strokeStyle = 'rgba(239,68,68,' + a + ')';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(mx - 14, my - 14);
    ctx.lineTo(mx + 14, my + 14);
    ctx.moveTo(mx + 14, my - 14);
    ctx.lineTo(mx - 14, my + 14);
    ctx.stroke();
  });
}

function drawHud(ctx, state) {
  const scene = SCENES[state.level];
  ctx.fillStyle = '#10222e';
  ctx.fillRect(0, 0, W, GAME.hudHeight);
  ctx.fillStyle = '#0b1a24';
  ctx.fillRect(0, GAME.hudHeight - 4, W, 4);
  text(ctx, 'LEVEL ' + (state.level + 1) + ' — ' + scene.name.toUpperCase(), 24, 26, 20, '#ffd94d', 'left');
  text(ctx, 'DITEMUKAN ' + state.found.size + ' / 7', 24, 54, 16, '#e8f7ff', 'left');
  // big remaining counter
  const left = 7 - state.found.size;
  text(ctx, 'SISA: ' + left, 640, 30, 34, left <= 2 ? '#ff8f5e' : '#ffffff');
  // timer bar
  const tw = 220;
  const frac = Math.max(0, state.timeLeft / GAME.timeLimit);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, 530, 52, tw, 14, 7);
  ctx.fill();
  ctx.fillStyle = frac > 0.33 ? '#22c55e' : '#ef4444';
  roundRect(ctx, 530, 52, tw * frac, 14, 7);
  ctx.fill();
  text(ctx, Math.ceil(state.timeLeft) + ' dtk', 640, 54, 13, '#fff');
  text(ctx, 'SKOR ' + state.score, 900, 26, 20, '#fff', 'left');
  text(ctx, 'COMBO x' + Math.max(1, state.combo) + '   HINT ' + state.hintsLeft + '   SALAH ' + state.mistakes, 900, 54, 15, '#9fd8ef', 'left');
  // HUD buttons
  state.hudButtons = [
    { id: 'hint', label: 'HINT (H)', x: 1120, y: 14, w: 62, h: 24 },
    { id: 'pause', label: 'JEDA', x: 1120, y: 44, w: 62, h: 24 },
    { id: 'mute', label: state.muted ? 'SUARA: OFF' : 'SUARA: ON', x: 1190, y: 14, w: 66, h: 24 },
    { id: 'menu', label: 'MENU', x: 1190, y: 44, w: 66, h: 24 },
  ];
  state.hudButtons.forEach((b) => {
    ctx.fillStyle = '#1e4a63';
    roundRect(ctx, b.x, b.y, b.w, b.h, 6);
    ctx.fill();
    text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, 11, '#fff');
  });
}

function drawBottomHint(ctx, state) {
  text(ctx, 'Klik perbedaan di panel kiri ATAU kanan  •  H = hint   R = ulang level   M = suara   Esc = jeda', 640, GAME.bottomY + 18, 15, '#cfe8f5');
  const scene = SCENES[state.level];
  const last = state.lastNote || '';
  if (last) text(ctx, last, 640, GAME.bottomY + 42, 15, '#ffd94d');
}

function starRow(ctx, cx, y, stars, size) {
  for (let i = 0; i < 3; i++) {
    text(ctx, '★', cx + (i - 1) * (size + 14), y, size, i < stars ? '#ffd94d' : 'rgba(255,255,255,0.25)');
  }
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(6,20,30,0.72)';
  ctx.fillRect(0, 0, W, H);
}

function drawTitle(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b3d5c');
  g.addColorStop(1, '#0f7a5c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // decorative canopy + monkey silhouette strip
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(90 + i * 160, 640, 90, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, '🌿 BORNEO SPOT HUNT 🌿', 640, 150, 58, '#ffd94d');
  text(ctx, 'Cari 7 Perbedaan di Setiap Scene Borneo', 640, 215, 26, '#ffffff');
  text(ctx, 'Dua gambar nyaris identik. Klik perbedaannya di panel kiri atau kanan.', 640, 252, 18, '#cfe8f5');
  text(ctx, '8 level  •  90 detik per level  •  3 hint per level  •  Klik salah −5 detik', 640, 282, 18, '#cfe8f5');
  button(ctx, 490, 330, 300, 56, '▶  MAIN', '#22c55e', '#06210f');
  button(ctx, 490, 400, 300, 56, '🗺  PETA LEVEL', '#1e4a63');
  button(ctx, 490, 470, 300, 56, '❓  CARA MAIN', '#1e4a63');
  const best = state.progress.best || 0;
  text(ctx, 'SKOR TERBAIK: ' + best + '   •   LEVEL TERBUKA: ' + state.progress.unlocked + '/8', 640, 570, 18, '#ffd94d');
  text(ctx, 'Kontrol: klik/tap • H hint • R ulang • M suara • Esc jeda • 1–8 pilih level', 640, 610, 15, '#9fd8ef');
  state.titleButtons = [
    { id: 'play', x: 490, y: 330, w: 300, h: 56 },
    { id: 'map', x: 490, y: 400, w: 300, h: 56 },
    { id: 'how', x: 490, y: 470, w: 300, h: 56 },
  ];
}

function drawHow(ctx, state) {
  overlay(ctx);
  ctx.fillStyle = '#10222e';
  roundRect(ctx, 290, 110, 700, 500, 16);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'CARA MAIN', 640, 160, 32, '#ffd94d');
  const lines = [
    '• Dua gambar berdampingan: kiri ASLI, kanan BERUBAH.',
    '• Klik 7 perbedaan di panel mana pun untuk menemukannya.',
    '• Klik benar beruntun menaikkan COMBO dan skor.',
    '• Klik salah: tanda X merah dan waktu −5 detik.',
    '• HINT (H) menyorot satu perbedaan — biaya 50 poin.',
    '• Selesaikan sebelum 90 detik habis untuk bintang 1–3.',
    '• Bintang 3: sisa ≥45 detik dan tanpa kesalahan.',
    '• Buka semua 8 level dan kumpulkan skor terbaikmu!',
  ];
  lines.forEach((l, i) => text(ctx, l, 640, 215 + i * 38, 18, '#e8f7ff'));
  button(ctx, 540, 540, 200, 48, 'TUTUP', '#22c55e', '#06210f');
  state.howButton = { id: 'close', x: 540, y: 540, w: 200, h: 48 };
}

function drawMap(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b3d5c');
  g.addColorStop(1, '#123f2a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'PETA LEVEL — BORNEO', 640, 60, 40, '#ffd94d');
  text(ctx, 'Pilih level (atau tekan angka 1–8). Level terkunci terbuka setelah level sebelumnya selesai.', 640, 100, 17, '#cfe8f5');
  state.mapCards = [];
  SCENE_LIST.forEach((s, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 84 + col * 290;
    const y = 150 + row * 230;
    const locked = i >= state.progress.unlocked;
    const stars = state.progress.stars[i] || 0;
    ctx.fillStyle = locked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.14)';
    roundRect(ctx, x, y, 260, 200, 14);
    ctx.fill();
    ctx.strokeStyle = locked ? 'rgba(255,255,255,0.15)' : '#ffd94d';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, locked ? '🔒' : 'LEVEL ' + (i + 1), x + 130, y + 30, 24, locked ? '#8aa5b5' : '#ffd94d');
    text(ctx, s.name, x + 130, y + 70, 19, locked ? '#8aa5b5' : '#fff');
    text(ctx, s.tag, x + 130, y + 100, 14, '#9fd8ef');
    starRow(ctx, x + 130, y + 140, stars, 26);
    text(ctx, ['Mudah', 'Mudah', 'Sedang', 'Sedang', 'Sedang', 'Sulit', 'Sulit', 'Sulit'][i], x + 130, y + 172, 14, '#cfe8f5');
    state.mapCards.push({ level: i, x, y, w: 260, h: 200, locked });
  });
  button(ctx, 540, 630, 200, 48, '← KEMBALI', '#1e4a63');
  state.mapBack = { id: 'back', x: 540, y: 630, w: 200, h: 48 };
}

function drawPlay(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0e2f42');
  g.addColorStop(1, '#0a1c28');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawHud(ctx, state);
  drawPanel(ctx, state, 0);
  drawPanel(ctx, state, 1);
  drawBottomHint(ctx, state);
}

function drawPause(ctx, state) {
  drawPlay(ctx, state);
  overlay(ctx);
  text(ctx, '⏸  JEDA', 640, 250, 48, '#ffd94d');
  text(ctx, 'Level ' + (state.level + 1) + ' — ' + SCENES[state.level].name, 640, 310, 22, '#fff');
  button(ctx, 490, 350, 300, 52, '▶  LANJUTKAN', '#22c55e', '#06210f');
  button(ctx, 490, 415, 300, 52, '↻  ULANG LEVEL', '#1e4a63');
  button(ctx, 490, 480, 300, 52, '🗺  PETA LEVEL', '#1e4a63');
  state.pauseButtons = [
    { id: 'resume', x: 490, y: 350, w: 300, h: 52 },
    { id: 'restart', x: 490, y: 415, w: 300, h: 52 },
    { id: 'map', x: 490, y: 480, w: 300, h: 52 },
  ];
}

function drawLevelDone(ctx, state) {
  drawPlay(ctx, state);
  overlay(ctx);
  ctx.fillStyle = '#10222e';
  roundRect(ctx, 340, 130, 600, 460, 18);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'LEVEL SELESAI!', 640, 185, 40, '#ffd94d');
  starRow(ctx, 640, 250, state.starsEarned, 54);
  text(ctx, SCENES[state.level].name, 640, 310, 24, '#fff');
  text(ctx, 'SKOR LEVEL: ' + state.levelScore, 640, 355, 24, '#fff');
  text(ctx, 'Bonus waktu: +' + state.timeBonus + '   •   Kesalahan: ' + state.mistakes, 640, 390, 17, '#9fd8ef');
  text(ctx, 'TOTAL SKOR: ' + state.totalScore, 640, 425, 20, '#ffd94d');
  const last = state.level >= 7;
  button(ctx, 400, 470, 200, 52, '↻  ULANGI', '#1e4a63');
  button(ctx, 660, 470, 220, 52, last ? '🏆  SELESAI' : 'BERIKUTNYA ▶', '#22c55e', '#06210f');
  button(ctx, 490, 535, 300, 44, '🗺  PETA LEVEL', '#1e4a63');
  state.doneButtons = [
    { id: 'replay', x: 400, y: 470, w: 200, h: 52 },
    { id: 'next', x: 660, y: 470, w: 220, h: 52 },
    { id: 'map', x: 490, y: 535, w: 300, h: 44 },
  ];
}

function drawGameOver(ctx, state) {
  drawPlay(ctx, state);
  overlay(ctx);
  text(ctx, '⏰  WAKTU HABIS!', 640, 260, 48, '#ff8f5e');
  text(ctx, 'Kamu menemukan ' + state.found.size + ' dari 7 perbedaan di ' + SCENES[state.level].name + '.', 640, 320, 20, '#fff');
  text(ctx, 'Coba lagi — perbedaannya masih menunggumu!', 640, 355, 18, '#cfe8f5');
  button(ctx, 490, 400, 300, 52, '↻  COBA LAGI', '#22c55e', '#06210f');
  button(ctx, 490, 465, 300, 52, '🗺  PETA LEVEL', '#1e4a63');
  state.overButtons = [
    { id: 'retry', x: 490, y: 400, w: 300, h: 52 },
    { id: 'map', x: 490, y: 465, w: 300, h: 52 },
  ];
}

function drawWin(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b3d5c');
  g.addColorStop(1, '#b8860b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  text(ctx, '🏆  KAMU MENANG!  🏆', 640, 150, 52, '#ffd94d');
  text(ctx, 'Semua 8 scene Borneo berhasil diselesaikan!', 640, 215, 24, '#fff');
  const totalStars = Object.values(state.progress.stars).reduce((a, b) => a + b, 0);
  starRow(ctx, 640, 285, Math.min(3, Math.round(totalStars / 8)), 54);
  text(ctx, 'TOTAL BINTANG: ' + totalStars + ' / 24', 640, 340, 24, '#ffd94d');
  text(ctx, 'TOTAL SKOR: ' + state.totalScore + '   •   SKOR TERBAIK: ' + state.progress.best, 640, 385, 22, '#fff');
  button(ctx, 490, 440, 300, 52, '↻  MAIN LAGI', '#22c55e', '#06210f');
  button(ctx, 490, 505, 300, 52, '🗺  PETA LEVEL', '#1e4a63');
  state.winButtons = [
    { id: 'again', x: 490, y: 440, w: 300, h: 52 },
    { id: 'map', x: 490, y: 505, w: 300, h: 52 },
  ];
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);
  switch (state.screen) {
    case 'title': drawTitle(ctx, state); break;
    case 'how': drawTitle(ctx, state); drawHow(ctx, state); break;
    case 'map': drawMap(ctx, state); break;
    case 'play': drawPlay(ctx, state); break;
    case 'pause': drawPause(ctx, state); break;
    case 'leveldone': drawLevelDone(ctx, state); break;
    case 'gameover': drawGameOver(ctx, state); break;
    case 'win': drawWin(ctx, state); break;
    default: drawTitle(ctx, state);
  }
}
