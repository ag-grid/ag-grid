// Tests for scripts/deployments/prep_and_archive/patchUncachedArchives.sh, which patches the live
// root .htaccess over ssh. ssh and scp are stubbed to act on a local directory standing in for the
// web box, so the fetch -> patch -> upload -> swap protocol runs for real, and a concurrent change
// or a damaged upload can be injected between its steps.
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getHtaccessContent } from './htaccessRules';

const SCRIPT = fileURLToPath(
    new URL('../../../../../scripts/deployments/prep_and_archive/patchUncachedArchives.sh', import.meta.url)
);

const generated = (grid: string | null, charts: string | null) =>
    getHtaccessContent({ env: 'production', uncachedGridArchive: grid, uncachedChartsArchive: charts });

// ssh runs its command locally; scp copies, treating "host:path" as path. After fetching the live
// file, scp runs $STUB_AFTER_FETCH (the concurrent change); $STUB_DAMAGE_UPLOAD appends to an upload.
const SSH_STUB = `#!/bin/bash
while [[ "$1" == -* ]]; do shift 2; done
shift
exec bash -c "$1"
`;
const SCP_STUB = `#!/bin/bash
while [[ "$1" == -* ]]; do if [ "$1" = -q ]; then shift; else shift 2; fi; done
src="$1"; dst="$2"
cp "\${src#*:}" "\${dst#*:}" || exit 1
if [[ "$src" == *:* && -n "$STUB_AFTER_FETCH" ]]; then bash -c "$STUB_AFTER_FETCH"; fi
if [[ "$dst" == *:* && -n "$STUB_DAMAGE_UPLOAD" ]]; then echo damaged >> "\${dst#*:}"; fi
`;

function box(initial: string) {
    const root = mkdtempSync(join(tmpdir(), 'patch-uncached-'));
    const bin = join(root, 'bin');
    const docroot = join(root, 'html');
    mkdirSync(bin);
    mkdirSync(docroot);
    for (const [name, body] of [
        ['ssh', SSH_STUB],
        ['scp', SCP_STUB],
    ]) {
        writeFileSync(join(bin, name), body);
        chmodSync(join(bin, name), 0o755);
    }
    writeFileSync(join(docroot, '.htaccess'), initial);
    // patchUncachedArchives.sh <grid|-> <charts|-> <host> [set|clear]
    const run = ([grid, charts, action]: string[], env: Record<string, string> = {}) =>
        spawnSync('bash', [SCRIPT, grid, charts, 'user@box', action], {
            encoding: 'utf8',
            env: {
                ...process.env,
                PATH: `${bin}:${process.env.PATH}`,
                SSH_FILE: 'key',
                SSH_PORT: '22',
                GRID_ROOT_DIR: docroot,
                ...env,
            },
        });
    const live = () => readFileSync(join(docroot, '.htaccess'), 'utf8');
    const leftovers = () => readdirSync(docroot).filter((f) => f !== '.htaccess');
    return { docroot, run, live, leftovers };
}

const args = (grid: string, charts: string, action: string) => [grid, charts, action];

describe('patchUncachedArchives.sh', () => {
    it('patches the live file, keeping a backup of what it replaced', () => {
        const before = generated('36.3.0', null);
        const b = box(before);
        const result = b.run(args('-', '14.3.0', 'set'));
        expect(result.status, result.stdout + result.stderr).toBe(0);
        expect(b.live()).toBe(generated('36.3.0', '14.3.0'));
        const backups = b.leftovers().filter((f) => f.startsWith('.htaccess.bak-'));
        expect(backups).toHaveLength(1);
        expect(readFileSync(join(b.docroot, backups[0]), 'utf8')).toBe(before);
        expect(b.leftovers().filter((f) => f.startsWith('.htaccess.new-'))).toEqual([]);
    });

    it('uploads nothing when the patch changes nothing', () => {
        const b = box(generated(null, '14.3.0'));
        const result = b.run(args('-', '14.3.0', 'set'));
        expect(result.status).toBe(0);
        expect(b.leftovers()).toEqual([]);
    });

    // The lost update: another product's in-flight entry (or a docs deploy) lands on the live file
    // after this run fetched it. Swapping in the patched copy would silently drop that change.
    it('leaves the live file alone when it changed after being fetched', () => {
        const b = box(generated(null, null));
        const concurrent = generated('36.3.0', null);
        const changed = join(b.docroot, '..', 'concurrent');
        writeFileSync(changed, concurrent);
        const result = b.run(args('-', '14.3.0', 'set'), {
            STUB_AFTER_FETCH: `cp '${changed}' '${join(b.docroot, '.htaccess')}'`,
        });
        expect(result.status).not.toBe(0);
        expect(result.stdout).toContain('changed while this ran');
        expect(result.stdout).toContain('Re-run');
        expect(b.live()).toBe(concurrent);
        expect(b.leftovers()).toEqual([]);
    });

    it('leaves the live file alone when the upload arrives damaged', () => {
        const before = generated(null, null);
        const b = box(before);
        const result = b.run(args('36.3.0', '-', 'set'), { STUB_DAMAGE_UPLOAD: '1' });
        expect(result.status).not.toBe(0);
        expect(result.stdout).toContain('did not arrive intact');
        expect(b.live()).toBe(before);
        expect(b.leftovers()).toEqual([]);
    });

    it('clears one product and keeps the other', () => {
        const b = box(generated('36.3.0', '14.3.0'));
        const result = b.run(args('-', '14.3.0', 'clear'));
        expect(result.status).toBe(0);
        expect(b.live()).toBe(generated('36.3.0', null));
    });

    it('refuses to clear a version that is not in flight, changing nothing', () => {
        const before = generated('36.3.0', '14.3.0');
        const b = box(before);
        const result = b.run(args('-', '14.2.0', 'clear'));
        expect(result.status).not.toBe(0);
        expect(b.live()).toBe(before);
        expect(b.leftovers()).toEqual([]);
    });

    it('rejects a call with no version at all', () => {
        const b = box(generated(null, null));
        expect(b.run(args('-', '-', 'set')).status).not.toBe(0);
        expect(existsSync(join(b.docroot, '.htaccess'))).toBe(true);
    });
});
