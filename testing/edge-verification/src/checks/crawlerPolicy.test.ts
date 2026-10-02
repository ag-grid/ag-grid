import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { FakeAws, FakeHttp, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { crawlerPolicyChecks } from './crawlerPolicy';

async function runChartsHost(body: string) {
    const http = new FakeHttp(() => ({ status: 200, headers: { 'content-type': 'text/plain' }, body }));
    try {
        const check = crawlerPolicyChecks().find((c) => c.id === 'crawler-policy.robots.charts-host')!;
        return await check.run(await fakeCtx(new FakeAws(healthyCloudFront()), http));
    } finally {
        http.close();
    }
}

describe('crawler-policy.robots.charts-host: the whole legacy-host prohibition', () => {
    it('passes on User-agent: * / Disallow: /', async () => {
        const outcome = await runChartsHost('User-agent: *\nDisallow: /\n');
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    for (const [what, body, pattern] of [
        [
            'only /archive/ is disallowed',
            'User-agent: *\nDisallow: /archive/\n',
            /robots groups\[0\]\.rules\[0\]\.pattern: got "\/archive\/", expected "\/"/,
        ],
        [
            'a named crawler gets its own open group',
            'User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n',
            /robots groups\[1\]: got .*GPTBot.*, expected absent/,
        ],
        [
            'an Allow reopens a path',
            'User-agent: *\nDisallow: /\nAllow: /charts/\n',
            /robots groups\[0\]\.rules\[1\]: got .*allow.*, expected absent/,
        ],
        [
            'a Sitemap advertises the host',
            'User-agent: *\nDisallow: /\nSitemap: https://charts.ag-grid.com/sitemap.xml\n',
            /robots sitemaps: extra/,
        ],
        [
            'the Disallow is empty (allows everything)',
            'User-agent: *\nDisallow:\n',
            /robots groups\[0\]\.rules\[0\]: got absent/,
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await runChartsHost(body);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', pattern);
        });
    }
});
