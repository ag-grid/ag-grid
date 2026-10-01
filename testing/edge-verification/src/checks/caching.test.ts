import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { ARCHIVE_POISON_PROBE } from '../expected/caching';
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
