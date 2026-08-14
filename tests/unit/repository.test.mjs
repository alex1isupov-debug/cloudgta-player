import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('production preset cannot enable test adapters', async () => {
  const presets = JSON.parse(await readFile(new URL('../../CMakePresets.json', import.meta.url)));
  const production = presets.configurePresets.find(({ name }) => name === 'production');
  assert.equal(production.cacheVariables.CLOUDGTA_TESTING, 'OFF');
});

