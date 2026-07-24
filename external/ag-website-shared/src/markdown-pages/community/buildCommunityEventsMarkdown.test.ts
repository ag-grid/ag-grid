import { describe, expect, it } from 'vitest';

import { buildCommunityEventsMarkdown } from './buildCommunityEventsMarkdown';

describe('buildCommunityEventsMarkdown', () => {
    const output = buildCommunityEventsMarkdown({
        product: 'AG Grid',
        currentSite: 'grid',
        siteRoot: 'https://www.ag-grid.com/',
    });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid: Events"');
        expect(output).toContain('\n# Global Event Participation');
    });

    it('splits events into upcoming and past sections', () => {
        expect(output).toContain('## Upcoming Events');
        expect(output).toContain('## Past Events');
    });

    it('renders event bullets with external links', () => {
        // At least one event bullet with a markdown link (data is date-filtered, so no fixed title).
        expect(output).toMatch(/- \*\*\[.+\]\(https?:\/\/.+\)\*\* — /);
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
