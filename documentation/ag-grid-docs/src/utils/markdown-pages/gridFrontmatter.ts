import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import {
    type MarkdownFrontmatterInput,
    type RelatedLink,
    type SiteFrontmatterFields,
    buildMarkdownFrontmatter,
} from '@ag-website-shared/markdown-pages/markdownFrontmatter';
import { PRODUCTION_SITE_URLS } from '@constants';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import footerData from '../../content/footer/footer.json';

/**
 * The frontmatter fields every AG Grid markdown twin carries.
 *
 * Standalone pages are not in the docs nav that `docsRelatedLinks.ts` derives from, but the
 * footer already groups them the way the site presents them, so their related links are the
 * other entries in their own footer group.
 */

export const GRID_PRODUCT_NAME = 'AG Grid';

/** Only the footer fields this reads — icons and new-tab flags are presentation. */
interface FooterLink {
    name: string;
    url: string;
    showCookiesPrefs?: boolean;
}
interface FooterGroup {
    title: string;
    links: FooterLink[];
}

/** Resolved per environment, so a staging page points at staging's index, not production's. */
export function llmsTxtUrl(siteRoot?: string): string {
    return toAbsoluteUrl(urlWithPrefix({ url: '/llms.txt' }), siteRoot);
}

/** Compare footer URLs to page URLs on equal terms: no origin, no trailing slash. */
function toComparablePath(url: string): string {
    const withoutOrigin = PRODUCTION_SITE_URLS.reduce(
        (path, origin) => (path.startsWith(origin) ? path.slice(origin.length) : path),
        url
    );
    return withoutOrigin.replace(/\/$/, '');
}

/** Excludes the cookie-preferences control, which opens a dialog rather than a page. */
function isPageLink(link: FooterLink): boolean {
    return !link.showCookiesPrefs && !link.url.startsWith('#');
}

/** None for a page the footer does not list — the demo apps, campaigns and session pages. */
export function getFooterRelatedLinks({ pageUrl, siteRoot }: { pageUrl?: string; siteRoot?: string }): RelatedLink[] {
    if (!pageUrl) {
        return [];
    }
    const path = toComparablePath(pageUrl);
    const group = (footerData as FooterGroup[]).find((item) =>
        item.links.some((link) => isPageLink(link) && toComparablePath(link.url) === path)
    );
    if (!group) {
        return [];
    }
    return group.links
        .filter((link) => isPageLink(link) && toComparablePath(link.url) !== path)
        .map((link) => ({ title: link.name, url: toAbsoluteUrl(urlWithPrefix({ url: link.url }), siteRoot) }));
}

/** For spreading into a shared builder, which cannot know which product is rendering it. */
export function gridSiteFrontmatter({
    pageUrl,
    siteRoot,
}: {
    pageUrl?: string;
    siteRoot?: string;
}): SiteFrontmatterFields {
    return {
        product: GRID_PRODUCT_NAME,
        related: getFooterRelatedLinks({ pageUrl, siteRoot }),
        llmsTxt: llmsTxtUrl(siteRoot),
    };
}

export function buildGridFrontmatter({
    pageUrl,
    siteRoot,
    ...page
}: MarkdownFrontmatterInput & { pageUrl?: string; siteRoot?: string }): string {
    return buildMarkdownFrontmatter({ ...gridSiteFrontmatter({ pageUrl, siteRoot }), ...page });
}
