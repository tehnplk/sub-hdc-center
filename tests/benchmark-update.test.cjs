/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require('node:assert/strict');
const test = require('node:test');

const { normalizeBenchmarkUpdate } = require('../src/lib/benchmark-update.cjs');

test('normalizes allowed benchmark numeric update', () => {
  assert.deepEqual(
    normalizeBenchmarkUpdate({
      id: '3',
      field: 'hos_moph_send',
      value: '12',
    }),
    {
      id: 3,
      field: 'hos_moph_send',
      value: 12,
    },
  );
});

test('rejects fields outside editable benchmark columns', () => {
  assert.throws(
    () =>
      normalizeBenchmarkUpdate({
        id: 3,
        field: 'system_on',
        value: 1,
      }),
    /Invalid field/,
  );
});

test('rejects negative or non-integer values', () => {
  assert.throws(
    () =>
      normalizeBenchmarkUpdate({
        id: 3,
        field: 'hos_loc_all',
        value: -1,
      }),
    /Invalid value/,
  );

  assert.throws(
    () =>
      normalizeBenchmarkUpdate({
        id: 3,
        field: 'hos_loc_all',
        value: '1.5',
      }),
    /Invalid value/,
  );
});
