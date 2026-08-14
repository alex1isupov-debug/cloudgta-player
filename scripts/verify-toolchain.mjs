import { spawnSync } from 'node:child_process';

const expectedNode = 'v24.6.0';
const expectedCmake = '3.31.8';
if (process.version !== expectedNode) throw new Error(`Node ${expectedNode} is required; found ${process.version}`);
const cmake = spawnSync('cmake', ['--version'], { encoding: 'utf8' });
if (cmake.status !== 0) throw new Error('CMake is required; install 3.31.8 from toolchains.lock.json');
const actualCmake = /cmake version ([^\s]+)/.exec(cmake.stdout)?.[1];
if (actualCmake !== expectedCmake) throw new Error(`CMake ${expectedCmake} is required; found ${actualCmake ?? 'unknown'}`);
console.log(`toolchain: Node ${expectedNode}, CMake ${expectedCmake}`);
