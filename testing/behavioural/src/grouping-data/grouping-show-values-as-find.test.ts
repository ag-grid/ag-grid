import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { FindModule, RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Find must match what the user sees. For a column with an active Show Values As mode the cell shows the
 * transformed value (e.g. "25.00%"), so Find searches the transformed value — not the raw underlying number.
 * Non-showValueAs columns keep searching their raw/formatted value as before.
 */
describe('showValueAs + Find', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule, FindModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function search(api: GridApi, value: string): Promise<number> {
        api.setGridOption('findSearchValue', value);
        await asyncSetTimeout(1);
        return api.findGetTotalMatches();
    }

    test('Find matches the transformed value, not the raw value, for a showValueAs column', async () => {
        const api = gridsManager.createGrid('sva-find-flat', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 20 }, // 20 / 80 → 25.00%
                { id: '2', country: 'B', amount: 60 }, // 60 / 80 → 75.00%
            ],
        });

        await new GridRows(api, 'sva-find-flat setup').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        // The transformed string is present...
        expect(await search(api, '25.00%')).toBe(1);
        // ...and the raw underlying number is NOT what Find sees (no transformed cell contains "20").
        expect(await search(api, '20')).toBe(0);
    });

    test('Find still searches the raw value for ordinary (non-showValueAs) columns', async () => {
        const api = gridsManager.createGrid('sva-find-mixed', {
            columnDefs: [
                { field: 'country' },
                { field: 'units', aggFunc: 'sum' }, // plain value column — raw value shown
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', units: 20, amount: 20 },
                { id: '2', country: 'B', units: 60, amount: 60 },
            ],
        });

        await new GridRows(api, 'sva-find-mixed setup').check(`
            ROOT id:ROOT_NODE_ID units:80 amount:"100.00%"
            ├── LEAF id:1 country:"A" units:20 amount:"25.00%"
            └── LEAF id:2 country:"B" units:60 amount:"75.00%"
        `);

        // The plain `units` column still matches its raw value (20), while `amount` does not.
        expect(await search(api, '20')).toBe(1);
    });

    test('Find matches transformed group and leaf cells across a row grouping', async () => {
        const api = gridsManager.createGrid('sva-find-grouped', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 }, // group A total 40 → 40.00%
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 }, // group B → 60.00%
            ],
        });

        await new GridRows(api, 'sva-find-grouped setup').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"30.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"60.00%"
        `);

        // "60.00%" appears on group B and on leaf 3 → two matches; the raw 60 is never what Find sees.
        expect(await search(api, '60.00%')).toBe(2);
        // Group A's transformed total "40.00%" matches; no raw cell holds 40.
        expect(await search(api, '40.00%')).toBe(1);
    });
});
