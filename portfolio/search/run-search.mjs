import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourcePath = 'front-end-code/src/app/bus-booking/bus-booking.component.ts';
const baseline = '5079ff7cdb022a12546283047c0c2c327f6363e9';
const original = execFileSync('git', ['show', `${baseline}:${sourcePath}`], { cwd: root });

export function loadVariant(variant) {
  if (variant === 'baseline') return original.toString('utf8');
  assert.ok(variant === 'a' || variant === 'b', 'Expected baseline, a, or b');
  const scratch = mkdtempSync(join(tmpdir(), 'busbooking-eval-'));
  try {
    const sourceFile = join(scratch, sourcePath);
    mkdirSync(dirname(sourceFile), { recursive: true });
    writeFileSync(sourceFile, original);
    const patch = fileURLToPath(new URL(`candidate-${variant}.patch`, import.meta.url));
    execFileSync('git', ['apply', '--unidiff-zero', patch], { cwd: scratch });
    return readFileSync(sourceFile, 'utf8');
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export function createSearch(source, fixtures) {
  // The current method body uses plain JavaScript. Execute it with form and
  // alert stand-ins so the check does not need the legacy Angular toolchain.
  const body = source.match(/\bsearchbtn\(\)\s*\{([\s\S]*?)\n\}\s*\ntoday=new Date\(\);/)?.[1];
  assert.ok(body, 'Expected searchbtn method immediately before the today field');
  const run = new Function('Swal1', body);
  const component = { bb: fixtures, temp: [] };

  return (values) => {
    component.BusBookingForm = { get: (field) => ({ value: values[field] }) };
    const alerts = [];
    run.call(component, { fire: ({ text }) => alerts.push(text) });
    return { ids: component.temp.map(({ bus_id }) => bus_id), alerts };
  };
}
