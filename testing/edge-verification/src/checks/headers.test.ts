import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { headerChecks } from './headers';

const agree = headerChecks().find((c) => c.id === 'headers.archive-validators-agree')!;
const notModified = headerChecks().find((c) => c.id === 'headers.not-modified-keeps-cache')!;

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
    it('is inconclusive, not a pass, when every origin response agrees (nothing shows two hosts answered)', async () => {
        const outcome = await runAgree(() => ({ status: 200, headers: { ...MISS, ...VALIDATORS } }));
        assert.equal(outcome.status, 'skip', outcome.detail);
        assert.match(outcome.detail ?? '', /inconclusive/);
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

describe('headers.not-modified-keeps-cache', () => {
    const LONG = 'public, max-age=604800, s-maxage=31536000';
    async function runNotModified(firstCacheControl: string, notModified304: FakeResponse) {
        let n = 0;
        const http = new FakeHttp(() =>
            n++ === 0
                ? { status: 200, headers: { ...MISS, ...VALIDATORS, 'cache-control': firstCacheControl } }
                : notModified304
        );
        try {
            return await notModified.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('passes when the 200 has the long archive cache and the 304 does not resend Cache-Control', async () => {
        const outcome = await runNotModified(LONG, { status: 304, headers: MISS });
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails when the 200 already lacks the long archive cache', async () => {
        const outcome = await runNotModified('no-cache', { status: 304, headers: MISS });
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /cache-control/);
    });

    it('fails when the 304 replaces the stored Cache-Control', async () => {
        const outcome = await runNotModified(LONG, { status: 304, headers: { ...MISS, 'cache-control': 'no-cache' } });
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /replaces/);
    });
});

describe('headers.browser-cache-cap', () => {
    const cap = headerChecks().find((c) => c.id === 'headers.browser-cache-cap')!;
    const PAGE = '<script src="/_astro/app.AbCd1234.js"></script>';
    const BLOG =
        '<a href="https://www.ag-grid.com/blog/a-post/">p</a><script src="/blog/assets/built/prism.js"></script>' +
        '<link href="/blog/public/cards.min.css">';

    async function runCap(cacheControl: (url: string) => string | undefined, expires?: (url: string) => string) {
        const http = new FakeHttp((req) => {
            const url = new URL(req.url);
            const body = url.pathname === '/blog/' ? BLOG : PAGE;
            const headers: Record<string, string> = { date: 'Thu, 01 Oct 2026 00:00:00 GMT' };
            const cc = cacheControl(req.url);
            if (cc) {
                headers['cache-control'] = cc;
            }
            if (expires) {
                headers.expires = expires(req.url);
            }
            return { status: 200, headers: { 'content-type': 'text/html', ...headers }, body };
        });
        try {
            return await cap.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('passes when every class is within 7 days, whatever s-maxage says', async () => {
        const outcome = await runCap(() => 'public, max-age=604800, s-maxage=31536000');
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it("fails on Ghost's year-long max-age, naming the URL", async () => {
        const outcome = await runCap((url) =>
            url.includes('/blog/assets/') ? 'public, max-age=31536000' : 'no-cache'
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /\/blog\/assets\/built\/prism\.js \(200\): max-age=31536000/);
    });

    it('fails on an Expires more than 7 days after Date', async () => {
        const outcome = await runCap(
            () => undefined,
            (url) => (url.endsWith('/favicon.ico') ? 'Fri, 01 Oct 2027 00:00:00 GMT' : 'Thu, 01 Oct 2026 01:00:00 GMT')
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /favicon\.ico.*Expires/);
    });
});
