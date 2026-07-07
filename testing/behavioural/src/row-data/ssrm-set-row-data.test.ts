/**
 * Characterisation tests (golden-master) pinning the CURRENT behaviour of bulk
 * row-data setting in the Server-Side Row Model:
 *   - `api.applyServerSideRowData({ successParams, route?, startRow? })` — setting a
 *     route's rows directly without a further datasource getRows call.
 *   - `api.setRowCount(rowCount, maxRowFound?)` — server-side row count changes.
 *
 * These tests pin whatever the grid currently does. Where an assertion encodes a
 * bug or a surprising quirk, that is intentional: the value recorded is the current
 * mechanic, not the ideal one.
 */
import type { GridOptions } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';

describe('SSRM bulk row-data setting (characterisation)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('applyServerSideRowData at root replaces rows without a further getRows call', async () => {
        const rowData = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        // Record every datasource request so we can assert the stream does not grow.
        const requests: Array<{ startRow: number | undefined; endRow: number | undefined }> = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (p: any) => String(p.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    requests.push({ startRow: params.request.startRow, endRow: params.request.endRow });
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        expect(api.getDisplayedRowCount()).toBe(10);
        const requestsAfterInitialLoad = requests.length;

        // Bulk-set the root rows directly.
        const newRows = [
            { id: 100, value: 'A' },
            { id: 101, value: 'B' },
            { id: 102, value: 'C' },
        ];
        api.applyServerSideRowData({ successParams: { rowData: newRows, rowCount: newRows.length } });

        await new GridRows(api, 'applyServerSideRowData root replace').check(`
            ROOT id:<no-id>
            ├── LEAF id:100 id:100 value:"A"
            ├── LEAF id:101 id:101 value:"B"
            └── LEAF id:102 id:102 value:"C"
        `);

        // Pin: setting rows directly does NOT trigger another datasource request.
        expect(requests.length).toBe(requestsAfterInitialLoad);
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(100);
    });

    test('applyServerSideRowData with a different rowCount updates the displayed count', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (p: any) => String(p.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        expect(api.getDisplayedRowCount()).toBe(5);

        // Supply fewer rows than the declared rowCount: rowCount larger than rowData.
        api.applyServerSideRowData({
            successParams: {
                rowData: [
                    { id: 200, value: 'X' },
                    { id: 201, value: 'Y' },
                ],
                rowCount: 8,
            },
        });

        await new GridRows(api, 'applyServerSideRowData higher rowCount').check(`skip-snapshot`);

        // Pin: displayed count follows the supplied rowCount, remaining rows are fillers.
        expect(api.getDisplayedRowCount()).toBe(8);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(200);
        expect(api.getDisplayedRowAtIndex(1)?.data.id).toBe(201);
        // Surprising: declaring rowCount 8 while supplying only 2 rows fires a
        // datasource getRows to backfill the remainder, so index 2 is NOT a filler —
        // it carries a row from the ORIGINAL datasource, mixed in with the directly-set rows.
        expect(api.getDisplayedRowAtIndex(2)?.data.id).toBe(2);
        expect(api.getDisplayedRowAtIndex(2)?.data.value).toBe('Row 2');
    });

    test("applyServerSideRowData with a route sets only that group's children", async () => {
        const leafRows = [
            { id: 0, group: 'A', value: 'a0' },
            { id: 1, group: 'A', value: 'a1' },
            { id: 2, group: 'B', value: 'b0' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { field: 'value' },
            rowModelType: 'serverSide',
            getRowId: (p: any) =>
                p.data.group !== undefined && p.data.id === undefined ? `group-${p.data.group}` : String(p.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const groupKeys: string[] = params.request.groupKeys;
                    if (groupKeys.length === 0) {
                        // Top-level: the two groups A and B.
                        const groups = [{ group: 'A' }, { group: 'B' }];
                        params.success({ rowData: groups, rowCount: groups.length });
                        return;
                    }
                    const key = groupKeys[0];
                    const children = leafRows.filter((r) => r.group === key);
                    params.success({ rowData: children, rowCount: children.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Expand group A so its route is materialised.
        const groupA = api.getRowNode('group-A');
        expect(!!groupA).toBe(true);
        api.setRowNodeExpanded(groupA!, true);
        await waitForEvent('modelUpdated', api);

        await new GridRows(api, 'route setup expanded group A').check(`skip-snapshot`);

        // Now bulk-set group A's children via its route.
        api.applyServerSideRowData({
            route: ['A'],
            successParams: {
                rowData: [
                    { id: 10, group: 'A', value: 'a-new-0' },
                    { id: 11, group: 'A', value: 'a-new-1' },
                    { id: 12, group: 'A', value: 'a-new-2' },
                ],
                rowCount: 3,
            },
        });

        await new GridRows(api, 'route replace group A children').check(`skip-snapshot`);

        // Pin: group A now shows the new children, group B untouched.
        expect(!!api.getRowNode('10')).toBe(true);
        expect(!!api.getRowNode('11')).toBe(true);
        expect(!!api.getRowNode('12')).toBe(true);
        expect(!!api.getRowNode('0')).toBe(false);
        expect(!!api.getRowNode('group-B')).toBe(true);
    });

    test('setRowCount raises the displayed count with fillers for the extra rows', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (p: any) => String(p.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        expect(api.getDisplayedRowCount()).toBe(5);

        api.setRowCount(12);
        await new GridRows(api, 'setRowCount raise').check(`skip-snapshot`);

        expect(api.getDisplayedRowCount()).toBe(12);
        // Existing loaded rows are preserved.
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(0);
        // Extra rows beyond the loaded block are fillers.
        expect(!!api.getDisplayedRowAtIndex(11)?.data).toBe(false);
    });

    test('setRowCount below the loaded count truncates the displayed rows', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (p: any) => String(p.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        expect(api.getDisplayedRowCount()).toBe(5);

        api.setRowCount(2);
        await new GridRows(api, 'setRowCount truncate').check(`skip-snapshot`);

        expect(api.getDisplayedRowCount()).toBe(2);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(0);
        expect(api.getDisplayedRowAtIndex(1)?.data.id).toBe(1);
    });
});
