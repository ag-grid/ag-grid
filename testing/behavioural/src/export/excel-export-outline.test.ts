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
});
