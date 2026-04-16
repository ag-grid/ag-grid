import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

describe('Aggregate Filters', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            PivotModule,
            NumberFilterModule,
            RowGroupingModule,
            PivotModule,
        ],
    });

    const rowData = [
        { athlete: 'Michael Phelps', gold: 8 },
        { athlete: 'Michael Phelps', gold: 6 },
        { athlete: 'Michael Phelps', gold: 4 },
        { athlete: 'Natalie Coughlin', gold: 1 },
        { athlete: 'Natalie Coughlin', gold: 2 },
        { athlete: 'Natalie Coughlin', gold: 0 },
    ];

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    test('Filtered aggregate values should update after pivot mode is enabled and disabled', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    rowGroup: true,
                    hide: true,
                },
                {
                    field: 'gold',
                    aggFunc: 'sum',
                    filter: 'agNumberColumnFilter',
                },
            ],
            rowData,
        });

        api.setFilterModel({
            gold: {
                type: 'greaterThan',
                filterType: 'number',
                filter: 7,
            },
        });

        await new GridRows(api, 'filtering without pivot').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:8
            · └── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
        `);

        api.setGridOption('pivotMode', true);

        await new GridRows(api, 'after enabling pivoting').check(`
            ROOT id:ROOT_NODE_ID gold:21
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:18
            · ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
            · ├── LEAF hidden id:1 athlete:"Michael Phelps" gold:6
            · └── LEAF hidden id:2 athlete:"Michael Phelps" gold:4
        `);

        api.setGridOption('pivotMode', false);

        await new GridRows(api, 'after disabling pivoting again').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:8
            · └── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
        `);

        await new GridColumns(api, 'columns after pivot toggle').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200 aggFunc:sum filter
        `);
    });
});
