import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { filesUnder } from './files.mjs';

export async function validateMarkdownLinks({ root }) {
  const markdown = await filesUnder(root, (path) => path.endsWith('.md'));
  const lock = JSON.parse(await readFile(resolve(root, 'canonical-docs.lock.json'), 'utf8'));
  for (const path of markdown) {
    const content = await readFile(path, 'utf8');
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
      const absolute = resolve(dirname(path), decodeURIComponent(target));
      if (target.startsWith('../docs/')) {
        const expectedDigest = lock.links[target];
        if (!/^[a-f0-9]{64}$/.test(expectedDigest ?? '')) throw new Error(`${path}: canonical docs link is not locked: ${target}`);
        let canonical;
        try {
          canonical = await readFile(absolute);
        } catch (error) {
          if (error.code === 'ENOENT') throw new Error(`${path}: canonical docs link is missing: ${target}`);
          throw error;
        }
        const digest = createHash('sha256').update(canonical).digest('hex');
        if (digest !== expectedDigest) throw new Error(`${path}: canonical docs digest changed: ${target}`);
        continue;
      }
      try {
        await readFile(absolute);
      } catch (error) {
        if (error.code === 'ENOENT') throw new Error(`${path}: broken link: ${target}`);
        throw error;
      }
    }
  }
  if (!/^[a-f0-9]{40}$/.test(lock.revision ?? '')) throw new Error('canonical docs revision is not locked');
  const docsRoot = resolve(root, '../docs');
  const revision = spawnSync('git', ['-C', docsRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  if (revision.status !== 0) throw new Error('canonical docs package is not a Git checkout');
  if (revision.stdout.trim() !== lock.revision) throw new Error(`canonical docs revision changed: expected ${lock.revision}, found ${revision.stdout.trim()}`);
  return markdown.length;
}
