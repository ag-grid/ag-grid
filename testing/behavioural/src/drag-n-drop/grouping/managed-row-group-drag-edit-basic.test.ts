import { waitFor } from '@testing-library/dom';
import type { MockInstance } from 'vitest';

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

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout } from '../../test-utils';

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

describe('ag-grid row drag configuration warnings', () => {
    const gridsManager = createGridManager();
    let consoleWarnSpy: MockInstance | undefined;

    beforeEach(() => {
        gridsManager.reset();
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
        consoleWarnSpy = undefined;
    });

    const wasWarn295Raised = () => !!consoleWarnSpy?.mock.calls.some(([s]) => s?.includes?.('#295'));

    test('logs warning when grouping managed drag and drop without refreshAfterGroupEdit', async () => {
        await gridsManager.createGridAndWait('warn-295-grid', {
            columnDefs: [{ field: 'category', hide: true, rowGroup: true }, { field: 'value' }],
            autoGroupColumnDef: { field: 'category', rowDrag: true },
            rowData: [{ id: 'a', category: 'A', value: 1 }],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(5);
        expect(wasWarn295Raised()).toBeTruthy();
    });

    test('logs warning when grouping is enabled after initial load', async () => {
        const api = await gridsManager.createGridAndWait('warn-295-dynamic-grouping', {
            columnDefs: [{ field: 'category', hide: true }, { field: 'value' }],
            autoGroupColumnDef: { field: 'category', rowDrag: true },
            rowData: [{ id: 'a', category: 'A', value: 1 }],
            rowDragManaged: true,
            getRowId: (params) => params.data.id,
        });

        expect(wasWarn295Raised()).toBeFalsy();

        api.setRowGroupColumns(['category']);
        await asyncSetTimeout(5);

        expect(wasWarn295Raised()).toBeTruthy();
    });

    test('logs warning when rowDragManaged is enabled after initial load', async () => {
        const api = await gridsManager.createGridAndWait('warn-295-dynamic-row-drag', {
            columnDefs: [{ field: 'category', hide: true, rowGroup: true }, { field: 'value' }],
            autoGroupColumnDef: { field: 'category', rowDrag: true },
            rowData: [{ id: 'a', category: 'A', value: 1 }],
            rowDragManaged: false,
            getRowId: (params) => params.data.id,
        });

        expect(wasWarn295Raised()).toBeFalsy();

        api.setGridOption('rowDragManaged', true);
        await asyncSetTimeout(5);

        expect(wasWarn295Raised()).toBeTruthy();
    });

    test('refreshAfterGroupEdit=false blocks cross-group moves', async () => {
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
            suppressMoveWhenRowDragging: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridsManager.createGridAndWait('row-group-reorder', gridOptions);

        const initialRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await dispatcher.move('3', { yOffsetPercent: 0.1 });
        await dispatcher.finish();

        const finalRows = new GridRows(api, 'final', { checkDom: true, columns: ['value'] });
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('A');
        expect(dispatcher.rowDragEndEvents[0]?.rowsDrop?.allowed ?? false).toBe(false);

        await asyncSetTimeout(3);

        expect(wasWarn295Raised()).toBeTruthy();
    });
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

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            ├─┬ LEAF_GROUP id:row-group-group-B
            │ ├── LEAF id:3 value:"B1"
            │ └── LEAF id:4 value:"B2"
            └─┬ LEAF_GROUP id:row-group-group-C
            · ├── LEAF id:5 value:"C1"
            · └── LEAF id:6 value:"C2"
        `);

        const intermediate = `
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            ├─┬ LEAF_GROUP id:row-group-group-B
            │ ├── LEAF id:3 value:"B1"
            │ ├── LEAF id:4 value:"B2"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-C
            · ├── LEAF id:5 value:"C1"
            · └── LEAF id:6 value:"C2"
        `;

        const intermediateStep = async () => {
            await asyncSetTimeout(0);
            const rowDragMoveEvents = dispatcher.rowDragMoveEvents;
            expect(rowDragMoveEvents.some((event) => event.rowsDrop?.newParent?.id === 'row-group-group-B')).toBe(true);
            const latestRowsDrop = rowDragMoveEvents[rowDragMoveEvents.length - 1]?.rowsDrop;
            expect(latestRowsDrop?.allowed).toBe(true);
            expect(latestRowsDrop?.moved).toBe(true);
            await waitFor(async () => {
                const intermediateRows = new GridRows(api, 'after intermediate step', {
                    checkDom: true,
                    columns: ['value'],
                });
                await intermediateRows.check(intermediate);
                const draggedRowElement = intermediateRows.getRowHtmlElement('2');
                expect(draggedRowElement).not.toBeNull();
                expect(draggedRowElement?.classList.contains('ag-row-dragging')).toBe(true);
            });
        };

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('2');
        await dispatcher.move('3', { yOffsetPercent: 0.4 });
        await intermediateStep();
        await dispatcher.move('6', { yOffsetPercent: 0.9 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            ├─┬ LEAF_GROUP id:row-group-group-B
            │ ├── LEAF id:3 value:"B1"
            │ └── LEAF id:4 value:"B2"
            └─┬ LEAF_GROUP id:row-group-group-C
            · ├── LEAF id:5 value:"C1"
            · ├── LEAF id:6 value:"C2"
            · └── LEAF id:2 value:"A2"
        `);

        expect(api.getRowNode('2')?.data.group).toBe('C');
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

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(gridRows.getRowHtmlElement('2')!);
        await dispatcher.move(gridRows.getRowHtmlElement('3')!, { yOffsetPercent: 0.1 });
        await dispatcher.finish();

        gridRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:3 value:"B1"
            · └── LEAF id:2 value:"A2"
        `);
        expect(api.getRowNode('2')?.data.group).toBe('B');
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

        let gridRows = new GridRows(api, 'initial', { checkDom: true, columns: ['city'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France
            │ │ ├── LEAF id:1 city:"Paris"
            │ │ └── LEAF id:2 city:"Lyon"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany
            │ · └── LEAF id:3 city:"Berlin"
            └─┬ filler id:row-group-continent-Asia
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan
            · · └── LEAF id:4 city:"Tokyo"
        `);

        const firstDrag = new RowDragDispatcher({ api });
        await firstDrag.start(gridRows.getRowHtmlElement('2')!);
        await firstDrag.move(gridRows.getRowHtmlElement('3')!, { yOffsetPercent: 0.1 });
        await firstDrag.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move within continent', { checkDom: true, columns: ['city'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France
            │ │ └── LEAF id:1 city:"Paris"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany
            │ · ├── LEAF id:3 city:"Berlin"
            │ · └── LEAF id:2 city:"Lyon"
            └─┬ filler id:row-group-continent-Asia
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan
            · · └── LEAF id:4 city:"Tokyo"
        `);

        let movedRow = api.getRowNode('2');
        expect(movedRow?.data.country).toBe('Germany');
        expect(movedRow?.data.continent).toBe('Europe');
        expect(movedRow?.parent?.key).toBe('Germany');
        expect(movedRow?.parent?.parent?.key).toBe('Europe');

        const secondDrag = new RowDragDispatcher({ api });
        await secondDrag.start(gridRows.getRowHtmlElement('2')!);
        await secondDrag.move(gridRows.getRowHtmlElement('4')!, { yOffsetPercent: 0.1 });
        await secondDrag.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after move across continents', { checkDom: true, columns: ['city'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-continent-Europe
            │ ├─┬ LEAF_GROUP id:row-group-continent-Europe-country-France
            │ │ └── LEAF id:1 city:"Paris"
            │ └─┬ LEAF_GROUP id:row-group-continent-Europe-country-Germany
            │ · └── LEAF id:3 city:"Berlin"
            └─┬ filler id:row-group-continent-Asia
            · └─┬ LEAF_GROUP id:row-group-continent-Asia-country-Japan
            · · ├── LEAF id:2 city:"Lyon"
            · · └── LEAF id:4 city:"Tokyo"
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

        const initialRows = new GridRows(api, 'initial', { checkDom: true, columns: ['value'] });
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ ├── LEAF id:1 value:"A1"
            │ └── LEAF id:2 value:"A2"
            └─┬ LEAF_GROUP id:row-group-group-B
            · └── LEAF id:3 value:"B1"
        `);

        modelUpdatedEvents.length = 0;

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(initialRows.getRowHtmlElement('2')!);
        await dispatcher.move(initialRows.getRowHtmlElement('3')!, { yOffsetPercent: 0.1 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        const finalRows = new GridRows(api, 'after move', { checkDom: true, columns: ['value'] });
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-A
            │ └── LEAF id:1 value:"A1"
            └─┬ LEAF_GROUP id:row-group-group-B
            · ├── LEAF id:3 value:"B1"
            · └── LEAF id:2 value:"A2"
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
