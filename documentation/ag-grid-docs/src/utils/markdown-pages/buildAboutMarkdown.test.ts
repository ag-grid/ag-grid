import { describe, expect, it } from 'vitest';

import { buildAboutMarkdown } from './buildAboutMarkdown';

describe('buildAboutMarkdown', () => {
    const output = buildAboutMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "About AG Grid: Our Mission, Principles & Team"');
        expect(output).toContain('\n# About Us');
    });

    it('renders the history timeline with links resolved to markdown', () => {
        expect(output).toContain('## Our history');
        expect(output).toContain('**2015 — First commit**');
        // Internal link made absolute; no raw anchor tags survive.
        expect(output).toContain('[Niall Crosby](https://www.ag-grid.com/niall/)');
        expect(output).not.toContain('<a href');
    });

    it('keeps external and in-page-anchor timeline links intact', () => {
        expect(output).toContain('[AG Charts Community](https://www.ag-grid.com/charts/)');
        expect(output).toContain('[John Masterson](#leadership-section)');
    });

    it('lists principles and leadership from about.json', () => {
        expect(output).toContain('## Our principles');
        expect(output).toContain('**Developer-first**');
        expect(output).toContain('## Leadership');
        expect(output).toContain('**John Masterson, CEO**');
    });

    it('includes the office address and contact details', () => {
        expect(output).toContain('## Get in touch');
        expect(output).toContain('70 Wilson Street');
        expect(output).toContain('[GitHub](https://github.com/ag-grid/ag-grid)');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
