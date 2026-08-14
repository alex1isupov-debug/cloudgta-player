import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateMarkdownLinks } from '../../scripts/lib/canonical-docs.mjs';

test('canonical documentation must exist even when its digest is locked', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'cloudgta-docs-'));
  const repository = join(workspace, 'cloudgta-player');
  await mkdir(repository);
  const target = '../docs/02-architecture/PROJECT-STRUCTURE.md';
  const digest = createHash('sha256').update('canonical').digest('hex');
  await writeFile(join(repository, 'README.md'), `[Structure](${target})\n`);
  await writeFile(join(repository, 'canonical-docs.lock.json'), `${JSON.stringify({ schemaVersion: 1, links: { [target]: digest } })}\n`);

  await assert.rejects(
    validateMarkdownLinks({ root: repository }),
    /canonical docs link is missing/,
  );
  await rm(workspace, { recursive: true, force: true });
});
