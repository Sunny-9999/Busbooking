# Busbooking 2.0

Run from the repository root with Node.js 24 and Python 3.10 or later:

```sh
npm --prefix app start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Python is used by the repository assistant. Search and booking run on Node.js and SQLite without installing npm dependencies.

Search schedules, sort by departure or fare, reserve up to six seats, choose numbered seats and boarding/drop-off points, and cancel reservations through **My bookings**. Bookings are scoped to a browser session cookie. The repository assistant retrieves excerpts from the project documentation and displays the file and line for each source.

| Module | Responsibility |
| --- | --- |
| `public/main.mjs` | Browser state, search, and dialogs |
| `public/render.mjs` | Trip cards and reservation views |
| `public/api.mjs` | HTTP client |
| `server/http.mjs` | Routing, requests, and the assistant adapter |
| `server/store.mjs` | Schedules, inventory, and booking transactions |

Data persists in `busbooking.sqlite` in the app working directory. Set `BUSBOOKING_DB` to choose another path and `PORT` to choose another local port. SQLite transactions protect inventory when creating and cancelling a reservation. The request ID lets a retry retrieve the original reservation without decrementing seats again.

This version uses fictional schedules and fares. It does not connect to a bus operator or collect payments. The original Angular and Spring Boot applications remain in their existing folders for reference. Legacy accounts and bookings are not imported.

Run the HTTP integration test with `npm --prefix app test`.

## Seats, fares, and operator admin

Seat maps and fare quotes are loaded from the API. The fare consists of the base fare, an occupancy adjustment (12% at half capacity, 25% at three quarters), an 8% Friday-to-Sunday adjustment, a 5% next-day or same-day adjustment, and a ₹20 service fee per seat. Percentage adjustments are added before rounding per seat. If availability or the fare changes before confirmation, refresh the checkout to get a new quote. Confirmed reservations retain their original fare and seat numbers.

Set a private key of at least 24 characters in `BUSBOOKING_ADMIN_TOKEN` before starting the server to enable **Operator admin**. Enter the same key in the dialog. Operators can review occupancy and reservations by date and change a service's base fare for all dates. Keep this local demo on loopback. Existing reservations created without seat numbers retain their inventory count and can still be cancelled.
