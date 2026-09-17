import { getFileExtension } from '@utils/client/getFileExtension';

import { isExternalLink } from './isExternalLink';

/**
 * Add a trailing slash to a URL's path, inserting it before any query string or hash.
 *
 * The query and hash are never sent to the server, so `/docs#section` still costs a 301 hop to
 * `/docs/#section` on a trailing-slash site - the slash has to go on the path itself. Use this for
 * cross-site URLs that are already absolute; `addTrailingSlash` is the site-relative equivalent.
 *
 * Returned unchanged: a URL with no path of its own (`#section`, `?x=1`, or an empty string), a
 * path that already ends in `/`, and a file (`guide.pdf`, `example.json`) - a slash after a file
 * name is a 404, not a canonical page.
 */
export function addTrailingSlashToPath(url: string) {
    const suffixIndex = url.match(/[?#]/)?.index ?? url.length;
    const path = url.slice(0, suffixIndex);
    const suffix = url.slice(suffixIndex);

    if (path === '' || path.endsWith('/') || isFilePath(path)) {
        return url;
    }

    return `${path}/${suffix}`;
}

/**
 * The same extension test the docs-site `urlWithPrefix` uses. A purely numeric "extension" is a
 * version segment (`/archive/36.0.0`), which every archive site serves as a directory, not a file.
 */
function isFilePath(path: string) {
    const extension = getFileExtension(path);

    return extension != null && !/^\d+$/.test(extension);
}

/**
 * As `addTrailingSlashToPath`, but leaves external (`http`/`mailto`) links untouched - we do not
 * control whether a third-party site is trailing-slash canonical.
 */
export function addTrailingSlash(url: string) {
    return isExternalLink(url) ? url : addTrailingSlashToPath(url);
}

/**
 * Whether the pathname points at a file rather than a page.
 *
 * `getFileExtension` is the same test the docs site's `urlWithPrefix` uses, with one exception: a
 * purely numeric "extension" is a version directory (`/archive/26.0.0`), not a file.
 */
function isFilePath(pathname: string) {
    const fileExtension = getFileExtension(pathname);
    return fileExtension !== undefined && !/^\d+$/.test(fileExtension);
}

/**
 * Canonicalise a page url so it is served directly, rather than via a redirect.
 *
 * Site pages are directory indexes, so the slash-less `/page` only reaches `/page/` through a 301.
 * The slash is inserted into the pathname, ahead of any query string or fragment. Urls with no
 * pathname (`#section`, `?x=1`, ``) and file urls (`guide.pdf`) are returned unchanged.
 */
export function addTrailingSlashToPath(url: string) {
    const suffixStart = url.search(/[?#]/);
    const pathname = suffixStart === -1 ? url : url.slice(0, suffixStart);
    const suffix = suffixStart === -1 ? '' : url.slice(suffixStart);

    if (pathname === '' || pathname.endsWith('/') || isFilePath(pathname)) {
        return url;
    }

    return `${pathname}/${suffix}`;
}
