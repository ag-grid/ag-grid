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
// carry the param (idempotent). Splits on the first `#` only so URLs that
// embed an extra `#` inside their fragment (e.g. the Bryntum docs SPA's
// "/docs/#path#anchor" pattern) keep the full fragment intact.
export const withBryntumUtm = (url: string): string => {
    if (!BRYNTUM_HOST_RE.test(url)) {
        return url;
    }
    if (new RegExp(`[?&]${BRYNTUM_UTM_KEY}=`).test(url)) {
        return url;
    }
    const hashIdx = url.indexOf('#');
    const base = hashIdx === -1 ? url : url.slice(0, hashIdx);
    const fragment = hashIdx === -1 ? '' : url.slice(hashIdx);
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${BRYNTUM_UTM}${fragment}`;
};

// Path prefixes inside curated body_html that originated from bryntum.com and
// must be repointed at the Bryntum site. Anything else (e.g. absolute URLs to
// blog.ag-grid.com) is left alone so /campaigns/bryntum- pages don't end up
// rewriting genuinely AG-bound anchors.
const BRYNTUM_RELATIVE_PATH_RE = /^\/?(?:products|download|store|company|contact|examples|changelog)(?:[/?#]|$)/i;

const isBryntumRelativePath = (href: string): boolean => BRYNTUM_RELATIVE_PATH_RE.test(href);

// Given a raw href, return the bryntum.com-rooted, UTM-decorated URL if the
// href points at Bryntum (absolute bryntum.com or one of the known relative
// prefixes), or `null` if the href should be left untouched. Stray whitespace
// from the scraped JSON content is trimmed so href=" /products/..." doesn't
// produce a URL with a literal space in it.
const resolveBryntumBodyHref = (href: string): string | null => {
    const trimmed = href.trim();
    if (!trimmed) {
        return null;
    }
    if (BRYNTUM_HOST_RE.test(trimmed)) {
        return withBryntumUtm(trimmed);
    }
    if (isBryntumRelativePath(trimmed)) {
        const normalised = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return withBryntumUtm(`${BRYNTUM_ROOT}${normalised}`);
    }
    return null;
};

// Defence-in-depth before the curated body_html reaches Astro's `set:html`.
// The content originates from scraped bryntum.com markup, so strip anything
// that could execute if a future re-scrape introduced it: <script>/<iframe>/
// <object>/<embed> tags, inline event-handler attributes (onclick=…), and
// `javascript:` URIs. The content currently carries none of these — this turns
// "we eyeballed it once" into an enforced invariant rather than a manual check.
const stripActiveMarkup = (html: string): string =>
    html
        .replace(/<\s*(script|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
        .replace(/<\s*(script|iframe|object|embed)\b[^>]*\/?>/gi, '')
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/((?:href|src)\s*=\s*)(["'])\s*javascript:[^"']*\2/gi, '$1$2#$2');

// Walk an HTML string and rewrite every anchor href that targets Bryntum —
// either an absolute bryntum.com URL or a curated relative path from the
// scraped content (e.g. "/products/scheduler/examples/export/") — to its
// canonical bryntum.com form with the AG attribution param applied. Hrefs that
// don't match a Bryntum prefix are left untouched.
export const decorateBryntumHtml = (html: string | undefined): string => {
    if (!html) {
        return '';
    }
    return stripActiveMarkup(html).replace(/(<a\b[^>]*\bhref=)(["'])([^"']+)\2/gi, (match, prefix, quote, url) => {
        const resolved = resolveBryntumBodyHref(url);
        return resolved ? `${prefix}${quote}${resolved}${quote}` : match;
    });
};

export const resolveBryntumHref = (href: string | undefined): string => {
    if (!href) {
        return '#';
    }
    const trimmed = href.trim();
    if (!trimmed) {
        return '#';
    }
    if (trimmed.startsWith('mailto:') || trimmed.startsWith('#')) {
        return trimmed;
    }
    if (trimmed.startsWith('http')) {
        return withBryntumUtm(trimmed);
    }
    if (trimmed.startsWith('/')) {
        return withBryntumUtm(`${BRYNTUM_ROOT}${trimmed}`);
    }
    return withBryntumUtm(`${BRYNTUM_ROOT}/${trimmed}`);
};
