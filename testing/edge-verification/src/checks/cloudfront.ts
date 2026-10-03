import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AwsError } from '../core/aws';
import { selectBehaviour } from '../core/cfPattern';
import { markdownKeyFunctionProblems } from '../core/live';
import type { Live } from '../core/live';
import { omit } from '../core/projection';
import { SECRET, SECRET_HEADER_PATTERN } from '../core/redact';
import { type CheckDef, Problems, info, pass, skip } from '../core/types';
import {
    DISTRIBUTION_UNPINNED,
    declaredBehaviour,
    declaredCachePolicy,
    declaredDistributionSettings,
    declaredOrigins,
    declaredRealtimeLogConfig,
} from '../expected/distribution';
import {
    ALL_VIEWER_CONFIG,
    BEHAVIOURS,
    type BehaviourExpectation,
    CACHE_POLICIES,
    DEFAULT_BEHAVIOUR,
    DISTRIBUTION,
    MARKDOWN_KEY_FUNCTION,
    ORIGIN_REQUEST_POLICIES,
    REALTIME_LOG_CONFIG,
} from '../expected/edge';
import { PENDING } from '../expected/lifecycle';

/** Cache-policy id -> name, for the policies the distribution uses. */
async function policyNames(live: Live): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    for (const p of CACHE_POLICIES) {
        if (p.id) {
            names.set(p.id, p.name);
        }
    }
    for (const p of await live.customCachePolicies()) {
        names.set(p.Id, p.CachePolicyConfig.Name);
    }
    return names;
}

const orpNames = new Map(Object.entries(ORIGIN_REQUEST_POLICIES).map(([name, id]) => [id as string, name]));

/**
 * A CloudFront object in a form two of them can be compared in: {Quantity, Items} lists as plain
 * lists (Quantity is their length), lists of names in name order, and secret header values
 * replaced by SECRET. Not for the real-time log fields, whose order is the contract.
 */
function cloudFrontProjection(node: unknown): any {
    if (Array.isArray(node)) {
        const items = node.map(cloudFrontProjection);
        return items.every((x) => typeof x === 'string') ? [...items].sort() : items;
    }
    if (!node || typeof node !== 'object') {
        return node;
    }
    const o = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
        if (k !== 'Quantity') {
            out[k] = cloudFrontProjection(v);
        }
    }
    if (typeof out.HeaderName === 'string' && 'HeaderValue' in out && SECRET_HEADER_PATTERN.test(out.HeaderName)) {
        out.HeaderValue = SECRET;
    }
    const keys = Object.keys(out);
    return 'Quantity' in o && keys.every((k) => k === 'Items') ? (out.Items ?? []) : out;
}

/**
 * Every field of a live behaviour against its declaration, path pattern included. The policies are
 * compared by name: a custom policy's id is not declared, and the policy checks pin its contents.
 */
function compareBehaviour(
    p: Problems,
    live: any,
    exp: Omit<BehaviourExpectation, 'pattern' | 'why'> & { pattern?: string },
    names: Map<string, string>
): void {
    const byName = {
        ...live,
        CachePolicyId: names.get(live.CachePolicyId) ?? live.CachePolicyId,
        OriginRequestPolicyId: orpNames.get(live.OriginRequestPolicyId) ?? live.OriginRequestPolicyId,
    };
    const asIs = (name: string): string => name;
    p.diff('behaviour', cloudFrontProjection(byName), cloudFrontProjection(declaredBehaviour(exp, asIs, asIs)));
}

export function cloudfrontChecks(): CheckDef[] {
    const checks: CheckDef[] = [
        {
            id: 'cloudfront.distribution.status',
            area: 'cloudfront',
            title: 'Distribution is Deployed (not mid-change)',
            async run({ live }) {
                const d = await live.distribution();
                return d.Status === 'Deployed'
                    ? pass(`last modified ${d.LastModifiedTime}`)
                    : info(`status ${d.Status}: a change is propagating, re-run when Deployed`);
            },
        },
        {
            id: 'cloudfront.distribution.settings',
            area: 'cloudfront',
            title: 'Every distribution setting: aliases, web ACL, certificate and TLS, HTTP version, IPv6, logging, price class, geo restriction',
            refs: ['SE-4', 'SE-26', 'SE-187'],
            async run({ live }) {
                const c = await live.distributionConfig();
                const p = new Problems();
                p.diff(
                    'distribution',
                    cloudFrontProjection(omit(c, DISTRIBUTION_UNPINNED)),
                    cloudFrontProjection(declaredDistributionSettings())
                );
                return p.outcome();
            },
        },
        {
            id: 'cloudfront.origin',
            area: 'cloudfront',
            title: 'Single ALB origin: HTTPS only (TLS 1.2), timeouts, origin-verify header, every other field as declared',
            refs: ['waf-finding.md §14'],
            async run({ live }) {
                const c = await live.distributionConfig();
                const p = new Problems();
                // Origin Shield either way: its own pending check reports which.
                p.oneOf('origins', cloudFrontProjection(c.Origins), [
                    cloudFrontProjection(declaredOrigins(false)),
                    cloudFrontProjection(declaredOrigins(true)),
                ]);
                return p.outcome();
            },
        },
        {
            id: 'cloudfront.origin.shield',
            area: 'cloudfront',
            title: `Origin Shield enabled in ${DISTRIBUTION.originShield.region}`,
            refs: ['waf-finding.md §8'],
            pending: DISTRIBUTION.originShield.pending,
            async run({ live }) {
                const c = await live.distributionConfig();
                const s = c.Origins?.Items?.[0]?.OriginShield ?? {};
                const p = new Problems();
                p.eq('enabled', s.Enabled, DISTRIBUTION.originShield.enabled);
                p.eq('region', s.OriginShieldRegion, DISTRIBUTION.originShield.region);
                return p.outcome();
            },
        },
        {
            id: 'cloudfront.behaviour.default',
            area: 'cloudfront',
            title: 'Default (*) behaviour: CachingDisabled, AllViewer, HTTPS redirect, real-time logs, every field as declared',
            refs: ['SE-117', 'waf-finding.md §8'],
            async run({ live }) {
                const c = await live.distributionConfig();
                const p = new Problems();
                compareBehaviour(p, c.DefaultCacheBehavior, DEFAULT_BEHAVIOUR, await policyNames(live));
                return p.outcome();
            },
        },
        {
            id: 'cloudfront.behaviours.order',
            area: 'cloudfront',
            title: 'Cache behaviours: exactly the declared set, in the declared order',
            refs: ['waf-finding.md §8'],
            async run({ live }) {
                const c = await live.distributionConfig();
                const livePatterns: string[] = (c.CacheBehaviors?.Items ?? []).map((b: any) => b.PathPattern);
                const pendingPatterns = new Set(BEHAVIOURS.filter((b) => b.pending).map((b) => b.pattern));
                const declared = BEHAVIOURS.filter((b) => !b.pending).map((b) => b.pattern);
                const p = new Problems();
                p.eq(
                    'order (pending behaviours excluded)',
                    livePatterns.filter((x) => !pendingPatterns.has(x)),
                    declared
                );
                const undeclared = livePatterns.filter((x) => !declared.includes(x) && !pendingPatterns.has(x));
                p.check(!undeclared.length, `undeclared behaviours: ${undeclared.join(', ')}`);
                return p.outcome(`${livePatterns.length} behaviours`);
            },
        },
        {
            id: 'cloudfront.behaviours.negotiated-pages-uncached',
            area: 'cloudfront',
            title: 'Markdown-negotiated pages never land on a caching behaviour without a markdown key split',
            refs: ['SE-80', '2026-09-18 /example/ incident'],
            async run({ live }) {
                await live.prepareGuard();
                // Judged on the live config only: the declared fallback is what this check compares against.
                live.requireLiveGuard();
                // Pages that answer both HTML and markdown on the same URL.
                const negotiated = [
                    '/',
                    '/example/',
                    '/example/index.html',
                    '/react-data-grid/getting-started/',
                    '/react-data-grid/getting-started/index.html',
                    '/charts/',
                    '/charts/react/quick-start/',
                    '/studio/',
                    '/studio/example/',
                    '/studio/example/index.html',
                    '/studio/example-embedded-analytics/',
                    '/studio/example-widget-library/',
                ];
                const p = new Problems();
                for (const path of negotiated) {
                    const { behaviour, caches } = live.behaviourFor(path);
                    const split = live.markdownSplit(path);
                    if (caches && !split.split) {
                        p.add(`${path} is served by caching behaviour ${behaviour.pattern} (${split.reason})`);
                    }
                }
                return p.outcome(`${negotiated.length} negotiated paths resolve to non-caching behaviours`);
            },
        },
        {
            id: 'cloudfront.behaviours.shadowed',
            area: 'cloudfront',
            title: 'Behaviours that can never be selected (an earlier pattern covers them)',
            async run({ live }) {
                const c = await live.distributionConfig();
                const patterns: string[] = (c.CacheBehaviors?.Items ?? []).map((b: any) => b.PathPattern);
                const shadowed = patterns.filter((pat, i) => {
                    const sample = pat.replace(/\*/g, 'x').replace(/\?/g, 'x');
                    const path = sample.startsWith('/') ? sample : '/' + sample;
                    const first = selectBehaviour(patterns, path);
                    return first >= 0 && first < i;
                });
                return info(shadowed.length ? `shadowed: ${shadowed.join(', ')}` : 'none');
            },
        },
        ...CACHE_POLICIES.map(
            (exp): CheckDef => ({
                id: `cloudfront.cache-policy.${exp.name}`,
                area: 'cloudfront',
                title: `Cache policy ${exp.name}: TTL ${exp.minTtl}/${exp.defaultTtl}/${exp.maxTtl}, key headers [${exp.keyHeaders.join(', ')}]`,
                refs: exp.pending ? ['waf-finding.md §4'] : ['waf-finding.md §8'],
                pending: exp.pending,
                async run({ live }) {
                    let raw: any;
                    if (exp.id) {
                        raw = await live.cachePolicy(exp.id);
                    } else {
                        const found = (await live.customCachePolicies()).find(
                            (x) => x.CachePolicyConfig.Name === exp.name
                        );
                        if (!found) {
                            return { status: 'fail', detail: `no cache policy named ${exp.name}` };
                        }
                        raw = await live.cachePolicy(found.Id);
                    }
                    const p = new Problems();
                    // Header names are case-insensitive; the Comment is prose.
                    const config = structuredClone(raw.CachePolicyConfig);
                    const headers = config.ParametersInCacheKeyAndForwardedToOrigin?.HeadersConfig?.Headers;
                    if (headers?.Items) {
                        headers.Items = headers.Items.map((h: string) => h.toLowerCase());
                    }
                    p.diff(
                        'policy',
                        cloudFrontProjection(omit(config, ['Comment'])),
                        cloudFrontProjection(declaredCachePolicy(exp))
                    );
                    return p.outcome();
                },
            })
        ),
        {
            id: 'cloudfront.origin-request-policy.Managed-AllViewer',
            area: 'cloudfront',
            title: 'Origin request policy Managed-AllViewer forwards every viewer header, cookie and query string',
            async run({ live }) {
                const o = await live.originRequestPolicy(ORIGIN_REQUEST_POLICIES['Managed-AllViewer']);
                const p = new Problems();
                p.diff(
                    'policy',
                    cloudFrontProjection(omit(o.OriginRequestPolicyConfig, ['Comment'])),
                    cloudFrontProjection(ALL_VIEWER_CONFIG)
                );
                return p.outcome();
            },
        },
        {
            id: 'cloudfront.realtime-log-config',
            area: 'cloudfront',
            title: 'Real-time logs: the 23 fields LogLens expects, in order, 100% sampled, to the LogLens stream',
            refs: ['SE-116', 'SE-117'],
            async run({ live }) {
                const r = await live.realtimeLogConfig(REALTIME_LOG_CONFIG.name);
                const p = new Problems();
                // Not through cloudFrontProjection: the field order is the contract.
                p.diff('config', omit(r, ['ARN']), declaredRealtimeLogConfig());
                return p.outcome(`${r.Fields.length} fields`);
            },
        },
        {
            id: `cloudfront.function.${MARKDOWN_KEY_FUNCTION}`,
            area: 'cloudfront',
            title: `Function ${MARKDOWN_KEY_FUNCTION} is published (LIVE) and keys on Accept: text/markdown`,
            refs: ['waf-finding.md §4'],
            pending: PENDING.archiveCache,
            async run({ aws }) {
                const p = new Problems();
                const denied: string[] = [];
                // Each read needs its own IAM action; whichever are denied leave their part unverified.
                const attempt = async (step: () => Promise<void>): Promise<void> => {
                    try {
                        await step();
                    } catch (e) {
                        if (e instanceof AwsError && e.deniedAction) {
                            denied.push(e.deniedAction);
                        } else {
                            throw e;
                        }
                    }
                };
                await attempt(async () => {
                    const r = await aws.call('cloudfront', 'list-functions', ['--stage', 'LIVE']);
                    const names = (r.FunctionList?.Items ?? []).map((f: any) => f.Name);
                    p.check(names.includes(MARKDOWN_KEY_FUNCTION), `no LIVE function named ${MARKDOWN_KEY_FUNCTION}`);
                });
                await attempt(async () => {
                    const d = await aws.call('cloudfront', 'describe-function', [
                        '--name',
                        MARKDOWN_KEY_FUNCTION,
                        '--stage',
                        'LIVE',
                    ]);
                    p.eq('runtime', d.FunctionSummary?.FunctionConfig?.Runtime, 'cloudfront-js-2.0');
                    p.eq('stage', d.FunctionSummary?.FunctionMetadata?.Stage, 'LIVE');
                });
                await attempt(async () => {
                    // get-function writes the code to a local file (its positional outfile argument).
                    const out = join(mkdtempSync(join(tmpdir(), 'edge-verification-')), `${MARKDOWN_KEY_FUNCTION}.js`);
                    await aws.call('cloudfront', 'get-function', [
                        '--name',
                        MARKDOWN_KEY_FUNCTION,
                        '--stage',
                        'LIVE',
                        out,
                    ]);
                    // The same static check that gates the markdown guard's cache-key split.
                    for (const problem of markdownKeyFunctionProblems(readFileSync(out, 'utf8'))) {
                        p.add(`code ${problem}`);
                    }
                });
                if (p.count) {
                    return p.outcome();
                }
                return denied.length ? skip(`unverifiable - needs IAM action ${denied.join(', ')}`) : pass();
            },
        },
    ];

    // One check per declared behaviour, so a drifted behaviour is named in the report.
    for (const exp of BEHAVIOURS) {
        checks.push({
            id: `cloudfront.behaviour.${exp.pattern}`,
            area: 'cloudfront',
            title: `Behaviour ${exp.pattern}: ${exp.cachePolicy}${exp.viewerRequestFunctions.length ? ` + ${exp.viewerRequestFunctions.join(', ')}` : ''}`,
            refs: [exp.why],
            pending: exp.pending,
            async run({ live }) {
                const c = await live.distributionConfig();
                const items: any[] = c.CacheBehaviors?.Items ?? [];
                const i = items.findIndex((b) => b.PathPattern === exp.pattern);
                if (i < 0) {
                    return { status: 'fail', detail: 'behaviour not present' };
                }
                const p = new Problems();
                compareBehaviour(p, items[i], exp, await policyNames(live));
                if (exp.pending) {
                    // The script appends after every existing behaviour, so it must follow */_astro/*.
                    const astro = items.findIndex((b) => b.PathPattern === '*/_astro/*');
                    p.check(astro < i, `must come after */_astro/* (index ${astro}), found at ${i}`);
                }
                return p.outcome();
            },
        });
    }
    return checks;
}
