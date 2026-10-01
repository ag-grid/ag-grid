import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { headerChecks } from './headers';

const agree = headerChecks().find((c) => c.id === 'headers.archive-validators-agree')!;

const MISS = { 'x-cache': 'Miss from cloudfront' };
const VALIDATORS = { etag: '"abc-123"', 'last-modified': 'Tue, 22 Sep 2026 10:00:00 GMT' };

/** Runs the check with every response from the origin, the n-th answered by `respond(n)`. */
async function runAgree(respond: (n: number) => FakeResponse) {
    let n = 0;
    const http = new FakeHttp(() => respond(n++));
    try {
        return await agree.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
    } finally {
        http.close();
    }
}

describe('headers.archive-validators-agree', () => {
    it('passes when every origin response is a 200 with the same ETag and Last-Modified', async () => {
        const outcome = await runAgree(() => ({ status: 200, headers: { ...MISS, ...VALIDATORS } }));
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    const BROKEN: Array<[string, (n: number) => FakeResponse, RegExp]> = [
        ['no response carries validators', () => ({ status: 200, headers: MISS }), /ETag/],
        [
            'Last-Modified is missing everywhere',
            () => ({ status: 200, headers: { ...MISS, etag: '"x"' } }),
            /Last-Modified/,
        ],
        ['the origin answers with an error', () => ({ status: 503, headers: { ...MISS, ...VALIDATORS } }), /503/],
        [
            'the hosts send different ETags',
            (n) => ({ status: 200, headers: { ...MISS, ...VALIDATORS, etag: `"host-${n % 2}"` } }),
            /ETags differ/,
        ],
    ];
    for (const [why, respond, detail] of BROKEN) {
        it(`fails when ${why}`, async () => {
            const outcome = await runAgree(respond);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', detail);
        });
    }
});
