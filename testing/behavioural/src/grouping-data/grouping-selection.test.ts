import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from 'ag-test-utils';
import { assertSelectedRowsById } from 'ag-test-utils/test-utils-assertions';
import { waitForEvent } from 'ag-test-utils/test-utils-events';

import type { RowSelectedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GRAND_TOTAL_ROW_ID,
    GROUP_TOTAL_ROW_ID_PREFIX,
    RowSelectionModule,
    TextFilterModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridActions } from '../selection/utils';

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

    test('SHIFT-click range excludes hidden descendants of a collapsed group and preserves the hidden anchor (groupSelects: "self")', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'a1', team: 'A', athlete: 'Alice' },
            { id: 'a2', team: 'A', athlete: 'Bob' },
            { id: 'a3', team: 'A', athlete: 'Carol' },
            { id: 'b1', team: 'B', athlete: 'Dave' },
            { id: 'b2', team: 'B', athlete: 'Erin' },
            { id: 'c1', team: 'C', athlete: 'Frank' },
            { id: 'c2', team: 'C', athlete: 'Grace' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'team', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Team' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);

        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B, 5 b1, 6 b2, 7 group-C, 8 c1, 9 c2
        actions.toggleCheckboxByIndex(2);
        assertSelectedRowsById(['a2'], api);

        await actions.collapseGroupRowByIndex(0, { count: 1 });
        // Rows displayed: 0 group-A (collapsed), 1 group-B, 2 b1, 3 b2, 4 group-C, 5 c1, 6 c2

        actions.toggleCheckboxByIndex(5, { shiftKey: true });
        assertSelectedRowsById(
            ['row-group-team-A', 'a2', 'row-group-team-B', 'b1', 'b2', 'row-group-team-C', 'c1'],
            api
        );

        actions.toggleCheckboxByIndex(2, { shiftKey: true, ctrlKey: true });
        assertSelectedRowsById(['row-group-team-A', 'a2', 'row-group-team-B', 'b1'], api);
    });

    test('expanding a group between SHIFT-clicks re-derives the range rather than reusing a stale one (groupSelects: "self")', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'a1', team: 'A', athlete: 'Alice' },
            { id: 'a2', team: 'A', athlete: 'Bob' },
            { id: 'a3', team: 'A', athlete: 'Carol' },
            { id: 'b1', team: 'B', athlete: 'Dave' },
            { id: 'b2', team: 'B', athlete: 'Erin' },
            { id: 'c1', team: 'C', athlete: 'Frank' },
            { id: 'c2', team: 'C', athlete: 'Grace' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'team', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Team' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);

        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B, 5 b1, 6 b2, 7 group-C, 8 c1, 9 c2
        actions.toggleCheckboxByIndex(1);
        assertSelectedRowsById(['a1'], api);

        await actions.collapseGroupRowByIndex(4, { count: 1 });
        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B (collapsed), 5 group-C, 6 c1, 7 c2

        actions.toggleCheckboxByIndex(6, { shiftKey: true });
        assertSelectedRowsById(['a1', 'a2', 'a3', 'row-group-team-B', 'row-group-team-C', 'c1'], api);

        await actions.expandGroupRowByIndex(4, { count: 1 });
        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B, 5 b1, 6 b2, 7 group-C, 8 c1, 9 c2

        actions.toggleCheckboxByIndex(8, { shiftKey: true });
        assertSelectedRowsById(['a1', 'a2', 'a3', 'row-group-team-B', 'b1', 'b2', 'row-group-team-C', 'c1'], api);
    });

    test('SHIFT-click on the same anchor group row selects its leaf descendants (groupSelects: "descendants")', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'a1', team: 'A', athlete: 'Alice' },
            { id: 'a2', team: 'A', athlete: 'Bob' },
            { id: 'a3', team: 'A', athlete: 'Carol' },
            { id: 'b1', team: 'B', athlete: 'Dave' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'team', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Team' },
            animateRows: false,
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);

        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B, 5 b1
        actions.toggleCheckboxByIndex(0);
        assertSelectedRowsById(['row-group-team-A', 'a1', 'a2', 'a3'], api);

        actions.toggleCheckboxByIndex(0);
        assertSelectedRowsById([], api);

        actions.toggleCheckboxByIndex(0, { shiftKey: true });
        assertSelectedRowsById(['row-group-team-A', 'a1', 'a2', 'a3'], api);
    });

    test('groupSelects: "descendants" ignores expansion state and still ranges over a collapsed group\'s full subtree', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'a1', team: 'A', athlete: 'Alice' },
            { id: 'a2', team: 'A', athlete: 'Bob' },
            { id: 'a3', team: 'A', athlete: 'Carol' },
            { id: 'b1', team: 'B', athlete: 'Dave' },
            { id: 'b2', team: 'B', athlete: 'Erin' },
            { id: 'c1', team: 'C', athlete: 'Frank' },
            { id: 'c2', team: 'C', athlete: 'Grace' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'team', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Team' },
            animateRows: false,
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });
        const actions = new GridActions(api);

        await waitForEvent('firstDataRendered', api);

        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B, 5 b1, 6 b2, 7 group-C, 8 c1, 9 c2
        await actions.collapseGroupRowByIndex(4, { count: 1 });
        // Rows displayed: 0 group-A, 1 a1, 2 a2, 3 a3, 4 group-B (collapsed), 5 group-C, 6 c1, 7 c2

        actions.toggleCheckboxByIndex(1);
        assertSelectedRowsById(['a1'], api);

        actions.toggleCheckboxByIndex(6, { shiftKey: true });
        assertSelectedRowsById(['row-group-team-A', 'a1', 'a2', 'a3', 'row-group-team-B', 'b1', 'b2', 'c1'], api);
    });

    test('a destroyed group total row still reports and forwards its group selection', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', gold: 2 },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', gold: 3 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowSelection: { mode: 'multiRow', groupSelects: 'self' },
            rowData,
            getRowId: (params) => params.data.id,
        });

        // captured before the destroy, which drops the group's own link to it
        const irelandTotal = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + 'row-group-country-Ireland')!;
        const ireland = api.getRowNode('row-group-country-Ireland')!;

        ireland.setSelected(true);
        expect(irelandTotal.isSelected()).toBe(true);

        api.setGridOption('groupTotalRow', undefined);
        expect(irelandTotal.destroyed).toBe(true);
        expect(irelandTotal.isSelected()).toBe(true);

        api.setNodesSelected({ nodes: [irelandTotal], newValue: false, source: 'api' });
        expect(ireland.isSelected()).toBe(false);
        expect(irelandTotal.isSelected()).toBe(false);
        assertSelectedRowsById([], api);

        // selecting through the stale handle reaches the live group too, exactly as deselecting does
        api.setNodesSelected({ nodes: [irelandTotal], newValue: true, source: 'api' });
        expect(ireland.isSelected()).toBe(true);
        expect(irelandTotal.isSelected()).toBe(true);
    });

    test('the grand total row keeps its own selection when a descendant is deselected', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', gold: 2 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            grandTotalRow: 'bottom',
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            rowData,
            getRowId: (params) => params.data.id,
        });

        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID)!;
        grandTotal.setSelected(true);
        expect(api.getRowNode('1')!.isSelected()).toBe(true);
        expect(grandTotal.isSelected()).toBe(true);

        // the root is excluded from the recompute from children, so its own selection stands
        api.setNodesSelected({ nodes: [api.getRowNode('2')!], newValue: false, source: 'api' });
        expect(api.getRowNode('row-group-country-Ireland')!.isSelected()).toBeUndefined();
        expect(grandTotal.isSelected()).toBe(true);
        assertSelectedRowsById(['1'], api);
    });

    test('deselecting the grand total row clears every descendant with it', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', gold: 2 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            grandTotalRow: 'bottom',
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'api' });
        assertSelectedRowsById(['1'], api);

        // the root's descendant sweep runs whether or not its own flag moves, so an already-unselected
        // grand total row still empties the selection. The server-side strategies match this.
        api.setNodesSelected({ nodes: [api.getRowNode(GRAND_TOTAL_ROW_ID)!], newValue: false, source: 'api' });
        assertSelectedRowsById([], api);
    });

    test('a group total row reports its group as partially selected rather than unselected', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', gold: 2 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            rowData,
            getRowId: (params) => params.data.id,
        });

        const ireland = api.getRowNode('row-group-country-Ireland')!;
        const irelandTotal = api.getRowNode(GROUP_TOTAL_ROW_ID_PREFIX + 'row-group-country-Ireland')!;

        api.setNodesSelected({ nodes: [api.getRowNode('1')!], newValue: true, source: 'api' });

        // one of two leaves selected, so the group is indeterminate and its total row must say the same
        expect(ireland.isSelected()).toBeUndefined();
        expect(irelandTotal.isSelected()).toBeUndefined();

        // neither the group nor its total row is a selected row in its own right
        assertSelectedRowsById(['1'], api);

        api.setNodesSelected({ nodes: [api.getRowNode('2')!], newValue: true, source: 'api' });
        expect(ireland.isSelected()).toBe(true);
        expect(irelandTotal.isSelected()).toBe(true);
    });
});
