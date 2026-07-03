const EDITABLE_BENCHMARK_FIELDS = new Set([
  'hos_moph_all',
  'hos_moph_send',
  'hos_loc_all',
  'hos_loc_send',
]);

function parseInteger(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : NaN;
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    return NaN;
  }

  return Number(value);
}

function normalizeBenchmarkUpdate(input) {
  const field = String(input?.field ?? '');
  if (!EDITABLE_BENCHMARK_FIELDS.has(field)) {
    throw new Error('Invalid field');
  }

  const id = parseInteger(input?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid id');
  }

  const value = parseInteger(input?.value);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Invalid value');
  }

  return { id, field, value };
}

module.exports = {
  EDITABLE_BENCHMARK_FIELDS,
  normalizeBenchmarkUpdate,
};
