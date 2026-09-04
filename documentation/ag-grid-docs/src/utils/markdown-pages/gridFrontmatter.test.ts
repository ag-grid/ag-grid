import { buildGridFrontmatter, getFooterRelatedLinks, gridSiteFrontmatter, llmsTxtUrl } from './gridFrontmatter';

const SITE_ROOT = 'https://www.ag-grid.com';

// These assertions read the real footer.json, so they check the derivation against the grouping
// the site actually ships rather than a fixture that could disagree with it.
describe('getFooterRelatedLinks', () => {
    const titlesFor = (pageUrl: string) =>
        getFooterRelatedLinks({ pageUrl, siteRoot: SITE_ROOT }).map(({ title }) => title);

    test("returns the other pages in the page's own footer group", () => {
        expect(titlesFor('/roadmap/')).toContain('Changelog');
        expect(titlesFor('/roadmap/')).toContain('Documentation Archive');
        expect(titlesFor('/about/')).toContain('Contact Us');
        expect(titlesFor('/about/')).toContain('Privacy Policy');
    });

    test('excludes the page itself', () => {
        expect(titlesFor('/roadmap/')).not.toContain('Roadmap');
        expect(titlesFor('/about/')).not.toContain('About');
    });

    test('excludes the cookie-preferences control, which opens a dialog rather than a page', () => {
        expect(titlesFor('/about/')).not.toContain('Manage Cookies');
    });

    test('makes internal links absolute and leaves external ones whole', () => {
        const links = getFooterRelatedLinks({ pageUrl: '/license-pricing/', siteRoot: SITE_ROOT });
        const bySource = Object.fromEntries(links.map(({ title, url }) => [title, url]));

        expect(bySource['Security']).toBe('https://www.ag-grid.com/data-grid/security/');
        expect(bySource['Stack Overflow']).toBe('https://stackoverflow.com/questions/tagged/ag-grid');
    });

    test('matches a footer entry written as a full production URL', () => {
        // The footer lists /sitemap/ with its origin, so the comparison has to ignore origins.
        expect(titlesFor('/sitemap/')).toContain('About');
    });

    test('returns nothing for a page the footer does not list, or when no page is given', () => {
        expect(getFooterRelatedLinks({ pageUrl: '/session/opening-keynote/', siteRoot: SITE_ROOT })).toEqual([]);
        expect(getFooterRelatedLinks({ siteRoot: SITE_ROOT })).toEqual([]);
    });
});

describe('llmsTxtUrl', () => {
    test('points at the llms.txt of the site the twin is served from', () => {
        expect(llmsTxtUrl(SITE_ROOT)).toBe('https://www.ag-grid.com/llms.txt');
    });

    test('stays site-relative when there is no site root to resolve against', () => {
        expect(llmsTxtUrl()).toBe('/llms.txt');
    });
});

describe('gridSiteFrontmatter', () => {
    test('names the product and the llms.txt index alongside the related links', () => {
        const fields = gridSiteFrontmatter({ pageUrl: '/about/', siteRoot: SITE_ROOT });

        expect(fields.product).toBe('AG Grid');
        expect(fields.llmsTxt).toBe('https://www.ag-grid.com/llms.txt');
        expect(fields.related?.length).toBeGreaterThan(0);
    });
});

describe('buildGridFrontmatter', () => {
    test("emits the page's own fields and the site-wide ones in one block", () => {
        const output = buildGridFrontmatter({
            pageUrl: '/about/',
            siteRoot: SITE_ROOT,
            title: 'About Us',
            description: 'The AG Grid story.',
        });

        expect(output.startsWith('---\nproduct: "AG Grid"\ntitle: "About Us"')).toBe(true);
        expect(output).toContain('description: "The AG Grid story."');
        expect(output).toContain('    - title: "Contact Us"');
        expect(output.trimEnd().endsWith('llms: "https://www.ag-grid.com/llms.txt"\n---')).toBe(true);
    });

    test('lets a page override the derived related links', () => {
        const output = buildGridFrontmatter({
            pageUrl: '/about/',
            siteRoot: SITE_ROOT,
            title: 'About Us',
            related: [{ title: 'Careers', url: 'https://www.ag-grid.com/careers/' }],
        });

        expect(output).toContain('    - title: "Careers"');
        expect(output).not.toContain('Contact Us');
    });
});
