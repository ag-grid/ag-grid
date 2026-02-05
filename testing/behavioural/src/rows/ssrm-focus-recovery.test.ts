import type { GridApi, GridOptions } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForEvent, waitForNoLoadingRows } from '../test-utils';

describe('SSRM Focus Recovery', () => {
    const columnDefs = [{ field: 'value' }];
    const rowData = Array.from({ length: 50 }, (_, index) => ({ value: `Row ${index}` }));

    const gridMgr = new TestGridsManager({
        modules: [ServerSideRowModelModule],
    });

    beforeEach(() => {
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    function createGrid(gridOptions: GridOptions): GridApi {
        return gridMgr.createGrid('myGrid', gridOptions);
    }

    test('restores focused cell when tab guard holds focus during SSRM refresh', async () => {
        const api = createGrid({
            columnDefs,
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            maxBlocksInCache: 1,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            serverSideDatasource: {
                getRows(params) {
                    const { startRow, endRow } = params.request;
                    window.setTimeout(() => {
                        params.success({
                            rowData: rowData.slice(startRow, endRow),
                            rowCount: rowData.length,
                        });
                    }, 5);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.setFocusedCell(9, 'value');
        await asyncSetTimeout(0);

        const gridElement = TestGridsManager.getHTMLElement(api);
        const tabGuard = gridElement?.querySelector<HTMLElement>('.ag-tab-guard-bottom');
        expect(tabGuard).toBeTruthy();
        tabGuard!.focus();
        expect(document.activeElement).toBe(tabGuard);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(0);

        const focusedCell = api.getFocusedCell();
        expect(focusedCell?.rowIndex).toBe(9);

        const activeElement = document.activeElement as HTMLElement | null;
        const activeCell = activeElement?.closest('.ag-cell') as HTMLElement | null;
        expect(activeCell).toBeTruthy();

        const activeRow = activeCell!.closest('.ag-row');
        expect(activeRow?.getAttribute('row-index')).toBe('9');
    });
});
