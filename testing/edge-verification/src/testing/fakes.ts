import { writeFileSync } from 'node:fs';

import { Aws, awsErrorFromStderr, isReadOnlyOperation } from '../core/aws';
import { Http, type Response } from '../core/http';
import { Live } from '../core/live';
import type { Ctx, Options } from '../core/types';
import {
    ACCOUNT_ID,
    BEHAVIOURS,
    CACHE_POLICIES,
    CF_ACL,
    DEFAULT_BEHAVIOUR,
    DISTRIBUTION,
    DISTRIBUTION_ID,
    MARKDOWN_KEY_FUNCTION,
} from '../expected/edge';

/**
 * Offline stand-ins for the AWS CLI, for the package's own tests (`*.test.ts`, run with
 * `node --test`, never against AWS). A FakeAws answers each `service operation` from a handler
 * table; a missing handler is a test bug and throws a plain Error.
 */
export type Handler = (args: string[]) => unknown;

export class FakeAws extends Aws {
    readonly calls: string[] = [];

    constructor(private readonly handlers: Record<string, Handler>) {
        super();
    }

    override call<T = any>(service: string, operation: string, args: string[] = []): Promise<T> {
        const key = `${service} ${operation}`;
        if (!isReadOnlyOperation(service, operation)) {
            // The same guard as the real client, before any handler runs.
            throw new Error(`Refusing non-read-only AWS operation: ${service} ${operation}`);
        }
        this.calls.push(key);
        const handler = this.handlers[key];
        if (!handler) {
            return Promise.reject(new Error(`unmocked AWS call ${key}`));
        }
        try {
            return Promise.resolve(handler(args) as T);
        } catch (e) {
            const error = e as { deniedAction?: string };
            if (error.deniedAction) {
                this.denied.add(error.deniedAction);
            }
            return Promise.reject(e);
        }
    }
}

/** A handler that fails the way the AWS CLI does, from its real stderr wording. */
export const awsFails =
    (stderr: string): Handler =>
    () => {
        throw awsErrorFromStderr('svc', 'op', stderr);
    };

export const DENIED = (action: string): Handler =>
    awsFails(
        `An error occurred (AccessDenied) when calling the Op operation: User: arn:aws:sts::1:assumed-role/x is not authorized to perform: ${action}`
    );
export const NO_CREDENTIALS = awsFails(
    'Unable to locate credentials. You can configure credentials by running "aws configure".'
);
export const NO_SUCH_DISTRIBUTION = awsFails(
    'An error occurred (NoSuchDistribution) when calling the GetDistributionConfig operation: The specified distribution does not exist.'
);
export const WAF_NONEXISTENT = awsFails(
    'An error occurred (WAFNonexistentItemException) when calling the GetWebACL operation: AWS WAF couldn’t perform the operation because your resource doesn’t exist.'
);

/** The function add-archive-cache-behaviors.sh publishes. */
export const MARKDOWN_KEY_FUNCTION_CODE = `// Splits the cache key on the test Apache uses to serve the markdown twin
function handler(event) {
    var headers = event.request.headers;
    var accept = headers.accept ? headers.accept.value : '';
    headers['x-ag-accept-markdown'] = { value: accept.indexOf('text/markdown') !== -1 ? '1' : '0' };
    return event.request;
}
`;

const policyId = (name: string): string => CACHE_POLICIES.find((p) => p.name === name)?.id ?? `fixture-${name}`;

/** The declared distribution as get-distribution-config would return it, archive behaviours included. */
export function distributionConfig(): any {
    const fn = {
        Quantity: 1,
        Items: [
            {
                EventType: 'viewer-request',
                FunctionARN: `arn:aws:cloudfront::${ACCOUNT_ID}:function/${MARKDOWN_KEY_FUNCTION}`,
            },
        ],
    };
    return {
        DistributionConfig: {
            Aliases: { Items: DISTRIBUTION.aliases },
            DefaultCacheBehavior: { CachePolicyId: policyId(DEFAULT_BEHAVIOUR.cachePolicy) },
            CacheBehaviors: {
                Items: BEHAVIOURS.map((b) => ({
                    PathPattern: b.pattern,
                    CachePolicyId: policyId(b.cachePolicy),
                    FunctionAssociations: b.viewerRequestFunctions.length ? fn : { Quantity: 0, Items: [] },
                })),
            },
        },
    };
}

export function cachePolicy(args: string[]): any {
    const id = args[args.indexOf('--id') + 1];
    const p = CACHE_POLICIES.find((x) => policyId(x.name) === id);
    if (!p) {
        throw awsErrorFromStderr(
            'cloudfront',
            'get-cache-policy',
            'An error occurred (NoSuchCachePolicy) when calling'
        );
    }
    return {
        CachePolicy: {
            Id: id,
            CachePolicyConfig: {
                Name: p.name,
                MinTTL: p.minTtl,
                DefaultTTL: p.defaultTtl,
                MaxTTL: p.maxTtl,
                ParametersInCacheKeyAndForwardedToOrigin: { HeadersConfig: { Headers: { Items: p.keyHeaders } } },
            },
        },
    };
}

/** get-function writes the code to its positional outfile argument (the last one). */
export const functionCode =
    (code: string): Handler =>
    (args) => {
        writeFileSync(args[args.length - 1], code);
        return {};
    };

/** Handlers for a healthy distribution whose markdown key function is readable and correct. */
export const healthyCloudFront = (): Record<string, Handler> => ({
    // get-distribution returns the status together with the config it describes.
    'cloudfront get-distribution': () => ({
        Distribution: { Id: DISTRIBUTION_ID, Status: 'Deployed', ...distributionConfig() },
    }),
    'cloudfront get-distribution-config': distributionConfig,
    'cloudfront get-cache-policy': cachePolicy,
    'cloudfront get-function': functionCode(MARKDOWN_KEY_FUNCTION_CODE),
});

const b64 = (s: string): string => Buffer.from(s).toString('base64');
const byte = (field: string, positional: string, value: string, transform = 'NONE'): any => ({
    ByteMatchStatement: {
        FieldToMatch: field.startsWith('header:') ? { SingleHeader: { Name: field.slice(7) } } : { [field]: {} },
        PositionalConstraint: positional,
        SearchString: b64(value),
        TextTransformations: [{ Priority: 0, Type: transform }],
    },
});
const regex = (field: string, value: string, transform = 'LOWERCASE'): any => ({
    RegexMatchStatement: {
        FieldToMatch: field.startsWith('header:') ? { SingleHeader: { Name: field.slice(7) } } : { [field]: {} },
        RegexString: value,
        TextTransformations: [{ Priority: 0, Type: transform }],
    },
});
const label = (key: string): any => ({ LabelMatchStatement: { Scope: 'LABEL', Key: key } });
const ipset = (name: string): any => ({
    IPSetReferenceStatement: { ARN: `arn:aws:wafv2:us-east-1:${ACCOUNT_ID}:global/ipset/${name}/0000` },
});
const or = (...statements: any[]): any => ({ OrStatement: { Statements: statements } });
const and = (...statements: any[]): any => ({ AndStatement: { Statements: statements } });
const not = (statement: any): any => ({ NotStatement: { Statement: statement } });
const rule = (Name: string, Statement: any, extra: any = {}): any => ({ Name, Statement, ...extra });

const nb = CF_ACL.nonBrowser;
const p11Safe = (): any[] => [
    // The live shape add-waf-safe-path-exemptions.sh builds: no transform on either kind.
    ...nb.safePathRegexes.map((r) => regex('UriPath', r, 'NONE')),
    ...nb.safePathPrefixes.map((p) => byte('UriPath', 'STARTS_WITH', p)),
];

/** The rules the structural WAF checks read, in the shapes the live ACL has them. */
export function cfAclRules(): any[] {
    const secret = (n: number): string => `fixture-secret-${n}-`.padEnd(40, 'x');
    return [
        rule('allow-trusted-mcp-lambda', byte('header:x-lambda-verify', 'EXACTLY', secret(1))),
        rule(
            'allow-trusted-ci-archive-tests',
            and(byte('header:x-ag-ci-verify', 'EXACTLY', secret(2)), byte('UriPath', 'STARTS_WITH', '/archive/'))
        ),
        rule('allow-seo-bot', byte('header:x-aud-bot-verify', 'EXACTLY', secret(3))),
        rule(
            'allow-mta-sts-policy',
            and(byte('header:host', 'EXACTLY', CF_ACL.mtaSts.host), byte('UriPath', 'EXACTLY', CF_ACL.mtaSts.path))
        ),
        rule('AWS-AWSManagedRulesCommonRuleSet', {
            ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesCommonRuleSet',
                ScopeDownStatement: not(
                    or(...CF_ACL.commonRuleSetExemptPrefixes.map((p) => byte('UriPath', 'STARTS_WITH', p)))
                ),
            },
        }),
        rule(
            'block-nonbrowser-except-ai-assistants',
            and(
                or(...nb.triggerLabels.map(label)),
                not(
                    or(
                        regex('header:user-agent', `(${nb.uaAllowTokens.join('|')})`),
                        ...nb.exemptLabels.map(label),
                        regex(
                            'header:user-agent',
                            `(${nb.otherUaExemptions.map((u) => u.replace(/\./g, '\\.')).join('|')})`
                        ),
                        // Live shape: the saliencebot UA only counts from its IP set.
                        and(regex('header:user-agent', 'saliencebot'), ipset(nb.saliencebotIpSet)),
                        byte('header:accept', 'CONTAINS', nb.markdownAcceptExemption)
                    )
                ),
                not(or(...p11Safe()))
            ),
            { Action: { Block: { CustomResponse: { ResponseCode: 403, CustomResponseBodyKey: nb.customBody } } } }
        ),
        rule(
            'block-datacenter-except-agent-paths',
            and(
                label('awswaf:managed:aws:bot-control:signal:known_bot_data_center'),
                not(
                    or(
                        ...CF_ACL.dataCentreVerifiedLabels.map(label),
                        byte('header:accept', 'CONTAINS', nb.markdownAcceptExemption)
                    )
                ),
                not(or(...p11Safe()))
            ),
            {
                Action: {
                    Block: { CustomResponse: { ResponseCode: 403, CustomResponseBodyKey: 'automated-access-blocked' } },
                },
                VisibilityConfig: { MetricName: 'blockDataCenterExceptAgentPaths' },
            }
        ),
        ...CF_ACL.rateRules.map((exp) =>
            rule(
                exp.name,
                {
                    RateBasedStatement: {
                        Limit: exp.limit,
                        EvaluationWindowSec: exp.window,
                        AggregateKeyType: 'IP',
                        // The live shape (2026-09-24 ACL backup): UriPath, LOWERCASE, prefixes STARTS_WITH.
                        ...(exp.assetScopeDown
                            ? {
                                  ScopeDownStatement: not(
                                      or(
                                          ...CF_ACL.assetScopeDownPrefixes.map((p) =>
                                              byte('UriPath', 'STARTS_WITH', p, 'LOWERCASE')
                                          ),
                                          regex('UriPath', CF_ACL.assetScopeDownRegex)
                                      )
                                  ),
                              }
                            : {}),
                    },
                },
                {
                    ...(exp.immunity
                        ? { CaptchaConfig: { ImmunityTimeProperty: { ImmunityTime: exp.immunity } } }
                        : {}),
                    ...(exp.customBody
                        ? {
                              Action: {
                                  Block: {
                                      CustomResponse: { ResponseCode: 403, CustomResponseBodyKey: exp.customBody },
                                  },
                              },
                          }
                        : {}),
                }
            )
        ),
        rule(
            'challenge-automated-browser-documents',
            and(
                label(CF_ACL.automatedBrowserChallenge.label),
                not(regex('UriPath', CF_ACL.automatedBrowserChallenge.exemptRegex))
            ),
            {
                Action: { Challenge: {} },
                ChallengeConfig: {
                    ImmunityTimeProperty: { ImmunityTime: CF_ACL.automatedBrowserChallenge.immunity },
                },
            }
        ),
    ].map((r, i) => ({ Priority: i, ...r }));
}

export const cfAclHandlers = (rules = cfAclRules()): Record<string, Handler> => ({
    'wafv2 get-web-acl': () => ({ WebACL: { Name: CF_ACL.name, ARN: 'arn:fixture', Rules: rules } }),
});

export function options(overrides: Partial<Options> = {}): Options {
    return {
        pending: false,
        strict: false,
        list: false,
        verbose: false,
        fullLinks: false,
        days: 7,
        maxRequests: 0,
        concurrency: 1,
        delayMs: 0,
        userAgent: 'offline-test',
        botWindowMs: 2 * 3_600_000,
        botThreshold: 0.01,
        botMinVolume: 20,
        botMaxBytes: 3e9,
        ...overrides,
    };
}

/** A check context with no network: any HTTP use is a test bug. */
export function offlineCtx(aws: Aws, opts: Partial<Options> = {}): Ctx {
    const http = new Proxy({} as Http, {
        get: (_, prop) => {
            throw new Error(`offline test used http.${String(prop)}`);
        },
    });
    return { aws, http, live: new Live(aws), opts: options(opts) };
}

/**
 * The ACL after extend-p11-agent-allowlist.sh: the p11 UA allowlist extended, and its Count rate
 * rule inserted straight after p11. `rateFirst` is the order when that script ran second (its rule
 * then lands next to p11, ahead of the data-centre rule); otherwise it follows the data-centre rule.
 */
export function cfAclRulesWithAgentAllowlist(rateFirst: boolean, rules = cfAclRules()): any[] {
    const extended = `(${[...nb.uaAllowTokens, ...nb.pendingUaAllowTokens.tokens].join('|')})`;
    const p11 = structuredClone(rules.find((r) => r.Name === 'block-nonbrowser-except-ai-assistants'));
    const ua = p11.Statement.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements[0];
    ua.RegexMatchStatement.RegexString = extended;
    const rate = rule(
        nb.allowlistedAgentsRate.rule,
        {
            RateBasedStatement: {
                Limit: nb.allowlistedAgentsRate.limit,
                EvaluationWindowSec: nb.allowlistedAgentsRate.window,
                AggregateKeyType: 'IP',
                ScopeDownStatement: structuredClone(ua),
            },
        },
        { Action: { Count: {} }, VisibilityConfig: { MetricName: 'countAllowlistedAgentsRate' } }
    );
    const out: any[] = [];
    for (const r of rules) {
        if (r.Name === p11.Name) {
            out.push(p11, ...(rateFirst ? [rate] : []));
        } else if (r.Name === 'block-datacenter-except-agent-paths' && !rateFirst) {
            out.push(r, rate);
        } else {
            out.push(r);
        }
    }
    return out.map((r, i) => ({ ...r, Priority: i }));
}

/** What a FakeHttp answers one request with. */
export interface FakeResponse {
    status: number;
    headers?: Record<string, string>;
    body?: string;
}

export interface SentRequest {
    method: 'GET' | 'HEAD';
    url: string;
    headers: Record<string, string>;
}

/**
 * The real Http client (budget, markdown guard, memo) with the network replaced by a responder.
 * `sent` records every request that reached the network, in order.
 */
export class FakeHttp extends Http {
    readonly sent: SentRequest[] = [];

    constructor(
        private readonly respond: (req: SentRequest) => FakeResponse,
        opts: Partial<Options> = {}
    ) {
        super(options({ maxRequests: 100, ...opts }));
    }

    protected override raw(method: 'GET' | 'HEAD', url: URL, headers: Record<string, string>): Promise<Response> {
        const req = { method, url: url.href, headers };
        this.sent.push(req);
        const r = this.respond(req);
        return Promise.resolve({
            url: url.href,
            method,
            status: r.status,
            headers: new Map(Object.entries(r.headers ?? {}).map(([k, v]) => [k.toLowerCase(), [v]])),
            body: method === 'HEAD' ? '' : (r.body ?? ''),
            ms: 0,
        });
    }
}

/** A check context over a FakeAws and a FakeHttp, with the markdown guard prepared and installed. */
export async function fakeCtx(aws: Aws, http: FakeHttp, opts: Partial<Options> = {}): Promise<Ctx> {
    const live = new Live(aws);
    await live.prepareGuard();
    http.setMarkdownGuard(live.markdownGuard);
    return { aws, http, live, opts: options(opts) };
}
