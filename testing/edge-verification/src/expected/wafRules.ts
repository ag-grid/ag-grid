import { SECRET } from '../core/redact';
import {
    ACCOUNT_ID,
    ALB_ACL,
    CF_ACL,
    type IpSetExpectation,
    type ManagedGroupExpectation,
    type RuleExpectation,
} from './edge';

/**
 * Every rule on both web ACLs, and each ACL's own settings, as get-web-acl returns them (without
 * Priority, which the rule order covers). Built from the declarations in edge.ts, so each value is
 * declared once; waf-config.*.rules compares every field of every live rule with these.
 *
 * Verify-header secrets are never declared: their SearchString is SECRET, and the live one is
 * replaced by SECRET before comparing (the secret checks compare the values in memory).
 */

// ---- statement builders (the CLI's wire format: SearchString base64-encoded) ---------------

const b64 = (s: string): string => Buffer.from(s).toString('base64');
const fieldToMatch = (field: string): any =>
    field.startsWith('header:') ? { SingleHeader: { Name: field.slice(7) } } : { [field]: {} };
const transformations = (types: string[]): any[] => types.map((Type, Priority) => ({ Priority, Type }));

export const byte = (field: string, positional: string, value: string, transforms = ['NONE']): any => ({
    ByteMatchStatement: {
        SearchString: b64(value),
        FieldToMatch: fieldToMatch(field),
        TextTransformations: transformations(transforms),
        PositionalConstraint: positional,
    },
});
export const regex = (field: string, value: string, transforms: string[]): any => ({
    RegexMatchStatement: {
        RegexString: value,
        FieldToMatch: fieldToMatch(field),
        TextTransformations: transformations(transforms),
    },
});
export const label = (key: string): any => ({ LabelMatchStatement: { Scope: 'LABEL', Key: key } });
export const or = (...statements: any[]): any => ({ OrStatement: { Statements: statements } });
export const and = (...statements: any[]): any => ({ AndStatement: { Statements: statements } });
export const not = (statement: any): any => ({ NotStatement: { Statement: statement } });

export const ipSetArn = (set: IpSetExpectation): string =>
    `arn:aws:wafv2:${CF_ACL.region}:${ACCOUNT_ID}:global/ipset/${set.name}/${set.id}`;
const ipset = (set: IpSetExpectation): any => ({ IPSetReferenceStatement: { ARN: ipSetArn(set) } });

const action = (a: string): any => ({ [a]: {} });
const blockWith = (body: string): any => ({
    Block: { CustomResponse: { ResponseCode: 403, CustomResponseBodyKey: body } },
});
const visibility = (metric: string): any => ({
    SampledRequestsEnabled: true,
    CloudWatchMetricsEnabled: true,
    MetricName: metric,
});

/** A rule from its RuleExpectation: the action (or a rule group's OverrideAction) and metric as declared. */
function rule(exp: RuleExpectation, statement: any, extra: any = {}): any {
    return {
        Name: exp.name,
        Statement: statement,
        ...(exp.action === 'None' ? { OverrideAction: { None: {} } } : { Action: action(exp.action) }),
        // A managed group's metric is its rule name.
        VisibilityConfig: visibility(exp.metricName ?? exp.name),
        ...extra,
    };
}

/** A managed group, its overrides as declared (the pending ones left out: see waf-config.*.rules). */
function managed(exp: RuleExpectation, group: ManagedGroupExpectation, extra: any = {}): any {
    const overrides = group.overrides.map((o) => ({ Name: o.name, ActionToUse: action(o.action) }));
    return rule(exp, {
        ManagedRuleGroupStatement: {
            VendorName: 'AWS',
            Name: exp.name.replace(/^AWS-/, ''),
            ...extra,
            ...(overrides.length ? { RuleActionOverrides: overrides } : {}),
        },
    });
}

// ---- cloudfront-web-acl ----------------------------------------------------------------------

const nb = CF_ACL.nonBrowser;

const p11Safe = (): any[] => [
    ...nb.safePathRegexes.map((r) => regex('UriPath', r, ['NONE'])),
    ...nb.safePathPrefixes.map((p) => byte('UriPath', 'STARTS_WITH', p)),
];
const markdownAccept = (): any =>
    byte('header:accept', 'CONTAINS', nb.markdownAcceptExemption, nb.markdownAcceptTransforms);

/** p11's UA allowlist regex, as deployed or after extend-p11-agent-allowlist.sh (which appends, in its order). */
export const allowlistRegex = (extended: boolean): string =>
    `(${[...nb.uaAllowTokens, ...(extended ? nb.pendingUaAllowTokens.tokens : [])].join('|')})`;

function p11Statement(extended: boolean): any {
    return and(
        or(...nb.triggerLabels.map(label)),
        not(
            or(
                regex('header:user-agent', allowlistRegex(extended), ['LOWERCASE']),
                ...nb.exemptLabels.map(label),
                ...nb.otherUaRegexes.map((r) => regex('header:user-agent', r, ['LOWERCASE'])),
                and(regex('header:user-agent', nb.saliencebotUaRegex, ['LOWERCASE']), ipset(nb.saliencebotIpSet)),
                markdownAccept()
            )
        ),
        not(or(...p11Safe()))
    );
}

function assetScopeDown(): any {
    return not(
        or(
            ...CF_ACL.assetScopeDownPrefixes.map((p) => byte('UriPath', 'STARTS_WITH', p, ['LOWERCASE'])),
            regex('UriPath', CF_ACL.assetScopeDownRegex, ['LOWERCASE'])
        )
    );
}

function rateStatement(r: (typeof CF_ACL.rateRules)[number]): any {
    const scope = r.assetScopeDown
        ? assetScopeDown()
        : (r as any).scopeDown === 'nonbrowser-safe-paths'
          ? and(or(...nb.triggerLabels.map(label)), or(...nb.safePathRegexes.map((x) => regex('UriPath', x, ['NONE']))))
          : undefined;
    return {
        RateBasedStatement: {
            Limit: r.limit,
            EvaluationWindowSec: r.window,
            AggregateKeyType: 'IP',
            ...(scope ? { ScopeDownStatement: scope } : {}),
        },
    };
}

/** What each CF rule may be: its deployed form first, then any form a pending script leaves it in. */
export interface DeclaredRule {
    variants: Array<{ rule: any; pending?: string }>;
}

function cfStatements(): Record<string, (exp: RuleExpectation) => DeclaredRule['variants']> {
    const one = (rule: any): DeclaredRule['variants'] => [{ rule }];
    const groups = CF_ACL.managedGroups;
    const out: Record<string, (exp: RuleExpectation) => DeclaredRule['variants']> = {};
    for (const v of CF_ACL.verifyHeaderRules) {
        const secret = byte(`header:${v.header}`, 'EXACTLY', SECRET);
        out[v.rule] = (exp) =>
            one(rule(exp, v.pathPrefix ? and(secret, byte('UriPath', 'STARTS_WITH', v.pathPrefix)) : secret));
    }
    Object.assign(out, {
        'allow-internal-ec2': (exp: RuleExpectation) => one(rule(exp, ipset(CF_ACL.buildServerIpSet))),
        'allow-mta-sts-policy': (exp: RuleExpectation) =>
            one(
                rule(
                    exp,
                    and(
                        byte('header:host', 'EXACTLY', CF_ACL.mtaSts.host, CF_ACL.mtaSts.transforms),
                        byte('UriPath', 'EXACTLY', CF_ACL.mtaSts.path, CF_ACL.mtaSts.transforms)
                    )
                )
            ),
        'AWS-AWSManagedRulesAmazonIpReputationList': (exp: RuleExpectation) => one(managed(exp, groups[exp.name])),
        'AWS-AWSManagedRulesCommonRuleSet': (exp: RuleExpectation) =>
            one(
                managed(exp, groups[exp.name], {
                    ScopeDownStatement: not(
                        or(
                            ...CF_ACL.commonRuleSetExemptions.map((e) =>
                                byte('UriPath', 'STARTS_WITH', e.prefix, e.transforms)
                            )
                        )
                    ),
                })
            ),
        'AWS-AWSManagedRulesKnownBadInputsRuleSet': (exp: RuleExpectation) => one(managed(exp, groups[exp.name])),
        'AWS-AWSManagedRulesAntiDDoSRuleSet': (exp: RuleExpectation) =>
            one(
                managed(exp, groups[exp.name], {
                    ManagedRuleGroupConfigs: [
                        {
                            AWSManagedRulesAntiDDoSRuleSet: {
                                ClientSideActionConfig: {
                                    Challenge: {
                                        UsageOfAction: CF_ACL.antiDdos.challenge,
                                        Sensitivity: CF_ACL.antiDdos.sensitivity,
                                        ExemptUriRegularExpressions: [{ RegexString: CF_ACL.antiDdos.exemptUriRegex }],
                                    },
                                },
                                SensitivityToBlock: CF_ACL.antiDdos.sensitivityToBlock,
                            },
                        },
                    ],
                })
            ),
        'AWS-AWSManagedRulesBotControlRuleSet': (exp: RuleExpectation) =>
            one(
                managed(exp, groups[exp.name], {
                    ManagedRuleGroupConfigs: [
                        { AWSManagedRulesBotControlRuleSet: { InspectionLevel: CF_ACL.botControl.inspectionLevel } },
                    ],
                })
            ),
        'block-credential-scanner-paths': (exp: RuleExpectation) =>
            one(rule(exp, regex('UriPath', CF_ACL.credentialScanner.regex, CF_ACL.credentialScanner.transforms))),
        'block-nonbrowser-except-ai-assistants': (exp: RuleExpectation) => [
            { rule: rule(exp, p11Statement(false), { Action: blockWith(nb.customBody) }) },
            {
                rule: rule(exp, p11Statement(true), { Action: blockWith(nb.customBody) }),
                pending: nb.pendingUaAllowTokens.pending,
            },
        ],
        // move-datacenter-block-after-agent-exemptions.sh: p11's safe paths, and p11's Accept exemption
        // only on the paths the origin negotiates, copied.
        'block-datacenter-except-agent-paths': (exp: RuleExpectation) =>
            one(
                rule(
                    exp,
                    and(
                        label(CF_ACL.dataCentreLabel),
                        not(
                            or(
                                ...CF_ACL.dataCentreVerifiedLabels.map(label),
                                and(
                                    markdownAccept(),
                                    or(...CF_ACL.dataCentreMarkdownPaths.map((r) => regex('UriPath', r, ['NONE'])))
                                )
                            )
                        ),
                        not(or(...p11Safe()))
                    ),
                    { Action: blockWith(nb.customBody) }
                )
            ),
        // extend-p11-agent-allowlist.sh: scoped to the extended allowlist regex it writes into p11.
        'count-allowlisted-agents-rate': (exp: RuleExpectation) =>
            one(
                rule(exp, {
                    RateBasedStatement: {
                        Limit: nb.allowlistedAgentsRate.limit,
                        EvaluationWindowSec: nb.allowlistedAgentsRate.window,
                        AggregateKeyType: 'IP',
                        ScopeDownStatement: regex('header:user-agent', allowlistRegex(true), ['LOWERCASE']),
                    },
                })
            ),
        'challenge-automated-browser-documents': (exp: RuleExpectation) => {
            const c = CF_ACL.automatedBrowserChallenge;
            return one(
                rule(exp, and(label(c.label), not(regex('UriPath', c.exemptRegex, c.exemptTransforms))), {
                    ChallengeConfig: { ImmunityTimeProperty: { ImmunityTime: c.immunity } },
                })
            );
        },
    });
    for (const r of CF_ACL.rateRules) {
        out[r.name] = (exp) =>
            one(
                rule(exp, rateStatement(r), {
                    ...(r.customBody ? { Action: blockWith(r.customBody) } : {}),
                    ...(r.immunity ? { CaptchaConfig: { ImmunityTimeProperty: { ImmunityTime: r.immunity } } } : {}),
                })
            );
    }
    return out;
}

function albStatements(): Record<string, (exp: RuleExpectation) => DeclaredRule['variants']> {
    const one = (rule: any): DeclaredRule['variants'] => [{ rule }];
    const groups = ALB_ACL.managedGroups;
    const shape = ALB_ACL.rateRuleShape;
    const rate = (exp: RuleExpectation): any =>
        rule(exp, {
            RateBasedStatement: {
                Limit: (ALB_ACL.rateLimits as Record<string, number>)[exp.name],
                EvaluationWindowSec: shape.evaluationWindowSec,
                AggregateKeyType: shape.aggregateKeyType,
                ScopeDownStatement: not(byte('UriPath', 'STARTS_WITH', shape.scopeDownExemptPrefix)),
            },
        });
    return {
        'block-non-cloudfront-origin': (exp) =>
            one(rule(exp, not(byte(`header:${ALB_ACL.originVerifyHeader}`, 'EXACTLY', SECRET)))),
        'AWS-AWSManagedRulesAmazonIpReputationList': (exp) => one(managed(exp, groups[exp.name])),
        'AWS-AWSManagedRulesKnownBadInputsRuleSet': (exp) => one(managed(exp, groups[exp.name])),
        'AWS-AWSManagedRulesCommonRuleSet': (exp) =>
            one(
                managed(exp, groups[exp.name], {
                    ScopeDownStatement: not(byte('UriPath', 'STARTS_WITH', ALB_ACL.commonRuleSetExemptPrefix)),
                })
            ),
        'soft-rate-limit-rule-with-captcha': (exp) => one(rate(exp)),
        'hard-rate-limit-rule-with-blocking': (exp) => one(rate(exp)),
    };
}

function declare(
    expectations: RuleExpectation[],
    statements: Record<string, (exp: RuleExpectation) => DeclaredRule['variants']>
): Map<string, DeclaredRule> {
    return new Map(
        expectations.map((exp) => {
            const build = statements[exp.name];
            if (!build) {
                throw new Error(`no declared statement for rule ${exp.name}`);
            }
            return [exp.name, { variants: build(exp) }];
        })
    );
}

export const cfDeclaredRules = (): Map<string, DeclaredRule> => declare(CF_ACL.rules, cfStatements());
export const albDeclaredRules = (): Map<string, DeclaredRule> => declare(ALB_ACL.rules, albStatements());

// ---- ACL settings ------------------------------------------------------------------------------

/**
 * Everything get-web-acl returns besides the rules, minus the fields left unpinned (ACL_UNPINNED).
 * A field not listed here, such as a ChallengeConfig or an AssociationConfig body-size limit, is
 * expected to be absent.
 */
export function cfAclSettings(): any {
    return {
        DefaultAction: action(CF_ACL.defaultAction),
        Description: '',
        VisibilityConfig: visibility(CF_ACL.visibilityMetric),
        ManagedByFirewallManager: false,
        RetrofittedByFirewallManager: false,
        CustomResponseBodies: Object.fromEntries(
            Object.entries(CF_ACL.customBodies).map(([k, v]) => [k, { ContentType: v.contentType, Content: v.content }])
        ),
        CaptchaConfig: { ImmunityTimeProperty: { ImmunityTime: CF_ACL.captchaImmunity } },
        TokenDomains: CF_ACL.tokenDomains,
        OnSourceDDoSProtectionConfig: CF_ACL.onSourceDDoSProtection,
    };
}

export function albAclSettings(): any {
    return {
        DefaultAction: action(ALB_ACL.defaultAction),
        Description: '',
        VisibilityConfig: visibility(ALB_ACL.visibilityMetric),
        ManagedByFirewallManager: false,
        RetrofittedByFirewallManager: false,
        OnSourceDDoSProtectionConfig: ALB_ACL.onSourceDDoSProtection,
    };
}

/**
 * Not compared: Name, Id and ARN identify the ACL the suite fetched; Capacity and LabelNamespace
 * follow from the rules and the name; ApplicationConfig is console metadata (application category,
 * traffic source) that AWS does not evaluate.
 */
export const ACL_UNPINNED = ['Rules', 'Name', 'Id', 'ARN', 'Capacity', 'LabelNamespace', 'ApplicationConfig'];
