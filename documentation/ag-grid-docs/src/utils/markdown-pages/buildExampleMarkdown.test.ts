import { describe, expect, it } from 'vitest';

import { buildExampleMarkdown } from './buildExampleMarkdown';

describe('buildExampleMarkdown', () => {
    const output = buildExampleMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid Demos"');
        expect(output).toContain('\n# AG Grid Demos');
    });

    it('lists the four demos, each with a live-demo and its own GitHub link', () => {
        expect(output).toContain(
            '**Performance** — [live demo](https://www.ag-grid.com/example/), [GitHub](https://github.com/ag-grid/ag-grid-demos/tree/main/performance)'
        );
        expect(output).toContain(
            '**Finance** — [live demo](https://www.ag-grid.com/example-finance/), [GitHub](https://github.com/ag-grid/ag-grid-demos/tree/main/finance)'
        );
        expect(output).toContain(
            '**HR** — [live demo](https://www.ag-grid.com/example-hr/), [GitHub](https://github.com/ag-grid/ag-grid-demos/tree/main/hr)'
        );
        expect(output).toContain(
            '**Inventory** — [live demo](https://www.ag-grid.com/example-inventory/), [GitHub](https://github.com/ag-grid/ag-grid-demos/tree/main/inventory)'
        );
    });

    it('includes the video and contact resources', () => {
        expect(output).toContain('[Video Tour](https://youtu.be/bcMvTUVbMvI)');
        expect(output).toContain('[Contact Us](https://www.ag-grid.com/contact/)');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
