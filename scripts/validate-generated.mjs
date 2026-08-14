import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const snapshotPath = new URL('../generated/contract-snapshot.json', import.meta.url);
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
if (snapshot.schemaVersion !== 1 || snapshot.sourceRepository !== 'cloudgta-platform') throw new Error('invalid generated contract snapshot');
if (!/^[a-f0-9]{64}$/.test(snapshot.sourceDigestSha256)) throw new Error('source digest must be SHA-256');
const expected = createHash('sha256').update('cloudgta-platform:bootstrap-ticket-01').digest('hex');
if (snapshot.sourceDigestSha256 !== expected) throw new Error('generated snapshot digest does not match bootstrap source marker');
console.log('schema: generated contract snapshot validated');

