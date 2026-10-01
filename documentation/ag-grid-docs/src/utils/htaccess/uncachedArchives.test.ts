// Tests for scripts/uncached-archives.mjs, which sets and clears the in-flight archive exemption
// in the deployed root .htaccess, for grid and charts independently.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getHtaccessContent } from './htaccessRules';

const SCRIPT = fileURLToPath(new URL('../../../../../scripts/uncached-archives.mjs', import.meta.url));

const generated = (grid: string | null, charts: string | null) =>
    getHtaccessContent({ env: 'production', uncachedGridArchive: grid, uncachedChartsArchive: charts });

const run = (content: string, ...args: string[]) => {
    const file = join(mkdtempSync(join(tmpdir(), 'uncached-')), '.htaccess');
    writeFileSync(file, content);
    const result = spawnSync('node', [SCRIPT, file, ...args], { encoding: 'utf8' });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr, content: readFileSync(file, 'utf8') };
};

describe('uncached-archives.mjs', () => {
    it.each([
        ['both', ['36.3.0', '14.3.0'], '36.3.0', '14.3.0'],
        ['grid only', ['36.3.0', '-'], '36.3.0', null],
        ['charts only', ['-', '14.3.0'], null, '14.3.0'],
    ] as const)('sets %s, landing exactly what the generator emits for that state', (_, args, grid, charts) => {
        const result = run(generated(null, null), 'set', ...args);
        expect(result.status).toBe(0);
        expect(result.content).toBe(generated(grid, charts));
    });

    it("sets one product and keeps the other's line byte for byte", () => {
        // A hand-spaced grid line still is grid's line: it must survive a charts set untouched.
        const grid = generated('36.2.0', null);
        expect(run(grid, 'set', '-', '14.3.0').content).toBe(generated('36.2.0', '14.3.0'));
        expect(run(generated(null, '14.2.0'), 'set', '36.3.0', '-').content).toBe(generated('36.3.0', '14.2.0'));
        // Replacing a product's version leaves the other alone too.
        expect(run(generated('36.2.0', '14.2.0'), 'set', '-', '14.3.0').content).toBe(generated('36.2.0', '14.3.0'));
    });

    it('keeps at most one line per product', () => {
        const once = run(generated('36.2.0', '14.2.0'), 'set', '36.3.0', '-').content;
        expect(once.match(/m#\^\/archive\//g)).toHaveLength(1);
        expect(once.match(/m#\^\/charts\/archive\//g)).toHaveLength(1);
    });

    it('is idempotent', () => {
        const result = run(generated('36.3.0', '14.3.0'), 'set', '36.3.0', '14.3.0');
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('already set');
        expect(result.content).toBe(generated('36.3.0', '14.3.0'));
    });

    it('clears one product while the other stays in flight', () => {
        expect(run(generated('36.3.0', '14.3.0'), 'clear', '-', '14.3.0').content).toBe(generated('36.3.0', null));
        expect(run(generated('36.3.0', '14.3.0'), 'clear', '36.3.0', '-').content).toBe(generated(null, '14.3.0'));
        expect(run(generated('36.3.0', '14.3.0'), 'clear', '36.3.0', '14.3.0').content).toBe(generated(null, null));
    });

    it('refuses to clear a version that is not the one in flight, changing nothing', () => {
        const before = generated('36.3.0', '14.3.0');
        for (const args of [
            ['36.2.0', '-'],
            ['-', '14.2.0'],
            // One match does not make the other's mismatch acceptable.
            ['36.3.0', '14.2.0'],
        ]) {
            const result = run(before, 'clear', ...args);
            expect(result.status, args.join(' ')).toBe(1);
            expect(result.stderr).toContain('REFUSING');
            expect(result.content).toBe(before);
        }
    });

    it('treats clearing a product with nothing in flight as already clear', () => {
        const result = run(generated(null, '14.3.0'), 'clear', '36.3.0', '-');
        expect(result.status).toBe(0);
        expect(result.content).toBe(generated(null, '14.3.0'));
    });

    it('never touches a byte outside the marker block', () => {
        const before = generated(null, null);
        const after = run(before, 'set', '-', '14.3.0').content;
        const marker = '# BEGIN in-flight release archives';
        expect(after.slice(0, after.indexOf(marker))).toBe(before.slice(0, before.indexOf(marker)));
        const end = '# END in-flight release archives';
        expect(after.slice(after.indexOf(end))).toBe(before.slice(before.indexOf(end)));
    });

    it('prints the state with no action', () => {
        expect(run(generated(null, '14.3.0')).stdout.trim()).toBe('charts 14.3.0');
        expect(run(generated('36.3.0', '14.3.0')).stdout.trim()).toBe('grid 36.3.0, charts 14.3.0');
        expect(run(generated(null, null)).stdout.trim()).toBe('nothing in flight');
    });

    it.each([
        ['a bad grid version', ['set', '36.3', '-']],
        ['a bad charts version', ['set', '-', 'v14.3.0']],
        ['no version at all', ['set', '-', '-']],
        ['a missing argument', ['set', '36.3.0']],
        ['an unknown action', ['unset', '36.3.0', '-']],
    ])('rejects %s without changing the file', (_, args) => {
        const before = generated('36.2.0', null);
        const result = run(before, ...args);
        expect(result.status).toBe(2);
        expect(result.content).toBe(before);
    });

    it('refuses a block holding anything it did not write', () => {
        const before = generated('36.2.0', null).replace(
            '# END in-flight release archives',
            'Header set Cache-Control "no-store"\n# END in-flight release archives'
        );
        const result = run(before, 'set', '-', '14.3.0');
        expect(result.status).toBe(1);
        expect(result.content).toBe(before);
    });
});
