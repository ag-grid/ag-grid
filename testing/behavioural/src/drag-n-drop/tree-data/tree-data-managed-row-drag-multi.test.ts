import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions, IRowNode } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout, getRowHtmlElement } from '../../test-utils';

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
});
