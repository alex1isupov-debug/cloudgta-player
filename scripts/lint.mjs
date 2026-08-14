import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { filesUnder } from './lib/files.mjs';

const root = resolve(import.meta.dirname, '..');
const files = await filesUnder(root, (path) => path.endsWith('.mjs'));
for (const path of files) {
  const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`lint: ${files.length} modules parsed`);

