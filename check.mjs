import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { docs, protocols, localExample } from './data.js';

const root = new URL('./', import.meta.url);
const pages = new Map();
for (const name of ['index.html', 'docs.html']) {
  const html = await readFile(new URL(name, root), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, name + ' contains duplicate IDs');
  pages.set(name, { html, ids: new Set(ids) });
}

assert.equal(protocols.length, 12, 'The explorer should expose all 12 native transports');
assert.equal(new Set(protocols.map(({ id }) => id)).size, protocols.length);
assert.equal(new Set(docs.map(({ id }) => id)).size, docs.length);
for (const protocol of protocols) {
  const manual = JSON.parse(protocol.manual);
  assert.equal(manual.utcp_version, '1.1.0');
  assert.equal(manual.tools[0].tool_call_template.call_template_type, protocol.id);
  assert(protocol.code.includes('client:'));
  assert(protocol.codeMode.includes('codemode'));
}

const html = [...pages.values()].map((page) => page.html).join('\n')
  + docs.flatMap((doc) => doc.blocks.map((block) => block.text || '')).join('\n');
let checked = 0;
for (const [, attribute] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^(https?:|mailto:|data:)/.test(attribute)) continue;
  const url = new URL(attribute, root);
  assert(url.href.startsWith(root.href), 'Asset escapes the website: ' + attribute);
  const path = url.pathname.endsWith('/') ? new URL('index.html', url) : url;
  assert((await stat(fileURLToPath(path))).isFile(), 'Missing local asset: ' + attribute);
  const topic = url.searchParams.get('topic');
  if (topic) assert(docs.some((doc) => doc.id === topic), 'Unknown docs topic: ' + topic);
  if (url.hash) {
    const id = decodeURIComponent(url.hash.slice(1));
    assert([...pages.values()].some((page) => page.ids.has(id))
      || protocols.some((protocol) => 'transport-' + protocol.id === id), 'Missing anchor: ' + attribute);
  }
  checked++;
}
assert.equal((await readFile(new URL('examples/hello.lua', root), 'utf8')).trim(), localExample.trim());
console.log('Checked ' + checked + ' local links, ' + protocols.length + ' transport manuals, and ' + docs.length + ' documentation topics.');
