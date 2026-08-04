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

    it('links the type to its reference page, as the page does', () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    chartContainer: {
                        definition: { description: 'Provide to display the chart outside the grid.' },
                        propertyType: 'HTMLElement',
                        gridOpProp: { type: { returnType: 'HTMLElement' } },
                    },
                    chartThemeOverrides: {
                        definition: { description: 'Allows chart options to be overridden.' },
                        propertyType: 'AgChartThemeOverrides',
                        gridOpProp: { type: { returnType: 'AgChartThemeOverrides' } },
                    },
                    columnDefs: {
                        definition: { type: 'ColDef', description: 'Column definitions.' },
                        propertyType: 'ColDef',
                    },
                    chartType: {
                        definition: { description: 'The type of chart to create.' },
                        propertyType: 'ChartType',
                        gridOpProp: { type: { returnType: 'ChartType' } },
                    },
                },
            },
            links
        );

        const [chartContainer, chartThemeOverrides, columnDefs, chartType] = bodyRows(output);
        // An external type link is left as-is rather than prefixed with the site root.
        expect(chartContainer[1]).toBe('[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)');
        expect(chartThemeOverrides[1]).toBe(
            '[`AgChartThemeOverrides`](https://www.ag-grid.com/charts/themes-api/#reference-AgChartTheme-overrides)'
        );
        expect(columnDefs[1]).toBe('[`ColDef`](https://www.ag-grid.com/javascript-data-grid/column-properties/)');
        // ChartType has no entry in the type link map, so the page does not link it either.
        expect(chartType[1]).toBe('`ChartType`');
    });

    it('escapes the pipe inside a linked union type', () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    aggFunc: {
                        definition: { description: 'The aggregation function to apply.' },
                        propertyType: 'string | IAggFunc',
                        gridOpProp: { type: { returnType: 'string | IAggFunc' } },
                    },
                },
            },
            links
        );

        expect(output).toContain(
            '[`string \\| IAggFunc`](https://www.ag-grid.com/javascript-data-grid/aggregation-custom-functions/)'
        );
    });

    it('leaves the type unlinked where the page has no link to give it', () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    createRangeChart: {
                        definition: {},
                        propertyType: 'Function',
                        gridOpProp: { type: { arguments: {}, returnType: 'void' }, meta: { comment: 'Create it.' } },
                    },
                    defaultColDef: {
                        // No description of its own, so this is a parent object — the page
                        // links its type to an in-page anchor the markdown does not have.
                        definition: { type: 'ColDef', meta: { description: 'Default column definition.' } },
                        propertyType: 'ColDef',
                    },
                    columnDefs: {
                        // A union where more than one member is linkable is ambiguous, so
                        // the page links neither.
                        definition: { type: 'ColDef | ColGroupDef', description: 'Column definitions.' },
                        propertyType: 'ColDef | ColGroupDef',
                    },
                },
            },
            links
        );

        const [createRangeChart, defaultColDef] = bodyRows(output);
        expect(createRangeChart[1]).toBe('`Function`');
        expect(defaultColDef[1]).toBe('`ColDef`');
        expect(output).not.toContain('#reference-');
        // bodyRows splits on the pipe, so assert the union against the whole output.
        expect(output).toContain('| `columnDefs` | `ColDef \\| ColGroupDef` |');
    });

    it("keeps the property's see-also link, its options and its initial badge", () => {
        const output = buildApiReferenceSection(
            {
                config: {},
                properties: {
                    unlinkChart: {
                        definition: {
                            default: false,
                            description: 'When enabled the chart will be unlinked from the grid after creation.',
                            more: {
                                name: 'Unlinking Charts',
                                url: './integrated-charts-menu/#default-chart-menu-items',
                            },
                        },
                        propertyType: 'boolean',
                        gridOpProp: {
                            meta: {
                                tags: [
                                    { name: 'initial' },
                                    {
                                        name: 'agModule',
                                        comment: '`IntegratedChartsModule`',
                                        modules: [{ name: 'IntegratedChartsModule', isEnterprise: true }],
                                    },
                                ],
                            },
                        },
                    },
                    chartThemeName: {
                        definition: {
                            description: 'The default theme to use for the created chart.',
                            options: ['ag-default', 'ag-vivid'],
                        },
                        propertyType: 'string',
                    },
                },
            },
            links
        );

        const [unlinkChart, chartThemeName] = bodyRows(output);
        // Asserted whole, as the order the page shows these in is part of the behaviour.
        expect(unlinkChart[4]).toBe(
            'When enabled the chart will be unlinked from the grid after creation. ' +
                'See [Unlinking Charts](https://www.ag-grid.com/javascript-data-grid/integrated-charts-menu/#default-chart-menu-items) for more information. ' +
                'Module: [`IntegratedChartsModule`](https://www.ag-grid.com/javascript-data-grid/modules/). ' +
                '[Initial](https://www.ag-grid.com/javascript-data-grid/grid-interface/#initial-grid-options).'
        );
        expect(chartThemeName[4]).toBe(
            "The default theme to use for the created chart. Options: `'ag-default'`, `'ag-vivid'`."
        );
    });

    it('takes the initial link from the config when the tag overrides it', () => {
        const output = buildApiReferenceSection(
            {
                config: { initialLink: './column-interface/#initial-column-options' },
                properties: {
                    sortable: {
                        definition: { description: 'Set to true to allow sorting.' },
                        propertyType: 'boolean',
                        gridOpProp: { meta: { tags: [{ name: 'initial' }] } },
                    },
                },
            },
            links
        );

        expect(bodyRows(output)[0][4]).toContain(
            '[Initial](https://www.ag-grid.com/javascript-data-grid/column-interface/#initial-column-options).'
        );
    });

    it('omits the see-also link when the page hides it or it has no target', () => {
        const properties = {
            unlinkChart: {
                definition: {
                    description: 'Unlink the chart.',
                    more: { name: 'Unlinking Charts', url: './integrated-charts-menu/' },
                },
                propertyType: 'boolean',
            },
            chartThemeOverrides: {
                definition: { description: 'Override the theme.', more: { name: 'Overriding Existing Themes' } },
                propertyType: 'string',
            },
        };

        const hidden = buildApiReferenceSection({ config: { hideMore: true }, properties }, links);
        expect(hidden).not.toContain('Unlinking Charts');

        const shown = buildApiReferenceSection({ config: {}, properties }, links);
        expect(shown).toContain('See [Unlinking Charts]');
        expect(shown).not.toContain('Overriding Existing Themes');
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
