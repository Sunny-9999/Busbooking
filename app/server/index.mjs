import { createApp } from './http.mjs';
import { createStore } from './store.mjs';

const store = createStore(process.env.BUSBOOKING_DB ?? 'busbooking.sqlite');
const app = createApp(store);
app.listen(Number(process.env.PORT ?? 3000), '127.0.0.1', () => {
  console.log(`Busbooking is available at http://127.0.0.1:${app.address().port}`);
});
app.on('close', () => store.close());
