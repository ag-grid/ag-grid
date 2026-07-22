import type { GetRowIdFunc, GetRowIdParams, GridOptions } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';

/**
 * Black-box behavioural tests for SSRM selection, exercised entirely through the public grid API
 * and a real server-side grid. Each test pins an observable behaviour (selection counts, selected
 * nodes/rows, displayed rows) rather than any internal selection-strategy shape.
 */
describe('SSRM Selection (behavioural)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ServerSideRowModelApiModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    // AG-16019: repeating the same row-remove transaction must be idempotent — the selection state
    // stays consistent and the store is not corrupted by the second, redundant remove.
    test('repeating the same remove transaction is idempotent for selection and row state', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const rows = rowData.slice(params.request.startRow ?? 0, params.request.endRow ?? rowData.length);
                    params.success({ rowData: rows, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        api.getRowNode('1')!.setSelected(true);
        api.getRowNode('3')!.setSelected(true);
        expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['1', '3']);

        const firstRemove = api.applyServerSideTransaction({ remove: [{ id: 1 }] });
        expect(firstRemove?.status).toBe('Applied');

        // The redundant repeat must be a clean no-op: id 1 is already gone, so nothing is removed
        // and the surviving selection (id 3) and remaining rows are untouched.
        const secondRemove = api.applyServerSideTransaction({ remove: [{ id: 1 }] });
        expect(secondRemove?.status).toBe('Applied');
        expect(secondRemove?.remove?.length ?? 0).toBe(0);

        expect(api.getDisplayedRowCount()).toBe(4);
        expect(api.getRowNode('1')).toBeUndefined();
        expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['3']);
        expect(api.getSelectedRows()).toEqual([{ id: 3, value: 'Row 3' }]);

        await new GridRows(api, `idempotent remove final`).check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:2 id:2 value:"Row 2"
            ├── LEAF selected id:3 id:3 value:"Row 3"
            └── LEAF id:4 id:4 value:"Row 4"
        `);
    });

    // AG-8439: numeric row ids (getRowId returning a number) must work with selection.
    test('numeric row ids work with selection', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        // A user returning the raw numeric id from getRowId; the grid must handle non-string ids.
        const numericGetRowId = ((params: GetRowIdParams) => params.data.id) as unknown as GetRowIdFunc;

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            getRowId: numericGetRowId,
            serverSideDatasource: {
                getRows: (params) => {
                    const rows = rowData.slice(params.request.startRow ?? 0, params.request.endRow ?? rowData.length);
                    params.success({ rowData: rows, rowCount: rowData.length });
                },
            },
        };

        // Returning a numeric id warns (#25) that getRowId must return a string and the id is cast —
        // that cast is exactly the behaviour under test, so assert the warning fires.
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('#25');

        const node0 = api.getRowNode('0')!;
        const node2 = api.getRowNode('2')!;
        node0.setSelected(true);
        node2.setSelected(true);

        expect(node0.isSelected()).toBe(true);
        expect(node2.isSelected()).toBe(true);
        expect(api.getRowNode('1')!.isSelected()).toBe(false);

        expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['0', '2']);
        expect(api.getSelectedRows()).toEqual([
            { id: 0, value: 'Row 0' },
            { id: 2, value: 'Row 2' },
        ]);

        await new GridRows(api, `numeric ids final`).check(`
            ROOT id:<no-id>
            ├── LEAF selected id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            ├── LEAF selected id:2 id:2 value:"Row 2"
            ├── LEAF id:3 id:3 value:"Row 3"
            └── LEAF id:4 id:4 value:"Row 4"
        `);
    });
});
