import type { Framework, MenuItem } from '@ag-grid-types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import type { RelatedLink } from '@ag-website-shared/markdown-pages/markdownFrontmatter';
import { toTitle } from '@utils/toTitle';
import { urlWithPrefix } from '@utils/urlWithPrefix';

/**
 * The `related:` list emitted in each docs `.md` twin's frontmatter: the other destinations in
 * the page's own nav group. Derived rather than curated so ~390 pages cannot drift out of date.
 */

/** A docs page name (`cell-editors`), titled from the nav, or an explicit title and URL. */
export type RelatedLinkOverride = string | RelatedLink;

interface RelatedLinksParams {
    /** Nav sections to search, in priority order — the docs nav, then the API nav. */
    navSections: MenuItem[][];
    pageName: string;
    framework: Framework;
    /** Canonical origin, so the emitted links resolve when the `.md` is read detached. */
    siteRoot?: string;
    overrides?: RelatedLinkOverride[];
}

/** Nav items carry a `frameworks` allowlist when a page only exists for some frameworks. */
function isAvailableFor(item: MenuItem, framework: Framework): boolean {
    return !item.frameworks || item.frameworks.includes(framework);
}

/** Every nav item that points somewhere — headings and groups are structure, not destinations. */
function isDestination(item: MenuItem): boolean {
    return Boolean(item.path || item.url);
}

function absolute(url: string, framework: Framework, siteRoot?: string): string {
    return toAbsoluteUrl(urlWithPrefix({ url, framework }), siteRoot);
}

function toUrl(item: MenuItem, framework: Framework, siteRoot?: string): string {
    // `url` items are already whole; `path` items need the framework segment.
    return absolute(item.url ?? `./${item.path}/`, framework, siteRoot);
}

/** Undefined when this nav does not list the page at all, so the caller can try the next one. */
function findSiblings(items: MenuItem[], pageName: string, framework: Framework): MenuItem[] | undefined {
    if (items.some((item) => item.path === pageName)) {
        return items.filter((item) => item.path !== pageName && isDestination(item) && isAvailableFor(item, framework));
    }
    for (const item of items) {
        if (item.children) {
            const found = findSiblings(item.children, pageName, framework);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

/** The nav's own title for a page, so an override reads the same as the nav entry it points at. */
function findTitle(items: MenuItem[], pageName: string): string | undefined {
    for (const item of items) {
        if (item.path === pageName) {
            return item.title;
        }
        const found = item.children && findTitle(item.children, pageName);
        if (found) {
            return found;
        }
    }
    return undefined;
}

function resolveOverride(entry: RelatedLinkOverride, params: RelatedLinksParams): RelatedLink {
    const { navSections, framework, siteRoot } = params;
    if (typeof entry !== 'string') {
        return { title: entry.title, url: absolute(entry.url, framework, siteRoot) };
    }
    const navTitle = navSections.reduce<string | undefined>(
        (found, sections) => found ?? findTitle(sections, entry),
        undefined
    );
    return { title: navTitle ?? toTitle(entry), url: absolute(`./${entry}/`, framework, siteRoot) };
}

export function getDocsRelatedLinks(params: RelatedLinksParams): RelatedLink[] {
    const { navSections, pageName, framework, siteRoot, overrides } = params;

    if (overrides?.length) {
        return overrides.map((entry) => resolveOverride(entry, params));
    }

    for (const sections of navSections) {
        const siblings = findSiblings(sections, pageName, framework);
        if (siblings) {
            return siblings.map((item) => ({ title: item.title, url: toUrl(item, framework, siteRoot) }));
        }
    }

    return [];
}
