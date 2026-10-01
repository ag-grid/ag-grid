import { decodeSearchString } from '../core/live';
import type { Live } from '../core/live';
import { describeSecret } from '../core/redact';
import { type CheckDef, Problems, fail, pass } from '../core/types';
import {
    type Leaf,
    andOf,
    andOfLeaves,
    anyOfLeaves,
    anyPathLeafMatches,
    leafOf,
    leaves,
    noneOfAlternatives,
    noneOfLeaves,
    regexLeafMatches,
    ruleAction,
} from '../core/waf';
import { ALB, ALB_ACL, CF_ACL, LOG_RETENTION_PENDING, type RuleExpectation } from '../expected/edge';
import { finding } from '../expected/lifecycle';

const sorted = (xs: string[]): string[] => [...xs].sort();
const SHIELD_PRIORITY = 10000000;

async function cfRule(live: Live, name: string): Promise<any> {
    const rule = (await live.cfAcl()).Rules.find((r: any) => r.Name === name);
    if (!rule) {
        throw new Error(`rule ${name} not found on ${CF_ACL.name}`);
    }
    return rule;
}

function compareRuleList(p: Problems, liveRules: any[], expected: RuleExpectation[]): void {
    const ordered = [...liveRules].sort((a, b) => a.Priority - b.Priority).filter((r) => r.Priority < SHIELD_PRIORITY);
    const pending = new Set(expected.filter((e) => e.pending).map((e) => e.name));
    const deployed = expected.filter((e) => !e.pending);
    p.eq(
        'rule order (pending rules excluded)',
        ordered.map((r) => r.Name).filter((n) => !pending.has(n)),
        deployed.map((e) => e.name)
    );
    for (const e of deployed) {
        const r = ordered.find((x) => x.Name === e.name);
        if (!r) {
            continue;
        }
        p.eq(`${e.name} action`, ruleAction(r), e.action);
        if (e.metricName) {
            p.eq(`${e.name} metric`, r.VisibilityConfig?.MetricName, e.metricName);
        }
    }
    const shield = liveRules.filter((r) => r.Priority === SHIELD_PRIORITY);
    p.check(
        shield.length === 1 && String(shield[0].Name).startsWith('ShieldMitigationRuleGroup_'),
        'Shield mitigation group missing at priority 10000000'
    );
}

function loggingChecks(
    prefix: string,
    aclName: string,
    getArn: (live: Live) => Promise<string>,
    region: string,
    cfg: typeof CF_ACL.logging
): CheckDef[] {
    return [
        {
            id: `waf-config.${prefix}.logging`,
            area: 'waf-config',
            title: `${aclName} logs to ${cfg.logGroup}`,
            refs: [finding(1)],
            async run({ live }) {
                const l = await live.loggingConfig(await getArn(live), region);
                if (!l) {
                    return fail('no logging configuration');
                }
                const p = new Problems();
                p.eq('destination', l.LogDestinationConfigs, [cfg.destination]);
                return p.outcome();
            },
        },
        {
            id: `waf-config.${prefix}.logging.redaction`,
            area: 'waf-config',
            title: `${aclName} log redacts every verify header (${cfg.redactedHeaders.join(', ')})`,
            refs: [finding(1)],
            pending: cfg.redactionPending,
            async run({ live }) {
                const l = await live.loggingConfig(await getArn(live), region);
                const redacted = (l?.RedactedFields ?? [])
                    .map((f: any) => f.SingleHeader?.Name?.toLowerCase())
                    .filter(Boolean);
                const missing = cfg.redactedHeaders.filter((h) => !redacted.includes(h));
                return missing.length ? fail(`not redacted: ${missing.join(', ')}`) : pass();
            },
        },
        {
            id: `waf-config.${prefix}.log-retention`,
            area: 'waf-config',
            title: `${cfg.logGroup} has a retention period (does not keep logged secrets forever)`,
            refs: [finding(1)],
            pending: LOG_RETENTION_PENDING,
            async run({ aws }) {
                const r = await aws.call(
                    'logs',
                    'describe-log-groups',
                    ['--log-group-name-prefix', cfg.logGroup],
                    region
                );
                const g = (r.logGroups ?? []).find((x: any) => x.logGroupName === cfg.logGroup);
                if (!g) {
                    return fail('log group not found');
                }
                const gb = (g.storedBytes / 1e9).toFixed(0);
                return g.retentionInDays
                    ? pass(`${g.retentionInDays} days, ${gb} GB`)
                    : fail(`never expires (${gb} GB stored)`);
            },
        },
    ];
}

const aclArn = (acl: any): string => acl.ARN;

/**
 * p11's three clauses, read in the one shape that means "block a non-browser trigger unless it is
 * exempt or on a safe path": AND(any trigger, NOT(any exemption), NOT(any safe path)).
 */
/**
 * p11 as AND(any trigger label, NOT(any exemption), NOT(any safe path)). An exemption is a single
 * condition (`exemptions`) or an AND of conditions (`exemptionAnds`, e.g. the saliencebot UA from
 * its IP set).
 */
function p11Parts(
    rule: any
): { trigger: Leaf[]; exemptions: Leaf[]; exemptionAnds: Leaf[][]; safe: Leaf[] } | undefined {
    const parts = andOf(rule.Statement);
    if (parts?.length !== 3) {
        return undefined;
    }
    const trigger = anyOfLeaves(parts[0]);
    const exemptions = noneOfAlternatives(parts[1]);
    const safe = noneOfLeaves(parts[2]);
    return trigger && exemptions && safe
        ? { trigger, exemptions: exemptions.leaves, exemptionAnds: exemptions.ands, safe }
        : undefined;
}

/**
 * Where a pending inserted rule must sit: after `exp.after`, with only other pending rules that
 * follow the same rule in between. Two scripts that each insert straight after p11 therefore pass
 * in either order. Returns the problem, if any.
 */
export function pendingSiblingOrder(sortedRules: any[], exp: RuleExpectation): string | undefined {
    const names = sortedRules.map((r: any) => r.Name as string);
    const i = names.indexOf(exp.name);
    const a = names.indexOf(exp.after ?? '');
    if (a < 0) {
        return `${exp.after} not found`;
    }
    if (i < a) {
        return `${exp.name} (priority ${sortedRules[i].Priority}) is before ${exp.after}`;
    }
    const siblings = new Set(
        CF_ACL.rules.filter((r) => r.pending && r.after === exp.after && r.name !== exp.name).map((r) => r.name)
    );
    const others = names.slice(a + 1, i).filter((n) => !siblings.has(n));
    return others.length ? `between ${exp.after} and ${exp.name}: ${others.join(', ')}` : undefined;
}

/** The p11 user-agent allowlist regex (the UA regex that admits chatgpt-user), or undefined. */
function p11UaAllowlist(p11: any): Extract<Leaf, { kind: 'regex' }> | undefined {
    const e = p11Parts(p11)?.exemptions ?? [];
    return e.find(
        (l): l is Extract<Leaf, { kind: 'regex' }> =>
            l.kind === 'regex' && l.field === 'header:user-agent' && regexLeafMatches(l, 'chatgpt-user')
    );
}

/** The statement each pending inserted rule must have: the shape its script builds. */
const PENDING_RULE_SHAPES: Record<
    string,
    { refs: string[]; check: (rule: any, live: Live, p: Problems) => Promise<void> }
> = {
    'block-datacenter-except-agent-paths': {
        refs: [finding(5)],
        // AND(data-centre label, NOT(any verified bot or Accept: text/markdown), NOT(any p11 safe
        // path)): the shape move-datacenter-block-after-agent-exemptions.sh builds.
        async check(rule, live, p) {
            const parts = andOf(rule.Statement);
            const label = parts?.length === 3 ? leafOf(parts[0]) : undefined;
            const exempt = parts?.length === 3 ? noneOfLeaves(parts[1]) : undefined;
            const safe = parts?.length === 3 ? noneOfLeaves(parts[2]) : undefined;
            const p11 = p11Parts(await cfRule(live, 'block-nonbrowser-except-ai-assistants'));
            const p11Safe = p11?.safe;
            if (!label || !exempt || !safe || !p11Safe) {
                p.add(`statement is not AND(label, NOT(exemptions), NOT(safe paths))${p11Safe ? '' : ' (nor is p11)'}`);
                return;
            }
            const pathValues = (ls: Leaf[]) => ls.map((l) => ('field' in l ? `${l.field} ${l.value}` : l.value));
            p.eq('safe paths (same as p11)', sorted(pathValues(safe)), sorted(pathValues(p11Safe)));
            p.check(
                label.kind === 'label' && label.value.endsWith('signal:known_bot_data_center'),
                'does not match the known_bot_data_center label'
            );
            // Exactly the verified-bot labels (matched as labels, not namespaces) and p11's own
            // Accept: text/markdown condition: losing a label blocks verified crawlers on data-centre IPs.
            const labels = exempt.filter((l) => l.kind === 'label');
            p.eq(
                'verified-bot exemption statement labels',
                sorted(labels.map((l) => l.value)),
                sorted(CF_ACL.dataCentreVerifiedLabels)
            );
            p.check(
                labels.every((l) => l.scope === 'LABEL'),
                'verified-bot exemption statement matches a namespace, not the label'
            );
            const p11Accept = p11?.exemptions.filter((l) => l.kind === 'byte' && l.field === 'header:accept');
            const accept = exempt.filter((l) => l.kind !== 'label');
            p.check(
                p11Accept?.length === 1 &&
                    accept.length === 1 &&
                    JSON.stringify(accept[0]) === JSON.stringify(p11Accept[0]) &&
                    accept[0].kind === 'byte' &&
                    accept[0].value === CF_ACL.nonBrowser.markdownAcceptExemption,
                `exemption statement's non-label part is not p11's Accept: ${CF_ACL.nonBrowser.markdownAcceptExemption} condition alone`
            );
            p.eq('custom body', rule.Action?.Block?.CustomResponse?.CustomResponseBodyKey, 'automated-access-blocked');
        },
    },
    'count-allowlisted-agents-rate': {
        refs: [finding(6), finding(7), 'SE-184'],
        // RateBased(IP, 600 / 300 s, scope-down = p11's UA allowlist regex, same transforms), Count.
        async check(rule, live, p) {
            const exp = CF_ACL.nonBrowser.allowlistedAgentsRate;
            const rate = rule.Statement?.RateBasedStatement;
            if (!rate) {
                p.add('statement is not a RateBasedStatement');
                return;
            }
            p.eq('limit', rate.Limit, exp.limit);
            p.eq('window', rate.EvaluationWindowSec, exp.window);
            p.eq('aggregate key', rate.AggregateKeyType, 'IP');
            const scope = leafOf(rate.ScopeDownStatement);
            const p11Regex = p11UaAllowlist(await cfRule(live, 'block-nonbrowser-except-ai-assistants'));
            if (!scope || scope.kind !== 'regex' || scope.field !== 'header:user-agent') {
                p.add('scope-down is not a single user-agent RegexMatch');
            } else if (!p11Regex) {
                p.add('p11 has no user-agent allowlist regex to compare with');
            } else {
                p.eq('scope-down regex (same as p11)', scope.value, p11Regex.value);
                p.eq('scope-down transforms (same as p11)', scope.transforms, p11Regex.transforms);
            }
        },
    },
};

export function wafChecks(): CheckDef[] {
    const nb = CF_ACL.nonBrowser;
    return [
        {
            id: 'waf-config.cf.acl',
            area: 'waf-config',
            title: `${CF_ACL.name}: default Allow, token domain, CAPTCHA immunity, custom 403 body`,
            async run({ live }) {
                const acl = await live.cfAcl();
                const p = new Problems();
                p.eq('default action', Object.keys(acl.DefaultAction ?? {})[0], CF_ACL.defaultAction);
                p.eq('token domains', acl.TokenDomains, CF_ACL.tokenDomains);
                p.eq('CAPTCHA immunity', acl.CaptchaConfig?.ImmunityTimeProperty?.ImmunityTime, CF_ACL.captchaImmunity);
                for (const [key, exp] of Object.entries(CF_ACL.customBodies)) {
                    const body = acl.CustomResponseBodies?.[key];
                    if (!body) {
                        p.add(`custom body ${key} missing`);
                        continue;
                    }
                    p.eq(`${key} content type`, body.ContentType, exp.contentType);
                    for (const text of exp.mustContain) {
                        p.check(body.Content.includes(text), `${key} body lacks "${text}"`);
                    }
                }
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.rules',
            area: 'waf-config',
            title: `${CF_ACL.name}: rule order, actions and metric names as declared`,
            refs: [finding(5), 'SE-185', 'SE-184'],
            async run({ live }) {
                const p = new Problems();
                compareRuleList(p, (await live.cfAcl()).Rules, CF_ACL.rules);
                return p.outcome(`${CF_ACL.rules.filter((r) => !r.pending).length} rules + Shield`);
            },
        },
        ...CF_ACL.rules
            .filter((r) => r.pending)
            .map((exp): CheckDef => ({
                id: `waf-config.cf.rule.${exp.name}`,
                area: 'waf-config',
                title: `${exp.name} present after ${exp.after} (only other pending inserts between), ${exp.action}`,
                refs: PENDING_RULE_SHAPES[exp.name]?.refs ?? [finding(5)],
                pending: exp.pending,
                async run({ live }) {
                    const rules = [...(await live.cfAcl()).Rules].sort((a: any, b: any) => a.Priority - b.Priority);
                    const i = rules.findIndex((r: any) => r.Name === exp.name);
                    if (i < 0) {
                        return fail('rule not present');
                    }
                    const p = new Problems();
                    const between = pendingSiblingOrder(rules, exp);
                    if (between) {
                        p.add(between);
                    }
                    p.eq('action', ruleAction(rules[i]), exp.action);
                    p.eq('metric', rules[i].VisibilityConfig?.MetricName, exp.metricName);
                    const shape = PENDING_RULE_SHAPES[exp.name];
                    if (!shape) {
                        p.add(`no statement check declared for ${exp.name}`);
                    } else {
                        await shape.check(rules[i], live, p);
                    }
                    return p.outcome(`priority ${rules[i].Priority}`);
                },
            })),
        {
            id: 'waf-config.cf.verify-header-rules',
            area: 'waf-config',
            title: 'Shared-secret Allow rules match their verify header EXACTLY (values never printed)',
            refs: [finding(1)],
            async run({ live }) {
                const p = new Problems();
                const lengths: string[] = [];
                for (const exp of CF_ACL.verifyHeaderRules) {
                    // The header alone, or the header AND the path prefix: never an OR, which would
                    // Allow anything on the path (or anything with the header) past every later rule.
                    const stmt = (await cfRule(live, exp.rule)).Statement;
                    const single = leafOf(stmt);
                    const ls = exp.pathPrefix ? andOfLeaves(stmt) : single && [single];
                    if (!ls || ls.length !== (exp.pathPrefix ? 2 : 1)) {
                        p.add(
                            `${exp.rule}: statement is not ${exp.pathPrefix ? 'AND(header, path prefix)' : 'the header match alone'}`
                        );
                        continue;
                    }
                    const secret = ls.find((l) => l.kind === 'byte' && l.field === `header:${exp.header}`);
                    if (!secret || secret.kind !== 'byte') {
                        p.add(`${exp.rule}: no ${exp.header} match`);
                        continue;
                    }
                    p.eq(`${exp.rule} positional`, secret.positional, 'EXACTLY');
                    p.check(secret.value.length >= 32, `${exp.rule}: secret is only ${secret.value.length} chars`);
                    lengths.push(`${exp.header} ${describeSecret(secret.value)}`);
                    if (exp.pathPrefix) {
                        p.check(
                            ls.some(
                                (l) =>
                                    l.kind === 'byte' &&
                                    l.field === 'UriPath' &&
                                    l.positional === 'STARTS_WITH' &&
                                    l.value === exp.pathPrefix
                            ),
                            `${exp.rule}: not scoped to ${exp.pathPrefix}`
                        );
                    }
                }
                return p.outcome(lengths.join(', '));
            },
        },
        {
            id: 'waf-config.cf.verify-secrets-distinct',
            area: 'waf-config',
            title: 'Every shared-secret Allow rule has its own secret',
            refs: [finding(1)],
            knownIssue: `${finding(1)} (p0 allow-trusted-mcp-lambda and p2 allow-seo-bot share one value)`,
            fixedBy: 'secret rotation after redact-waf-log-secrets.sh',
            async run({ live }) {
                const values: Array<[string, string]> = [];
                for (const exp of CF_ACL.verifyHeaderRules) {
                    const l = leaves((await cfRule(live, exp.rule)).Statement).find(
                        (x) => x.kind === 'byte' && x.field === `header:${exp.header}`
                    );
                    values.push([exp.rule, l?.value ?? '']);
                }
                const dupes = values.filter(([, v], i) => values.findIndex(([, w]) => w === v) !== i).map(([n]) => n);
                return dupes.length ? fail(`reuses an earlier rule's secret: ${dupes.join(', ')}`) : pass();
            },
        },
        {
            id: 'waf-config.cf.build-server-ipset',
            area: 'waf-config',
            title: `allow-internal-ec2 IP set holds only ${CF_ACL.buildServerIpSet.addresses.join(', ')}`,
            async run({ live }) {
                const l = leafOf((await cfRule(live, 'allow-internal-ec2')).Statement);
                if (l?.kind !== 'ipset') {
                    return fail('statement is not the IP set reference alone');
                }
                const [, , , , , rest] = l.value.split(':');
                const [, , name, id] = rest.split('/');
                const set = await live.ipSet(name, id, CF_ACL.scope, CF_ACL.region);
                const p = new Problems();
                p.eq('name', set.Name, CF_ACL.buildServerIpSet.name);
                p.eq('addresses', sorted(set.Addresses), sorted(CF_ACL.buildServerIpSet.addresses));
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.mta-sts',
            area: 'waf-config',
            title: 'allow-mta-sts-policy matches host AND path exactly',
            async run({ live }) {
                const ls = andOfLeaves((await cfRule(live, 'allow-mta-sts-policy')).Statement);
                if (ls?.length !== 2) {
                    return fail('statement is not AND(host, path)');
                }
                const p = new Problems();
                p.check(
                    ls.some(
                        (l) =>
                            l.kind === 'byte' &&
                            l.field === 'header:host' &&
                            l.positional === 'EXACTLY' &&
                            l.value === CF_ACL.mtaSts.host
                    ),
                    'host match'
                );
                p.check(
                    ls.some(
                        (l) =>
                            l.kind === 'byte' &&
                            l.field === 'UriPath' &&
                            l.positional === 'EXACTLY' &&
                            l.value === CF_ACL.mtaSts.path
                    ),
                    'path match'
                );
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.common-rule-set',
            area: 'waf-config',
            title: `CommonRuleSet scope-down exempts ${CF_ACL.commonRuleSetExemptPrefixes.join(', ')}`,
            async run({ live }) {
                const s = (await cfRule(live, 'AWS-AWSManagedRulesCommonRuleSet')).Statement.ManagedRuleGroupStatement;
                // NOT(any exempt prefix): without the negation the rule set inspects ONLY those paths.
                const exempt = noneOfLeaves(s.ScopeDownStatement);
                if (!exempt) {
                    return fail('scope-down is not NOT(any of the exempt path prefixes)');
                }
                const p = new Problems();
                p.check(
                    exempt.every((l) => l.kind === 'byte' && l.field === 'UriPath' && l.positional === 'STARTS_WITH'),
                    'scope-down exempts something other than UriPath prefixes'
                );
                p.eq('exempt prefixes', sorted(exempt.map((l) => l.value)), sorted(CF_ACL.commonRuleSetExemptPrefixes));
                p.eq('overrides', s.RuleActionOverrides ?? null, null);
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.anti-ddos',
            area: 'waf-config',
            title: 'AntiDDoS: Challenge ENABLED at HIGH, block sensitivity LOW, exempt regex as declared',
            refs: [finding(7)],
            async run({ live }) {
                const cfg = (await cfRule(live, 'AWS-AWSManagedRulesAntiDDoSRuleSet')).Statement
                    .ManagedRuleGroupStatement.ManagedRuleGroupConfigs?.[0]?.AWSManagedRulesAntiDDoSRuleSet;
                const ch = cfg?.ClientSideActionConfig?.Challenge;
                const p = new Problems();
                p.eq('challenge', ch?.UsageOfAction, CF_ACL.antiDdos.challenge);
                p.eq('sensitivity', ch?.Sensitivity, CF_ACL.antiDdos.sensitivity);
                p.eq('block sensitivity', cfg?.SensitivityToBlock, CF_ACL.antiDdos.sensitivityToBlock);
                p.eq(
                    'exempt regex',
                    ch?.ExemptUriRegularExpressions?.map((r: any) => r.RegexString),
                    [CF_ACL.antiDdos.exemptUriRegex]
                );
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.anti-ddos.agent-paths-exempt',
            area: 'waf-config',
            title: `AntiDDoS challenge exempts agent paths (${CF_ACL.antiDdos.shouldExempt.join(', ')})`,
            refs: [finding(7)],
            knownIssue: `${finding(7)} (regex lacks md, txt, svg and /blog/rss|feed)`,
            async run({ live }) {
                const cfg = (await cfRule(live, 'AWS-AWSManagedRulesAntiDDoSRuleSet')).Statement
                    .ManagedRuleGroupStatement.ManagedRuleGroupConfigs?.[0]?.AWSManagedRulesAntiDDoSRuleSet;
                const regexes: string[] =
                    cfg?.ClientSideActionConfig?.Challenge?.ExemptUriRegularExpressions?.map(
                        (r: any) => r.RegexString
                    ) ?? [];
                const notExempt = CF_ACL.antiDdos.shouldExempt.filter(
                    (path) => !regexes.some((re) => new RegExp(re).test(path))
                );
                return notExempt.length ? fail(`would be challenged during an event: ${notExempt.join(', ')}`) : pass();
            },
        },
        {
            id: 'waf-config.cf.bot-control',
            area: 'waf-config',
            title: 'Bot Control: COMMON inspection, Count overrides exactly as declared',
            refs: [finding(5), finding(10)],
            async run({ live }) {
                const s = (await cfRule(live, 'AWS-AWSManagedRulesBotControlRuleSet')).Statement
                    .ManagedRuleGroupStatement;
                const overrides: any[] = s.RuleActionOverrides ?? [];
                const pending = new Set(CF_ACL.botControl.pendingCountOverrides.map((o) => o.name));
                const p = new Problems();
                p.eq(
                    'inspection level',
                    s.ManagedRuleGroupConfigs?.[0]?.AWSManagedRulesBotControlRuleSet?.InspectionLevel,
                    CF_ACL.botControl.inspectionLevel
                );
                p.eq(
                    'Count overrides (pending excluded)',
                    sorted(
                        overrides
                            .filter((o) => 'Count' in (o.ActionToUse ?? {}) && !pending.has(o.Name))
                            .map((o) => o.Name)
                    ),
                    sorted(CF_ACL.botControl.countOverrides)
                );
                const other = overrides.filter((o) => !('Count' in (o.ActionToUse ?? {})));
                p.check(!other.length, `non-Count overrides: ${other.map((o) => o.Name).join(', ')}`);
                p.eq('scope-down', s.ScopeDownStatement ?? null, null);
                return p.outcome();
            },
        },
        ...CF_ACL.botControl.pendingCountOverrides.map((o): CheckDef => ({
            id: `waf-config.cf.bot-control.${o.name}`,
            area: 'waf-config',
            title: `Bot Control ${o.name} overridden to Count (label kept, blocking moved after p11)`,
            refs: [finding(5)],
            pending: o.pending,
            async run({ live }) {
                const s = (await cfRule(live, 'AWS-AWSManagedRulesBotControlRuleSet')).Statement
                    .ManagedRuleGroupStatement;
                const found = (s.RuleActionOverrides ?? []).find((x: any) => x.Name === o.name);
                return found && 'Count' in found.ActionToUse ? pass() : fail('no Count override');
            },
        })),
        {
            id: 'waf-config.cf.credential-scanner',
            area: 'waf-config',
            title: 'block-credential-scanner-paths: regex as declared, blocks the SE-185 probe set, spares content',
            refs: ['SE-185'],
            async run({ live }) {
                const leaf = leafOf((await cfRule(live, 'block-credential-scanner-paths')).Statement);
                if (leaf?.kind !== 'regex') {
                    return fail('statement is not the regex match alone');
                }
                const p = new Problems();
                p.eq('regex', leaf.value, CF_ACL.credentialScanner.regex);
                p.eq('field', leaf.field, 'UriPath');
                for (const path of CF_ACL.credentialScanner.blocked) {
                    p.check(regexLeafMatches(leaf, path), `does not block ${path}`);
                }
                for (const path of CF_ACL.credentialScanner.allowed) {
                    p.check(!regexLeafMatches(leaf, path), `would block content ${path}`);
                }
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.nonbrowser-rule',
            area: 'waf-config',
            title: 'block-nonbrowser-except-ai-assistants: triggers, UA allowlist, verified labels, markdown exemption, safe paths',
            refs: ['SE-78', 'SE-184', finding(9), finding(10)],
            async run({ live }) {
                const rule = await cfRule(live, 'block-nonbrowser-except-ai-assistants');
                const parts = p11Parts(rule);
                if (!parts) {
                    return fail('statement is not AND(any trigger label, NOT(any exemption), NOT(any safe path))');
                }
                const { trigger: t, exemptions: e, exemptionAnds: ands, safe: s } = parts;
                const p = new Problems();
                p.check(
                    t.every((l) => l.kind === 'label'),
                    'trigger matches something other than labels'
                );
                p.eq('trigger labels', sorted(t.map((l) => l.value)), sorted(nb.triggerLabels));
                const uaRegexes = e.filter((l) => l.kind === 'regex' && l.field === 'header:user-agent') as Array<
                    Extract<Leaf, { kind: 'regex' }>
                >;
                for (const token of nb.uaAllowTokens) {
                    p.check(
                        uaRegexes.some((l) => regexLeafMatches(l, token)),
                        `UA allowlist does not admit "${token}"`
                    );
                }
                for (const ua of nb.otherUaExemptions) {
                    p.check(
                        uaRegexes.some((l) => regexLeafMatches(l, ua)),
                        `UA exemption missing "${ua}"`
                    );
                }
                const labels = e.filter((l) => l.kind === 'label').map((l) => l.value);
                for (const label of nb.exemptLabels) {
                    p.check(labels.includes(label), `exemption label missing: ${label}`);
                }
                // The saliencebot exemption needs both its UA and its IP set (an AND), never the UA alone.
                p.check(
                    ands.some(
                        (and) =>
                            and.some((l) => l.kind === 'ipset' && l.value.includes(`/ipset/${nb.saliencebotIpSet}/`)) &&
                            and.some((l) => l.kind === 'regex' && l.field === 'header:user-agent')
                    ),
                    'saliencebot exemption is not AND(saliencebot UA, salience-bot IP set)'
                );
                p.check(
                    !e.some(
                        (l) =>
                            l.kind === 'regex' && l.field === 'header:user-agent' && regexLeafMatches(l, 'saliencebot')
                    ),
                    'the saliencebot UA is exempt on its own, without the IP set'
                );
                p.check(
                    e.some(
                        (l) =>
                            l.kind === 'byte' &&
                            l.field === 'header:accept' &&
                            l.positional === 'CONTAINS' &&
                            l.value === nb.markdownAcceptExemption
                    ),
                    'Accept: text/markdown exemption missing'
                );
                p.eq(
                    'safe-path regexes',
                    sorted(s.filter((l) => l.kind === 'regex').map((l) => l.value)),
                    sorted(nb.safePathRegexes)
                );
                p.eq(
                    'safe-path prefixes',
                    sorted(s.filter((l) => l.kind === 'byte').map((l) => l.value)),
                    sorted(nb.safePathPrefixes)
                );
                p.eq('response', rule.Action?.Block?.CustomResponse, {
                    ResponseCode: 403,
                    CustomResponseBodyKey: nb.customBody,
                });
                return p.outcome(`${nb.uaAllowTokens.length} UA tokens admitted`);
            },
        },
        {
            id: 'waf-config.cf.nonbrowser-rule.agent-allowlist',
            area: 'waf-config',
            title: `p11 UA allowlist also admits the ${nb.pendingUaAllowTokens.tokens.length} agents extend-p11-agent-allowlist.sh adds, within WAF's regex limit`,
            refs: [finding(6), 'SE-184'],
            pending: nb.pendingUaAllowTokens.pending,
            async run({ live }) {
                const regex = p11UaAllowlist(await cfRule(live, 'block-nonbrowser-except-ai-assistants'));
                if (!regex) {
                    return fail('p11 has no user-agent allowlist regex (the one admitting chatgpt-user)');
                }
                const p = new Problems();
                const missing = nb.pendingUaAllowTokens.tokens.filter((t) => !regexLeafMatches(regex, t));
                p.check(!missing.length, `not admitted: ${missing.join(', ')}`);
                // The pre-existing tokens must survive the edit.
                const lost = nb.uaAllowTokens.filter((t) => !regexLeafMatches(regex, t));
                p.check(!lost.length, `no longer admitted: ${lost.join(', ')}`);
                p.check(
                    regex.value.length <= nb.pendingUaAllowTokens.maxRegexLength,
                    `regex is ${regex.value.length} chars, over ${nb.pendingUaAllowTokens.maxRegexLength}`
                );
                p.eq('transforms', regex.transforms, ['LOWERCASE']);
                return p.outcome(`regex ${regex.value.length} chars`);
            },
        },
        {
            id: 'waf-config.cf.nonbrowser-rule.server-card-safe',
            area: 'waf-config',
            title: `p11 safe paths include ${nb.shouldBeSafe.join(', ')}`,
            refs: ['SE-79', finding(13)],
            knownIssue: `${finding(13)} (server-card.json is not a p11 safe path)`,
            async run({ live }) {
                const safe = p11Parts(await cfRule(live, 'block-nonbrowser-except-ai-assistants'))?.safe;
                if (!safe) {
                    return fail('p11 statement is not AND(triggers, NOT(exemptions), NOT(safe paths))');
                }
                const missing = nb.shouldBeSafe.filter((path) => !anyPathLeafMatches(safe, path));
                return missing.length ? fail(`not safe: ${missing.join(', ')}`) : pass();
            },
        },
        {
            id: 'waf-config.cf.rate-rules',
            area: 'waf-config',
            title: 'Rate rules: limits, 5-minute windows, per-IP, asset scope-down',
            refs: ['waf-finding.md §7', 'infra-new.md'],
            async run({ live }) {
                const p = new Problems();
                for (const exp of CF_ACL.rateRules) {
                    const rule = await cfRule(live, exp.name);
                    const rb = rule.Statement.RateBasedStatement;
                    p.eq(`${exp.name} limit`, rb.Limit, exp.limit);
                    p.eq(`${exp.name} window`, rb.EvaluationWindowSec, exp.window);
                    p.eq(`${exp.name} key`, rb.AggregateKeyType, 'IP');
                    if (exp.assetScopeDown) {
                        // NOT(any asset path): without the negation the limit would count ONLY assets.
                        const ls = noneOfLeaves(rb.ScopeDownStatement);
                        if (!ls) {
                            p.add(`${exp.name}: scope-down is not NOT(any asset path)`);
                            continue;
                        }
                        p.check(
                            ls.some((l) => l.kind === 'regex' && l.value === CF_ACL.assetScopeDownRegex),
                            `${exp.name}: asset regex differs`
                        );
                        for (const prefix of CF_ACL.assetScopeDownPrefixes) {
                            p.check(
                                ls.some((l) => l.kind === 'byte' && l.value === prefix),
                                `${exp.name}: ${prefix} not exempt`
                            );
                        }
                    }
                    if (exp.immunity) {
                        p.eq(
                            `${exp.name} CAPTCHA immunity`,
                            rule.CaptchaConfig?.ImmunityTimeProperty?.ImmunityTime,
                            exp.immunity
                        );
                    }
                    if (exp.customBody) {
                        p.eq(
                            `${exp.name} body`,
                            rule.Action?.Block?.CustomResponse?.CustomResponseBodyKey,
                            exp.customBody
                        );
                    }
                }
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.automated-browser-challenge',
            area: 'waf-config',
            title: 'challenge-automated-browser-documents: automated_browser label, asset/agent paths exempt',
            refs: [finding(7)],
            async run({ live }) {
                const rule = await cfRule(live, 'challenge-automated-browser-documents');
                const exp = CF_ACL.automatedBrowserChallenge;
                const p = new Problems();
                // AND(label, NOT(exempt paths)): an OR, or a lost negation, keeps both leaves but
                // challenges every automated browser or every exempt path instead.
                const parts = andOf(rule.Statement);
                const label = parts?.length === 2 ? leafOf(parts[0]) : undefined;
                const exempt = parts?.length === 2 ? noneOfLeaves(parts[1]) : undefined;
                if (!label || !exempt) {
                    p.add('statement is not AND(label, NOT(exempt path regex))');
                } else {
                    p.check(label.kind === 'label' && label.value === exp.label, 'label match missing');
                    p.check(
                        exempt.length === 1 &&
                            exempt[0].kind === 'regex' &&
                            exempt[0].field === 'UriPath' &&
                            exempt[0].value === exp.exemptRegex,
                        'exempt statement is not the declared UriPath regex'
                    );
                }
                p.eq('immunity', rule.ChallengeConfig?.ImmunityTimeProperty?.ImmunityTime, exp.immunity);
                return p.outcome();
            },
        },
        ...loggingChecks('cf', CF_ACL.name, async (live) => aclArn(await live.cfAcl()), CF_ACL.region, CF_ACL.logging),

        // ---- the ALB's regional ACL -------------------------------------------------------
        {
            id: 'waf-config.alb.rules',
            area: 'waf-config',
            title: `${ALB_ACL.name}: rule order, actions, IpReputation override, CRS scope-down, rate limits`,
            refs: [finding(14)],
            async run({ live }) {
                const acl = await live.albAcl();
                const p = new Problems();
                p.eq('default action', Object.keys(acl.DefaultAction ?? {})[0], ALB_ACL.defaultAction);
                compareRuleList(p, acl.Rules, ALB_ACL.rules);
                const byName = (n: string) => acl.Rules.find((r: any) => r.Name === n);
                const ipRep = byName('AWS-AWSManagedRulesAmazonIpReputationList')?.Statement.ManagedRuleGroupStatement;
                p.eq(
                    'IpReputation overrides',
                    (ipRep?.RuleActionOverrides ?? []).map((o: any) => ({
                        name: o.Name,
                        action: Object.keys(o.ActionToUse)[0],
                    })),
                    ALB_ACL.ipReputationOverrides
                );
                const crs = noneOfLeaves(
                    byName('AWS-AWSManagedRulesCommonRuleSet')?.Statement.ManagedRuleGroupStatement.ScopeDownStatement
                );
                p.check(
                    !!crs?.some((l) => l.kind === 'byte' && l.value === ALB_ACL.commonRuleSetExemptPrefix),
                    'CRS scope-down is not NOT(the exempt prefix)'
                );
                for (const [name, limit] of Object.entries(ALB_ACL.rateLimits)) {
                    p.eq(`${name} limit`, byName(name)?.Statement.RateBasedStatement.Limit, limit);
                }
                return p.outcome();
            },
        },
        {
            id: 'waf-config.alb.origin-verify',
            area: 'waf-config',
            title: `block-non-cloudfront-origin blocks requests without the exact ${ALB_ACL.originVerifyHeader}`,
            refs: [finding(14), 'alb-origin-waf-bypass-risk'],
            async run({ live }) {
                const rule = (await live.albAcl()).Rules.find((r: any) => r.Name === 'block-non-cloudfront-origin');
                if (!rule) {
                    return fail('rule missing');
                }
                const bm = rule.Statement.NotStatement?.Statement?.ByteMatchStatement;
                const p = new Problems();
                p.eq('action', ruleAction(rule), 'Block');
                p.eq('shape', !!bm, true);
                p.eq('header', bm?.FieldToMatch?.SingleHeader?.Name?.toLowerCase(), ALB_ACL.originVerifyHeader);
                p.eq('positional', bm?.PositionalConstraint, 'EXACTLY');
                return p.outcome(`secret ${describeSecret(decodeSearchString(bm?.SearchString))}`);
            },
        },
        {
            id: 'waf-config.alb.origin-secret-in-sync',
            area: 'waf-config',
            title: `CloudFront sends the ${ALB_ACL.originVerifyHeader} value the ALB rule expects (compared in memory)`,
            refs: [finding(14)],
            async run({ live }) {
                const cfg = await live.distributionConfig();
                const sent = (cfg.Origins?.Items?.[0]?.CustomHeaders?.Items ?? []).find(
                    (h: any) => h.HeaderName.toLowerCase() === ALB_ACL.originVerifyHeader
                )?.HeaderValue;
                const rule = (await live.albAcl()).Rules.find((r: any) => r.Name === 'block-non-cloudfront-origin');
                const expected = decodeSearchString(
                    rule?.Statement.NotStatement?.Statement?.ByteMatchStatement?.SearchString
                );
                if (!sent || !expected) {
                    return fail(`header sent: ${describeSecret(sent)}, rule expects: ${describeSecret(expected)}`);
                }
                return sent === expected
                    ? pass(`both ${describeSecret(sent)}`)
                    : fail('values differ: every request through CloudFront would be blocked at the ALB');
            },
        },
        {
            id: 'waf-config.alb.association',
            area: 'waf-config',
            title: `${ALB_ACL.name} is associated with ${ALB.name}`,
            async run({ aws }) {
                const r = await aws.call('wafv2', 'get-web-acl-for-resource', ['--resource-arn', ALB.arn], ALB.region);
                return r.WebACL?.Name === ALB_ACL.name ? pass() : fail(`associated ACL: ${r.WebACL?.Name ?? 'none'}`);
            },
        },
        ...loggingChecks(
            'alb',
            ALB_ACL.name,
            async (live) => aclArn(await live.albAcl()),
            ALB_ACL.region,
            ALB_ACL.logging
        ),
    ];
}
