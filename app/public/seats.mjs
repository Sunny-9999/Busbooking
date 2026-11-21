import { request } from './api.mjs';
import { element, money } from './render.mjs';

export function setupSeatCheckout(currentQuery, refreshSearch) {
  const byId = (id) => document.getElementById(id);
  const dialog = byId('booking-dialog');
  const map = byId('seat-map');
  const feedback = byId('booking-status');
  const confirm = byId('confirm-booking');
  const checkout = byId('seat-checkout');
  const refresh = byId('refresh-quote');
  const boarding = byId('boarding');
  const dropping = byId('dropping');
  let trip;
  let query;
  let details;
  let seats = new Set();
  let requestId;
  let pending = false;
  let generation = 0;

  function showQuote() {
    const { price, layout } = details;
    map.replaceChildren();
    for (const seat of layout) {
      const button = element('button', seat.label, 'seat');
      button.type = 'button';
      button.disabled = !seat.available;
      button.setAttribute('aria-label', `Seat ${seat.label}`);
      button.setAttribute('aria-pressed', seats.has(seat.label));
      button.addEventListener('click', () => {
        if (pending) return;
        if (seats.has(seat.label)) seats.delete(seat.label);
        else if (seats.size < Number(query.quantity)) seats.add(seat.label);
        else {
          feedback.textContent = `You can select up to ${query.quantity} seats.`;
          return;
        }
        requestId = crypto.randomUUID();
        button.setAttribute('aria-pressed', seats.has(seat.label));
        showSelection();
      });
      map.append(button);
    }
    for (const [select, values] of [[boarding, details.boarding], [dropping, details.dropping]]) {
      select.replaceChildren(...values.map((point) => new Option(point, point)));
    }
    const items = [
      ['Base fare', price.subtotal],
      [`Fare adjustment (${price.demand + price.weekend + price.late}%)`, price.surcharge],
      ['Service fee', price.fee],
      ['Total', price.total],
    ];
    const breakdown = element('dl', undefined, 'fare-list');
    for (const [label, value] of items) breakdown.append(element('dt', label), element('dd', money(value)));
    byId('fare-breakdown').replaceChildren(breakdown);
  }

  function showSelection() {
    confirm.disabled = seats.size !== Number(query.quantity);
    feedback.textContent = `${seats.size} of ${query.quantity} seats selected.`;
  }

  async function load() {
    const version = ++generation;
    pending = true;
    confirm.disabled = true;
    checkout.hidden = true;
    refresh.hidden = false;
    feedback.textContent = 'Loading seats and fare…';
    seats = new Set();
    requestId = crypto.randomUUID();
    try {
      const next = await request(`trips/${trip.id}?${new URLSearchParams({ day: query.day, quantity: query.quantity })}`);
      if (version !== generation) return;
      details = next;
      showQuote();
      checkout.hidden = false;
      showSelection();
    } catch (error) {
      if (version === generation) feedback.textContent = error.message;
    } finally {
      if (version === generation) pending = false;
    }
  }

  confirm.addEventListener('click', async () => {
    if (pending || seats.size !== Number(query.quantity)) return;
    pending = true;
    confirm.disabled = true;
    refresh.disabled = boarding.disabled = dropping.disabled = true;
    const version = generation;
    try {
      const booking = await request('bookings', {
        method: 'POST', data: {
          serviceId: trip.id, day: query.day, quantity: Number(query.quantity),
          requestId, seats: [...seats], boarding: boarding.value, dropping: dropping.value,
          expectedTotal: details.price.total,
        },
      });
      if (version === generation) {
        feedback.textContent = `Seats ${booking.seats.join(', ')} confirmed. Reference ${booking.id.slice(0, 8).toUpperCase()}.`;
        confirm.hidden = true;
        checkout.hidden = true;
      }
      await refreshSearch();
    } catch (error) {
      if (version === generation) {
        feedback.textContent = error.message;
        confirm.disabled = false;
      }
    } finally {
      if (version === generation) pending = false;
      refresh.disabled = boarding.disabled = dropping.disabled = false;
    }
  });
  for (const select of [boarding, dropping]) {
    select.addEventListener('change', () => { requestId = crypto.randomUUID(); });
  }
  refresh.addEventListener('click', load);
  return (service) => {
    trip = service;
    query = currentQuery();
    confirm.hidden = false;
    byId('booking-summary').replaceChildren(element('h3', trip.operator),
      element('p', `${trip.origin} to ${trip.destination} · ${query.day} at ${trip.departure}`));
    dialog.showModal();
    load();
  };
}
