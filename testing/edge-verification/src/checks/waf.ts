import { decodeSearchString } from '../core/live';
import type { Live } from '../core/live';
import { omit } from '../core/projection';
import { describeSecret } from '../core/redact';
import { type CheckDef, Problems, fail, pass } from '../core/types';
import {
    type Leaf,
    andOf,
    andOfLeaves,
    anyOfLeaves,
    anyPathLeafMatches,
    canonicalWaf,
    leafKey,
    leafOf,
    leaves,
    noneOfAlternatives,
    noneOfLeaves,
    noneOfStatements,
    regexLeafMatches,
    ruleAction,
} from '../core/waf';
import {
    ALB,
    ALB_ACL,
    CF_ACL,
    type IpSetExpectation,
    LOG_RETENTION_PENDING,
    type ManagedGroupExpectation,
    type OverrideExpectation,
    type RuleExpectation,
} from '../expected/edge';
import { finding } from '../expected/lifecycle';
import {
    ACL_UNPINNED,
    type DeclaredRule,
    albAclSettings,
    albDeclaredRules,
    cfAclSettings,
    cfDeclaredRules,
    ipSetArn,
} from '../expected/wafRules';

const sorted = (xs: string[]): string[] => [...xs].sort();
const SHIELD_PRIORITY = 10000000;

async function cfRule(live: Live, name: string): Promise<any> {
    const rule = (await live.cfAcl()).Rules.find((r: any) => r.Name === name);
    if (!rule) {
        throw new Error(`rule ${name} not found on ${CF_ACL.name}`);
    }
    return rule;
}

const canonical = (node: unknown): any => canonicalWaf(node);

/** An override as `Name:Action`, or `Name:{...}` when the action carries settings (a custom response, say). */
function overrideKey(name: string, actionToUse: any): string {
    const keys = Object.keys(actionToUse ?? {});
    const bare = keys.length === 1 && !Object.keys(actionToUse[keys[0]] ?? {}).length;
    return `${name}:${bare ? keys[0] : JSON.stringify(canonical(actionToUse))}`;
}

const declaredOverride = (o: OverrideExpectation): string => overrideKey(o.name, { [o.action]: {} });

/**
 * A managed group's complete override set, name and action, against the declared one. An override a
 * pending script adds is set aside when present with its declared action, so the group passes
 * before and after that script; the pending check reports which state is live.
 */
function compareOverrides(p: Problems, name: string, liveRule: any, group: ManagedGroupExpectation): void {
    const pending = new Set((group.pendingOverrides ?? []).map(declaredOverride));
    const live = (liveRule.Statement?.ManagedRuleGroupStatement?.RuleActionOverrides ?? []).map((o: any) =>
        overrideKey(o.Name, o.ActionToUse)
    );
    p.eq(
        `${name} RuleActionOverrides (pending excluded)`,
        sorted(live.filter((o: string) => !pending.has(o))),
        sorted(group.overrides.map(declaredOverride))
    );
}

/**
 * Every field of a live rule against its declared forms (expected/wafRules.ts), Priority aside (the
 * rule order covers it). A managed group's overrides are compared on their own, by compareOverrides.
 */
function compareRule(p: Problems, liveRule: any, declared: DeclaredRule): void {
    const project = (r: any): any => {
        const c = canonical(omit(r, ['Priority']));
        delete c.Statement?.ManagedRuleGroupStatement?.RuleActionOverrides;
        return c;
    };
    p.oneOf(
        liveRule.Name,
        project(liveRule),
        declared.variants.map((v) => project(v.rule))
    );
}

function compareRuleList(
    p: Problems,
    liveRules: any[],
    expected: RuleExpectation[],
    declared: Map<string, DeclaredRule>,
    groups: Record<string, ManagedGroupExpectation>
): void {
    // Only the Shield group itself is set aside: any other rule, at whatever priority, is compared.
    const isShield = (r: any): boolean =>
        r.Priority === SHIELD_PRIORITY && String(r.Name).startsWith('ShieldMitigationRuleGroup_');
    const ordered = [...liveRules].sort((a, b) => a.Priority - b.Priority).filter((r) => !isShield(r));
    const pending = new Set(expected.filter((e) => e.pending).map((e) => e.name));
    const deployed = expected.filter((e) => !e.pending);
    p.eq(
        'rule order (pending rules excluded)',
        ordered.map((r) => r.Name).filter((n) => !pending.has(n)),
        deployed.map((e) => e.name)
    );
    const managed = ordered.filter((r) => r.Statement?.ManagedRuleGroupStatement).map((r) => r.Name);
    p.eq('managed groups', sorted(managed), sorted(Object.keys(groups)));
    for (const e of deployed) {
        const r = ordered.find((x) => x.Name === e.name);
        if (!r) {
            continue;
        }
        compareRule(p, r, declared.get(e.name)!);
        if (groups[e.name]) {
            compareOverrides(p, e.name, r, groups[e.name]);
        }
    }
    const shield = liveRules.filter(isShield);
    p.check(shield.length === 1, 'Shield mitigation group missing at priority 10000000');
    // Shield manages the group itself; the ACL decides only whether its verdicts apply.
    p.eq('Shield mitigation group override action', shield[0] && ruleAction(shield[0]), 'None');
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
            title: `${aclName} logs every request to ${cfg.logGroup} (no filter), redacted or not yet`,
            refs: [finding(1)],
            async run({ live }) {
                const l = await live.loggingConfig(await getArn(live), region);
                if (!l) {
                    return fail('no logging configuration');
                }
                const p = new Problems();
                // A LoggingFilter would drop requests from the log; any other new field is drift too.
                // ResourceArn is the ACL the configuration was fetched for.
                const declared = {
                    LogDestinationConfigs: [cfg.destination],
                    ManagedByFirewallManager: false,
                    LogType: 'WAF_LOGS',
                    LogScope: 'CUSTOMER',
                };
                p.oneOf('logging', canonical(omit(l, ['ResourceArn'])), [
                    canonical(declared),
                    canonical({ ...declared, RedactedFields: redactedFields(cfg.redactedHeaders) }),
                ]);
                return p.outcome();
            },
        },
        {
            id: `waf-config.${prefix}.logging.redaction`,
            area: 'waf-config',
            title: `${aclName} log redacts exactly the secret and credential headers (${cfg.redactedHeaders.join(', ')})`,
            refs: [finding(1)],
            pending: cfg.redactionPending,
            async run({ live }) {
                const l = await live.loggingConfig(await getArn(live), region);
                const p = new Problems();
                p.eq(
                    'redacted fields',
                    byKey(canonical(l?.RedactedFields ?? [])),
                    byKey(canonical(redactedFields(cfg.redactedHeaders)))
                );
                return p.outcome();
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
const redactedFields = (headers: string[]): any[] => headers.map((Name) => ({ SingleHeader: { Name } }));
const byKey = (xs: any[]): string[] => sorted(xs.map((x) => JSON.stringify(x)));

/**
 * p11 as AND(any trigger label, NOT(any exemption), NOT(any safe path)). An exemption is a single
 * condition (`exemptions`), an AND of conditions (`exemptionAnds`, e.g. the saliencebot UA from
 * its IP set), or a condition scoped to some paths (`scopedExemptions`: the Accept test once
 * tighten-p11-markdown-exemption.sh has run).
 */
function p11Parts(rule: any):
    | {
          trigger: Leaf[];
          exemptions: Leaf[];
          exemptionAnds: Leaf[][];
          scopedExemptions: Array<{ leaf: Leaf; anyOf: Leaf[] }>;
          safe: Leaf[];
      }
    | undefined {
    const parts = andOf(rule.Statement);
    if (parts?.length !== 3) {
        return undefined;
    }
    const trigger = anyOfLeaves(parts[0]);
    const exemptions = noneOfAlternatives(parts[1]);
    const safe = noneOfLeaves(parts[2]);
    return trigger && exemptions && safe
        ? {
              trigger,
              exemptions: exemptions.leaves,
              exemptionAnds: exemptions.ands,
              scopedExemptions: exemptions.scoped,
              safe,
          }
        : undefined;
}

const isAcceptLeaf = (l: Leaf): boolean => l.kind === 'byte' && l.field === 'header:accept';

/** p11's Accept tests, bare or path-scoped: the data-centre rule copies whichever it finds. */
function p11AcceptLeaves(parts: NonNullable<ReturnType<typeof p11Parts>>): Leaf[] {
    return [...parts.exemptions, ...parts.scopedExemptions.map((x) => x.leaf)].filter(isAcceptLeaf);
}

/** The declared Accept: text/markdown test, as p11 has it. */
const isDeclaredAccept = (l: Leaf): boolean =>
    l.kind === 'byte' &&
    l.field === 'header:accept' &&
    l.positional === 'CONTAINS' &&
    l.value === CF_ACL.nonBrowser.markdownAcceptExemption &&
    JSON.stringify(l.transforms) === JSON.stringify(CF_ACL.nonBrowser.markdownAcceptTransforms);

/** The negotiable-path regexes the path-scoped markdown exemptions use, as leaf keys in order. */
const negotiablePathKeys = (): string[] =>
    CF_ACL.dataCentreMarkdownPaths.map((value) =>
        leafKey({ kind: 'regex', field: 'UriPath', value, transforms: ['NONE'] })
    );

/** A scoped exemption is the declared one: the Accept test, on exactly the negotiable paths. */
const isDeclaredScopedAccept = (x: { leaf: Leaf; anyOf: Leaf[] }): boolean =>
    isDeclaredAccept(x.leaf) && JSON.stringify(x.anyOf.map(leafKey)) === JSON.stringify(negotiablePathKeys());

/**
 * Where a pending inserted rule must sit: after `exp.after` (or before `exp.before`), with only
 * other pending rules anchored the same way in between. Two scripts that each insert straight after
 * p11 therefore pass in either order. Returns the problem, if any.
 */
export function pendingSiblingOrder(sortedRules: any[], exp: RuleExpectation): string | undefined {
    const names = sortedRules.map((r: any) => r.Name as string);
    const i = names.indexOf(exp.name);
    const ahead = exp.before !== undefined;
    const anchor = (ahead ? exp.before : exp.after) ?? '';
    const a = names.indexOf(anchor);
    if (a < 0) {
        return `${anchor} not found`;
    }
    if (ahead ? i > a : i < a) {
        return `${exp.name} (priority ${sortedRules[i].Priority}) is ${ahead ? 'after' : 'before'} ${anchor}`;
    }
    const siblings = new Set(
        CF_ACL.rules
            .filter((r) => r.pending && r.name !== exp.name && (ahead ? r.before === anchor : r.after === anchor))
            .map((r) => r.name)
    );
    const others = names.slice(Math.min(a, i) + 1, Math.max(a, i)).filter((n) => !siblings.has(n));
    const span = ahead ? `${exp.name} and ${anchor}` : `${anchor} and ${exp.name}`;
    return others.length ? `between ${span}: ${others.join(', ')}` : undefined;
}

/** The actions a rule may have: its declared one, and the one a later run of its script switches it to. */
const actionsOf = (exp: RuleExpectation): string[] => [
    exp.action,
    ...(exp.pendingAction ? [exp.pendingAction.action] : []),
];

/** An SqliMatchStatement's field (as leaves name fields), transformations, sensitivity and body oversize handling. */
function sqliOf(
    stmt: any
): { field: string; transforms: string[]; sensitivity: string; oversize?: string } | undefined {
    const s = stmt?.SqliMatchStatement;
    if (!s || Object.keys(stmt).length !== 1) {
        return undefined;
    }
    const f = s.FieldToMatch ?? {};
    return {
        field: f.SingleHeader ? `header:${String(f.SingleHeader.Name).toLowerCase()}` : (Object.keys(f)[0] ?? ''),
        transforms: [...(s.TextTransformations ?? [])]
            .sort((a: any, b: any) => a.Priority - b.Priority)
            .map((t: any) => t.Type),
        sensitivity: s.SensitivityLevel ?? 'LOW',
        oversize: f.Body?.OversizeHandling,
    };
}

/** The rate rules' asset exemptions as the live ACL has them: UriPath, LOWERCASE, prefixes STARTS_WITH. */
function assetScopeDownLeaves(): Leaf[] {
    return [
        { kind: 'regex', field: 'UriPath', value: CF_ACL.assetScopeDownRegex, transforms: ['LOWERCASE'] },
        ...CF_ACL.assetScopeDownPrefixes.map((value): Leaf => ({
            kind: 'byte',
            field: 'UriPath',
            value,
            positional: 'STARTS_WITH',
            transforms: ['LOWERCASE'],
        })),
    ];
}

/** p11's safe-path leaves as add-waf-safe-path-exemptions.sh builds them: UriPath, no transform. */
function p11SafeLeaves(): Leaf[] {
    const nb = CF_ACL.nonBrowser;
    return [
        ...nb.safePathRegexes.map((value): Leaf => ({ kind: 'regex', field: 'UriPath', value, transforms: ['NONE'] })),
        ...nb.safePathPrefixes.map((value): Leaf => ({
            kind: 'byte',
            field: 'UriPath',
            value,
            positional: 'STARTS_WITH',
            transforms: ['NONE'],
        })),
    ];
}

/** The tokens of a `(a|b|…)` alternation with no nested groups, or undefined for any other regex shape. */
function alternationTokens(value: string): string[] | undefined {
    const m = /^\(([^()]*)\)$/.exec(value);
    return m ? m[1].split('|') : undefined;
}

/**
 * Whether a UA regex is the AI allowlist with exactly the declared tokens: the deployed set, or that
 * plus extend-p11-agent-allowlist.sh's additions. Compared as a complete token set, so an appended
 * `|bytespider` (or any other extra or missing token) is drift.
 */
function isDeclaredAllowlist(value: string): boolean {
    const nb = CF_ACL.nonBrowser;
    const tokens = alternationTokens(value);
    if (!tokens) {
        return false;
    }
    const got = JSON.stringify(sorted(tokens));
    return (
        got === JSON.stringify(sorted(nb.uaAllowTokens)) ||
        got === JSON.stringify(sorted([...nb.uaAllowTokens, ...nb.pendingUaAllowTokens.tokens]))
    );
}

/** Whether a single-leaf p11 exemption is one the expectations declare (see the nonbrowser-rule check). */
function isDeclaredP11Exemption(l: Leaf): boolean {
    const nb = CF_ACL.nonBrowser;
    switch (l.kind) {
        case 'label':
            return nb.exemptLabels.includes(l.value);
        case 'byte':
            return isDeclaredAccept(l);
        case 'regex':
            // The complete regex, not sample membership: the allowlist by its full token set, the
            // other UA regexes by their exact live strings, and always lower-casing first.
            return (
                l.field === 'header:user-agent' &&
                JSON.stringify(l.transforms) === JSON.stringify(['LOWERCASE']) &&
                (isDeclaredAllowlist(l.value) || nb.otherUaRegexes.includes(l.value)) &&
                !nb.undeclaredUas.some((ua) => regexLeafMatches(l, ua))
            );
        default:
            return false;
    }
}

/** The p11 user-agent allowlist regex (the UA regex that admits chatgpt-user), or undefined. */
function p11UaAllowlist(p11: any): Extract<Leaf, { kind: 'regex' }> | undefined {
    const e = p11Parts(p11)?.exemptions ?? [];
    return e.find(
        (l): l is Extract<Leaf, { kind: 'regex' }> =>
            l.kind === 'regex' && l.field === 'header:user-agent' && regexLeafMatches(l, 'chatgpt-user')
    );
}

/**
 * The statement each inserted rule must have: the shape its script builds. It stays checked after
 * the rule's pending marker is removed; the marker only decides whether a failure counts yet.
 */
const RULE_SHAPES: Record<string, { refs: string[]; check: (rule: any, live: Live, p: Problems) => Promise<void> }> = {
    'block-blog-sqli': {
        refs: [finding(21)],
        // AND(path under /blog/, OR(SQLi in the path, the query string, the user agent, AND(NOT the
        // Ghost admin API, SQLi in the body))): the shape add-blog-sqli-rule.sh builds.
        async check(rule, _live, p) {
            const s = CF_ACL.blogSqli;
            const under = (prefix: string): string =>
                leafKey({
                    kind: 'byte',
                    field: 'UriPath',
                    value: prefix,
                    positional: 'STARTS_WITH',
                    transforms: s.prefixTransforms,
                });
            const parts = andOf(rule.Statement);
            const scope = parts?.length === 2 ? leafOf(parts[0]) : undefined;
            const alternatives: any[] | undefined = parts?.length === 2 ? parts[1]?.OrStatement?.Statements : undefined;
            if (!scope || !Array.isArray(alternatives)) {
                p.add('statement is not AND(path prefix, OR(SQLi matches))');
                return;
            }
            // Decoded and normalised, so /%62log/ and //blog/ (which Apache hands to Ghost) are inside it.
            p.eq('scope-down', leafKey(scope), under(s.prefix));
            const matches = alternatives.map((alt) => {
                const body = andOf(alt);
                const exempt = body?.length === 2 ? noneOfLeaves(body[0]) : undefined;
                return { match: sqliOf(body?.length === 2 ? body[1] : alt), exempt };
            });
            if (matches.some((m) => !m.match)) {
                p.add('an alternative is not an SQLi match (or AND(NOT path prefix, SQLi match))');
                return;
            }
            p.eq(
                'inspected fields',
                sorted(matches.map((m) => m.match!.field)),
                sorted(['Body', 'QueryString', 'UriPath', `header:${s.userAgentHeader}`])
            );
            for (const { match, exempt } of matches) {
                p.eq(`${match!.field} transforms`, match!.transforms, s.transforms);
                p.eq(`${match!.field} sensitivity`, match!.sensitivity, s.sensitivity);
                // Only the body skips the Ghost admin API: its path, query string and user agent are still inspected.
                p.eq(
                    `${match!.field} exemption`,
                    exempt?.map(leafKey),
                    match!.field === 'Body' ? [under(s.bodyExemptPrefix)] : undefined
                );
            }
            const body = matches.find((m) => m.match!.field === 'Body');
            p.eq('body oversize handling', body?.match!.oversize, s.bodyOversize);
        },
    },
    'block-datacenter-except-agent-paths': {
        refs: [finding(5)],
        // AND(data-centre label, NOT(any verified bot, or Accept: text/markdown on a negotiable path),
        // NOT(any p11 safe path)): the shape move-datacenter-block-after-agent-exemptions.sh builds.
        async check(rule, live, p) {
            const parts = andOf(rule.Statement);
            const label = parts?.length === 3 ? leafOf(parts[0]) : undefined;
            const alternatives = parts?.length === 3 ? noneOfStatements(parts[1]) : undefined;
            const safe = parts?.length === 3 ? noneOfLeaves(parts[2]) : undefined;
            const p11 = p11Parts(await cfRule(live, 'block-nonbrowser-except-ai-assistants'));
            const p11Safe = p11?.safe;
            if (!label || !alternatives || !safe || !p11Safe) {
                p.add(`statement is not AND(label, NOT(exemptions), NOT(safe paths))${p11Safe ? '' : ' (nor is p11)'}`);
                return;
            }
            p.eq('safe paths (same as p11)', sorted(safe.map(leafKey)), sorted(p11Safe.map(leafKey)));
            p.check(
                label.kind === 'label' &&
                    label.scope === 'LABEL' &&
                    label.value.endsWith('signal:known_bot_data_center'),
                'does not match the known_bot_data_center label'
            );
            p.eq('exemption alternatives', alternatives.length, CF_ACL.dataCentreVerifiedLabels.length + 1);
            // Exactly the verified-bot labels (matched as labels, not namespaces): losing one blocks
            // verified crawlers on data-centre IPs.
            const labels = alternatives.map(leafOf).filter((l): l is Leaf => l?.kind === 'label');
            p.eq(
                'verified-bot exemption statement labels',
                sorted(labels.map((l) => l.value)),
                sorted(CF_ACL.dataCentreVerifiedLabels)
            );
            p.check(
                labels.every((l) => l.kind === 'label' && l.scope === 'LABEL'),
                'verified-bot exemption statement matches a namespace, not the label'
            );
            // Accept: text/markdown alone would let any data-centre client fetch anything by sending
            // it; it must be ANDed with the paths the origin actually negotiates.
            const bareAccept = alternatives
                .map(leafOf)
                .filter((l) => l?.kind === 'byte' && l.field === 'header:accept');
            p.check(!bareAccept.length, 'Accept: text/markdown is exempt on every path, not only negotiable ones');
            const ands = alternatives.map(andOf).filter((a): a is any[] => !!a);
            const p11Accept = p11 && p11AcceptLeaves(p11);
            const accept = ands.length === 1 && ands[0].length === 2 ? leafOf(ands[0][0]) : undefined;
            const paths = ands.length === 1 && ands[0].length === 2 ? anyOfLeaves(ands[0][1]) : undefined;
            if (!accept || !paths) {
                p.add('markdown exemption is not one AND(Accept leaf, OR(negotiable path regexes))');
                return;
            }
            p.check(
                p11Accept?.length === 1 &&
                    JSON.stringify(accept) === JSON.stringify(p11Accept[0]) &&
                    accept.kind === 'byte' &&
                    accept.value === CF_ACL.nonBrowser.markdownAcceptExemption,
                `markdown exemption statement's Accept test is not p11's Accept: ${CF_ACL.nonBrowser.markdownAcceptExemption} condition`
            );
            // Raw path, no transformation: the origin's conditions are case-sensitive.
            p.eq('negotiable path regexes', paths.map(leafKey), negotiablePathKeys());
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

/** AWS-AWSManagedRulesBotControlRuleSet -> bot-control. */
const groupSlug = (rule: string): string =>
    rule
        .replace(/^AWS-AWSManagedRules/, '')
        .replace(/RuleSet$/, '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();

/** One check per pending managed-group override: reports whether its script has run. */
function pendingOverrideChecks(
    prefix: string,
    groups: Record<string, ManagedGroupExpectation>,
    acl: (live: Live) => Promise<any>
): CheckDef[] {
    return Object.entries(groups).flatMap(([rule, group]) =>
        (group.pendingOverrides ?? []).map((o): CheckDef => ({
            id: `waf-config.${prefix}.${groupSlug(rule)}.${o.name}`,
            area: 'waf-config',
            title: `${rule} ${o.name} overridden to ${o.action}`,
            refs: [finding(5)],
            pending: o.pending,
            async run({ live }) {
                const r = (await acl(live)).Rules.find((x: any) => x.Name === rule);
                const found = (r?.Statement?.ManagedRuleGroupStatement?.RuleActionOverrides ?? []).find(
                    (x: any) => x.Name === o.name
                );
                return found && overrideKey(found.Name, found.ActionToUse) === declaredOverride(o)
                    ? pass()
                    : fail(`no ${o.action} override (${found ? overrideKey(found.Name, found.ActionToUse) : 'none'})`);
            },
        }))
    );
}

/**
 * An IP set a rule references, by the leaf `ref` finds: the reference is to the declared set, on the
 * connection IP, and the set holds exactly the declared addresses.
 */
function ipSetCheck(
    id: string,
    exp: IpSetExpectation,
    usedBy: string,
    ref: (live: Live) => Promise<Leaf | undefined>
): CheckDef {
    return {
        id: `waf-config.cf.${id}-ipset`,
        area: 'waf-config',
        title: `${usedBy}: IP set ${exp.name} holds only ${exp.addresses.join(', ')}`,
        async run({ live }) {
            const l = await ref(live);
            if (l?.kind !== 'ipset') {
                return fail(`${usedBy} has no IP set reference where declared`);
            }
            const p = new Problems();
            p.eq('referenced set', l.value, ipSetArn(exp));
            // A forwarded-IP header is the caller's to set: matching it lets anyone claim the address.
            p.eq('matched address', l.forwardedIp ?? 'connection IP', 'connection IP');
            const set = await live.ipSet(exp.name, exp.id, CF_ACL.scope, CF_ACL.region);
            // Name, Id and ARN identify the set fetched; the description is free text.
            p.diff(
                'IP set',
                { ...omit(set, ['Name', 'Id', 'ARN', 'Description']), Addresses: sorted(set.Addresses ?? []) },
                { IPAddressVersion: 'IPV4', Addresses: sorted(exp.addresses) }
            );
            return p.outcome();
        },
    };
}

export function wafChecks(): CheckDef[] {
    const nb = CF_ACL.nonBrowser;
    return [
        {
            id: 'waf-config.cf.acl',
            area: 'waf-config',
            title: `${CF_ACL.name}: every setting besides the rules (default Allow, token domain, CAPTCHA immunity, custom 403 body)`,
            async run({ live }) {
                const p = new Problems();
                p.diff('ACL', canonical(omit(await live.cfAcl(), ACL_UNPINNED)), canonical(cfAclSettings()));
                return p.outcome();
            },
        },
        {
            id: 'waf-config.cf.rules',
            area: 'waf-config',
            title: `${CF_ACL.name}: rule order, and every field of every rule (managed-group overrides included) as declared`,
            refs: [finding(5), 'SE-185', 'SE-184'],
            async run({ live }) {
                const p = new Problems();
                compareRuleList(p, (await live.cfAcl()).Rules, CF_ACL.rules, cfDeclaredRules(), CF_ACL.managedGroups);
                return p.outcome(`${CF_ACL.rules.filter((r) => !r.pending).length} rules + Shield`);
            },
        },
        ...CF_ACL.rules
            .filter((r) => r.pending || RULE_SHAPES[r.name])
            .map((exp): CheckDef => ({
                id: `waf-config.cf.rule.${exp.name}`,
                area: 'waf-config',
                title: exp.pending
                    ? `${exp.name} present ${exp.before ? `before ${exp.before}` : `after ${exp.after}`} (only other pending inserts between), ${actionsOf(exp).join(' or ')}`
                    : `${exp.name}: statement as declared, ${actionsOf(exp).join(' or ')}`,
                refs: RULE_SHAPES[exp.name]?.refs ?? [finding(5)],
                pending: exp.pending,
                async run({ live }) {
                    const rules = [...(await live.cfAcl()).Rules].sort((a: any, b: any) => a.Priority - b.Priority);
                    const i = rules.findIndex((r: any) => r.Name === exp.name);
                    if (i < 0) {
                        return fail('rule not present');
                    }
                    const p = new Problems();
                    // Once deployed, waf-config.cf.rules checks its exact position.
                    const between = exp.pending ? pendingSiblingOrder(rules, exp) : undefined;
                    if (between) {
                        p.add(between);
                    }
                    const actions = actionsOf(exp);
                    if (!actions.includes(ruleAction(rules[i]))) {
                        p.eq('action', ruleAction(rules[i]), actions.join(' or '));
                    }
                    p.eq('metric', rules[i].VisibilityConfig?.MetricName, exp.metricName);
                    if (exp.pending) {
                        // Once deployed, waf-config.cf.rules compares every field.
                        compareRule(p, rules[i], cfDeclaredRules().get(exp.name)!);
                    }
                    const shape = RULE_SHAPES[exp.name];
                    if (!shape) {
                        p.add(`no statement check declared for ${exp.name}`);
                    } else {
                        await shape.check(rules[i], live, p);
                    }
                    return p.outcome(`priority ${rules[i].Priority}`);
                },
            })),
        // A later run of a rule's script that changes only its action (the rule's own check accepts both).
        ...CF_ACL.rules
            .filter((r) => r.pendingAction)
            .map((exp): CheckDef => {
                const later = exp.pendingAction!;
                return {
                    id: `waf-config.cf.rule.${exp.name}.${later.action.toLowerCase()}`,
                    area: 'waf-config',
                    title: `${exp.name} switched from ${exp.action} to ${later.action}`,
                    refs: RULE_SHAPES[exp.name]?.refs ?? [finding(5)],
                    pending: later.pending,
                    async run({ live }) {
                        const r = (await live.cfAcl()).Rules.find((x: any) => x.Name === exp.name);
                        if (!r) {
                            return fail('rule not present');
                        }
                        return ruleAction(r) === later.action ? pass() : fail(`still ${ruleAction(r)}`);
                    },
                };
            }),
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
                    // EXACTLY compares after the transformations: any but NONE normalises the header.
                    p.eq(`${exp.rule} transforms`, secret.transforms, ['NONE']);
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
        ipSetCheck('build-server', CF_ACL.buildServerIpSet, 'allow-internal-ec2', async (live) =>
            leafOf((await cfRule(live, 'allow-internal-ec2')).Statement)
        ),
        ipSetCheck('salience-bot', nb.saliencebotIpSet, 'the p11 saliencebot exemption', async (live) =>
            p11Parts(await cfRule(live, 'block-nonbrowser-except-ai-assistants'))
                ?.exemptionAnds.flat()
                .find((l) => l.kind === 'ipset')
        ),
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
            title: `CommonRuleSet scope-down exempts ${CF_ACL.commonRuleSetExemptions.map((e) => e.prefix).join(', ')}`,
            async run({ live }) {
                const s = (await cfRule(live, 'AWS-AWSManagedRulesCommonRuleSet')).Statement.ManagedRuleGroupStatement;
                // NOT(any exempt prefix): without the negation the rule set inspects ONLY those paths.
                const exempt = noneOfLeaves(s.ScopeDownStatement);
                if (!exempt) {
                    return fail('scope-down is not NOT(any of the exempt path prefixes)');
                }
                const p = new Problems();
                // The outer rule name says nothing about the group it runs.
                p.eq('managed group', `${s.VendorName}/${s.Name}`, 'AWS/AWSManagedRulesCommonRuleSet');
                // Every property of each prefix: on another field, matched anywhere or after another
                // transformation, it exempts other requests from the rule set.
                p.eq(
                    'exempt prefixes',
                    sorted(exempt.map(leafKey)),
                    sorted(
                        CF_ACL.commonRuleSetExemptions.map((e) =>
                            leafKey({
                                kind: 'byte',
                                field: 'UriPath',
                                value: e.prefix,
                                positional: 'STARTS_WITH',
                                transforms: e.transforms,
                            })
                        )
                    )
                );
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
            title: 'Bot Control: COMMON inspection, no scope-down (its overrides: waf-config.cf.rules)',
            refs: [finding(5), finding(10)],
            async run({ live }) {
                const s = (await cfRule(live, 'AWS-AWSManagedRulesBotControlRuleSet')).Statement
                    .ManagedRuleGroupStatement;
                const p = new Problems();
                p.eq(
                    'inspection level',
                    s.ManagedRuleGroupConfigs?.[0]?.AWSManagedRulesBotControlRuleSet?.InspectionLevel,
                    CF_ACL.botControl.inspectionLevel
                );
                p.eq('scope-down', s.ScopeDownStatement ?? null, null);
                return p.outcome();
            },
        },
        ...pendingOverrideChecks('cf', CF_ACL.managedGroups, (live) => live.cfAcl()),
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
                const { trigger: t, exemptions: e, exemptionAnds: ands, scopedExemptions: scoped, safe: s } = parts;
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
                // The allowlist tokens are lowercase, so each UA regex must lowercase the header
                // first; without it a real "GPTBot" or "ClaudeBot" no longer matches.
                for (const l of uaRegexes) {
                    p.eq(`UA regex /${l.value.slice(0, 40)}/ transforms`, l.transforms, ['LOWERCASE']);
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
                // The saliencebot exemption needs both its UA and its IP set (an AND of exactly those
                // two), never the UA alone, and its UA regex must still match saliencebot.
                p.check(
                    ands.some(
                        (and) =>
                            and.length === 2 &&
                            and.some(
                                (l) =>
                                    l.kind === 'ipset' &&
                                    !l.forwardedIp &&
                                    l.value.includes(`/ipset/${nb.saliencebotIpSet.name}/`)
                            ) &&
                            and.some(
                                (l) =>
                                    l.kind === 'regex' &&
                                    l.field === 'header:user-agent' &&
                                    regexLeafMatches(l, 'saliencebot')
                            )
                    ),
                    'saliencebot exemption is not AND(a UA regex matching saliencebot, salience-bot IP set on the connection IP)'
                );
                p.check(
                    !e.some(
                        (l) =>
                            l.kind === 'regex' && l.field === 'header:user-agent' && regexLeafMatches(l, 'saliencebot')
                    ),
                    'the saliencebot UA is exempt on its own, without the IP set'
                );
                // One Accept test, bare (today) or scoped to the negotiable paths (once
                // tighten-p11-markdown-exemption.sh runs: its own pending check says which).
                const accepts = p11AcceptLeaves(parts);
                p.check(
                    accepts.length === 1 && isDeclaredAccept(accepts[0]),
                    `not exactly one Accept: text/markdown exemption (CONTAINS, transforms ${nb.markdownAcceptTransforms.join(',')}): ${accepts.length}`
                );
                const undeclaredScoped = scoped.filter((x) => !isDeclaredScopedAccept(x));
                p.check(
                    !undeclaredScoped.length,
                    `path-scoped exemptions that are not the Accept test on the negotiable paths: ${undeclaredScoped.map((x) => leafKey(x.leaf)).join(', ')}`
                );
                // Exactly the declared exemptions: the allowlist and in-app UA regexes, the verified
                // labels, Accept: text/markdown and the saliencebot AND. Anything else (say a UA regex
                // admitting all but saliencebot) exempts traffic nothing above declared.
                const undeclared = e.filter((l) => !isDeclaredP11Exemption(l));
                p.check(!undeclared.length, `undeclared exemptions: ${undeclared.map(leafKey).join(', ')}`);
                // The allowlist, each other UA regex, the labels and the Accept match, bare or scoped
                // (the saliencebot AND is counted apart).
                p.eq(
                    'exemption count',
                    e.length + scoped.length,
                    1 + nb.otherUaRegexes.length + nb.exemptLabels.length + 1
                );
                p.eq('AND exemption count', ands.length, 1);
                // Every property, not just the value: a safe path matched on another field, as an
                // exact match, or after another transform no longer exempts what it names.
                p.eq('safe paths', sorted(s.map(leafKey)), sorted(p11SafeLeaves().map(leafKey)));
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
            id: 'waf-config.cf.nonbrowser-rule.markdown-scoped',
            area: 'waf-config',
            title: 'p11 honours Accept: text/markdown only on the negotiable paths (no bare Accept exemption left)',
            refs: [finding(9)],
            pending: nb.markdownScopedPending,
            async run({ live }) {
                const parts = p11Parts(await cfRule(live, 'block-nonbrowser-except-ai-assistants'));
                if (!parts) {
                    return fail('p11 statement is not AND(triggers, NOT(exemptions), NOT(safe paths))');
                }
                const p = new Problems();
                const bare = parts.exemptions.filter(isAcceptLeaf);
                p.check(!bare.length, 'Accept: text/markdown is still exempt on every path');
                const scoped = parts.scopedExemptions.filter((x) => isAcceptLeaf(x.leaf));
                p.eq('path-scoped Accept exemptions', scoped.length, 1);
                if (scoped.length === 1) {
                    p.check(isDeclaredAccept(scoped[0].leaf), `Accept test is ${leafKey(scoped[0].leaf)}`);
                    p.eq('negotiable path regexes', scoped[0].anyOf.map(leafKey), negotiablePathKeys());
                }
                return p.outcome();
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
                        // Every property of every leaf, and nothing extra: an exemption matched on
                        // another field or positional constraint would count assets towards the limit.
                        p.eq(
                            `${exp.name}: asset scope-down`,
                            sorted(ls.map(leafKey)),
                            sorted(assetScopeDownLeaves().map(leafKey))
                        );
                    }
                    if ((exp as any).scopeDown === 'none') {
                        p.eq(`${exp.name} scope-down`, rb.ScopeDownStatement ?? null, null);
                    }
                    if ((exp as any).scopeDown === 'nonbrowser-safe-paths') {
                        // AND of exactly the trigger labels and the safe-path regexes: anything else
                        // narrows or widens what is counted.
                        const parts = rb.ScopeDownStatement?.AndStatement?.Statements;
                        const labels = Array.isArray(parts) && parts.length === 2 ? anyOfLeaves(parts[0]) : undefined;
                        const paths = Array.isArray(parts) && parts.length === 2 ? anyOfLeaves(parts[1]) : undefined;
                        if (!labels || !paths) {
                            p.add(`${exp.name}: scope-down is not AND(any trigger label, any safe path)`);
                        } else {
                            p.eq(
                                `${exp.name}: scope-down labels`,
                                sorted(labels.map(leafKey)),
                                sorted(
                                    CF_ACL.nonBrowser.triggerLabels.map((value) =>
                                        leafKey({ kind: 'label', value, scope: 'LABEL' })
                                    )
                                )
                            );
                            p.eq(
                                `${exp.name}: scope-down safe paths`,
                                sorted(paths.map(leafKey)),
                                sorted(
                                    CF_ACL.nonBrowser.safePathRegexes.map((value) =>
                                        leafKey({ kind: 'regex', field: 'UriPath', value, transforms: ['NONE'] })
                                    )
                                )
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
                            exempt[0].value === exp.exemptRegex &&
                            JSON.stringify(exempt[0].transforms) === JSON.stringify(exp.exemptTransforms),
                        'exempt statement is not the declared UriPath regex and transformations'
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
            title: `${ALB_ACL.name}: rule order, and every field of every rule (managed-group overrides included) as declared`,
            refs: [finding(14)],
            async run({ live }) {
                const p = new Problems();
                compareRuleList(
                    p,
                    (await live.albAcl()).Rules,
                    ALB_ACL.rules,
                    albDeclaredRules(),
                    ALB_ACL.managedGroups
                );
                return p.outcome(`${ALB_ACL.rules.length} rules + Shield`);
            },
        },
        {
            id: 'waf-config.alb.acl',
            area: 'waf-config',
            title: `${ALB_ACL.name}: every setting besides the rules (default Allow, metrics, on-source DDoS mode)`,
            refs: [finding(14)],
            async run({ live }) {
                const p = new Problems();
                p.diff('ACL', canonical(omit(await live.albAcl(), ACL_UNPINNED)), canonical(albAclSettings()));
                return p.outcome();
            },
        },
        ...pendingOverrideChecks('alb', ALB_ACL.managedGroups, (live) => live.albAcl()),
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
                // EXACTLY compares after the transformations: any but NONE normalises the header.
                p.eq(
                    'transforms',
                    (bm?.TextTransformations ?? []).map((t: any) => t.Type),
                    ['NONE']
                );
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
