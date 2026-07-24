import { describe, expect, it } from 'vitest';

import { buildCommunityToolsExtensionsMarkdown } from './buildCommunityToolsExtensionsMarkdown';

describe('buildCommunityToolsExtensionsMarkdown', () => {
    const output = buildCommunityToolsExtensionsMarkdown({
        product: 'AG Grid',
        currentSite: 'grid',
        siteRoot: 'https://www.ag-grid.com/',
    });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid: Tools & Extensions"');
        expect(output).toContain('\n# An Ecosystem of Tools and Libraries');
    });

    it('lists the full set of tools (more than the landing-page limit of 3)', () => {
        expect(output).toContain('AdapTable');
        const bullets = output.split('\n').filter((line) => line.startsWith('- '));
        expect(bullets.length).toBeGreaterThan(3);
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
