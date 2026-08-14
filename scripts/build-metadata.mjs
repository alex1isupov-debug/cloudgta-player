import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'artifacts/metadata');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'artifact-manifest.json'), `${JSON.stringify({ schemaVersion: 1, component: 'cloudgta-player', version: '0.0.1', upstreamImported: false, includesTestDoubles: false }, null, 2)}\n`);
console.log('build: production metadata assembled without test adapters');

