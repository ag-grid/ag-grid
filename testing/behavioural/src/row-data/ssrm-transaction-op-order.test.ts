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

type Op = 'update' | 'add' | 'remove';
type Mode = 'sync' | 'async';

interface ExpectedResult {
    update: string[];
    add: string[];
    unapplied: Row[];
    remove: string[];
}

const ROW_COUNT = 50;
const ADD_INDEX = 2;
const MODES: Mode[] = ['sync', 'async'];

/** The IDs of the loaded rows, `1` to `50`. */
const BASE_ORDER = Array.from({ length: ROW_COUNT }, (_, i) => String(i + 1));

/** The loaded row IDs, without the `removed` IDs, then with the `inserted` IDs at `ADD_INDEX`. */
function rowOrder({ removed = [], inserted = [] }: { removed?: string[]; inserted?: string[] } = {}): string[] {
    const order = BASE_ORDER.filter((id) => !removed.includes(id));
    order.splice(ADD_INDEX, 0, ...inserted);
    return order;
}

function result(expected: Partial<ExpectedResult>): ExpectedResult {
    return { update: [], add: [], unapplied: [], remove: [], ...expected };
}

/** Row 5, loaded before the transaction. */
const LOADED = {
    original: { id: 5, price: 5 },
    update: { id: 5, price: 50 },
    add: { id: 5, price: 500 },
    remove: { id: 5, price: 5 },
};

/** Row 100, not in the grid before the transaction. */
const NEW = {
    update: { id: 100, price: 1000 },
    add: { id: 100, price: 100 },
    remove: { id: 100, price: 100 },
};

/**
 * The SSRM applies a transaction's `update`, then its `add`, then its `remove`.
 * Applications rely on this order, so changing it is a breaking change (AG-19445).
 *
 * Each operation only sees the rows the previous ones left behind:
 * - `update` changes rows already in the grid, and ignores any other ID.
 * - `add` inserts rows at `addIndex`, and returns an ID already in the grid in `unapplied`.
 * - `remove` removes rows in the grid, and ignores any other ID.
 *
 * Async transactions in one flush apply one after another, each in that same order.
 */
describe('SSRM transaction operation order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(): Promise<GridApi<Row>> {
        const allRows: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i + 1, price: i + 1 }));
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

    /** Applies the transactions async in one flush, returning their results in order. */
    async function applyAsync(
        api: GridApi<Row>,
        transactions: ServerSideTransaction[]
    ): Promise<ServerSideTransactionResult[]> {
        const flushed = new Promise<AsyncTransactionsFlushedEvent>((resolve) => {
            api.addEventListener('asyncTransactionsFlushed', resolve);
        });
        for (const transaction of transactions) {
            api.applyServerSideTransactionAsync(transaction);
        }
        api.flushServerSideAsyncTransactions();
        const event = await flushed;
        return event.results as ServerSideTransactionResult[];
    }

    async function apply(
        api: GridApi<Row>,
        mode: Mode,
        transaction: ServerSideTransaction
    ): Promise<ServerSideTransactionResult | undefined> {
        if (mode === 'sync') {
            return api.applyServerSideTransaction(transaction);
        }
        const [asyncResult] = await applyAsync(api, [transaction]);
        return asyncResult;
    }

    const ids = (nodes: { id?: string }[] | undefined) => (nodes ?? []).map((node) => node.id);

    function expectResult(actual: ServerSideTransactionResult | undefined, expected: ExpectedResult) {
        expect(actual?.status).toBe('Applied');
        expect({
            update: ids(actual?.update),
            add: ids(actual?.add),
            unapplied: actual?.unapplied ?? [],
            remove: ids(actual?.remove),
        }).toEqual(expected);
    }

    function displayedIds(api: GridApi<Row>): (string | undefined)[] {
        return Array.from({ length: api.getDisplayedRowCount() }, (_, i) => api.getDisplayedRowAtIndex(i)?.id);
    }

    function transactionOf(rows: Partial<Record<Op, Row>>): ServerSideTransaction {
        return {
            ...(rows.update && { update: [rows.update] }),
            ...(rows.add && { add: [rows.add], addIndex: ADD_INDEX }),
            ...(rows.remove && { remove: [rows.remove] }),
        };
    }

    describe.each(MODES)('one %s transaction', (mode) => {
        interface Case {
            ops: Op[];
            result: ExpectedResult;
            data: Row | undefined;
            order: string[];
        }

        describe('with every operation on a loaded row', () => {
            const cases: Case[] = [
                {
                    ops: ['update'],
                    result: result({ update: ['5'] }),
                    data: LOADED.update,
                    order: rowOrder(),
                },
                {
                    ops: ['add'],
                    result: result({ unapplied: [LOADED.add] }),
                    data: LOADED.original,
                    order: rowOrder(),
                },
                {
                    ops: ['remove'],
                    result: result({ remove: ['5'] }),
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
                {
                    ops: ['update', 'add'],
                    result: result({ update: ['5'], unapplied: [LOADED.add] }),
                    data: LOADED.update,
                    order: rowOrder(),
                },
                {
                    ops: ['update', 'remove'],
                    result: result({ update: ['5'], remove: ['5'] }),
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
                {
                    ops: ['add', 'remove'],
                    result: result({ unapplied: [LOADED.add], remove: ['5'] }),
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
                {
                    ops: ['update', 'add', 'remove'],
                    result: result({ update: ['5'], unapplied: [LOADED.add], remove: ['5'] }),
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
            ];

            test.each(named(cases))('$name', async ({ ops, result: expected, data, order }) => {
                const api = await createGrid();

                const actual = await apply(api, mode, transactionOf(pick(LOADED, ops)));

                expectResult(actual, expected);
                expect(api.getRowNode('5')?.data).toEqual(data);
                expect(displayedIds(api)).toEqual(order);
            });
        });

        describe('with every operation on a new row', () => {
            const cases: Case[] = [
                {
                    ops: ['update'],
                    result: result({}),
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    ops: ['add'],
                    result: result({ add: ['100'] }),
                    data: NEW.add,
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    ops: ['remove'],
                    result: result({}),
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    ops: ['update', 'add'],
                    result: result({ add: ['100'] }),
                    data: NEW.add,
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    ops: ['update', 'remove'],
                    result: result({}),
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    ops: ['add', 'remove'],
                    result: result({ add: ['100'], remove: ['100'] }),
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    ops: ['update', 'add', 'remove'],
                    result: result({ add: ['100'], remove: ['100'] }),
                    data: undefined,
                    order: rowOrder(),
                },
            ];

            test.each(named(cases))('$name', async ({ ops, result: expected, data, order }) => {
                const api = await createGrid();

                const actual = await apply(api, mode, transactionOf(pick(NEW, ops)));

                expectResult(actual, expected);
                expect(api.getRowNode('100')?.data).toEqual(data);
                expect(displayedIds(api)).toEqual(order);
            });
        });

        describe('with every operation on a different row', () => {
            // Row 1 sits before `addIndex`, so removing it after the add moves the new row up to index 1.
            const rows = {
                update: { id: 3, price: 30 },
                add: { id: 100, price: 100 },
                remove: { id: 1, price: 1 },
            };
            const cases: Omit<Case, 'data'>[] = [
                {
                    ops: ['update'],
                    result: result({ update: ['3'] }),
                    order: rowOrder(),
                },
                {
                    ops: ['add'],
                    result: result({ add: ['100'] }),
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    ops: ['remove'],
                    result: result({ remove: ['1'] }),
                    order: rowOrder({ removed: ['1'] }),
                },
                {
                    ops: ['update', 'add'],
                    result: result({ update: ['3'], add: ['100'] }),
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    ops: ['update', 'remove'],
                    result: result({ update: ['3'], remove: ['1'] }),
                    order: rowOrder({ removed: ['1'] }),
                },
                {
                    ops: ['add', 'remove'],
                    result: result({ add: ['100'], remove: ['1'] }),
                    order: ['2', '100', ...BASE_ORDER.slice(2)],
                },
                {
                    ops: ['update', 'add', 'remove'],
                    result: result({ update: ['3'], add: ['100'], remove: ['1'] }),
                    order: ['2', '100', ...BASE_ORDER.slice(2)],
                },
            ];

            test.each(named(cases))('$name', async ({ ops, result: expected, order }) => {
                const api = await createGrid();

                const actual = await apply(api, mode, transactionOf(pick(rows, ops)));

                expectResult(actual, expected);
                expect(api.getRowNode('3')?.data).toEqual(ops.includes('update') ? rows.update : { id: 3, price: 3 });
                expect(api.getRowNode('100')?.data).toEqual(ops.includes('add') ? rows.add : undefined);
                expect(api.getRowNode('1')?.data).toEqual(ops.includes('remove') ? undefined : { id: 1, price: 1 });
                expect(displayedIds(api)).toEqual(order);
            });
        });

        describe('with an ID repeated within one operation', () => {
            test('update applies each row in turn, so the last one wins', async () => {
                const api = await createGrid();
                const last = { id: 5, price: 52 };

                const actual = await apply(api, mode, { update: [{ id: 5, price: 51 }, last] });

                expectResult(actual, result({ update: ['5', '5'] }));
                expect(api.getRowNode('5')?.data).toEqual(last);
                expect(displayedIds(api)).toEqual(rowOrder());
            });

            test('add inserts the last row, and returns the earlier one in unapplied', async () => {
                const api = await createGrid();
                const first = { id: 100, price: 101 };
                const last = { id: 100, price: 102 };

                const actual = await apply(api, mode, { add: [first, last], addIndex: ADD_INDEX });

                expectResult(actual, result({ add: ['100'], unapplied: [first] }));
                expect(api.getRowNode('100')?.data).toEqual(last);
                expect(displayedIds(api)).toEqual(rowOrder({ inserted: ['100'] }));
            });

            test('remove removes the row once', async () => {
                const api = await createGrid();

                const actual = await apply(api, mode, { remove: [LOADED.remove, LOADED.remove] });

                expectResult(actual, result({ remove: ['5'] }));
                expect(displayedIds(api)).toEqual(rowOrder({ removed: ['5'] }));
            });
        });
    });

    describe('two async transactions in one flush, each with one operation on the same row', () => {
        interface PairCase {
            first: Op;
            second: Op;
            results: [ExpectedResult, ExpectedResult];
            data: Row | undefined;
            order: string[];
        }

        describe('on a loaded row', () => {
            const cases: PairCase[] = [
                {
                    first: 'update',
                    second: 'update',
                    results: [result({ update: ['5'] }), result({ update: ['5'] })],
                    data: LOADED.update,
                    order: rowOrder(),
                },
                {
                    first: 'update',
                    second: 'add',
                    results: [result({ update: ['5'] }), result({ unapplied: [LOADED.add] })],
                    data: LOADED.update,
                    order: rowOrder(),
                },
                {
                    first: 'update',
                    second: 'remove',
                    results: [result({ update: ['5'] }), result({ remove: ['5'] })],
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
                {
                    first: 'add',
                    second: 'update',
                    results: [result({ unapplied: [LOADED.add] }), result({ update: ['5'] })],
                    data: LOADED.update,
                    order: rowOrder(),
                },
                {
                    first: 'add',
                    second: 'add',
                    results: [result({ unapplied: [LOADED.add] }), result({ unapplied: [LOADED.add] })],
                    data: LOADED.original,
                    order: rowOrder(),
                },
                {
                    first: 'add',
                    second: 'remove',
                    results: [result({ unapplied: [LOADED.add] }), result({ remove: ['5'] })],
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
                {
                    first: 'remove',
                    second: 'update',
                    results: [result({ remove: ['5'] }), result({})],
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
                {
                    first: 'remove',
                    second: 'add',
                    results: [result({ remove: ['5'] }), result({ add: ['5'] })],
                    data: LOADED.add,
                    order: rowOrder({ removed: ['5'], inserted: ['5'] }),
                },
                {
                    first: 'remove',
                    second: 'remove',
                    results: [result({ remove: ['5'] }), result({})],
                    data: undefined,
                    order: rowOrder({ removed: ['5'] }),
                },
            ];

            test.each(cases)('$first, then $second', async ({ first, second, results, data, order }) => {
                const api = await createGrid();

                const actual = await applyAsync(api, [
                    transactionOf({ [first]: LOADED[first] }),
                    transactionOf({ [second]: LOADED[second] }),
                ]);

                expect(actual).toHaveLength(2);
                expectResult(actual[0], results[0]);
                expectResult(actual[1], results[1]);
                expect(api.getRowNode('5')?.data).toEqual(data);
                expect(displayedIds(api)).toEqual(order);
            });
        });

        describe('on a new row', () => {
            const cases: PairCase[] = [
                {
                    first: 'update',
                    second: 'update',
                    results: [result({}), result({})],
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    first: 'update',
                    second: 'add',
                    results: [result({}), result({ add: ['100'] })],
                    data: NEW.add,
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    first: 'update',
                    second: 'remove',
                    results: [result({}), result({})],
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    first: 'add',
                    second: 'update',
                    results: [result({ add: ['100'] }), result({ update: ['100'] })],
                    data: NEW.update,
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    first: 'add',
                    second: 'add',
                    results: [result({ add: ['100'] }), result({ unapplied: [NEW.add] })],
                    data: NEW.add,
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    first: 'add',
                    second: 'remove',
                    results: [result({ add: ['100'] }), result({ remove: ['100'] })],
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    first: 'remove',
                    second: 'update',
                    results: [result({}), result({})],
                    data: undefined,
                    order: rowOrder(),
                },
                {
                    first: 'remove',
                    second: 'add',
                    results: [result({}), result({ add: ['100'] })],
                    data: NEW.add,
                    order: rowOrder({ inserted: ['100'] }),
                },
                {
                    first: 'remove',
                    second: 'remove',
                    results: [result({}), result({})],
                    data: undefined,
                    order: rowOrder(),
                },
            ];

            test.each(cases)('$first, then $second', async ({ first, second, results, data, order }) => {
                const api = await createGrid();

                const actual = await applyAsync(api, [
                    transactionOf({ [first]: NEW[first] }),
                    transactionOf({ [second]: NEW[second] }),
                ]);

                expect(actual).toHaveLength(2);
                expectResult(actual[0], results[0]);
                expectResult(actual[1], results[1]);
                expect(api.getRowNode('100')?.data).toEqual(data);
                expect(displayedIds(api)).toEqual(order);
            });
        });
    });
});

function pick(rows: Record<Op, Row>, ops: Op[]): Partial<Record<Op, Row>> {
    return Object.fromEntries(ops.map((op) => [op, rows[op]]));
}

/** Names each case after its operations, in the order the grid applies them, e.g. `update, add, remove`. */
function named<T extends { ops: Op[] }>(cases: T[]): (T & { name: string })[] {
    return cases.map((testCase) => ({ ...testCase, name: testCase.ops.join(', ') }));
}
