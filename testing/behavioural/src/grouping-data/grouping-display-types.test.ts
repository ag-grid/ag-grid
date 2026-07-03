import { ClientSideRowModelModule, GRAND_TOTAL_ROW_ID, GROUP_TOTAL_ROW_ID_PREFIX } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, cachedJSONObjects } from '../test-utils';

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

        await new GridRows(api, 'group rows display').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            │ └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer" gold:3
            └─┬ LEAF_GROUP id:row-group-country-France gold:1
            · └── LEAF id:4 country:"France" athlete:"Jean Dupont" sport:"Tennis" gold:1
        `);

        await new GridColumns(api, 'group rows display').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── gold "Gold" width:200 aggFunc:sum
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

        await new GridColumns(api, 'custom display type').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── gold "Gold" width:200 aggFunc:sum
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

        const irelandTotal = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + 'row-group-country-Ireland');
        expect(irelandTotal?.footer).toBe(true);
        expect(irelandTotal?.aggData?.gold).toBe(6);

        const irelandYear2020Total = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + 'row-group-country-Ireland-year-2020');
        expect(irelandYear2020Total?.footer).toBe(true);
        expect(irelandYear2020Total?.aggData?.gold).toBe(3);

        await new GridColumns(api, 'with group total rows').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country/Year" width:200
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            ├── gold "Gold" width:200 aggFunc:sum
            └── silver "Silver" width:200 aggFunc:sum
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

        const grandTotalNode = api.getRowNode(GRAND_TOTAL_ROW_ID);
        expect(grandTotalNode?.footer).toBe(true);
        expect(grandTotalNode?.aggData?.gold).toBe(6);
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
        const priorityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };

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

    test('groupTotalRow: bottom footers never become top sticky rows while scrolling', async () => {
        const rowData = cachedJSONObjects.array(
            Array.from({ length: 40 }, (_, i) => ({
                id: `${i + 1}`,
                group: i < 20 ? 'A' : 'B',
                value: i + 1,
            }))
        );

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowData,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `groupTotalRow: bottom footers never become top sticky rows while scrolling setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200 aggFunc:sum
            `);
        await new GridRows(api, `groupTotalRow: bottom footers never become top sticky rows while scrolling setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
                │ ├── LEAF id:1 group:"A" value:1
                │ ├── LEAF id:2 group:"A" value:2
                │ ├── LEAF id:3 group:"A" value:3
                │ ├── LEAF id:4 group:"A" value:4
                │ ├── LEAF id:5 group:"A" value:5
                │ ├── LEAF id:6 group:"A" value:6
                │ ├── LEAF id:7 group:"A" value:7
                │ ├── LEAF id:8 group:"A" value:8
                │ ├── LEAF id:9 group:"A" value:9
                │ ├── LEAF id:10 group:"A" value:10
                │ ├── LEAF id:11 group:"A" value:11
                │ ├── LEAF id:12 group:"A" value:12
                │ ├── LEAF id:13 group:"A" value:13
                │ ├── LEAF id:14 group:"A" value:14
                │ ├── LEAF id:15 group:"A" value:15
                │ ├── LEAF id:16 group:"A" value:16
                │ ├── LEAF id:17 group:"A" value:17
                │ ├── LEAF id:18 group:"A" value:18
                │ ├── LEAF id:19 group:"A" value:19
                │ ├── LEAF id:20 group:"A" value:20
                │ └─ footer id:rowGroupFooter_row-group-group-A ag-Grid-AutoColumn:"Total A" value:210
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
                · ├── LEAF id:21 group:"B" value:21
                · ├── LEAF id:22 group:"B" value:22
                · ├── LEAF id:23 group:"B" value:23
                · ├── LEAF id:24 group:"B" value:24
                · ├── LEAF id:25 group:"B" value:25
                · ├── LEAF id:26 group:"B" value:26
                · ├── LEAF id:27 group:"B" value:27
                · ├── LEAF id:28 group:"B" value:28
                · ├── LEAF id:29 group:"B" value:29
                · ├── LEAF id:30 group:"B" value:30
                · ├── LEAF id:31 group:"B" value:31
                · ├── LEAF id:32 group:"B" value:32
                · ├── LEAF id:33 group:"B" value:33
                · ├── LEAF id:34 group:"B" value:34
                · ├── LEAF id:35 group:"B" value:35
                · ├── LEAF id:36 group:"B" value:36
                · ├── LEAF id:37 group:"B" value:37
                · ├── LEAF id:38 group:"B" value:38
                · ├── LEAF id:39 group:"B" value:39
                · ├── LEAF id:40 group:"B" value:40
                · └─ footer id:rowGroupFooter_row-group-group-B ag-Grid-AutoColumn:"Total B" value:610
            `);

        const root = TestGridsManager.getHTMLElement(api)!;
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const stickyTopContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-top-rows-container')!;
        const stickyBottomContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-bottom-rows-container')!;

        const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        let sawBottomStickyFooter = false;
        for (let scrollTop = 0; scrollTop <= maxScrollTop; scrollTop += 48) {
            viewport.scrollTop = scrollTop;
            await asyncSetTimeout(0);
            if (stickyBottomContainer.querySelector('.ag-row-footer')) {
                sawBottomStickyFooter = true;
            }
            expect(stickyTopContainer.querySelector('.ag-row-footer')).toBeNull();
        }

        expect(sawBottomStickyFooter).toBe(true);
        await new GridRows(
            api,
            `groupTotalRow: bottom footers never become top sticky rows while scrolling final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:1
            │ ├── LEAF id:2 group:"A" value:2
            │ ├── LEAF id:3 group:"A" value:3
            │ ├── LEAF id:4 group:"A" value:4
            │ ├── LEAF id:5 group:"A" value:5
            │ ├── LEAF id:6 group:"A" value:6
            │ ├── LEAF id:7 group:"A" value:7
            │ ├── LEAF id:8 group:"A" value:8
            │ ├── LEAF id:9 group:"A" value:9
            │ ├── LEAF id:10 group:"A" value:10
            │ ├── LEAF id:11 group:"A" value:11
            │ ├── LEAF id:12 group:"A" value:12
            │ ├── LEAF id:13 group:"A" value:13
            │ ├── LEAF id:14 group:"A" value:14
            │ ├── LEAF id:15 group:"A" value:15
            │ ├── LEAF id:16 group:"A" value:16
            │ ├── LEAF id:17 group:"A" value:17
            │ ├── LEAF id:18 group:"A" value:18
            │ ├── LEAF id:19 group:"A" value:19
            │ ├── LEAF id:20 group:"A" value:20
            │ └─ footer id:rowGroupFooter_row-group-group-A ag-Grid-AutoColumn:"Total A" value:210
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:21 group:"B" value:21
            · ├── LEAF id:22 group:"B" value:22
            · ├── LEAF id:23 group:"B" value:23
            · ├── LEAF id:24 group:"B" value:24
            · ├── LEAF id:25 group:"B" value:25
            · ├── LEAF id:26 group:"B" value:26
            · ├── LEAF id:27 group:"B" value:27
            · ├── LEAF id:28 group:"B" value:28
            · ├── LEAF id:29 group:"B" value:29
            · ├── LEAF id:30 group:"B" value:30
            · ├── LEAF id:31 group:"B" value:31
            · ├── LEAF id:32 group:"B" value:32
            · ├── LEAF id:33 group:"B" value:33
            · ├── LEAF id:34 group:"B" value:34
            · ├── LEAF id:35 group:"B" value:35
            · ├── LEAF id:36 group:"B" value:36
            · ├── LEAF id:37 group:"B" value:37
            · ├── LEAF id:38 group:"B" value:38
            · ├── LEAF id:39 group:"B" value:39
            · ├── LEAF id:40 group:"B" value:40
            · └─ footer id:rowGroupFooter_row-group-group-B ag-Grid-AutoColumn:"Total B" value:610
        `);
    });

    test('top sticky rows are inserted in reverse visual DOM order', async () => {
        const rowData = cachedJSONObjects.array(
            Array.from({ length: 60 }, (_, i) => ({
                id: `${i + 1}`,
                region: i < 30 ? 'North' : 'South',
                country: i % 2 === 0 ? 'Ireland' : 'UK',
                value: i + 1,
            }))
        );

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `top sticky rows are inserted in reverse visual DOM order setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `top sticky rows are inserted in reverse visual DOM order setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-North ag-Grid-AutoColumn:"North"
            │ ├─┬ LEAF_GROUP id:row-group-region-North-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ │ ├── LEAF id:1 region:"North" country:"Ireland" value:1
            │ │ ├── LEAF id:3 region:"North" country:"Ireland" value:3
            │ │ ├── LEAF id:5 region:"North" country:"Ireland" value:5
            │ │ ├── LEAF id:7 region:"North" country:"Ireland" value:7
            │ │ ├── LEAF id:9 region:"North" country:"Ireland" value:9
            │ │ ├── LEAF id:11 region:"North" country:"Ireland" value:11
            │ │ ├── LEAF id:13 region:"North" country:"Ireland" value:13
            │ │ ├── LEAF id:15 region:"North" country:"Ireland" value:15
            │ │ ├── LEAF id:17 region:"North" country:"Ireland" value:17
            │ │ ├── LEAF id:19 region:"North" country:"Ireland" value:19
            │ │ ├── LEAF id:21 region:"North" country:"Ireland" value:21
            │ │ ├── LEAF id:23 region:"North" country:"Ireland" value:23
            │ │ ├── LEAF id:25 region:"North" country:"Ireland" value:25
            │ │ ├── LEAF id:27 region:"North" country:"Ireland" value:27
            │ │ └── LEAF id:29 region:"North" country:"Ireland" value:29
            │ └─┬ LEAF_GROUP id:row-group-region-North-country-UK ag-Grid-AutoColumn:"UK"
            │ · ├── LEAF id:2 region:"North" country:"UK" value:2
            │ · ├── LEAF id:4 region:"North" country:"UK" value:4
            │ · ├── LEAF id:6 region:"North" country:"UK" value:6
            │ · ├── LEAF id:8 region:"North" country:"UK" value:8
            │ · ├── LEAF id:10 region:"North" country:"UK" value:10
            │ · ├── LEAF id:12 region:"North" country:"UK" value:12
            │ · ├── LEAF id:14 region:"North" country:"UK" value:14
            │ · ├── LEAF id:16 region:"North" country:"UK" value:16
            │ · ├── LEAF id:18 region:"North" country:"UK" value:18
            │ · ├── LEAF id:20 region:"North" country:"UK" value:20
            │ · ├── LEAF id:22 region:"North" country:"UK" value:22
            │ · ├── LEAF id:24 region:"North" country:"UK" value:24
            │ · ├── LEAF id:26 region:"North" country:"UK" value:26
            │ · ├── LEAF id:28 region:"North" country:"UK" value:28
            │ · └── LEAF id:30 region:"North" country:"UK" value:30
            └─┬ filler id:row-group-region-South ag-Grid-AutoColumn:"South"
            · ├─┬ LEAF_GROUP id:row-group-region-South-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · │ ├── LEAF id:31 region:"South" country:"Ireland" value:31
            · │ ├── LEAF id:33 region:"South" country:"Ireland" value:33
            · │ ├── LEAF id:35 region:"South" country:"Ireland" value:35
            · │ ├── LEAF id:37 region:"South" country:"Ireland" value:37
            · │ ├── LEAF id:39 region:"South" country:"Ireland" value:39
            · │ ├── LEAF id:41 region:"South" country:"Ireland" value:41
            · │ ├── LEAF id:43 region:"South" country:"Ireland" value:43
            · │ ├── LEAF id:45 region:"South" country:"Ireland" value:45
            · │ ├── LEAF id:47 region:"South" country:"Ireland" value:47
            · │ ├── LEAF id:49 region:"South" country:"Ireland" value:49
            · │ ├── LEAF id:51 region:"South" country:"Ireland" value:51
            · │ ├── LEAF id:53 region:"South" country:"Ireland" value:53
            · │ ├── LEAF id:55 region:"South" country:"Ireland" value:55
            · │ ├── LEAF id:57 region:"South" country:"Ireland" value:57
            · │ └── LEAF id:59 region:"South" country:"Ireland" value:59
            · └─┬ LEAF_GROUP id:row-group-region-South-country-UK ag-Grid-AutoColumn:"UK"
            · · ├── LEAF id:32 region:"South" country:"UK" value:32
            · · ├── LEAF id:34 region:"South" country:"UK" value:34
            · · ├── LEAF id:36 region:"South" country:"UK" value:36
            · · ├── LEAF id:38 region:"South" country:"UK" value:38
            · · ├── LEAF id:40 region:"South" country:"UK" value:40
            · · ├── LEAF id:42 region:"South" country:"UK" value:42
            · · ├── LEAF id:44 region:"South" country:"UK" value:44
            · · ├── LEAF id:46 region:"South" country:"UK" value:46
            · · ├── LEAF id:48 region:"South" country:"UK" value:48
            · · ├── LEAF id:50 region:"South" country:"UK" value:50
            · · ├── LEAF id:52 region:"South" country:"UK" value:52
            · · ├── LEAF id:54 region:"South" country:"UK" value:54
            · · ├── LEAF id:56 region:"South" country:"UK" value:56
            · · ├── LEAF id:58 region:"South" country:"UK" value:58
            · · └── LEAF id:60 region:"South" country:"UK" value:60
        `);

        const root = TestGridsManager.getHTMLElement(api)!;
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const stickyTopContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-top-rows-container')!;

        const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        let observedTwoStickyRows = false;
        for (let scrollTop = 0; scrollTop <= maxScrollTop; scrollTop += 48) {
            viewport.scrollTop = scrollTop;
            await asyncSetTimeout(0);

            const stickyRows = Array.from(stickyTopContainer.querySelectorAll<HTMLElement>('.ag-row'));
            if (stickyRows.length < 2) {
                continue;
            }

            const rowIndexes = stickyRows.map((row) => Number.parseInt(row.getAttribute('row-index') || '-1', 10));
            expect(rowIndexes.every((value, index, arr) => index === 0 || arr[index - 1] > value)).toBe(true);
            observedTwoStickyRows = true;
            break;
        }

        expect(observedTwoStickyRows).toBe(true);
        await new GridRows(api, `top sticky rows are inserted in reverse visual DOM order final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-North ag-Grid-AutoColumn:"North"
            │ ├─┬ LEAF_GROUP id:row-group-region-North-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ │ ├── LEAF id:1 region:"North" country:"Ireland" value:1
            │ │ ├── LEAF id:3 region:"North" country:"Ireland" value:3
            │ │ ├── LEAF id:5 region:"North" country:"Ireland" value:5
            │ │ ├── LEAF id:7 region:"North" country:"Ireland" value:7
            │ │ ├── LEAF id:9 region:"North" country:"Ireland" value:9
            │ │ ├── LEAF id:11 region:"North" country:"Ireland" value:11
            │ │ ├── LEAF id:13 region:"North" country:"Ireland" value:13
            │ │ ├── LEAF id:15 region:"North" country:"Ireland" value:15
            │ │ ├── LEAF id:17 region:"North" country:"Ireland" value:17
            │ │ ├── LEAF id:19 region:"North" country:"Ireland" value:19
            │ │ ├── LEAF id:21 region:"North" country:"Ireland" value:21
            │ │ ├── LEAF id:23 region:"North" country:"Ireland" value:23
            │ │ ├── LEAF id:25 region:"North" country:"Ireland" value:25
            │ │ ├── LEAF id:27 region:"North" country:"Ireland" value:27
            │ │ └── LEAF id:29 region:"North" country:"Ireland" value:29
            │ └─┬ LEAF_GROUP id:row-group-region-North-country-UK ag-Grid-AutoColumn:"UK"
            │ · ├── LEAF id:2 region:"North" country:"UK" value:2
            │ · ├── LEAF id:4 region:"North" country:"UK" value:4
            │ · ├── LEAF id:6 region:"North" country:"UK" value:6
            │ · ├── LEAF id:8 region:"North" country:"UK" value:8
            │ · ├── LEAF id:10 region:"North" country:"UK" value:10
            │ · ├── LEAF id:12 region:"North" country:"UK" value:12
            │ · ├── LEAF id:14 region:"North" country:"UK" value:14
            │ · ├── LEAF id:16 region:"North" country:"UK" value:16
            │ · ├── LEAF id:18 region:"North" country:"UK" value:18
            │ · ├── LEAF id:20 region:"North" country:"UK" value:20
            │ · ├── LEAF id:22 region:"North" country:"UK" value:22
            │ · ├── LEAF id:24 region:"North" country:"UK" value:24
            │ · ├── LEAF id:26 region:"North" country:"UK" value:26
            │ · ├── LEAF id:28 region:"North" country:"UK" value:28
            │ · └── LEAF id:30 region:"North" country:"UK" value:30
            └─┬ filler id:row-group-region-South ag-Grid-AutoColumn:"South"
            · ├─┬ LEAF_GROUP id:row-group-region-South-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · │ ├── LEAF id:31 region:"South" country:"Ireland" value:31
            · │ ├── LEAF id:33 region:"South" country:"Ireland" value:33
            · │ ├── LEAF id:35 region:"South" country:"Ireland" value:35
            · │ ├── LEAF id:37 region:"South" country:"Ireland" value:37
            · │ ├── LEAF id:39 region:"South" country:"Ireland" value:39
            · │ ├── LEAF id:41 region:"South" country:"Ireland" value:41
            · │ ├── LEAF id:43 region:"South" country:"Ireland" value:43
            · │ ├── LEAF id:45 region:"South" country:"Ireland" value:45
            · │ ├── LEAF id:47 region:"South" country:"Ireland" value:47
            · │ ├── LEAF id:49 region:"South" country:"Ireland" value:49
            · │ ├── LEAF id:51 region:"South" country:"Ireland" value:51
            · │ ├── LEAF id:53 region:"South" country:"Ireland" value:53
            · │ ├── LEAF id:55 region:"South" country:"Ireland" value:55
            · │ ├── LEAF id:57 region:"South" country:"Ireland" value:57
            · │ └── LEAF id:59 region:"South" country:"Ireland" value:59
            · └─┬ LEAF_GROUP id:row-group-region-South-country-UK ag-Grid-AutoColumn:"UK"
            · · ├── LEAF id:32 region:"South" country:"UK" value:32
            · · ├── LEAF id:34 region:"South" country:"UK" value:34
            · · ├── LEAF id:36 region:"South" country:"UK" value:36
            · · ├── LEAF id:38 region:"South" country:"UK" value:38
            · · ├── LEAF id:40 region:"South" country:"UK" value:40
            · · ├── LEAF id:42 region:"South" country:"UK" value:42
            · · ├── LEAF id:44 region:"South" country:"UK" value:44
            · · ├── LEAF id:46 region:"South" country:"UK" value:46
            · · ├── LEAF id:48 region:"South" country:"UK" value:48
            · · ├── LEAF id:50 region:"South" country:"UK" value:50
            · · ├── LEAF id:52 region:"South" country:"UK" value:52
            · · ├── LEAF id:54 region:"South" country:"UK" value:54
            · · ├── LEAF id:56 region:"South" country:"UK" value:56
            · · ├── LEAF id:58 region:"South" country:"UK" value:58
            · · └── LEAF id:60 region:"South" country:"UK" value:60
        `);
    });
});
