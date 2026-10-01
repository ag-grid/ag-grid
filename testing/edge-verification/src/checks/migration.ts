import { MARKDOWN_ACCEPT, type Response, describeChain, header, headerTokens } from '../core/http';
import { type CheckDef, Problems, budgeted, fail, pass, skip } from '../core/types';
import {
    BACKUP_NAME,
    MIGRATED_SITES,
    MIGRATION_HOSTS,
    MIGRATION_PENDING,
    MIGRATION_QUERY,
    MIGRATION_REFS,
    type MigratedSite,
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
        async run({ http }) {
            const from = `https://${host}${path}`;
            const first = await http.head(from);
            const location = header(first, 'location');
            const resolved = location ? new URL(location, from).href : undefined;
            const p = new Problems();
            p.eq('first status', first.status, 301);
            p.eq('Location', resolved, `${WWW}${path}`);
            const chain: Response[] = [first];
            if (!p.count && resolved) {
                const final = await http.head(resolved);
                chain.push(final);
                p.eq('final status (one hop)', final.status, 200);
            }
            return p.outcome(describeChain(chain));
        },
    });

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
        title: `${base}/${BACKUP_NAME} is not served (403 or 404)`,
        ...lifecycle,
        refs: ['grid#15430'],
        async run({ http }) {
            const res = await http.head(`${WWW}${base}/${BACKUP_NAME}`);
            return res.status === 403 || res.status === 404
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
