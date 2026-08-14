import { readFile } from 'node:fs/promises';

const snapshotPath = new URL('../generated/contract-snapshot.json', import.meta.url);
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
const upstream = JSON.parse(await readFile(new URL('../upstream.lock.json', import.meta.url), 'utf8'));
if (snapshot.schemaVersion !== 1 || snapshot.sourceRepository !== 'cloudgta-platform') throw new Error('invalid generated contract snapshot');
if (!/^[a-f0-9]{40}$/.test(snapshot.sourceRevision)) throw new Error('source revision must be an exact platform commit');
if (snapshot.sourceDigestSha256 !== 'd729f638086588550b5e9b4110654718e1a0f7d741532334512f5c29cba5d8aa') {
  throw new Error('generated snapshot digest does not match the locked platform evidence schema');
}
if (snapshot.contracts.length !== 1 || snapshot.contracts[0] !== 'contracts/schemas/evidence-v1.schema.json') {
  throw new Error('generated snapshot contract inventory is invalid');
}
if (upstream.repository !== 'https://github.com/streetpea/chiaki-ng.git') throw new Error('unexpected Player upstream repository');
if (upstream.revision !== '' || upstream.revisionStatus !== 'selection-required-by-ticket-02') {
  throw new Error('ticket 01 must not silently select an unvalidated upstream revision');
}
console.log('schema: generated contract snapshot validated');
