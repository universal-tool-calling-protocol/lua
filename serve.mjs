import { readFile, realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const projectRoot = fileURLToPath(new URL('./', import.meta.url));
const { values } = parseArgs({
  options: {
    dir: { type: 'string', default: '.' },
    host: { type: 'string', default: '127.0.0.1' },
    port: { type: 'string', default: '5173' },
  },
});

const port = Number(values.port);
if (!/^\d+$/.test(values.port) || port < 0 || port > 65535) {
  throw new Error('--port must be an integer between 0 and 65535.');
}

const root = await realpath(resolve(projectRoot, values.dir));
if (!(await stat(root)).isDirectory()) {
  throw new Error('--dir must point to a directory.');
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.lua': 'text/plain; charset=utf-8',
};

function isWithinRoot(path) {
  const pathFromRoot = relative(root, path);
  return pathFromRoot !== '..'
    && !pathFromRoot.startsWith('..' + sep)
    && !isAbsolute(pathFromRoot);
}

const server = createServer(async (request, response) => {
  function reply(status, message, headers = {}) {
    response.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    });
    response.end(request.method === 'HEAD' ? undefined : message);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(405, 'Method not allowed', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.includes('\0')) throw new Error('Invalid path');
  } catch {
    reply(400, 'Bad request');
    return;
  }

  try {
    let path = resolve(root, '.' + pathname);
    if (!isWithinRoot(path)) {
      reply(403, 'Forbidden');
      return;
    }

    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    path = await realpath(path);
    if (!isWithinRoot(path)) {
      reply(403, 'Forbidden');
      return;
    }
    if (!(await stat(path)).isFile()) {
      reply(404, 'Not found');
      return;
    }

    const body = await readFile(path);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      reply(404, 'Not found');
    } else if (error.code === 'EACCES' || error.code === 'EPERM') {
      reply(403, 'Forbidden');
    } else {
      console.error(error);
      reply(500, 'Internal server error');
    }
  }
});

server.on('error', (error) => {
  console.error('Could not start the website server:', error.message);
  process.exitCode = 1;
});

server.listen(port, values.host, () => {
  const host = values.host.includes(':') ? '[' + values.host + ']' : values.host;
  console.log('Lua UTCP website: http://' + host + ':' + server.address().port);
  console.log('Serving ' + root);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close());
}
