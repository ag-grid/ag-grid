import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { MIGRATED_SITES, SLASHLESS_RULE } from '../expected/migration';
import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { migrationChecks } from './migration';

const isMarkdown = (accept?: string): boolean => /text\/markdown/.test(accept ?? '');

async function runCheck(suffix: string, respond: (markdown: boolean) => FakeResponse) {
    const check = migrationChecks().find((c) => c.id.endsWith(suffix))!;
    assert.ok(check, `no migration check ending ${suffix}`);
    const http = new FakeHttp((req) => respond(isMarkdown(req.headers.accept)));
    try {
        return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
    } finally {
        http.close();
    }
}

describe('migration markdown negotiation', () => {
    const MARKDOWN: FakeResponse = { status: 200, headers: { 'content-type': 'text/markdown', vary: 'Accept' } };
    const HTML: FakeResponse = { status: 200, headers: { 'content-type': 'text/html', vary: 'Accept' } };

    it('passes when both variants are 200 and carry Vary: Accept', async () => {
        const outcome = await runCheck('.markdown', (md) => (md ? MARKDOWN : HTML));
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails when the HTML variant is a 503 error page', async () => {
        const outcome = await runCheck('.markdown', (md) => (md ? MARKDOWN : { ...HTML, status: 503 }));
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /503/);
    });
});

describe('migration backup-not-served', () => {
    it('passes on 403: the .ht* denial covers the backup pattern whether or not the file exists', async () => {
        const outcome = await runCheck('.backup-not-served', () => ({ status: 403 }));
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('is inconclusive on 404: the synthetic backup name may simply not exist', async () => {
        const outcome = await runCheck('.backup-not-served', () => ({ status: 404 }));
        assert.equal(outcome.status, 'skip', outcome.detail);
        assert.match(outcome.detail ?? '', /inconclusive/);
    });

    it('fails when the backup is served', async () => {
        const outcome = await runCheck('.backup-not-served', () => ({
            status: 200,
            headers: { 'content-type': 'text/plain' },
        }));
        assert.equal(outcome.status, 'fail', outcome.detail);
    });
});

describe('migration slash-less directory URLs (pending grid#15434 / #15435)', () => {
    const checks = migrationChecks().filter((c) => c.id.includes('.slashless.'));

    it('declares an alias-host and an http-www probe for every migrated version, all pending', () => {
        const versions = MIGRATED_SITES.reduce((n, site) => n + site.versions.length, 0);
        assert.equal(checks.length, versions * 2);
        assert.ok(checks.every((c) => c.pending?.includes('grid#15434')));
    });

    it('studio probes a directory page, not the dotted archive root', () => {
        const studio = checks.find((c) => c.id === 'migration.studio.2.1.1.slashless.alias-host')!;
        assert.ok(studio, 'no studio 2.1.1 slash-less check');
        assert.match(studio.title, /\/studio\/archive\/2\.1\.1\/react\/quick-start\?/);
    });

    it('every probe is one the committed rule matches: a listed host or http www, and a directory path', () => {
        for (const c of checks) {
            const from = new URL(c.title.split(' -> ')[0]);
            assert.ok(
                SLASHLESS_RULE.hosts.includes(from.hostname) ||
                    (from.hostname === 'www.ag-grid.com' && from.protocol === 'http:'),
                `${c.id}: ${from.hostname} over ${from.protocol} is not covered by the rule`
            );
            assert.match(
                from.pathname,
                SLASHLESS_RULE.directory,
                `${c.id}: ${from.pathname} is not a directory URL to the rule`
            );
            assert.ok(!from.pathname.endsWith('/'), `${c.id}: ${from.pathname} already has its slash`);
        }
    });

    const slashed = (url: string): string => url.replace(/\?/, '/?');
    const runOn = async (id: string, respond: (url: string) => FakeResponse) => {
        const check = checks.find((c) => c.id === id)!;
        const http = new FakeHttp((req) => respond(req.url));
        try {
            return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    };
    const id = 'migration.grid.36.0.0.slashless.alias-host';

    it('passes on one 301 straight to the slashed www URL', async () => {
        const outcome = await runOn(id, (url) =>
            url.startsWith('https://www.')
                ? { status: 200 }
                : { status: 301, headers: { location: slashed(url.replace(/\/\/[^/]+/, '//www.ag-grid.com')) } }
        );
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails on two hops: www without the slash, then the archive add-slash', async () => {
        const outcome = await runOn(id, (url) =>
            url.startsWith('https://www.')
                ? url.includes('/?')
                    ? { status: 200 }
                    : { status: 301, headers: { location: slashed(url) } }
                : { status: 301, headers: { location: url.replace(/\/\/[^/]+/, '//www.ag-grid.com') } }
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(
            outcome.detail ?? '',
            /Location: got "https:\/\/www\.ag-grid\.com\/archive\/36\.0\.0\/react-data-grid\/getting-started\?utm_source=edge-check"/
        );
    });
});
