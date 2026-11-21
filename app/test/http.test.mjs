import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../server/http.mjs';
import { createStore } from '../server/store.mjs';

test('serve the interface and complete the search-to-cancellation flow', async (context) => {
  const store = createStore();
  const app = createApp(store);
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  context.after(async () => {
    await new Promise((resolve) => app.close(resolve));
    store.close();
  });
  const base = `http://127.0.0.1:${app.address().port}`;
  const day = new Date().toISOString().slice(0, 10);
  const trips = `/api/trips?origin=Bengaluru&destination=Mysuru&day=${day}&quantity=1`;
  const initial = await fetch(base + trips);
  const cookie = initial.headers.get('set-cookie').split(';')[0];
  const services = await initial.json();
  assert.equal(services.length, 3);
  assert.equal(services[0].seats, 18);

  const visit = await fetch(base);
  assert.equal(visit.status, 200);
  assert.match(await visit.text(), /Find your<br>next ride/);

  const post = (path, body) => fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  const reservation = { serviceId: services[0].id, quantity: 6, day, requestId: randomUUID() };
  const first = await post('/api/bookings', reservation);
  assert.equal(first.status, 200);
  const booking = await first.json();
  assert.equal(booking.status, 'confirmed');
  assert.equal((await (await post('/api/bookings', reservation)).json()).id, booking.id);
  assert.equal((await post('/api/bookings', { ...reservation, quantity: 2 })).status, 409);
  for (let index = 0; index < 2; index++) {
    assert.equal((await post('/api/bookings', { ...reservation, requestId: randomUUID() })).status, 200);
  }
  assert.equal((await post('/api/bookings', { ...reservation, requestId: randomUUID() })).status, 409);
  assert.equal((await (await fetch(base + trips)).json()).length, 2);
  assert.equal((await post('/api/bookings', { ...reservation, quantity: 0 })).status, 400);
  assert.equal((await post('/api/bookings', { ...reservation, day: '2026-99-99' })).status, 400);

  const path = base + '/api/bookings/' + booking.id;
  assert.equal((await fetch(path, { method: 'DELETE' })).status, 404);
  for (let index = 0; index < 2; index++) {
    const result = await fetch(path, { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal((await result.json()).status, 'cancelled');
  }
  assert.equal((await (await fetch(base + trips)).json())[0].seats, 6);
  assert.equal((await (await fetch(base + '/api/bookings')).json()).length, 0);
  assert.equal((await (await fetch(base + '/api/bookings', { headers: { Cookie: cookie } })).json()).length, 3);

  const chat = await post('/api/chat', { question: 'booking success inventory updates' });
  assert.equal(chat.status, 200);
  assert.match((await chat.json()).answer, /portfolio\/code-review.md#L/);
});
