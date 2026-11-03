/**
 * Shape checks for internal links, independent of whether the target exists.
 *
 * The site serves every page as a directory index behind a trailing-slash rule, so a link to
 * `/charts` or `/page#section` costs a 301 before the real page loads; a bare `ag-grid.com` or a
 * retired product subdomain costs another. SE-166 removed those hops from the emitted HTML, and
 * this module is what keeps them out: the link checker runs it over every internal href in the
 * built site and fails the build on any that would redirect.
 *
 * It also flags UTM-tagged internal links. They resolve without a hop, but a visitor following one
 * has their original traffic source overwritten in analytics.
 */

const CANONICAL_HOST = 'www.ag-grid.com';

/** Hosts that 301 to the canonical one: the bare apex and the retired product subdomains. */
const REDIRECTING_HOSTS = ['ag-grid.com', 'charts.ag-grid.com', 'studio.ag-grid.com'];

/**
 * Paths that are still served directly from an otherwise-redirecting host. The pre-10.1 charts
 * archive (`charts.ag-grid.com/archive/9.3.2/documentation/`) exists only there: the host root and
 * every other path 301 to `www.ag-grid.com/charts/`, but the `www` form of those archives is a 404.
 */
const LEGACY_HOST_CANONICAL_PATHS: Record<string, RegExp[]> = {
    'charts.ag-grid.com': [/^\/archive\//],
};

const isServedFromLegacyHost = (host: string, pathname: string) =>
    LEGACY_HOST_CANONICAL_PATHS[host]?.some((pattern) => pattern.test(pathname)) ?? false;

/**
 * A letters-only extension marks a file that takes no trailing slash. Digits are deliberately
 * excluded so a version directory such as `/archive/26.0.0` is not mistaken for a `.0` file.
 */
const FILE_EXTENSION = /\.[a-zA-Z]+$/;

const NON_HTTP_SCHEMES = ['mailto:', 'tel:', 'javascript:', 'data:', 'sms:'];

const UTM_PARAMETER = /^utm_/i;

export type InternalLinkShapeIssue =
    | { type: 'insecure-scheme'; href: string; host: string }
    | { type: 'redirecting-host'; href: string; host: string }
    | { type: 'double-slash'; href: string; pathname: string }
    | { type: 'missing-trailing-slash'; href: string; pathname: string }
    | { type: 'utm-parameters'; href: string; parameters: string[] };

export interface InternalLinkShapeOptions {
    /**
     * Whether `pathname` is served as a standalone `.html` file (eg `/404`) rather than as a
     * directory index. Such a page has no trailing-slash form, so it is not asked for one.
     */
    isHtmlFile?: (pathname: string) => boolean;
}

interface ParsedInternalHref {
    scheme?: 'http' | 'https';
    host?: string;
    pathname: string;
    /** The names of the query parameters, in order. A `?` after the fragment marker is not a query. */
    queryParameters: string[];
}

/**
 * Split an href into the parts the shape rules care about. Returns `undefined` for anything that
 * is not an internal page link: same-page fragments, non-HTTP schemes, external hosts, and
 * relative paths (which the built HTML does not emit).
 */
function parseInternalHref(href: string): ParsedInternalHref | undefined {
    const trimmed = href.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
        return undefined;
    }
    const lower = trimmed.toLowerCase();
    if (NON_HTTP_SCHEMES.some((scheme) => lower.startsWith(scheme))) {
        return undefined;
    }

    const splitSuffix = (path: string) => {
        const suffixIndex = path.search(/[?#]/);
        if (suffixIndex === -1) {
            return { pathname: path, queryParameters: [] };
        }
        const pathname = path.slice(0, suffixIndex);
        if (path[suffixIndex] === '#') {
            return { pathname, queryParameters: [] };
        }
        const query = path.slice(suffixIndex + 1).split('#')[0];
        return { pathname, queryParameters: query.split('&').map((pair) => pair.split('=')[0]) };
    };

    const absolute = /^(https?):\/\/([^/?#]+)(.*)$/i.exec(trimmed);
    if (absolute) {
        const [, scheme, host, rest] = absolute;
        const hostLower = host.toLowerCase();
        if (hostLower !== CANONICAL_HOST && !REDIRECTING_HOSTS.includes(hostLower)) {
            return undefined;
        }
        return { scheme: scheme.toLowerCase() as 'http' | 'https', host: hostLower, ...splitSuffix(rest) };
    }

    if (trimmed.startsWith('//')) {
        // Protocol-relative: `//host/path`
        const match = /^\/\/([^/?#]+)(.*)$/.exec(trimmed);
        if (!match) {
            return undefined;
        }
        const [, host, rest] = match;
        const hostLower = host.toLowerCase();
        if (hostLower !== CANONICAL_HOST && !REDIRECTING_HOSTS.includes(hostLower)) {
            return undefined;
        }
        return { host: hostLower, ...splitSuffix(rest) };
    }

    if (trimmed.startsWith('/')) {
        return splitSuffix(trimmed);
    }

    return undefined;
}

/**
 * Every redirect-inducing shape found in `href`, or an empty array when it is either not an
 * internal page link or already in its final form.
 */
export function getInternalLinkShapeIssues(
    href: string,
    { isHtmlFile }: InternalLinkShapeOptions = {}
): InternalLinkShapeIssue[] {
    const parsed = parseInternalHref(href);
    if (parsed == null) {
        return [];
    }

    const issues: InternalLinkShapeIssue[] = [];
    const { scheme, host, pathname, queryParameters } = parsed;

    if (scheme === 'http' && host != null) {
        issues.push({ type: 'insecure-scheme', href, host });
    }
    if (host != null && REDIRECTING_HOSTS.includes(host) && !isServedFromLegacyHost(host, pathname)) {
        issues.push({ type: 'redirecting-host', href, host });
    }
    if (pathname.includes('//')) {
        issues.push({ type: 'double-slash', href, pathname });
    }

    // A bare host (`https://www.ag-grid.com`) is normalised to `/` by the browser and served
    // directly, so only a non-empty pathname needs the slash.
    const isFinalForm =
        pathname === '' || pathname.endsWith('/') || FILE_EXTENSION.test(pathname) || (isHtmlFile?.(pathname) ?? false);
    if (!isFinalForm) {
        issues.push({ type: 'missing-trailing-slash', href, pathname });
    }

    const utmParameters = queryParameters.filter((name) => UTM_PARAMETER.test(name));
    if (utmParameters.length > 0) {
        issues.push({ type: 'utm-parameters', href, parameters: utmParameters });
    }

    return issues;
}

/**
 * Whether `href` is a link to a page of this site: root-relative, on the canonical or a retired
 * host, or a same-page fragment. Everything else (external hosts, `mailto:`, relative paths) is not.
 */
export function isInternalHref(href: string): boolean {
    const trimmed = href.trim();
    return trimmed.startsWith('#') || parseInternalHref(trimmed) != null;
}

/**
 * The path, query and fragment of an absolute link to the canonical host, which this site serves at
 * that same path, or undefined for any other link. `https://www.ag-grid.com/charts/#a` gives `/charts/#a`.
 */
export function getCanonicalHostPath(href: string): string | undefined {
    const match = /^(?:https?:)?\/\/([^/?#]+)(.*)$/i.exec(href.trim());
    if (match == null || match[1].toLowerCase() !== CANONICAL_HOST) {
        return undefined;
    }
    const rest = match[2];
    return rest.startsWith('/') ? rest : `/${rest}`;
}

/** One-line, human-readable description of an issue for the link checker's failure output. */
export function describeInternalLinkShapeIssue(issue: InternalLinkShapeIssue): string {
    switch (issue.type) {
        case 'insecure-scheme':
            return `Link ${issue.href} uses http:// and will redirect to https://; link to https://${issue.host} directly.`;
        case 'redirecting-host':
            return `Link ${issue.href} points at ${issue.host}, which redirects to ${CANONICAL_HOST}; link to the canonical host directly.`;
        case 'double-slash':
            return `Link ${issue.href} contains a doubled slash in its path (${issue.pathname}), a second address for the same page.`;
        case 'missing-trailing-slash':
            return `Link ${issue.href} is missing its trailing slash and will redirect to ${issue.pathname}/; add the slash.`;
        case 'utm-parameters':
            return `Link ${issue.href} carries ${issue.parameters.join(', ')}; UTM parameters on an internal link overwrite the visitor's original traffic source in analytics, so remove them.`;
    }
}
