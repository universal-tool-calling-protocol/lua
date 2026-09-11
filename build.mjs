import { cp, mkdir, rm } from 'node:fs/promises';
import { basename } from 'node:path';

const source = new URL('./', import.meta.url);
const destination = new URL('./dist/', import.meta.url);
const publicFiles = [
  'index.html',
  'docs.html',
  'styles.css',
  'app.js',
  'data.js',
  'assets',
  'examples',
];

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const path of publicFiles) {
  await cp(new URL(path, source), new URL(path, destination), {
    recursive: true,
    dereference: true,
    filter: (path) => !basename(path).startsWith('.'),
  });
}

console.log('Built Lua UTCP website in dist/');
