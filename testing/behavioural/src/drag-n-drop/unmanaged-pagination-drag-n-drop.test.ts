import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions, RowDragMoveEvent } from 'ag-grid-community';
import { PaginationModule } from 'ag-grid-enterprise';

import { TestGridsManager, dragAndDropRow } from '../test-utils';

describe('ag-grid unmanaged drag and drop with pagination', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const generateRowData = () => {
        const rowData: { id: string; name: string }[] = [];
        for (let i = 0; i < 45; i++) {
            rowData.push({ id: `${i}`, name: `row${i}` });
        }
        return rowData;
    };

    test('correct overNode and overIndex in page 1', async () => {
        const columnDefs = [{ field: 'name', rowDrag: true }, { field: 'id' }];

        const rowDragMoveEvents: RowDragMoveEvent[] = [];

        const gridOptions: GridOptions = {
            columnDefs,
            rowData: generateRowData(),
            paginationPageSize: 20,
            pagination: true,
            animateRows: true,

            onRowDragMove: (event) => {
                rowDragMoveEvents.push(event);
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const rows = api.getRenderedNodes();
        expect(rows.length).toBe(20);

        await dragAndDropRow({ api, source: '4', target: '7' });

        const lastEvent = rowDragMoveEvents[rowDragMoveEvents.length - 1];
        expect(lastEvent).toBeTruthy();

        expect(lastEvent.node?.id).toBe('4');
        expect(lastEvent.nodes.length).toBe(1);
        expect(lastEvent.nodes[0].id).toBe('4');

        expect(lastEvent.overNode?.id).toBe('7');
        expect(lastEvent.overIndex).toBe(7);
    });

    test('correct overNode and overIndex in page 2', async () => {
        const columnDefs = [{ field: 'name', rowDrag: true }, { field: 'id' }];

        const rowDragMoveEvents: RowDragMoveEvent[] = [];

        const gridOptions: GridOptions = {
            columnDefs,
            rowData: generateRowData(),
            paginationPageSize: 20,
            pagination: true,
            animateRows: true,

            onRowDragMove: (event) => {
                rowDragMoveEvents.push(event);
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.paginationGoToPage(1);

        const rows = api.getRenderedNodes();
        expect(rows.length).toBe(20);

        await dragAndDropRow({ api, source: '24', target: '27' });

        const lastEvent = rowDragMoveEvents[rowDragMoveEvents.length - 1];
        expect(lastEvent).toBeTruthy();

        expect(lastEvent.node?.id).toBe('24');
        expect(lastEvent.nodes.length).toBe(1);
        expect(lastEvent.nodes[0].id).toBe('24');

        expect(lastEvent.overNode?.id).toBe('27');
        expect(lastEvent.overIndex).toBe(7);
    });
});
