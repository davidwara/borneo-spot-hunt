// Borneo Spot Hunt — entrypoint: hand the game in.
// Node 22, standard library only. Reads the output directory from
// MAKEFUN_OUTPUT_DIR (default /output), copies game/ and screenshots/
// there, and writes dossier.json with buildDossier from the vendored
// library ./vendor/makefun-game.ts. Deterministic: running it twice
// writes the same bytes (no dates, times or unseeded randomness).
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

mkdirSync(outDir, { recursive: true });

const gameSrc = join(repoRoot, 'game');
const gameDst = join(outDir, 'game');
if (!existsSync(join(gameSrc, 'index.html'))) {
  throw new Error('main.ts: game/index.html is missing in the repository');
}
cpSync(gameSrc, gameDst, { recursive: true });

const shotsSrc = join(repoRoot, 'screenshots');
const shotsDst = join(outDir, 'screenshots');
mkdirSync(shotsDst, { recursive: true });
if (existsSync(shotsSrc)) {
  for (const name of readdirSync(shotsSrc).sort()) {
    if (name.startsWith('.')) continue;
    cpSync(join(shotsSrc, name), join(shotsDst, name));
  }
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
const shotNames = existsSync(shotsDst) ? readdirSync(shotsDst).filter((n) => !n.startsWith('.')).sort() : [];
console.log('wrote ' + join(outDir, 'dossier.json') + ' (' + dossier.length + ' bytes, ' + shotNames.length + ' screenshots)');
