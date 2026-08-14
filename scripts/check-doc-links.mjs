import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { filesUnder } from './lib/files.mjs';

const root = resolve(import.meta.dirname, '..');
const markdown = await filesUnder(root, (path) => path.endsWith('.md'));
async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}
for (const path of markdown) {
  const content = await readFile(path, 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
    const absolute = resolve(dirname(path), decodeURIComponent(target));
    if (await exists(absolute)) continue;
    const canonicalDocsAvailable = await exists(resolve(root, '../docs'));
    if (target.startsWith('../docs/') && !canonicalDocsAvailable) continue;
    throw new Error(`${path}: broken link: ${target}`);
  }
}
console.log(`docs: links checked in ${markdown.length} files`);
