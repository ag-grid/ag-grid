import chartsFeaturesData from '@ag-website-shared/content/license-features/chartsFeaturesMatrix.json';
import gridFeaturesData from '@ag-website-shared/content/license-features/gridFeaturesMatrix.json';
import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';

/**
 * The licence-pricing comparison table renders one link per feature row (see
 * `comparison-table/renderers/Label.tsx`), resolving `grid:`/`charts:` prefixes through
 * `resolveSharedUrl`. It is the densest cluster of internal links on the site, so a builder that
 * drops the trailing slash costs a 301 on every row at once.
 */
const featureLinks = (data: unknown[]): string[] =>
    (data as { items?: { label?: { link?: string } }[] }[])
        .flatMap((group) => group.items ?? [])
        .map((item) => item.label?.link)
        .filter((link): link is string => Boolean(link));

describe('licence-pricing feature links', () => {
    test.each([
        ['grid', gridFeaturesData],
        ['charts', chartsFeaturesData],
    ])('every %s feature link resolves without a redirect', (_name, data) => {
        const links = featureLinks(data as unknown[]);
        expect(links.length).toBeGreaterThan(0);

        const unresolved = links
            .map((link) => resolveSharedUrl({ url: link, framework: 'react' }))
            // An anchor terminates the path, so those are already single-hop.
            .filter((url) => !url.includes('#') && !url.endsWith('/'));

        expect(unresolved).toEqual([]);
    });
});
