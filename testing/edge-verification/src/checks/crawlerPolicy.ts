import { type Http, header } from '../core/http';
import { type Robots, describeVerdict, groupsFor, isAllowed, parseRobots } from '../core/robots';
import { type CheckDef, Problems, fail, pass } from '../core/types';
import { leaves, regexLeafMatches } from '../core/waf';
import { FIRST_RUN, NEW_FINDING } from '../expected/lifecycle';
import { WWW } from '../expected/redirects';
import {
    AI_GROUP,
    AI_TOKENS,
    AI_TOKEN_ADMISSION,
    CHARTS_HOST_ROBOTS,
    CONTENT_SIGNAL,
    GHOST_DISALLOWS,
    MD_TWIN_POLICY,
    ROBOTS_FILES,
    ROBOTS_MATRIX,
    SITEMAP,
    STAR_TOKENS,
} from '../expected/robots';

async function wwwRobots(http: Http): Promise<Robots> {
    const res = await http.get(`${WWW}/robots.txt`);
    if (res.status !== 200) {
        throw new Error(`robots.txt returned ${res.status}`);
    }
    return parseRobots(res.body);
}

const aiGroup = (r: Robots) => r.groups.find((g) => g.agents.includes(AI_GROUP[0]));
const starGroup = (r: Robots) => r.groups.find((g) => g.agents.includes('*'));
const disallows = (g: { rules: Array<{ type: string; pattern: string }> } | undefined): string[] =>
    (g?.rules ?? []).filter((r) => r.type === 'disallow').map((r) => r.pattern);

/**
 * The concrete markdown-twin URL of every directory Disallow in a group (`/x/` -> `/x.md`, each
 * `*` replaced by a sample segment). The Ghost endpoints are API paths, not pages, so have no twin.
 */
export function twinUrlsOfDisallows(group: { rules: Array<{ type: string; pattern: string }> } | undefined): string[] {
    return disallows(group)
        .filter((d) => d.length > 1 && d.endsWith('/') && !d.includes('?') && !GHOST_DISALLOWS.includes(d))
        .map((d) => `${d.slice(0, -1)}.md`.replace(/\*/g, MD_TWIN_POLICY.wildcardSample));
}

/** Twins (plus `suffix`) the group's own token may still crawl, as "url (verdict)". */
function crawlableTwins(r: Robots, suffix: string): { open: string[]; checked: number } {
    const open: string[] = [];
    let checked = 0;
    for (const [name, group] of [
        ['*', starGroup(r)],
        ['ai', aiGroup(r)],
    ] as const) {
        const token = MD_TWIN_POLICY.groupTokens[name];
        for (const twin of twinUrlsOfDisallows(group)) {
            checked++;
            const v = isAllowed(r, token, `${twin}${suffix}`);
            if (v.allowed) {
                open.push(`${name} ${twin}${suffix} (${describeVerdict(v)})`);
            }
        }
    }
    return { open, checked };
}

export function crawlerPolicyChecks(): CheckDef[] {
    return [
        {
            id: 'crawler-policy.robots.groups',
            area: 'crawler-policy',
            title: 'robots.txt: a * group and one named AI group, both with the Content-Signal, plus the Sitemap',
            refs: ['SE-78', 'SE-184', 'SE-191'],
            async run({ http }) {
                const r = await wwwRobots(http);
                const p = new Problems();
                p.eq('group count', r.groups.length, 2);
                const ai = aiGroup(r);
                const star = starGroup(r);
                p.eq('AI group agents', ai?.agents, AI_GROUP);
                p.eq('* Content-Signal', star?.fields['content-signal'], [CONTENT_SIGNAL]);
                p.eq('AI Content-Signal', ai?.fields['content-signal'], [CONTENT_SIGNAL]);
                p.eq('sitemaps', r.sitemaps, [SITEMAP]);
                p.check(groupsFor(r, 'Googlebot')[0] === star, 'Googlebot does not fall to the * group');
                p.check(
                    groupsFor(r, 'Amazonbot')[0] === star,
                    'Amazonbot is named somewhere (SE-191: it should fall to *)'
                );
                p.check(
                    star?.rules.some((x) => x.type === 'allow' && x.pattern === '/') ?? false,
                    '* group lacks Allow: /'
                );
                return p.outcome();
            },
        },
        {
            id: 'crawler-policy.robots.ai-group-mirrors-star',
            area: 'crawler-policy',
            title: 'The AI group carries every * Disallow except examples (SE-78) and versioned archives (SE-182)',
            refs: ['SE-78', 'SE-182', 'SE-183'],
            async run({ http }) {
                const r = await wwwRobots(http);
                const star = disallows(starGroup(r));
                const ai = new Set(disallows(aiGroup(r)));
                // isAiOpenExamplePath / isAiOpenArchivePath in robotsTxt.ts: deliberate differences.
                // The generator leaves those paths out before adding the markdown twins, so a twin
                // (`/x.md$`, `/x.md?`) goes with its directory (`/x/`).
                const intentional = (path: string) => {
                    const dir = path.replace(/\.md[$?]$/, '/');
                    return (/example/.test(dir) && !dir.startsWith('/debug/')) || /(^|\/)archive\/$/.test(dir);
                };
                const missing = star.filter((d) => !ai.has(d) && !intentional(d));
                const extra = [...ai].filter((d) => !star.includes(d));
                const p = new Problems();
                p.check(!missing.length, `in * but not in the AI group: ${missing.join(', ')}`);
                p.check(!extra.length, `in the AI group but not in *: ${extra.join(', ')}`);
                return p.outcome(`${star.length} * disallows, ${ai.size} AI disallows`);
            },
        },
        {
            id: 'crawler-policy.robots.blog',
            area: 'crawler-policy',
            title: 'robots.txt allows /blog/ and blocks the six Ghost-internal paths in both groups, with no bare Disallow: /blog/',
            refs: ['SE-89'],
            async run({ http }) {
                const r = await wwwRobots(http);
                const p = new Problems();
                for (const [name, g] of [
                    ['*', starGroup(r)],
                    ['AI', aiGroup(r)],
                ] as const) {
                    const d = disallows(g);
                    for (const path of GHOST_DISALLOWS) {
                        p.check(d.includes(path), `${name} group lacks Disallow: ${path}`);
                    }
                    p.check(!d.includes('/blog/'), `${name} group has a bare Disallow: /blog/`);
                    p.check(
                        g?.rules.some((x) => x.type === 'allow' && x.pattern === '/blog/') ?? false,
                        `${name} group lacks Allow: /blog/`
                    );
                }
                return p.outcome();
            },
        },
        ...ROBOTS_MATRIX.map(
            (row): CheckDef => ({
                id: `crawler-policy.robots.url.${row.url}`,
                area: 'crawler-policy',
                title: `${row.url}: ${row.star ? 'allowed' : 'disallowed'} for search crawlers, ${row.ai ? 'allowed' : 'disallowed'} for the AI group`,
                refs: row.refs,
                pending: row.pending,
                knownIssue: row.knownIssue,
                fixedBy: row.fixedBy,
                async run({ http }) {
                    const r = await wwwRobots(http);
                    const p = new Problems();
                    for (const [tokens, expected] of [
                        [STAR_TOKENS, row.star],
                        [AI_TOKENS, row.ai],
                    ] as const) {
                        for (const token of tokens) {
                            const v = isAllowed(r, token, row.url);
                            p.check(v.allowed === expected, `${token}: ${describeVerdict(v)}`);
                        }
                    }
                    return p.outcome(describeVerdict(isAllowed(r, 'Googlebot', row.url)));
                },
            })
        ),
        {
            id: 'crawler-policy.robots.md-twins',
            area: 'crawler-policy',
            title: 'robots.txt: the .md twin of every disallowed page directory is disallowed for the same group',
            refs: ['grid#15434 / #15435', 'waf-finding.md §11'],
            pending: MD_TWIN_POLICY.pending,
            async run({ http }) {
                const { open, checked } = crawlableTwins(await wwwRobots(http), '');
                if (!checked) {
                    return fail('no directory Disallow in either group to derive a twin from');
                }
                return open.length
                    ? fail(`${open.length}/${checked} twins crawlable, e.g. ${open.slice(0, 4).join('; ')}`)
                    : pass(`${checked} twins disallowed`);
            },
        },
        {
            id: 'crawler-policy.robots.md-twins-query',
            area: 'crawler-policy',
            title: 'robots.txt: a query string does not reopen the .md twin of a disallowed page',
            refs: ['grid#15434 / #15435', 'waf-finding.md §11'],
            pending: MD_TWIN_POLICY.queryPending,
            async run({ http }) {
                const { open, checked } = crawlableTwins(await wwwRobots(http), MD_TWIN_POLICY.query);
                if (!checked) {
                    return fail('no directory Disallow in either group to derive a twin from');
                }
                return open.length
                    ? fail(
                          `${open.length}/${checked} twins crawlable with a query, e.g. ${open.slice(0, 3).join('; ')}`
                      )
                    : pass(`${checked} twins disallowed with a query`);
            },
        },
        {
            id: 'crawler-policy.robots-vs-waf',
            area: 'crawler-policy',
            title: 'Every crawler the robots AI group welcomes is admitted by the WAF p11 allowlist (live regex)',
            refs: ['SE-78', 'SE-184', 'waf-finding.md §5', 'waf-finding.md §6'],
            async run({ http, live }) {
                const r = await wwwRobots(http);
                const rule = (await live.cfAcl()).Rules.find(
                    (x: any) => x.Name === 'block-nonbrowser-except-ai-assistants'
                );
                const ua = leaves(rule.Statement).filter(
                    (l) => l.kind === 'regex' && l.field === 'header:user-agent'
                ) as any[];
                const p = new Problems();
                // Nothing to compare is a failure, not a pass: a robots file without the AI group, or a
                // p11 without its UA regexes, would otherwise agree vacuously.
                p.check((aiGroup(r)?.agents ?? []).length > 0, 'robots.txt has no AI crawler group');
                p.check(ua.length > 0, 'p11 has no user-agent regexes');
                for (const token of aiGroup(r)?.agents ?? []) {
                    const declared = AI_TOKEN_ADMISSION[token];
                    if (!declared) {
                        p.add(`${token} is in the robots AI group but not declared in AI_TOKEN_ADMISSION`);
                        continue;
                    }
                    if (declared.via === 'token-only' || declared.knownIssue) {
                        continue; // token-only never fetches; known issues have their own checks
                    }
                    p.check(
                        ua.some((l) => regexLeafMatches(l, token)),
                        `${token} welcomed by robots but not admitted by the p11 UA regex`
                    );
                }
                return p.outcome();
            },
        },
        ...Object.entries(AI_TOKEN_ADMISSION)
            .filter(([, v]) => v.knownIssue)
            .map(
                ([token, v]): CheckDef => ({
                    id: `crawler-policy.robots-vs-waf.${token}`,
                    area: 'crawler-policy',
                    title: `${token}: welcomed by robots and admitted by the p11 UA regex`,
                    refs: ['SE-78', 'SE-184'],
                    knownIssue: v.knownIssue,
                    async run({ live }) {
                        const rule = (await live.cfAcl()).Rules.find(
                            (x: any) => x.Name === 'block-nonbrowser-except-ai-assistants'
                        );
                        const ua = leaves(rule.Statement).filter(
                            (l) => l.kind === 'regex' && l.field === 'header:user-agent'
                        ) as any[];
                        return ua.some((l) => regexLeafMatches(l, token))
                            ? pass()
                            : fail('not in the p11 UA allowlist');
                    },
                })
            ),
        {
            id: 'crawler-policy.robots.charts',
            area: 'crawler-policy',
            title: '/charts/robots.txt is a real robots file with a Sitemap, not a soft 404',
            refs: ['SE-182'],
            async run({ http }) {
                const res = await http.get(ROBOTS_FILES.charts);
                const r = parseRobots(res.body);
                const p = new Problems();
                p.eq('status', res.status, 200);
                p.check(!/Not Found/i.test(res.body), 'body says Not Found');
                p.check(
                    r.groups.some((g) => g.agents.includes('*')),
                    'no User-agent: * group'
                );
                p.check(r.sitemaps.length > 0, 'no Sitemap line');
                return p.outcome(r.sitemaps.join(', '));
            },
        },
        {
            id: 'crawler-policy.robots.charts-host',
            area: 'crawler-policy',
            title: 'charts.ag-grid.com/robots.txt: 200 without a redirect, User-agent: * / Disallow: /',
            refs: ['SE-182', 'waf-finding.md §11'],
            async run({ http }) {
                const res = await http.get(ROBOTS_FILES.chartsHost);
                const r = parseRobots(res.body);
                const p = new Problems();
                p.eq('status', res.status, 200);
                // The whole parsed policy, not one crawler on one path: an extra group, an Allow or a
                // narrower Disallow all reopen part of the legacy host.
                p.diff('robots', r, CHARTS_HOST_ROBOTS);
                return p.outcome();
            },
        },
        {
            id: 'crawler-policy.robots.studio',
            area: 'crawler-policy',
            title: '/studio/robots.txt is either a real robots file or a 404, never a 200 "Not Found"',
            refs: ['waf-finding.md §13'],
            knownIssue: 'waf-finding.md §13 (/studio/robots.txt returns 200 with the body "Not Found")',
            async run({ http }) {
                const res = await http.get(ROBOTS_FILES.studio);
                if (res.status === 404) {
                    return pass('404');
                }
                return parseRobots(res.body).groups.length
                    ? pass()
                    : fail(`${res.status} with body ${JSON.stringify(res.body.slice(0, 40))}`);
            },
        },
        ...(
            [
                ['https://ag-grid.com/robots.txt', undefined],
                [
                    'https://blog.ag-grid.com/robots.txt',
                    NEW_FINDING('blog.ag-grid.com/robots.txt 301s to /blog/robots.txt, which is a 404'),
                ],
            ] as const
        ).map(
            ([url, knownIssue]): CheckDef => ({
                id: `crawler-policy.robots.legacy.${new URL(url).host}`,
                area: 'crawler-policy',
                title: `${url} 301s to the www robots.txt`,
                refs: knownIssue ? ['SE-89', 'SE-4', FIRST_RUN] : ['SE-89', 'SE-4'],
                knownIssue,
                async run({ http }) {
                    const res = await http.head(url);
                    const p = new Problems();
                    p.eq('status', res.status, 301);
                    p.eq('Location', header(res, 'location'), `${WWW}/robots.txt`);
                    return p.outcome();
                },
            })
        ),
    ];
}
