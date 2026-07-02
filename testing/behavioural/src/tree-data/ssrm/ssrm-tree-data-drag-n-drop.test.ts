import type {
    GridOptions,
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEvent,
    RowDragMoveEvent,
} from 'ag-grid-community';
import { RowDragModule, RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    RowDragDispatcher,
    TestGridsManager,
    ssrmExpandAndLoadAll,
    waitForNoLoadingRows,
} from '../../test-utils';
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
        await new GridColumns(api, `simple ssrm tree-data managed drag and drop (smoke) setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── employeeName "Employee Name" width:200
            ├── employeeId "Employee Id" width:200
            └── jobTitle "Job Title" width:200
        `);
        await new GridRows(api, `simple ssrm tree-data managed drag and drop (smoke) setup`).check(`
            ROOT id:<no-id>
        `);

        // attach datasource after grid creation similar to other ssrm tests
        api.setGridOption('serverSideDatasource', datasource);
        await new GridRows(
            api,
            `simple ssrm tree-data managed drag and drop (smoke) after setGridOption serverSideDatasource`
        ).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);

        // Expand and load all groups so rows are rendered in the DOM
        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        // Pick two leaf ids that exist in the small dataset and perform a managed drag
        // 105 and 107 are leaves in the sample dataset
        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('105');
        await dispatcher.move('107');
        await dispatcher.finish();

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

    test('multi-row drag reports the full selection in event.nodes', async () => {
        const data = getSmallTreeDataSet();
        const fakeServer = createFakeServer(data);
        const datasource = createServerSideDatasource(fakeServer);

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'employeeName', rowDrag: true }, { field: 'employeeId' }, { field: 'jobTitle' }],
            treeData: true,
            rowModelType: 'serverSide',
            getRowId: ({ data }) => data.employeeId,
            isServerSideGroup: (dataItem: any) => !!dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.employeeId,
            autoGroupColumnDef: { field: 'employeeName' },
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
        };

        const api = gridsManager.createGrid('ssrm-managed-dnd-multi', gridOptions);
        api.setGridOption('serverSideDatasource', datasource);
        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        // 105 and 107 are leaves under different parent groups.
        api.setNodesSelected({ nodes: [api.getRowNode('105')!, api.getRowNode('107')!], newValue: true });

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('105');
        await dispatcher.move('107');
        await dispatcher.finish();
        await waitForNoLoadingRows(api);

        const draggedIds = (dispatcher.rowDragEndEvents.at(-1)?.nodes ?? []).map((node) => node.id).sort();
        expect(draggedIds).toEqual(['105', '107']);
    });
});
