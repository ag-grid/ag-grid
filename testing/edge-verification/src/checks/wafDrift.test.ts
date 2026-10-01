import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { CheckDef, Outcome } from '../core/types';
import { CF_ACL } from '../expected/edge';
import {
    FakeAws,
    albAclHandlers,
    albAclRules,
    cfAclHandlers,
    cfAclRules,
    cfAclRulesWithAgentAllowlist,
    ipSetHandler,
    loggingHandler,
    offlineCtx,
} from '../testing/fakes';
import { wafChecks } from './waf';

/**
 * Drift in fields that no specialised check names: each mutation edits one field of the fixture
 * ACL (which matches live) and must fail with a detail naming that field.
 */

const check = (id: string): CheckDef => {
    const found = wafChecks().find((c) => c.id === id);
    assert.ok(found, `no check ${id}`);
    return found;
};

type Acl = 'cf' | 'alb';

function handlers(acl: Acl, rules: any[], editAcl?: (webAcl: any) => void): Record<string, any> {
    const base = acl === 'cf' ? cfAclHandlers(rules) : albAclHandlers(rules);
    return {
        ...base,
        'wafv2 get-web-acl': (args: string[]) => {
            const r = base['wafv2 get-web-acl'](args) as any;
            editAcl?.(r.WebACL);
            return r;
        },
        'wafv2 get-ip-set': ipSetHandler,
        'wafv2 get-logging-configuration': loggingHandler,
    };
}

async function run(
    id: string,
    acl: Acl,
    edit?: (rules: any[]) => void,
    extra: Record<string, any> = {},
    editAcl?: (webAcl: any) => void
): Promise<Outcome> {
    const rules = acl === 'cf' ? cfAclRules() : albAclRules();
    edit?.(rules);
    return check(id).run(offlineCtx(new FakeAws({ ...handlers(acl, rules, editAcl), ...extra })));
}

const named = (rules: any[], name: string): any => rules.find((r) => r.Name === name);
const group = (rules: any[], name: string): any => named(rules, name).Statement.ManagedRuleGroupStatement;
const RULES: Record<Acl, string> = { cf: 'waf-config.cf.rules', alb: 'waf-config.alb.rules' };

async function assertFails(outcome: Outcome, pattern: RegExp): Promise<void> {
    assert.equal(outcome.status, 'fail', outcome.detail);
    assert.match(outcome.detail ?? '', pattern);
}

describe('the fixture ACLs pass every structural WAF check', () => {
    for (const c of wafChecks().filter((x) => !x.pending && !x.knownIssue && x.id !== 'waf-config.alb.association')) {
        for (const acl of c.id.startsWith('waf-config.alb.') ? (['alb'] as const) : (['cf'] as const)) {
            it(`${c.id} passes`, async () => {
                const outcome = await run(c.id, acl, undefined, {
                    'cloudfront get-distribution-config': () => ({
                        DistributionConfig: {
                            Origins: {
                                Items: [
                                    {
                                        CustomHeaders: {
                                            Items: [
                                                {
                                                    HeaderName: 'x-ag-origin-verify',
                                                    HeaderValue: 'fixture-secret-0-'.padEnd(40, 'x'),
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                });
                assert.equal(outcome.status, 'pass', outcome.detail);
            });
        }
    }

    it('waf-config.cf.rules passes with the p11 allowlist extended by the pending script', async () => {
        const rules = cfAclRulesWithAgentAllowlist(true);
        const outcome = await check(RULES.cf).run(offlineCtx(new FakeAws(handlers('cf', rules))));
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('waf-config.cf.rules passes before the pending Bot Control override is added', async () => {
        const outcome = await run(RULES.cf, 'cf', (rules) => {
            const g = group(rules, 'AWS-AWSManagedRulesBotControlRuleSet');
            g.RuleActionOverrides = g.RuleActionOverrides.filter((o: any) => o.Name !== 'SignalKnownBotDataCenter');
        });
        assert.equal(outcome.status, 'pass', outcome.detail);
    });
});

describe('managed groups: the complete override set, name and action', () => {
    const MUTATIONS: Array<[Acl, string, string, (overrides: any[]) => any[]]> = [
        ['cf', 'AWS-AWSManagedRulesKnownBadInputsRuleSet', 'gains a Count override', (o) => [...o, count('Log4JRCE')]],
        [
            'cf',
            'AWS-AWSManagedRulesAmazonIpReputationList',
            'gains a Count override',
            (o) => [...o, count('AWSManagedIPReputationList')],
        ],
        [
            'cf',
            'AWS-AWSManagedRulesAntiDDoSRuleSet',
            'gains a Count override',
            (o) => [...o, count('ChallengeAllDuringEvent')],
        ],
        [
            'cf',
            'AWS-AWSManagedRulesCommonRuleSet',
            'gains a Count override',
            (o) => [...o, count('NoUserAgent_HEADER')],
        ],
        [
            'cf',
            'AWS-AWSManagedRulesBotControlRuleSet',
            'gains a Count override',
            (o) => [...o, count('CategorySearchEngine')],
        ],
        [
            'cf',
            'AWS-AWSManagedRulesBotControlRuleSet',
            'turns a Count override into Block',
            (o) => o.map((x) => (x.Name === 'CategoryAI' ? { ...x, ActionToUse: { Block: {} } } : x)),
        ],
        [
            'cf',
            'AWS-AWSManagedRulesBotControlRuleSet',
            'loses a Count override',
            (o) => o.filter((x) => x.Name !== 'CategoryHttpLibrary'),
        ],
        [
            'cf',
            'AWS-AWSManagedRulesBotControlRuleSet',
            'has the pending override with another action',
            (o) => o.map((x) => (x.Name === 'SignalKnownBotDataCenter' ? { ...x, ActionToUse: { Challenge: {} } } : x)),
        ],
        [
            'cf',
            'AWS-AWSManagedRulesBotControlRuleSet',
            'gives an override a custom response',
            (o) =>
                o.map((x) =>
                    x.Name === 'CategoryAI'
                        ? { ...x, ActionToUse: { Block: { CustomResponse: { ResponseCode: 429 } } } }
                        : x
                ),
        ],
        ['alb', 'AWS-AWSManagedRulesKnownBadInputsRuleSet', 'gains a Count override', (o) => [...o, count('Log4JRCE')]],
        [
            'alb',
            'AWS-AWSManagedRulesCommonRuleSet',
            'gains a Count override',
            (o) => [...o, count('SizeRestrictions_BODY')],
        ],
        [
            'alb',
            'AWS-AWSManagedRulesAmazonIpReputationList',
            'turns the DDoS-list Block into Count',
            (o) => o.map((x) => ({ ...x, ActionToUse: { Count: {} } })),
        ],
        [
            'alb',
            'AWS-AWSManagedRulesAmazonIpReputationList',
            'gains a second override',
            (o) => [...o, count('AWSManagedReconnaissanceList')],
        ],
    ];
    function count(Name: string): any {
        return { Name, ActionToUse: { Count: {} } };
    }
    for (const [acl, name, what, edit] of MUTATIONS) {
        it(`${acl} ${name} fails when it ${what}`, async () => {
            const outcome = await run(RULES[acl], acl, (rules) => {
                const g = group(rules, name);
                g.RuleActionOverrides = edit(g.RuleActionOverrides ?? []);
            });
            await assertFails(outcome, new RegExp(`${name} RuleActionOverrides \\(pending excluded\\)`));
        });
    }

    it('the pending Bot Control override check reports a wrong action', async () => {
        const outcome = await run('waf-config.cf.bot-control.SignalKnownBotDataCenter', 'cf', (rules) => {
            for (const o of group(rules, 'AWS-AWSManagedRulesBotControlRuleSet').RuleActionOverrides) {
                if (o.Name === 'SignalKnownBotDataCenter') {
                    o.ActionToUse = { Block: {} };
                }
            }
        });
        await assertFails(outcome, /no Count override \(SignalKnownBotDataCenter:Block\)/);
    });
});

describe('waf-config.*.rules compares every field of every rule', () => {
    const b64 = (s: string): string => Buffer.from(s).toString('base64');
    const MUTATIONS: Array<[Acl, string, (rules: any[]) => void, RegExp]> = [
        [
            'cf',
            'the MTA-STS host match stops lowercasing',
            (rules) =>
                (named(
                    rules,
                    'allow-mta-sts-policy'
                ).Statement.AndStatement.Statements[0].ByteMatchStatement.TextTransformations = [
                    { Priority: 0, Type: 'NONE' },
                ]),
            /allow-mta-sts-policy Statement\.AndStatement\.Statements\[\d\]\.ByteMatchStatement\.TextTransformations\[0\]\.Type: got "NONE", expected "LOWERCASE"/,
        ],
        [
            'cf',
            'the CI rule path prefix is matched anywhere',
            (rules) =>
                (named(
                    rules,
                    'allow-trusted-ci-archive-tests'
                ).Statement.AndStatement.Statements[1].ByteMatchStatement.PositionalConstraint = 'CONTAINS'),
            /allow-trusted-ci-archive-tests Statement\.AndStatement\.Statements\[\d\]\.ByteMatchStatement\.PositionalConstraint: got "CONTAINS", expected "STARTS_WITH"/,
        ],
        [
            'cf',
            'a CommonRuleSet exempt prefix starts lowercasing',
            (rules) =>
                (group(
                    rules,
                    'AWS-AWSManagedRulesCommonRuleSet'
                ).ScopeDownStatement.NotStatement.Statement.OrStatement.Statements[0].ByteMatchStatement.TextTransformations =
                    [{ Priority: 0, Type: 'LOWERCASE' }]),
            /AWS-AWSManagedRulesCommonRuleSet Statement\.ManagedRuleGroupStatement\.ScopeDownStatement.*TextTransformations/,
        ],
        [
            'cf',
            'KnownBadInputs gains a scope-down',
            (rules) =>
                (group(rules, 'AWS-AWSManagedRulesKnownBadInputsRuleSet').ScopeDownStatement = {
                    ByteMatchStatement: {
                        SearchString: b64('/api/'),
                        FieldToMatch: { UriPath: {} },
                        TextTransformations: [{ Priority: 0, Type: 'NONE' }],
                        PositionalConstraint: 'STARTS_WITH',
                    },
                }),
            /AWS-AWSManagedRulesKnownBadInputsRuleSet Statement\.ManagedRuleGroupStatement\.ScopeDownStatement: got .*"SearchString":"\/api\/"/,
        ],
        [
            'cf',
            'IpReputation is pinned to a version',
            (rules) => (group(rules, 'AWS-AWSManagedRulesAmazonIpReputationList').Version = 'Version_1.0'),
            /AWS-AWSManagedRulesAmazonIpReputationList Statement\.ManagedRuleGroupStatement\.Version: got "Version_1\.0", expected absent/,
        ],
        [
            'cf',
            'IpReputation runs in Count',
            (rules) => (named(rules, 'AWS-AWSManagedRulesAmazonIpReputationList').OverrideAction = { Count: {} }),
            /AWS-AWSManagedRulesAmazonIpReputationList OverrideAction\.Count: got \{\}, expected absent/,
        ],
        [
            'cf',
            'the AntiDDoS group runs on another sensitivity',
            (rules) =>
                (group(
                    rules,
                    'AWS-AWSManagedRulesAntiDDoSRuleSet'
                ).ManagedRuleGroupConfigs[0].AWSManagedRulesAntiDDoSRuleSet.SensitivityToBlock = 'HIGH'),
            /AWS-AWSManagedRulesAntiDDoSRuleSet .*SensitivityToBlock: got "HIGH", expected "LOW"/,
        ],
        [
            'cf',
            'the credential-scanner regex stops URL-decoding',
            (rules) =>
                named(rules, 'block-credential-scanner-paths').Statement.RegexMatchStatement.TextTransformations.pop(),
            /block-credential-scanner-paths Statement\.RegexMatchStatement\.TextTransformations\[1\]: got absent, expected .*URL_DECODE/,
        ],
        [
            'cf',
            'p11 answers 429 instead of 403',
            (rules) =>
                (named(rules, 'block-nonbrowser-except-ai-assistants').Action.Block.CustomResponse.ResponseCode = 429),
            /block-nonbrowser-except-ai-assistants Action\.Block\.CustomResponse\.ResponseCode: got 429, expected 403/,
        ],
        [
            'cf',
            'the saliencebot exemption references another IP set',
            (rules) => {
                const alts = named(rules, 'block-nonbrowser-except-ai-assistants').Statement.AndStatement.Statements[1]
                    .NotStatement.Statement.OrStatement.Statements;
                const sb = alts.find((a: any) => a.AndStatement).AndStatement.Statements[1];
                sb.IPSetReferenceStatement.ARN = sb.IPSetReferenceStatement.ARN.replace(/[0-9a-f-]+$/, 'other');
            },
            /block-nonbrowser-except-ai-assistants Statement.*IPSetReferenceStatement\.ARN: got ".*other"/,
        ],
        [
            'cf',
            'the CAPTCHA rule gets a shorter immunity',
            (rules) =>
                (named(rules, 'soft-rate-limit-rule-with-captcha').CaptchaConfig.ImmunityTimeProperty.ImmunityTime =
                    60),
            /soft-rate-limit-rule-with-captcha CaptchaConfig\.ImmunityTimeProperty\.ImmunityTime: got 60, expected 3600/,
        ],
        [
            'cf',
            'the flat rate rule gains a CAPTCHA immunity',
            (rules) =>
                (named(rules, 'soft-rate-limit-flat-with-captcha-flat').CaptchaConfig = {
                    ImmunityTimeProperty: { ImmunityTime: 60 },
                }),
            /soft-rate-limit-flat-with-captcha-flat CaptchaConfig: got .*, expected absent/,
        ],
        [
            'cf',
            'a rate rule aggregates on a custom key',
            (rules) => {
                const rb = named(rules, 'soft-rate-limit-docs-with-captch-count').Statement.RateBasedStatement;
                rb.AggregateKeyType = 'CUSTOM_KEYS';
                rb.CustomKeys = [{ Header: { Name: 'x-forwarded-for', TextTransformations: [] } }];
            },
            /soft-rate-limit-docs-with-captch-count Statement\.RateBasedStatement\.CustomKeys: got .*, expected absent/,
        ],
        [
            'cf',
            'a rule adds a label',
            (rules) => (named(rules, 'block-credential-scanner-paths').RuleLabels = [{ Name: 'scanner' }]),
            /block-credential-scanner-paths RuleLabels: got \[\{"Name":"scanner"\}\], expected absent/,
        ],
        [
            'cf',
            'a rule stops publishing metrics',
            (rules) => (named(rules, 'allow-seo-bot').VisibilityConfig.CloudWatchMetricsEnabled = false),
            /allow-seo-bot VisibilityConfig\.CloudWatchMetricsEnabled: got false, expected true/,
        ],
        [
            'cf',
            'the challenge rule gets a shorter immunity',
            (rules) =>
                (named(
                    rules,
                    'challenge-automated-browser-documents'
                ).ChallengeConfig.ImmunityTimeProperty.ImmunityTime = 300),
            /challenge-automated-browser-documents ChallengeConfig\.ImmunityTimeProperty\.ImmunityTime: got 300, expected 3600/,
        ],
        [
            'cf',
            'the Shield group stops applying its verdicts',
            (rules) => (named(rules, 'ShieldMitigationRuleGroup_fixture').OverrideAction = { Count: {} }),
            /Shield mitigation group override action: got "Count", expected "None"/,
        ],
        [
            'alb',
            'the origin-verify match is a prefix',
            (rules) =>
                (named(
                    rules,
                    'block-non-cloudfront-origin'
                ).Statement.NotStatement.Statement.ByteMatchStatement.PositionalConstraint = 'STARTS_WITH'),
            /block-non-cloudfront-origin Statement\.NotStatement\.Statement\.ByteMatchStatement\.PositionalConstraint: got "STARTS_WITH", expected "EXACTLY"/,
        ],
        [
            'alb',
            'a rate rule answers with a custom response',
            (rules) =>
                (named(rules, 'hard-rate-limit-rule-with-blocking').Action.Block = {
                    CustomResponse: { ResponseCode: 429 },
                }),
            /hard-rate-limit-rule-with-blocking Action\.Block\.CustomResponse: got \{"ResponseCode":429\}, expected absent/,
        ],
    ];
    for (const [acl, what, edit, pattern] of MUTATIONS) {
        it(`${acl} fails when ${what}`, async () => {
            await assertFails(await run(RULES[acl], acl, edit), pattern);
        });
    }

    for (const acl of ['cf', 'alb'] as const) {
        it(`${acl} fails on an undeclared rule after the Shield group`, async () => {
            const outcome = await run(RULES[acl], acl, (rules) =>
                rules.push({
                    Name: 'late-block',
                    Priority: 10000001,
                    Statement: { ByteMatchStatement: {} },
                    Action: { Block: {} },
                })
            );
            await assertFails(outcome, /rule order \(pending rules excluded\): got \[.*"late-block"\]/);
        });
    }

    it('reports a verify-header rule drift without printing the secret', async () => {
        const outcome = await run(RULES.cf, 'cf', (rules) => {
            named(rules, 'allow-trusted-mcp-lambda').Statement.ByteMatchStatement.FieldToMatch = {
                SingleHeader: { Name: 'x-lambda-verify-2' },
            };
        });
        await assertFails(
            outcome,
            /allow-trusted-mcp-lambda Statement\.ByteMatchStatement\.FieldToMatch\.SingleHeader\.Name/
        );
        assert.doesNotMatch(outcome.detail ?? '', /fixture-secret/);
    });
});

describe('ACL settings beside the rules', () => {
    const MUTATIONS: Array<[Acl, string, (webAcl: any) => void, RegExp]> = [
        [
            'cf',
            'the custom body loses its MCP pointer line',
            (a) =>
                (a.CustomResponseBodies['automated-access-blocked'].Content = a.CustomResponseBodies[
                    'automated-access-blocked'
                ].Content.replace(/.*MCP server.*\n/, '')),
            /ACL CustomResponseBodies\.automated-access-blocked\.Content: got/,
        ],
        [
            'cf',
            'a second custom body appears',
            (a) => (a.CustomResponseBodies.other = { ContentType: 'TEXT_HTML', Content: 'x' }),
            /ACL CustomResponseBodies\.other: got .*, expected absent/,
        ],
        [
            'cf',
            'the ACL gains a challenge immunity',
            (a) => (a.ChallengeConfig = { ImmunityTimeProperty: { ImmunityTime: 60 } }),
            /ACL ChallengeConfig: got .*, expected absent/,
        ],
        [
            'cf',
            'the ACL inspects a larger request body',
            (a) => (a.AssociationConfig = { RequestBody: { CLOUDFRONT: { DefaultSizeInspectionLimit: 'KB_64' } } }),
            /ACL AssociationConfig: got .*, expected absent/,
        ],
        [
            'cf',
            'a second token domain is accepted',
            (a) => a.TokenDomains.push('example.com'),
            /ACL TokenDomains: extra \["example\.com"\], missing \[\]/,
        ],
        [
            'cf',
            'the ACL stops sampling requests',
            (a) => (a.VisibilityConfig.SampledRequestsEnabled = false),
            /ACL VisibilityConfig\.SampledRequestsEnabled: got false, expected true/,
        ],
        [
            'alb',
            'the default action becomes Block',
            (a) => (a.DefaultAction = { Block: {} }),
            /ACL DefaultAction\.Block: got \{\}, expected absent/,
        ],
        [
            'alb',
            'on-source DDoS protection changes mode',
            (a) => (a.OnSourceDDoSProtectionConfig = { ALBLowReputationMode: 'ALWAYS_ON' }),
            /ACL OnSourceDDoSProtectionConfig\.ALBLowReputationMode: got "ALWAYS_ON", expected "ACTIVE_UNDER_DDOS"/,
        ],
    ];
    for (const [acl, what, edit, pattern] of MUTATIONS) {
        it(`${acl} fails when ${what}`, async () => {
            await assertFails(await run(`waf-config.${acl}.acl`, acl, undefined, {}, edit), pattern);
        });
    }
});

describe('IP sets hold exactly the declared addresses', () => {
    const ipSets = (edit: (set: any) => void): Record<string, any> => ({
        'wafv2 get-ip-set': (args: string[]) => {
            const r = ipSetHandler(args) as any;
            edit(r.IPSet);
            return r;
        },
    });
    for (const id of ['waf-config.cf.build-server-ipset', 'waf-config.cf.salience-bot-ipset']) {
        it(`${id} fails when the set gains an address`, async () => {
            const outcome = await run(
                id,
                'cf',
                undefined,
                ipSets((s) => s.Addresses.push('0.0.0.0/1'))
            );
            await assertFails(outcome, /IP set Addresses: extra \["0\.0\.0\.0\/1"\], missing \[\]/);
        });
        it(`${id} fails when the set becomes IPv6`, async () => {
            const outcome = await run(
                id,
                'cf',
                undefined,
                ipSets((s) => (s.IPAddressVersion = 'IPV6'))
            );
            await assertFails(outcome, /IP set IPAddressVersion: got "IPV6", expected "IPV4"/);
        });
    }

    it('the salience-bot check fails when the exemption references another set', async () => {
        const outcome = await run('waf-config.cf.salience-bot-ipset', 'cf', (rules) => {
            const alts = named(rules, 'block-nonbrowser-except-ai-assistants').Statement.AndStatement.Statements[1]
                .NotStatement.Statement.OrStatement.Statements;
            alts.find((a: any) => a.AndStatement).AndStatement.Statements[1].IPSetReferenceStatement.ARN = 'arn:other';
        });
        await assertFails(outcome, /referenced set: got "arn:other"/);
    });
});

describe('WAF logging configuration', () => {
    const logging = (edit: (cfg: any) => void): Record<string, any> => ({
        'wafv2 get-logging-configuration': (args: string[]) => {
            const r = loggingHandler(args) as any;
            edit(r.LoggingConfiguration);
            return r;
        },
    });
    const redacted = (headers: string[]): any[] => headers.map((Name) => ({ SingleHeader: { Name } }));

    for (const acl of ['cf', 'alb'] as const) {
        const id = `waf-config.${acl}.logging`;
        it(`${id} fails when a filter drops requests from the log`, async () => {
            const outcome = await run(
                id,
                acl,
                undefined,
                logging((c) => (c.LoggingFilter = { DefaultBehavior: 'DROP', Filters: [] }))
            );
            await assertFails(outcome, /logging LoggingFilter: got .*DROP.*, expected absent/);
        });
        it(`${id} passes once every declared header is redacted`, async () => {
            const outcome = await run(
                id,
                acl,
                undefined,
                logging((c) => (c.RedactedFields = redacted(CF_ACL.logging.redactedHeaders)))
            );
            assert.equal(outcome.status, 'pass', outcome.detail);
        });
        it(`${id} fails when only some headers are redacted`, async () => {
            const outcome = await run(
                id,
                acl,
                undefined,
                logging((c) => (c.RedactedFields = redacted(['x-lambda-verify'])))
            );
            await assertFails(outcome, /logging RedactedFields/);
        });
        it(`${id}.redaction fails on an extra redacted field`, async () => {
            const outcome = await run(
                `${id}.redaction`,
                acl,
                undefined,
                logging((c) => (c.RedactedFields = [...redacted(CF_ACL.logging.redactedHeaders), { UriPath: {} }]))
            );
            await assertFails(outcome, /redacted fields: got .*UriPath/);
        });
    }
});
