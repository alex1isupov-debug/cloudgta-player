import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { filesUnder } from './lib/files.mjs';

const root = resolve(import.meta.dirname, '..');
const files = await filesUnder(root, (path) => /\.(?:cpp|h|json|md|mjs|txt|yml|yaml|ps1)$/.test(path) || path.endsWith('CMakeLists.txt'));
const failures = [];
for (const path of files) {
  const content = await readFile(path, 'utf8');
  if (!content.endsWith('\n')) failures.push(`${path}: missing final newline`);
  if (/[ \t]+$/m.test(content)) failures.push(`${path}: trailing whitespace`);
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`format: ${files.length} files checked`);

