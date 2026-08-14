import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

test('bootstrap exposes an exact non-mutating toolchain plan', () => {
  const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
  const script = resolve(import.meta.dirname, '../../scripts/install-toolchain.ps1');
  const result = spawnSync(powershell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-Describe'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.deepEqual(plan.versions, {
    node: '24.6.0',
    cmake: '3.31.8',
    qt: '6.8.3',
    wix: '5.0.2',
    dotnet: '8.0.424',
    msvc: '14.44',
    windowsSdk: '10.0.26100.0',
  });
  assert.equal(plan.mutatesSystem, false);
  const lock = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../toolchains.lock.json'), 'utf8'));
  assert.match(lock.bootstrap.visualStudioBuildTools.sha256, /^[a-f0-9]{64}$/);
});
