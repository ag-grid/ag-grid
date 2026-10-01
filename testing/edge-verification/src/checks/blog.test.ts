import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { FakeAws, FakeHttp, fakeCtx, healthyCloudFront } from '../testing/fakes';
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
