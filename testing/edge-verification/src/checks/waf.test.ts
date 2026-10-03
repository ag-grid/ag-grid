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
    offlineCtx,
} from '../testing/fakes';
import { wafChecks } from './waf';

const CHECKS = {
    verifyHeaders: 'waf-config.cf.verify-header-rules',
    mtaSts: 'waf-config.cf.mta-sts',
    commonRuleSet: 'waf-config.cf.common-rule-set',
    nonBrowser: 'waf-config.cf.nonbrowser-rule',
    dataCentre: 'waf-config.cf.rule.block-datacenter-except-agent-paths',
    browserChallenge: 'waf-config.cf.automated-browser-challenge',
    rateRules: 'waf-config.cf.rate-rules',
};

const check = (id: string): CheckDef => {
    const found = wafChecks().find((c) => c.id === id);
    assert.ok(found, `no check ${id}`);
    return found;
};

/** Runs a check against the fixture ACL after `mutate` has edited one rule's statement. */
async function run(id: string, mutate?: { rule: string; edit: (statement: any) => any }): Promise<Outcome> {
    const rules = cfAclRules().map((r) =>
        mutate && r.Name === mutate.rule ? { ...r, Statement: mutate.edit(structuredClone(r.Statement)) } : r
    );
    return check(id).run(offlineCtx(new FakeAws(cfAclHandlers(rules))));
}

describe('WAF statement structure', () => {
    for (const id of Object.values(CHECKS)) {
        it(`${id} passes on the declared structure`, async () => {
            const outcome = await run(id);
            assert.equal(outcome.status, 'pass', outcome.detail);
        });
    }

    const and2or = (s: any): any => ({ OrStatement: s.AndStatement });

    const MUTATIONS: Array<[string, string, string, (s: any) => any]> = [
        [
            'CommonRuleSet scope-down without its negation',
            CHECKS.commonRuleSet,
            'AWS-AWSManagedRulesCommonRuleSet',
            (s) => {
                const m = s.ManagedRuleGroupStatement;
                m.ScopeDownStatement = m.ScopeDownStatement.NotStatement.Statement;
                return s;
            },
        ],
        ['MTA-STS host OR path', CHECKS.mtaSts, 'allow-mta-sts-policy', and2or],
        ['CI verify header OR path prefix', CHECKS.verifyHeaders, 'allow-trusted-ci-archive-tests', and2or],
        ['p11 as an OR', CHECKS.nonBrowser, 'block-nonbrowser-except-ai-assistants', and2or],
        [
            'p11 exemptions without their negation',
            CHECKS.nonBrowser,
            'block-nonbrowser-except-ai-assistants',
            (s) => {
                s.AndStatement.Statements[1] = s.AndStatement.Statements[1].NotStatement.Statement;
                return s;
            },
        ],
        [
            'p11 safe paths without their negation',
            CHECKS.nonBrowser,
            'block-nonbrowser-except-ai-assistants',
            (s) => {
                s.AndStatement.Statements[2] = s.AndStatement.Statements[2].NotStatement.Statement;
                return s;
            },
        ],
        [
            'data-centre rule safe paths without their negation',
            CHECKS.dataCentre,
            'block-datacenter-except-agent-paths',
            (s) => {
                s.AndStatement.Statements[2] = s.AndStatement.Statements[2].NotStatement.Statement;
                return s;
            },
        ],
        ['data-centre rule as an OR', CHECKS.dataCentre, 'block-datacenter-except-agent-paths', and2or],
        [
            'data-centre rule without its verified-bot exemptions',
            CHECKS.dataCentre,
            'block-datacenter-except-agent-paths',
            (s) => {
                const or = s.AndStatement.Statements[1].NotStatement.Statement.OrStatement;
                or.Statements = or.Statements.filter((x: any) => !x.LabelMatchStatement);
                return s;
            },
        ],
        [
            'data-centre rule missing one verified-bot label',
            CHECKS.dataCentre,
            'block-datacenter-except-agent-paths',
            (s) => {
                s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements.splice(1, 1);
                return s;
            },
        ],
        [
            'data-centre rule verified-bot label matched as a namespace',
            CHECKS.dataCentre,
            'block-datacenter-except-agent-paths',
            (s) => {
                s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements[0].LabelMatchStatement.Scope =
                    'NAMESPACE';
                return s;
            },
        ],
        [
            'data-centre rule markdown exemption as EXACTLY',
            CHECKS.dataCentre,
            'block-datacenter-except-agent-paths',
            (s) => {
                const stmts = s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements;
                const md = stmts.find((x: any) => x.AndStatement).AndStatement.Statements[0];
                md.ByteMatchStatement.PositionalConstraint = 'EXACTLY';
                return s;
            },
        ],
        ['browser challenge as an OR', CHECKS.browserChallenge, 'challenge-automated-browser-documents', and2or],
        [
            'browser challenge exemption without its negation',
            CHECKS.browserChallenge,
            'challenge-automated-browser-documents',
            (s) => {
                s.AndStatement.Statements[1] = s.AndStatement.Statements[1].NotStatement.Statement;
                return s;
            },
        ],
        [
            'browser challenge exemption on another field',
            CHECKS.browserChallenge,
            'challenge-automated-browser-documents',
            (s) => {
                s.AndStatement.Statements[1].NotStatement.Statement.RegexMatchStatement.FieldToMatch = {
                    QueryString: {},
                };
                return s;
            },
        ],
        [
            'browser challenge exemption without LOWERCASE',
            CHECKS.browserChallenge,
            'challenge-automated-browser-documents',
            (s) => {
                s.AndStatement.Statements[1].NotStatement.Statement.RegexMatchStatement.TextTransformations = [
                    { Priority: 0, Type: 'NONE' },
                ];
                return s;
            },
        ],
    ];

    for (const [what, id, rule, edit] of MUTATIONS) {
        it(`${id} fails on ${what}`, async () => {
            const outcome = await run(id, { rule, edit });
            assert.equal(outcome.status, 'fail');
            assert.match(outcome.detail ?? '', /statement|scope-down/);
        });
    }
});

describe('rules inserted straight after p11 by two scripts', () => {
    const allowlist = 'waf-config.cf.nonbrowser-rule.agent-allowlist';
    const rate = 'waf-config.cf.rule.count-allowlisted-agents-rate';
    const dataCentre = 'waf-config.cf.rule.block-datacenter-except-agent-paths';
    const runOn = (id: string, rules: any[]): Promise<Outcome> =>
        check(id).run(offlineCtx(new FakeAws(cfAclHandlers(rules))));

    for (const rateFirst of [true, false]) {
        it(`both inserted rules pass whichever script ran second (rate rule ${rateFirst ? 'first' : 'second'})`, async () => {
            const rules = cfAclRulesWithAgentAllowlist(rateFirst);
            for (const id of [allowlist, rate, dataCentre]) {
                const outcome = await runOn(id, rules);
                assert.equal(outcome.status, 'pass', `${id}: ${outcome.detail}`);
            }
        });
    }

    it('fails when an unrelated rule sits between p11 and an inserted rule', async () => {
        const rules = cfAclRulesWithAgentAllowlist(false);
        const i = rules.findIndex((r) => r.Name === 'block-datacenter-except-agent-paths');
        rules.splice(i, 0, { Name: 'soft-rate-limit-docs-with-captch-count', Statement: {}, Action: { Count: {} } });
        const outcome = await runOn(
            rate,
            rules.map((r, n) => ({ ...r, Priority: n }))
        );
        assert.equal(outcome.status, 'fail');
        assert.match(outcome.detail ?? '', /between block-nonbrowser-except-ai-assistants and/);
    });

    it('fails when the rate rule scope-down drifts from the p11 allowlist', async () => {
        const rules = cfAclRulesWithAgentAllowlist(true);
        const r = rules.find((x) => x.Name === 'count-allowlisted-agents-rate');
        r.Statement.RateBasedStatement.ScopeDownStatement.RegexMatchStatement.RegexString = '(gptbot)';
        const outcome = await runOn(rate, rules);
        assert.equal(outcome.status, 'fail');
        assert.match(outcome.detail ?? '', /scope-down regex/);
    });

    it('keeps the statement checks once the pending markers are removed', async () => {
        const inserted = CF_ACL.rules.filter((r) => r.after === 'block-nonbrowser-except-ai-assistants');
        const markers = inserted.map((r) => r.pending);
        try {
            for (const r of inserted) {
                delete (r as { pending?: string }).pending;
            }
            const checks = wafChecks();
            const found = (id: string): CheckDef => {
                const c = checks.find((x) => x.id === id);
                assert.ok(c, `no check ${id} once deployed`);
                assert.equal(c.pending, undefined);
                return c;
            };
            const rules = cfAclRulesWithAgentAllowlist(true);
            for (const id of [rate, dataCentre]) {
                const outcome = await found(id).run(offlineCtx(new FakeAws(cfAclHandlers(rules))));
                assert.equal(outcome.status, 'pass', `${id}: ${outcome.detail}`);
            }
            rules.find((x) => x.Name === 'count-allowlisted-agents-rate').Statement.RateBasedStatement.Limit = 6000;
            const outcome = await found(rate).run(offlineCtx(new FakeAws(cfAclHandlers(rules))));
            assert.equal(outcome.status, 'fail', outcome.detail);
        } finally {
            inserted.forEach((r, i) => Object.assign(r, { pending: markers[i] }));
        }
    });

    it('the allowlist check fails until every new token is admitted', async () => {
        const outcome = await runOn(allowlist, cfAclRules());
        assert.equal(outcome.status, 'fail');
        assert.match(outcome.detail ?? '', /not admitted: meta-webindexer/);
    });
});

describe('p11 saliencebot exemption', () => {
    it('fails when the saliencebot UA is exempt without its IP set', async () => {
        const outcome = await run(CHECKS.nonBrowser, {
            rule: 'block-nonbrowser-except-ai-assistants',
            edit: (s) => {
                const alts = s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements;
                const i = alts.findIndex((a: any) => a.AndStatement);
                alts[i] = alts[i].AndStatement.Statements[0];
                return s;
            },
        });
        assert.equal(outcome.status, 'fail');
        assert.match(outcome.detail ?? '', /saliencebot/);
    });

    const salienceAnd = (s: any): any[] =>
        s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements.find((a: any) => a.AndStatement)
            .AndStatement.Statements;

    for (const [what, mutate] of [
        [
            'its UA regex no longer matches saliencebot',
            (and: any[]) => {
                and[0].RegexMatchStatement.RegexString = 'a-different-bot';
            },
        ],
        [
            'an extra condition narrows it',
            (and: any[]) => {
                and.push({
                    ByteMatchStatement: {
                        FieldToMatch: { SingleHeader: { Name: 'host' } },
                        PositionalConstraint: 'EXACTLY',
                        SearchString: Buffer.from('nowhere.invalid').toString('base64'),
                        TextTransformations: [{ Priority: 0, Type: 'NONE' }],
                    },
                });
            },
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await run(CHECKS.nonBrowser, {
                rule: 'block-nonbrowser-except-ai-assistants',
                edit: (s) => {
                    mutate(salienceAnd(s));
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail');
            assert.match(outcome.detail ?? '', /saliencebot/);
        });
    }
});

describe('p11 exemptions are exactly the declared set', () => {
    const exemptionAlts = (s: any): any[] => s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements;
    const uaRegex = (value: string): any => ({
        RegexMatchStatement: {
            FieldToMatch: { SingleHeader: { Name: 'user-agent' } },
            RegexString: value,
            TextTransformations: [{ Priority: 0, Type: 'LOWERCASE' }],
        },
    });

    for (const [what, mutate] of [
        [
            'an extra UA regex admits every UA but saliencebot',
            (alts: any[]) => alts.push(uaRegex('^(?!.*saliencebot).*$')),
        ],
        ['the in-app browser regex is replaced by a catch-all', (alts: any[]) => (alts[4] = uaRegex('.*'))],
        [
            'an extra label is exempt',
            (alts: any[]) => alts.push({ LabelMatchStatement: { Scope: 'LABEL', Key: 'x:y' } }),
        ],
        [
            'a second AND exemption is added',
            (alts: any[]) => alts.push(structuredClone(alts.find((a: any) => a.AndStatement))),
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await run(CHECKS.nonBrowser, {
                rule: 'block-nonbrowser-except-ai-assistants',
                edit: (s) => {
                    mutate(exemptionAlts(s));
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', /exemption/);
        });
    }

    for (const type of ['NONE', 'URL_DECODE']) {
        it(`fails when the Accept: text/markdown exemption uses ${type} instead of the live transform`, async () => {
            const outcome = await run(CHECKS.nonBrowser, {
                rule: 'block-nonbrowser-except-ai-assistants',
                edit: (s) => {
                    const accept = exemptionAlts(s).find(
                        (a: any) => a.ByteMatchStatement?.FieldToMatch?.SingleHeader?.Name === 'accept'
                    );
                    accept.ByteMatchStatement.TextTransformations = [{ Priority: 0, Type: type }];
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', /Accept: text\/markdown exemption missing|undeclared exemptions/);
        });
    }

    it('fails when the AI UA allowlist regex stops lowercasing the header', async () => {
        const outcome = await run(CHECKS.nonBrowser, {
            rule: 'block-nonbrowser-except-ai-assistants',
            edit: (s) => {
                const ua = exemptionAlts(s).find((a: any) =>
                    a.RegexMatchStatement?.RegexString.includes('chatgpt-user')
                );
                ua.RegexMatchStatement.TextTransformations = [{ Priority: 0, Type: 'NONE' }];
                return s;
            },
        });
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /transforms/);
    });
});

describe('shared-secret Allow rules match the secret without transformation', () => {
    for (const rule of ['allow-trusted-mcp-lambda', 'allow-trusted-ci-archive-tests', 'allow-seo-bot']) {
        it(`fails when ${rule} normalises the header with CMD_LINE`, async () => {
            const outcome = await run(CHECKS.verifyHeaders, {
                rule,
                edit: (s) => {
                    const secret = s.ByteMatchStatement ?? s.AndStatement.Statements[0].ByteMatchStatement;
                    secret.TextTransformations = [{ Priority: 0, Type: 'CMD_LINE' }];
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', new RegExp(`${rule} transforms`));
        });
    }
});

describe('waf-config.alb.rules CRS scope-down', () => {
    const albRules = check('waf-config.alb.rules');
    const runAlb = (edit?: (scopeDown: any) => any): Promise<Outcome> => {
        const rules = albAclRules();
        if (edit) {
            const crs = rules.find((r) => r.Name === 'AWS-AWSManagedRulesCommonRuleSet').Statement
                .ManagedRuleGroupStatement;
            crs.ScopeDownStatement = edit(crs.ScopeDownStatement);
        }
        return albRules.run(offlineCtx(new FakeAws(albAclHandlers(rules))));
    };

    it('passes on NOT(UriPath STARTS_WITH the exempt prefix)', async () => {
        const outcome = await runAlb();
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    for (const [field, value] of [
        ['Name', 'AWSManagedRulesAdminProtectionRuleSet'],
        ['VendorName', 'SomeVendor'],
    ] as const) {
        it(`fails when the group's ${field} is ${value}`, async () => {
            const rules = albAclRules();
            rules.find((r) => r.Name === 'AWS-AWSManagedRulesCommonRuleSet').Statement.ManagedRuleGroupStatement[
                field
            ] = value;
            const outcome = await albRules.run(offlineCtx(new FakeAws(albAclHandlers(rules))));
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', new RegExp(value));
        });
    }

    const leaf = (s: any): any => s.NotStatement.Statement.ByteMatchStatement;
    for (const [what, edit] of [
        [
            'the prefix is matched on the User-Agent',
            (s: any) => {
                leaf(s).FieldToMatch = { SingleHeader: { Name: 'user-agent' } };
                return s;
            },
        ],
        [
            'the prefix is matched with CONTAINS',
            (s: any) => {
                leaf(s).PositionalConstraint = 'CONTAINS';
                return s;
            },
        ],
        [
            'the prefix is matched after a transformation',
            (s: any) => {
                leaf(s).TextTransformations = [{ Priority: 0, Type: 'URL_DECODE' }];
                return s;
            },
        ],
        [
            'another exemption is added',
            (s: any) => {
                const exempt = s.NotStatement.Statement;
                const everything = structuredClone(exempt);
                everything.ByteMatchStatement.SearchString = Buffer.from('/').toString('base64');
                return { NotStatement: { Statement: { OrStatement: { Statements: [exempt, everything] } } } };
            },
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await runAlb(edit);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(
                outcome.detail ?? '',
                /AWS-AWSManagedRulesCommonRuleSet Statement\.ManagedRuleGroupStatement\.ScopeDownStatement/
            );
        });
    }
});

describe('waf-config.alb.rules rate rules and CRS overrides', () => {
    const albRules = check('waf-config.alb.rules');
    const runWith = (edit: (rules: any[]) => void): Promise<Outcome> => {
        const rules = albAclRules();
        edit(rules);
        return albRules.run(offlineCtx(new FakeAws(albAclHandlers(rules))));
    };
    const rate = (rules: any[]) =>
        rules.find((r) => r.Name === 'hard-rate-limit-rule-with-blocking').Statement.RateBasedStatement;

    for (const [what, edit, pattern] of [
        [
            'a rate rule aggregates on a forwarded header',
            (rules: any[]) => {
                rate(rules).AggregateKeyType = 'FORWARDED_IP';
                rate(rules).ForwardedIPConfig = { HeaderName: 'X-Forwarded-For', FallbackBehavior: 'MATCH' };
            },
            /hard-rate-limit-rule-with-blocking Statement\.RateBasedStatement\.(AggregateKeyType|ForwardedIPConfig)/,
        ],
        [
            'a rate rule window changes',
            (rules: any[]) => (rate(rules).EvaluationWindowSec = 60),
            /RateBasedStatement\.EvaluationWindowSec: got 60, expected 300/,
        ],
        [
            'a rate rule loses its scope-down',
            (rules: any[]) => delete rate(rules).ScopeDownStatement,
            /RateBasedStatement\.ScopeDownStatement: got absent/,
        ],
        [
            'the CRS group gains an override',
            (rules: any[]) => {
                rules.find(
                    (r) => r.Name === 'AWS-AWSManagedRulesCommonRuleSet'
                ).Statement.ManagedRuleGroupStatement.RuleActionOverrides = [
                    { Name: 'SizeRestrictions_BODY', ActionToUse: { Count: {} } },
                ];
            },
            /AWS-AWSManagedRulesCommonRuleSet RuleActionOverrides.*SizeRestrictions_BODY:Count/,
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await runWith(edit);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', pattern);
        });
    }
});

describe('waf-config.alb.origin-verify', () => {
    const originVerify = check('waf-config.alb.origin-verify');
    const runOrigin = (transform?: string): Promise<Outcome> => {
        const rules = albAclRules();
        if (transform) {
            rules.find(
                (r) => r.Name === 'block-non-cloudfront-origin'
            ).Statement.NotStatement.Statement.ByteMatchStatement.TextTransformations = [
                { Priority: 0, Type: transform },
            ];
        }
        return originVerify.run(offlineCtx(new FakeAws(albAclHandlers(rules))));
    };

    it('passes on NOT(the header EXACTLY the secret) with no transformation', async () => {
        const outcome = await runOrigin();
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails when the secret is compared after LOWERCASE', async () => {
        const outcome = await runOrigin('LOWERCASE');
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /transforms/);
    });
});

describe('waf-config.cf.common-rule-set identity', () => {
    for (const [what, field, value] of [
        ['another managed group replaces CRS', 'Name', 'AWSManagedRulesAdminProtectionRuleSet'],
        ['the group is from another vendor', 'VendorName', 'SomeVendor'],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await run(CHECKS.commonRuleSet, {
                rule: 'AWS-AWSManagedRulesCommonRuleSet',
                edit: (s) => {
                    s.ManagedRuleGroupStatement[field] = value;
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', new RegExp(value));
        });
    }
});

describe('IP-set matches use the connection IP, not a forwarded header', () => {
    const forwarded = { HeaderName: 'X-Forwarded-For', Position: 'ANY', FallbackBehavior: 'MATCH' };
    const runBuildServer = (config?: object): Promise<Outcome> => {
        const rules = cfAclRules();
        const ref = rules.find((r) => r.Name === 'allow-internal-ec2').Statement.IPSetReferenceStatement;
        if (config) {
            ref.IPSetForwardedIPConfig = config;
        }
        return check('waf-config.cf.build-server-ipset').run(
            offlineCtx(new FakeAws({ ...cfAclHandlers(rules), 'wafv2 get-ip-set': ipSetHandler }))
        );
    };

    it('the build-server rule passes on the connection IP', async () => {
        const outcome = await runBuildServer();
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('the build-server rule fails when it matches X-Forwarded-For', async () => {
        const outcome = await runBuildServer(forwarded);
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /X-Forwarded-For/);
    });

    it('the saliencebot exemption fails when its IP set matches X-Forwarded-For', async () => {
        const outcome = await run(CHECKS.nonBrowser, {
            rule: 'block-nonbrowser-except-ai-assistants',
            edit: (s) => {
                const and = s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements.find(
                    (a: any) => a.AndStatement
                ).AndStatement.Statements;
                and[1].IPSetReferenceStatement.IPSetForwardedIPConfig = forwarded;
                return s;
            },
        });
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /saliencebot/);
    });
});

describe('rate rules without an asset scope-down keep their declared scope', () => {
    for (const [what, name, edit, pattern] of [
        [
            'the flat CAPTCHA rule is narrowed to one path',
            'soft-rate-limit-flat-with-captcha-flat',
            (rb: any) => {
                rb.ScopeDownStatement = {
                    ByteMatchStatement: {
                        SearchString: Buffer.from('/never-requested/').toString('base64'),
                        FieldToMatch: { UriPath: {} },
                        TextTransformations: [{ Priority: 0, Type: 'NONE' }],
                        PositionalConstraint: 'EXACTLY',
                    },
                };
            },
            /flat-with-captcha-flat scope-down/,
        ],
        [
            'the counting rule loses a safe path',
            'count-nonbrowser-safe-paths',
            (rb: any) => rb.ScopeDownStatement.AndStatement.Statements[1].OrStatement.Statements.pop(),
            /scope-down safe paths/,
        ],
        [
            'the counting rule ORs labels and paths instead of ANDing them',
            'count-nonbrowser-safe-paths',
            (rb: any) => {
                rb.ScopeDownStatement = { OrStatement: rb.ScopeDownStatement.AndStatement };
            },
            /AND\(any trigger label, any safe path\)/,
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await run(CHECKS.rateRules, {
                rule: name,
                edit: (s) => {
                    edit(s.RateBasedStatement);
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', pattern);
        });
    }
});

describe('rate-rule asset scope-down keeps its matching semantics', () => {
    const RULE = 'soft-rate-limit-rule-with-captcha';
    const assetLeaves = (s: any): any[] =>
        s.RateBasedStatement.ScopeDownStatement.NotStatement.Statement.OrStatement.Statements;
    const MUTATIONS: Array<[string, (leaves: any[]) => void]> = [
        [
            'every asset exemption matched on the user-agent',
            (ls) =>
                ls.forEach((l) => {
                    Object.values<any>(l)[0].FieldToMatch = { SingleHeader: { Name: 'user-agent' } };
                }),
        ],
        [
            'every prefix matched EXACTLY',
            (ls) =>
                ls.forEach((l) => {
                    if (l.ByteMatchStatement) {
                        l.ByteMatchStatement.PositionalConstraint = 'EXACTLY';
                    }
                }),
        ],
        [
            'a different text transformation',
            (ls) =>
                ls.forEach((l) => {
                    Object.values<any>(l)[0].TextTransformations = [{ Priority: 0, Type: 'NONE' }];
                }),
        ],
        [
            'an extra exemption',
            (ls) => {
                const extra = structuredClone(ls[0]);
                extra.ByteMatchStatement.SearchString = Buffer.from('/docs/').toString('base64');
                ls.push(extra);
            },
        ],
    ];
    for (const [what, mutate] of MUTATIONS) {
        it(`fails on ${what}`, async () => {
            const outcome = await run(CHECKS.rateRules, {
                rule: RULE,
                edit: (s) => {
                    mutate(assetLeaves(s));
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail');
            assert.match(outcome.detail ?? '', new RegExp(`${RULE}: asset scope-down`));
        });
    }
});

describe('safe-path exemptions keep their matching semantics', () => {
    const safeLeaves = (s: any): any[] => s.AndStatement.Statements[2].NotStatement.Statement.OrStatement.Statements;
    const MUTATIONS: Array<[string, (leaf: any) => void]> = [
        [
            'matched on the user-agent instead of the path',
            (l) => {
                Object.values<any>(l)[0].FieldToMatch = { SingleHeader: { Name: 'user-agent' } };
            },
        ],
        [
            'a prefix matched EXACTLY instead of STARTS_WITH',
            (l) => {
                if (l.ByteMatchStatement) {
                    l.ByteMatchStatement.PositionalConstraint = 'EXACTLY';
                }
            },
        ],
        [
            'a different text transformation',
            (l) => {
                Object.values<any>(l)[0].TextTransformations = [{ Priority: 0, Type: 'URL_DECODE' }];
            },
        ],
    ];
    for (const [what, mutate] of MUTATIONS) {
        for (const [id, rule] of [
            [CHECKS.nonBrowser, 'block-nonbrowser-except-ai-assistants'],
            [CHECKS.dataCentre, 'block-datacenter-except-agent-paths'],
        ] as const) {
            it(`${id} fails when every safe path is ${what}`, async () => {
                const outcome = await run(id, {
                    rule,
                    edit: (s) => {
                        safeLeaves(s).forEach(mutate);
                        return s;
                    },
                });
                assert.equal(outcome.status, 'fail');
                assert.match(outcome.detail ?? '', /safe path/);
            });
        }
    }
});

describe('p11 UA regexes are compared in full', () => {
    const exemptionAlts = (s: any): any[] => s.AndStatement.Statements[1].NotStatement.Statement.OrStatement.Statements;
    const allowlist = (alts: any[]): any =>
        alts.find((a: any) => a.RegexMatchStatement?.RegexString.includes('chatgpt-user'));
    for (const [what, mutate] of [
        [
            'bytespider is appended to the allowlist',
            (alts: any[]) => {
                const r = allowlist(alts).RegexMatchStatement;
                r.RegexString = r.RegexString.replace(/\)$/, '|bytespider)');
            },
        ],
        [
            'a declared token is dropped from the allowlist',
            (alts: any[]) => {
                const r = allowlist(alts).RegexMatchStatement;
                r.RegexString = r.RegexString.replace('|gptbot', '');
            },
        ],
        [
            'the in-app browser regex gains a token',
            (alts: any[]) => {
                const fb = alts.find((a: any) =>
                    a.RegexMatchStatement?.RegexString.includes('fban/')
                ).RegexMatchStatement;
                fb.RegexString = fb.RegexString.replace(/\)$/, '|okhttp)');
            },
        ],
    ] as const) {
        it(`fails when ${what}`, async () => {
            const outcome = await run(CHECKS.nonBrowser, {
                rule: 'block-nonbrowser-except-ai-assistants',
                edit: (s) => {
                    mutate(exemptionAlts(s));
                    return s;
                },
            });
            assert.equal(outcome.status, 'fail', outcome.detail);
        });
    }

    it('passes with the allowlist extended by exactly the pending script tokens', async () => {
        const outcome = await run(CHECKS.nonBrowser, {
            rule: 'block-nonbrowser-except-ai-assistants',
            edit: (s) => {
                const r = allowlist(exemptionAlts(s)).RegexMatchStatement;
                r.RegexString = r.RegexString.replace(
                    /\)$/,
                    `|${CF_ACL.nonBrowser.pendingUaAllowTokens.tokens.join('|')})`
                );
                return s;
            },
        });
        assert.equal(outcome.status, 'pass', outcome.detail);
    });
});

describe('managed groups carry no legacy ExcludedRules', () => {
    for (const [acl, name] of [
        ['cf', 'AWS-AWSManagedRulesCommonRuleSet'],
        ['alb', 'AWS-AWSManagedRulesKnownBadInputsRuleSet'],
        ['alb', 'AWS-AWSManagedRulesCommonRuleSet'],
    ] as const) {
        it(`fails when ${acl} ${name} excludes a rule`, async () => {
            const rules = acl === 'cf' ? cfAclRules() : albAclRules();
            const mrg = rules.find((r: any) => r.Name === name).Statement.ManagedRuleGroupStatement;
            mrg.ExcludedRules = [{ Name: 'SizeRestrictions_QUERYSTRING' }];
            const id = acl === 'cf' ? 'waf-config.cf.rules' : 'waf-config.alb.rules';
            const handlers = acl === 'cf' ? cfAclHandlers(rules) : albAclHandlers(rules);
            const outcome = await check(id).run(offlineCtx(new FakeAws(handlers)));
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', /ExcludedRules/);
        });
    }
});

describe('a rule named for an AWS managed group runs that group', () => {
    for (const [acl, name, other] of [
        ['cf', 'AWS-AWSManagedRulesCommonRuleSet', 'AWSManagedRulesKnownBadInputsRuleSet'],
        ['alb', 'AWS-AWSManagedRulesAmazonIpReputationList', 'AWSManagedRulesKnownBadInputsRuleSet'],
        ['alb', 'AWS-AWSManagedRulesKnownBadInputsRuleSet', 'AWSManagedRulesAmazonIpReputationList'],
    ] as const) {
        it(`fails when ${acl} ${name} runs ${other}`, async () => {
            const rules = acl === 'cf' ? cfAclRules() : albAclRules();
            rules.find((r: any) => r.Name === name).Statement.ManagedRuleGroupStatement.Name = other;
            const id = acl === 'cf' ? 'waf-config.cf.rules' : 'waf-config.alb.rules';
            const handlers = acl === 'cf' ? cfAclHandlers(rules) : albAclHandlers(rules);
            const outcome = await check(id).run(offlineCtx(new FakeAws(handlers)));
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', new RegExp(`${name} Statement\\.ManagedRuleGroupStatement\\.Name`));
        });
    }
});
