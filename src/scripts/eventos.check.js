// Run: node src/scripts/eventos.check.js (no output means it holds)
import assert from 'node:assert/strict';
import { countdown, stage } from './eventos.js';

const starts = '2026-11-21T15:00:00-05:00';
const at = (time) => Date.parse(`${time}-05:00`);

assert.equal(countdown(starts, at('2026-10-13T12:00:00')), 'Faltan 39 días.');
assert.equal(countdown(starts, at('2026-11-19T23:59:00')), 'Faltan 2 días.');
assert.equal(countdown(starts, at('2026-11-20T00:01:00')), 'Es mañana.');
assert.equal(countdown(starts, at('2026-11-21T00:01:00')), 'Es hoy.');
assert.equal(countdown(starts, at('2026-11-21T23:59:00')), 'Es hoy.');
assert.equal(countdown(starts, at('2026-11-22T00:01:00')), null);

const event = { starts, ends: '2026-11-21T18:00:00-05:00', deadline: '2026-11-14T23:59:00-05:00', full: false };
assert.equal(stage(event, at('2026-11-14T23:58:00')), 'open');
assert.equal(stage(event, at('2026-11-15T00:01:00')), 'closed');
assert.equal(stage({ ...event, full: true }, at('2026-10-20T12:00:00')), 'closed');
assert.equal(stage(event, at('2026-11-21T17:59:00')), 'closed');
assert.equal(stage(event, at('2026-11-21T18:01:00')), 'past');
