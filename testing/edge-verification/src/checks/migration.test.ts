import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

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
