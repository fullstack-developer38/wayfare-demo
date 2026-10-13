// Small static server for the Wayfare site.
// Supports HTTP Range requests, which Safari and iPhone need to play the videos.
// Usage: node tools/serve.mjs            (http://127.0.0.1:8620)
//        PORT=9000 node tools/serve.mjs
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT || 8620);
const HOST = process.env.HOST || '127.0.0.1';

// Only the site itself is served; .git, tools/ and README stay private.
const PUBLIC_TOP = new Set(['index.html', 'css', 'js', 'assets']);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  let path;
  try {
    path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (path === '/') path = '/index.html';
  if (path.includes('\0') || !PUBLIC_TOP.has(path.split('/')[1])) return notFound(res);

  const file = resolve(ROOT, '.' + path);
  if (!file.startsWith(ROOT + sep)) return notFound(res);

  let st;
  try {
    st = statSync(file);
  } catch {
    return notFound(res);
  }
  if (!st.isFile()) return notFound(res);

  const headers = {
    'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Last-Modified': st.mtime.toUTCString(),
    'Cache-Control': path.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };

  let start = 0;
  let end = st.size - 1;
  let status = 200;

  const m = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range.trim());
  if (m && (m[1] !== '' || m[2] !== '')) {
    if (m[1] === '') {
      // "bytes=-N": the last N bytes
      start = Math.max(0, st.size - Number(m[2]));
    } else {
      start = Number(m[1]);
      if (m[2] !== '') end = Math.min(Number(m[2]), st.size - 1);
    }
    if (start > end || start >= st.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${st.size}` });
      res.end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
  }

  headers['Content-Length'] = end - start + 1;
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || st.size === 0) {
    res.end();
    return;
  }
  createReadStream(file, { start, end })
    .on('error', () => res.destroy())
    .pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`Wayfare site: http://${HOST}:${PORT}  (serving ${ROOT})`);
});
