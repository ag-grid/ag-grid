import { describe, expect, it } from 'vitest';

import { buildFrameworkRedirectMarkdown } from './buildFrameworkRedirectMarkdown';

const SITE_ROOT = 'https://www.ag-grid.com/';

const DESTINATIONS = [
    { label: 'React', url: '/studio/react/licence-install/' },
    { label: 'Angular', url: '/studio/angular/licence-install/' },
];

describe('buildFrameworkRedirectMarkdown', () => {
    const output = buildFrameworkRedirectMarkdown({
        title: 'AG Studio: Licensing',
        description: 'Installing Your Licence Key',
        heading: 'AG Studio Licensing',
        destinations: DESTINATIONS,
        siteRoot: SITE_ROOT,
    });

    it('emits the page metadata as frontmatter, then the heading as H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Studio: Licensing"');
        expect(output).toContain('description: "Installing Your Licence Key"');
        expect(output).toContain('# AG Studio Licensing');
    });

    it('spells out every framework destination, since a reader cannot be redirected', () => {
        for (const { label, url } of DESTINATIONS) {
            expect(output).toContain(`- [${label}](https://www.ag-grid.com${url})`);
        }
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
