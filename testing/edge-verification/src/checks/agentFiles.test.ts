import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { runOne } from '../core/runner';
import { FakeAws, FakeHttp, type FakeResponse, fakeCtx, healthyCloudFront } from '../testing/fakes';
import { agentFileChecks } from './agentFiles';

const WWW = 'https://www.ag-grid.com';
const LINKS = ['/a/', '/b/', '/c/'].map((p) => `${WWW}${p}`);
const LLMS = `# AG Grid\n\n${LINKS.map((l, i) => `- [${i}](${l})`).join('\n')}\n\n## Documentation\n\n${LINKS.map((l, i) => `- [${i}](${l})`).join('\n')}\n`;

const check = (id: string) => agentFileChecks().find((c) => c.id === id)!;

/** llms.txt lists LINKS; the first is a 404 and the rest are fine. */
function site(req: { url: string }): FakeResponse {
    if (req.url === `${WWW}/llms.txt`) {
        return { status: 200, headers: { 'content-type': 'text/plain' }, body: LLMS };
    }
    if (req.url === `${WWW}/AGENTS.md`) {
        return { status: 200, headers: { 'content-type': 'text/markdown; charset=utf-8' }, body: '' };
    }
    return { status: req.url === LINKS[0] ? 404 : 200, headers: { 'content-type': 'text/html' } };
}

async function runWithBudget(id: string, maxRequests: number) {
    const http = new FakeHttp(site, { maxRequests });
    const ctx = await fakeCtx(new FakeAws(healthyCloudFront()), http, { maxRequests });
    try {
        return await runOne(check(id), ctx);
    } finally {
        http.close();
    }
}

describe('agent-file link checks under the request budget', () => {
    // llms.txt, AGENTS.md, then the 404: the budget runs out on the next link.
    for (const [id, budget] of [
        ['agent-files.grid.curated-links', 3],
        ['agent-files.grid.index-links', 2],
    ] as const) {
        it(`${id} keeps a failure found before the budget ran out`, async () => {
            const result = await runWithBudget(id, budget);
            assert.equal(result.status, 'fail', result.detail);
            assert.match(result.detail ?? '', /404 \S*\/a\//);
            assert.match(result.detail ?? '', /untested/);
        });

        it(`${id} is skipped when the budget runs out before any link was checked`, async () => {
            const result = await runWithBudget(id, budget - 1);
            assert.equal(result.status, 'skip', result.detail);
        });
    }

    it('curated links still pass with budget to spare', async () => {
        const http = new FakeHttp((req) => (LINKS.includes(req.url) ? { status: 200 } : site(req)));
        const result = await runOne(
            check('agent-files.grid.curated-links'),
            await fakeCtx(new FakeAws(healthyCloudFront()), http)
        );
        http.close();
        assert.equal(result.status, 'pass', result.detail);
    });
});
