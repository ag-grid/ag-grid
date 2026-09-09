import { describe, expect, it } from 'vitest';

import { buildHomepageMarkdown } from './buildHomepageMarkdown';

describe('buildHomepageMarkdown', () => {
    const output = buildHomepageMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the hero H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid"');
        expect(output).toContain('\n# The Best Grid in the World');
    });

    it('renders each landing section heading', () => {
        expect(output).toContain('## The Fastest Data Grid In The World');
        expect(output).toContain('## Custom Themes and Components');
        expect(output).toContain('## Trusted By Developers Everywhere');
        expect(output).toContain('## Frequently Asked Questions');
    });

    it('converts headingHtml links to markdown (no raw anchor tags)', () => {
        expect(output).toContain('## Integrated Charts, Powered by [AG Charts](https://www.ag-grid.com/charts/)');
        expect(output).not.toContain('<a href');
        expect(output).not.toContain('<p>');
    });

    it('resolves CTA links absolutely', () => {
        // Framework CTA (./getting-started) and base-url CTA (/theme-builder/) both absolute.
        expect(output).toMatch(/\[Explore the Docs\]\(https:\/\/www\.ag-grid\.com\/[^)]*getting-started/);
        expect(output).toContain('[Create a Custom Theme](https://www.ag-grid.com/theme-builder/)');
    });

    it('renders the hero trial and pricing CTAs', () => {
        expect(output).toMatch(
            /\[Free Trial\]\(https:\/\/www\.ag-grid\.com\/[^)]*community-vs-enterprise\/#request-a-30-day-enterprise-bundle-trial-licence\)/
        );
        expect(output).toContain('[Buy Now](https://www.ag-grid.com/license-pricing/)');
    });

    it('renders a section secondary CTA after its main CTA', () => {
        expect(output).toMatch(/\[Explore the Docs\]\([^)]*\) \| \[Try Enterprise Free\]\([^)]*\)/);
        expect(output).toMatch(/\[Explore Integrated Charts\]\([^)]*\) \| \[Free Trial\]\([^)]*\)/);
    });

    it('renders each section eyebrow headline as a kicker above its heading', () => {
        expect(output).toContain('*Unbeatable Speed & Performance*\n\n## The Fastest Data Grid In The World');
        expect(output).toContain('*JavaScript Data Grid FAQs*\n\n## Frequently Asked Questions');
    });

    it('lists the headline metrics', () => {
        expect(output).toContain('- **90%** — Of the Fortune 500 use AG Grid');
        expect(output).toContain('- **5M+** — Weekly NPM downloads');
        expect(output).toContain('- **13k+** — GitHub Stars');
        expect(output).toContain('- **40K+** — Commits');
    });

    it('renders the developer quotes as attributed blockquotes, in display order', () => {
        expect(output).toContain(
            '> There are a lot of component-based table libraries out there, but I believe AG Grid is the gold standard'
        );
        expect(output).toContain('> — **Tanner Linsley**, Creator TanStack');
        expect(output).toContain('> — **Brian Love**, Expert at Google Developers');
        expect(output.indexOf('Tanner Linsley')).toBeLessThan(output.indexOf('Ryan Carniato'));
    });

    it('includes a What is New version highlight and an FAQ question', () => {
        expect(output).toContain('### 36.0.0');
        expect(output).toContain('- Calculated Columns');
        expect(output).toContain('### Can I build JavaScript Data Grids for free with AG Grid?');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
