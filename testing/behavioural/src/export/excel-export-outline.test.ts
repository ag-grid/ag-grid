import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule, RowGroupingModule } from 'ag-grid-enterprise';

const getXmlAttributes = (tag: string): Record<string, string> =>
    Object.fromEntries([...tag.matchAll(/([\w:]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));

const getRowOutlineLevels = (sheetXml: string): (string | undefined)[] =>
    [...sheetXml.matchAll(/<row [^>]*>/g)].map((match) => getXmlAttributes(match[0]).outlineLevel);

const getSheetFormatPr = (sheetXml: string): Record<string, string> =>
    getXmlAttributes(sheetXml.match(/<sheetFormatPr [^>]*\/>/)![0]);

const getColOutlines = (sheetXml: string): { min?: string; max?: string; outlineLevel?: string; width?: string }[] =>
    [...sheetXml.matchAll(/<col [^>]*\/>/g)].map((match) => {
        const { min, max, outlineLevel, width } = getXmlAttributes(match[0]);
        return { min, max, outlineLevel, width };
    });

describe('Excel export outlines', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExcelExportModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { country: 'Ireland', sport: 'Golf' },
        { country: 'Ireland', sport: 'Rugby' },
        { country: 'Spain', sport: 'Tennis' },
    ];

    const waitForDisplayedRowCount = async (api: GridApi, count: number): Promise<void> => {
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(count));
    };

    // header row, Ireland group, 2 leaves, Spain group, 1 leaf
    const expectedGroupedOutlineLevels = [undefined, undefined, '1', '1', undefined, '1'];

    test('creates row outlines when columns are grouped dynamically after the first render', async () => {
        const api = gridsManager.createGrid('excel-dynamic-group-outline', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }],
            rowData,
        });
        await waitForDisplayedRowCount(api, 3);

        api.setRowGroupColumns(['country']);
        // groups are collapsed by default, so the leaf rows are never displayed after grouping
        await waitForDisplayedRowCount(api, 2);

        const sheetXml = api.getSheetDataForExcel()!;
        expect(getRowOutlineLevels(sheetXml)).toEqual(expectedGroupedOutlineLevels);
        expect(getSheetFormatPr(sheetXml).outlineLevelRow).toBe('1');
    });

    test('creates row outlines when columns are grouped from the start', async () => {
        const api = gridsManager.createGrid('excel-static-group-outline', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }],
            rowData,
        });
        await waitForDisplayedRowCount(api, 2);

        const sheetXml = api.getSheetDataForExcel()!;
        expect(getRowOutlineLevels(sheetXml)).toEqual(expectedGroupedOutlineLevels);
        expect(getSheetFormatPr(sheetXml).outlineLevelRow).toBe('1');
    });

    test('creates row outlines when using multiple group columns display', async () => {
        const api = gridsManager.createGrid('excel-multi-col-group-outline', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }],
            groupDisplayType: 'multipleColumns',
            groupDefaultExpanded: -1,
            rowData,
        });
        await waitForDisplayedRowCount(api, 5);

        const sheetXml = api.getSheetDataForExcel()!;
        expect(getRowOutlineLevels(sheetXml)).toEqual(expectedGroupedOutlineLevels);
    });

    test('skips parents hidden by groupHideParentOfSingleChild in row outline levels', async () => {
        const api = gridsManager.createGrid('excel-hidden-parent-outline', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }],
            groupHideParentOfSingleChild: true,
            groupDefaultExpanded: -1,
            rowData: [
                { country: 'Ireland', sport: 'Golf' },
                { country: 'Spain', sport: 'Tennis' },
                { country: 'Spain', sport: 'Football' },
            ],
        });
        // Ireland's group row is hidden as it has a single child
        await waitForDisplayedRowCount(api, 4);

        const sheetXml = api.getSheetDataForExcel()!;
        // header row, Ireland leaf (hidden parent, level 0), Spain group, 2 leaves
        expect(getRowOutlineLevels(sheetXml)).toEqual([undefined, undefined, undefined, '1', '1']);
    });

    test('creates per-column outline levels for collapsible column groups, preserving widths', async () => {
        const api = gridsManager.createGrid('excel-column-group-outline', {
            columnDefs: [
                {
                    headerName: 'Details',
                    openByDefault: true,
                    children: [
                        { field: 'a', width: 150 },
                        { field: 'b', width: 120, columnGroupShow: 'open' },
                        { field: 'c', width: 130, columnGroupShow: 'open' },
                    ],
                },
                { field: 'd', width: 90 },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
        });
        await waitForDisplayedRowCount(api, 1);

        const sheetXml = api.getSheetDataForExcel()!;
        // one <col> per exported column, no extra overlapping records for the collapsible range
        expect(getColOutlines(sheetXml)).toEqual([
            { min: '1', max: '1', outlineLevel: undefined, width: '21' },
            { min: '2', max: '2', outlineLevel: '1', width: '17' },
            { min: '3', max: '3', outlineLevel: '1', width: '18' },
            { min: '4', max: '4', outlineLevel: undefined, width: '13' },
        ]);
        expect(getSheetFormatPr(sheetXml).outlineLevelCol).toBe('1');
    });

    test('nests column outline levels for nested column groups without inflating them via padded rows', async () => {
        const api = gridsManager.createGrid('excel-nested-column-group-outline', {
            columnDefs: [
                {
                    headerName: 'Outer',
                    openByDefault: true,
                    children: [
                        { field: 'a', suppressSpanHeaderHeight: true },
                        { field: 'b', columnGroupShow: 'open', suppressSpanHeaderHeight: true },
                        {
                            headerName: 'Inner',
                            openByDefault: true,
                            children: [{ field: 'c' }, { field: 'd', columnGroupShow: 'open' }],
                        },
                    ],
                },
                { field: 'e' },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4, e: 5 }],
        });
        await waitForDisplayedRowCount(api, 1);

        const sheetXml = api.getSheetDataForExcel()!;
        expect(getColOutlines(sheetXml).map(({ min, outlineLevel }) => [min, outlineLevel])).toEqual([
            ['1', undefined],
            ['2', '1'],
            ['3', undefined],
            ['4', '2'],
            ['5', undefined],
        ]);
        expect(getSheetFormatPr(sheetXml).outlineLevelCol).toBe('2');
    });

    test('suppressColumnOutline omits all column outline data', async () => {
        const api = gridsManager.createGrid('excel-suppress-column-outline', {
            columnDefs: [
                {
                    headerName: 'Details',
                    openByDefault: true,
                    children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }],
                },
                { field: 'c' },
            ],
            rowData: [{ a: 1, b: 2, c: 3 }],
        });
        await waitForDisplayedRowCount(api, 1);

        const sheetXml = api.getSheetDataForExcel({ suppressColumnOutline: true })!;
        const cols = getColOutlines(sheetXml);
        expect(cols).toHaveLength(3);
        expect(cols.every((col) => col.outlineLevel === undefined)).toBe(true);
        expect(getSheetFormatPr(sheetXml).outlineLevelCol).toBeUndefined();
    });

    test('places group footers one outline level deeper and grand totals at the top level', async () => {
        const api = gridsManager.createGrid('excel-footer-outline', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
            rowData,
        });
        await waitForDisplayedRowCount(api, 8);

        const sheetXml = api.getSheetDataForExcel()!;
        // header, Ireland group, 2 leaves, Ireland footer, Spain group, 1 leaf, Spain footer, grand total
        expect(getRowOutlineLevels(sheetXml)).toEqual([
            undefined,
            undefined,
            '1',
            '1',
            '1',
            undefined,
            '1',
            '1',
            undefined,
        ]);
    });

    test('emits no row outline data when groupHideOpenParents is enabled', async () => {
        const api = gridsManager.createGrid('excel-hide-open-parents-outline', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }],
            groupHideOpenParents: true,
            groupDefaultExpanded: -1,
            rowData,
        });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBeGreaterThan(0));

        // group rows are omitted from the export, so their children must not carry
        // outline levels pointing at absent summary rows, even when collapsing
        const sheetXml = api.getSheetDataForExcel({ rowGroupExpandState: 'collapsed' })!;
        const rowOutlineLevels = getRowOutlineLevels(sheetXml);
        expect(rowOutlineLevels.length).toBeGreaterThan(1);
        expect(rowOutlineLevels.every((level) => level === undefined)).toBe(true);
        expect(getSheetFormatPr(sheetXml).outlineLevelRow).toBeUndefined();
        expect(sheetXml).not.toContain('hidden="1"');
        expect(sheetXml).not.toContain('collapsed="1"');
    });
});
