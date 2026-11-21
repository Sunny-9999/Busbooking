import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

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

export function createStore(filename = ':memory:') {
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
    return { id, day, quantity, status, trip: demoServices.find((item) => item.id === service) };
  }

  return {
    search(origin, destination, day, quantity) {
      return demoServices.filter((trip) => trip.origin === origin && trip.destination === destination)
        .map((trip) => ({ ...trip, seats: inventory.get(trip.id, day)?.seats ?? trip.capacity }))
        .filter((trip) => trip.seats >= quantity);
    },
    bookings(owner) {
      return list.all(owner).map(view);
    },
    book(owner, requestId, serviceId, day, quantity) {
      const trip = demoServices.find((item) => item.id === serviceId);
      if (!trip) throw new BookingError(404, 'Service not found.');
      return transaction(() => {
        const existing = bookingByRequest.get(owner, requestId);
        if (existing) {
          if (existing.service !== serviceId || existing.day !== day || existing.quantity !== quantity) {
            throw new BookingError(409, 'This request was already used for a different booking.');
          }
          return view(existing);
        }
        initialize.run(trip.id, day, trip.capacity);
        if (!reserve.run(quantity, serviceId, day, quantity).changes) {
          throw new BookingError(409, 'Availability changed. Search again for current seats.');
        }
        const id = randomUUID();
        insert.run(id, owner, requestId, serviceId, day, quantity);
        return view(bookingById.get(owner, id));
      });
    },
    cancel(owner, id) {
      return transaction(() => {
        const booking = bookingById.get(owner, id);
        if (!booking) throw new BookingError(404, 'Booking not found.');
        if (booking.status === 'confirmed') {
          cancel.run(owner, id);
          restore.run(booking.quantity, booking.service, booking.day);
        }
        return view(bookingById.get(owner, id));
      });
    },
    close() { db.close(); },
  };
}
