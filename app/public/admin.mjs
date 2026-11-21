import { request } from './api.mjs';
import { element } from './render.mjs';

export function setupAdmin(minDate, maxDate) {
  const dialog = document.getElementById('admin-dialog');
  const form = document.getElementById('admin-form');
  const target = document.getElementById('admin-services');
  const status = document.getElementById('admin-status');
  Object.assign(form.elements.namedItem('day'), { min: minDate, max: maxDate, value: minDate });

  document.getElementById('open-admin').addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('close', () => {
    form.elements.namedItem('key').value = '';
    target.replaceChildren();
    status.textContent = '';
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { key, day } = Object.fromEntries(new FormData(form));
    const load = form.querySelector('button');
    load.disabled = true;
    target.replaceChildren();
    status.textContent = 'Loading services…';
    try {
      const services = await request(`admin/services?${new URLSearchParams({ day })}`, { token: key });
      if (!dialog.open || form.elements.namedItem('key').value !== key) return;
      status.textContent = `Services for ${day}`;
      for (const service of services) {
        const card = element('section', undefined, 'booking-item');
        const fareForm = element('form', undefined, 'stop-fields');
        const label = element('label', 'Base fare (₹)');
        const fare = element('input');
        Object.assign(fare, { type: 'number', min: '100', max: '10000', required: true, value: service.baseFare });
        label.append(fare);
        const save = element('button', 'Save fare', 'primary');
        fareForm.append(label, save);
        const feedback = element('p');
        feedback.setAttribute('role', 'status');
        fareForm.addEventListener('submit', async (submit) => {
          submit.preventDefault();
          save.disabled = true;
          try {
            await request(`admin/services/${service.id}`, {
              method: 'PATCH', token: key, data: { fare: Number(fare.value) },
            });
            feedback.textContent = 'Fare saved for this service across dates.';
          } catch (error) {
            feedback.textContent = error.message;
          } finally {
            save.disabled = false;
          }
        });
        card.append(element('h3', service.operator),
          element('p', `${service.origin} to ${service.destination} · ${service.departure}`),
          element('p', `${service.capacity - service.available} / ${service.capacity} seats reserved`), fareForm, feedback);
        const manifest = element('details');
        manifest.append(element('summary', `Reservations (${service.reservations.length})`));
        for (const booking of service.reservations) {
          manifest.append(element('p', `${booking.id.slice(0, 8).toUpperCase()} · ${booking.seats.join(', ') || booking.quantity + ' seats'} · ${booking.status}`));
        }
        card.append(manifest);
        target.append(card);
      }
    } catch (error) {
      if (dialog.open) status.textContent = error.message;
    } finally {
      load.disabled = false;
    }
  });
}
