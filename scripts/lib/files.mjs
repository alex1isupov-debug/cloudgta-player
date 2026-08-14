import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function filesUnder(root, accept = () => true) {
  const output = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (['.git', 'build', 'artifacts'].includes(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (accept(path)) output.push(path);
    }
  }
  await visit(root);
  return output;
}

