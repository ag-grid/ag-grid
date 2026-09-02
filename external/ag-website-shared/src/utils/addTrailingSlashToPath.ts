import { getFileExtension } from '@utils/client/getFileExtension';

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
