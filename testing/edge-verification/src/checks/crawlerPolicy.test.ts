import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { runOne } from '../core/runner';
import { AI_GROUP } from '../expected/robots';
import { FakeAws, FakeHttp, fakeCtx, healthyCloudFront } from '../testing/fakes';
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
