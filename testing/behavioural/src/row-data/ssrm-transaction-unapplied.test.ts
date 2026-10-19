import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type {
    AsyncTransactionsFlushedEvent,
    GridApi,
    GridOptions,
    ServerSideTransaction,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM transaction result unapplied adds', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const allRows = Array.from({ length: 200 }, (_, i) => ({ id: i, value: `Row ${i}` }));

    /** More rows than one block, so an omitted `rowCount` leaves the store's row count unknown. */
    async function createGrid(rowCountKnown: boolean): Promise<GridApi> {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const rowData = allRows.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData, rowCount: rowCountKnown ? allRows.length : undefined });
                },
            },
        };
        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        return api;
    }

    async function applyAsync(
        api: GridApi,
        transaction: ServerSideTransaction
    ): Promise<{ callbackResult?: ServerSideTransactionResult; eventResults: ServerSideTransactionResult[] }> {
        let callbackResult: ServerSideTransactionResult | undefined;
        const flushed = new Promise<AsyncTransactionsFlushedEvent>((resolve) => {
            api.addEventListener('asyncTransactionsFlushed', resolve);
        });
        api.applyServerSideTransactionAsync(transaction, (result) => (callbackResult = result));
        api.flushServerSideAsyncTransactions();
        const event = await flushed;
        return { callbackResult, eventResults: event.results as ServerSideTransactionResult[] };
    }

    describe('sync', () => {
        test('a normal add has no unapplied rows', async () => {
            const api = await createGrid(true);

            const result = api.applyServerSideTransaction({ add: [{ id: 1000, value: 'Added' }] });

            expect(result?.status).toBe('Applied');
            expect(result?.add?.map((node) => node.id)).toEqual(['1000']);
            expect(result?.unapplied).toBeUndefined();
        });

        test('an add without addIndex while the row count is unknown is reported as unapplied', async () => {
            const api = await createGrid(false);
            const added = { id: 1000, value: 'Added' };

            const result = api.applyServerSideTransaction({ add: [added] });

            expect(result?.status).toBe('Applied');
            expect(result?.add).toEqual([]);
            expect(result?.unapplied).toEqual([added]);
            expect(api.getRowNode('1000')).toBeUndefined();
        });

        test('an add with addIndex 0 while the row count is unknown has no unapplied rows', async () => {
            const api = await createGrid(false);

            const result = api.applyServerSideTransaction({ add: [{ id: 1000, value: 'Added' }], addIndex: 0 });

            expect(result?.status).toBe('Applied');
            expect(result?.add?.map((node) => node.id)).toEqual(['1000']);
            expect(result?.unapplied).toBeUndefined();
            expect(api.getDisplayedRowAtIndex(0)?.id).toBe('1000');
        });

        test('an add whose ID is already loaded is reported as unapplied', async () => {
            const api = await createGrid(true);
            const duplicate = { id: 5, value: 'Duplicate' };
            const added = { id: 1000, value: 'Added' };

            const result = api.applyServerSideTransaction({ add: [duplicate, added] });

            expect(result?.status).toBe('Applied');
            expect(result?.add?.map((node) => node.id)).toEqual(['1000']);
            expect(result?.unapplied).toEqual([duplicate]);
            expect(api.getRowNode('5')?.data.value).toBe('Row 5');
        });

        test('an earlier add sharing its ID with a later add is reported as unapplied', async () => {
            const api = await createGrid(true);
            const first = { id: 1000, value: 'First' };
            const second = { id: 1000, value: 'Second' };

            const result = api.applyServerSideTransaction({ add: [first, second] });

            expect(result?.status).toBe('Applied');
            expect(result?.add?.map((node) => node.id)).toEqual(['1000']);
            expect(result?.unapplied).toEqual([first]);
            expect(api.getRowNode('1000')?.data.value).toBe('Second');
        });

        test('a grand total add is not reported as unapplied when the insert position is known', async () => {
            const api = await createGrid(true);

            const result = api.applyServerSideTransaction({ add: [{ id: GRAND_TOTAL_ROW_ID, value: 'Total' }] });

            expect(result?.status).toBe('Applied');
            expect(result?.unapplied).toBeUndefined();
        });

        test('a grand total add is reported as unapplied when the row count is unknown', async () => {
            const api = await createGrid(false);
            const grandTotal = { id: GRAND_TOTAL_ROW_ID, value: 'Total' };

            const result = api.applyServerSideTransaction({ add: [grandTotal] });

            expect(result?.status).toBe('Applied');
            expect(result?.unapplied).toEqual([grandTotal]);
        });
    });

    describe('async', () => {
        test('a normal add has no unapplied rows', async () => {
            const api = await createGrid(true);

            const { callbackResult, eventResults } = await applyAsync(api, { add: [{ id: 1000, value: 'Added' }] });

            expect(callbackResult?.status).toBe('Applied');
            expect(callbackResult?.unapplied).toBeUndefined();
            expect(eventResults).toHaveLength(1);
            expect(eventResults[0].unapplied).toBeUndefined();
        });

        test('an add without addIndex while the row count is unknown is reported as unapplied', async () => {
            const api = await createGrid(false);
            const added = { id: 1000, value: 'Added' };

            const { callbackResult, eventResults } = await applyAsync(api, { add: [added] });

            expect(callbackResult?.status).toBe('Applied');
            expect(callbackResult?.unapplied).toEqual([added]);
            expect(eventResults).toHaveLength(1);
            expect(eventResults[0].unapplied).toEqual([added]);
        });

        test('an add whose ID is already loaded is reported as unapplied', async () => {
            const api = await createGrid(true);
            const duplicate = { id: 5, value: 'Duplicate' };

            const { callbackResult, eventResults } = await applyAsync(api, { add: [duplicate] });

            expect(callbackResult?.status).toBe('Applied');
            expect(callbackResult?.unapplied).toEqual([duplicate]);
            expect(eventResults).toHaveLength(1);
            expect(eventResults[0].unapplied).toEqual([duplicate]);
        });
    });
});
