import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { blogChecks } from './blog';

const URL = 'https://www.ag-grid.com/blog/whats-new-in-ag-grid-36-1/';

async function runPost(jsonLd: string) {
    const http = new FakeHttp(() => ({
        status: 200,
        headers: { 'content-type': 'text/html' },
        body: `<link rel="canonical" href="${URL}"><script type="application/ld+json">${jsonLd}</script>`,
    }));
    try {
        const check = blogChecks().find((c) => c.id === 'blog.post')!;
        return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
    } finally {
        http.close();
    }
}

describe('blog.post structured data', () => {
    it('fails when the JSON-LD block does not parse', async () => {
        const outcome = await runPost('{broken');
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /1 JSON-LD block does not parse/);
        assert.match(outcome.detail ?? '', /no valid JSON-LD/);
    });

    it('accepts a block that parses', async () => {
        const outcome = await runPost('{"@type":"BlogPosting"}');
        assert.doesNotMatch(outcome.detail ?? '', /JSON-LD/);
    });
});

async function runBlog(id: string, respond: (url: string) => FakeResponse) {
    const http = new FakeHttp((req) => respond(req.url));
    try {
        const check = blogChecks().find((c) => c.id === id)!;
        return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
    } finally {
        http.close();
    }
}

describe('blog.redirects.legacy-extra', () => {
    // As observed live on 2026-10-02.
    const live = (url: string): FakeResponse => {
        const path = new globalThis.URL(url).pathname;
        const to: Record<string, string> = {
            '/blog/community': 'https://www.ag-grid.com/community',
            '/community': 'https://www.ag-grid.com/community/',
            '/blog/react-data-grid': 'https://www.ag-grid.com/react-data-grid',
            '/react-data-grid': 'https://www.ag-grid.com/react-data-grid/',
        };
        if (to[path]) {
            return { status: 301, headers: { location: to[path] } };
        }
        return { status: path.startsWith('/blog/') ? 410 : 200 };
    };

    it('passes the live chains and 410s', async () => {
        const outcome = await runBlog('blog.redirects.legacy-extra', live);
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails a 410 that turns into a 404, and a section that stops redirecting', async () => {
        const outcome = await runBlog('blog.redirects.legacy-extra', (url) =>
            url.endsWith('/high-frequency-multi-series/')
                ? { status: 404 }
                : url.endsWith('/blog/community')
                  ? { status: 200 }
                  : live(url)
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /high-frequency-multi-series\/: 404/);
        assert.match(outcome.detail ?? '', /\/community: 200/);
    });
});

describe('blog.footer-links-final', () => {
    const page = (href: string): FakeResponse => ({
        status: 200,
        headers: { 'content-type': 'text/html' },
        body:
            '<footer class="post-card-meta"><a href="/blog/author/x/">x</a></footer>' +
            `<footer class="site-footer"><a href="https://www.ag-grid.com/changelog/">c</a><a href="${href}">p</a>` +
            '<a href="https://github.com/ag-grid/ag-grid">g</a></footer>',
    });

    it('passes when every www link in the site footer answers 200 itself', async () => {
        const outcome = await runBlog('blog.footer-links-final', (url) =>
            url.endsWith('/blog/') ? page('https://www.ag-grid.com/privacy/') : { status: 200 }
        );
        assert.equal(outcome.status, 'pass', outcome.detail);
        assert.match(outcome.detail ?? '', /2 links/);
    });

    it('fails a footer link that redirects', async () => {
        const outcome = await runBlog('blog.footer-links-final', (url) =>
            url.endsWith('/blog/')
                ? page('https://www.ag-grid.com/privacy')
                : url.endsWith('/privacy')
                  ? { status: 301, headers: { location: 'https://www.ag-grid.com/privacy/' } }
                  : { status: 200 }
        );
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /privacy: 301/);
    });
});

describe('blog.post-published-date', () => {
    const post = (published: string): FakeResponse => ({
        status: 200,
        headers: { 'content-type': 'text/html' },
        body: `<meta property="article:published_time" content="${published}">`,
    });

    it('passes a pre-move date', async () => {
        const outcome = await runBlog('blog.post-published-date', () => post('2018-08-07T14:04:00.000Z'));
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails the migration day', async () => {
        const outcome = await runBlog('blog.post-published-date', () => post('2026-08-21T10:00:00.000Z'));
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /2026-08-21/);
    });
});
