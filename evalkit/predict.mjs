import { createReadStream } from 'node:fs';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';

import { createSearch, loadVariant } from '../portfolio/search/run-search.mjs';

const [variant, dataset = new URL('./data/search-cases.jsonl.gz', import.meta.url)] =
  process.argv.slice(2);
if (!['baseline', 'a', 'b'].includes(variant)) {
  console.error('Usage: node evalkit/predict.mjs baseline|a|b [dataset.jsonl.gz]');
  process.exit(2);
}

const source = loadVariant(variant);
const cases = createInterface({
  input: createReadStream(dataset).pipe(createGunzip()),
  crlfDelay: Infinity,
});

for await (const line of cases) {
  const { id, buses, queries } = JSON.parse(line);
  const search = createSearch(source, buses.map(({ id, origin, destination, date, seats }) => ({
    bus_id: id, fromd: origin, tod: destination, date, nop: seats,
  })));
  const results = queries.map(({ origin, destination, date }) => {
    const { ids, alerts } = search({ fromd: origin, tod: destination, datejrny: date });
    return { ids, alert: alerts.length === 1 };
  });
  if (!process.stdout.write(JSON.stringify({ id, results }) + '\n')) {
    await once(process.stdout, 'drain');
  }
}
