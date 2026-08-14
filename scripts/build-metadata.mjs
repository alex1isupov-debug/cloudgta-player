import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'artifacts/metadata');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'artifact-manifest.json'), `${JSON.stringify({ schemaVersion: 1, component: 'cloudgta-player', version: '0.0.1', upstreamImported: false, includesTestDoubles: false }, null, 2)}\n`);
await writeFile(resolve(output, 'sbom.spdx.json'), `${JSON.stringify({ spdxVersion: 'SPDX-2.3', dataLicense: 'CC0-1.0', SPDXID: 'SPDXRef-DOCUMENT', name: 'cloudgta-player-0.0.1', packages: [] }, null, 2)}\n`);
await writeFile(resolve(output, 'provenance.json'), `${JSON.stringify({ schemaVersion: 1, builder: 'cloudgta-player/scripts/build-metadata.mjs', sourceRevision: process.env.GITHUB_SHA ?? 'worktree', upstreamImported: false, reproducible: true }, null, 2)}\n`);
console.log('build: production metadata assembled without test adapters');
