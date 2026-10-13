// node --test: the known-fail marker must name assertions the row actually makes.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { parseFile, parseKnownFail } from './rows.mjs';

const row = (...keys) => ({ checks: keys.map((key) => ({ key, op: '=', value: 'x' })) });

describe('parseKnownFail', () => {
    it('reads the named assertions and the reference', () => {
        assert.deepEqual(parseKnownFail('cc:waf-finding.md §4: cached for a year', row('cc', 'body')), {
            assertions: ['cc'],
            ref: 'waf-finding.md §4: cached for a year',
        });
        assert.deepEqual(parseKnownFail('status,location:harness finding', row()), {
            assertions: ['status', 'location'],
            ref: 'harness finding',
        });
        assert.deepEqual(parseKnownFail('h:ETag,cc:ref', row('h:ETag', 'cc')), {
            assertions: ['h:ETag', 'cc'],
            ref: 'ref',
        });
    });

    it('rejects a marker that names no assertion', () => {
        assert.throws(() => parseKnownFail('waf-finding.md §4: cached for a year', row('cc')), /must name/);
        assert.throws(() => parseKnownFail('harness finding: shadowed', row()), /must name/);
    });

    it('rejects an assertion the row does not make, including a transport error', () => {
        assert.throws(() => parseKnownFail('body:ref', row('cc')), /names body, which the row does not assert/);
        assert.throws(() => parseKnownFail('error:ref', row('cc')), /names error/);
    });
});

describe('parseFile', () => {
    it('reports a bad known-fail marker with its file and line', () => {
        const file = join(mkdtempSync(join(tmpdir(), 'htaccess-rows-')), 'rows.tsv');
        writeFileSync(file, '# @category c\nwww\t/a/\t200\t\tcc=no-cache\tknown-fail=body:ref\n');
        assert.throws(() => parseFile(file), /rows\.tsv:2: known-fail names body/);
    });

    it('parses a valid marker onto the row', () => {
        const file = join(mkdtempSync(join(tmpdir(), 'htaccess-rows-')), 'rows.tsv');
        writeFileSync(file, 'www\t/a/\t404\t\tcc=no-cache\tknown-fail=cc:ref\n');
        assert.deepEqual(parseFile(file).rows[0].knownFail, { assertions: ['cc'], ref: 'ref' });
    });
});
