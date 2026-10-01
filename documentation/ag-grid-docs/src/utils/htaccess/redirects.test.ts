import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FRAMEWORKS, FRAMEWORK_LANDING_HUBS } from '../../constants';
import { getHtaccessContent } from './htaccessRules';
import { compileHtaccess, followRedirects, route, samplePath } from './htaccessSimulator';
import type { Redirect } from './redirects';
import { IGNORE_PAGES, SITE_301_REDIRECTS, SITE_SINGLE_HOP_REWRITES } from './redirects';

const SRC = fileURLToPath(new URL('../../', import.meta.url));
const WWW = 'https://www.ag-grid.com';

/**
 * The URL paths the site build produces, derived from the sources rather than a built dist so the
 * check always runs: docs pages per framework (honouring each page's `frameworks` restriction),
 * the static Astro pages and endpoints, and the dynamic routes as patterns. A framework root
 * without a landing hub (/javascript-data-grid/) only forwards to its getting-started page in the
 * browser, so it is not a destination: a redirect to it costs a second hop. (Framework-agnostic
 * forwarders such as /documentation/ are destinations: they pick the visitor's own framework.)
 */
function buildSiteRoutes() {
    const pages = new Set<string>(['/', '/sitemap-index.xml', '/sitemap-0.xml']);
    const forwarders = new Set<string>();
    const patterns: RegExp[] = [];

    const docsDir = join(SRC, 'content/docs');
    for (const page of readdirSync(docsDir)) {
        const file = join(docsDir, page, 'index.mdoc');
        if (!existsSync(file)) {
            continue;
        }
        const restriction = readFileSync(file, 'utf8').match(/^frameworks:\s*\[(.*)\]/m)?.[1];
        for (const framework of FRAMEWORKS) {
            if (!restriction || restriction.includes(`"${framework}"`) || restriction.includes(`'${framework}'`)) {
                pages.add(`/${framework}-data-grid/${page}/`);
            }
        }
    }
    for (const framework of FRAMEWORKS) {
        (FRAMEWORK_LANDING_HUBS.includes(framework) ? pages : forwarders).add(`/${framework}-data-grid/`);
    }

    const pagesDir = join(SRC, 'pages');
    const walk = (dir: string): string[] =>
        readdirSync(dir).flatMap((name) => {
            const full = join(dir, name);
            return statSync(full).isDirectory() ? walk(full) : [full];
        });
    for (const file of walk(pagesDir)) {
        const rel = relative(pagesDir, file);
        if (rel.startsWith('[framework]-data-grid/') || rel === '404.astro') {
            continue;
        }
        const isPage = rel.endsWith('.astro');
        if (!isPage && !rel.endsWith('.ts')) {
            continue;
        }
        const route = `/${rel.replace(/\.(astro|ts)$/, '').replace(/(^|\/)index$/, '')}`;
        const url = isPage ? `${route.replace(/\/$/, '')}/` : route;
        if (url.includes('[')) {
            patterns.push(new RegExp(`^${url.replace(/\./g, '\\.').replace(/\[[^\]]+\]/g, '[^/]+')}$`));
            continue;
        }
        pages.add(url);
    }

    const publicDir = join(SRC, '../public');
    const isPublicFile = (path: string) =>
        existsSync(join(publicDir, path)) && statSync(join(publicDir, path)).isFile();

    return {
        /** Built at exactly this path, not merely matching a dynamic route. */
        isStaticPage: (path: string) => pages.has(path),
        isPage: (path: string) =>
            pages.has(path) || patterns.some((pattern) => pattern.test(path)) || isPublicFile(path),
        isForwarder: (path: string) => forwarders.has(path),
    };
}

// Paths served by something other than this build: the blog (reverse-proxied Ghost), the
// /charts/ and /studio/ sites (their own repos), and the pages IGNORE_PAGES names.
const isOwnedElsewhere = (path: string) =>
    /^\/(blog|charts|studio)\//.test(path) || IGNORE_PAGES.some((page) => path.startsWith(page));

const handledByDocroot = (url: URL) =>
    /(^|\.)ag-grid\.com$/.test(url.hostname) &&
    url.hostname !== 'charts.ag-grid.com' &&
    !isOwnedElsewhere(url.pathname);

const fromOf = (redirect: Redirect) => ('from' in redirect ? redirect.from : redirect.fromPattern);

describe('redirects', () => {
    const files = [compileHtaccess(getHtaccessContent({ env: 'production' }))];
    const routes = buildSiteRoutes();
    const allRedirects = [...SITE_SINGLE_HOP_REWRITES, ...SITE_301_REDIRECTS];
    const followFromWww = (path: string) => followRedirects(files, { url: `${WWW}${path}` }, handledByDocroot);

    // Each redirect source, in its canonical (slashed) form - plus the slash-less form a
    // `from` was written with. A slash-less request first takes the generic add-slash 301, so
    // that hop is not counted against the rule.
    const probes = allRedirects.flatMap((redirect) => {
        const from = 'from' in redirect ? redirect.from : samplePath(redirect.fromPattern);
        const slashed = from.endsWith('/') || /\.[a-z0-9]+$/i.test(from) ? [] : [`${from}/`];
        return [from, ...slashed].map((path) => ({ redirect, path }));
    });
    const hopsAfterSlash = (path: string) =>
        followFromWww(path).hops.filter((hop, i) => !(i === 0 && hop.location === `${WWW}${path}/`));

    it('every source pattern can be probed', () => {
        // samplePath throws for a pattern it cannot exercise; this keeps that visible as a test.
        expect(probes.length).toBeGreaterThan(allRedirects.length);
    });

    // SE-64 / SE-66 / SE-86: a legacy URL must reach its destination in ONE 301. A target that is
    // itself redirected (a client-side forwarder such as /javascript-data-grid/, a slash-less path
    // that then picks up the trailing slash, or a URL a broader rule redirects again) adds a hop.
    it('every redirect lands on its final URL in a single hop', () => {
        const chains = probes
            .filter(({ redirect }) => !('gone' in redirect))
            .flatMap(({ path }) => {
                const hops = hopsAfterSlash(path);
                return hops.length > 1 ? [`${path} -> ${hops.map((hop) => hop.location).join(' -> ')}`] : [];
            });
        expect([...new Set(chains)]).toEqual([]);
    });

    it('every redirect ends on a page the site builds, not a 404 or a client-side forwarder', () => {
        const dead = probes
            .filter(({ redirect }) => !('gone' in redirect))
            .flatMap(({ path }) => {
                const { final } = followFromWww(path);
                const url = new URL(final.url);
                if (!/(^|\.)ag-grid\.com$/.test(url.hostname) || isOwnedElsewhere(url.pathname)) {
                    return [];
                }
                if (routes.isForwarder(url.pathname)) {
                    return [`${path} -> ${final.url} (client-side forwarder)`];
                }
                return routes.isPage(url.pathname) ? [] : [`${path} -> ${final.url} (no such page)`];
            });
        expect([...new Set(dead)]).toEqual([]);
    });

    // waf-finding.md §20.4: mod_alias takes the first match, so a second entry for the same source
    // never fires - and two of them named a different target, so the file disagreed with Apache.
    it.each([
        ['SITE_301_REDIRECTS', SITE_301_REDIRECTS],
        ['SITE_SINGLE_HOP_REWRITES', SITE_SINGLE_HOP_REWRITES],
    ])('no two entries in %s share a source, so none is dead', (_name, redirects: Redirect[]) => {
        const sources = redirects.map(fromOf);
        expect(sources.filter((source, i) => sources.indexOf(source) !== i)).toEqual([]);
    });

    it('keeps the target that was firing for the two sources that had conflicting entries', () => {
        expect(followFromWww('/javascript-data-grid/building/').hops.map((hop) => hop.location)).toEqual([
            `${WWW}/javascript-data-grid/installation/`,
        ]);
        expect(
            followFromWww('/javascript-data-grid/server-side-model-high-frequency/').hops.map((hop) => hop.location)
        ).toEqual([`${WWW}/javascript-data-grid/server-side-model-updating-transactions/`]);
    });

    // SE-28 / SE-29: destinations name the canonical host, never the bare apex or http.
    it('every absolute target is https on www.ag-grid.com (or another site entirely)', () => {
        const nonCanonical = allRedirects
            .flatMap((redirect) => ('to' in redirect ? [redirect.to] : []))
            .filter((to) => /^https?:\/\//.test(to))
            .filter((to) => {
                const url = new URL(to);
                return (
                    /(^|\.)ag-grid\.com$/.test(url.hostname) &&
                    (url.protocol !== 'https:' || url.hostname !== 'www.ag-grid.com')
                );
            });
        expect(nonCanonical).toEqual([]);
    });

    // A redirect from a URL the build still produces hides that page.
    it('no redirect or 410 source is a page the site still builds', () => {
        // A slash-less source that redirects to its own slashed page is canonicalisation, not shadowing.
        const shadowed = allRedirects
            .filter((redirect) => 'from' in redirect)
            .filter((redirect) => !('to' in redirect && redirect.to === `${WWW}${fromOf(redirect)}/`))
            .map(fromOf)
            .filter((from) => routes.isStaticPage(from.endsWith('/') ? from : `${from}/`) && !from.includes('.'));
        expect(shadowed).toEqual([]);
    });

    // SE-61 / SE-188: removed content answers 410 Gone, which de-indexes faster than a 404.
    it('every gone source answers 410 Gone, with and without a trailing slash where it applies', () => {
        const gone = probes.filter(({ redirect }) => 'gone' in redirect);
        expect(gone.length).toBeGreaterThan(0);
        const wrong = gone
            .map(({ path }) => ({ path, outcome: route(files, { url: `${WWW}${path}` }) }))
            .filter(({ path, outcome }) => {
                if (outcome.type === 'redirect' && outcome.location === `${WWW}${path}/`) {
                    // The slash-less form is slashed first; the slashed form must then be Gone.
                    return route(files, { url: outcome.location }).type !== 'status';
                }
                return !(outcome.type === 'status' && outcome.status === 410);
            })
            .map(({ path, outcome }) => `${path}: ${JSON.stringify(outcome)}`);
        expect(wrong).toEqual([]);
    });

    // SE-186: Bing still probes the conventional /sitemap.xml; the real index is /sitemap-index.xml.
    it('sends /sitemap.xml to the sitemap index in one hop, which is then served', () => {
        const chain = followFromWww('/sitemap.xml');
        expect(chain.hops.map((hop) => [hop.status, hop.location])).toEqual([[301, `${WWW}/sitemap-index.xml`]]);
        expect(chain.final.outcome).toMatchObject({ type: 'serve', path: '/sitemap-index.xml' });
    });

    // SE-64 / SE-66: the single-hop rewrites run before the https upgrade and host swap, so a
    // legacy path lands on its final www URL in ONE hop from the apex or over http too, keeping
    // any inbound query string.
    it('every single-hop rewrite resolves in one hop from the apex and www, over http and https', () => {
        const origins = ['http://ag-grid.com', 'https://ag-grid.com', 'http://www.ag-grid.com', WWW];
        const wrong = SITE_SINGLE_HOP_REWRITES.flatMap((rule) =>
            origins.flatMap((origin) => {
                const outcome = route(files, { url: `${origin}${rule.from}?utm_source=x` });
                const expected = `${rule.to}?utm_source=x`;
                return outcome.type === 'redirect' && outcome.status === 301 && outcome.location === expected
                    ? []
                    : [`${origin}${rule.from}: ${JSON.stringify(outcome)}`];
            })
        );
        expect(wrong).toEqual([]);
    });
});
