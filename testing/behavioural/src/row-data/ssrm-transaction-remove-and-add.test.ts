import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type {
    AsyncTransactionsFlushedEvent,
    GridApi,
    GridOptions,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    id: number;
    price: number;
}

describe('SSRM transaction that removes and adds rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowSelectionModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(options: GridOptions = {}): Promise<GridApi<Row>> {
        const allRows: Row[] = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, price: i + 1 }));
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'price' }],
            rowModelType: 'serverSide',
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const rowData = allRows.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData, rowCount: allRows.length });
                },
            },
            ...options,
        });
        await waitForEvent('firstDataRendered', api);
        return api;
    }

    function displayedIds(api: GridApi<Row>): (string | undefined)[] {
        const ids: (string | undefined)[] = [];
        for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
            ids.push(api.getDisplayedRowAtIndex(i)?.id);
        }
        return ids;
    }

    function expectRow5MovedToIndex2(api: GridApi<Row>, result: ServerSideTransactionResult | undefined) {
        expect(result?.status).toBe('Applied');
        expect(result?.add?.map((node) => node.id)).toEqual(['5']);
        expect(result?.remove?.map((node) => node.id)).toEqual(['5']);
        expect(result?.unapplied).toBeUndefined();

        expect(api.getDisplayedRowCount()).toBe(50);
        expect(displayedIds(api).slice(0, 6)).toEqual(['1', '2', '5', '3', '4', '6']);
        expect(api.getRowNode('5')?.data).toEqual({ id: 5, price: 555 });
    }

    test('a row removed and added with the same ID in one transaction is moved', async () => {
        const api = await createGrid();

        const result = api.applyServerSideTransaction({
            remove: [{ id: 5, price: 5 }],
            add: [{ id: 5, price: 555 }],
            addIndex: 2,
        });

        expectRow5MovedToIndex2(api, result);
    });

    test('a row removed and added with the same ID in one async transaction is moved', async () => {
        const api = await createGrid();
        const flushed = new Promise<AsyncTransactionsFlushedEvent>((resolve) => {
            api.addEventListener('asyncTransactionsFlushed', resolve);
        });

        api.applyServerSideTransactionAsync({
            remove: [{ id: 5, price: 5 }],
            add: [{ id: 5, price: 555 }],
            addIndex: 2,
        });
        api.flushServerSideAsyncTransactions();
        const event = await flushed;

        expectRow5MovedToIndex2(api, event.results[0] as ServerSideTransactionResult);
    });

    test('an addIndex at the end of the store before the removal still adds the row at the end', async () => {
        const api = await createGrid();

        const result = api.applyServerSideTransaction({
            remove: [{ id: 1, price: 1 }],
            add: [{ id: 100, price: 100 }],
            addIndex: 50,
        });

        expect(result?.add?.map((node) => node.id)).toEqual(['100']);
        expect(result?.unapplied).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(50);
        expect(api.getDisplayedRowAtIndex(49)?.id).toBe('100');
    });

    test('the transaction rowCount is the row count after the add', async () => {
        const api = await createGrid();

        api.applyServerSideTransaction({
            remove: [{ id: 5, price: 5 }],
            add: [{ id: 5, price: 555 }],
            addIndex: 2,
            rowCount: 50,
        });

        expect(api.getDisplayedRowCount()).toBe(50);
        expect(api.getDisplayedRowAtIndex(2)?.id).toBe('5');
    });

    test('a selected row removed and added with the same ID is not selected', async () => {
        const api = await createGrid({ rowSelection: { mode: 'multiRow' } });
        api.getRowNode('5')?.setSelected(true);

        api.applyServerSideTransaction({
            remove: [{ id: 5, price: 5 }],
            add: [{ id: 5, price: 555 }],
            addIndex: 2,
        });

        expect(api.getRowNode('5')?.isSelected()).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);
    });
});
