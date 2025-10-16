import type {
    GridOptions,
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEvent,
    RowDragMoveEvent,
} from 'ag-grid-community';
import { RowDragModule, RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, dragAndDropRow, ssrmExpandAndLoadAll, waitForNoLoadingRows } from '../../test-utils';
import { createFakeServer, createServerSideDatasource, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

describe('ag-grid SSRM treeData managed drag and drop', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, TreeDataModule, RowDragModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('simple ssrm tree-data managed drag and drop (smoke)', async () => {
        const data = getSmallTreeDataSet();
        const fakeServer = createFakeServer(data);
        const datasource = createServerSideDatasource(fakeServer);

        const rowDragEnterEvents: RowDragEvent[] = [];
        const rowDragMoveEvents: RowDragMoveEvent[] = [];
        const rowDragEndEvents: RowDragEndEvent[] = [];
        const rowDragCancelEvents: RowDragCancelEvent[] = [];

        const onEnter = (e: RowDragEvent) => rowDragEnterEvents.push(e);
        const onMove = (e: RowDragMoveEvent) => rowDragMoveEvents.push(e);
        const onEnd = (e: RowDragEndEvent) => rowDragEndEvents.push(e);
        const onCancel = (e: RowDragCancelEvent) => rowDragCancelEvents.push(e);

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'employeeName', rowDrag: true }, { field: 'employeeId' }, { field: 'jobTitle' }],
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: true,
            getRowId: ({ data }) => data.employeeId,
            isServerSideGroup: (dataItem: any) => !!dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.employeeId,
            autoGroupColumnDef: { field: 'employeeName' },
            onRowDragEnter: onEnter,
            onRowDragMove: onMove,
            onRowDragEnd: onEnd,
            onRowDragCancel: onCancel,
        };

        const api = gridsManager.createGrid('ssrm-managed-dnd', gridOptions);

        // attach datasource after grid creation similar to other ssrm tests
        api.setGridOption('serverSideDatasource', datasource);

        // Expand and load all groups so rows are rendered in the DOM
        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        // Pick two leaf ids that exist in the small dataset and perform a managed drag
        // 105 and 107 are leaves in the sample dataset
        await dragAndDropRow({ api, source: '105', target: '107' });

        await waitForNoLoadingRows(api);

        // Basic sanity: nodes still exist in the SSRM after the drag
        expect(api.getRowNode('105')).toBeTruthy();
        expect(api.getRowNode('107')).toBeTruthy();

        // Also ensure there are no pending loading rows
        await waitForNoLoadingRows(api);

        // Verify events were emitted. At minimum we expect move events and a single end (or cancel)
        expect(rowDragMoveEvents.length).toBeGreaterThan(0);

        // Either a rowDragEnd or a rowDragCancel should have fired. Prefer end.
        expect(rowDragEndEvents.length + rowDragCancelEvents.length).toBeGreaterThan(0);

        if (rowDragEnterEvents.length > 0) {
            // the enter event should reference the source node id
            expect(rowDragEnterEvents[0].node?.id).toBe('105');
            expect(rowDragEnterEvents[0].nodes.length).toBeGreaterThan(0);
            // if overNode is present, it should be either the source or the target
            const overId = rowDragEnterEvents[0].overNode?.id;
            if (overId) {
                expect(['105', '107']).toContain(overId);
            }
        }

        if (rowDragEndEvents.length > 0) {
            expect(rowDragEndEvents.length).toBe(1);
            expect(rowDragEndEvents[0].node?.id).toBe('105');
            expect(rowDragEndEvents[0].nodes[0].id).toBe('105');
            expect(rowDragEndEvents[0].rowsDrop?.rootNode != null).toBeTruthy();
            // if overNode is present on end, it should match the drop target
            const overId = rowDragEndEvents[0].overNode?.id;
            if (overId) {
                expect(['105', '107']).toContain(overId);
            }
        } else if (rowDragCancelEvents.length > 0) {
            // cancelled drags should reference the dragged node
            expect(rowDragCancelEvents[0].node?.id).toBe('105');
        }
    });
});
