import { describe, expect, it } from 'vitest';

import { buildCommunityShowcaseMarkdown } from './buildCommunityShowcaseMarkdown';

describe('buildCommunityShowcaseMarkdown', () => {
    const output = buildCommunityShowcaseMarkdown({
        product: 'AG Grid',
        currentSite: 'grid',
        siteRoot: 'https://www.ag-grid.com/',
    });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid: Showcase"');
        expect(output).toContain('\n# Open-Source Projects powered by AG Grid');
    });

    it('renders the favourites and full showcase sections', () => {
        expect(output).toContain('## Our Favourites');
        expect(output).toContain('## Full Showcase');
        expect(output).toContain('Terminal Pro @ OpenBB');
    });

    it('lists more projects than the landing-page preview (full "other" list)', () => {
        const full = output.slice(output.indexOf('## Full Showcase'));
        const bullets = full.split('\n').filter((line) => line.startsWith('- '));
        expect(bullets.length).toBeGreaterThan(8);
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
