import { urlWithBaseUrl } from './urlWithBaseUrl';

function addTrailingSlash(path: string) {
    return path.slice(-1) === '/' ? path : `${path}/`;
}

export async function getSitemapIgnorePaths() {
    const ignorePaths = [
        urlWithBaseUrl('/debug'),
        urlWithBaseUrl('/examples'),
        urlWithBaseUrl('/archive'),
        urlWithBaseUrl('/campaigns'),

        // NOTE: /data-grid/ framework redirect pages are deliberately NOT disallowed: they are
        // crawlable so their static links to the framework pages can be followed for SEO. They
        // are still excluded from the sitemap (see sitemap.ts `isRedirectPage`).

        // Test pages
        urlWithBaseUrl('/*-data-grid/*-test'),

        // Release note stubs — minimal content, crawl waste
        urlWithBaseUrl('/changelog/releases'),

        // Opt out success page
        urlWithBaseUrl('/privacy/your-choice'),
    ];
    const folderPaths = ignorePaths.map(addTrailingSlash);

    return folderPaths.concat(urlWithBaseUrl('/404'), urlWithBaseUrl('/*searchQuery='));
}

export async function getSitemapAllowPaths() {
    const allowPaths = [
        urlWithBaseUrl('/campaigns/bryntum-gantt'),
        urlWithBaseUrl('/campaigns/bryntum-calendar'),
        urlWithBaseUrl('/campaigns/bryntum-complete'),
        urlWithBaseUrl('/campaigns/bryntum-scheduler'),
        urlWithBaseUrl('/campaigns/bryntum-scheduler-pro'),
        urlWithBaseUrl('/campaigns/bryntum-task-board'),
    ];

    // SE-182: the bare archive roots 301 to the documentation archive. `$` opens the exact root
    // only (it outranks the archive Disallow by one character), so the redirect is crawlable while
    // every archived page stays blocked. Studio's root is absent: it returns 403, not a redirect.
    const archiveRoots = [urlWithBaseUrl('/archive/$'), urlWithBaseUrl('/charts/archive/$')];

    return allowPaths.map(addTrailingSlash).concat(archiveRoots);
}
