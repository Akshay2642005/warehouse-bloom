import { readdirSync, statSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';

const ROOT = join(process.cwd(), 'src');
const removed: string[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (extname(full) === '.js') {
      const tsPeer = full.slice(0, -3) + '.ts';
      try {
        // only remove if .ts peer exists
        statSync(tsPeer);
        unlinkSync(full);
        removed.push(full);
      } catch {}
    }
  }
}

walk(ROOT);
console.log('Removed JS artifacts:', removed.length);
removed.forEach(f => console.log(' -', f));