import { resolve } from 'node:path';
import { validateMarkdownLinks } from './lib/canonical-docs.mjs';

const root = resolve(import.meta.dirname, '..');
const count = await validateMarkdownLinks({ root });
console.log(`docs: links checked in ${count} files`);
