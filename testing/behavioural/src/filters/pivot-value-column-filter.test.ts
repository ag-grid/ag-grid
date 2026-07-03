import { ClientSideRowModelModule, NumberFilterModule, setupAgTestIds } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

describe('Filtering a pivot value column', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, NumberFilterModule, PivotModule, RowGroupingModule],
    });

    const rowData = [
        { country: 'Russia', sport: 'Gymnastics', gold: 3 },
        { country: 'USA', sport: 'Gymnastics', gold: 4 },
        { country: 'USA', sport: 'Swimming', gold: 2 },
    ];

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    test('stays applied when a pivot column is added after the filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            rowData,
        });

        api.setFilterModel({
            gold: {
                type: 'greaterThan',
                filterType: 'number',
                filter: 3,
            },
        });

        await new GridRows(api, 'filter gold > 3 before adding pivot column').check(`
            ROOT id:ROOT_NODE_ID gold:9
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:6
            · ├── LEAF hidden id:1 country:"USA" sport:"Gymnastics" gold:4
            · └── LEAF hidden id:2 country:"USA" sport:"Swimming" gold:2
        `);

        // Drag the sport column to Column Labels, regenerating the pivot value columns.
        // This fires `columnPivotChanged`; the filter must be re-evaluated against the new columns.
        api.applyColumnState({ state: [{ colId: 'sport', pivot: true }] });

        await new GridRows(api, 'filter still applied after pivot column added').check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Gymnastics_gold:4
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport_Gymnastics_gold:4
            · └── LEAF hidden id:1 pivot_sport_Gymnastics_gold:4
        `);
    });
});
