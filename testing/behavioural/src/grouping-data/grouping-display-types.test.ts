import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping display types and footers', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grouping with group rows display type', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 3 },
            { id: '4', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis', gold: 1 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: {
                headerName: 'Country',
                valueGetter: (params) => params.node?.key || 'Root',
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupDisplayType: 'groupRows',
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'group rows display', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            │ └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer" gold:3
            └─┬ LEAF_GROUP id:row-group-country-France gold:1
            · └── LEAF id:4 country:"France" athlete:"Jean Dupont" sport:"Tennis" gold:1
        `);
    });

    test('grouping with custom display type', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 3 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: {
                headerName: 'Country',
                valueGetter: (params) => `Group: ${params.node?.key}`,
                cellRendererParams: {
                    suppressCount: true,
                    suppressDoubleClickExpand: true,
                },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupDisplayType: 'custom',
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'custom display type').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer" gold:3
        `);
    });

    test('grouping with group total rows', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', year: 2020, athlete: 'John Smith', sport: 'Sailing', gold: 1, silver: 2 },
            { id: '2', country: 'Ireland', year: 2020, athlete: 'Jane Doe', sport: 'Soccer', gold: 2, silver: 1 },
            { id: '3', country: 'Ireland', year: 2021, athlete: 'Bob Johnson', sport: 'Football', gold: 3, silver: 2 },
            { id: '4', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer', gold: 4, silver: 3 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'with group total rows').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing" gold:1 silver:2
            │ │ ├── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer" gold:2 silver:1
            │ │ └─ footer id:rowGroupFooter_row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"Total 2020" gold:3 silver:3
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ │ ├── LEAF id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football" gold:3 silver:2
            │ │ └─ footer id:rowGroupFooter_row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"Total 2021" gold:3 silver:2
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Total Ireland" gold:6 silver:5
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ ├── LEAF id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer" gold:4 silver:3
            · │ └─ footer id:rowGroupFooter_row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"Total 2020" gold:4 silver:3
            · └─ footer id:rowGroupFooter_row-group-country-Italy ag-Grid-AutoColumn:"Total Italy" gold:4 silver:3
        `);
    });

    test('grouping with grand total row at top', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 3 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            grandTotalRow: 'top',
            alwaysAggregateAtRootLevel: true,
            rowData,
            getRowId: (params) => params.data.id,
            groupSuppressBlankHeader: true,
        });

        await new GridRows(api, 'grand total at top').check(`
            ROOT id:ROOT_NODE_ID gold:6
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:6
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:3
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer" gold:3
        `);
    });

    test('grouping with grand total row at bottom', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 3 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            grandTotalRow: 'bottom',
            alwaysAggregateAtRootLevel: true,
            rowData,
            getRowId: (params) => params.data.id,
            groupSuppressBlankHeader: true,
        });

        await new GridRows(api, 'grand total at bottom').check(`
            ROOT id:ROOT_NODE_ID gold:6
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:3
            │ └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer" gold:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:6
        `);
    });

    test('grouping with custom group ordering', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', priority: 'Low', task: 'Task A', status: 'Completed', hours: 5 },
            { id: '2', priority: 'High', task: 'Task B', status: 'In Progress', hours: 10 },
            { id: '3', priority: 'Medium', task: 'Task C', status: 'Completed', hours: 8 },
            { id: '4', priority: 'High', task: 'Task D', status: 'Completed', hours: 12 },
            { id: '5', priority: 'Low', task: 'Task E', status: 'In Progress', hours: 3 },
        ]);

        // Custom priority order: High, Medium, Low
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'priority',
                    rowGroup: true,
                    hide: true,
                    comparator: (valueA, valueB) => {
                        return priorityOrder[valueA] - priorityOrder[valueB];
                    },
                },
                { field: 'task' },
                { field: 'status' },
                { field: 'hours', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Priority' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'custom group ordering').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-priority-Low ag-Grid-AutoColumn:"Low" hours:8
            │ ├── LEAF id:1 priority:"Low" task:"Task A" status:"Completed" hours:5
            │ └── LEAF id:5 priority:"Low" task:"Task E" status:"In Progress" hours:3
            ├─┬ LEAF_GROUP id:row-group-priority-High ag-Grid-AutoColumn:"High" hours:22
            │ ├── LEAF id:2 priority:"High" task:"Task B" status:"In Progress" hours:10
            │ └── LEAF id:4 priority:"High" task:"Task D" status:"Completed" hours:12
            └─┬ LEAF_GROUP id:row-group-priority-Medium ag-Grid-AutoColumn:"Medium" hours:8
            · └── LEAF id:3 priority:"Medium" task:"Task C" status:"Completed" hours:8
        `);
    });

    test('grouping with multiple columns and sticky total rows', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', region: 'North', country: 'Ireland', sales: 100, profit: 20 },
            { id: '2', region: 'North', country: 'Ireland', sales: 150, profit: 30 },
            { id: '3', region: 'North', country: 'UK', sales: 200, profit: 40 },
            { id: '4', region: 'South', country: 'Italy', sales: 120, profit: 25 },
            { id: '5', region: 'South', country: 'Spain', sales: 180, profit: 35 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sales', aggFunc: 'sum' },
                { field: 'profit', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Region/Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'multiple columns with sticky total rows').check(`
            ROOT id:ROOT_NODE_ID sales:750 profit:150
            ├─┬ filler id:row-group-region-North ag-Grid-AutoColumn:"North"
            │ ├─┬ LEAF_GROUP id:row-group-region-North-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ │ ├── LEAF id:1 region:"North" country:"Ireland" sales:100 profit:20
            │ │ ├── LEAF id:2 region:"North" country:"Ireland" sales:150 profit:30
            │ │ └─ footer id:rowGroupFooter_row-group-region-North-country-Ireland ag-Grid-AutoColumn:"Total Ireland" sales:250 profit:50
            │ ├─┬ LEAF_GROUP id:row-group-region-North-country-UK ag-Grid-AutoColumn:"UK"
            │ │ ├── LEAF id:3 region:"North" country:"UK" sales:200 profit:40
            │ │ └─ footer id:rowGroupFooter_row-group-region-North-country-UK ag-Grid-AutoColumn:"Total UK" sales:200 profit:40
            │ └─ footer id:rowGroupFooter_row-group-region-North ag-Grid-AutoColumn:"Total North" sales:450 profit:90
            ├─┬ filler id:row-group-region-South ag-Grid-AutoColumn:"South"
            │ ├─┬ LEAF_GROUP id:row-group-region-South-country-Italy ag-Grid-AutoColumn:"Italy"
            │ │ ├── LEAF id:4 region:"South" country:"Italy" sales:120 profit:25
            │ │ └─ footer id:rowGroupFooter_row-group-region-South-country-Italy ag-Grid-AutoColumn:"Total Italy" sales:120 profit:25
            │ ├─┬ LEAF_GROUP id:row-group-region-South-country-Spain ag-Grid-AutoColumn:"Spain"
            │ │ ├── LEAF id:5 region:"South" country:"Spain" sales:180 profit:35
            │ │ └─ footer id:rowGroupFooter_row-group-region-South-country-Spain ag-Grid-AutoColumn:"Total Spain" sales:180 profit:35
            │ └─ footer id:rowGroupFooter_row-group-region-South ag-Grid-AutoColumn:"Total South" sales:300 profit:60
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " sales:750 profit:150
        `);
    });
});
