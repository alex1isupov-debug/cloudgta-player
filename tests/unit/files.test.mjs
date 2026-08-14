import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { filesUnder } from '../../scripts/lib/files.mjs';

test('repository scans exclude installed toolchains', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'cloudgta-files-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, '.toolchains'), { recursive: true });
  await writeFile(join(root, '.toolchains', 'vendor.mjs'), 'vendor');
  await writeFile(join(root, 'owned.mjs'), 'owned');

  assert.deepEqual(await filesUnder(root, (path) => path.endsWith('.mjs')), [join(root, 'owned.mjs')]);
});
