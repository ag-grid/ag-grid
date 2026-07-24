import { describe, expect, it } from 'vitest';

import { buildCommunityMarkdown } from './buildCommunityMarkdown';

describe('buildCommunityMarkdown', () => {
    const output = buildCommunityMarkdown({
        product: 'AG Grid',
        currentSite: 'grid',
        siteRoot: 'https://www.ag-grid.com/',
    });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid Community"');
        expect(output).toContain('\n# AG Grid Community');
    });

    it('renders the five landing-page sections', () => {
        expect(output).toContain('## Events');
        expect(output).toContain('## Showcase');
        expect(output).toContain('## Tools & Extensions');
        expect(output).toContain('## Media');
        expect(output).toContain('## Support & Socials');
    });

    it('lists showcase favourites, tools and support from the shared JSON', () => {
        // Stable data entries (favourites / tools / support are not date-filtered).
        expect(output).toContain('Terminal Pro @ OpenBB');
        expect(output).toContain('AdapTable');
        expect(output).toContain('Stack Overflow');
    });

    it('caps Tools & Extensions at three entries (matching the page limit)', () => {
        const toolsBlock = output.slice(output.indexOf('## Tools & Extensions'), output.indexOf('## Media'));
        const bullets = toolsBlock.split('\n').filter((line) => line.startsWith('- '));
        expect(bullets).toHaveLength(3);
    });

    it('renders the media table and external links', () => {
        expect(output).toContain('| Title | Author | Published |');
        expect(output).toContain('Socials:');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
