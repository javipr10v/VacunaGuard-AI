// VacunaGuard AI — Puerta de enlace pública (un solo puerto 9090)
// Sirve la app web (dist) y reenvía /api/<servicio> a los microservicios locales.
// Los paneles (n8n, Node-RED, RabbitMQ) y /lecturas NO se exponen: seguridad primero.
const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'vacunaguard-app', 'dist');
const RUTAS = { identity: 3001, coldchain: 3002, registry: 3003, routes: 3004, advisor: 3005 };
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
};

function reenviar(req, res, puerto, rutaObjetivo) {
  const objetivo = {
    host: '127.0.0.1',
    port: puerto,
    path: rutaObjetivo,
    method: req.method,
    headers: { ...req.headers, host: '127.0.0.1:' + puerto, connection: 'close' },
  };
  const prox = http.request(objetivo, (r2) => {
    res.writeHead(r2.statusCode, r2.headers);
    r2.pipe(res);
  });
  prox.on('error', () => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Servicio no disponible en este momento' }));
  });
  req.pipe(prox);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const api = url.pathname.match(/^\/api\/(identity|coldchain|registry|routes|advisor)(\/.*)?$/);
  if (api) {
    const ruta = (api[2] || '/') + (url.search || '');
    reenviar(req, res, RUTAS[api[1]], ruta);
    return;
  }
  if (url.pathname.startsWith('/socket.io')) {
    reenviar(req, res, 3004, url.pathname + (url.search || ''));
    return;
  }
  // App web estática (SPA)
  const archivo = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const rutaArchivo = path.join(DIST, archivo);
  fs.readFile(rutaArchivo, (err, datos) => {
    if (err) {
      fs.readFile(path.join(DIST, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('No encontrado'); return; }
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(rutaArchivo).toLowerCase();
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
    res.end(datos);
  });
});

// WebSocket de socket.io (GPS en vivo) hacia routes
server.on('upgrade', (req, socket, head) => {
  let url = req.url || '';
  let puerto = 3004;
  if (url.startsWith('/api/routes')) url = url.slice('/api/routes'.length) || '/';
  if (!url.startsWith('/socket.io')) {
    socket.destroy();
    return;
  }
  const objetivo = net.connect(puerto, '127.0.0.1', () => {
    let cab = req.method + ' ' + url + ' HTTP/' + req.httpVersion + '\r\n';
    for (const k of Object.keys(req.headers)) cab += k + ': ' + req.headers[k] + '\r\n';
    cab += '\r\n';
    objetivo.write(cab);
    if (head && head.length) objetivo.write(head);
    socket.pipe(objetivo);
    objetivo.pipe(socket);
  });
  objetivo.on('error', () => socket.destroy());
  socket.on('error', () => objetivo.destroy());
});

server.listen(9090, '0.0.0.0', () => {
  console.log('VacunaGuard: puerta de enlace publica en http://0.0.0.0:9090');
});
