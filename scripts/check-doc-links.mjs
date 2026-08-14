import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { filesUnder } from './lib/files.mjs';

const root = resolve(import.meta.dirname, '..');
const markdown = await filesUnder(root, (path) => path.endsWith('.md'));
const lock = JSON.parse(await readFile(resolve(root, 'canonical-docs.lock.json'), 'utf8'));
async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}
for (const path of markdown) {
  const content = await readFile(path, 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
    const absolute = resolve(dirname(path), decodeURIComponent(target));
    if (target.startsWith('../docs/')) {
      const expectedDigest = lock.links[target];
      if (!/^[a-f0-9]{64}$/.test(expectedDigest ?? '')) throw new Error(`${path}: canonical docs link is not locked: ${target}`);
      if (await exists(absolute)) {
        const digest = createHash('sha256').update(await readFile(absolute)).digest('hex');
        if (digest !== expectedDigest) throw new Error(`${path}: canonical docs digest changed: ${target}`);
      }
      continue;
    }
    if (await exists(absolute)) continue;
    throw new Error(`${path}: broken link: ${target}`);
  }
}
console.log(`docs: links checked in ${markdown.length} files`);
