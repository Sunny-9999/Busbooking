import { request } from './api.mjs';
import { bookingDetails, element, tripCard } from './render.mjs';

const byId = (id) => document.getElementById(id);
const form = byId('search-form');
const searchButton = form.querySelector('[type=submit]');
const filters = form.elements;
const status = byId('status');
const bookingDialog = byId('booking-dialog');
const bookingsDialog = byId('bookings-dialog');
const dateInput = filters.namedItem('day');
const originInput = filters.namedItem('origin');
const destinationInput = filters.namedItem('destination');
dateInput.min = new Date().toISOString().slice(0, 10);
dateInput.max = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
dateInput.value = dateInput.min;
let current = null;
let selected = null;

function displayTrips() {
  const target = byId('trips');
  const sort = byId('sort').value;
  const results = [...(current?.trips ?? [])].sort((a, b) =>
    sort === 'fare' ? a.fare - b.fare : a.departure.localeCompare(b.departure));
  target.replaceChildren(...results.map((trip) => tripCard(trip, showReservation)));
}

async function search(query) {
  searchButton.disabled = true;
  status.textContent = 'Looking for departures…';
  current = null;
  displayTrips();
  try {
    const trips = await request(`trips?${new URLSearchParams(query)}`);
    current = { query, trips };
    byId('results-title').textContent = `${query.origin} to ${query.destination}`;
    status.textContent = trips.length
      ? `${trips.length} ${trips.length === 1 ? 'departure' : 'departures'} · ${query.day}`
      : 'No departures match this search. Try another route or fewer seats.';
    displayTrips();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    searchButton.disabled = false;
  }
}

function showReservation(trip) {
  const { query } = current;
  selected = { serviceId: trip.id, day: query.day, quantity: Number(query.quantity),
    requestId: crypto.randomUUID() };
  byId('booking-status').textContent = '';
  byId('confirm-booking').hidden = false;
  byId('booking-summary').replaceChildren(bookingDetails({ ...selected, trip }));
  bookingDialog.showModal();
}

async function refreshBookings() {
  const list = byId('bookings-list');
  const feedback = byId('bookings-status');
  feedback.textContent = 'Loading bookings…';
  list.replaceChildren();
  try {
    const bookings = await request('bookings');
    feedback.textContent = bookings.length ? '' : 'Reservations made in this browser will appear here.';
    for (const booking of bookings) {
      const item = bookingDetails(booking);
      item.classList.add('booking-item');
      if (booking.status === 'cancelled') {
        item.append(element('p', 'Cancelled', 'detail'));
      } else {
        const cancel = element('button', 'Cancel reservation');
        cancel.addEventListener('click', async () => {
          cancel.disabled = true;
          try {
            await request(`bookings/${booking.id}`, { method: 'DELETE' });
            await refreshBookings();
            if (current) await search(current.query);
          } catch (error) {
            feedback.textContent = error.message;
            cancel.disabled = false;
          }
        });
        item.append(cancel);
      }
      list.append(item);
    }
  } catch (error) {
    feedback.textContent = error.message;
  }
}

byId('confirm-booking').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const booking = await request('bookings', { method: 'POST', data: selected });
    byId('booking-status').textContent = `Reservation confirmed. Reference ${booking.id.slice(0, 8).toUpperCase()}.`;
    button.hidden = true;
    if (current) await search(current.query);
  } catch (error) {
    byId('booking-status').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

byId('open-bookings').addEventListener('click', () => {
  bookingsDialog.showModal();
  refreshBookings();
});
byId('open-chat').addEventListener('click', () => byId('chat-dialog').showModal());
byId('chat-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const chatForm = event.currentTarget;
  const button = chatForm.querySelector('button');
  const answer = byId('chat-answer');
  button.disabled = true;
  answer.textContent = 'Searching the repository…';
  try {
    const { answer: text } = await request('chat', {
      method: 'POST', data: Object.fromEntries(new FormData(chatForm)),
    });
    answer.textContent = text;
  } catch (error) {
    answer.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
byId('sort').addEventListener('change', displayTrips);
byId('swap').addEventListener('click', () => {
  [originInput.value, destinationInput.value] = [destinationInput.value, originInput.value];
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(Object.fromEntries(new FormData(form)));
});

searchButton.disabled = true;
try {
  const cities = await request('cities');
  for (const select of [originInput, destinationInput]) {
    select.replaceChildren(...cities.map((city) => new Option(city, city)));
  }
  originInput.value = 'Bengaluru';
  destinationInput.value = 'Mysuru';
  await search(Object.fromEntries(new FormData(form)));
} catch (error) {
  status.textContent = error.message;
}
