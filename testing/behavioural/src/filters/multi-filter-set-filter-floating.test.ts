import type { GridApi, IMultiFilterModel } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';
import type { MultiFilterHandler, SetFilterHandler } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

const ROW_DATA = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Michael Johnson', country: 'United States' },
    { athlete: 'Usain Bolt', country: 'Jamaica' },
    { athlete: 'Mo Farah', country: 'Great Britain' },
    { athlete: 'Allyson Felix', country: 'United States' },
];

describe('AG-17007: Multi Filter with Set Filter and floating filter (enableFilterHandlers)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, SetFilterModule, MultiFilterModule],
    });

    afterEach(() => gridsManager.reset());

    async function createGrid(): Promise<GridApi> {
        return gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }],
                    },
                },
                { field: 'country' },
            ],
            defaultColDef: {
                floatingFilter: true,
            },
            rowData: ROW_DATA,
        });
    }

    function getMultiFilterHandler(api: GridApi): MultiFilterHandler {
        return api.getColumnFilterHandler('athlete') as MultiFilterHandler;
    }

    function getSetFilterHandler(api: GridApi): SetFilterHandler {
        return getMultiFilterHandler(api).getHandler(1) as SetFilterHandler;
    }

    test('Set Filter availableKeys should update when sibling filter model changes via handler refresh', async () => {
        const api = await createGrid();
        await asyncSetTimeout(0);

        // Verify all athlete names are initially available
        const handler = getSetFilterHandler(api);
        expect(handler.valueModel.availableKeys.size).toBe(5);

        // Set the text filter model within the multi filter (simulates what floating filter does).
        // Both the floating filter path and the API path go through MultiFilterHandler.refresh()
        // which refreshes each child handler but does NOT call onAnyFilterChanged() on siblings.
        const multiModel: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'michael' }, null],
        };
        await api.setColumnFilterModel('athlete', multiModel);
        // Allow any async processing in handlers
        await asyncSetTimeout(100);

        // BUG: After the multi filter handler is refreshed with a text filter model,
        // the Set Filter handler's availableKeys should be updated to reflect only rows
        // that pass the text filter. But onAnyFilterChanged() is never called on the
        // Set Filter handler, so availableKeys still contains all values.
        //
        // In the real floating filter path, the subsequent onFilterChanged also skips
        // calling onAnyFilterChanged on the same column's handler, so availableKeys
        // remains stale when the user opens the filter popup.
        expect(handler.valueModel.availableKeys.size).toBe(2);
        expect(handler.valueModel.availableKeys.has('Michael Phelps')).toBe(true);
        expect(handler.valueModel.availableKeys.has('Michael Johnson')).toBe(true);
    });

    test('Set Filter availableKeys should update when filter applied via buttons (wrapper buttons path)', async () => {
        // Create grid with buttons on the multi filter wrapper (simulates Apply button config)
        const api = await gridsManager.createGridAndWait('grid2', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        buttons: ['apply'],
                        filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }],
                    },
                },
                { field: 'country' },
            ],
            defaultColDef: {
                floatingFilter: true,
            },
            rowData: ROW_DATA,
        });
        await asyncSetTimeout(0);

        const multiHandler = api.getColumnFilterHandler('athlete') as MultiFilterHandler;
        const handler = multiHandler.getHandler(1) as SetFilterHandler;
        expect(handler.valueModel.availableKeys.size).toBe(5);

        // Set the text filter model (this goes through MultiFilterHandler.refresh with source 'api')
        const multiModel: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'michael' }, null],
        };
        await api.setColumnFilterModel('athlete', multiModel);
        api.onFilterChanged();
        await asyncSetTimeout(100);

        // The 'api' source triggers onAnyFilterChanged, so availableKeys should be updated
        expect(handler.valueModel.availableKeys.size).toBe(2);
        expect(handler.valueModel.availableKeys.has('Michael Phelps')).toBe(true);
        expect(handler.valueModel.availableKeys.has('Michael Johnson')).toBe(true);

        // Now clear the filter and verify availableKeys resets
        await api.setColumnFilterModel('athlete', null);
        api.onFilterChanged();
        await asyncSetTimeout(100);

        expect(handler.valueModel.availableKeys.size).toBe(5);
    });

    test('onAnyFilterChanged is called on MultiFilterHandler but not propagated to Set Filter child', async () => {
        const api = await createGrid();
        await asyncSetTimeout(0);

        // Set the text filter model
        const multiModel: IMultiFilterModel = {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'michael' }, null],
        };
        await api.setColumnFilterModel('athlete', multiModel);
        api.onFilterChanged();
        await asyncSetTimeout(100);

        // After onFilterChanged (without column), onAnyFilterChanged IS called on the
        // multi filter handler because the column is not specified.
        // This verifies the Set Filter handler's availableKeys is correctly updated
        // when onAnyFilterChanged IS properly invoked.
        const handler = getSetFilterHandler(api);
        expect(handler.valueModel.availableKeys.size).toBe(2);
        expect(handler.valueModel.availableKeys.has('Michael Phelps')).toBe(true);
        expect(handler.valueModel.availableKeys.has('Michael Johnson')).toBe(true);
    });
});
