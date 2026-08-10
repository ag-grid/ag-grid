import type { LandingPageContent } from '@ag-website-shared/components/landing-pages/types';
import { describe, expect, it } from 'vitest';

import angularDataGrid from '../../content/landing-pages/angular-data-grid.json';
import enterpriseDataGrid from '../../content/landing-pages/enterprise-data-grid.json';
import javascriptDataGrid from '../../content/landing-pages/javascript-data-grid.json';
import reactDataGrid from '../../content/landing-pages/react-data-grid.json';
import reactTable from '../../content/landing-pages/react-table.json';
import vueDataGrid from '../../content/landing-pages/vue-data-grid.json';
import versions from '../../content/versions/ag-grid-versions.json';
import { buildGridLandingPageMarkdown } from './buildGridLandingPageMarkdown';

const SITE_ROOT = 'https://www.ag-grid.com/';

// Every landing page in the collection, so a new one (or a new section type in an existing
// one) is covered here without editing the test.
const PAGES: Record<string, unknown> = {
    'angular-data-grid': angularDataGrid,
    'enterprise-data-grid': enterpriseDataGrid,
    'javascript-data-grid': javascriptDataGrid,
    'react-data-grid': reactDataGrid,
    'react-table': reactTable,
    'vue-data-grid': vueDataGrid,
};

const build = (content: unknown) =>
    buildGridLandingPageMarkdown({
        content: content as LandingPageContent,
        versions,
        siteRoot: SITE_ROOT,
    });

describe('buildGridLandingPageMarkdown', () => {
    describe.each(Object.entries(PAGES))('%s', (_slug, content) => {
        const output = build(content);
        const page = content as LandingPageContent;

        it('opens with frontmatter carrying the page meta, then the hero as H1', () => {
            expect(output.startsWith('---\n')).toBe(true);
            expect(output).toContain(`title: ${JSON.stringify(page.meta.title)}`);
            expect(output).toContain(`description: ${JSON.stringify(page.meta.description)}`);
            const hero = page.sections.find((section) => section.type === 'hero');
            expect(output).toContain(`\n# ${hero!.heading}`);
        });

        it('renders a heading for every non-hero section, in page order', () => {
            const headings = page.sections
                .filter((section) => section.type !== 'hero')
                .map((section) => ('heading' in section ? section.heading : undefined))
                .filter((heading): heading is string => heading != null);
            let cursor = 0;
            for (const heading of headings) {
                const index = output.indexOf(`## ${heading}`, cursor);
                expect(index, `section "${heading}" missing or out of order`).toBeGreaterThan(-1);
                cursor = index;
            }
        });

        it('resolves every link to an absolute URL, leaving no raw HTML behind', () => {
            const relative = [...output.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
                .map((match) => match[1])
                .filter((href) => !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('mailto:'));
            expect(relative).toEqual([]);
            expect(output).not.toContain('<a href');
            expect(output).not.toContain('<b>');
            expect(output).not.toContain('<br');
        });

        it('ends with a single trailing newline', () => {
            expect(output.endsWith('\n')).toBe(true);
            expect(output.endsWith('\n\n')).toBe(false);
        });
    });

    it('resolves framework-relative FAQ links against the page framework, not the base URL', () => {
        // FAQ answers are Markdoc rendered per-framework, so './ai-toolkit/' must become
        // /react-data-grid/ai-toolkit/ on the React page — not /ai-toolkit/.
        const output = build(reactDataGrid);
        expect(output).toContain('https://www.ag-grid.com/react-data-grid/');
        expect(output).not.toMatch(/\]\(https:\/\/www\.ag-grid\.com\/getting-started\//);
    });

    it('resolves base-relative feature and example links without re-prefixing the framework', () => {
        // These already carry the framework segment, so they must not become
        // /react-data-grid/react-data-grid/...
        const output = build(reactDataGrid);
        expect(output).not.toContain('/react-data-grid/react-data-grid/');
    });

    it('renders the enterprise pricing cards with price, note, features and CTA', () => {
        const output = build(enterpriseDataGrid);
        expect(output).toContain('### Community — Free');
        expect(output).toContain('*forever*');
        expect(output).toContain('- MIT licensed');
        expect(output).toContain('[Get Started](https://www.ag-grid.com/data-grid/getting-started/)');
    });

    it('marks enterprise feature groups so an agent can tell them from community ones', () => {
        expect(build(enterpriseDataGrid)).toContain('### Grouping & Aggregation (Enterprise)');
    });

    it('includes the install command and version badge from the shared content', () => {
        const output = build(reactDataGrid);
        expect(output).toContain('Install: `npm install ag-grid-react`');
        expect(output).toContain('**Latest version:** v');
    });
});
