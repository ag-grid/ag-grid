import { describe, expect, it } from 'vitest';

import { buildCommunityBeyondThePromptMarkdown } from './buildCommunityBeyondThePromptMarkdown';

describe('buildCommunityBeyondThePromptMarkdown', () => {
    const output = buildCommunityBeyondThePromptMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "Beyond the Prompt: AG Grid & Bryntum Conference"');
        expect(output).toContain('\n# Beyond the Prompt');
    });

    it('renders the intro the page leads with', () => {
        expect(output).toContain('## Getting to a prototype with AI is easy. Production is not.');
        expect(output).toContain('Beyond the Prompt is a series of events exploring the tension');
        expect(output).toContain('London was the first stop.');
    });

    it('renders the programme with its location, speakers and recording links', () => {
        expect(output).toContain('## Programme');
        expect(output).toContain('London, May 2026');
        expect(output).toContain('**Opening Keynote**');
        expect(output).toContain('John Masterson (CEO, AG Grid)');
        expect(output).toContain('([recording](https://youtu.be/');
    });

    it('renders each speaker with their title and bio', () => {
        expect(output).toContain('## Speakers');
        expect(output).toContain('### Maggie Appleton — Staff Research Engineer, GitHub');
        expect(output).toContain('Maggie is a Staff Research Engineer at GitHub');
    });

    it('links to the signup section rather than reproducing the form', () => {
        expect(output).toContain('## Get notified\n\nNew York');
        expect(output).toContain('[Sign up for updates](https://www.ag-grid.com/community/beyond-the-prompt/#notify)');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
