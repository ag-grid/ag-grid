// node --test: how a row's failures are classified against its known-fail marker.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { classifyRow } from './report.mjs';

const fail = (key) => ({ key, message: `${key} failed` });
const row = (knownFail = null) => ({ knownFail });
// the charts archive 404 row: only its Cache-Control is expected to be wrong
const cacheKnownFail = row({ assertions: ['cc'], ref: 'waf-finding.md §4' });

describe('classifyRow', () => {
    it('passes or fails a row with no known-fail on whether anything failed', () => {
        assert.deepEqual(classifyRow(row(), []), { kind: 'pass' });
        assert.deepEqual(classifyRow(row(), [fail('status')]), { kind: 'fail', fails: [fail('status')] });
    });

    it('accepts a known-fail row that fails only on the assertions it names', () => {
        assert.deepEqual(classifyRow(cacheKnownFail, [fail('cc')]), { kind: 'known', fails: [fail('cc')] });
    });

    it('keeps any failure the marker does not name fatal, reporting only those', () => {
        // a regression to a 500, or the wrong ErrorDocument, on top of the documented cache bug
        assert.deepEqual(classifyRow(cacheKnownFail, [fail('status'), fail('cc')]), {
            kind: 'fail',
            fails: [fail('status')],
        });
        assert.deepEqual(classifyRow(cacheKnownFail, [fail('cc'), fail('body')]), {
            kind: 'fail',
            fails: [fail('body')],
        });
    });

    it('keeps a transport error fatal on a known-fail row', () => {
        assert.equal(classifyRow(cacheKnownFail, [fail('error')]).kind, 'fail');
    });

    it('reports an unexpected pass when a named assertion passes', () => {
        assert.deepEqual(classifyRow(cacheKnownFail, []), { kind: 'unexpected', passing: ['cc'] });
        const two = row({ assertions: ['status', 'location'], ref: 'r' });
        assert.deepEqual(classifyRow(two, [fail('location')]), { kind: 'unexpected', passing: ['status'] });
    });

    it('does not let an unrelated failure hide a fixed known-fail as a known failure', () => {
        assert.deepEqual(classifyRow(cacheKnownFail, [fail('status')]), { kind: 'fail', fails: [fail('status')] });
    });
});
