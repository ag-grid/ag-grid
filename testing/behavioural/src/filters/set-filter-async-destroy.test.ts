import type { GridApi, GridOptions, ISetFilterParams, SetFilterValuesFuncParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import type { SetFilter } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Row {
    name: string;
    category: string;
}

const ROW_DATA: Row[] = [
    { name: 'Item 1', category: 'A' },
    { name: 'Item 2', category: 'B' },
    { name: 'Item 3', category: 'C' },
];

describe('Set Filter async destroy safety', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SetFilterModule],
    });

    afterEach(() => gridsManager.reset());

    /**
     * Creates a grid whose category column uses a PROVIDED_CALLBACK async values function.
     * Returns the api and a `fireSuccess` function to control when params.success() fires.
     */
    function createGridWithAsyncValues(overrides?: Partial<GridOptions<Row>>): {
        api: GridApi<Row>;
        fireSuccess: (values?: string[]) => void;
    } {
        let capturedSuccess: ((values: string[]) => void) | undefined;

        const api = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'name' },
                {
                    field: 'category',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: SetFilterValuesFuncParams) => {
                            capturedSuccess = params.success;
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
            ...overrides,
        });

        return {
            api,
            fireSuccess: (values = ['A', 'B', 'C']) => capturedSuccess?.(values),
        };
    }

    test('success() called after destroy does not resolve allKeys', async () => {
        let capturedSuccess: ((values: string[]) => void) | undefined;

        const api = gridsManager.createGrid('grid2', {
            columnDefs: [
                { field: 'name' },
                {
                    field: 'category',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: SetFilterValuesFuncParams) => {
                            capturedSuccess = params.success;
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });
        await new GridColumns(api, `success() called after destroy does not resolve allKeys setup`).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── category "Category" width:200
        `);
        await new GridRows(api, `success() called after destroy does not resolve allKeys setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Item 1" category:"A"
            ├── LEAF id:1 name:"Item 2" category:"B"
            └── LEAF id:2 name:"Item 3" category:"C"
        `);

        // getColumnFilterInstance creates the filter and queues the values callback setTimeout
        // without blocking on allKeys resolution
        const setFilter = (await api.getColumnFilterInstance('category')) as SetFilter<string>;
        const valueModel = setFilter.handler.valueModel;

        // Flush the macrotask that fires the values callback so capturedSuccess is populated
        await asyncSetTimeout(0);

        api.destroy();

        capturedSuccess?.(['A', 'B', 'C']);
        await asyncSetTimeout(0);

        // isInitialised() is set inside allKeys.then() — if the guard blocked resolution it stays false
        expect(valueModel.isInitialised()).toBe(false);
    });

    test('destroy before PROVIDED_CALLBACK success() fires does not throw', async () => {
        const { api, fireSuccess } = createGridWithAsyncValues();

        // updateAllValues() invokes the values callback via window.setTimeout, so we must flush
        // the macrotask queue before capturedSuccess is populated and ready to be called.
        await asyncSetTimeout(0);

        // Trigger validateModel — don't await, it chains off the still-pending allKeys promise
        void api.setColumnFilterModel('category', { filterType: 'set', values: ['A'] });

        api.destroy();

        // success() fires after destroy — the isAlive guard should prevent allKeys from resolving
        expect(() => fireSuccess()).not.toThrow();
        await asyncSetTimeout(0);
    });

    test('filter model is not applied after destroy when success() fires late', async () => {
        const { api, fireSuccess } = createGridWithAsyncValues();

        let filterChangedCount = 0;
        api.addEventListener('filterChanged', () => filterChangedCount++);

        // Flush the macrotask that fires the values callback so capturedSuccess is populated
        await asyncSetTimeout(0);

        void api.setColumnFilterModel('category', { filterType: 'set', values: ['A'] });

        api.destroy();
        fireSuccess();
        await asyncSetTimeout(0);

        expect(filterChangedCount).toBe(0);
    });

    test('destroy during onAnyFilterChanged (another column filter change while values loading) does not throw', async () => {
        let capturedSuccess: ((values: string[]) => void) | undefined;

        const api = gridsManager.createGrid('grid2', {
            columnDefs: [
                {
                    // name column uses a synchronous provided list — applying a filter on it
                    // dispatches filterChanged, which triggers onAnyFilterChanged on the category
                    // set filter whose allKeys promise is still pending
                    field: 'name',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: ['Item 1', 'Item 2', 'Item 3'],
                    } as ISetFilterParams,
                },
                {
                    field: 'category',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        values: (params: SetFilterValuesFuncParams) => {
                            capturedSuccess = params.success;
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });
        await new GridColumns(
            api,
            `destroy during onAnyFilterChanged (another column filter change while values loa setup`
        ).checkColumns(`
            CENTER
            ├── name "Name" width:200
            └── category "Category" width:200
        `);
        await new GridRows(
            api,
            `destroy during onAnyFilterChanged (another column filter change while values loa setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Item 1" category:"A"
            ├── LEAF id:1 name:"Item 2" category:"B"
            └── LEAF id:2 name:"Item 3" category:"C"
        `);

        // Flush the macrotask that fires the category values callback so capturedSuccess is populated
        await asyncSetTimeout(0);

        // Apply a name filter — fires filterChanged → onAnyFilterChanged on the category set filter,
        // which calls refreshAvailable() and chains off the still-pending allKeys promise
        await api.setColumnFilterModel('name', { filterType: 'set', values: ['Item 1'] });
        api.onFilterChanged();
        await asyncSetTimeout(0); // let the window.setTimeout inside onAnyFilterChanged fire

        api.destroy();

        expect(() => capturedSuccess?.(['A', 'B', 'C'])).not.toThrow();
    });
});
