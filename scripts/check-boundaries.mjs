import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { filesUnder } from './lib/files.mjs';

const root = resolve(import.meta.dirname, '..');
const production = await filesUnder(resolve(root, 'cloudgta'), (path) => /\.(?:cpp|h)$/.test(path));
for (const path of production) {
  const source = await readFile(path, 'utf8');
  if (/(?:tests\/|tests\\|fake_|astrowind|\.\.\/\.\.\/cloudgta-platform)/i.test(source)) throw new Error(`forbidden production dependency: ${path}`);
}
const cmake = await readFile(resolve(root, 'CMakeLists.txt'), 'utf8');
const productionBlock = cmake.split('if(CLOUDGTA_TESTING)')[0];
if (/(?:tests[\\/]|fake_[a-z0-9_]*\.(?:cpp|h))/i.test(productionBlock)) throw new Error('production target includes test source');
if (!cmake.includes('target_compile_definitions(cloudgta_player_unit PRIVATE CLOUDGTA_TEST_BUILD=1)')) throw new Error('test fake compile guard is missing');
console.log('boundaries: fake adapters are test-target-only');
