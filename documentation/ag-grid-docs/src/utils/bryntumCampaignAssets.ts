import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

const ASSETS_BASE = '/images/campaigns/bryntum-products';
const BRYNTUM_ROOT = 'https://bryntum.com';

// Tracking parameter appended to outbound links from the Bryntum campaign
// pages, so Bryntum can attribute traffic back to the AG Grid landing page.
const BRYNTUM_UTM_KEY = 'aw';
const BRYNTUM_UTM_VALUE = 'ag-ag-grid';
const BRYNTUM_UTM = `${BRYNTUM_UTM_KEY}=${BRYNTUM_UTM_VALUE}`;
const BRYNTUM_HOST_RE = /^https?:\/\/(?:www\.)?bryntum\.com\b/i;

export const resolveBryntumAsset = (src: string | undefined, productSlug: string): string => {
    if (!src) {
        return '';
    }
    if (src.startsWith('http')) {
        return src;
    }

    const assetsPrefix = '../assets/';
    if (src.startsWith(assetsPrefix)) {
        const remainder = src.slice(assetsPrefix.length);
        return urlWithBaseUrl(`${ASSETS_BASE}/${remainder}`);
    }

    if (src.startsWith('/images/')) {
        return urlWithBaseUrl(src);
    }

    const filename = src.split('/').pop() ?? src;
    return urlWithBaseUrl(`${ASSETS_BASE}/${productSlug}/${filename}`);
};

// Append the AG → Bryntum tracking param to URLs that point at bryntum.com.
// Returns the URL untouched for non-Bryntum hosts and for URLs that already
// carry the param (idempotent).
export const withBryntumUtm = (url: string): string => {
    if (!BRYNTUM_HOST_RE.test(url)) {
        return url;
    }
    if (new RegExp(`[?&]${BRYNTUM_UTM_KEY}=`).test(url)) {
        return url;
    }
    const [base, hash = ''] = url.split('#');
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${BRYNTUM_UTM}${hash ? `#${hash}` : ''}`;
};

// Walk an HTML string and apply withBryntumUtm() to every anchor href that
// points at bryntum.com. Used for body_html content from JSON files where we
// can't decorate hrefs at the call site.
export const decorateBryntumHtml = (html: string | undefined): string => {
    if (!html) {
        return '';
    }
    return html.replace(
        /(<a\b[^>]*\bhref=)(["'])(https?:\/\/(?:www\.)?bryntum\.com[^"']*)\2/gi,
        (_match, prefix, quote, url) => `${prefix}${quote}${withBryntumUtm(url)}${quote}`
    );
};

export const resolveBryntumHref = (href: string | undefined): string => {
    if (!href) {
        return '#';
    }
    if (href.startsWith('mailto:') || href.startsWith('#')) {
        return href;
    }
    if (href.startsWith('http')) {
        return withBryntumUtm(href);
    }
    if (href.startsWith('/')) {
        return withBryntumUtm(`${BRYNTUM_ROOT}${href}`);
    }
    return withBryntumUtm(`${BRYNTUM_ROOT}/${href}`);
};
