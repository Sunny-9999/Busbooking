const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

export const money = (amount) => rupees.format(amount);

export function element(tag, text, className) {
  const item = document.createElement(tag);
  if (text !== undefined) item.textContent = text;
  if (className) item.className = className;
  return item;
}

export function tripCard(trip, reserve) {
  const card = element('article', undefined, 'trip');
  const title = element('div');
  title.append(element('h3', trip.operator), element('p', `${trip.seats} seats available`, 'detail'));
  const timing = element('div');
  timing.append(element('strong', `${trip.departure} – ${trip.arrival}`),
    element('p', `${trip.origin} to ${trip.destination}`, 'detail'));
  const price = element('div');
  price.append(element('p', rupees.format(trip.fare), 'fare'), element('p', 'per seat', 'detail'));
  const button = element('button', 'Reserve', 'primary');
  button.addEventListener('click', () => reserve(trip));
  card.append(title, timing, price, button);
  return card;
}

export function bookingDetails(booking) {
  const { trip, day, quantity } = booking;
  const details = element('div');
  details.append(element('h3', trip.operator),
    element('p', `${trip.origin} to ${trip.destination} · ${day} at ${trip.departure}`),
    element('p', `${quantity} ${quantity === 1 ? 'seat' : 'seats'} · ${rupees.format(booking.price?.total ?? trip.fare * quantity)}`));
  if (booking.seats?.length) {
    details.append(element('p', `Seats ${booking.seats.join(', ')}`),
      element('p', `Board at ${booking.boarding} · Drop off at ${booking.dropping}`, 'detail'));
  }
  return details;
}
