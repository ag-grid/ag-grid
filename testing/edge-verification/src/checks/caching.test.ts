import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { MARKDOWN_ACCEPT } from '../core/http';
import { ARCHIVE_POISON_PROBE, POISON_PROBES } from '../expected/caching';
import { FakeAws, FakeHttp, type FakeResponse, type SentRequest, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { cachingChecks } from './caching';

const split = cachingChecks().find((c) => c.id === 'caching.archive-markdown-split')!;
const isMarkdown = (req: SentRequest): boolean => /text\/markdown/.test(req.headers.accept ?? '');

const HTML: FakeResponse = {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-cache': 'Miss from cloudfront' },
};
const MARKDOWN: FakeResponse = {
    status: 200,
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'x-cache': 'Miss from cloudfront' },
};
const CACHED_HTML: FakeResponse = { ...HTML, headers: { ...HTML.headers, 'x-cache': 'Hit from cloudfront' } };

async function runSplit(
    markdown: FakeResponse,
    html: FakeResponse
): Promise<{ status: string; detail?: string; http: FakeHttp }> {
    const http = new FakeHttp((req) => (isMarkdown(req) ? markdown : html));
    const ctx = await fakeCtx(new FakeAws(healthyCloudFront()), http);
    try {
        return { ...(await split.run(ctx)), http };
    } finally {
        http.close();
    }
}

describe('caching.archive-markdown-split', () => {
    it('passes when markdown is 200 text/markdown and the HTML that follows is 200 text/html', async () => {
        const { status, http } = await runSplit(MARKDOWN, HTML);
        assert.equal(status, 'pass');
        const gets = http.sent.filter((r) => r.method === 'GET');
        assert.deepEqual(
            gets.map((r) => [r.url, isMarkdown(r)]),
            [
                [`https://www.ag-grid.com${ARCHIVE_POISON_PROBE}`, true],
                [`https://www.ag-grid.com${ARCHIVE_POISON_PROBE}`, false],
            ]
        );
    });

    const BROKEN: Array<[string, FakeResponse, FakeResponse, RegExp]> = [
        [
            'the markdown request is blocked',
            { status: 403, headers: { 'content-type': 'text/plain' } },
            HTML,
            /markdown/,
        ],
        ['both requests get the same cached HTML', CACHED_HTML, CACHED_HTML, /markdown/],
        ['the HTML request fails', MARKDOWN, { status: 503, headers: { 'content-type': 'text/html' } }, /html status/],
        ['the HTML request gets markdown', MARKDOWN, MARKDOWN, /html/],
    ];
    for (const [why, markdown, html, detail] of BROKEN) {
        it(`fails when ${why}`, async () => {
            const result = await runSplit(markdown, html);
            assert.equal(result.status, 'fail', result.detail);
            assert.match(result.detail ?? '', detail);
        });
    }
});

describe('caching.never-hit', () => {
    const neverHit = cachingChecks().find((c) => c.id.startsWith('caching.never-hit.'))!;
    async function runNeverHit(response: FakeResponse) {
        const http = new FakeHttp(() => response);
        try {
            return await neverHit.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('passes on 200 misses', async () => {
        const outcome = await runNeverHit(HTML);
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails on a non-200 response, naming its status', async () => {
        const outcome = await runNeverHit({ status: 503, headers: { 'x-cache': 'Error from cloudfront' } });
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /503/);
    });

    it('fails on a cache hit', async () => {
        const outcome = await runNeverHit(CACHED_HTML);
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /Hit from cloudfront/);
    });
});

describe('caching.markdown-does-not-poison', () => {
    const poison = cachingChecks().find((c) => c.id.startsWith('caching.markdown-does-not-poison.'))!;
    async function runPoison(markdown: FakeResponse, html: FakeResponse) {
        const http = new FakeHttp((req) => (isMarkdown(req) ? markdown : html));
        try {
            return await poison.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
        } finally {
            http.close();
        }
    }

    it('passes when HTML stays uncached 200 text/html around a 200 markdown request', async () => {
        const outcome = await runPoison(MARKDOWN, HTML);
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    const BROKEN: Array<[string, FakeResponse, FakeResponse, RegExp]> = [
        ['the HTML requests fail', MARKDOWN, { status: 503, headers: { 'content-type': 'text/html' } }, /503/],
        ['the markdown request is blocked', { status: 403, headers: { 'content-type': 'text/plain' } }, HTML, /403/],
        ['the HTML after markdown is a cache hit', MARKDOWN, CACHED_HTML, /from cache/],
    ];
    it('sends its own markdown request even when another check already made the same one', async () => {
        const http = new FakeHttp((req) => (isMarkdown(req) ? MARKDOWN : HTML));
        try {
            const ctx = await fakeCtx(new FakeAws(healthyCloudFront()), http);
            // The first probe, as another check would have requested it.
            await http.request({
                url: `https://www.ag-grid.com${POISON_PROBES[0]}`,
                headers: { accept: MARKDOWN_ACCEPT },
            });
            const before = http.sent.length;
            await poison.run(ctx);
            const sent = http.sent.slice(before).map((r) => (isMarkdown(r) ? 'md' : 'html'));
            assert.deepEqual(sent.slice(-2), ['md', 'html']);
        } finally {
            http.close();
        }
    });

    for (const [why, markdown, html, detail] of BROKEN) {
        it(`fails when ${why}`, async () => {
            const outcome = await runPoison(markdown, html);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', detail);
        });
    }
});
