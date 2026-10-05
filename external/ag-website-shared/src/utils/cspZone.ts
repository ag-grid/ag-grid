/**
 * Keeps a document under the Content-Security-Policy it was served with.
 *
 * The policy is a response header, and a document keeps the one it was loaded with for as long as it
 * lives. The production vhost serves a different policy to each site (grid, charts and studio are
 * separate builds behind one origin) and to the campaign pages, which also allow bryntum.com and
 * 'unsafe-inline'. Astro's `<ClientRouter />` swaps the next page into the current document without a
 * new response, so a navigation from one zone into another leaves the incoming page's scripts, styles
 * and requests running under the previous zone's policy: its hashed inline scripts and its bryntum.com
 * bundle are blocked, and so are the origins only the other zone's policy allows.
 *
 * Crossing a zone therefore has to be a full page load. Pages that do not carry the router (the example
 * runner, archived docs, the blog and the ecommerce SPA) already get one from Astro, so only zones whose
 * pages do carry it are listed.
 *
 * Keep the zones in step with the path conditions in each site's `cspRules.ts`.
 */

const CSP_ZONES: { zone: string; pattern: RegExp }[] = [
    // Also matches the archived copies, which are served with the campaigns policy (CAMPAIGNS_PATH_CONDITION)
    { zone: 'campaigns', pattern: /^(?:\/archive\/[^/]+)?\/campaigns\// },
    { zone: 'charts', pattern: /^\/charts\// },
    { zone: 'studio', pattern: /^\/studio\// },
];

const DEFAULT_CSP_ZONE = 'grid';

export function getCspZone(pathname: string): string {
    return CSP_ZONES.find(({ pattern }) => pattern.test(pathname))?.zone ?? DEFAULT_CSP_ZONE;
}

export function initFullReloadAcrossCspZones() {
    document.addEventListener('astro:before-preparation', (event) => {
        const { from, to } = event as Event & { from: URL; to: URL };

        if (getCspZone(from.pathname) !== getCspZone(to.pathname)) {
            // A cancelled preparation makes the router fall back to loading `to` as a new document
            event.preventDefault();
        }
    });
}
