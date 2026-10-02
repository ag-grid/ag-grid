// Tests for scripts/deployments/prep_and_archive/patchUncachedArchives.sh, which patches the live
// root .htaccess over ssh. ssh and scp are stubbed to act on a local directory standing in for the
// web box, so the fetch -> patch -> upload -> swap protocol runs for real, and a concurrent change
// or a damaged upload can be injected between its steps.
import { spawn, spawnSync } from 'node:child_process';
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
// flock -w <seconds> <fd>, as util-linux has it (macOS has none): an exclusive lock on the inherited
// descriptor, which the calling shell then holds until it exits. With $STUB_FLOCK_HOLD it returns only
// once that file exists, so a test can keep the lock held while it lines up the other side.
const FLOCK_STUB = `#!/usr/bin/perl
use Fcntl qw(:flock);
my ($w, $secs, $fd) = @ARGV;
open(my $fh, ">>&=", $fd) or exit 1;
for (my $i = 0; $i < $secs * 10; $i++) {
    if (flock($fh, LOCK_EX | LOCK_NB)) {
        # $STUB_FLOCK_HOLD: keep the caller waiting, lock held, until that file exists.
        for (my $j = 0; $ENV{STUB_FLOCK_HOLD} && !-e $ENV{STUB_FLOCK_HOLD} && $j < 100; $j++) { select(undef, undef, undef, 0.1); }
        exit 0;
    }
    select(undef, undef, undef, 0.1);
}
exit 1;
`;
// The rename at the end of the swap. With $STUB_MV_BARRIER set, each caller waits (up to 3s) until
// two have arrived, so two unserialised swaps both pass their checks before either renames.
const MV_STUB = `#!/bin/bash
if [ -n "$STUB_MV_BARRIER" ]; then
    touch "$STUB_MV_BARRIER/$$"
    for i in $(seq 1 30); do [ "$(ls "$STUB_MV_BARRIER" | wc -l)" -ge 2 ] && break; sleep 0.1; done
fi
[ -n "$STUB_MV_SLEEP" ] && sleep "$STUB_MV_SLEEP"
exec /bin/mv "$@"
`;
// unzip -qo <zip> -d <dir>: copies the deploy's files from $STUB_UNZIP_FROM instead.
const UNZIP_STUB = `#!/bin/bash
while [ "$1" != -d ]; do shift; done
cp -R "$STUB_UNZIP_FROM/." "$2/"
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
        ['flock', FLOCK_STUB],
        ['mv', MV_STUB],
        ['unzip', UNZIP_STUB],
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
    const runAsync = ([grid, charts, action]: string[], env: Record<string, string> = {}) =>
        new Promise<{ status: number | null; stdout: string }>((resolve) => {
            const child = spawn('bash', [SCRIPT, grid, charts, 'user@box', action], {
                env: {
                    ...process.env,
                    PATH: `${bin}:${process.env.PATH}`,
                    SSH_FILE: 'key',
                    SSH_PORT: '22',
                    GRID_ROOT_DIR: docroot,
                    ...env,
                },
            });
            let stdout = '';
            child.stdout.on('data', (chunk) => (stdout += chunk));
            child.on('close', (status) => resolve({ status, stdout }));
        });
    const live = () => readFileSync(join(docroot, '.htaccess'), 'utf8');
    const leftovers = () => readdirSync(docroot).filter((f) => f !== '.htaccess' && f !== '.htaccess.lock');
    // A deploy script from scripts/deployments, with its @TOKENS@ filled in for this box.
    const deploy = (script: string, tokens: Record<string, string>, env: Record<string, string> = {}) => {
        let body = readFileSync(
            fileURLToPath(new URL(`../../../../../scripts/deployments/${script}`, import.meta.url)),
            'utf8'
        );
        for (const [token, value] of Object.entries(tokens)) {
            body = body.replaceAll(`@${token}@`, value);
        }
        return new Promise<{ status: number | null; output: string }>((resolve) => {
            const child = spawn('bash', ['-c', body, 'deploy', ...(env.ARGS ? [env.ARGS] : [])], {
                cwd: root,
                env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, ...env },
            });
            let output = '';
            child.stdout.on('data', (chunk) => (output += chunk));
            child.stderr.on('data', (chunk) => (output += chunk));
            child.on('close', (status) => resolve({ status, output }));
        });
    };
    return { root, docroot, run, runAsync, deploy, live, leftovers };
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

    // Two patchers at once (grid and charts release candidates) fetch the same file. Without a lock
    // both pass the hash check before either renames, and the second rename drops the first's entry.
    it('serialises two patchers, so the second stops rather than dropping the first', async () => {
        const b = box(generated(null, null));
        const barrier = join(b.docroot, '..', 'barrier');
        mkdirSync(barrier);
        const env = { STUB_MV_BARRIER: barrier };
        const [grid, charts] = await Promise.all([
            b.runAsync(args('36.3.0', '-', 'set'), env),
            b.runAsync(args('-', '14.3.0', 'set'), env),
        ]);
        const results = [grid, charts];
        expect(results.map((r) => r.status).sort(), results.map((r) => r.stdout).join('\n')).toEqual([0, 1]);
        expect(results.find((r) => r.status === 1)!.stdout).toContain('changed while this ran');
        const winner = grid.status === 0 ? generated('36.3.0', null) : generated(null, '14.3.0');
        expect(b.live()).toBe(winner);
        // Re-running the one that stopped lands both.
        const rerun = grid.status === 0 ? args('-', '14.3.0', 'set') : args('36.3.0', '-', 'set');
        expect(b.run(rerun).status).toBe(0);
        expect(b.live()).toBe(generated('36.3.0', '14.3.0'));
    }, 30_000);

    // A deploy that rewrites the root .htaccess must not land between a patch's check and its rename,
    // or the rename puts back the pre-deploy file with the patch on top and the deploy is lost.
    it('makes a staging deploy wait for a patch holding the lock, so the deploy is never undone', async () => {
        const b = box(generated(null, null));
        const barrier = join(b.root, 'barrier');
        mkdirSync(barrier);
        const deployed = `${generated(null, null)}# a newer deploy\n`;
        const files = join(b.root, 'release');
        mkdirSync(files);
        writeFileSync(join(files, '.htaccess'), deployed);
        writeFileSync(join(b.root, 'release.zip'), 'zip');
        const patch = b.runAsync(args('36.3.0', '-', 'set'), { STUB_MV_BARRIER: barrier });
        // Deploy while the patch is between its check and its rename.
        for (let i = 0; i < 100 && !readdirSync(barrier).length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        expect(readdirSync(barrier)).toHaveLength(1);
        const result = await b.deploy(
            'updateGridStagingRemote.sh',
            { WWW_ROOT_DIR: b.root, FILENAME: 'release.zip' },
            { STUB_UNZIP_FROM: files }
        );
        expect(result.status, result.output).toBe(0);
        expect((await patch).status).toBe(0);
        expect(b.live()).toBe(deployed);
    }, 30_000);

    // A production switch replaces the whole docroot directory: a patch that was waiting for the lock
    // in the old one must stop, not report success for a file that is no longer live.
    it('stops a patch whose docroot a production switch replaced while it waited', async () => {
        const b = box(generated(null, null));
        // The production layout: every directory the switch carries over from the old docroot (charts
        // and studio among them) lives inside it. Read from the script, so a new one cannot break this.
        const switchScript = readFileSync(
            fileURLToPath(
                new URL('../../../../../scripts/deployments/release/switchReleaseRemote.sh', import.meta.url)
            ),
            'utf8'
        );
        for (const [, dir] of switchScript.matchAll(/public_html_\$TIMESTAMP\/([\w.-]+)/g)) {
            mkdirSync(join(b.docroot, dir), { recursive: true });
        }
        const www = b.root;
        mkdirSync(join(www, 'public_html_tmp'));
        writeFileSync(join(www, 'public_html_tmp', '.htaccess'), `${generated(null, null)}# released\n`);
        // The switch takes the lock and holds it until the patch is waiting for it in the old docroot.
        const go = join(b.root, 'go');
        const switched = b.deploy(
            'release/switchReleaseRemote.sh',
            {
                GRID_ROOT_DIR: b.docroot,
                WWW_ROOT_DIR: www,
                CHARTS_ROOT_DIR: join(b.docroot, 'charts'),
                STUDIO_ROOT_DIR: join(b.docroot, 'studio'),
            },
            { STUB_FLOCK_HOLD: go, ARGS: '20261002' }
        );
        const patch = b.runAsync(args('36.3.0', '-', 'set'));
        // Uploaded beside the live file: from here the patch is in the old docroot, waiting for the lock.
        for (let i = 0; i < 100 && !readdirSync(b.docroot).some((f) => f.startsWith('.htaccess.new-')); i++) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        writeFileSync(go, '');
        const [switchResult, patchResult] = await Promise.all([switched, patch]);
        expect(switchResult.status, switchResult.output).toBe(0);
        expect(switchResult.output).not.toMatch(/cannot|No such file/);
        expect(patchResult.status).not.toBe(0);
        expect(patchResult.stdout).toContain('changed while this ran');
        expect(b.live()).toBe(`${generated(null, null)}# released\n`);
    }, 30_000);

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
