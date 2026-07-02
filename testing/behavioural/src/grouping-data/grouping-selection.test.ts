import type { RowSelectedEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule, TextFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';
import { waitForEvent } from '../test-utils/test-utils-events';

describe('ag-grid grouping selection', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, RowSelectionModule, ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grouping selection and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football' },
            { id: '6', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis' },
            { id: '7', country: 'France', athlete: 'Marie Martin', sport: 'Soccer' },
            { id: '8', country: 'Spain', athlete: 'Carlos Garcia', sport: 'Basketball' },
            { id: '9', country: 'Germany', athlete: 'Hans Mueller', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport', filter: 'agTextColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Select multiple rows including groups and leaves
        api.setNodesSelected({
            nodes: [
                api.getRowNode('row-group-country-Ireland')!,
                api.getRowNode('3')!,
                api.getRowNode('4')!,
                api.getRowNode('row-group-country-France')!,
                api.getRowNode('9')!,
            ],
            newValue: true,
        });
        await new GridRows(api, 'initial selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF selected id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 country:"France" athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ └── LEAF id:8 country:"Spain" athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └── LEAF selected id:9 country:"Germany" athlete:"Hans Mueller" sport:"Football"
        `);

        // Add a new item and verify selection state is maintained
        applyTransactionChecked(api, {
            add: [{ id: '10', country: 'Ireland', athlete: "Pat O'Brien", sport: 'Rugby' }],
        });

        await new GridRows(api, 'after adding to Ireland').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ ├── LEAF selected id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            │ └── LEAF id:10 country:"Ireland" athlete:"Pat O'Brien" sport:"Rugby"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 country:"France" athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ └── LEAF id:8 country:"Spain" athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └── LEAF selected id:9 country:"Germany" athlete:"Hans Mueller" sport:"Football"
        `);

        // Select a new child in a selected group
        api.setNodesSelected({
            nodes: [api.getRowNode('10')!],
            newValue: true,
        });

        await new GridRows(api, 'select new child in selected group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ ├── LEAF selected id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            │ └── LEAF selected id:10 country:"Ireland" athlete:"Pat O'Brien" sport:"Rugby"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 country:"France" athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ └── LEAF id:8 country:"Spain" athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └── LEAF selected id:9 country:"Germany" athlete:"Hans Mueller" sport:"Football"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            └── sport "Sport" width:200
        `);
    });

    // A selected group is destroyed when its last child is removed (removeEmptyGroups); it must drop
    // out of the selection rather than linger as a destroyed node in getSelectedNodes().
    test('selected group dropped from selection when emptied (groupSelects: "self")', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '3', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        const ireland = api.getRowNode('row-group-country-Ireland')!;
        api.setNodesSelected({ nodes: [ireland], newValue: true });
        expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['row-group-country-Ireland']);

        applyTransactionChecked(api, { remove: [{ id: '1' }] });

        expect(ireland.destroyed).toBe(true);
        expect(api.getSelectedNodes()).toEqual([]);
        await new GridRows(api, 'after emptying selected Ireland group').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:2 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:3 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);
    });

    test('group selection checkbox behavior', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: {
                headerName: 'Country',
            },
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                headerCheckbox: true,
                checkboxes: true,
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Select Ireland group - should select all its children
        api.setNodesSelected({
            nodes: [api.getRowNode('row-group-country-Ireland')!],
            newValue: true,
        });

        await new GridRows(api, 'select Ireland group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Deselect one child - group should become unselected
        api.setNodesSelected({
            nodes: [api.getRowNode('1')!],
            newValue: false,
        });

        await new GridRows(api, 'deselect one child').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP indeterminate id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            └── sport "Sport" width:200
        `);
    });

    test('selection with filtering', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport', filter: 'agTextColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Select some nodes before filtering
        api.setNodesSelected({
            nodes: [api.getRowNode('1')!, api.getRowNode('2')!, api.getRowNode('4')!],
            newValue: true,
        });

        await new GridRows(api, 'initial selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);

        // Filter by sport = "Soccer"
        api.setFilterModel({ sport: { type: 'equals', filter: 'Soccer' } });

        await new GridRows(api, 'filter by Soccer').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Clear filter - selection should be preserved
        api.setFilterModel(null);

        await new GridRows(api, 'filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);
    });

    test('selection with multi-level grouping', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', year: 2020, athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', year: 2020, athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', year: 2021, athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', year: 2021, athlete: 'Luigi Verdi', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Select nested groups and leaves
        api.setNodesSelected({
            nodes: [
                api.getRowNode('row-group-country-Ireland-year-2020')!,
                api.getRowNode('3')!,
                api.getRowNode('row-group-country-Italy')!,
            ],
            newValue: true,
        });

        await new GridRows(api, 'multi-level selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP selected id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF selected id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            └─┬ filler selected id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ └── LEAF id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:5 country:"Italy" year:2021 athlete:"Luigi Verdi" sport:"Football"
        `);
    });

    test('AG-17267 rowSelected event includes browser event for group and descendants', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'Alice' },
            { id: '2', country: 'Ireland', athlete: 'Bob' },
            { id: '3', country: 'Italy', athlete: 'Carlo' },
        ]);

        const events: RowSelectedEvent[] = [];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                enableClickSelection: true,
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            onRowSelected: (e) => events.push(e),
        });

        await waitForEvent('firstDataRendered', api);

        const groupNode = api.getRowNode('row-group-country-Ireland')!;
        const mouseEvent = new MouseEvent('click', { bubbles: true });
        const { selectionSvc } = (groupNode as any).beans;
        selectionSvc.handleSelectionEvent(mouseEvent, groupNode, 'rowClicked');

        // gridOptions callbacks are dispatched asynchronously via setTimeout
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(events.length).toBe(3);
        for (const e of events) {
            expect(e.event).toBe(mouseEvent);
        }

        await new GridRows(api, 'after group selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"Alice"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Bob"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Carlo"
        `);
    });
});
