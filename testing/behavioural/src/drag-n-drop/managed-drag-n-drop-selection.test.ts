import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import {
    DRAG_NO_MOVE_INTERACTION_CASES,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    dragAndDropRow,
} from '../test-utils';

describe.each(DRAG_NO_MOVE_INTERACTION_CASES)('managed drag selection noMove=%s evt=%s', (noMove, eventType) => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('dragging contiguous selection moves every selected row', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData: [
                { id: '1', value: 'A' },
                { id: '2', value: 'B' },
                { id: '3', value: 'C' },
                { id: '4', value: 'D' },
                { id: '5', value: 'E' },
            ],
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            rowDragMultiRow: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const api = gridsManager.createGrid('managed-selection-contiguous', gridOptions);
        let gridRows = new GridRows(api, 'initial contiguous', { checkDom: true, columns: ['value'] });

        await gridRows.clickRowSelectionCheckbox(['2', '3', '4']);

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'contiguous selected', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:"A"
            ├── LEAF selected id:2 value:"B"
            ├── LEAF selected id:3 value:"C"
            ├── LEAF selected id:4 value:"D"
            └── LEAF id:5 value:"E"
        `);

        const dragResult = await dragAndDropRow({
            api,
            source: gridRows.getRowHtmlElement('2')!,
            target: gridRows.getRowHtmlElement('5')!,
            targetYOffsetPercent: 0.7,
            eventType,
        });

        expect(dragResult.error).toBeNull();
        expect(dragResult.rowDragEndEvents.length).toBeGreaterThan(0);

        await asyncSetTimeout(0);

        await new GridRows(api, 'contiguous moved', { checkDom: true, columns: ['value'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:"A"
            ├── LEAF id:5 value:"E"
            ├── LEAF selected id:2 value:"B"
            ├── LEAF selected id:3 value:"C"
            └── LEAF selected id:4 value:"D"
        `);
    });

    test('dragging non-contiguous selection keeps gaps intact', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value', rowDrag: true }],
            rowData: [
                { id: '1', value: 'A' },
                { id: '2', value: 'B' },
                { id: '3', value: 'C' },
                { id: '4', value: 'D' },
                { id: '5', value: 'E' },
                { id: '6', value: 'F' },
            ],
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            rowDragMultiRow: true,
            getRowId: (params) => params.data.id,
            suppressMoveWhenRowDragging: noMove,
        };

        const api = gridsManager.createGrid('managed-selection-non-contiguous', gridOptions);
        let gridRows = new GridRows(api, 'initial non contiguous', { checkDom: true, columns: ['value'] });

        await gridRows.clickRowSelectionCheckbox(['1', '3', '5']);

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'non contiguous selected', { checkDom: true, columns: ['value'] });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF selected id:1 value:"A"
            ├── LEAF id:2 value:"B"
            ├── LEAF selected id:3 value:"C"
            ├── LEAF id:4 value:"D"
            ├── LEAF selected id:5 value:"E"
            └── LEAF id:6 value:"F"
        `);

        const dragResult = await dragAndDropRow({
            api,
            source: gridRows.getRowHtmlElement('3')!,
            target: gridRows.getRowHtmlElement('6')!,
            targetYOffsetPercent: 0.7,
            eventType,
        });

        expect(dragResult.error).toBeNull();
        expect(dragResult.rowDragEndEvents.length).toBeGreaterThan(0);

        await asyncSetTimeout(0);

        await new GridRows(api, 'non contiguous moved', { checkDom: true, columns: ['value'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 value:"B"
            ├── LEAF id:4 value:"D"
            ├── LEAF id:6 value:"F"
            ├── LEAF selected id:1 value:"A"
            ├── LEAF selected id:3 value:"C"
            └── LEAF selected id:5 value:"E"
        `);
    });
});
