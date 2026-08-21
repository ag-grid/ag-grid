/**
 * The `/sitemap` page and its `/sitemap.md` twin render nothing but the `<loc>` list of the sitemap
 * XML, in sitemap order (see `parseSitemap`). `<lastmod>` is rewritten on every build and never
 * reaches either page, so two sitemaps with the same locs in the same order produce byte-identical
 * sitemap pages.
 *
 * That makes the loc list — not the raw XML, and not the git hash — the right cache key for both the
 * sitemap cache and the build's decision on whether the sitemap pages need re-rendering.
 */

const LOC_REGEX = /<loc>([^<]+)<\/loc>/g;

export const getSitemapLocs = (xml: string): string[] => [...xml.matchAll(LOC_REGEX)].map(([, loc]) => loc.trim());

export type SitemapLocsDiff = {
    /** The two loc lists render the same sitemap page. */
    matches: boolean;
    added: string[];
    removed: string[];
    /** The same URLs in a different order. The page lists them in sitemap order, so still a change. */
    reordered: boolean;
};

export const diffSitemapLocs = (before: string[], after: string[]): SitemapLocsDiff => {
    const matches = before.length === after.length && before.every((loc, index) => loc === after[index]);
    const beforeSet = new Set(before);
    const afterSet = new Set(after);
    const added = after.filter((loc) => !beforeSet.has(loc));
    const removed = before.filter((loc) => !afterSet.has(loc));

    return {
        matches,
        added,
        removed,
        reordered: !matches && before.length === after.length && added.length === 0 && removed.length === 0,
    };
};

/** One-line summary of a diff, for build logs. */
export const describeSitemapLocsDiff = ({ matches, added, removed, reordered }: SitemapLocsDiff): string => {
    if (matches) {
        return 'no change';
    }
    if (reordered) {
        return 'same pages in a different order';
    }

    const summarise = (label: string, locs: string[]) =>
        locs.length === 0
            ? null
            : `${locs.length} ${label} (${locs.slice(0, 3).join(', ')}${locs.length > 3 ? ', …' : ''})`;

    // The fallback covers a page listed a different number of times, which shows up as neither an
    // addition nor a removal.
    return (
        [summarise('added', added), summarise('removed', removed)].filter(Boolean).join(', ') || 'the page list changed'
    );
};
