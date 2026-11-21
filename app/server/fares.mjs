export function stopsFor(trip) {
  return {
    boarding: [`${trip.origin} Central Bus Stand`, `${trip.origin} Bypass`],
    dropping: [`${trip.destination} Central Bus Stand`, `${trip.destination} Bypass`],
  };
}

export function priceFor({ base, available, capacity, day, today, quantity }) {
  const soldShare = 1 - available / capacity;
  const demand = soldShare >= 0.75 ? 25 : soldShare >= 0.5 ? 12 : 0;
  const weekday = new Date(day + 'T00:00:00Z').getUTCDay();
  const weekend = [5, 6, 0].includes(weekday) ? 8 : 0;
  const daysAhead = (Date.parse(day) - Date.parse(today)) / 86400000;
  const late = daysAhead <= 1 ? 5 : 0;
  const surcharge = Math.round(base * (demand + weekend + late) / 100) * quantity;
  const subtotal = base * quantity;
  const fee = 20 * quantity;
  return { base, subtotal, demand, weekend, late, surcharge, fee, total: subtotal + surcharge + fee };
}

export function seatLabels(capacity) {
  return Array.from({ length: capacity }, (_, index) =>
    `${Math.floor(index / 4) + 1}${'ABCD'[index % 4]}`);
}
