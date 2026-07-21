import { isExternalLink } from '@ag-website-shared/utils/isExternalLink';

/**
 * Make a site-relative URL absolute against `siteRoot` (the canonical origin, with
 * trailing slash) so links in the generated markdown are portable when the `.md` is
 * read out of context by an LLM. Anchors, already-absolute and external URLs are
 * returned unchanged; if no `siteRoot` is given the URL is returned as-is.
 */
export function toAbsoluteUrl(url: string, siteRoot?: string): string {
    if (!url || !siteRoot) {
        return url;
    }
    if (url.startsWith('#') || isExternalLink(url) || /^[a-z]+:/i.test(url)) {
        return url;
    }
    if (url.startsWith('/')) {
        return siteRoot.replace(/\/$/, '') + url;
    }
    return url;
}
