import { markdownLinks, markdownSections, twinOf } from '../core/html';
import { type Http, describeChain, header } from '../core/http';
import { type CheckDef, Problems, budgeted, fail, pass } from '../core/types';
import {
    ADVERTISED_LINKS,
    AGENT_SITES,
    ARCHIVE_LLMS,
    type AgentSite,
    IGNORED_LINKS,
    INDEX_SAMPLE_SIZE,
    KNOWN_BROKEN,
    SERVER_CARD,
    TWIN_SAMPLE_SIZE,
} from '../expected/agentFiles';

const WWW_HOST = 'www.ag-grid.com';
const MAX_HOPS = 1;

async function resolves(http: Http, url: string): Promise<string | undefined> {
    const chain = await http.follow(url, { maxHops: MAX_HOPS });
    const hops = chain.length - 1;
    const last = chain[chain.length - 1];
    if (last.status !== 200 || hops > MAX_HOPS) {
        return describeChain(chain);
    }
    return undefined;
}

async function fetchSections(http: Http, site: AgentSite): Promise<Map<string, string>> {
    const res = await http.get(site.llms);
    if (res.status !== 200) {
        throw new Error(`${site.llms} returned ${res.status}`);
    }
    return markdownSections(res.body);
}

function linksIn(sections: Map<string, string>, names: string[]): string[] {
    return [...new Set(names.flatMap((n) => markdownLinks(sections.get(n) ?? '')))];
}

/** Evenly spaced, deterministic sample. */
function sample<T>(items: T[], n: number): T[] {
    if (items.length <= n) {
        return items;
    }
    return Array.from({ length: n }, (_, i) => items[Math.floor(((i + 0.5) * items.length) / n)]);
}

/** Resolves each URL, adding every failure to `p` as it is found; returns how many were checked. */
async function checkAll(http: Http, urls: string[], p: Problems): Promise<number> {
    let checked = 0;
    for (const url of urls) {
        if (KNOWN_BROKEN[url] || IGNORED_LINKS.has(url)) {
            continue;
        }
        checked++;
        const problem = await resolves(http, url);
        if (problem) {
            p.add(problem);
        }
    }
    return checked;
}

function siteChecks(site: AgentSite): CheckDef[] {
    const prefix = `agent-files.${site.id}`;
    return [
        {
            id: `${prefix}.llms`,
            area: 'agent-files',
            title: `${site.llms}: text/plain, titled, with the curated and index sections`,
            refs: ['SE-77', 'SE-79'],
            async run({ http }) {
                const res = await http.get(site.llms);
                const sections = markdownSections(res.body);
                const p = new Problems();
                p.eq('status', res.status, 200);
                p.check(
                    /^text\/plain/.test(header(res, 'content-type') ?? ''),
                    `content-type ${header(res, 'content-type')}`
                );
                p.check(res.body.startsWith('# '), 'does not start with an H1');
                // Each section present and populated: a heading the index generator left empty is a
                // broken index, not a pass over zero links.
                for (const s of [...site.curated, ...site.index].filter(Boolean)) {
                    p.check(sections.has(s), `missing section "## ${s}"`);
                    p.check(
                        !sections.has(s) || markdownLinks(sections.get(s)!).length > 0,
                        `section "## ${s}" has no links`
                    );
                }
                p.check(/Accept: text\/markdown/.test(res.body), 'does not mention Accept: text/markdown');
                return p.outcome(`${markdownLinks(res.body).length} links`);
            },
        },
        {
            id: `${prefix}.curated-links`,
            area: 'agent-files',
            title: `Every curated link in ${site.id} llms.txt and AGENTS.md resolves (200, at most 1 redirect)`,
            refs: ['SE-77', 'SE-79', 'waf-finding.md §13 T8'],
            run: budgeted(async ({ http }, p) => {
                const sections = await fetchSections(http, site);
                const empty = site.curated.filter((n) => n && !markdownLinks(sections.get(n) ?? '').length);
                p.check(!empty.length, `curated sections with no links: ${empty.join(', ')}`);
                const curated = linksIn(sections, site.curated);
                const agents = markdownLinks((await http.get(site.agents)).body);
                const checked = await checkAll(http, [...new Set([...curated, ...agents])], p);
                return p.outcome(`${checked} links`);
            }),
        },
        {
            id: `${prefix}.md-twins`,
            area: 'agent-files',
            title: `The .md twins ${site.id} advertises resolve as text/markdown`,
            refs: ['SE-80', 'SE-77'],
            run: budgeted(async ({ http, opts }, p) => {
                const sections = await fetchSections(http, site);
                const links = linksIn(sections, site.curated);
                const explicit = links.filter((l) => l.endsWith('.md'));
                // Only pages that answer 200 directly have a twin; a redirecting link is not a page.
                const pages: string[] = [];
                for (const link of links) {
                    const twin = twinOf(link);
                    if (
                        twin &&
                        (opts.fullLinks || pages.length < TWIN_SAMPLE_SIZE) &&
                        (await http.head(link)).status === 200
                    ) {
                        pages.push(twin);
                    }
                }
                const twins = [...new Set([...explicit, ...pages])];
                const eligible = twins.filter((twin) => !KNOWN_BROKEN[twin] && !IGNORED_LINKS.has(twin));
                // A run that tested no twin proves nothing: no links, no page answering 200, or every
                // twin known broken or ignored.
                p.check(eligible.length > 0, `no eligible twin to test (of ${twins.length} found)`);
                for (const twin of eligible) {
                    const res = await http.head(twin);
                    p.check(
                        res.status === 200 && /^text\/markdown/.test(header(res, 'content-type') ?? ''),
                        `${twin}: ${res.status} ${header(res, 'content-type')}`
                    );
                }
                return p.outcome(`${eligible.length} twins`);
            }),
        },
        {
            id: `${prefix}.index-links`,
            area: 'agent-files',
            title: `${site.id} llms.txt index links resolve (sample of ${INDEX_SAMPLE_SIZE}, all with --full-links)`,
            refs: ['SE-77', 'waf-finding.md §13 T8'],
            run: budgeted(async ({ http, opts }, p) => {
                const sections = await fetchSections(http, site);
                const empty = site.index.filter((n) => !markdownLinks(sections.get(n) ?? '').length);
                p.check(!empty.length, `index sections with no links: ${empty.join(', ')}`);
                const all = linksIn(sections, site.index);
                const chosen = opts.fullLinks ? all : sample(all, INDEX_SAMPLE_SIZE);
                const checked = await checkAll(http, chosen, p);
                // The twins of the default sample, in either mode: --full-links widens the page check
                // but must not drop the twin check (twins of every index page would double the run).
                const direct: string[] = [];
                for (const link of opts.fullLinks ? sample(all, INDEX_SAMPLE_SIZE) : chosen) {
                    const twin = twinOf(link);
                    if (twin && (await http.head(link)).status === 200) {
                        direct.push(twin);
                    }
                }
                const twins = await checkAll(http, direct, p);
                return p.outcome(`${checked} of ${all.length} index links (+ ${twins} twins)`);
            }),
        },
        {
            id: `${prefix}.agents-md`,
            area: 'agent-files',
            title: `${site.agents}: text/markdown; charset=utf-8, points agents at llms.txt`,
            refs: ['SE-77', 'SE-79'],
            async run({ http }) {
                const res = await http.get(site.agents);
                const p = new Problems();
                p.eq('status', res.status, 200);
                p.eq('content-type', header(res, 'content-type'), 'text/markdown; charset=utf-8');
                for (const phrase of site.agentsMustMention) {
                    p.check(res.body.includes(phrase), `does not mention ${phrase}`);
                }
                return p.outcome();
            },
        },
    ];
}

export function agentFileChecks(): CheckDef[] {
    return [
        ...AGENT_SITES.flatMap(siteChecks),
        ...Object.entries(KNOWN_BROKEN).map(([url, lifecycle]): CheckDef => ({
            id: `agent-files.known.${url.replace('https://www.ag-grid.com', '')}`,
            area: 'agent-files',
            title: `${url} (advertised to agents) resolves`,
            refs: ['SE-77'],
            knownIssue: lifecycle.knownIssue,
            fixedBy: lifecycle.fixedBy,
            async run({ http }) {
                const problem = await resolves(http, url);
                return problem ? fail(problem) : pass();
            },
        })),
        ...ADVERTISED_LINKS.map((link): CheckDef => ({
            id: `agent-files.link.${link.id}`,
            area: 'agent-files',
            title: `${new URL(link.file).pathname} links ${link.label ? `[${link.label}](${link.url})` : link.url}${link.notUrl ? `, not ${link.notUrl}` : ''}`,
            refs: link.refs,
            pending: link.pending,
            knownIssue: link.knownIssue,
            fixedBy: link.fixedBy,
            async run({ http }) {
                const res = await http.get(link.file);
                if (res.status !== 200) {
                    return fail(`${link.file} returned ${res.status}`);
                }
                const p = new Problems();
                const links = markdownLinks(res.body);
                if (link.label) {
                    const labelled = [...res.body.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)]
                        .filter((m) => m[1] === link.label)
                        .map((m) => m[2]);
                    p.eq(`[${link.label}] targets`, labelled, [link.url]);
                } else {
                    p.check(links.includes(link.url), `no link to ${link.url}`);
                }
                if (link.notUrl) {
                    p.check(!links.includes(link.notUrl), `still links ${link.notUrl}`);
                }
                if (!p.count) {
                    // Served as it is, with no redirect: an agent should not spend a hop on it.
                    const target = await http.head(link.url);
                    p.eq(`${link.url} status`, target.status, 200);
                }
                return p.outcome();
            },
        })),
        {
            id: 'agent-files.server-card',
            area: 'agent-files',
            title: '/.well-known/mcp/server-card.json names ag-mcp over stdio and its links resolve',
            refs: ['SE-79'],
            run: budgeted(async ({ http }, p) => {
                const res = await http.get(SERVER_CARD.url);
                p.eq('status', res.status, 200);
                p.check(
                    /^application\/json/.test(header(res, 'content-type') ?? ''),
                    `content-type ${header(res, 'content-type')}`
                );
                let card: any = {};
                try {
                    card = JSON.parse(res.body);
                } catch {
                    p.add('not valid JSON');
                }
                p.eq('name', card.name, SERVER_CARD.name);
                p.eq('title', card.title, SERVER_CARD.title);
                p.eq('documentation', card.documentation, SERVER_CARD.docs);
                p.eq('homepage', card.homepage, SERVER_CARD.docs);
                p.eq('repository', card.repository?.url, SERVER_CARD.repository);
                p.eq('package', card.packages?.[0], SERVER_CARD.package);
                p.eq('mcpServers', card.mcpServers, SERVER_CARD.mcpServers);
                for (const url of [SERVER_CARD.docs, SERVER_CARD.repository]) {
                    const problem = await resolves(http, url);
                    p.check(!problem, `${url}: ${problem}`);
                }
                return p.outcome();
            }),
        },
        {
            id: 'agent-files.archive-llms',
            area: 'agent-files',
            title: 'An archive’s llms.txt links into the archive, not the current docs',
            refs: ['waf-finding.md §13'],
            knownIssue: 'waf-finding.md §13 (/archive/36.2.0/llms.txt links the current docs)',
            async run({ http }) {
                const res = await http.get(ARCHIVE_LLMS.url);
                if (res.status !== 200) {
                    return fail(`${res.status}`);
                }
                const outside = markdownLinks(res.body).filter(
                    (l) => l.includes(WWW_HOST) && !l.startsWith(ARCHIVE_LLMS.base)
                );
                return outside.length ? fail(`${outside.length} links leave the archive, e.g. ${outside[0]}`) : pass();
            },
        },
    ];
}
