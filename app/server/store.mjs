import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { priceFor, seatLabels, stopsFor } from './fares.mjs';

export class BookingError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const cities = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Tumakuru', 'Hassan'];
export const demoServices = [
  ['Bengaluru', 'Mysuru', 'Kaveri Express', '08:15', '11:30', 425, 18],
  ['Bengaluru', 'Mysuru', 'Greenline Coaches', '10:45', '14:15', 510, 12],
  ['Bengaluru', 'Mysuru', 'Southbound Travels', '16:00', '19:20', 475, 8],
  ['Mysuru', 'Bengaluru', 'Kaveri Express', '09:00', '12:15', 425, 18],
  ['Bengaluru', 'Mangaluru', 'Coastal Express', '07:00', '15:00', 790, 20],
  ['Bengaluru', 'Hubballi', 'Northbound Coaches', '08:30', '16:00', 720, 16],
  ['Bengaluru', 'Hassan', 'Western Express', '10:15', '14:05', 460, 20],
  ['Bengaluru', 'Tumakuru', 'CityLink', '11:00', '13:00', 250, 14],
].map(([origin, destination, operator, departure, arrival, fare, capacity], index) =>
  ({ id: index + 1, origin, destination, operator, departure, arrival, fare, capacity }));

export function createStore(filename = ':memory:', { today = () => new Date().toISOString().slice(0, 10) } = {}) {
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS inventory (
      service INTEGER NOT NULL, day TEXT NOT NULL, seats INTEGER NOT NULL CHECK(seats >= 0),
      PRIMARY KEY(service, day)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, request_id TEXT NOT NULL,
      service INTEGER NOT NULL, day TEXT NOT NULL, quantity INTEGER NOT NULL,
      status TEXT NOT NULL, UNIQUE(owner, request_id)
    );
    CREATE TABLE IF NOT EXISTS seat_assignments (
      service INTEGER NOT NULL, day TEXT NOT NULL, seat TEXT NOT NULL,
      booking TEXT NOT NULL, PRIMARY KEY(service, day, seat)
    );
    CREATE TABLE IF NOT EXISTS booking_details (
      booking TEXT PRIMARY KEY, details TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS service_fares (service INTEGER PRIMARY KEY, fare INTEGER NOT NULL);
  `);
  const inventory = db.prepare('SELECT seats FROM inventory WHERE service=? AND day=?');
  const reserve = db.prepare('UPDATE inventory SET seats=seats-? WHERE service=? AND day=? AND seats>=?');
  const restore = db.prepare('UPDATE inventory SET seats=seats+? WHERE service=? AND day=?');
  const initialize = db.prepare('INSERT OR IGNORE INTO inventory VALUES (?, ?, ?)');
  const bookingById = db.prepare('SELECT * FROM bookings WHERE owner=? AND id=?');
  const bookingByRequest = db.prepare('SELECT * FROM bookings WHERE owner=? AND request_id=?');
  const insert = db.prepare("INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, 'confirmed')");
  const cancel = db.prepare("UPDATE bookings SET status='cancelled' WHERE owner=? AND id=?");
  const list = db.prepare('SELECT * FROM bookings WHERE owner=? ORDER BY rowid DESC LIMIT 100');

  const seatRows = db.prepare('SELECT seat FROM seat_assignments WHERE service=? AND day=?');
  const assign = db.prepare('INSERT INTO seat_assignments VALUES (?, ?, ?, ?)');
  const release = db.prepare('DELETE FROM seat_assignments WHERE booking=?');
  const getDetails = db.prepare('SELECT details FROM booking_details WHERE booking=?');
  const saveDetails = db.prepare('INSERT INTO booking_details VALUES (?, ?)');
  const getFare = db.prepare('SELECT fare FROM service_fares WHERE service=?');
  const setFare = db.prepare('INSERT OR REPLACE INTO service_fares VALUES (?, ?)');
  const manifest = db.prepare('SELECT id, quantity, status FROM bookings WHERE service=? AND day=? ORDER BY rowid DESC');

  function findTrip(id) {
    const trip = demoServices.find((item) => item.id === id);
    if (!trip) throw new BookingError(404, 'Service not found.');
    return trip;
  }

  function availability(trip, day) {
    return inventory.get(trip.id, day)?.seats ?? trip.capacity;
  }

  function quote(trip, day, quantity) {
    return priceFor({
      base: getFare.get(trip.id)?.fare ?? trip.fare,
      available: availability(trip, day), capacity: trip.capacity, day, today: today(), quantity,
    });
  }

  function details(serviceId, day, quantity) {
    const trip = findTrip(serviceId);
    const seats = availability(trip, day);
    const taken = new Set(seatRows.all(serviceId, day).map((row) => row.seat));
    let remaining = seats;
    const layout = seatLabels(trip.capacity).map((label) => ({
      label,
      available: !taken.has(label) && remaining-- > 0,
    }));
    return { trip, layout, seats, ...stopsFor(trip), price: quote(trip, day, quantity) };
  }

  function transaction(action) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = action();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  function view(row) {
    const { id, day, quantity, status, service } = row;
    return { id, day, quantity, status, trip: findTrip(service),
      ...JSON.parse(getDetails.get(id)?.details ?? '{}') };
  }

  return {
    search(origin, destination, day, quantity) {
      return demoServices.filter((trip) => trip.origin === origin && trip.destination === destination)
        .map((trip) => ({ ...trip, seats: availability(trip, day), fare: quote(trip, day, 1).total }))
        .filter((trip) => trip.seats >= quantity);
    },
    bookings(owner) {
      return list.all(owner).map(view);
    },
    details,
    admin(day) {
      return demoServices.map((trip) => ({
        ...trip, baseFare: getFare.get(trip.id)?.fare ?? trip.fare,
        available: availability(trip, day),
        reservations: manifest.all(trip.id, day).map((row) => ({
          ...row, seats: JSON.parse(getDetails.get(row.id)?.details ?? '{}').seats ?? [],
        })),
      }));
    },
    updateFare(id, fare) {
      findTrip(id);
      setFare.run(id, fare);
    },
    book(owner, requestId, serviceId, day, quantity, selection) {
      const trip = findTrip(serviceId);
      const normalized = { ...selection, seats: [...selection.seats].sort() };
      return transaction(() => {
        const existing = bookingByRequest.get(owner, requestId);
        if (existing) {
          if (existing.service !== serviceId || existing.day !== day || existing.quantity !== quantity
              || JSON.stringify(JSON.parse(getDetails.get(existing.id)?.details ?? '{}').selection) !== JSON.stringify(normalized)) {
            throw new BookingError(409, 'This request was already used for a different booking.');
          }
          return view(existing);
        }
        const current = details(serviceId, day, quantity);
        if (current.price.total !== normalized.expectedTotal) {
          throw new BookingError(409, 'The fare changed. Refresh the quote before confirming.');
        }
        if (!current.boarding.includes(normalized.boarding) || !current.dropping.includes(normalized.dropping)) {
          throw new BookingError(400, 'Choose a valid boarding and drop-off point.');
        }
        if (!normalized.seats.every((label) => current.layout.some((seat) => seat.label === label && seat.available))) {
          throw new BookingError(409, 'A selected seat is no longer available. Refresh the seat map.');
        }
        initialize.run(trip.id, day, trip.capacity);
        if (!reserve.run(quantity, serviceId, day, quantity).changes) {
          throw new BookingError(409, 'Availability changed. Search again for current seats.');
        }
        const id = randomUUID();
        insert.run(id, owner, requestId, serviceId, day, quantity);
        for (const seat of normalized.seats) assign.run(serviceId, day, seat, id);
        saveDetails.run(id, JSON.stringify({
          selection: normalized, seats: normalized.seats, boarding: normalized.boarding,
          dropping: normalized.dropping, price: current.price,
        }));
        return view(bookingById.get(owner, id));
      });
    },
    cancel(owner, id) {
      return transaction(() => {
        const booking = bookingById.get(owner, id);
        if (!booking) throw new BookingError(404, 'Booking not found.');
        if (booking.status === 'confirmed') {
          cancel.run(owner, id);
          release.run(id);
          restore.run(booking.quantity, booking.service, booking.day);
        }
        return view(bookingById.get(owner, id));
      });
    },
    close() { db.close(); },
  };
}
