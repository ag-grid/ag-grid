import { getByTestId } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    setupAgTestIds,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, getGridHTMLElement, waitForEvent } from '../test-utils';

describe('Aggregate Filters', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, RowGroupingModule, PivotModule],
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
    beforeEach(() => gridsManager.reset());
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
    });

    test('Grand total row updates displayed aggregation when number filter applied in pivot mode with no column lables', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid2', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            defaultColDef: {
                flex: 1,
                floatingFilter: true,
                filterParams: {
                    filterOptions: ['greaterThan'],
                },
            },
            grandTotalRow: 'bottom',
            pivotMode: true,
            rowData,
        });

        const gridDiv = getGridHTMLElement(api)!;

        await new GridRows(api, 'before filter').check(`
            ROOT id:ROOT_NODE_ID gold:21
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:18
            │ ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
            │ ├── LEAF hidden id:1 athlete:"Michael Phelps" gold:6
            │ └── LEAF hidden id:2 athlete:"Michael Phelps" gold:4
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" gold:3
            │ ├── LEAF hidden id:3 athlete:"Natalie Coughlin" gold:1
            │ ├── LEAF hidden id:4 athlete:"Natalie Coughlin" gold:2
            │ └── LEAF hidden id:5 athlete:"Natalie Coughlin" gold:0
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:21
        `);

        const modelUpdated = waitForEvent('modelUpdated', api);
        await userSession.type(
            getByTestId(gridDiv, agTestIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId: 'gold' })),
            '5'
        );
        await modelUpdated;

        await new GridRows(api, 'after filter').check(`
            ROOT id:ROOT_NODE_ID gold:21
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:18
            │ ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
            │ ├── LEAF hidden id:1 athlete:"Michael Phelps" gold:6
            │ └── LEAF hidden id:2 athlete:"Michael Phelps" gold:4
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:18
        `);
    });
});
