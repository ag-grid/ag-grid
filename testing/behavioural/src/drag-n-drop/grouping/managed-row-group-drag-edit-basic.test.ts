import { waitFor } from '@testing-library/dom';

import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
    ValidationModule,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout, getRowHtmlElement } from '../../test-utils';

const createGridManager = () =>
    new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowDragModule,
            RowSelectionModule,
            RowGroupingModule,
            UndoRedoEditModule,
            BatchEditModule,
            TextEditorModule,
            ValidationModule,
        ],
    });

describe('drag refreshAfterGroupEdit multi-step interactions', () => {
    const gridsManager = createGridManager();

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('allows dragging a leaf across groups via intermediate hover when suppressMoveWhenRowDragging undefined', async () => {
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
                { id: '4', group: 'B', value: 'B2' },
                { id: '5', group: 'C', value: 'C1' },
                { id: '6', group: 'C', value: 'C2' },
            ],
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-multi-step', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            ├─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            │ ├── LEAF id:3 group:"B" value:"B1"
            │ └── LEAF id:4 group:"B" value:"B2"
            └─┬ LEAF_GROUP id:row-group-group-C ag-Grid-AutoColumn:"C"
            · ├── LEAF id:5 group:"C" value:"C1"
            · └── LEAF id:6 group:"C" value:"C2"
        `);

        const intermediateHoverLeaf = `
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            ├─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            │ ├── LEAF id:3 group:"B" value:"B1"
            │ ├── LEAF id:4 group:"B" value:"B2"
            │ └── LEAF id:2 group:"B" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-C ag-Grid-AutoColumn:"C"
            · ├── LEAF id:5 group:"C" value:"C1"
            · └── LEAF id:6 group:"C" value:"C2"
        `;

        const assertIntermediateStep = async (expectedParentId: string, snapshot: string, label: string) => {
            await asyncSetTimeout(0);
            const rowDragMoveEvents = dispatcher.rowDragMoveEvents;
            expect(rowDragMoveEvents.some((event) => event.rowsDrop?.newParent?.id === expectedParentId)).toBe(true);
            const latestRowsDrop = rowDragMoveEvents[rowDragMoveEvents.length - 1]?.rowsDrop;
            expect(latestRowsDrop?.allowed).toBe(true);
            expect(latestRowsDrop?.moved).toBe(true);
            await waitFor(async () => {
                const intermediateRows = new GridRows(api, label);
                await intermediateRows.check(snapshot);
                const draggedRowElement = getRowHtmlElement(api, '2');
                expect(draggedRowElement).not.toBeNull();
                expect(draggedRowElement?.classList.contains('ag-row-dragging')).toBe(true);
            });
        };

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('A2'));
        await dispatcher.move('3', { yOffsetPercent: 0.4 });
        await assertIntermediateStep('row-group-group-B', intermediateHoverLeaf, 'after hover over group B leaf');
        await dispatcher.move('row-group-group-C', { center: true });
        await assertIntermediateStep('row-group-group-C', intermediateHoverLeaf, 'after hover over group C group node');
        await dispatcher.move('6', { yOffsetPercent: 0.9 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            ├─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            │ ├── LEAF id:3 group:"B" value:"B1"
            │ └── LEAF id:4 group:"B" value:"B2"
            └─┬ LEAF_GROUP id:row-group-group-C ag-Grid-AutoColumn:"C"
            · ├── LEAF id:5 group:"C" value:"C1"
            · ├── LEAF id:6 group:"C" value:"C2"
            · └── LEAF id:2 group:"C" value:"A2"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('C');
    });

    test('dragging a year group across multiple sibling years ends in the hovered year even after touching others', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'continent', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'city' },
            ],
            autoGroupColumnDef: { headerName: 'Region', rowDrag: true },
            rowData: [
                { id: '1', continent: 'Europe', country: 'France', year: '2020', city: 'Paris' },
                { id: '2', continent: 'Europe', country: 'France', year: '2020', city: 'Lyon' },
                { id: '3', continent: 'Europe', country: 'France', year: '2021', city: 'Nice' },
                { id: '4', continent: 'Europe', country: 'France', year: '2022', city: 'Marseille' },
                { id: '5', continent: 'Europe', country: 'France', year: '2022', city: 'Bordeaux' },
                { id: '6', continent: 'Europe', country: 'Germany', year: '2020', city: 'Berlin' },
                { id: '7', continent: 'Europe', country: 'Germany', year: '2021', city: 'Munich' },
            ],
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
            suppressMoveWhenRowDragging: true,
            isRowValidDropPosition: () => true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-year-multi-hop', gridOptions);

        let gridRows = new GridRows(api, 'initial years');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ filler id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France-year-2020 ag-Grid-AutoColumn:"2020"
            · │ │ ├── LEAF id:1 continent:"Europe" country:"France" year:"2020" city:"Paris"
            · │ │ └── LEAF id:2 continent:"Europe" country:"France" year:"2020" city:"Lyon"
            · │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · │ │ └── LEAF id:3 continent:"Europe" country:"France" year:"2021" city:"Nice"
            · │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-France-year-2022 ag-Grid-AutoColumn:"2022"
            · │ · ├── LEAF id:4 continent:"Europe" country:"France" year:"2022" city:"Marseille"
            · │ · └── LEAF id:5 continent:"Europe" country:"France" year:"2022" city:"Bordeaux"
            · └─┬ filler id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · · ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany-year-2020 ag-Grid-AutoColumn:"2020"
            · · │ └── LEAF id:6 continent:"Europe" country:"Germany" year:"2020" city:"Berlin"
            · · └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany-year-2021 ag-Grid-AutoColumn:"2021"
            · · · └── LEAF id:7 continent:"Europe" country:"Germany" year:"2021" city:"Munich"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('row-group-continent-Europe-country-France-year-2020');
        await dispatcher.move('row-group-continent-Europe-country-France-year-2021', { center: true });
        await dispatcher.move('row-group-continent-Europe-country-France-year-2022', { center: true });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'years after multi-hop drag');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ filler id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · │ │ └── LEAF id:3 continent:"Europe" country:"France" year:"2021" city:"Nice"
            · │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-France-year-2022 ag-Grid-AutoColumn:"2022"
            · │ · ├── LEAF id:1 continent:"Europe" country:"France" year:"2022" city:"Paris"
            · │ · ├── LEAF id:2 continent:"Europe" country:"France" year:"2022" city:"Lyon"
            · │ · ├── LEAF id:4 continent:"Europe" country:"France" year:"2022" city:"Marseille"
            · │ · └── LEAF id:5 continent:"Europe" country:"France" year:"2022" city:"Bordeaux"
            · └─┬ filler id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · · ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany-year-2020 ag-Grid-AutoColumn:"2020"
            · · │ └── LEAF id:6 continent:"Europe" country:"Germany" year:"2020" city:"Berlin"
            · · └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany-year-2021 ag-Grid-AutoColumn:"2021"
            · · · └── LEAF id:7 continent:"Europe" country:"Germany" year:"2021" city:"Munich"
        `);

        const movedParis = api.getRowNode('1');
        expect(movedParis?.data.year).toBe('2022');
        const lastMoveEvent = dispatcher.rowDragMoveEvents[dispatcher.rowDragMoveEvents.length - 1];
        expect(lastMoveEvent?.rowsDrop?.newParent?.id).toBe('row-group-continent-Europe-country-France-year-2022');
        expect(dispatcher.rowDragEndEvents[0]?.rowsDrop?.newParent?.id).toBe(
            'row-group-continent-Europe-country-France-year-2022'
        );
    });

    test('allows dragging an entire group across continents even when the source group disappears mid-drag', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'continent', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city' },
            ],
            autoGroupColumnDef: { headerName: 'Region', rowDrag: true },
            rowData: [
                { id: '1', continent: 'Europe', country: 'France', city: 'Paris' },
                { id: '2', continent: 'Europe', country: 'France', city: 'Lyon' },
                { id: '3', continent: 'Europe', country: 'Germany', city: 'Berlin' },
                { id: '4', continent: 'Asia', country: 'Japan', city: 'Tokyo' },
            ],
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-group-drag', gridOptions);

        let gridRows = new GridRows(api, 'initial groups');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            │ │ ├── LEAF id:1 continent:"Europe" country:"France" city:"Paris"
            │ │ └── LEAF id:2 continent:"Europe" country:"France" city:"Lyon"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ · └── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · └── LEAF id:4 continent:"Asia" country:"Japan" city:"Tokyo"
        `);

        expect(getRowHtmlElement(api, 'row-group-continent-Europe-country-France')).toBeTruthy();
        expect(getRowHtmlElement(api, 'row-group-continent-Asia-country-Japan')).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('row-group-continent-Europe-country-France');
        await dispatcher.move('row-group-continent-Europe-country-Germany', { yOffsetPercent: 0.4 });
        await dispatcher.move('row-group-continent-Asia', { center: true });
        await dispatcher.move('row-group-continent-Asia-country-Japan', { yOffsetPercent: 0.85 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'groups after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ · └── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · ├── LEAF id:4 continent:"Asia" country:"Japan" city:"Tokyo"
            · · ├── LEAF id:1 continent:"Asia" country:"Japan" city:"Paris"
            · · └── LEAF id:2 continent:"Asia" country:"Japan" city:"Lyon"
        `);

        const movedParis = api.getRowNode('1');
        expect(movedParis?.data.continent).toBe('Asia');
        expect(movedParis?.data.country).toBe('Japan');
        expect(movedParis?.parent?.key).toBe('Japan');
        expect(movedParis?.parent?.parent?.key).toBe('Asia');
        expect(dispatcher.rowDragMoveEvents.length).toBeGreaterThanOrEqual(2);
        const lastMoveEvent = dispatcher.rowDragMoveEvents[dispatcher.rowDragMoveEvents.length - 1];
        expect(lastMoveEvent?.rowsDrop?.newParent?.id).toBe('row-group-continent-Asia-country-Japan');
        expect(dispatcher.rowDragEndEvents[0]?.rowsDrop?.newParent?.id).toBe('row-group-continent-Asia-country-Japan');
    });

    test('dragging a group across multiple same-level groups ends in the final hovered group', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'continent', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city' },
            ],
            autoGroupColumnDef: { headerName: 'Region', rowDrag: true },
            rowData: [
                { id: '1', continent: 'Europe', country: 'France', city: 'Paris' },
                { id: '2', continent: 'Europe', country: 'France', city: 'Lyon' },
                { id: '3', continent: 'Europe', country: 'Germany', city: 'Berlin' },
                { id: '4', continent: 'Europe', country: 'Spain', city: 'Madrid' },
                { id: '5', continent: 'Europe', country: 'Spain', city: 'Barcelona' },
                { id: '6', continent: 'Asia', country: 'Japan', city: 'Tokyo' },
            ],
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
            suppressMoveWhenRowDragging: true,
            isRowValidDropPosition: () => true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-group-multi-hop', gridOptions);

        let gridRows = new GridRows(api, 'initial same-level groups');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            │ │ ├── LEAF id:1 continent:"Europe" country:"France" city:"Paris"
            │ │ └── LEAF id:2 continent:"Europe" country:"France" city:"Lyon"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ │ └── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Spain ag-Grid-AutoColumn:"Spain"
            │ · ├── LEAF id:4 continent:"Europe" country:"Spain" city:"Madrid"
            │ · └── LEAF id:5 continent:"Europe" country:"Spain" city:"Barcelona"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · └── LEAF id:6 continent:"Asia" country:"Japan" city:"Tokyo"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('row-group-continent-Europe-country-France');
        await dispatcher.move('row-group-continent-Europe-country-Germany', { center: true });
        await dispatcher.move('row-group-continent-Europe-country-Spain', { center: true });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'same-level groups after multi-hop drag');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ │ └── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Spain ag-Grid-AutoColumn:"Spain"
            │ · ├── LEAF id:1 continent:"Europe" country:"Spain" city:"Paris"
            │ · ├── LEAF id:2 continent:"Europe" country:"Spain" city:"Lyon"
            │ · ├── LEAF id:4 continent:"Europe" country:"Spain" city:"Madrid"
            │ · └── LEAF id:5 continent:"Europe" country:"Spain" city:"Barcelona"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · └── LEAF id:6 continent:"Asia" country:"Japan" city:"Tokyo"
        `);

        const movedParis = api.getRowNode('1');
        expect(movedParis?.data.continent).toBe('Europe');
        expect(movedParis?.data.country).toBe('Spain');
        expect(dispatcher.rowDragMoveEvents.length).toBeGreaterThanOrEqual(2);
        const lastMoveEvent = dispatcher.rowDragMoveEvents[dispatcher.rowDragMoveEvents.length - 1];
        expect(lastMoveEvent?.rowsDrop?.newParent?.id).toBe('row-group-continent-Europe-country-Spain');
        expect(dispatcher.rowDragEndEvents[0]?.rowsDrop?.newParent?.id).toBe(
            'row-group-continent-Europe-country-Spain'
        );
    });
});

describe.each([false, true])('drag refreshAfterGroupEdit basics (suppress move %s)', (suppressMoveWhenRowDragging) => {
    const gridsManager = createGridManager();

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('moves a row between groups and mutates the row data', async () => {
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
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-basic', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF id:3 group:"B" value:"B1"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await dispatcher.move('3', { yOffsetPercent: 0.1 });
        await dispatcher.finish();

        gridRows = new GridRows(api, 'after move');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 group:"B" value:"B1"
            · └── LEAF id:2 group:"B" value:"A2"
        `);
        expect(api.getRowNode('2')?.data.group).toBe('B');
    });

    test.each([0, -0.9, 0.9] as const)('moves a leaf in collapsed sibling group immediately y=%f', async (y) => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'continent', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Region' },
            rowData: [
                { id: '1', continent: 'Europe', country: 'France', city: 'Paris' },
                { id: '2', continent: 'Europe', country: 'France', city: 'Lyon' },
                { id: '3', continent: 'Europe', country: 'Germany', city: 'Berlin' },
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 0,
            rowDragInsertDelay: 10000,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-collapsed-target', gridOptions);

        api.forEachNode((node) => {
            if (!node.group) {
                return;
            }
            const colId = node.rowGroupColumn?.getId();
            if (colId === 'continent') {
                node.setExpanded(node.key === 'Europe', undefined, true);
            } else if (colId === 'country') {
                node.setExpanded(node.key === 'France', undefined, true);
            }
        });
        await asyncSetTimeout(0);

        let gridRows = new GridRows(api, 'initial collapsed target group');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├── LEAF id:1 continent:"Europe" country:"France" city:"Paris"
            · │ └── LEAF id:2 continent:"Europe" country:"France" city:"Lyon"
            · └─┬ LEAF_GROUP collapsed id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · · └── LEAF hidden id:3 continent:"Europe" country:"Germany" city:"Berlin"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('1');
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Paris'));
        await dispatcher.move('row-group-continent-Europe-country-Germany', { center: true, yOffsetPercent: y });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        const dropInfo = dispatcher.rowDragEndEvents[0]?.rowsDrop;
        expect(dropInfo?.allowed).toBe(true);
        expect(dropInfo?.newParent?.id).toBe('row-group-continent-Europe-country-Germany');

        gridRows = new GridRows(api, 'after dragging into collapsed group');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ └── LEAF id:2 continent:"Europe" country:"France" city:"Lyon"
            · └─┬ LEAF_GROUP collapsed id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · · ├── LEAF hidden id:1 continent:"Europe" country:"Germany" city:"Paris"
            · · └── LEAF hidden id:3 continent:"Europe" country:"Germany" city:"Berlin"
        `);

        const moved = api.getRowNode('1');
        expect(moved?.data.country).toBe('Germany');
        expect(moved?.parent?.key).toBe('Germany');
    });

    test('multi-level grouping updates each key when rows move between nested groups', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [
                { field: 'continent', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', rowDrag: true },
            ],
            autoGroupColumnDef: { headerName: 'Region' },
            rowData: [
                { id: '1', continent: 'Europe', country: 'France', city: 'Paris' },
                { id: '2', continent: 'Europe', country: 'France', city: 'Lyon' },
                { id: '3', continent: 'Europe', country: 'Germany', city: 'Berlin' },
                { id: '4', continent: 'Asia', country: 'Japan', city: 'Tokyo' },
            ],
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-multi-level', gridOptions);

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            │ │ ├── LEAF id:1 continent:"Europe" country:"France" city:"Paris"
            │ │ └── LEAF id:2 continent:"Europe" country:"France" city:"Lyon"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ · └── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · └── LEAF id:4 continent:"Asia" country:"Japan" city:"Tokyo"
        `);

        const firstDrag = new RowDragDispatcher({ api });
        await firstDrag.start('2');
        await firstDrag.move('3', { yOffsetPercent: 0.1 });
        await firstDrag.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move within continent');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            │ │ └── LEAF id:1 continent:"Europe" country:"France" city:"Paris"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ · ├── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            │ · └── LEAF id:2 continent:"Europe" country:"Germany" city:"Lyon"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · └── LEAF id:4 continent:"Asia" country:"Japan" city:"Tokyo"
        `);

        let movedRow = api.getRowNode('2');
        expect(movedRow?.data.country).toBe('Germany');
        expect(movedRow?.data.continent).toBe('Europe');
        expect(movedRow?.parent?.key).toBe('Germany');
        expect(movedRow?.parent?.parent?.key).toBe('Europe');

        const secondDrag = new RowDragDispatcher({ api });
        await secondDrag.start('2');
        await secondDrag.move('4', { yOffsetPercent: 0.1 });
        await secondDrag.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move across continents');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe ag-Grid-AutoColumn:"Europe"
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France ag-Grid-AutoColumn:"France"
            │ │ └── LEAF id:1 continent:"Europe" country:"France" city:"Paris"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            │ · └── LEAF id:3 continent:"Europe" country:"Germany" city:"Berlin"
            └─┬ filler id:row-group-continent-Asia ag-Grid-AutoColumn:"Asia"
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan ag-Grid-AutoColumn:"Japan"
            · · ├── LEAF id:2 continent:"Asia" country:"Japan" city:"Lyon"
            · · └── LEAF id:4 continent:"Asia" country:"Japan" city:"Tokyo"
        `);

        movedRow = api.getRowNode('2');
        expect(movedRow?.data.country).toBe('Japan');
        expect(movedRow?.data.continent).toBe('Asia');
        expect(movedRow?.parent?.key).toBe('Japan');
        expect(movedRow?.parent?.parent?.key).toBe('Asia');
    });

    test('managed row drag triggers a single model refresh', async () => {
        const modelUpdatedEvents: any[] = [];
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
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('row-group-edit-model-updates', gridOptions);
        const modelUpdatedListener = (event: any) => {
            modelUpdatedEvents.push(event);
        };
        api.addEventListener('modelUpdated', modelUpdatedListener);

        await asyncSetTimeout(0);

        const initialRows = new GridRows(api, 'initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:1 group:"A" value:"A1"
            │ └── LEAF id:2 group:"A" value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · └── LEAF id:3 group:"B" value:"B1"
        `);

        modelUpdatedEvents.length = 0;

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await dispatcher.move('3', { yOffsetPercent: 0.1 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        const finalRows = new GridRows(api, 'after move');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
            │ └── LEAF id:1 group:"A" value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B"
            · ├── LEAF id:3 group:"B" value:"B1"
            · └── LEAF id:2 group:"B" value:"A2"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('B');
        expect(modelUpdatedEvents.length).toBe(1);

        api.removeEventListener('modelUpdated', modelUpdatedListener);
    });

    test('newParent is exposed to validators and row drag events', async () => {
        const validatorParents: Array<string | null> = [];
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
            rowDragManaged: true,
            suppressMoveWhenRowDragging,
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
            isRowValidDropPosition: (rowsDrop) => {
                validatorParents.push(rowsDrop.newParent?.id ?? null);
                return true;
            },
        };

        const api = gridsManager.createGrid('row-group-edit-new-parent', gridOptions);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await dispatcher.move('3', { yOffsetPercent: 0.2 });
        await dispatcher.finish();

        expect(validatorParents).toContain('row-group-group-B');
        expect(
            dispatcher.rowDragMoveEvents.some((event) => event.rowsDrop?.newParent?.id === 'row-group-group-B')
        ).toBe(true);
        expect(dispatcher.rowDragEndEvents[0].rowsDrop?.newParent?.id).toBe('row-group-group-B');
    });
});
