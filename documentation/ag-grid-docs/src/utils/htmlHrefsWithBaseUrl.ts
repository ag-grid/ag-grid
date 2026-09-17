import { SITE_BASE_URL } from '../constants';
import { urlWithBaseUrl } from './urlWithBaseUrl';

/**
 * Prefix the root-relative `href`s in an inline HTML fragment with the site's base URL, for content
 * written as HTML (policy intros, for example) that a page renders with `set:html`. External,
 * anchor and already-prefixed links are left alone, as `urlWithBaseUrl` leaves them.
 */
export function htmlHrefsWithBaseUrl(html: string, siteBaseUrl: string = SITE_BASE_URL): string {
    return html.replace(
        /(<a\b[^>]*\bhref=)(["'])(\/[^"']*)\2/gi,
        (_match, prefix, quote, url) => `${prefix}${quote}${urlWithBaseUrl(url, siteBaseUrl)}${quote}`
    );
}
