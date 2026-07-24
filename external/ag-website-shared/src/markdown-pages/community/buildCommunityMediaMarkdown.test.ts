import { describe, expect, it } from 'vitest';

import { buildCommunityMediaMarkdown } from './buildCommunityMediaMarkdown';

describe('buildCommunityMediaMarkdown', () => {
    const output = buildCommunityMediaMarkdown({
        product: 'AG Grid',
        currentSite: 'grid',
        siteRoot: 'https://www.ag-grid.com/',
    });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid: Media"');
        expect(output).toContain('\n# Community Podcasts and Publications featuring AG Grid');
    });

    it('renders videos, podcasts and blogs sections', () => {
        expect(output).toContain('## Videos');
        expect(output).toContain('| Title | Author | Published |');
        expect(output).toContain('## Podcasts');
        expect(output).toContain('Charting It Up with AG Grid');
        expect(output).toContain('## Blogs');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
