import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { runOne } from '../core/runner';
import { AI_GROUP } from '../expected/robots';
import { FakeAws, FakeHttp, cfAclHandlers, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { crawlerPolicyChecks } from './crawlerPolicy';

const check = (id: string) => crawlerPolicyChecks().find((c) => c.id === id)!;

const lines = (prefix: string, paths: string[]) => paths.map((p) => `${prefix}: ${p}`).join('\n');

/** robots.txt with a * group and the AI group, in the shape robotsTxt.ts generates. */
function robots(star: string[], ai: string[]): string {
    return [
        'User-agent: *',
        'Allow: /',
        lines('Disallow', star),
        '',
        ...AI_GROUP.map((agent) => `User-agent: ${agent}`),
        'Allow: /',
        lines('Disallow', ai),
        '',
    ].join('\n');
}

// Every Disallow comes with its markdown twins, as the generator writes them.
const withTwins = (dirs: string[]) => dirs.flatMap((d) => [d, `${d.slice(0, -1)}.md$`, `${d.slice(0, -1)}.md?`]);

async function mirror(body: string) {
    const http = new FakeHttp((req) =>
        req.url === 'https://www.ag-grid.com/robots.txt'
            ? { status: 200, headers: { 'content-type': 'text/plain' }, body }
            : { status: 404 }
    );
    try {
        return await runOne(
            check('crawler-policy.robots.ai-group-mirrors-star'),
            await fakeCtx(new FakeAws(healthyCloudFront()), http)
        );
    } finally {
        http.close();
    }
}

async function runChartsHost(body: string) {
    const http = new FakeHttp(() => ({ status: 200, headers: { 'content-type': 'text/plain' }, body }));
    try {
        return await check('crawler-policy.robots.charts-host').run(
            await fakeCtx(new FakeAws(healthyCloudFront()), http)
        );
    } finally {
        http.close();
    }
}

describe('crawler-policy.robots.ai-group-mirrors-star', () => {
    // The generator drops archive and example paths from the AI group before it adds the twins, so
    // the twins of those directories are left out with them.
    it('passes when the AI group leaves out the archive and example directories and their twins', async () => {
        const kept = ['/debug/', '/changelog/releases/'];
        const open = ['/archive/', '/charts/archive/', '/studio/archive/', '/examples/', '/studio/examples/'];
        const result = await mirror(robots(withTwins([...kept, ...open]), withTwins(kept)));
        assert.equal(result.status, 'pass', result.detail);
    });

    it('fails when the AI group drops the twin of a directory it still blocks', async () => {
        const kept = ['/debug/', '/changelog/releases/'];
        const ai = withTwins(kept).filter((d) => d !== '/debug.md$');
        const result = await mirror(robots(withTwins(kept), ai));
        assert.equal(result.status, 'fail', result.detail);
        assert.match(result.detail ?? '', /\/debug\.md\$/);
    });

    it('does not treat a page whose name merely ends in archive as an archive', async () => {
        const result = await mirror(robots(withTwins(['/documentation-archive/']), []));
        assert.equal(result.status, 'fail', result.detail);
        assert.match(result.detail ?? '', /\/documentation-archive\.md\?/);
    });
});

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

describe('crawler-policy checks never pass over nothing', () => {
    const run = async (id: string, robots: string) => {
        const http = new FakeHttp(() => ({ status: 200, headers: { 'content-type': 'text/plain' }, body: robots }));
        try {
            const check = crawlerPolicyChecks().find((c) => c.id === id)!;
            return await check.run(await fakeCtx(new FakeAws({ ...healthyCloudFront(), ...cfAclHandlers() }), http));
        } finally {
            http.close();
        }
    };
    const NO_DIRECTORIES = 'User-agent: *\nDisallow: /api\n\nUser-agent: GPTBot\nDisallow: /api\n';

    for (const id of ['crawler-policy.robots.md-twins', 'crawler-policy.robots.md-twins-query']) {
        it(`${id} fails when no directory Disallow yields a twin`, async () => {
            const outcome = await run(id, NO_DIRECTORIES);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', /no directory Disallow/);
        });
    }

    it('crawler-policy.robots-vs-waf fails when robots.txt has no AI group', async () => {
        const outcome = await run('crawler-policy.robots-vs-waf', 'User-agent: *\nDisallow: /private/\n');
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /no AI crawler group/);
    });
});
