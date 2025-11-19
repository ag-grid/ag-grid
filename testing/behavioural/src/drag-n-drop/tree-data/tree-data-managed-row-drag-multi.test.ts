import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, dragAndDropRow } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

describe.each([false, true])('tree drag multi flows (suppress move %s)', (suppressMoveWhenRowDragging) => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, TreeDataModule],
    });

    const treeGridRowsOptions: GridRowsOptions = {
        checkDom: true,
        treeData: true,
        columns: ['ag-Grid-AutoColumn'],
    };

    const createTreeRows = (api: GridApi, label: string) => new GridRows(api, label, treeGridRowsOptions);

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

    const hoverTargetCenter = async (
        api: GridApi,
        targetElement: Element,
        dataTransfer: DataTransfer,
        fireMouseEvent: (
            element: Element,
            type: string,
            options: MouseEventInit & { dataTransfer?: DataTransfer }
        ) => Promise<void>
    ) => {
        const rect = targetElement.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;
        for (let i = 0; i < 12; ++i) {
            await asyncSetTimeout(25);
            await fireMouseEvent(targetElement, 'dragover', { clientX, clientY, dataTransfer });
        }
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

        const initialRows = createTreeRows(api, 'multi select initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ ├── alpha LEAF selected id:alpha ag-Grid-AutoColumn:"Alpha"
            │ ├── beta LEAF selected id:beta ag-Grid-AutoColumn:"Beta"
            │ └── gamma LEAF id:gamma ag-Grid-AutoColumn:"Gamma"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-reports LEAF id:archive-reports ag-Grid-AutoColumn:"Reports"
        `);

        const sourceRow = initialRows.getRowHtmlElement('alpha');
        const targetRow = initialRows.getRowHtmlElement('archive');
        expect(sourceRow).toBeTruthy();
        expect(targetRow).toBeTruthy();

        await dragAndDropRow({
            api,
            source: sourceRow!,
            target: targetRow!,
            targetYOffsetPercent: 0.35,
            beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
        });
        await asyncSetTimeout(0);

        const finalRows = createTreeRows(api, 'multi select after move');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ └── gamma LEAF id:gamma ag-Grid-AutoColumn:"Gamma"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · ├── alpha LEAF selected id:alpha ag-Grid-AutoColumn:"Alpha"
            · ├── beta LEAF selected id:beta ag-Grid-AutoColumn:"Beta"
            · └── archive-reports LEAF id:archive-reports ag-Grid-AutoColumn:"Reports"
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

        const initialRows = createTreeRows(api, 'insert delay initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · ├─┬ root-plan GROUP id:root-plan ag-Grid-AutoColumn:"Plan"
            · │ └── root-plan-tasks LEAF id:root-plan-tasks ag-Grid-AutoColumn:"Tasks"
            · └─┬ root-ops GROUP collapsed id:root-ops ag-Grid-AutoColumn:"Operations"
            · · └── root-ops-logs LEAF id:root-ops-logs ag-Grid-AutoColumn:"Logs"
        `);

        const sourceRow = initialRows.getRowHtmlElement('root-plan-tasks');
        const targetRow = initialRows.getRowHtmlElement('root-ops');
        expect(sourceRow).toBeTruthy();
        expect(targetRow).toBeTruthy();

        const waitForGroupHover = async (
            gridApi: GridApi,
            targetElement: Element,
            dataTransfer: DataTransfer,
            fireMouseEvent: (
                element: Element,
                type: string,
                options: MouseEventInit & { dataTransfer?: DataTransfer }
            ) => Promise<void>
        ): Promise<boolean> => {
            const rect = targetElement.getBoundingClientRect();
            const clientX = rect.left + rect.width / 2;
            const clientY = rect.top + rect.height / 2;
            for (let i = 0; i < 15; ++i) {
                await asyncSetTimeout(30);
                await fireMouseEvent(targetElement, 'dragover', { clientX, clientY, dataTransfer });
            }

            let expanded = false;
            gridApi.forEachNode((node: IRowNode) => {
                if (node.id === 'root-ops') {
                    expanded = !!node.expanded;
                }
            });
            return expanded;
        };

        let expandedBeforeDrop = false;
        await dragAndDropRow({
            api,
            source: sourceRow!,
            target: targetRow!,
            targetYOffsetPercent: 0.6,
            beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) => {
                expandedBeforeDrop = await waitForGroupHover(api, targetElement, dataTransfer, fireMouseEvent);
            },
        });
        await asyncSetTimeout(0);

        expect(expandedBeforeDrop).toBe(true);
        expect(api.getRowNode('root-ops')?.expanded).toBe(true);

        const finalRows = createTreeRows(api, 'insert delay after');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · ├── root-plan LEAF id:root-plan ag-Grid-AutoColumn:"Plan"
            · └─┬ root-ops GROUP id:root-ops ag-Grid-AutoColumn:"Operations"
            · · ├── root-plan-tasks LEAF id:root-plan-tasks ag-Grid-AutoColumn:"Tasks"
            · · └── root-ops-logs LEAF id:root-ops-logs ag-Grid-AutoColumn:"Logs"
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

        const initialRows = createTreeRows(api, 'insert promote initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · ├── inbox LEAF id:inbox ag-Grid-AutoColumn:"Inbox"
            · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming"
        `);

        const sourceRow = initialRows.getRowHtmlElement('incoming');
        const targetRow = initialRows.getRowHtmlElement('inbox');
        expect(sourceRow).toBeTruthy();
        expect(targetRow).toBeTruthy();

        const dragResult = await dragAndDropRow({
            api,
            source: sourceRow!,
            target: targetRow!,
            targetYOffsetPercent: 0.35,
            beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
        });
        await asyncSetTimeout(0);

        const dropInfo = dragResult.rowDragEndEvents[0]?.rowsDrop;

        const finalRows = createTreeRows(api, 'insert promote after');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · └─┬ inbox GROUP id:inbox ag-Grid-AutoColumn:"Inbox"
            · · └── incoming LEAF id:incoming ag-Grid-AutoColumn:"Incoming"
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
