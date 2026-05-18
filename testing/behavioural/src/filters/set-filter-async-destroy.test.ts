import type { GridApi, GridOptions, ISetFilterParams, SetFilterValuesFuncParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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

    test('destroy before PROVIDED_CALLBACK success() fires does not throw', async () => {
        const { api, fireSuccess } = createGridWithAsyncValues();

        // Trigger validateModel by applying a filter model before values have loaded
        await api.setColumnFilterModel('category', { filterType: 'set', values: ['A'] });

        api.destroy();

        // Simulate the delayed async values callback resolving after destroy
        expect(() => fireSuccess()).not.toThrow();
        await asyncSetTimeout(0);
    });

    test('filter model is not applied after destroy when success() fires late', async () => {
        const { api, fireSuccess } = createGridWithAsyncValues();

        let filterChangedCount = 0;
        api.addEventListener('filterChanged', () => filterChangedCount++);

        await api.setColumnFilterModel('category', { filterType: 'set', values: ['A'] });

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

        // Applying a filter on the name column fires filterChanged → onAnyFilterChanged on the
        // category set filter, which calls refreshAvailable() and chains off the still-pending
        // allKeys promise
        await api.setColumnFilterModel('name', { filterType: 'set', values: ['Item 1'] });
        api.onFilterChanged();
        await asyncSetTimeout(0); // let the setTimeout inside onAnyFilterChanged fire

        api.destroy();

        expect(() => capturedSuccess?.(['A', 'B', 'C'])).not.toThrow();
        await asyncSetTimeout(0);
    });
});
