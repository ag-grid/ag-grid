import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, dragAndDropRow } from '../../test-utils';

describe.each([false, true])(
    'managed row drag with refreshAfterGroupEdit basics (suppressMoveWhenRowDragging=%s)',
    (suppressMoveWhenRowDragging) => {
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

            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('2')!,
                target: gridRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

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

            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('2')!,
                target: gridRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

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

            await dragAndDropRow({
                api,
                source: gridRows.getRowHtmlElement('2')!,
                target: gridRows.getRowHtmlElement('4')!,
                targetYOffsetPercent: 0.1,
            });

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

            await dragAndDropRow({
                api,
                source: initialRows.getRowHtmlElement('2')!,
                target: initialRows.getRowHtmlElement('3')!,
                targetYOffsetPercent: 0.1,
            });

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
    }
);
