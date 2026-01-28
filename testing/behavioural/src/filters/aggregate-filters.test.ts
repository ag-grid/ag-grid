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

import { GridRows, TestGridsManager, asyncSetTimeout, getGridHTMLElement, waitForEvent } from '../test-utils';

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
        { athlete: 'Michael Phelps', gold: 8, silver: 1, total: 9, sport: 'Swimming' },
        { athlete: 'Michael Phelps', gold: 6, silver: 0, total: 6, sport: 'Swimming' },
        { athlete: 'Michael Phelps', gold: 4, silver: 3, total: 7, sport: 'Swimming' },
        { athlete: 'Natalie Coughlin', gold: 1, silver: 3, total: 4, sport: 'Swimming' },
        { athlete: 'Natalie Coughlin', gold: 2, silver: 10, total: 12, sport: 'Swimming' },
        { athlete: 'Natalie Coughlin', gold: 0, silver: 0, total: 0, sport: 'Swimming' },
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
                // using number-filter only here (TC1 of AG-16335) because rendering set-filter (TC2 of same JIRA)
                // has issues in JSDom (rendering of virtual rows in the filter is based off component height which
                // seems to be zero).
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                { field: 'silver', aggFunc: 'sum' },
                { field: 'total', aggFunc: 'sum' },
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
            ROOT id:ROOT_NODE_ID gold:21 silver:17 total:38
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:18 silver:4 total:22
            │ ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8 silver:1 total:9
            │ ├── LEAF hidden id:1 athlete:"Michael Phelps" gold:6 silver:0 total:6
            │ └── LEAF hidden id:2 athlete:"Michael Phelps" gold:4 silver:3 total:7
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" gold:3 silver:13 total:16
            │ ├── LEAF hidden id:3 athlete:"Natalie Coughlin" gold:1 silver:3 total:4
            │ ├── LEAF hidden id:4 athlete:"Natalie Coughlin" gold:2 silver:10 total:12
            │ └── LEAF hidden id:5 athlete:"Natalie Coughlin" gold:0 silver:0 total:0
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:21 silver:17 total:38
        `);

        const modelUpdated = waitForEvent('modelUpdated', api);
        await userSession.type(
            getByTestId(gridDiv, agTestIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId: 'gold' })),
            '5'
        );
        await modelUpdated;

        await new GridRows(api, 'after filter').check(`
            ROOT id:ROOT_NODE_ID gold:21 silver:17 total:38
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:18 silver:4 total:22
            │ ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8 silver:1 total:9
            │ ├── LEAF hidden id:1 athlete:"Michael Phelps" gold:6 silver:0 total:6
            │ └── LEAF hidden id:2 athlete:"Michael Phelps" gold:4 silver:3 total:7
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:18 silver:4 total:22
        `);

        // ... when we turn off pivot mode ...
        const modelUpdated2 = waitForEvent('modelUpdated', api);
        api.setGridOption('pivotMode', false);
        await modelUpdated2;

        // ... expect grand total row to update reactively
        await new GridRows(api, 'after pivot mode off').check(`
            ROOT id:ROOT_NODE_ID gold:14 silver:1 total:15
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:14 silver:1 total:15
            │ ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8 silver:1 total:9
            │ └── LEAF hidden id:1 athlete:"Michael Phelps" gold:6 silver:0 total:6
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:14 silver:1 total:15
        `);
    });

    test('Grand total row displays correct aggregates for pivot result columns when no filter and when filter is applied', async () => {
        const userSession = userEvent.setup();

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, hide: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            defaultColDef: {
                floatingFilter: true,
                filterParams: {
                    filterOptions: ['greaterThan'],
                },
            },
            grandTotalRow: 'bottom',
            pivotMode: true,
            rowData,
        });

        await asyncSetTimeout(0);

        const gridDiv = getGridHTMLElement(api)!;

        await new GridRows(api, 'before filter').check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Swimming_gold:21
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_sport_Swimming_gold:18
            │ ├── LEAF hidden id:0
            │ ├── LEAF hidden id:1
            │ └── LEAF hidden id:2
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" pivot_sport_Swimming_gold:3
            │ ├── LEAF hidden id:3
            │ ├── LEAF hidden id:4
            │ └── LEAF hidden id:5
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " pivot_sport_Swimming_gold:21
        `);

        const modelUpdated = waitForEvent('modelUpdated', api);
        await userSession.type(
            getByTestId(
                gridDiv,
                agTestIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId: 'pivot_sport_Swimming_gold' })
            ),
            '5'
        );
        await modelUpdated;

        await new GridRows(api, 'after filter').check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Swimming_gold:21
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_sport_Swimming_gold:18
            │ ├── LEAF hidden id:0
            │ ├── LEAF hidden id:1
            │ └── LEAF hidden id:2
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " pivot_sport_Swimming_gold:18
        `);
    });
});
