import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions, IRowNode } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    RowDragDispatcher,
    TestGridsManager,
    asyncSetTimeout,
    getRowHtmlElement,
} from '../../test-utils';

describe.each([false, true])('tree drag multi flows (suppress move %s)', (suppressMoveWhenRowDragging) => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const baseGridOptions: GridOptions = {
        animateRows: true,
        columnDefs: [{ field: 'type' }],
        autoGroupColumnDef: {
            headerName: 'Name',
            field: 'name',
            rowDrag: true,
        },
        treeData: true,
        treeDataChildrenField: 'children',
        rowDragManaged: true,
        suppressMoveWhenRowDragging,
        rowDragInsertDelay: 30,
        groupDefaultExpanded: -1,
        getRowId: ({ data }) => data.id,
    };

    const createGrid = (id: string, rowData: any[], extraOptions: Partial<GridOptions> = {}) => {
        const gridOptions: GridOptions = {
            ...baseGridOptions,
            rowData,
            ...extraOptions,
        };
        return gridsManager.createGrid(id, gridOptions);
    };

    test('dragging a selected parent plus children of another parent moves the subtree intact and re-parents the children', async () => {
        const mixed = [
            {
                id: 'target',
                name: 'Target',
                type: 'folder',
                children: [{ id: 'tc1', name: 'TC1', type: 'file', children: [] }],
            },
            {
                id: 'P',
                name: 'P',
                type: 'folder',
                children: [
                    { id: 'pc1', name: 'PC1', type: 'file', children: [] },
                    { id: 'pc2', name: 'PC2', type: 'file', children: [] },
                ],
            },
            {
                id: 'Q',
                name: 'Q',
                type: 'folder',
                children: [
                    { id: 'qc1', name: 'QC1', type: 'file', children: [] },
                    { id: 'qc2', name: 'QC2', type: 'file', children: [] },
                    { id: 'qc3', name: 'QC3', type: 'file', children: [] },
                ],
            },
        ];

        const api = createGrid('tree-mixed', mixed, {
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
        });

        // Select parent P (which keeps its own subtree) plus 3 children of a different parent Q.
        api.setNodesSelected({
            nodes: [api.getRowNode('P')!, api.getRowNode('qc1')!, api.getRowNode('qc2')!, api.getRowNode('qc3')!],
            newValue: true,
        });
        await asyncSetTimeout(0);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('P');
        await dispatcher.move('target', { yOffsetPercent: 0.4 });
        await dispatcher.move('target', { center: true });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        // Payload is the top-most selected set: the grabbed folder P (not its leaves) and Q's 3 children.
        const draggedIds = (dispatcher.rowDragEndEvents.at(-1)?.nodes ?? []).map((n) => n.id).sort();
        expect(draggedIds).toEqual(['P', 'qc1', 'qc2', 'qc3']);

        // P relocates into target with its subtree intact; qc1/qc2/qc3 re-parent into target; Q is left empty.
        await new GridRows(api, 'mixed after drop').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ target GROUP id:target ag-Grid-AutoColumn:"Target" type:"folder"
            │ ├─┬ P GROUP selected id:P ag-Grid-AutoColumn:"P" type:"folder"
            │ │ ├── pc1 LEAF id:pc1 ag-Grid-AutoColumn:"PC1" type:"file"
            │ │ └── pc2 LEAF id:pc2 ag-Grid-AutoColumn:"PC2" type:"file"
            │ ├── qc1 LEAF selected id:qc1 ag-Grid-AutoColumn:"QC1" type:"file"
            │ ├── qc2 LEAF selected id:qc2 ag-Grid-AutoColumn:"QC2" type:"file"
            │ ├── qc3 LEAF selected id:qc3 ag-Grid-AutoColumn:"QC3" type:"file"
            │ └── tc1 LEAF id:tc1 ag-Grid-AutoColumn:"TC1" type:"file"
            └── Q LEAF id:Q ag-Grid-AutoColumn:"Q" type:"folder"
        `);
    });

    test('multi-row drag moves every selected node', async () => {
        const rowData = [
            {
                id: 'root',
                name: 'Root',
                type: 'folder',
                children: [
                    { id: 'alpha', name: 'Alpha', type: 'folder', children: [] },
                    { id: 'beta', name: 'Beta', type: 'folder', children: [] },
                    { id: 'gamma', name: 'Gamma', type: 'folder', children: [] },
                ],
            },
            {
                id: 'archive',
                name: 'Archive',
                type: 'folder',
                children: [{ id: 'archive-reports', name: 'Reports', type: 'folder', children: [] }],
            },
        ];

        const api = createGrid('tree-managed-multiselect', rowData, {
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
        });

        api.setNodesSelected({
            nodes: [api.getRowNode('alpha')!, api.getRowNode('beta')!],
            newValue: true,
        });

        const initialRows = new GridRows(api, 'multi select initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            │ ├── alpha LEAF selected id:alpha ag-Grid-AutoColumn:"Alpha" type:"folder"
            │ ├── beta LEAF selected id:beta ag-Grid-AutoColumn:"Beta" type:"folder"
            │ └── gamma LEAF id:gamma ag-Grid-AutoColumn:"Gamma" type:"folder"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-reports LEAF id:archive-reports ag-Grid-AutoColumn:"Reports" type:"folder"
        `);

        const sourceRowId = 'alpha';
        const targetRowId = 'archive';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('2 rows'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.35 });
        await dispatcher.move(targetRowId, { center: true });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const finalRows = new GridRows(api, 'multi select after move');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            │ └── gamma LEAF id:gamma ag-Grid-AutoColumn:"Gamma" type:"folder"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · ├── alpha LEAF selected id:alpha ag-Grid-AutoColumn:"Alpha" type:"folder"
            · ├── beta LEAF selected id:beta ag-Grid-AutoColumn:"Beta" type:"folder"
            · └── archive-reports LEAF id:archive-reports ag-Grid-AutoColumn:"Reports" type:"folder"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Name" width:200
            └── type "Type" width:200
        `);
    });

    test('rowDragInsertDelay nudger expands collapsed parents before dropping', async () => {
        const rowData = [
            {
                id: 'root',
                name: 'Root',
                type: 'folder',
                children: [
                    {
                        id: 'root-plan',
                        name: 'Plan',
                        type: 'folder',
                        children: [{ id: 'root-plan-tasks', name: 'Tasks', type: 'file', children: [] }],
                    },
                    {
                        id: 'root-ops',
                        name: 'Operations',
                        type: 'folder',
                        children: [{ id: 'root-ops-logs', name: 'Logs', type: 'file', children: [] }],
                    },
                ],
            },
        ];

        const api = createGrid('tree-managed-insert-delay', rowData, {
            groupDefaultExpanded: -1,
            treeDataChildrenField: 'children',
            rowDragInsertDelay: 80,
        });
        await asyncSetTimeout(0);
        api.getRowNode('root-plan')?.setExpanded(true);
        api.getRowNode('root-ops')?.setExpanded(false);

        const initialRows = new GridRows(api, 'insert delay initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            · ├─┬ root-plan GROUP id:root-plan ag-Grid-AutoColumn:"Plan" type:"folder"
            · │ └── root-plan-tasks LEAF id:root-plan-tasks ag-Grid-AutoColumn:"Tasks" type:"file"
            · └─┬ root-ops GROUP collapsed id:root-ops ag-Grid-AutoColumn:"Operations" type:"folder"
            · · └── root-ops-logs LEAF id:root-ops-logs ag-Grid-AutoColumn:"Logs" type:"file"
        `);

        const sourceRowId = 'root-plan-tasks';
        const targetRowId = 'root-ops';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        let expandedBeforeDrop = false;
        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Tasks'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        const insertDelayTarget = getRowHtmlElement(api, targetRowId);
        if (!insertDelayTarget) {
            throw new Error('insert delay target row not found');
        }
        const rect = insertDelayTarget.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;

        await dispatcher.move(targetRowId, { clientX, clientY });

        for (let i = 0; i < 30 && !expandedBeforeDrop; ++i) {
            await asyncSetTimeout(20);
            api.forEachNode((node: IRowNode) => {
                if (node.id === 'root-ops') {
                    expandedBeforeDrop = !!node.expanded;
                }
            });
        }

        if (suppressMoveWhenRowDragging) {
            await waitFor(() => {
                const indicator = api.getRowDropPositionIndicator();
                expect(indicator.dropIndicatorPosition).not.toBe('none');
                expect(['root-ops', 'root-ops-logs']).toContain(indicator.row?.id);
            });
        }

        await asyncSetTimeout(10);
        await dispatcher.move(targetRowId, { clientX, clientY });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        expect(expandedBeforeDrop).toBe(true);
        expect(api.getRowNode('root-ops')?.expanded).toBe(true);

        const finalRows = new GridRows(api, 'insert delay after');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            · ├── root-plan LEAF id:root-plan ag-Grid-AutoColumn:"Plan" type:"folder"
            · └─┬ root-ops GROUP id:root-ops ag-Grid-AutoColumn:"Operations" type:"folder"
            · · ├── root-plan-tasks LEAF id:root-plan-tasks ag-Grid-AutoColumn:"Tasks" type:"file"
            · · └── root-ops-logs LEAF id:root-ops-logs ag-Grid-AutoColumn:"Logs" type:"file"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Name" width:200
            └── type "Type" width:200
        `);
    });

    test('rowDragInsertDelay can promote leaf targets into parents', async () => {
        const rowData = [
            {
                id: 'root',
                name: 'Root',
                type: 'folder',
                children: [
                    { id: 'inbox', name: 'Inbox', type: 'folder' },
                    { id: 'incoming', name: 'Incoming', type: 'file', children: [] },
                ],
            },
        ];

        const api = createGrid('tree-managed-insert-promote', rowData, {
            rowDragInsertDelay: 80,
            isRowValidDropPosition: (params) => {
                if (!params.newParent && params.target?.id === 'inbox') {
                    params.newParent = params.target;
                }
                return true;
            },
        });

        const initialRows = new GridRows(api, 'insert promote initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            · ├── inbox LEAF id:inbox ag-Grid-AutoColumn:"Inbox" type:"folder"
            · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming" type:"file"
        `);

        const sourceRowId = 'incoming';
        const targetRowId = 'inbox';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Incoming'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.4 });
        await dispatcher.move(targetRowId, { center: true });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const dropInfo = dispatcher.rowDragEndEvents[0]?.rowsDrop;

        const finalRows = new GridRows(api, 'insert promote after');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            · └─┬ inbox GROUP id:inbox ag-Grid-AutoColumn:"Inbox" type:"folder"
            · · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming" type:"file"
        `);

        expect(api.getRowNode('incoming')?.parent?.id).toBe('inbox');
        expect(api.getRowNode('inbox')?.childrenAfterSort?.some((node) => node.id === 'incoming')).toBe(true);
        expect(dropInfo).toBeDefined();
        expect(dropInfo?.allowed ?? false).toBe(true);
        expect(dropInfo?.pointerPos).toBe('inside');
        expect(dropInfo?.rows?.length ?? 0).toBeGreaterThan(0);
        expect(dropInfo?.newParent?.id ?? dropInfo?.overNode?.id).toBe('inbox');
    });

    test('rowDragInsertDelay promotes leaf targets without a validator', async () => {
        const rowData = [
            {
                id: 'root',
                name: 'Root',
                type: 'folder',
                children: [
                    { id: 'inbox', name: 'Inbox', type: 'folder', children: [] },
                    { id: 'incoming', name: 'Incoming', type: 'file', children: [] },
                ],
            },
        ];

        const api = createGrid('tree-managed-insert-promote-default', rowData, {
            rowDragInsertDelay: 60,
        });

        const initialRows = new GridRows(api, 'insert promote default initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            · ├── inbox LEAF id:inbox ag-Grid-AutoColumn:"Inbox" type:"folder"
            · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming" type:"file"
        `);

        const sourceRowId = 'incoming';
        const targetRowId = 'inbox';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Incoming'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.45 });
        await asyncSetTimeout(80);
        await dispatcher.move(targetRowId, { center: true });

        if (suppressMoveWhenRowDragging) {
            await waitFor(() => {
                const indicator = api.getRowDropPositionIndicator();
                expect(indicator.dropIndicatorPosition).toBe('inside');
                expect(indicator.row?.id).toBe('inbox');
            });
        }

        await dispatcher.finish();
        await asyncSetTimeout(0);

        const dropInfo = dispatcher.rowDragEndEvents[0]?.rowsDrop;

        if (suppressMoveWhenRowDragging) {
            // Without intermediate drops, the insert delay promotes incoming into inbox
            const finalRows = new GridRows(api, 'insert promote default after');
            await finalRows.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
                · └─┬ inbox GROUP id:inbox ag-Grid-AutoColumn:"Inbox" type:"folder"
                · · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming" type:"file"
            `);

            expect(api.getRowNode('incoming')?.parent?.id).toBe('inbox');
            expect(api.getRowNode('inbox')?.childrenAfterSort?.some((node) => node.id === 'incoming')).toBe(true);
            expect(dropInfo?.newParent?.id ?? dropInfo?.overNode?.id).toBe('inbox');
            expect(dropInfo?.position).toBe('inside');
        } else {
            // With live reordering, the intermediate drop during the first move reorders
            // incoming above inbox as a sibling before the insert delay can promote it
            const finalRows = new GridRows(api, 'insert promote default after');
            await finalRows.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
                · ├── inbox LEAF id:inbox ag-Grid-AutoColumn:"Inbox" type:"folder"
                · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming" type:"file"
            `);

            expect(api.getRowNode('incoming')?.parent?.id).toBe('root');
        }
    });

    test('rowDragInsertDelay skips already expanded groups', async () => {
        const rowData = [
            {
                id: 'root',
                name: 'Root',
                type: 'folder',
                children: [
                    {
                        id: 'alpha',
                        name: 'Alpha',
                        type: 'folder',
                        children: [{ id: 'alpha-item', name: 'Alpha Item', type: 'file', children: [] }],
                    },
                    {
                        id: 'beta',
                        name: 'Beta',
                        type: 'folder',
                        children: [{ id: 'beta-item', name: 'Beta Item', type: 'file', children: [] }],
                    },
                ],
            },
        ];

        const api = createGrid('tree-managed-insert-expanded', rowData, {
            rowDragInsertDelay: 10000,
            groupDefaultExpanded: -1,
        });

        await asyncSetTimeout(0);
        expect(api.getRowNode('beta')?.expanded).toBe(true);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('alpha-item');
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Alpha Item'));
        await dispatcher.move('beta', { center: true });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const dropInfo = dispatcher.rowDragMoveEvents.at(-1)?.rowsDrop;
        expect(dropInfo?.position).toBe('above');
        expect(dropInfo?.newParent?.id).toBe('beta');
        expect(api.getRowNode('alpha-item')?.parent?.id).toBe('beta');
    });

    describe('groupSelects filteredDescendants', () => {
        const groupSelectRowData = [
            {
                id: 'p1',
                name: 'Parent 1',
                type: 'folder',
                children: [
                    { id: 'p1-c1', name: 'Child 1a', type: 'file', children: [] },
                    { id: 'p1-c2', name: 'Child 1b', type: 'file', children: [] },
                ],
            },
            {
                id: 'p2',
                name: 'Parent 2',
                type: 'folder',
                children: [{ id: 'p2-c1', name: 'Child 2a', type: 'file', children: [] }],
            },
            { id: 'p3', name: 'Parent 3', type: 'folder', children: [] },
        ];

        test('dragging a selected parent that has children drags the whole selection', async () => {
            const api = createGrid('tree-group-selects-parent', groupSelectRowData, {
                rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                rowDragMultiRow: true,
            });

            api.setNodesSelected({ nodes: [api.getRowNode('p1')!, api.getRowNode('p3')!], newValue: true });
            await asyncSetTimeout(0);

            await new GridRows(api, 'selected').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ p1 GROUP selected id:p1 ag-Grid-AutoColumn:"Parent 1" type:"folder"
                │ ├── p1-c1 LEAF selected id:p1-c1 ag-Grid-AutoColumn:"Child 1a" type:"file"
                │ └── p1-c2 LEAF selected id:p1-c2 ag-Grid-AutoColumn:"Child 1b" type:"file"
                ├─┬ p2 GROUP id:p2 ag-Grid-AutoColumn:"Parent 2" type:"folder"
                │ └── p2-c1 LEAF id:p2-c1 ag-Grid-AutoColumn:"Child 2a" type:"file"
                └── p3 LEAF selected id:p3 ag-Grid-AutoColumn:"Parent 3" type:"folder"
            `);

            const dispatcher = new RowDragDispatcher({ api });
            await dispatcher.start('p1');
            // Ghost reflects the top-most selected nodes (the folder p1 + leaf p3), so subtrees move intact.
            await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('2 rows'));
            await dispatcher.move('p3', { yOffsetPercent: 0.7 });
            await dispatcher.finish();
            await asyncSetTimeout(0);

            // event.nodes is the top-most selected set: the grabbed folder p1 (not its leaves) and p3.
            const draggedIds = (dispatcher.rowDragEndEvents.at(-1)?.nodes ?? []).map((node) => node.id).sort();
            expect(draggedIds).toEqual(['p1', 'p3']);
        });

        test('dragging one of several selected parents with children drags every selected row', async () => {
            const api = createGrid('tree-group-selects-multi-parent', groupSelectRowData, {
                rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                rowDragMultiRow: true,
            });

            // p1 and p2 both have children; grabbing p1 must still include the non-grabbed p2.
            api.setNodesSelected({ nodes: [api.getRowNode('p1')!, api.getRowNode('p2')!], newValue: true });
            await asyncSetTimeout(0);

            const dispatcher = new RowDragDispatcher({ api });
            await dispatcher.start('p1');
            await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('2 rows'));
            await dispatcher.move('p3', { yOffsetPercent: 0.7 });
            await dispatcher.finish();
            await asyncSetTimeout(0);

            // Both selected folders drag as units (their subtrees follow), not the individual leaves.
            const draggedIds = (dispatcher.rowDragEndEvents.at(-1)?.nodes ?? []).map((node) => node.id).sort();
            expect(draggedIds).toEqual(['p1', 'p2']);
        });

        test('dragging a selected parent with a multi-level subtree relocates the whole subtree', async () => {
            const nestedRowData = [
                { id: 'dst', name: 'Destination', type: 'folder', children: [] },
                {
                    id: 'src',
                    name: 'Source',
                    type: 'folder',
                    children: [
                        {
                            id: 'src-a',
                            name: 'Source A',
                            type: 'folder',
                            children: [
                                { id: 'src-a-1', name: 'Leaf A1', type: 'file', children: [] },
                                { id: 'src-a-2', name: 'Leaf A2', type: 'file', children: [] },
                            ],
                        },
                    ],
                },
            ];

            const api = createGrid('tree-group-selects-nested', nestedRowData, {
                rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                rowDragMultiRow: true,
            });

            api.setNodesSelected({ nodes: [api.getRowNode('src')!], newValue: true });
            await asyncSetTimeout(0);

            await new GridRows(api, 'nested selected').check(`
                ROOT id:ROOT_NODE_ID
                ├── dst LEAF id:dst ag-Grid-AutoColumn:"Destination" type:"folder"
                └─┬ src GROUP selected id:src ag-Grid-AutoColumn:"Source" type:"folder"
                · └─┬ src-a GROUP selected id:src-a ag-Grid-AutoColumn:"Source A" type:"folder"
                · · ├── src-a-1 LEAF selected id:src-a-1 ag-Grid-AutoColumn:"Leaf A1" type:"file"
                · · └── src-a-2 LEAF selected id:src-a-2 ag-Grid-AutoColumn:"Leaf A2" type:"file"
            `);

            const dispatcher = new RowDragDispatcher({ api });
            await dispatcher.start('src');
            // event.nodes is the grabbed folder (a single top-most selected node), not its leaves.
            const draggedIds = () => (dispatcher.rowDragEnterEvents.at(-1)?.nodes ?? []).map((node) => node.id);
            await dispatcher.move('dst', { yOffsetPercent: 0.2 });
            expect(draggedIds()).toEqual(['src']);
            await dispatcher.finish();
            await asyncSetTimeout(0);

            // The whole subtree relocates intact above dst; no leaves are torn out to the root.
            await new GridRows(api, 'nested after drop').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ src GROUP selected id:src ag-Grid-AutoColumn:"Source" type:"folder"
                │ └─┬ src-a GROUP selected id:src-a ag-Grid-AutoColumn:"Source A" type:"folder"
                │ · ├── src-a-1 LEAF selected id:src-a-1 ag-Grid-AutoColumn:"Leaf A1" type:"file"
                │ · └── src-a-2 LEAF selected id:src-a-2 ag-Grid-AutoColumn:"Leaf A2" type:"file"
                └── dst LEAF id:dst ag-Grid-AutoColumn:"Destination" type:"folder"
            `);
        });
    });
});

describe('tree drag multi with per-node rowDrag and custom rowDragText', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grabbing one of several selected parents drags all of them, counted as parents', async () => {
        const rowDragTextCounts: number[] = [];
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'medal' }],
            autoGroupColumnDef: {
                headerName: 'Athlete',
                // Per-node rowDrag: only the parent athlete rows are draggable.
                rowDrag: ({ data }) => data?.parentId === null,
                rowDragText: (params, dragItemCount) => {
                    rowDragTextCounts.push(dragItemCount);
                    return dragItemCount > 1 ? `${dragItemCount} athletes` : (params.rowNode?.data?.athlete ?? '');
                },
            },
            rowData: [
                { id: 'phelps', athlete: 'Michael Phelps', parentId: null },
                { id: 'phelps-g1', medal: 'Gold 200m', parentId: 'phelps' },
                { id: 'phelps-g2', medal: 'Gold 400m', parentId: 'phelps' },
                { id: 'nemov', athlete: 'Aleksey Nemov', parentId: null },
                { id: 'nemov-g1', medal: 'Gold Vault', parentId: 'nemov' },
                { id: 'other', athlete: 'Other Athlete', parentId: null },
                { id: 'other-g1', medal: 'Silver', parentId: 'other' },
            ],
            rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
            rowDragMultiRow: true,
            treeData: true,
            treeDataParentIdField: 'parentId',
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('tree-parentid-rowdrag-text', gridOptions);

        api.setNodesSelected({ nodes: [api.getRowNode('phelps')!, api.getRowNode('nemov')!], newValue: true });
        await asyncSetTimeout(0);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('phelps');
        // Both selected athletes drag; the ghost counts the athletes (2), not their medals.
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('2 athletes'));
        await dispatcher.move('other', { yOffsetPercent: 0.7 });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const draggedIds = (dispatcher.rowDragEndEvents.at(-1)?.nodes ?? []).map((node) => node.id).sort();
        expect(draggedIds).toEqual(['nemov', 'phelps']);
        expect(rowDragTextCounts.length).toBeGreaterThan(0);
        expect(rowDragTextCounts.every((count) => count === 2)).toBe(true);
    });
});
