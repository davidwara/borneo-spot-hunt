// Borneo Spot Hunt — tuning constants and level roster.
// All art is procedural Canvas 2D; no image or audio files are loaded.
export const GAME = {
  title: 'BORNEO SPOT HUNT',
  subtitle: 'Cari 7 Perbedaan di Setiap Scene Borneo',
  width: 1280,
  height: 720,
  hudHeight: 76,
  panelY: 88,
  panelHeight: 556,
  panelWidth: 596,
  panelGap: 16,
  leftX: 24,
  rightX: 636,
  bottomY: 656,
  timeLimit: 90,
  hintsPerLevel: 3,
  wrongPenalty: 5,
  diffsPerLevel: 7,
  basePoints: 100,
  comboBonus: 25,
  hintCost: 50,
  timeBonusPerSecond: 10,
  storageKey: 'borneo-spot-hunt-v1',
};

// Roster of the eight Borneo scenes. The drawing itself lives in scenes.js;
// this list is what the level map, the HUD and the README all read from.
export const SCENE_LIST = [
  { id: 0, name: 'Kanopi Hutan Hujan', tag: 'Bekantan di pepohonan', sky: ['#7ec8e3', '#c8f0c0'], difficulty: 1 },
  { id: 1, name: 'Pasar Terapung', tag: 'Jukung & buah di sungai', sky: ['#ffe9a8', '#ffb36b'], difficulty: 1 },
  { id: 2, name: 'Perahu Klotok', tag: 'Menyusuri Sungai Barito', sky: ['#aee2ff', '#e8f7ff'], difficulty: 2 },
  { id: 3, name: 'Api Unggun Malam', tag: 'Berkemah di bawah bintang', sky: ['#141b3d', '#3b2a63'], difficulty: 2 },
  { id: 4, name: 'Suaka Orangutan', tag: 'Pemberian makan pagi', sky: ['#bfe8a8', '#fff3c4'], difficulty: 2 },
  { id: 5, name: 'Terumbu Karang', tag: 'Menyelam di Derawan', sky: ['#0b6fa4', '#37c6e8'], difficulty: 3 },
  { id: 6, name: 'Festival Rumah Panjang', tag: 'Tari Dayak & gong', sky: ['#ffcf7d', '#ff8f5e'], difficulty: 3 },
  { id: 7, name: 'Matahari Terbit Pegunungan', tag: 'Meratus di pagi hari', sky: ['#ffd98e', '#ff9e7d'], difficulty: 3 },
];

// Stars from time left + mistakes at level end.
export function starsFor(timeLeft, mistakes) {
  if (timeLeft >= 45 && mistakes === 0) return 3;
  if (timeLeft >= 25 && mistakes <= 2) return 2;
  return 1;
}

// Deterministic tiny PRNG (mulberry32) so decorative dots never change.
export function seeded(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
