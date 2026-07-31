import { describe, expect, it } from 'vitest';

import { buildApiReferenceSection } from './buildApiReferenceTable';

const links = { framework: 'javascript' as const, siteRoot: 'https://www.ag-grid.com/' };

function bodyRows(output: string): string[][] {
    return output
        .split('\n')
        .filter((line) => line.startsWith('|'))
        .slice(2)
        .map((line) =>
            line
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim())
        );
}

describe('buildApiReferenceSection', () => {
    const properties = {
        cellRange: {
            definition: {
                isRequired: true,
                description:
                    'Defines the range of cells to be charted. See [Add Cell Range](./cell-selection-api-reference/#reference-selection-addCellRange) for more information.',
            },
            propertyType: 'ChartParamsCellRange',
        },
        suppressChartRanges: {
            definition: { default: false, description: 'Set `suppressChartRanges=true` to suppress this behaviour.' },
            propertyType: 'boolean',
        },
        switchCategorySeries: {
            definition: { description: 'Switch Category / Series.' },
            propertyType: 'boolean',
        },
    };

    it('marks required properties and gives defaults their own column', () => {
        const output = buildApiReferenceSection({ config: {}, properties }, links);

        expect(output).toContain('| Property | Type | Required | Default | Description |');
        const [cellRange, suppressChartRanges, switchCategorySeries] = bodyRows(output);
        expect(cellRange.slice(0, 4)).toEqual(['`cellRange`', '`ChartParamsCellRange`', 'Yes', '']);
        expect(suppressChartRanges.slice(0, 4)).toEqual(['`suppressChartRanges`', '`boolean`', '', '`false`']);
        expect(switchCategorySeries.slice(0, 4)).toEqual(['`switchCategorySeries`', '`boolean`', '', '']);
    });

    it('reads the default from the @default JSDoc tag when the docs config has none', () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    rowHeight: {
                        definition: {},
                        propertyType: 'number',
                        gridOpProp: { meta: { comment: 'Row height.', tags: [{ name: 'default', comment: '25' }] } },
                    },
                },
            },
            links
        );

        expect(bodyRows(output)[0].slice(0, 4)).toEqual(['`rowHeight`', '`number`', '', '`25`']);
    });

    it('keeps inline links in descriptions, resolved to absolute doc URLs', () => {
        const output = buildApiReferenceSection({ config: {}, properties }, links);

        expect(bodyRows(output)[0][4]).toContain(
            '[Add Cell Range](https://www.ag-grid.com/javascript-data-grid/cell-selection-api-reference/#reference-selection-addCellRange)'
        );
    });

    it('keeps the @agModule badge as a link to the module registry', () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    createRangeChart: {
                        definition: {},
                        propertyType: 'Function',
                        gridOpProp: {
                            meta: {
                                comment: 'Used to programmatically create charts from a range.',
                                tags: [
                                    {
                                        name: 'agModule',
                                        comment: '`IntegratedChartsModule`',
                                        modules: [{ name: 'IntegratedChartsModule', isEnterprise: true }],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            links
        );

        expect(bodyRows(output)[0][4]).toBe(
            'Used to programmatically create charts from a range. Module: [`IntegratedChartsModule`](https://www.ag-grid.com/javascript-data-grid/modules/).'
        );
    });

    it('lists every module when a property is available in more than one', () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    getRowId: {
                        definition: { description: 'Row id callback.' },
                        propertyType: 'Function',
                        gridOpProp: {
                            meta: { tags: [{ name: 'agModule', comment: '`RowApiModule` / `RowSelectionModule`' }] },
                        },
                    },
                },
            },
            links
        );

        expect(bodyRows(output)[0][4]).toContain('Modules (any of): [`RowApiModule`]');
        expect(bodyRows(output)[0][4]).toContain('[`RowSelectionModule`]');
    });

    it('leads with the section copy the page shows, not a fabricated heading', () => {
        const output = buildApiReferenceSection(
            {
                title: 'CreateRangeChartParams',
                meta: {
                    displayName: 'createRangeChart params',
                    description: 'Properties available on the `CreateRangeChartParams` interface.',
                },
                // interfaceDocumentation hides the header by default, as the page does.
                config: { hideHeader: true },
                properties,
            },
            links
        );

        expect(output.startsWith('Properties available on the `CreateRangeChartParams` interface.')).toBe(true);
        expect(output).not.toContain('### createRangeChart params');
    });

    it('emits the heading and description for a section the page shows a header for', () => {
        const output = buildApiReferenceSection(
            {
                title: 'rowGrouping',
                meta: {
                    displayName: 'Row Grouping',
                    description: 'Grouping options.',
                    page: { name: 'Row Grouping', url: './grouping/' },
                },
                config: {},
                properties,
            },
            links
        );

        expect(output).toContain('### Row Grouping');
        expect(output).toContain('Grouping options.');
        expect(output).toContain('See [Row Grouping](https://www.ag-grid.com/javascript-data-grid/grouping/)');
    });

    it('omits the header entirely for a subset of a larger reference', () => {
        const output = buildApiReferenceSection(
            { title: 'charts', meta: { displayName: 'Charts' }, config: { isSubset: true }, properties },
            links
        );

        expect(output.startsWith('| Property |')).toBe(true);
    });

    it('degrades to an empty string when the section has no properties', () => {
        expect(buildApiReferenceSection({ config: {}, properties: {} }, links)).toBe('');
    });
});
