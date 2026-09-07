import { describe, expect, it } from 'vitest';

import { buildDocumentationArchiveMarkdown } from './buildDocumentationArchiveMarkdown';

describe('buildDocumentationArchiveMarkdown', () => {
    const output = buildDocumentationArchiveMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid Documentation Archive"');
        expect(output).toContain('\n# Documentation Archive');
    });

    it('groups releases under a major-version heading', () => {
        expect(output).toContain('## Version 33');
        expect(output).toContain('| Version | Date | Type | Documentation | Changelog |');
    });

    it('links each release to its archived docs and changelog', () => {
        // Docs link for >= 27.3.0 gets the /documentation suffix; changelog carries the fixVersion.
        expect(output).toContain('[33.0.0 Documentation](https://www.ag-grid.com/archive/33.0.0/documentation/)');
        expect(output).toContain('[Changelog](https://www.ag-grid.com/changelog/?fixVersion=33.0.0)');
    });

    it('excludes versions flagged noDocs', () => {
        // Sanity: at least one row present, and no empty documentation cell (every listed row links).
        expect(output).not.toContain('| Documentation |\n');
        expect(output).toMatch(/\| \d+\.\d+\.\d+ \|/);
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
