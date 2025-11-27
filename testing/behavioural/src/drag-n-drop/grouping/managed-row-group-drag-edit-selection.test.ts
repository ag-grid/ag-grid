import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import {
    DRAG_NO_MOVE_INTERACTION_CASES,
    GridRows,
    RowDragDispatcher,
    TestGridsManager,
    asyncSetTimeout,
    clickRowSelectionCheckbox,
    getRowHtmlElement,
    getRowSelectionCheckboxState,
} from '../../test-utils';

describe.each(DRAG_NO_MOVE_INTERACTION_CASES)('drag groups selection flows noMove=%s evt=%s', (noMove, eventType) => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowDragModule,
            RowSelectionModule,
            RowGroupingModule,
            UndoRedoEditModule,
            BatchEditModule,
            TextEditorModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('emits cellEditRequest instead of mutating data when readOnlyEdit=true', async () => {
        const cellEditRequests: any[] = [];
        let commitOnEdit = false;
        const onCellEditRequest = (event: any) => {
            cellEditRequests.push(event);
            if (commitOnEdit) {
                const updatedData = {
                    ...event.node.data,
                    [event.column.getColId()]: event.newValue,
                };
                event.api.applyTransaction({ update: [updatedData] });
            }
        };
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'B', value: 'B1' },
            ],
            readOnlyEdit: true,
            rowDragManaged: true,
            suppressMoveWhenRowDragging: noMove,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
            onCellEditRequest,
        };

        const api = gridsManager.createGrid('row-group-edit-readonly', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF id:3 group:"B" value:"B1"
        `);

        const firstDrag = new RowDragDispatcher({ api, eventType });
        await firstDrag.start('2');
        await firstDrag.move('3', { yOffsetPercent: 0.1 });
        await firstDrag.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move attempt');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF id:3 group:"B" value:"B1"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('A');
        expect(cellEditRequests.length).toBe(1);
        const firstEvent = cellEditRequests[0];
        expect(firstEvent.column.getColId()).toBe('group');
        expect(firstEvent.oldValue).toBe('A');
        expect(firstEvent.newValue).toBe('B');

        commitOnEdit = true;

        gridRows = new GridRows(api, 'before committed move');
        const secondDrag = new RowDragDispatcher({ api, eventType });
        await secondDrag.start('2');
        await secondDrag.move('3', { yOffsetPercent: 0.1 });
        await secondDrag.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after committed move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 group:"B" value:"B1"
            · └── LEAF id:2 group:"B" value:"A2"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('B');
        expect(cellEditRequests.length).toBe(2);
        const secondEvent = cellEditRequests[1];
        expect(secondEvent.column.getColId()).toBe('group');
        expect(secondEvent.oldValue).toBe('A');
        expect(secondEvent.newValue).toBe('B');
    });

    test('moving a multi-row selection updates every row that moved', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'value', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'A', value: 'A3' },
                { id: '4', group: 'B', value: 'B1' },
                { id: '5', group: 'B', value: 'B2' },
            ],
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            rowDragMultiRow: true,
            suppressMoveWhenRowDragging: noMove,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-multi', gridOptions);

        api.setNodesSelected({
            nodes: [api.getRowNode('1')!, api.getRowNode('2')!],
            newValue: true,
        });

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF selected id:1 group:"A" value:"A1"
            │ ├── LEAF selected id:2 group:"A" value:"A2"
            │ └── LEAF id:3 group:"A" value:"A3"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:4 group:"B" value:"B1"
            · └── LEAF id:5 group:"B" value:"B2"
        `);

        const dispatcher = new RowDragDispatcher({ api, eventType });
        await dispatcher.start('1');
        await dispatcher.move('4', { yOffsetPercent: 0.8 });
        await dispatcher.finish();

        gridRows = new GridRows(api, 'after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:3 group:"A" value:"A3"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:4 group:"B" value:"B1"
            · ├── LEAF selected id:1 group:"B" value:"A1"
            · ├── LEAF selected id:2 group:"B" value:"A2"
            · └── LEAF id:5 group:"B" value:"B2"
        `);

        expect(api.getRowNode('1')?.data.group).toBe('B');
        expect(api.getRowNode('2')?.data.group).toBe('B');
    });

    test('multi-row drag between nested groups moves two selected row to the target group', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, editable: true, hide: true },
                { field: 'year', rowGroup: true, editable: true, hide: true },
                { field: 'athlete', rowDrag: true },
                { field: 'age' },
            ],
            autoGroupColumnDef: {
                headerName: 'Athletes',
                rowDrag: true,
                minWidth: 180,
            },
            rowData: [
                { id: 'r-1', country: 'EMEA', year: '2020', athlete: 'Alice', age: 23 },
                { id: 'r-2', country: 'EMEA', year: '2020', athlete: 'Bob', age: 24 },
                { id: 'r-6', country: 'EMEA', year: '2020', athlete: 'Frank', age: 27 },
                { id: 'r-3', country: 'EMEA', year: '2021', athlete: 'Carol', age: 25 },
                { id: 'r-4', country: 'EMEA', year: '2022', athlete: 'Dan', age: 22 },
                { id: 'r-5', country: 'EMEA', year: '2022', athlete: 'Eve', age: 26 },
            ],
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            rowDragMultiRow: true,
            suppressMoveWhenRowDragging: noMove,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            animateRows: true,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-multi-two-level', gridOptions);

        let gridRows = new GridRows(api, 'before checkbox selection');

        await clickRowSelectionCheckbox(api, ['r-1', 'r-2']);

        await asyncSetTimeout(0);

        expect(getRowSelectionCheckboxState(api, 'r-1')).toBe(true);
        expect(getRowSelectionCheckboxState(api, 'r-2')).toBe(true);

        gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-EMEA ag-Grid-AutoColumn:"EMEA"
            · ├─┬ LEAF_GROUP id:row-group-country-EMEA-year-2020 ag-Grid-AutoColumn:"2020"
            · │ ├── LEAF selected id:r-1 country:"EMEA" year:"2020" athlete:"Alice" age:23
            · │ ├── LEAF selected id:r-2 country:"EMEA" year:"2020" athlete:"Bob" age:24
            · │ └── LEAF id:r-6 country:"EMEA" year:"2020" athlete:"Frank" age:27
            · ├─┬ LEAF_GROUP id:row-group-country-EMEA-year-2021 ag-Grid-AutoColumn:"2021"
            · │ └── LEAF id:r-3 country:"EMEA" year:"2021" athlete:"Carol" age:25
            · └─┬ LEAF_GROUP id:row-group-country-EMEA-year-2022 ag-Grid-AutoColumn:"2022"
            · · ├── LEAF id:r-4 country:"EMEA" year:"2022" athlete:"Dan" age:22
            · · └── LEAF id:r-5 country:"EMEA" year:"2022" athlete:"Eve" age:26
        `);

        const dispatcher = new RowDragDispatcher({ api, eventType });
        await dispatcher.start('r-1');
        await dispatcher.move('r-4', { yOffsetPercent: 0.7 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-EMEA ag-Grid-AutoColumn:"EMEA"
            · ├─┬ LEAF_GROUP id:row-group-country-EMEA-year-2020 ag-Grid-AutoColumn:"2020"
            · │ └── LEAF id:r-6 country:"EMEA" year:"2020" athlete:"Frank" age:27
            · ├─┬ LEAF_GROUP id:row-group-country-EMEA-year-2021 ag-Grid-AutoColumn:"2021"
            · │ └── LEAF id:r-3 country:"EMEA" year:"2021" athlete:"Carol" age:25
            · └─┬ LEAF_GROUP id:row-group-country-EMEA-year-2022 ag-Grid-AutoColumn:"2022"
            · · ├── LEAF id:r-4 country:"EMEA" year:"2022" athlete:"Dan" age:22
            · · ├── LEAF selected id:r-1 country:"EMEA" year:"2022" athlete:"Alice" age:23
            · · ├── LEAF selected id:r-2 country:"EMEA" year:"2022" athlete:"Bob" age:24
            · · └── LEAF id:r-5 country:"EMEA" year:"2022" athlete:"Eve" age:26
        `);

        expect(api.getRowNode('r-1')?.data.country).toBe('EMEA');
        expect(api.getRowNode('r-2')?.data.country).toBe('EMEA');
        expect(api.getRowNode('r-1')?.data.year).toBe('2022');
        expect(api.getRowNode('r-2')?.data.year).toBe('2022');
        expect(api.getRowNode('r-6')?.data.year).toBe('2020');

        expect(getRowSelectionCheckboxState(api, 'r-1')).toBe(true);
        expect(getRowSelectionCheckboxState(api, 'r-2')).toBe(true);
    });

    test('multi-selection with groups moves all descendants to the drop target', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'level1', rowGroup: true, hide: true },
                { field: 'level2', rowGroup: true, hide: true },
                { field: 'value', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Levels' },
            rowData: [
                { id: 'a1', level1: 'Alpha', level2: 'One', value: 'Alpha-1' },
                { id: 'a2', level1: 'Alpha', level2: 'Two', value: 'Alpha-2' },
                { id: 'b1', level1: 'Beta', level2: 'Three', value: 'Beta-1' },
                { id: 'b2', level1: 'Beta', level2: 'Four', value: 'Beta-2' },
                { id: 'c1', level1: 'Gamma', level2: 'Five', value: 'Gamma-1' },
            ],
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            rowDragMultiRow: true,
            suppressMoveWhenRowDragging: noMove,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('row-group-edit-group-multi', gridOptions);

        let groupAlpha: any;
        let leafAlpha: any;
        let leafBeta: any;
        api.forEachNode((node) => {
            if (node.group && node.level === 0 && node.key === 'Alpha') {
                groupAlpha = node;
            } else if (!node.group && node.data?.id === 'a1') {
                leafAlpha = node;
            } else if (!node.group && node.data?.id === 'b2') {
                leafBeta = node;
            }
        });

        expect(groupAlpha).toBeTruthy();
        expect(leafAlpha).toBeTruthy();
        expect(leafBeta).toBeTruthy();

        api.setNodesSelected({
            nodes: [groupAlpha, leafAlpha, leafBeta],
            newValue: true,
        });

        await asyncSetTimeout(0);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler selected id:row-group-level1-Alpha ag-Grid-AutoColumn:"Alpha"
            │ ├─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-One ag-Grid-AutoColumn:"One"
            │ │ └── LEAF selected id:a1 level1:"Alpha" level2:"One" value:"Alpha-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Alpha-level2-Two ag-Grid-AutoColumn:"Two"
            │ · └── LEAF id:a2 level1:"Alpha" level2:"Two" value:"Alpha-2"
            ├─┬ filler id:row-group-level1-Beta ag-Grid-AutoColumn:"Beta"
            │ ├─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three ag-Grid-AutoColumn:"Three"
            │ │ └── LEAF id:b1 level1:"Beta" level2:"Three" value:"Beta-1"
            │ └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Four ag-Grid-AutoColumn:"Four"
            │ · └── LEAF selected id:b2 level1:"Beta" level2:"Four" value:"Beta-2"
            └─┬ filler id:row-group-level1-Gamma ag-Grid-AutoColumn:"Gamma"
            · └─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Five ag-Grid-AutoColumn:"Five"
            · · └── LEAF id:c1 level1:"Gamma" level2:"Five" value:"Gamma-1"
        `);

        const alphaGroupEl = getRowHtmlElement(api, 'row-group-level1-Alpha');
        const gammaGroupEl = getRowHtmlElement(api, 'row-group-level1-Gamma');
        expect(alphaGroupEl).toBeTruthy();
        expect(gammaGroupEl).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api, eventType });
        await dispatcher.start('a1');
        await dispatcher.move('row-group-level1-Gamma', { yOffsetPercent: 0.5 });
        await dispatcher.finish();

        expect(dispatcher.rowDragCancelEvents?.length).toBe(0);
        const draggedIds = dispatcher.rowDragEndEvents[0]?.nodes?.map((node) => node.id) ?? [];
        expect(draggedIds.length).toBeGreaterThan(0);
        expect(draggedIds).toContain('row-group-level1-Alpha');

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-level1-Beta ag-Grid-AutoColumn:"Beta"
            │ └─┬ LEAF_GROUP id:row-group-level1-Beta-level2-Three ag-Grid-AutoColumn:"Three"
            │ · └── LEAF id:b1 level1:"Beta" level2:"Three" value:"Beta-1"
            └─┬ filler id:row-group-level1-Gamma ag-Grid-AutoColumn:"Gamma"
            · ├─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Five ag-Grid-AutoColumn:"Five"
            · │ └── LEAF id:c1 level1:"Gamma" level2:"Five" value:"Gamma-1"
            · ├─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-One ag-Grid-AutoColumn:"One"
            · │ └── LEAF selected id:a1 level1:"Gamma" level2:"One" value:"Alpha-1"
            · ├─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Two ag-Grid-AutoColumn:"Two"
            · │ └── LEAF id:a2 level1:"Gamma" level2:"Two" value:"Alpha-2"
            · └─┬ LEAF_GROUP id:row-group-level1-Gamma-level2-Four ag-Grid-AutoColumn:"Four"
            · · └── LEAF selected id:b2 level1:"Gamma" level2:"Four" value:"Beta-2"
        `);

        expect(api.getRowNode('a1')?.data.level1).toBe('Gamma');
        expect(api.getRowNode('a2')?.data.level1).toBe('Gamma');
        expect(api.getRowNode('b2')?.data.level1).toBe('Gamma');
        expect(api.getRowNode('b1')?.data.level1).toBe('Beta');
    });
});
