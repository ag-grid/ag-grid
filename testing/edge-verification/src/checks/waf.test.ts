import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { CheckDef, Outcome } from '../core/types';
import { FakeAws, cfAclHandlers, cfAclRules, cfAclRulesWithAgentAllowlist, offlineCtx } from '../testing/fakes';
import { wafChecks } from './waf';

const CHECKS = {
    verifyHeaders: 'waf-config.cf.verify-header-rules',
    mtaSts: 'waf-config.cf.mta-sts',
    commonRuleSet: 'waf-config.cf.common-rule-set',
    nonBrowser: 'waf-config.cf.nonbrowser-rule',
    dataCentre: 'waf-config.cf.rule.block-datacenter-except-agent-paths',
    browserChallenge: 'waf-config.cf.automated-browser-challenge',
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
});
