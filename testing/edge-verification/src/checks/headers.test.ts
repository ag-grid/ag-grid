import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { CheckDef } from '../core/types';
import { BROWSER_CACHE_BLOG_CONTENT_URLS, BROWSER_CACHE_HEURISTIC_URLS, HEADER_ROWS } from '../expected/headers';
import { PENDING } from '../expected/lifecycle';
import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { browserCacheProblem, headerChecks } from './headers';

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

interface CapOptions {
    check?: CheckDef;
    status?: (url: string) => number;
    lastModified?: (url: string) => boolean;
}

describe('headers.browser-cache-cap', () => {
    const byId = (id: string) => headerChecks().find((c) => c.id === id)!;
    const cap = byId('headers.browser-cache-cap');
    const PAGE = '<script src="/_astro/app.AbCd1234.js"></script>';
    const BLOG =
        '<a href="https://www.ag-grid.com/blog/a-post/">p</a><script src="/blog/assets/built/prism.js"></script>' +
        '<link href="/blog/public/cards.min.css">';

    /** Each sampled URL answers with the status of the class it stands for, as production does. */
    const rowStatus = (url: string): number =>
        HEADER_ROWS.find((r) => r.url === url)?.status ?? BROWSER_CACHE_BLOG_CONTENT_URLS[url] ?? 200;

    async function runCap(
        cacheControl: (url: string) => string | undefined,
        expires?: (url: string) => string,
        { check = cap, status = rowStatus, lastModified = () => false }: CapOptions = {}
    ) {
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
            if (lastModified(req.url)) {
                headers['last-modified'] = 'Thu, 01 Jan 2015 00:00:00 GMT';
            }
            return { status: status(req.url), headers: { 'content-type': 'text/html', ...headers }, body };
        });
        try {
            return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('fails a sampled URL that did not reach its class (a WAF 403 or a 503), naming it', async () => {
        for (const got of [403, 503]) {
            const outcome = await runCap(() => 'no-cache', undefined, {
                status: (url) => (url.endsWith('/robots.txt') ? got : rowStatus(url)),
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', new RegExp(`robots\\.txt: expected 200, got ${got}`));
        }
    });

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

    it('fails a cacheable response with a Last-Modified and neither Cache-Control nor Expires', async () => {
        const outcome = await runCap((url) => (url.endsWith('/robots.txt') ? undefined : 'no-cache'), undefined, {
            lastModified: () => true,
        });
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /\/robots\.txt \(200\): Last-Modified with no Cache-Control or Expires/);
    });

    it('leaves a response with no Last-Modified, or a status not cacheable by default, to pass', async () => {
        assert.equal((await runCap(() => undefined)).status, 'pass');
        const fake = (status: number, headers: Record<string, string>) =>
            ({ status, headers: new Map(Object.entries(headers).map(([k, v]) => [k, [v]])) }) as any;
        const lastModified = { 'last-modified': 'Thu, 01 Jan 2015 00:00:00 GMT' };
        assert.equal(browserCacheProblem(fake(302, lastModified)), null);
        assert.match(browserCacheProblem(fake(200, lastModified)) ?? '', /Last-Modified with no Cache-Control/);
    });

    describe('headers.browser-cache-cap.heuristic', () => {
        const heuristic = byId('headers.browser-cache-cap.heuristic');

        it('is pending on the grid default and samples sitemaps, llms.txt, AGENTS.md and .well-known', () => {
            assert.equal(heuristic.pending, PENDING.gridDefaultCache);
            for (const url of ['/sitemap-index.xml', '/sitemap-0.xml', '/llms.txt', '/AGENTS.md', '/.well-known/']) {
                assert.ok(
                    Object.keys(BROWSER_CACHE_HEURISTIC_URLS).some((u) => u.includes(url)),
                    url
                );
            }
        });

        it('fails the sitemap index as served today, and passes it with the default', async () => {
            const today = await runCap(() => undefined, undefined, { check: heuristic, lastModified: () => true });
            assert.equal(today.status, 'fail', today.detail);
            assert.match(today.detail ?? '', /sitemap-index\.xml \(200\): Last-Modified/);
            const fixed = await runCap((url) => BROWSER_CACHE_HEURISTIC_URLS[url], undefined, {
                check: heuristic,
                lastModified: () => true,
            });
            assert.equal(fixed.status, 'pass', fixed.detail);
        });

        it('fails a feed or example library given the day default instead of no-cache', async () => {
            const outcome = await runCap(() => 'public, max-age=86400', undefined, {
                check: heuristic,
                lastModified: () => true,
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(
                outcome.detail ?? '',
                /changelog\.json Cache-Control: got \["public, max-age=86400"\], expected \["no-cache"\]/
            );
            assert.match(outcome.detail ?? '', /\/files\/[^ ]+ Cache-Control: got/);
            assert.doesNotMatch(outcome.detail ?? '', /sitemap-index\.xml Cache-Control/);
        });
    });

    describe('headers.browser-cache-cap.blog-content', () => {
        const blog = byId('headers.browser-cache-cap.blog-content');
        const ghost = (cc: string) => (url: string) => (url.includes('/blog/') ? cc : 'no-cache');

        it("fails Ghost's year-long images and 301s as served today, judging the 301 itself", async () => {
            const outcome = await runCap(ghost('public, max-age=31536000'), undefined, {
                check: blog,
                status: (url) => (url.includes('/content/') ? 200 : 301),
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', /\/blog\/content\/images\/[^ ]+ \(200\): max-age=31536000/);
            assert.match(outcome.detail ?? '', /\/blog\/rss \(301\): max-age=31536000/);
        });

        it('fails when a probe misses its class, e.g. the image 404s or a 301 becomes a no-cache 404', async () => {
            const outcome = await runCap(ghost('public, max-age=604800'), undefined, {
                check: blog,
                status: (url) => (url.includes('/content/') ? 404 : 301),
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', /logo-white\.svg: expected 200, got 404/);
        });

        it('passes once the vhost caps them at 7 days', async () => {
            const outcome = await runCap(ghost('public, max-age=604800'), undefined, {
                check: blog,
                status: (url) => (url.includes('/content/') ? 200 : 301),
            });
            assert.equal(outcome.status, 'pass', outcome.detail);
            assert.equal(blog.pending, PENDING.blogVhostCap);
        });
    });
});

describe('headers.html.no-x-frame-options and headers.redirect.blog-host-301', () => {
    const SECURITY = {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'geolocation=(), microphone=(), camera=()',
        'content-security-policy': "default-src 'self'; frame-ancestors 'self' https://*.ag-grid.com",
    };

    async function run(id: string, respond: (url: string) => FakeResponse) {
        const http = new FakeHttp((req) => respond(req.url));
        try {
            return await headerChecks()
                .find((c) => c.id === id)!
                .run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('fails a page that sends X-Frame-Options, naming it', async () => {
        const clean = await run('headers.html.no-x-frame-options', () => ({ status: 200 }));
        assert.equal(clean.status, 'pass', clean.detail);
        const outcome = await run('headers.html.no-x-frame-options', (url) => ({
            status: 200,
            headers: url.endsWith('/blog/') ? { 'x-frame-options': 'SAMEORIGIN' } : ({} as Record<string, string>),
        }));
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /\/blog\/ sends X-Frame-Options/);
    });

    it('fails the blog-host 301 when it carries only HSTS', async () => {
        const location = { location: 'https://www.ag-grid.com/blog/' };
        const full = await run('headers.redirect.blog-host-301', () => ({
            status: 301,
            headers: { ...SECURITY, ...location },
        }));
        assert.equal(full.status, 'pass', full.detail);
        const outcome = await run('headers.redirect.blog-host-301', () => ({
            status: 301,
            headers: { 'strict-transport-security': SECURITY['strict-transport-security'], ...location },
        }));
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /referrer-policy: expected exactly one copy, got 0/);
    });
});

describe('headers.archive.charts-404-not-cached', () => {
    const check = headerChecks().find((c) => c.id === 'headers.archive.charts-404-not-cached')!;
    async function run(cacheControl?: string) {
        const http = new FakeHttp(() => ({
            status: 404,
            headers: cacheControl ? { 'cache-control': cacheControl } : ({} as Record<string, string>),
        }));
        try {
            return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('passes only on exactly no-cache', async () => {
        assert.equal((await run('no-cache')).status, 'pass');
    });

    // A missing header leaves the 404 to CloudFront's default TTL, so it is as wrong as a long one.
    for (const [why, value] of [
        ['a missing Cache-Control', undefined],
        ['the 7-day archive cache', 'public, max-age=604800'],
        ['the year-long archive cache', 'public, max-age=604800, s-maxage=31536000'],
    ] as const) {
        it(`fails on ${why}`, async () => {
            const outcome = await run(value);
            assert.equal(outcome.status, 'fail', outcome.detail);
        });
    }
});
