// Tests for scripts/deployments/prep_and_archive/migrateDeployedArchiveHtaccess.sh --apply, with ssh
// and scp stubbed to act on a local directory standing in for the web box, so a damaged upload can be
// injected before the rename.
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrateArchiveHtaccess } from '../../../../../scripts/migrate-archive-htaccess.mjs';

const SCRIPT = fileURLToPath(
    new URL('../../../../../scripts/deployments/prep_and_archive/migrateDeployedArchiveHtaccess.sh', import.meta.url)
);
const deployed = readFileSync(
    new URL('./__fixtures__/deployed-archives/grid-36.2.0.htaccess', import.meta.url),
    'utf8'
);

// ssh runs its command locally; scp copies, treating "host:path" as path. $STUB_DAMAGE_UPLOAD
// appends to an upload.
const SSH_STUB = `#!/bin/bash
while [[ "$1" == -* ]]; do shift 2; done
shift
exec bash -c "$1"
`;
const SCP_STUB = `#!/bin/bash
while [[ "$1" == -* ]]; do if [ "$1" = -q ]; then shift; else shift 2; fi; done
src="$1"; dst="$2"
cp "\${src#*:}" "\${dst#*:}" || exit 1
if [[ "$dst" == *:* && -n "$STUB_DAMAGE_UPLOAD" ]]; then echo damaged >> "\${dst#*:}"; fi
`;

function box() {
    const root = mkdtempSync(join(tmpdir(), 'migrate-deployed-'));
    const bin = join(root, 'bin');
    const archive = join(root, 'html', 'archive', '36.2.0');
    mkdirSync(bin);
    mkdirSync(archive, { recursive: true });
    for (const [name, body] of [
        ['ssh', SSH_STUB],
        ['scp', SCP_STUB],
    ]) {
        writeFileSync(join(bin, name), body);
        chmodSync(join(bin, name), 0o755);
    }
    writeFileSync(join(archive, '.htaccess'), deployed);
    const apply = (env: Record<string, string> = {}) =>
        spawnSync('bash', [SCRIPT, 'user@box', '--apply', '--site', 'grid', '--version', '36.2.0'], {
            encoding: 'utf8',
            env: {
                ...process.env,
                PATH: `${bin}:${process.env.PATH}`,
                TMPDIR: root,
                SSH_FILE: 'key',
                SSH_PORT: '22',
                GRID_ROOT_DIR: join(root, 'html'),
                ...env,
            },
        });
    const live = () => readFileSync(join(archive, '.htaccess'), 'utf8');
    const staged = () => readdirSync(archive).filter((f) => f.startsWith('.htaccess.new-'));
    return { apply, live, staged };
}

describe('migrateDeployedArchiveHtaccess.sh --apply', () => {
    it('replaces the live archive .htaccess with the migrated one', () => {
        const b = box();
        const result = b.apply();
        expect(result.status, result.stdout + result.stderr).toBe(0);
        expect(b.live()).toBe(migrateArchiveHtaccess(deployed, { site: 'grid', base: '/archive/36.2.0' }).output);
        expect(b.staged()).toEqual([]);
    });

    // A damaged copy left live could fail every request under the archive.
    it('leaves the live file alone when the upload arrives damaged', () => {
        const b = box();
        const result = b.apply({ STUB_DAMAGE_UPLOAD: '1' });
        expect(result.status).toBe(1);
        expect(result.stdout).toContain('did not arrive intact');
        expect(b.live()).toBe(deployed);
        expect(b.staged()).toEqual([]);
    });
});
