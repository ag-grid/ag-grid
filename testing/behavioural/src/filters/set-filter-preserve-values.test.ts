import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi, ISetFilterParams, SetFilterHandler } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    value: string | null;
}

describe('Set Filter preservePreviousValues', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SetFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    let nextId = 0;
    const row = (value: string | null): Row => ({ id: String(nextId++), value });
    const rows = (...values: (string | null)[]): Row[] => values.map(row);

    function createGrid(
        rowData: Row[],
        filterParams: ISetFilterParams = {},
        colDef: Partial<ColDef<Row>> = {}
    ): GridApi<Row> {
        return gridsManager.createGrid<Row>('grid', {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: { preservePreviousValues: true, ...filterParams },
                    ...colDef,
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData,
        });
    }

    const handlerOf = (api: GridApi<Row>) => api.getColumnFilterHandler('value') as SetFilterHandler;
    const modelOf = (api: GridApi<Row>) => api.getColumnFilterModel<{ values: (string | null)[] }>('value');
    const shown = (api: GridApi<Row>) => {
        const values: (string | null)[] = [];
        api.forEachNodeAfterFilter((node) => values.push(node.data!.value));
        return values;
    };
    const setModel = async (api: GridApi<Row>, values: (string | null)[] | null) => {
        // Not awaited: the promise waits out cellDataType inference, which an empty grid never finishes.
        void api.setColumnFilterModel('value', values && { filterType: 'set', values });
        api.onFilterChanged();
        await asyncSetTimeout(0);
    };
    const setRowData = async (api: GridApi<Row>, rowData: Row[]) => {
        api.setGridOption('rowData', rowData);
        await asyncSetTimeout(0);
    };

    test('a checked value survives its rows leaving, and its rows pass again on return', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setModel(api, ['B']);
        expect(shown(api)).toEqual(['B']);

        await setRowData(api, rows('A', 'C'));
        expect(modelOf(api)).toEqual({ filterType: 'set', values: ['B'] });
        expect(shown(api)).toEqual([]);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'C']);
        // Kept with its value, not re-created from the model as a key alone.
        expect(handlerOf(api).getFilterValues()[handlerOf(api).getFilterKeys().indexOf('B')]).toBe('B');

        await setRowData(api, rows('A', 'B', 'C'));
        expect(modelOf(api)).toEqual({ filterType: 'set', values: ['B'] });
        expect(shown(api)).toEqual(['B']);
    });

    test('an unchecked value that leaves stays excluded when it returns, and the model is not nulled', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B']);

        await setRowData(api, rows('A', 'B'));
        expect(modelOf(api)).toEqual({ filterType: 'set', values: ['A', 'B'] });
        expect(shown(api)).toEqual(['A', 'B']);

        await setRowData(api, rows('A', 'B', 'C'));
        expect(shown(api)).toEqual(['A', 'B']);
    });

    /** A model set on an empty grid, then the value's rows added, removed and added back by transaction. */
    async function expectTransactionsKeepValue(api: GridApi<Row>): Promise<void> {
        const one = row('one');
        api.applyTransaction({ add: [one, row('two')] });
        await asyncSetTimeout(0);
        expect(shown(api)).toEqual(['one']);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['one', 'two']);
        expect(modelOf(api)?.values).toEqual(['one']);

        api.applyTransaction({ remove: [one] });
        await asyncSetTimeout(0);
        expect(shown(api)).toEqual([]);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['one', 'two']);
        expect(modelOf(api)?.values).toEqual(['one']);

        await setModel(api, ['one']);
        expect(shown(api)).toEqual([]);
        expect(modelOf(api)?.values).toEqual(['one']);

        api.applyTransaction({ add: [row('one')] });
        await asyncSetTimeout(0);
        expect(shown(api)).toEqual(['one']);
        expect(modelOf(api)?.values).toEqual(['one']);
    }

    test('transactions keep a value whose rows are all removed, with a declared data type', async () => {
        const api = createGrid([], {}, { cellDataType: 'text' });
        await asyncSetTimeout(0);
        await setModel(api, ['one']);
        expect(handlerOf(api).getFilterKeys()).toEqual(['one']);
        expect(modelOf(api)?.values).toEqual(['one']);
        await expectTransactionsKeepValue(api);
    });

    test('transactions keep a value whose rows are all removed, with an inferred data type', async () => {
        const api = createGrid([]);
        await asyncSetTimeout(0);
        await setModel(api, ['one']);
        // Inference holds the model back until data arrives, so nothing is listed yet.
        expect(handlerOf(api).getFilterKeys()).toEqual([]);
        await expectTransactionsKeepValue(api);
    });

    test('without the option, values leaving the data are still pruned from the model', async () => {
        const api = gridsManager.createGrid<Row>('grid', {
            columnDefs: [{ field: 'value', filter: 'agSetColumnFilter' }],
            getRowId: ({ data }) => data.id,
            rowData: rows('A', 'B', 'C'),
        });
        await asyncSetTimeout(0);
        await setModel(api, ['B']);

        await setRowData(api, rows('A', 'C'));
        expect(modelOf(api)).toEqual({ filterType: 'set', values: [] });
        expect(handlerOf(api).getFilterKeys()).toEqual(['A', 'C']);
    });

    test('a model naming every value is kept as set, so a new value arrives unchecked', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B', 'C']);
        expect(modelOf(api)?.values).toEqual(['A', 'B', 'C']);

        await setRowData(api, rows('A', 'B', 'C', 'D'));
        expect(shown(api)).toEqual(['A', 'B', 'C']);
    });

    test('a new value is excluded by an active model and passes with no model', async () => {
        const api = createGrid(rows('A', 'B'));
        await asyncSetTimeout(0);
        await setModel(api, ['A']);
        await setRowData(api, rows('A', 'B', 'D'));
        expect(shown(api)).toEqual(['A']);

        await setModel(api, null);
        await setRowData(api, rows('A', 'B', 'D', 'E'));
        expect(shown(api)).toEqual(['A', 'B', 'D', 'E']);
        expect(modelOf(api)).toBeNull();
    });

    test('a value re-added in another case keeps one entry under its first key', async () => {
        const api = createGrid(rows('apple', 'pear'));
        await asyncSetTimeout(0);
        await setModel(api, ['apple']);

        await setRowData(api, rows('pear'));
        await setRowData(api, rows('APPLE', 'pear'));
        const handler = handlerOf(api);
        expect(handler.getFilterKeys().sort()).toEqual(['apple', 'pear']);
        // The key stays; the value is the current one.
        expect(handler.getFilterValues()[handler.getFilterKeys().indexOf('apple')]).toBe('APPLE');
        expect(modelOf(api)?.values).toEqual(['apple']);
        expect(shown(api)).toEqual(['APPLE']);
    });

    test('model values never seen in the data are kept, and are never handed to user callbacks', async () => {
        const valueFormatter = vi.fn(({ value }) => `<${value}>`);
        const comparator = vi.fn((a: string | null, b: string | null) => (a ?? '').localeCompare(b ?? ''));
        const api = createGrid(rows('A', 'B'), { valueFormatter, comparator }, { floatingFilter: true });
        await asyncSetTimeout(0);

        await setModel(api, ['A', 'X']);
        expect(modelOf(api)?.values).toEqual(['A', 'X']);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'X']);
        expect(handlerOf(api).getFilterValues()[handlerOf(api).getFilterKeys().indexOf('X')]).toBeNull();

        await setRowData(api, rows('A', 'B', 'C'));
        expect(modelOf(api)?.values).toEqual(['A', 'X']);
        expect(shown(api)).toEqual(['A']);

        const handed = new Set<string | null>();
        for (const [params] of valueFormatter.mock.calls) {
            handed.add(params.value);
        }
        for (const [a, b] of comparator.mock.calls) {
            handed.add(a).add(b);
        }
        expect(valueFormatter).toHaveBeenCalled();
        expect(comparator).toHaveBeenCalled();
        expect([...handed].sort()).toEqual(['A', 'B', 'C']);

        await setRowData(api, rows('A', 'X'));
        expect(shown(api)).toEqual(['A', 'X']);
        expect(handlerOf(api).getFilterValues()[handlerOf(api).getFilterKeys().indexOf('X')]).toBe('X');
    });

    test('provided values: a value dropped from the list is kept, and its state preserved', async () => {
        const api = createGrid(rows('A', 'B', 'C'), { values: ['A', 'B', 'C'] });
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'C']);

        handlerOf(api).setFilterValues(['A', 'B']);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'C']);
        expect(modelOf(api)?.values).toEqual(['A', 'C']);
        expect(shown(api)).toEqual(['A', 'C']);
    });

    test('provided values from a callback keep a value the callback stops returning', async () => {
        let source = ['A', 'B', 'C'];
        const values = vi.fn((params) => params.success(source));
        const api = createGrid(rows('A', 'B', 'C'), { values });
        await vi.waitFor(() => expect(handlerOf(api).getFilterKeys()).toEqual(['A', 'B', 'C']));
        await setModel(api, ['B']);

        source = ['A', 'C'];
        handlerOf(api).refreshFilterValues();
        await vi.waitFor(() => expect(values).toHaveBeenCalledTimes(2));
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'C']);
        expect(modelOf(api)?.values).toEqual(['B']);
        expect(shown(api)).toEqual(['B']);
    });

    test('excel mode keeps a checked value whose rows all leave', async () => {
        const api = createGrid(rows('A', 'B'), { excelMode: 'windows' });
        await asyncSetTimeout(0);
        await setModel(api, ['B']);

        await setRowData(api, rows('A'));
        expect(modelOf(api)?.values).toEqual(['B']);

        await setRowData(api, rows('A', 'B'));
        expect(shown(api)).toEqual(['B']);
    });

    test('clearPreservedValues drops retained values and reconciles the model as without the option', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B']);
        await setRowData(api, rows('A', 'C'));
        expect(modelOf(api)?.values).toEqual(['A', 'B']);

        const filterChanged = vi.fn();
        api.addEventListener('filterChanged', filterChanged);
        handlerOf(api).clearPreservedValues();
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'C']);
        expect(modelOf(api)?.values).toEqual(['A']);
        expect(filterChanged).toHaveBeenCalledTimes(1);

        filterChanged.mockClear();
        handlerOf(api).clearPreservedValues();
        await asyncSetTimeout(0);
        expect(filterChanged).not.toHaveBeenCalled();

        // A model value never seen in the data is discarded too, and a fully checked remainder nulls the model.
        await setModel(api, ['A', 'C', 'X']);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'C', 'X']);
        handlerOf(api).clearPreservedValues();
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'C']);
        expect(modelOf(api)).toBeNull();

        // With nothing retained, a model naming every value is still reconciled.
        await setModel(api, ['A', 'C']);
        expect(modelOf(api)?.values).toEqual(['A', 'C']);
        handlerOf(api).clearPreservedValues();
        await asyncSetTimeout(0);
        expect(modelOf(api)).toBeNull();
    });

    test('clearPreservedValues(true) discards only unselected retained values, leaving the model as set', async () => {
        const api = createGrid(rows('A', 'B', 'C', 'X'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B', 'Y']);
        await setRowData(api, rows('A'));
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'C', 'X', 'Y']);

        const filterChanged = vi.fn();
        api.addEventListener('filterChanged', filterChanged);
        handlerOf(api).clearPreservedValues(true);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'B', 'Y']);
        expect(modelOf(api)?.values).toEqual(['A', 'B', 'Y']);
        expect(filterChanged).not.toHaveBeenCalled();

        handlerOf(api).clearPreservedValues();
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys()).toEqual(['A']);
        expect(modelOf(api)).toBeNull();
    });

    test('turning the option off at runtime behaves like clearPreservedValues', async () => {
        const api = createGrid(rows('A', 'B', 'C'));
        await asyncSetTimeout(0);
        await setModel(api, ['A', 'B']);
        await setRowData(api, rows('A', 'C'));

        api.setGridOption('columnDefs', [
            { field: 'value', filter: 'agSetColumnFilter', filterParams: { preservePreviousValues: false } },
        ]);
        await asyncSetTimeout(0);
        expect(handlerOf(api).getFilterKeys().sort()).toEqual(['A', 'C']);
        expect(modelOf(api)?.values).toEqual(['A']);
    });

    describe('preservePreviousValuesLimit', () => {
        const churn = async (api: GridApi<Row>, ...values: string[]) => {
            for (const value of values) {
                await setRowData(api, rows('K', value));
            }
        };

        test('evicts the oldest unchecked retained value first, never a checked one', async () => {
            const api = createGrid(rows('K', 'C1'), { preservePreviousValuesLimit: 2 });
            await asyncSetTimeout(0);
            await setModel(api, ['K', 'C1']);

            await churn(api, 'u1', 'u2', 'u3', 'u4');
            expect(handlerOf(api).getFilterKeys().sort()).toEqual(['C1', 'K', 'u2', 'u3', 'u4']);
            expect(modelOf(api)?.values).toEqual(['K', 'C1']);
            expect(shown(api)).toEqual(['K']);

            await setRowData(api, rows('K', 'C1', 'u1'));
            expect(shown(api)).toEqual(['K', 'C1']);
        });

        test('a value that returns and leaves again becomes the newest', async () => {
            const api = createGrid(rows('K', 'u1'), { preservePreviousValuesLimit: 1 });
            await asyncSetTimeout(0);
            await setModel(api, ['K']);

            await churn(api, 'u2', 'u1', 'u3');
            expect(handlerOf(api).getFilterKeys().sort()).toEqual(['K', 'u1', 'u3']);
        });

        test('with no model every retained value is evictable, so an inactive filter is bounded too', async () => {
            const api = createGrid(rows('K', 'u1'), { preservePreviousValuesLimit: 1 });
            await asyncSetTimeout(0);

            await churn(api, 'u2', 'u3', 'u4');
            expect(handlerOf(api).getFilterKeys().sort()).toEqual(['K', 'u3', 'u4']);
        });

        test('a limit of zero keeps only selected values', async () => {
            const api = createGrid(rows('K', 'u1', 'C1'), { preservePreviousValuesLimit: 0 });
            await asyncSetTimeout(0);
            await setModel(api, ['K', 'C1']);

            await setRowData(api, rows('K'));
            expect(handlerOf(api).getFilterKeys().sort()).toEqual(['C1', 'K']);
        });

        test('defaults to 100 unchecked retained values, and a new limit applies from the next reload', async () => {
            const api = createGrid(rows('K'));
            await asyncSetTimeout(0);
            await setModel(api, ['K']);
            const churnMany = async (prefix: string) => {
                await setRowData(api, rows('K', ...Array.from({ length: 105 }, (_, i) => `${prefix}${i}`)));
                await setRowData(api, rows('K'));
            };

            await churnMany('u');
            expect(handlerOf(api).getFilterKeys()).toHaveLength(101);

            api.setGridOption('columnDefs', [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: { preservePreviousValues: true, preservePreviousValuesLimit: -1 },
                },
            ]);
            await asyncSetTimeout(0);
            await churnMany('v');
            expect(handlerOf(api).getFilterKeys()).toHaveLength(206);
        });
    });
});
