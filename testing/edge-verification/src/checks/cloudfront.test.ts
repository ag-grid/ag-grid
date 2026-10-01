import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { CheckDef, Outcome } from '../core/types';
import { declaredRealtimeLogConfig } from '../expected/distribution';
import { ALL_VIEWER_CONFIG, BEHAVIOURS, CACHE_POLICIES } from '../expected/edge';
import {
    FIXTURE_ORIGIN_SECRET,
    FakeAws,
    cachePolicy,
    distributionConfig,
    healthyCloudFront,
    offlineCtx,
} from '../testing/fakes';
import { cloudfrontChecks } from './cloudfront';

/**
 * Each mutation edits one field of the fixture distribution (which matches live) and must fail
 * with a detail naming that field.
 */

const check = (id: string): CheckDef => {
    const found = cloudfrontChecks().find((c) => c.id === id);
    assert.ok(found, `no check ${id}`);
    return found;
};

interface Edits {
    config?: (c: any) => void;
    policy?: (p: any) => void;
    orp?: (c: any) => void;
    realtime?: (r: any) => void;
}

function aws(edits: Edits = {}): FakeAws {
    const config = (): any => {
        const r = distributionConfig();
        edits.config?.(r.DistributionConfig);
        return r;
    };
    return new FakeAws({
        ...healthyCloudFront(),
        'cloudfront get-distribution-config': config,
        'cloudfront get-distribution': () => ({ Distribution: { Status: 'Deployed', ...config() } }),
        'cloudfront get-cache-policy': (args) => {
            const r = cachePolicy(args);
            edits.policy?.(r.CachePolicy.CachePolicyConfig);
            return r;
        },
        'cloudfront get-origin-request-policy': () => {
            const c = { Comment: 'fixture', ...structuredClone(ALL_VIEWER_CONFIG) };
            edits.orp?.(c);
            return { OriginRequestPolicy: { OriginRequestPolicyConfig: c } };
        },
        'cloudfront get-realtime-log-config': () => {
            const r = { ARN: 'arn:fixture', ...structuredClone(declaredRealtimeLogConfig()) };
            edits.realtime?.(r);
            return { RealtimeLogConfig: r };
        },
    });
}

const run = (id: string, edits?: Edits): Promise<Outcome> => check(id).run(offlineCtx(aws(edits)));

async function assertFails(outcome: Outcome, pattern: RegExp): Promise<void> {
    assert.equal(outcome.status, 'fail', outcome.detail);
    assert.match(outcome.detail ?? '', pattern);
}

const behaviour = (c: any, pattern: string): any => c.CacheBehaviors.Items.find((b: any) => b.PathPattern === pattern);

describe('the fixture distribution passes every structural CloudFront check', () => {
    const structural = cloudfrontChecks().filter(
        (c) => !['cloudfront.origin.shield', `cloudfront.function.archive-markdown-cache-key`].includes(c.id)
    );
    for (const c of structural) {
        it(`${c.id} passes`, async () => {
            const outcome = await c.run(offlineCtx(aws()));
            assert.ok(['pass', 'info'].includes(outcome.status), `${outcome.status}: ${outcome.detail}`);
        });
    }

    it('cloudfront.origin passes with Origin Shield on as its pending change declares', async () => {
        const outcome = await run('cloudfront.origin', {
            config: (c) => (c.Origins.Items[0].OriginShield = { Enabled: true, OriginShieldRegion: 'us-west-1' }),
        });
        assert.equal(outcome.status, 'pass', outcome.detail);
    });
});

describe('every cache behaviour declares and compares its viewer protocol policy', () => {
    for (const b of BEHAVIOURS) {
        it(`cloudfront.behaviour.${b.pattern} fails when it allows plain HTTP`, async () => {
            const outcome = await run(`cloudfront.behaviour.${b.pattern}`, {
                config: (c) => (behaviour(c, b.pattern).ViewerProtocolPolicy = 'allow-all'),
            });
            await assertFails(outcome, /behaviour ViewerProtocolPolicy: got "allow-all", expected "redirect-to-https"/);
        });
    }

    it('cloudfront.behaviour.default fails when it allows plain HTTP', async () => {
        const outcome = await run('cloudfront.behaviour.default', {
            config: (c) => (c.DefaultCacheBehavior.ViewerProtocolPolicy = 'allow-all'),
        });
        await assertFails(outcome, /behaviour ViewerProtocolPolicy: got "allow-all", expected "redirect-to-https"/);
    });
});

describe('cache behaviours: every other field', () => {
    const p = '/images/*';
    const MUTATIONS: Array<[string, (b: any) => void, RegExp]> = [
        [
            'it caches OPTIONS too',
            (b) => {
                b.AllowedMethods.CachedMethods = { Quantity: 3, Items: ['GET', 'HEAD', 'OPTIONS'] };
            },
            /behaviour AllowedMethods\.CachedMethods: extra \["OPTIONS"\]/,
        ],
        [
            'it allows only GET and HEAD',
            (b) => (b.AllowedMethods = { ...b.AllowedMethods, Quantity: 2, Items: ['GET', 'HEAD'] }),
            /behaviour AllowedMethods\.Items: extra \[\], missing \["DELETE"/,
        ],
        ['it stops compressing', (b) => (b.Compress = false), /behaviour Compress: got false, expected true/],
        [
            'it gains a viewer-response function',
            (b) =>
                (b.FunctionAssociations = {
                    Quantity: 1,
                    Items: [{ FunctionARN: 'arn:aws:cloudfront::1:function/x', EventType: 'viewer-response' }],
                }),
            /behaviour FunctionAssociations\[0\]: got .*viewer-response.*, expected absent/,
        ],
        [
            'it gains a Lambda@Edge function',
            (b) =>
                (b.LambdaFunctionAssociations = {
                    Quantity: 1,
                    Items: [{ LambdaFunctionARN: 'arn:x', EventType: 'origin-request', IncludeBody: false }],
                }),
            /behaviour LambdaFunctionAssociations\[0\]: got .*origin-request.*, expected absent/,
        ],
        [
            'it targets another origin',
            (b) => (b.TargetOriginId = 'other-origin'),
            /behaviour TargetOriginId: got "other-origin"/,
        ],
        [
            'it uses field-level encryption',
            (b) => (b.FieldLevelEncryptionId = 'FLE1'),
            /behaviour FieldLevelEncryptionId: got "FLE1", expected ""/,
        ],
        [
            'it requires signed URLs',
            (b) => (b.TrustedKeyGroups = { Enabled: true, Quantity: 1, Items: ['kg'] }),
            /behaviour TrustedKeyGroups\.Enabled: got true, expected false/,
        ],
        [
            'it stops sending real-time logs',
            (b) => delete b.RealtimeLogConfigArn,
            /behaviour RealtimeLogConfigArn: got absent/,
        ],
        [
            'it forwards through another origin request policy',
            (b) => (b.OriginRequestPolicyId = 'b689b0a8-53d0-40ab-baf2-68738e2966ac'),
            /behaviour OriginRequestPolicyId: got "b689b0a8-53d0-40ab-baf2-68738e2966ac", expected "Managed-AllViewer"/,
        ],
        [
            'it attaches a response headers policy',
            (b) => (b.ResponseHeadersPolicyId = '67f7725c-6f97-4210-82d7-5512b31e9d03'),
            /behaviour ResponseHeadersPolicyId: got .*, expected absent/,
        ],
        [
            'it switches to the legacy cache settings',
            (b) => (b.ForwardedValues = { QueryString: true }),
            /behaviour ForwardedValues: got .*, expected absent/,
        ],
        ['it enables gRPC', (b) => (b.GrpcConfig = { Enabled: true }), /behaviour GrpcConfig\.Enabled: got true/],
    ];
    for (const [what, edit, pattern] of MUTATIONS) {
        it(`cloudfront.behaviour.${p} fails when ${what}`, async () => {
            await assertFails(
                await run(`cloudfront.behaviour.${p}`, { config: (c) => edit(behaviour(c, p)) }),
                pattern
            );
        });
    }

    it('the pending archive behaviour fails without its function', async () => {
        const outcome = await run('cloudfront.behaviour./archive/*', {
            config: (c) => (behaviour(c, '/archive/*').FunctionAssociations = { Quantity: 0 }),
        });
        await assertFails(outcome, /behaviour FunctionAssociations\[0\]: got absent/);
    });
});

describe('distribution settings, the origin, and the policies', () => {
    const MUTATIONS: Array<[string, string, Edits, RegExp]> = [
        [
            'cloudfront.distribution.settings',
            'it gains an alias',
            { config: (c) => c.Aliases.Items.push('evil.ag-grid.com') },
            /distribution Aliases: extra \["evil\.ag-grid\.com"\]/,
        ],
        [
            'cloudfront.distribution.settings',
            'it allows TLS 1.0',
            { config: (c) => (c.ViewerCertificate.MinimumProtocolVersion = 'TLSv1') },
            /distribution ViewerCertificate\.MinimumProtocolVersion: got "TLSv1", expected "TLSv1\.2_2021"/,
        ],
        [
            'cloudfront.distribution.settings',
            'it serves another certificate',
            { config: (c) => (c.ViewerCertificate.ACMCertificateArn = 'arn:aws:acm:us-east-1:1:certificate/other') },
            /distribution ViewerCertificate\.ACMCertificateArn: got ".*other"/,
        ],
        [
            'cloudfront.distribution.settings',
            'it is protected by another web ACL',
            {
                config: (c) =>
                    (c.WebACLId = 'arn:aws:wafv2:us-east-1:116606402151:global/webacl/cloudfront-web-acl/other'),
            },
            /distribution WebACLId: got ".*\/other"/,
        ],
        [
            'cloudfront.distribution.settings',
            'it drops to fewer edge locations',
            { config: (c) => (c.PriceClass = 'PriceClass_100') },
            /distribution PriceClass: got "PriceClass_100", expected "PriceClass_All"/,
        ],
        [
            'cloudfront.distribution.settings',
            'it geo-blocks a country',
            {
                config: (c) =>
                    (c.Restrictions.GeoRestriction = { RestrictionType: 'blacklist', Quantity: 1, Items: ['GB'] }),
            },
            /distribution Restrictions\.GeoRestriction\.RestrictionType: got "blacklist"/,
        ],
        [
            'cloudfront.distribution.settings',
            'it rewrites 404s',
            {
                config: (c) =>
                    (c.CustomErrorResponses = {
                        Quantity: 1,
                        Items: [{ ErrorCode: 404, ResponsePagePath: '/', ResponseCode: '200' }],
                    }),
            },
            /distribution CustomErrorResponses\[0\]: got .*404.*, expected absent/,
        ],
        [
            'cloudfront.distribution.settings',
            'it turns on standard logging',
            { config: (c) => (c.Logging = { Enabled: true, IncludeCookies: true, Bucket: 'b', Prefix: '' }) },
            /distribution Logging\.Enabled: got true, expected false/,
        ],
        [
            'cloudfront.distribution.settings',
            'it moves to HTTP/3',
            { config: (c) => (c.HttpVersion = 'http2and3') },
            /distribution HttpVersion: got "http2and3", expected "http2"/,
        ],
        [
            'cloudfront.distribution.settings',
            'it turns off IPv6',
            { config: (c) => (c.IsIPV6Enabled = false) },
            /distribution IsIPV6Enabled: got false, expected true/,
        ],
        [
            'cloudfront.distribution.settings',
            'it gains a continuous-deployment policy',
            { config: (c) => (c.ContinuousDeploymentPolicyId = 'cd-1') },
            /distribution ContinuousDeploymentPolicyId: got "cd-1", expected ""/,
        ],
        [
            'cloudfront.origin',
            'it accepts TLS 1.1 to the origin',
            {
                config: (c) =>
                    (c.Origins.Items[0].CustomOriginConfig.OriginSslProtocols = {
                        Quantity: 2,
                        Items: ['TLSv1.1', 'TLSv1.2'],
                    }),
            },
            /origins\[0\]\.CustomOriginConfig\.OriginSslProtocols: extra \["TLSv1\.1"\]/,
        ],
        [
            'cloudfront.origin',
            'it connects on another HTTPS port',
            { config: (c) => (c.Origins.Items[0].CustomOriginConfig.HTTPSPort = 8443) },
            /origins\[0\]\.CustomOriginConfig\.HTTPSPort: got 8443, expected 443/,
        ],
        [
            'cloudfront.origin',
            'its keep-alive changes',
            { config: (c) => (c.Origins.Items[0].CustomOriginConfig.OriginKeepaliveTimeout = 60) },
            /origins\[0\]\.CustomOriginConfig\.OriginKeepaliveTimeout: got 60, expected 5/,
        ],
        [
            'cloudfront.origin',
            'its connection timeout changes',
            { config: (c) => (c.Origins.Items[0].ConnectionTimeout = 2) },
            /origins\[0\]\.ConnectionTimeout: got 2, expected 10/,
        ],
        [
            'cloudfront.origin',
            'it gains an origin path',
            { config: (c) => (c.Origins.Items[0].OriginPath = '/staging') },
            /origins\[0\]\.OriginPath: got "\/staging", expected ""/,
        ],
        [
            'cloudfront.origin',
            'it sends a second custom header',
            {
                config: (c) =>
                    c.Origins.Items[0].CustomHeaders.Items.push({ HeaderName: 'x-extra', HeaderValue: 'plain' }),
            },
            /origins\[0\]\.CustomHeaders\[1\]: got \{"HeaderName":"x-extra","HeaderValue":"plain"\}, expected absent/,
        ],
        [
            'cloudfront.origin',
            'a second origin appears',
            {
                config: (c) =>
                    c.Origins.Items.push({
                        ...structuredClone(c.Origins.Items[0]),
                        Id: 'second',
                        DomainName: 'x.example',
                    }),
            },
            /origins\[1\]: got .*second.*, expected absent/,
        ],
        [
            'cloudfront.origin',
            'Origin Shield runs in another region',
            {
                config: (c) => (c.Origins.Items[0].OriginShield = { Enabled: true, OriginShieldRegion: 'us-east-1' }),
            },
            /origins\[0\]\.OriginShield\.Enabled: got true, expected false/,
        ],
        [
            'cloudfront.cache-policy.CachingOptimizedWithHost',
            'it keys on every header but one',
            {
                policy: (p) => (p.ParametersInCacheKeyAndForwardedToOrigin.HeadersConfig.HeaderBehavior = 'allExcept'),
            },
            /policy ParametersInCacheKeyAndForwardedToOrigin\.HeadersConfig\.HeaderBehavior: got "allExcept", expected "whitelist"/,
        ],
        [
            'cloudfront.cache-policy.CachingOptimizedWithHost',
            'it keys on a cookie',
            {
                policy: (p) =>
                    (p.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig = {
                        CookieBehavior: 'whitelist',
                        Cookies: { Quantity: 1, Items: ['session'] },
                    }),
            },
            /policy ParametersInCacheKeyAndForwardedToOrigin\.CookiesConfig\.Cookies: got \["session"\], expected absent/,
        ],
        [
            'cloudfront.cache-policy.Managed-CachingDisabled',
            'it starts caching',
            { policy: (p) => (p.MaxTTL = 60) },
            /policy MaxTTL: got 60, expected 0/,
        ],
        [
            'cloudfront.origin-request-policy.Managed-AllViewer',
            'it stops forwarding cookies',
            { orp: (c) => (c.CookiesConfig = { CookieBehavior: 'none' }) },
            /policy CookiesConfig\.CookieBehavior: got "none", expected "all"/,
        ],
        [
            'cloudfront.realtime-log-config',
            'it writes to another stream',
            {
                realtime: (r) =>
                    (r.EndPoints[0].KinesisStreamConfig.StreamARN = 'arn:aws:kinesis:us-west-1:1:stream/other'),
            },
            /config EndPoints\[0\]\.KinesisStreamConfig\.StreamARN: got ".*other"/,
        ],
        [
            'cloudfront.realtime-log-config',
            'two fields swap places',
            {
                realtime: (r) => {
                    [r.Fields[0], r.Fields[1]] = [r.Fields[1], r.Fields[0]];
                },
            },
            /config Fields\[0\]: got "c-ip", expected "timestamp"/,
        ],
        [
            'cloudfront.realtime-log-config',
            'it samples a tenth',
            { realtime: (r) => (r.SamplingRate = 10) },
            /config SamplingRate: got 10, expected 100/,
        ],
    ];
    for (const [id, what, edits, pattern] of MUTATIONS) {
        it(`${id} fails when ${what}`, async () => {
            await assertFails(await run(id, edits), pattern);
        });
    }

    it('cache policies pass whatever their comment says, and compare header names case-insensitively', async () => {
        for (const p of CACHE_POLICIES) {
            const outcome = await run(`cloudfront.cache-policy.${p.name}`, { policy: (c) => (c.Comment = 'changed') });
            assert.equal(outcome.status, 'pass', `${p.name}: ${outcome.detail}`);
        }
    });

    it('the origin check never prints the origin-verify value', async () => {
        const outcome = await run('cloudfront.origin', {
            config: (c) => (c.Origins.Items[0].CustomHeaders.Items[0].HeaderName = 'x-ag-origin-verify-2'),
        });
        await assertFails(outcome, /origins\[0\]\.CustomHeaders\[0\]\.HeaderName: got "x-ag-origin-verify-2"/);
        assert.ok(!(outcome.detail ?? '').includes(FIXTURE_ORIGIN_SECRET));
    });
});
