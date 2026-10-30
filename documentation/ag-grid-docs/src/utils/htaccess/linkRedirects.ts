import { getHtaccessContent } from './htaccessRules';
import type { CompiledHtaccess } from './htaccessSimulator';
import { compileHtaccess, followRedirects } from './htaccessSimulator';
import { IGNORE_PAGES } from './redirects';

const WWW = 'https://www.ag-grid.com';

/**
 * Paths served by something other than this build: the blog (reverse-proxied Ghost), the /charts/
 * and /studio/ sites (their own repos), and the pages IGNORE_PAGES names.
 */
export const isOwnedElsewhere = (path: string) =>
    /^\/(blog|charts|studio)\//.test(path) || IGNORE_PAGES.some((page) => path.startsWith(page));

/**
 * Paths with no page in this build for the link checker to find: those owned elsewhere, and the
 * release archives, which are each deployed from their own build.
 */
export const isServedOutsideBuild = (path: string) => isOwnedElsewhere(path) || path.startsWith('/archive/');

/** Whether this build's docroot answers a request for `url`, rather than another site or host. */
export const handledByDocroot = (url: URL) =>
    /(^|\.)ag-grid\.com$/.test(url.hostname) &&
    url.hostname !== 'charts.ag-grid.com' &&
    !isOwnedElsewhere(url.pathname);

/**
 * Where the production `.htaccess` finally sends a request for `pathname` on the canonical host, or
 * undefined when it is served directly. For the link checker, to name the address a link to a legacy
 * path should use. The rules are compiled on first use, so a build that does not check links does
 * not pay for it.
 */
export function createLinkRedirectResolver() {
    let files: CompiledHtaccess[] | undefined;

    return ({
        pathname,
        fileExists,
        dirExists,
    }: {
        pathname: string;
        fileExists: (urlPath: string) => boolean;
        dirExists: (urlPath: string) => boolean;
    }): string | undefined => {
        files ??= [compileHtaccess(getHtaccessContent({ env: 'production' }))];
        const { hops } = followRedirects(files, { url: `${WWW}${pathname}`, fileExists, dirExists }, handledByDocroot);
        return hops.at(-1)?.location;
    };
}
