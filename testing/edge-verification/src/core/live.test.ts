import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { ARCHIVE_POISON_PROBE } from '../expected/caching';
import {
    DENIED,
    FakeAws,
    type Handler,
    MARKDOWN_KEY_FUNCTION_CODE,
    NO_CREDENTIALS,
    functionCode,
    healthyCloudFront,
    options,
} from '../testing/fakes';
import { Http, MARKDOWN_ACCEPT, RefusedProbe } from './http';
import { Live, markdownKeyFunctionProblems } from './live';

const WWW = 'https://www.ag-grid.com';
const UNCACHED = ['/', '/example/', '/react-data-grid/getting-started/', '/studio/example/'];

async function guardWith(handlers: ConstructorParameters<typeof FakeAws>[0]): Promise<{ live: Live; aws: FakeAws }> {
    const aws = new FakeAws(handlers);
    const live = new Live(aws);
    await live.prepareGuard();
    return { live, aws };
}

const allowed = (live: Live, path: string): boolean => live.markdownGuard(new URL(`${WWW}${path}`)).allowed;

describe('markdown guard', () => {
    it('allows markdown on a non-caching behaviour and on a verified archive split, from the live config', async () => {
        const { live } = await guardWith(healthyCloudFront());
        for (const path of UNCACHED) {
            assert.ok(allowed(live, path), path);
        }
        assert.ok(allowed(live, ARCHIVE_POISON_PROBE));
        assert.ok(live.markdownKeySplit(ARCHIVE_POISON_PROBE));
    });

    for (const [why, failure] of [
        ['credentials are unusable', NO_CREDENTIALS],
        ['the config read is denied', DENIED('cloudfront:GetDistributionConfig')],
    ] as const) {
        it(`refuses every markdown probe when ${why}, even on paths declared uncached`, async () => {
            const { live } = await guardWith({ ...healthyCloudFront(), 'cloudfront get-distribution-config': failure });
            for (const path of [...UNCACHED, ARCHIVE_POISON_PROBE]) {
                assert.equal(allowed(live, path), false, path);
            }
            assert.match(live.guardSource, /^declared/);
        });
    }

    const distribution =
        (status: string): Handler =>
        () => ({ Distribution: { Id: 'fixture', Status: status } });

    it('reads the deployment status before anything else, and allows probes only once Deployed', async () => {
        const { live, aws } = await guardWith(healthyCloudFront());
        assert.equal(aws.calls[0], 'cloudfront get-distribution');
        assert.match(live.guardSource, /Deployed/);
        assert.ok(allowed(live, '/example/'));
    });

    for (const [why, handler] of [
        ['a change is still propagating (InProgress)', distribution('InProgress')],
        ['the status is not reported', distribution('')],
        ['the status read is denied', DENIED('cloudfront:GetDistribution')],
        ['credentials are unusable for the status read', NO_CREDENTIALS],
    ] as const) {
        it(`refuses every markdown probe when ${why}, even with a readable live config`, async () => {
            const { live } = await guardWith({ ...healthyCloudFront(), 'cloudfront get-distribution': handler });
            for (const path of [...UNCACHED, ARCHIVE_POISON_PROBE]) {
                assert.equal(allowed(live, path), false, path);
                assert.match(live.markdownGuard(new URL(`${WWW}${path}`)).reason, /not verified as Deployed/);
            }
            // The live config itself still loaded, so structural checks can judge it.
            assert.match(live.guardSource, /^live/);
            assert.doesNotThrow(() => live.requireLiveGuard());
        });
    }

    it('refuses the probe before any request is sent', async () => {
        const { live } = await guardWith({ 'cloudfront get-distribution-config': NO_CREDENTIALS });
        const http = new Http(options({ maxRequests: 10 }));
        http.setMarkdownGuard(live.markdownGuard);
        try {
            await assert.rejects(
                http.request({ url: `${WWW}/example/`, headers: { accept: MARKDOWN_ACCEPT } }),
                RefusedProbe
            );
            assert.equal(http.requestCount, 0);
        } finally {
            http.close();
        }
    });

    it('refuses cached probes when the LIVE function code cannot be read', async () => {
        const { live, aws } = await guardWith({
            ...healthyCloudFront(),
            'cloudfront get-function': DENIED('cloudfront:GetFunction'),
        });
        assert.equal(allowed(live, ARCHIVE_POISON_PROBE), false);
        assert.match(live.markdownGuard(new URL(`${WWW}${ARCHIVE_POISON_PROBE}`)).reason, /cloudfront:GetFunction/);
        assert.ok(aws.denied.has('cloudfront:GetFunction'));
        // A behaviour that does not cache needs no function, so it is still probed.
        assert.ok(allowed(live, '/example/'));
    });

    const MUTATIONS: Array<[string, string]> = [
        ['tests another media type', MARKDOWN_KEY_FUNCTION_CODE.replace("'text/markdown'", "'text/html'")],
        [
            'sets a constant',
            MARKDOWN_KEY_FUNCTION_CODE.replace("accept.indexOf('text/markdown') !== -1 ? '1' : '0'", "'1'"),
        ],
        ['sets the same value either way', MARKDOWN_KEY_FUNCTION_CODE.replace("'1' : '0'", "'0' : '0'")],
        ['tests another header', MARKDOWN_KEY_FUNCTION_CODE.replace(/headers\.accept/g, 'headers.host')],
        [
            'no longer sets the key header',
            MARKDOWN_KEY_FUNCTION_CODE.replace("headers['x-ag-accept-markdown']", "headers['x-other']"),
        ],
        [
            'overwrites the key header afterwards',
            MARKDOWN_KEY_FUNCTION_CODE.replace(
                '    return event.request;',
                "    headers['x-ag-accept-markdown'] = { value: '0' };\n    return event.request;"
            ),
        ],
    ];

    for (const [what, code] of MUTATIONS) {
        it(`refuses cached probes when the LIVE function ${what}`, async () => {
            assert.notEqual(code, MARKDOWN_KEY_FUNCTION_CODE, 'mutation applied');
            assert.notDeepEqual(markdownKeyFunctionProblems(code), []);
            const { live } = await guardWith({ ...healthyCloudFront(), 'cloudfront get-function': functionCode(code) });
            assert.equal(allowed(live, ARCHIVE_POISON_PROBE), false);
            assert.equal(live.markdownKeySplit(ARCHIVE_POISON_PROBE), false);
        });
    }

    it('accepts the published function', () => {
        assert.deepEqual(markdownKeyFunctionProblems(MARKDOWN_KEY_FUNCTION_CODE), []);
    });
});
