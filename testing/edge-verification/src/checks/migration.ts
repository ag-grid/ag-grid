import { type Http, MARKDOWN_ACCEPT, type Response, describeChain, header, headerTokens } from '../core/http';
import { type CheckDef, type Outcome, Problems, budgeted, fail, pass, skip } from '../core/types';
import {
    BACKUP_NAME,
    MIGRATED_SITES,
    MIGRATION_HOSTS,
    MIGRATION_PENDING,
    MIGRATION_QUERY,
    MIGRATION_REFS,
    type MigratedSite,
    SLASHLESS_PENDING,
} from '../expected/migration';
import { WWW } from '../expected/redirects';

const isRedirect = (code: number): boolean => code >= 300 && code < 400;

/** The default run asks only the lowest and highest version of each site; `--only migration` asks all. */
const sampled = (site: MigratedSite, i: number): boolean => i === 0 || i === site.versions.length - 1;

function hostFor(site: MigratedSite, i: number): string {
    if (i === 0) {
        return MIGRATION_HOSTS.lowest;
    }
    if (i === site.versions.length - 1) {
        return MIGRATION_HOSTS.highest;
    }
    return MIGRATION_HOSTS.others[(i - 1) % MIGRATION_HOSTS.others.length];
}

/** A Location inside this archive on www (absolute or root-relative). */
function insideArchive(location: string, base: string): boolean {
    const url = new URL(location, WWW);
    return url.origin === WWW && (url.pathname === base || url.pathname.startsWith(`${base}/`));
}

/** `from` answers one 301 straight to `to`, which answers 200. */
async function oneHop(http: Http, from: string, to: string): Promise<Outcome> {
    const first = await http.head(from);
    const location = header(first, 'location');
    const resolved = location ? new URL(location, from).href : undefined;
    const p = new Problems();
    p.eq('first status', first.status, 301);
    p.eq('Location', resolved, to);
    const chain: Response[] = [first];
    if (!p.count && resolved) {
        const final = await http.head(resolved);
        chain.push(final);
        p.eq('final status (one hop)', final.status, 200);
    }
    return p.outcome(describeChain(chain));
}

function versionChecks(site: MigratedSite, version: string, i: number): CheckDef[] {
    const base = site.base(version);
    const id = `migration.${site.site}.${version}`;
    const lifecycle = { refs: MIGRATION_REFS, onlyWhenSelected: !sampled(site, i) };
    const checks: CheckDef[] = [];

    const host = hostFor(site, i);
    const path = `${base}/${site.page}${MIGRATION_QUERY}`;
    checks.push({
        id: `${id}.alias-host`,
        area: 'migration',
        title: `https://${host}${path} -> one hop to the same archive URL on www`,
        pending: MIGRATION_PENDING,
        ...lifecycle,
        run: ({ http }) => oneHop(http, `https://${host}${path}`, `${WWW}${path}`),
    });

    // A slash-less directory URL, on the alias host and on http www: one hop to the slashed www URL.
    const directory = `${base}/${(site.directoryPage ?? site.page).replace(/\/$/, '')}`;
    for (const [kind, from] of [
        ['alias-host', `https://${host}${directory}${MIGRATION_QUERY}`],
        ['http-www', `http://www.ag-grid.com${directory}${MIGRATION_QUERY}`],
    ]) {
        checks.push({
            id: `${id}.slashless.${kind}`,
            area: 'migration',
            title: `${from} -> one hop to the slashed archive URL on www`,
            ...lifecycle,
            refs: [...MIGRATION_REFS, 'grid#15434', 'grid#15435'],
            pending: SLASHLESS_PENDING,
            run: ({ http }) => oneHop(http, from, `${WWW}${directory}/${MIGRATION_QUERY}`),
        });
    }

    const leaks = [...(site.leaks?.['*'] ?? []), ...(site.leaks?.[version] ?? [])];
    if (leaks.length) {
        checks.push({
            id: `${id}.leaks`,
            area: 'migration',
            title: `${base}/{${leaks.join(',')}} stay inside the archive (404, or a redirect within ${base}/)`,
            pending: MIGRATION_PENDING,
            ...lifecycle,
            run: budgeted(async ({ http }, p) => {
                const seen: string[] = [];
                for (const leak of leaks) {
                    const res = await http.head(`${WWW}${base}/${leak}`);
                    const location = header(res, 'location');
                    seen.push(`${leak} ${res.status}${location ? ` ${location}` : ''}`);
                    if (isRedirect(res.status)) {
                        p.check(!!location && insideArchive(location, base), `${leak} redirects out to ${location}`);
                    } else {
                        p.eq(`${leak} status`, res.status, 404);
                    }
                }
                return p.outcome(seen.join('; '));
            }),
        });
    }

    checks.push({
        id: `${id}.backup-not-served`,
        area: 'migration',
        title: `${base}/${BACKUP_NAME} is not served (403; a 404 is inconclusive)`,
        ...lifecycle,
        refs: ['grid#15430'],
        async run({ http }) {
            const res = await http.head(`${WWW}${base}/${BACKUP_NAME}`);
            // A .ht* denial answers 403 whether or not the file exists; a 404 may only mean no
            // backup has this synthetic timestamp, so it says nothing about real backups.
            if (res.status === 404) {
                return skip(`inconclusive: 404, ${BACKUP_NAME} may not exist, so its protection is unproven`);
            }
            return res.status === 403
                ? pass(String(res.status))
                : fail(`${res.status} (${header(res, 'content-type') ?? 'no content-type'})`);
        },
    });

    if (site.markdown?.includes(version)) {
        const pageUrl = `${WWW}${base}/${site.page}`;
        checks.push({
            id: `${id}.markdown`,
            area: 'migration',
            title: `${base}/${site.page} negotiates markdown on Accept: text/markdown, with Vary: Accept on both variants`,
            pending: MIGRATION_PENDING,
            ...lifecycle,
            async run({ http, live }) {
                await live.prepareGuard();
                const verdict = live.markdownGuard(new URL(pageUrl));
                if (!verdict.allowed) {
                    // The twin by name proves the file is there, not that negotiation works.
                    const twin = await http.head(`${WWW}${base}/${site.page.replace(/\/$/, '')}.md`);
                    return skip(
                        `negotiation not probed (markdown guard: ${verdict.reason}); the .md twin by name answered ${twin.status} ${header(twin, 'content-type') ?? ''}`
                    );
                }
                const p = new Problems();
                const md = await http.request({ url: pageUrl, headers: { accept: MARKDOWN_ACCEPT } });
                p.eq('markdown status', md.status, 200);
                p.check(
                    /^text\/markdown/.test(header(md, 'content-type') ?? ''),
                    `markdown content-type ${header(md, 'content-type')}`
                );
                p.check(headerTokens(md, 'vary').includes('accept'), `markdown Vary ${headerTokens(md, 'vary')}`);
                const html = await http.get(pageUrl);
                p.eq('HTML status', html.status, 200);
                p.check(/^text\/html/.test(header(html, 'content-type') ?? ''), 'HTML variant is not text/html');
                p.check(headerTokens(html, 'vary').includes('accept'), `HTML Vary ${headerTokens(html, 'vary')}`);
                return p.outcome(`guard: ${verdict.reason}`);
            },
        });
    }
    return checks;
}

export function migrationChecks(): CheckDef[] {
    return MIGRATED_SITES.flatMap((site) => site.versions.flatMap((v, i) => versionChecks(site, v, i)));
}
