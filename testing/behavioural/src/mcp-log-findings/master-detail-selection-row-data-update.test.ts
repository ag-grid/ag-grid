import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { GetDetailRowDataParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

/**
 * Detail grid selection is lost on rowData update despite getRowId and the default refresh strategy.
 *
 * Problem: with master detail, getRowId on both grids and multiRow selection (masterSelects: 'detail'), a row
 * selected in an expanded detail grid is deselected after api.setGridOption('rowData', <copy with the same ids>).
 * Master row selection is preserved.
 *
 * Note: the report this came from (Angular 35.1.0) described a rendered-vs-API desync, where rows still render
 * as selected but getSelectedNodes() is empty. That was NOT reproduced as stated: here the rendered state and
 * the API agree (both empty) for the detail grid, and the master grid is consistent. Angular itself was not
 * tested; this is a vanilla JS test.
 *
 * Setup: master rows with getRowId, rowSelection { mode: 'multiRow', masterSelects: 'detail' }, a detail grid
 * with its own multiRow selection and getRowId. Expand a master row, select a detail row, select another master
 * row, then replace rowData with new objects that have the same ids.
 *
 * Expected: selection is keyed by row id and restored for re-created nodes, so the detail row stays selected
 * (https://www.ag-grid.com/javascript-data-grid/row-selection-multi/ and
 * https://www.ag-grid.com/javascript-data-grid/updating-data/ - with getRowId, selection is preserved).
 *
 * Actual: the master selection is kept, but the selection made in the expanded detail grid is lost (its
 * getSelectedNodes() is empty and its row is no longer rendered selected).
 *
 * Reported on: AG Grid Angular 35.1.0 (as a different symptom, see above).
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). One search (Angular 35.1.0, March 2026):
 * "master detail grid selection desync setGridOption rowData preserves visual selection but getSelectedNodes
 * returns empty immutable data".
 */
describe('master detail selection survives immutable rowData update', () => {
    const makeData = () => [
        {
            id: 'a',
            sport: 'football',
            detail: [
                { id: 'a1', games: 1 },
                { id: 'a2', games: 2 },
            ],
        },
        {
            id: 'b',
            sport: 'rugby',
            detail: [
                { id: 'b1', games: 3 },
                { id: 'b2', games: 4 },
            ],
        },
        {
            id: 'c',
            sport: 'tennis',
            detail: [
                { id: 'c1', games: 5 },
                { id: 'c2', games: 6 },
            ],
        },
    ];

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule, MasterDetailModule],
    });

    beforeEach(() => gridMgr.reset());
    afterEach(() => gridMgr.reset());

    test('detail grid selection is preserved after rowData update with getRowId', async () => {
        const errorSpy = vitest.spyOn(console, 'error');
        const api: GridApi = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'sport', cellRenderer: 'agGroupCellRenderer' }],
            rowData: makeData(),
            getRowId: (p) => p.data.id,
            rowSelection: { mode: 'multiRow', masterSelects: 'detail' },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'games' }],
                    rowSelection: { mode: 'multiRow' },
                    getRowId: (p: any) => p.data.id,
                },
                getDetailRowData(params: GetDetailRowDataParams) {
                    params.successCallback(params.data.detail);
                },
            },
        });
        await waitForEvent('firstDataRendered', api);

        api.getRowNode('a')!.setExpanded(true);
        await waitFor(() => expect(api.getDetailGridInfo('detail_a')?.api?.getDisplayedRowCount()).toBe(2));
        const detailApi = api.getDetailGridInfo('detail_a')!.api!;

        detailApi.getRowNode('a1')!.setSelected(true);
        api.getRowNode('c')!.setSelected(true);
        await waitFor(() =>
            expect(
                api
                    .getSelectedNodes()
                    .map((n) => n.id)
                    .sort()
            ).toContain('c')
        );
        const beforeMaster = api
            .getSelectedNodes()
            .map((n) => n.id)
            .sort();
        const beforeDetail = detailApi
            .getSelectedNodes()
            .map((n) => n.id)
            .sort();

        api.setGridOption('rowData', makeData());
        // let any async re-render settle
        await waitFor(() => expect(api.getRowNode('c')).toBeDefined());

        const gridEl = document.querySelector('#myGrid')!;
        const masterRendered = Array.from(gridEl.querySelectorAll('.ag-row-selected[row-id]'))
            .map((r) => r.getAttribute('row-id'))
            .filter((id) => id && ['a', 'b', 'c'].includes(id))
            .sort();

        // Selection must be preserved by id, and what is rendered must match what the API reports.
        const afterMaster = api
            .getSelectedNodes()
            .map((n) => n.id)
            .sort();
        expect(afterMaster).toEqual(beforeMaster);
        expect(afterMaster).toEqual(masterRendered);

        const newDetailApi = api.getDetailGridInfo('detail_a')?.api;
        if (newDetailApi) {
            await waitFor(() => expect(newDetailApi.getDisplayedRowCount()).toBe(2));
            const detailEl = gridEl.querySelector('[row-id="detail_a"]')!;
            const detailRendered = Array.from(detailEl.querySelectorAll('.ag-row-selected[row-id]'))
                .map((r) => r.getAttribute('row-id'))
                .sort();
            expect(
                newDetailApi
                    .getSelectedNodes()
                    .map((n) => n.id)
                    .sort()
            ).toEqual(beforeDetail);
            expect(detailRendered).toEqual(beforeDetail);
        }
        expect(errorSpy.mock.calls.filter((c) => String(c[0]).includes('#200'))).toEqual([]);
        errorSpy.mockRestore();
    });
});
