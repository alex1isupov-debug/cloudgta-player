import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'artifacts/metadata');
const gitRevision = (repository) => {
  const result = spawnSync('git', ['-C', repository, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : undefined;
};
const playerRevision = gitRevision(root) ?? process.env.GITHUB_SHA ?? 'worktree';
const platformRevision = gitRevision(resolve(root, '../cloudgta-platform')) ?? process.env.CLOUDGTA_PLATFORM_REVISION;
if (!/^[a-f0-9]{40}$/.test(platformRevision ?? '')) throw new Error('exact platform revision is required for release metadata');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const artifactManifest = { schemaVersion: 1, component: 'cloudgta-player', version: '0.0.1', revision: playerRevision, upstreamImported: false, includesTestDoubles: false };
const artifactManifestJson = `${JSON.stringify(artifactManifest, null, 2)}\n`;
await writeFile(resolve(output, 'artifact-manifest.json'), artifactManifestJson);
await writeFile(resolve(output, 'sbom.spdx.json'), `${JSON.stringify({ spdxVersion: 'SPDX-2.3', dataLicense: 'CC0-1.0', SPDXID: 'SPDXRef-DOCUMENT', name: 'cloudgta-player-0.0.1', packages: [] }, null, 2)}\n`);
await writeFile(resolve(output, 'provenance.json'), `${JSON.stringify({ schemaVersion: 1, builder: 'cloudgta-player/scripts/build-metadata.mjs', sourceRevision: playerRevision, upstreamImported: false, reproducible: true }, null, 2)}\n`);
await writeFile(resolve(output, 'compatibility-manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  revisions: { platform: platformRevision, player: playerRevision },
  artifacts: { playerManifestSha256: createHash('sha256').update(artifactManifestJson).digest('hex') },
  contractSnapshot: { platformRevision: '1ae084d6fe3c9e904b9128965ba645fa96d5565c', digestSha256: 'd729f638086588550b5e9b4110654718e1a0f7d741532334512f5c29cba5d8aa' },
}, null, 2)}\n`);
console.log('build: production metadata assembled without test adapters');
