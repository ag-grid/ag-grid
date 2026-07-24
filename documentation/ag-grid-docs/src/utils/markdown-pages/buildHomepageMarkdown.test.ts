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
        expect(output).toMatch(/\[Get Started For Free\]\(https:\/\/www\.ag-grid\.com\/[^)]*getting-started/);
        expect(output).toContain('[Create a Custom Theme](https://www.ag-grid.com/theme-builder/)');
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
