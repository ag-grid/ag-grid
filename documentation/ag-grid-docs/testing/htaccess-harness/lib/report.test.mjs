// node --test: how a row's failures are classified against its known-fail marker, and which
// coverage gaps fail the run.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { classifyRow, coverageErrors } from './report.mjs';
import { parseFile } from './rows.mjs';

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

describe('coverageErrors', () => {
    const tsv = (text) => {
        const file = join(mkdtempSync(join(tmpdir(), 'htaccess-coverage-')), 'cases.tsv');
        writeFileSync(file, text);
        const { rows, directives } = parseFile(file);
        return { rows, declared: directives.categories, minRows: { 'cases.tsv': directives.minRows } };
    };
    const FILE = [
        '# @min-rows 2',
        '# @category redirects',
        'www\t/a\t301\t/a/',
        'www\t/b\t301\t/b/',
        'www\t/c\t301\t/c/',
        '# @category no-shadow',
        'www\t/charts/live/\t200\t',
    ].join('\n');

    it('passes when every declared category executed rows', () => {
        const { rows, declared, minRows } = tsv(FILE);
        assert.deepEqual(coverageErrors({ declared, minRows, executed: rows, siteSkipped: [] }), []);
    });

    it('fails a category whose rows were all deleted, though the file is still above @min-rows', () => {
        const { rows, declared, minRows } = tsv(FILE.replace('www\t/charts/live/\t200\t', ''));
        assert.deepEqual(coverageErrors({ declared, minRows, executed: rows, siteSkipped: [] }), [
            'cases.tsv:6: category no-shadow executed no rows',
        ]);
    });

    it('fails a category whose rows exist but did not run for any reason but a skipped site', () => {
        const { rows, declared, minRows } = tsv(FILE);
        const executed = rows.filter((row) => row.category !== 'no-shadow');
        assert.deepEqual(coverageErrors({ declared, minRows, executed, siteSkipped: [] }), [
            'cases.tsv:6: category no-shadow executed no rows',
        ]);
    });

    it('excuses a category, and its rows from the file minimum, when its site was explicitly skipped', () => {
        const { rows, declared, minRows } = tsv(FILE);
        const siteSkipped = rows.filter((row) => row.category === 'no-shadow');
        const executed = rows.filter((row) => !siteSkipped.includes(row));
        assert.deepEqual(coverageErrors({ declared, minRows, executed, siteSkipped }), []);
        assert.deepEqual(coverageErrors({ declared, minRows, executed: [], siteSkipped: rows }), []);
    });

    // generated-markdown.tsv mixes grid, charts and studio rows: skipping one site must lower the
    // minimum by that site's rows only, not switch the check off for the rows that still ran.
    const MIXED = [
        '# @min-rows 4',
        '# @category markdown',
        'www\t/a/\t200\t',
        'www\t/b/\t200\t',
        'www\t/charts/a/\t200\t',
        'www\t/charts/b/\t200\t',
    ].join('\n');
    const bySite = (rows) => ({
        grid: rows.filter((row) => !row.path.startsWith('/charts/')),
        charts: rows.filter((row) => row.path.startsWith('/charts/')),
    });

    it('lowers the file minimum by the rows of a skipped site', () => {
        const { rows, declared, minRows } = tsv(MIXED);
        const { grid, charts } = bySite(rows);
        assert.deepEqual(coverageErrors({ declared, minRows, executed: grid, siteSkipped: charts }), []);
    });

    it('still fails the file minimum for the other sites when one site is skipped', () => {
        // a grid row lost from a file whose charts rows were skipped
        const { rows, declared, minRows } = tsv(MIXED.replace('www\t/b/\t200\t\n', ''));
        const { grid, charts } = bySite(rows);
        assert.deepEqual(coverageErrors({ declared, minRows, executed: grid, siteSkipped: charts }), [
            'cases.tsv: 1 rows executed, @min-rows 4 less 2 site-skipped',
        ]);
    });

    it('fails a file that executed fewer rows than its @min-rows', () => {
        const { rows, declared, minRows } = tsv(FILE);
        assert.deepEqual(coverageErrors({ declared, minRows, executed: rows.slice(3), siteSkipped: [] }), [
            'cases.tsv: 1 rows executed, @min-rows 2',
            'cases.tsv:2: category redirects executed no rows',
        ]);
    });
});
