import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { BookingError, cities } from './store.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ...['main', 'api', 'render', 'admin', 'seats'].map((name) => [`/${name}.mjs`, [`${name}.mjs`, 'text/javascript; charset=utf-8']]),
]);

function json(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

function validateDay(day) {
  const earliest = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)
      || day < earliest || day > horizon || new Date(day + 'T00:00:00Z').toJSON()?.slice(0, 10) !== day) {
    throw new BookingError(400, 'Choose a valid travel date within the next 90 days.');
  }
}

function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
    throw new BookingError(400, 'Choose between 1 and 6 seats.');
  }
}

async function readJson(request) {
  if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
    throw new BookingError(415, 'Expected an application/json request.');
  }
  let length = 0;
  const chunks = [];
  for await (const chunk of request) {
    length += chunk.length;
    if (length <= 4096) chunks.push(chunk);
  }
  if (length > 4096) throw new BookingError(413, 'Request body is too large.');
  try {
    const value = JSON.parse(Buffer.concat(chunks));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new BookingError(400, 'Expected a JSON object.');
  }
}

function askRepository(question) {
  return new Promise((resolve, reject) => {
    const process = spawn('python3', ['-m', 'evalkit', 'chat', '--', question], {
      cwd: root, timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
    });
    let output = '';
    process.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
    process.on('error', reject);
    process.on('close', (code) => code === 0 ? resolve(output.trim()) : reject(new Error('Chat unavailable')));
  });
}

export function createApp(store, { ask = askRepository, adminToken = process.env.BUSBOOKING_ADMIN_TOKEN } = {}) {
  const hash = (value) => createHash('sha256').update(value).digest();
  const adminKey = adminToken && adminToken.length >= 24 ? hash(adminToken) : null;
  let chatBusy = false;
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const { pathname, searchParams } = url;
      const method = request.method;
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Content-Security-Policy', "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'");
      const asset = assets.get(pathname);
      if (method === 'GET' && asset) {
        const [filename, type] = asset;
        const contents = await readFile(new URL(`../public/${filename}`, import.meta.url));
        response.writeHead(200, { 'Content-Type': type });
        response.end(contents);
        return;
      }

      const existing = request.headers.cookie?.match(/(?:^|;\s*)bus_session=([a-f0-9-]{36})(?:;|$)/)?.[1];
      const owner = existing ?? randomUUID();
      if (!existing) response.setHeader('Set-Cookie', `bus_session=${owner}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000`);

      if (method === 'GET' && pathname === '/api/cities') {
        json(response, 200, cities);
      } else if (method === 'GET' && pathname === '/api/trips') {
        const origin = searchParams.get('origin');
        const destination = searchParams.get('destination');
        const day = searchParams.get('day');
        const quantity = Number(searchParams.get('quantity'));
        if (!cities.includes(origin) || !cities.includes(destination) || origin === destination) {
          throw new BookingError(400, 'Select two different cities.');
        }
        validateDay(day);
        validateQuantity(quantity);
        json(response, 200, store.search(origin, destination, day, quantity));
      } else if (method === 'GET' && /^\/api\/trips\/\d+$/.test(pathname)) {
        const day = searchParams.get('day');
        const quantity = Number(searchParams.get('quantity'));
        validateDay(day);
        validateQuantity(quantity);
        json(response, 200, store.details(Number(pathname.split('/').at(-1)), day, quantity));
      } else if (pathname.startsWith('/api/admin/')) {
        if (!adminKey) throw new BookingError(503, 'Admin is disabled on this server.');
        const authorization = request.headers.authorization ?? '';
        if (!timingSafeEqual(adminKey, hash(authorization.slice(7))) || !authorization.startsWith('Bearer ')) {
          throw new BookingError(401, 'Enter the configured admin key.');
        }
        if (method === 'GET' && pathname === '/api/admin/services') {
          const day = searchParams.get('day');
          validateDay(day);
          json(response, 200, store.admin(day));
        } else if (method === 'PATCH' && /^\/api\/admin\/services\/\d+$/.test(pathname)) {
          const { fare } = await readJson(request);
          if (!Number.isInteger(fare) || fare < 100 || fare > 10000) {
            throw new BookingError(400, 'Base fare must be between ₹100 and ₹10,000.');
          }
          store.updateFare(Number(pathname.split('/').at(-1)), fare);
          json(response, 200, { fare });
        } else {
          throw new BookingError(404, 'Admin route not found.');
        }
      } else if (method === 'GET' && pathname === '/api/bookings') {
        json(response, 200, store.bookings(owner));
      } else if (method === 'POST' && pathname === '/api/bookings') {
        const { serviceId, day, quantity, requestId, seats, boarding, dropping, expectedTotal } = await readJson(request);
        validateDay(day);
        validateQuantity(quantity);
        if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(requestId)) {
          throw new BookingError(400, 'A valid request ID is required.');
        }
        if (!Array.isArray(seats) || seats.length !== quantity || new Set(seats).size !== quantity
            || seats.some((seat) => typeof seat !== 'string' || !/^[1-5][A-D]$/.test(seat))
            || typeof boarding !== 'string' || typeof dropping !== 'string' || !Number.isInteger(expectedTotal)) {
          throw new BookingError(400, 'Select the requested seats and confirm a fare quote.');
        }
        json(response, 200, store.book(owner, requestId, serviceId, day, quantity,
          { seats, boarding, dropping, expectedTotal }));
      } else if (method === 'DELETE' && /^\/api\/bookings\/[a-f0-9-]{36}$/.test(pathname)) {
        json(response, 200, store.cancel(owner, pathname.split('/').at(-1)));
      } else if (method === 'POST' && pathname === '/api/chat') {
        const { question } = await readJson(request);
        if (typeof question !== 'string' || !question.trim() || question.length > 500) {
          throw new BookingError(400, 'Enter a question of 1 to 500 characters.');
        }
        if (chatBusy) throw new BookingError(503, 'The assistant is busy. Try again shortly.');
        chatBusy = true;
        try {
          json(response, 200, { answer: await ask(question.trim()) });
        } catch {
          throw new BookingError(503, 'The repository assistant is unavailable.');
        } finally {
          chatBusy = false;
        }
      } else {
        throw new BookingError(404, 'Page or API route not found.');
      }
    } catch (error) {
      if (error instanceof BookingError) json(response, error.status, { error: error.message });
      else {
        console.error(error);
        json(response, 500, { error: 'An unexpected error occurred.' });
      }
    }
  });
}
