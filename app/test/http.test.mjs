import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../server/http.mjs';
import { createStore } from '../server/store.mjs';

test('serve the interface and complete the search-to-cancellation flow', async (context) => {
  const store = createStore();
  const token = 'sample-admin-key-for-test-only';
  const app = createApp(store, { adminToken: token });
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
  const quotePath = `/api/trips/${services[0].id}?day=${day}&quantity=6`;
  const quote = async () => (await fetch(base + quotePath)).json();
  const checkout = await quote();
  const reservation = {
    serviceId: services[0].id, quantity: 6, day, requestId: randomUUID(),
    seats: checkout.layout.slice(0, 6).map(({ label }) => label),
    boarding: checkout.boarding[0], dropping: checkout.dropping[1], expectedTotal: checkout.price.total,
  };
  const first = await post('/api/bookings', reservation);
  assert.equal(first.status, 200);
  const booking = await first.json();
  assert.equal(booking.status, 'confirmed');
  assert.deepEqual(booking.seats, reservation.seats);
  assert.equal(booking.price.total, reservation.expectedTotal);
  assert.equal((await (await post('/api/bookings', reservation)).json()).id, booking.id);
  assert.equal((await post('/api/bookings', { ...reservation, boarding: checkout.boarding[1] })).status, 409);
  assert.equal((await post('/api/bookings', { ...reservation, requestId: randomUUID() })).status, 409);
  assert.equal((await post('/api/bookings', { ...reservation, seats: Array(6).fill('1A') })).status, 400);

  const admin = `/api/admin/services?day=${day}`;
  assert.equal((await fetch(base + admin)).status, 401);
  const adminHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const state = await (await fetch(base + admin, { headers: adminHeaders })).json();
  assert.equal(state[0].available, 12);
  assert.deepEqual(state[0].reservations[0].seats, booking.seats);
  assert.equal((await fetch(base + '/api/admin/services/1', {
    method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ fare: 600 }),
  })).status, 200);

  const nextBooking = async () => {
    const next = await quote();
    return {
      ...reservation, requestId: randomUUID(),
      seats: next.layout.filter((seat) => seat.available).slice(0, 6).map(({ label }) => label),
      expectedTotal: next.price.total,
    };
  };
  const next = await nextBooking();
  assert.equal((await post('/api/bookings', { ...next, expectedTotal: reservation.expectedTotal })).status, 409);
  assert.equal((await post('/api/bookings', next)).status, 200);
  const last = await nextBooking();
  assert.ok(last.expectedTotal > next.expectedTotal);
  assert.equal((await post('/api/bookings', last)).status, 200);
  assert.equal((await post('/api/bookings', { ...last, requestId: randomUUID() })).status, 409);
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
  assert.ok((await quote()).layout[0].available);
  assert.equal((await (await fetch(base + '/api/bookings')).json()).length, 0);
  assert.equal((await (await fetch(base + '/api/bookings', { headers: { Cookie: cookie } })).json()).length, 3);

  const chat = await post('/api/chat', { question: 'booking success inventory updates' });
  assert.equal(chat.status, 200);
  assert.match((await chat.json()).answer, /portfolio\/code-review.md#L/);
});
