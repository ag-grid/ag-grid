import { describe, expect, it } from 'vitest';

import { buildMarkdownFrontmatter } from './markdownFrontmatter';

describe('buildMarkdownFrontmatter', () => {
    it('emits identity, then classification, then navigation, between --- delimiters', () => {
        const output = buildMarkdownFrontmatter({
            product: 'AG Grid',
            title: 'Cell Editing',
            description: 'How to edit cells.',
            enterprise: true,
            framework: 'react',
            version: '36.1.0',
            related: [{ title: 'Cell Editors', url: 'https://www.ag-grid.com/react-data-grid/cell-editors/' }],
            llmsTxt: 'https://www.ag-grid.com/llms.txt',
        });

        expect(output).toBe(
            [
                '---',
                'product: "AG Grid"',
                'title: "Cell Editing"',
                'description: "How to edit cells."',
                'enterprise: true',
                'framework: react',
                'version: "36.1.0"',
                'related:',
                '    - title: "Cell Editors"',
                '      url: "https://www.ag-grid.com/react-data-grid/cell-editors/"',
                'llms: "https://www.ag-grid.com/llms.txt"',
                '---',
            ].join('\n')
        );
    });

    it('omits every field the caller did not supply', () => {
        expect(buildMarkdownFrontmatter({ title: 'About Us' })).toBe(['---', 'title: "About Us"', '---'].join('\n'));
    });

    it('omits the Enterprise flag for a Community page, and an empty related list', () => {
        const output = buildMarkdownFrontmatter({ title: 'Quick Start', enterprise: false, related: [] });

        expect(output).not.toContain('enterprise:');
        expect(output).not.toContain('related:');
    });

    it('quotes and escapes free text, so a title with a colon or a quote stays valid YAML', () => {
        const output = buildMarkdownFrontmatter({
            title: 'About AG Grid: Our Mission, Principles & Team',
            description: 'The "grid" story.',
        });

        expect(output).toContain('title: "About AG Grid: Our Mission, Principles & Team"');
        expect(output).toContain('description: "The \\"grid\\" story."');
    });

    it('leaves the framework unquoted, since it is a keyword rather than free text', () => {
        expect(buildMarkdownFrontmatter({ framework: 'angular' })).toContain('framework: angular');
    });
});
