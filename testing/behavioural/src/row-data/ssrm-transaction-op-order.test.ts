import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type {
    AsyncTransactionsFlushedEvent,
    GridApi,
    ServerSideTransaction,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    id: number;
    price: number;
}

/**
 * The SSRM applies a transaction's `update`, then its `add`, then its `remove`.
 * Applications rely on this order, so changing it is a breaking change (AG-19445).
 */
describe('SSRM transaction operation order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(): Promise<GridApi<Row>> {
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
        });
        await waitForEvent('firstDataRendered', api);
        return api;
    }

    async function applyAsync(
        api: GridApi<Row>,
        transaction: ServerSideTransaction
    ): Promise<ServerSideTransactionResult> {
        const flushed = new Promise<AsyncTransactionsFlushedEvent>((resolve) => {
            api.addEventListener('asyncTransactionsFlushed', resolve);
        });
        api.applyServerSideTransactionAsync(transaction);
        api.flushServerSideAsyncTransactions();
        const event = await flushed;
        return event.results[0] as ServerSideTransactionResult;
    }

    const ids = (nodes: { id?: string }[] | undefined) => nodes?.map((node) => node.id);

    test('a row updated and removed in one transaction is updated, then removed', async () => {
        const api = await createGrid();

        const result = api.applyServerSideTransaction({
            update: [{ id: 5, price: 555 }],
            remove: [{ id: 5, price: 5 }],
        });

        expect(result?.status).toBe('Applied');
        expect(ids(result?.update)).toEqual(['5']);
        expect(ids(result?.remove)).toEqual(['5']);
        expect(api.getRowNode('5')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('an update for a new row added in the same transaction is ignored, as it runs before the add', async () => {
        const api = await createGrid();

        const result = api.applyServerSideTransaction({
            add: [{ id: 100, price: 100 }],
            update: [{ id: 100, price: 999 }],
            addIndex: 2,
        });

        expect(result?.status).toBe('Applied');
        expect(ids(result?.update)).toEqual([]);
        expect(ids(result?.add)).toEqual(['100']);
        expect(api.getRowNode('100')?.data).toEqual({ id: 100, price: 100 });
    });

    test('a new row added and removed in one transaction is added, then removed', async () => {
        const api = await createGrid();

        const result = api.applyServerSideTransaction({
            add: [{ id: 100, price: 100 }],
            remove: [{ id: 100, price: 100 }],
            addIndex: 2,
        });

        expect(result?.status).toBe('Applied');
        expect(ids(result?.add)).toEqual(['100']);
        expect(ids(result?.remove)).toEqual(['100']);
        expect(api.getRowNode('100')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(50);
    });

    test('a loaded row removed and re-added with the same ID in one transaction is removed', async () => {
        const api = await createGrid();
        const readded = { id: 5, price: 555 };

        const result = api.applyServerSideTransaction({
            remove: [{ id: 5, price: 5 }],
            add: [readded],
            addIndex: 2,
        });

        expect(result?.status).toBe('Applied');
        expect(result?.add).toEqual([]);
        expect(result?.unapplied).toEqual([readded]);
        expect(ids(result?.remove)).toEqual(['5']);
        expect(api.getRowNode('5')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('an async transaction uses the same order', async () => {
        const api = await createGrid();
        const readded = { id: 5, price: 555 };

        const result = await applyAsync(api, {
            remove: [{ id: 5, price: 5 }],
            add: [readded],
            addIndex: 2,
        });

        expect(result.status).toBe('Applied');
        expect(result.add).toEqual([]);
        expect(result.unapplied).toEqual([readded]);
        expect(ids(result.remove)).toEqual(['5']);
        expect(api.getRowNode('5')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);
    });
});
