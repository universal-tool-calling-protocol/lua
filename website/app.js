import { docs, installation, protocols, quickstart } from './data.js';

const paths = {
  'arrow-right': '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/>',
  graphql: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0L4 16.5h16L12 3Z"/><g fill="currentColor" stroke="none"><circle cx="12" cy="3" r="2"/><circle cx="4" cy="7.5" r="2"/><circle cx="20" cy="7.5" r="2"/><circle cx="4" cy="16.5" r="2"/><circle cx="20" cy="16.5" r="2"/><circle cx="12" cy="21" r="2"/></g>',
  connect: '<path d="m5 14 8-8a3 3 0 0 1 4 4l-7 7a3 3 0 0 1-4-4l6-6m-8 4-1 1a6 6 0 0 0 8 8l3-3m1-12 2-2m1 8 3-3"/>',
  route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 9h10M7 13h6m-6 4h3"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4-8.4a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2m14.2-14.2a10 10 0 0 1 0 14.2"/>',
  stream: '<path d="M3 6h12m3-3 3 3-3 3M3 12h7m3-3 3 3-3 3M3 18h12m3-3 3 3-3 3"/>',
  network: '<rect x="8" y="3" width="8" height="5" rx="1"/><rect x="2" y="16" width="7" height="5" rx="1"/><rect x="15" y="16" width="7" height="5" rx="1"/><path d="M12 8v4m-7 4v-4h14v4"/>',
  send: '<path d="m21 3-6 18-4-8-8-4 18-6ZM11 13 21 3"/>',
  peers: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="m8 10 8-4M8 14l8 4"/>',
  file: '<path d="M14 3H5v18h14V8l-5-5ZM14 3v5h5M8 12h8m-8 4h6"/>',
  code: '<path d="m7 6-6 6 6 6m10-12 6 6-6 6m-3-15-4 18"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3"/>',
  github: '<path fill="currentColor" stroke="none" d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.5v-2.1c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 2.9 1.4 3.5 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.6-1.4-5.6-6.2 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1.1-.3 3.6 1.3a12.5 12.5 0 0 1 6.6 0c2.5-1.6 3.6-1.3 3.6-1.3.7 1.7.3 3 .1 3.3.8.9 1.3 2 1.3 3.4 0 4.8-2.9 5.9-5.6 6.2.5.4.8 1.1.8 2.2V22c0 .3.2.6.8.5A11.1 11.1 0 0 0 12 .9Z"/>',
};

const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.file) + '</svg>';
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const query = (selector, root = document) => root.querySelector(selector);
const queryAll = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderIcons(root = document) {
  queryAll('[data-icon]', root).forEach((element) => { element.innerHTML = icon(element.dataset.icon); });
}

function highlight(code) {
  const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(--.*$|^\s*#.*$)|\b(and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b|(\b[A-Z][A-Z_]+\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(\b\d+(?:\.\d+)?\b)/g;
  const classes = ['string', 'comment', 'keyword', 'constant', 'symbol', 'number'];
  return code.split('\n').map((line) => {
    let html = '';
    let last = 0;
    for (const match of line.matchAll(pattern)) {
      html += escapeHTML(line.slice(last, match.index));
      const type = classes[match.slice(1).findIndex((part) => part !== undefined)];
      html += '<span class="syntax-' + type + '">' + escapeHTML(match[0]) + '</span>';
      last = match.index + match[0].length;
    }
    return '<span class="code-line">' + html + escapeHTML(line.slice(last)) + '</span>';
  }).join('');
}

let toastTimer;
function notify(message) {
  const toast = query('.toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

const copyTimers = new WeakMap();
async function copyText(button) {
  const value = button.dataset.copy;
  if (!value) return;
  try {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(textarea);
      textarea.select();
      let copied;
      try { copied = document.execCommand('copy'); } finally { textarea.remove(); }
      if (!copied) throw new Error('Copy unavailable');
      button.focus({ preventScroll: true });
    }
    clearTimeout(copyTimers.get(button));
    button.innerHTML = icon('check');
    button.classList.add('copied');
    notify('Copied to clipboard');
    copyTimers.set(button, setTimeout(() => {
      button.innerHTML = icon('copy');
      button.classList.remove('copied');
    }, 1800));
  } catch {
    notify('Couldn’t copy. Select the code and copy it manually.');
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy]');
  if (button) copyText(button);
});

function initializeTabs(tablist) {
  tablist.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const tabs = queryAll('[role="tab"]', tablist);
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const columns = getComputedStyle(tablist).display === 'grid'
      ? getComputedStyle(tablist).gridTemplateColumns.split(' ').length : 1;
    let next = current;
    if (event.key === 'ArrowRight') next++;
    if (event.key === 'ArrowLeft') next--;
    if (event.key === 'ArrowDown') next += columns;
    if (event.key === 'ArrowUp') next -= columns;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    const tab = tabs[(next + tabs.length) % tabs.length];
    tab.focus();
    tab.click();
  });
}

let selectedProtocol = protocols[0];
let selectedProtocolExample = 'manual';

function selectProtocolExample(view) {
  const examples = {
    manual: { code: selectedProtocol.manual, filename: selectedProtocol.id + '.manual.json', language: 'JSON', caption: 'Define the tool, its parameters, and its native endpoint.' },
    lua: { code: selectedProtocol.code, filename: selectedProtocol.id + '.lua', language: 'Lua', caption: selectedProtocol.id === 'mcp' ? 'Initialize the MCP server and discover its catalog directly.' : 'Save the manual, then call the tool through the Lua client.' },
    codemode: { code: selectedProtocol.codeMode, filename: selectedProtocol.id + '.codemode.lua', language: 'Lua', caption: selectedProtocol.streaming ? 'Use the host-side CodeMode callback API for streaming.' : 'Compose registered tool calls inside the Lua CodeMode environment.' },
  };
  selectedProtocolExample = Object.hasOwn(examples, view) ? view : 'manual';
  const example = examples[selectedProtocolExample];
  queryAll('[data-protocol-example]').forEach((tab) => {
    const selected = tab.dataset.protocolExample === selectedProtocolExample;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  query('#protocol-example-panel').setAttribute('aria-labelledby', 'example-' + selectedProtocolExample);
  query('#protocol-example-caption').textContent = example.caption;
  query('#protocol-filename').textContent = example.filename;
  query('#protocol-code').innerHTML = highlight(example.code);
  query('#copy-protocol').dataset.copy = example.code;
  query('#copy-protocol').setAttribute('aria-label', 'Copy ' + example.filename);
  query('#protocol-language').textContent = example.language;
  const pre = query('#protocol-example-panel pre');
  pre.scrollTop = 0;
  pre.scrollLeft = 0;
}

function selectProtocol(id) {
  const protocol = protocols.find((item) => item.id === id) || protocols[0];
  selectedProtocol = protocol;
  queryAll('.protocol-tab').forEach((tab) => {
    const selected = tab.dataset.protocol === protocol.id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  query('#protocol-detail').setAttribute('aria-labelledby', 'tab-' + protocol.id);
  query('#protocol-category').textContent = protocol.category;
  query('#protocol-title').textContent = protocol.title;
  query('#protocol-description').textContent = protocol.description;
  query('#protocol-tags').innerHTML = protocol.tags.map((tag) => '<span>' + escapeHTML(tag) + '</span>').join('');
  selectProtocolExample(selectedProtocolExample);
  query('#protocol-note').textContent = protocol.note;
  query('#protocol-docs').href = './docs.html?topic=transports#transport-' + protocol.id;
}

function initializeHome() {
  const tabs = query('.protocol-tabs');
  if (!tabs) return;
  const positions = {
    http: [50, 5], sse: [73, 14], streamable_http: [27, 14],
    websocket: [85, 29], grpc: [89, 50], graphql: [84, 71],
    webrtc: [73, 86], mcp: [50, 95], udp: [27, 86],
    tcp: [14, 71], cli: [11, 50], text: [14, 29],
  };
  query('.orbit-nodes').innerHTML = protocols.map((protocol) => {
    const [x, y] = positions[protocol.id];
    return '<button class="protocol-node" style="--node-x:' + x + '%;--node-y:' + y + '%" data-protocol-link="' + protocol.id + '">' + icon(protocol.icon) + escapeHTML(protocol.name) + '</button>';
  }).join('');
  const lines = query('.orbit-lines');
  lines.setAttribute('viewBox', '0 0 550 550');
  lines.innerHTML = '<circle cx="275" cy="275" r="183" stroke="currentColor" stroke-dasharray="3 6"/><circle cx="275" cy="275" r="244" stroke="currentColor"/>' + protocols.map((protocol) => {
    const [x, y] = positions[protocol.id].map((value) => value * 5.5);
    const dx = x - 275;
    const dy = y - 275;
    const length = Math.hypot(dx, dy);
    const point = (radius) => [(275 + dx / length * radius).toFixed(1), (275 + dy / length * radius).toFixed(1)];
    const [startX, startY] = point(128);
    const [accentX, accentY] = point(166);
    const [endX, endY] = point(185);
    return '<path d="M' + startX + ' ' + startY + 'L' + x + ' ' + y + '" stroke="currentColor"/><path d="M' + accentX + ' ' + accentY + 'L' + endX + ' ' + endY + '" stroke="#466bad"/><circle cx="' + endX + '" cy="' + endY + '" r="2" fill="#82adff"/>';
  }).join('') + '<path d="M20 20h10m-5-5v10M520 20h10m-5-5v10M20 530h10m-5-5v10M520 530h10m-5-5v10" stroke="#555558"/>';
  tabs.innerHTML = protocols.map((protocol) =>
    '<button class="protocol-tab" role="tab" id="tab-' + protocol.id + '" aria-controls="protocol-detail" aria-selected="false" tabindex="-1" data-protocol="' + protocol.id + '">' + icon(protocol.icon) + escapeHTML(protocol.name) + '</button>'
  ).join('');
  tabs.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-protocol]');
    if (tab) selectProtocol(tab.dataset.protocol);
  });
  queryAll('[data-protocol-example]').forEach((tab) => {
    tab.addEventListener('click', () => selectProtocolExample(tab.dataset.protocolExample));
  });
  selectProtocol(new URLSearchParams(location.search).get('protocol') || 'http');
  queryAll('[data-protocol-link]').forEach((button) => {
    button.addEventListener('click', () => {
      selectProtocol(button.dataset.protocolLink);
      query('#protocols').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      query('#tab-' + button.dataset.protocolLink).focus({ preventScroll: true });
    });
  });
  query('#quickstart-code').innerHTML = highlight(quickstart);
  query('#copy-quickstart').dataset.copy = quickstart;
  queryAll('[data-install]').forEach((button) => button.addEventListener('click', () => {
    const selectedInstallation = installation[button.dataset.install];
    queryAll('[data-install]').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab === button));
      tab.tabIndex = tab === button ? 0 : -1;
    });
    query('#install-comment').textContent = selectedInstallation.label;
    const command = selectedInstallation.command;
    query('#install-code').textContent = command;
    query('#copy-install').dataset.copy = command;
    query('#quickstart-code-panel').setAttribute('aria-labelledby', button.id);
  }));
}

function codeBlock(block) {
  return '<div class="code-window doc-code"><div class="code-toolbar"><span><span class="file-dot"></span>' + escapeHTML(block.label) + '</span><button class="copy-button" data-copy="' + escapeHTML(block.code) + '" aria-label="Copy ' + escapeHTML(block.label) + '">' + icon('copy') + '</button></div><pre tabindex="0" aria-label="' + escapeHTML(block.label) + '"><code>' + highlight(block.code) + '</code></pre></div>';
}

function renderDocBlock(block) {
  if (block.type === 'heading') return '<h2>' + escapeHTML(block.title) + '</h2>';
  if (block.type === 'paragraph') return '<p class="doc-prose">' + block.text + '</p>';
  if (block.type === 'code') return codeBlock(block);
  if (block.type === 'source') return '<div class="doc-source" data-code-source="' + escapeHTML(block.src) + '" data-code-label="' + escapeHTML(block.label) + '"><p class="doc-prose">Loading the complete example…</p></div>';
  if (block.type === 'flow') return '<ol class="doc-flow" aria-label="Code Mode request flow">' + block.items.map((item, index) => '<li><span>0' + (index + 1) + '</span>' + escapeHTML(item) + (index < block.items.length - 1 ? '<b aria-hidden="true">→</b>' : '') + '</li>').join('') + '</ol>';
  if (block.type === 'callout') return '<aside class="doc-callout"><strong>' + escapeHTML(block.title) + '</strong>' + block.text + '</aside>';
  if (block.type === 'list') return '<ul class="doc-list">' + block.items.map((item) => '<li>' + item + '</li>').join('') + '</ul>';
  if (block.type === 'transports') return '<div class="doc-transports">' + protocols.map((protocol) =>
    '<section class="doc-transport" id="transport-' + protocol.id + '"><h3>' + icon(protocol.icon) + escapeHTML(protocol.name) + '</h3><p>' + escapeHTML(protocol.description) + '</p><small>' + escapeHTML(protocol.note) + '</small><a href="./?protocol=' + protocol.id + '#protocols">View manual &amp; calls ↗</a></section>'
  ).join('') + '</div>';
  return '';
}

function initializeDocs() {
  const content = query('#doc-content');
  if (!content) return;
  const requested = new URLSearchParams(location.search).get('topic') || 'quickstart';
  const current = docs.find((doc) => doc.id === requested) || docs[0];
  document.title = current.name + ' — Lua UTCP';
  query('#docs-nav').innerHTML = docs.map((doc) =>
    '<a class="docs-nav-link" href="./docs.html?topic=' + doc.id + '"' + (doc === current ? ' aria-current="page"' : '') + '>' + icon(doc.icon) + escapeHTML(doc.name) + '</a>'
  ).join('');
  content.innerHTML = '<div class="doc-breadcrumb">DOCUMENTATION <span>/</span> ' + escapeHTML(current.name.toUpperCase()) + '</div><h1>' + escapeHTML(current.name) + '</h1><p class="doc-intro">' + escapeHTML(current.intro) + '</p>' + current.blocks.map(renderDocBlock).join('');
  queryAll('[data-code-source]', content).forEach(async (element) => {
    try {
      const response = await fetch(element.dataset.codeSource);
      if (!response.ok) throw new Error('Example unavailable');
      const code = await response.text();
      element.innerHTML = codeBlock({ label: element.dataset.codeLabel, code });
      const pre = query('pre', element);
      pre.tabIndex = 0;
      pre.setAttribute('role', 'region');
      pre.setAttribute('aria-label', 'Complete OpenRouter Code Mode example');
    } catch {
      element.innerHTML = '<p class="doc-callout">The example could not load. <a href="' + escapeHTML(element.dataset.codeSource) + '">Open the source file</a> or reload this page.</p>';
    }
  });
  const index = docs.indexOf(current);
  const pageLink = (doc, direction) => '<a href="./docs.html?topic=' + doc.id + '"><small>' + (direction === 'previous' ? '← PREVIOUS' : 'UP NEXT →') + '</small>' + escapeHTML(doc.name) + '</a>';
  query('#docs-pagination').innerHTML = (index > 0 ? pageLink(docs[index - 1], 'previous') : '') + (index < docs.length - 1 ? pageLink(docs[index + 1], 'next') : '');
  if (location.hash) {
    let anchor;
    try { anchor = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
  }
}

function initializeSearch() {
  const dialog = document.createElement('dialog');
  dialog.className = 'search-dialog';
  dialog.setAttribute('aria-label', 'Search documentation');
  dialog.innerHTML = '<form class="search-field" role="search">' + icon('search') + '<label class="sr-only" for="site-search">Search documentation</label><input id="site-search" type="search" placeholder="Search docs, tools, and transports…" autocomplete="off" spellcheck="false" aria-controls="search-results"><button type="button" class="search-close" aria-label="Close search">ESC</button></form><div class="search-results" id="search-results"></div><div class="sr-only search-announcement" role="status" aria-live="polite"></div><div class="search-footer"><span><kbd>↑ ↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span>LUA UTCP DOCS</span></div>';
  document.body.append(dialog);
  const input = query('input', dialog);
  const results = query('#search-results', dialog);
  const entries = [
    ...docs.map((doc) => ({ ...doc, url: './docs.html?topic=' + doc.id })),
    ...protocols.map((protocol) => ({ ...protocol, keywords: protocol.id + ' protocol transport ' + protocol.tags.join(' '), description: protocol.title, url: './docs.html?topic=transports#transport-' + protocol.id })),
  ];
  function renderResults() {
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = words.length ? entries.filter((entry) => {
      const text = [entry.name, entry.description, entry.keywords].join(' ').toLowerCase();
      return words.every((word) => text.includes(word));
    }) : entries.slice(0, docs.length);
    results.innerHTML = '<div class="search-heading">' + (words.length ? matches.length + ' RESULTS' : 'EXPLORE THE DOCUMENTATION') + '</div>' + (matches.length ? matches.map((entry) =>
      '<a class="search-result" href="' + entry.url + '"><span>' + icon(entry.icon) + '</span><div><strong>' + escapeHTML(entry.name) + '</strong><small>' + escapeHTML(entry.description) + '</small></div><span>↗</span></a>'
    ).join('') : '<p class="search-empty">No results yet.<br>Try “HTTP”, “installation”, or “authentication”.</p>');
    query('.search-announcement', dialog).textContent = matches.length + ' results available.';
  }
  function openSearch() {
    if (dialog.open) return;
    input.value = '';
    renderResults();
    dialog.showModal();
    document.body.classList.add('modal-open');
    input.focus();
  }
  queryAll('.search-trigger').forEach((button) => button.addEventListener('click', openSearch));
  query('.search-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
  input.addEventListener('input', renderResults);
  query('form', dialog).addEventListener('submit', (event) => {
    event.preventDefault();
    query('.search-result', dialog)?.click();
  });
  dialog.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const links = queryAll('.search-result', dialog);
    if (!links.length) return;
    event.preventDefault();
    const current = links.indexOf(document.activeElement);
    const next = current === -1 ? (event.key === 'ArrowDown' ? 0 : links.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links[next].focus();
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openSearch();
    }
  });
}

function initializeMenu() {
  const toggle = query('.menu-toggle');
  const menu = query('#mobile-nav');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.innerHTML = icon(open ? 'close' : 'menu');
    menu.hidden = !open;
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  queryAll('a', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  matchMedia('(min-width: 681px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

initializeHome();
initializeDocs();
renderIcons();
initializeMenu();
initializeSearch();
queryAll('[role="tablist"]').forEach(initializeTabs);
