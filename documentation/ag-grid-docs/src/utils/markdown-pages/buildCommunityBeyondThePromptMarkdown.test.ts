import { describe, expect, it } from 'vitest';

import { buildCommunityBeyondThePromptMarkdown } from './buildCommunityBeyondThePromptMarkdown';

describe('buildCommunityBeyondThePromptMarkdown', () => {
    const output = buildCommunityBeyondThePromptMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "Beyond the Prompt: AG Grid & Bryntum Conference"');
        expect(output).toContain('\n# Beyond the Prompt');
    });

    it('renders the programme with speakers and recording links', () => {
        expect(output).toContain('## Programme');
        expect(output).toContain('**Opening Keynote**');
        expect(output).toContain('John Masterson (CEO, AG Grid)');
        expect(output).toContain('([recording](https://youtu.be/');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
