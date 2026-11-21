import assert from 'node:assert/strict';
import { createSearch, loadVariant } from './run-search.mjs';

const fixtures = [
  { bus_id: 1, fromd: 'bengaluru', tod: 'mysuru', date: '2027-01-05', nop: 2 },
  { bus_id: 2, fromd: 'bengaluru', tod: 'mysuru', date: '2027-01-05', nop: 1 },
  { bus_id: 3, fromd: 'bengaluru', tod: 'mangaluru', date: '2027-01-05', nop: 1 },
  { bus_id: 4, fromd: 'bengaluru', tod: 'mysuru', date: '2027-01-05', nop: 0 },
  { bus_id: 5, fromd: 'bengaluru', tod: 'mysuru', date: '2027-01-06', nop: 1 },
  { bus_id: 6, fromd: 'tumakuru', tod: 'mysuru', date: '2027-01-05', nop: 1 },
];

const cases = {
  'filters by route, date and availability': (search) => {
    assert.deepEqual(search('MYSURU'), { ids: [1, 2], alerts: [] });
  },
  'alerts on an initial no-match search': (search) => {
    assert.deepEqual(search('HUBBALLI'), { ids: [], alerts: ['No Buses found with ParticularS'] });
  },
  'replaces a longer result list': (search) => {
    search('MYSURU');
    assert.deepEqual(search('MANGALURU'), { ids: [3], alerts: [] });
  },
  'clears prior results when the next search has no matches': (search) => {
    search('MYSURU');
    assert.deepEqual(search('HUBBALLI'), { ids: [], alerts: ['No Buses found with ParticularS'] });
  },
};

const expected = {
  baseline: [true, false, false, false],
  a: [true, true, false, false],
  b: [true, true, true, true],
};

for (const [variant, expectedOutcomes] of Object.entries(expected)) {
  const source = loadVariant(variant);
  const outcomes = Object.entries(cases).map(([name, check]) => {
    const search = createSearch(source, fixtures);
    try {
      check((destination) => search({ fromd: 'BENGALURU', tod: destination, datejrny: '2027-01-05' }));
      console.log(`${variant} PASS ${name}`);
      return true;
    } catch (error) {
      if (!(error instanceof assert.AssertionError)) throw error;
      console.log(`${variant} FAIL ${name}`);
      console.log(`  actual ${JSON.stringify(error.actual)}, expected ${JSON.stringify(error.expected)}`);
      return false;
    }
  });
  assert.deepEqual(outcomes, expectedOutcomes, `Unexpected outcomes for ${variant}`);
}

console.log('Verified the expected baseline and candidate outcomes.');
