import { expect } from 'vitest';

import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, dragAndDropRow } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

describe.each([false, true])(
    'tree data managed row dragging (suppressMoveWhenRowDragging=%s)',
    (suppressMoveWhenRowDragging) => {
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

        function createGrid(id: string, rowData: any[], extraOptions: Partial<GridOptions> = {}) {
            const gridOptions: GridOptions = {
                ...baseGridOptions,
                rowData,
                ...extraOptions,
            };
            return gridsManager.createGrid(id, gridOptions);
        }

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

        test('reassigns the parent when dropping into another group', async () => {
            const rowData = [
                {
                    id: 'docs',
                    name: 'Documents',
                    type: 'folder',
                    children: [
                        {
                            id: 'docs-design',
                            name: 'Design',
                            type: 'folder',
                            children: [{ id: 'docs-drafts', name: 'Drafts', type: 'file', children: [] }],
                        },
                    ],
                },
                {
                    id: 'archive',
                    name: 'Archive',
                    type: 'folder',
                    children: [{ id: 'archive-old', name: 'Old', type: 'file', children: [] }],
                },
            ];

            const api = createGrid('tree-managed-move', rowData);

            const initialRows = createTreeRows(api, 'initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:docs ag-Grid-AutoColumn:"Documents"
            │ └─┬ docs-design GROUP id:docs-design ag-Grid-AutoColumn:"Design"
            │ · └── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old"
        `);

            const sourceRow = initialRows.getRowHtmlElement('docs-drafts');
            const targetRow = initialRows.getRowHtmlElement('archive');
            expect(sourceRow).toBeTruthy();
            expect(targetRow).toBeTruthy();

            await dragAndDropRow({
                api,
                source: sourceRow!,
                target: targetRow!,
                targetYOffsetPercent: 0.6,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'after move');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:docs ag-Grid-AutoColumn:"Documents"
            │ └── docs-design LEAF id:docs-design ag-Grid-AutoColumn:"Design"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · ├── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old"
        `);
            expect(api.getRowNode('docs-drafts')?.parent?.id).toBe('archive');
        });

        test('dragging a parent node moves its subtree when managed', async () => {
            const rowData = [
                {
                    id: 'root',
                    name: 'Root',
                    type: 'folder',
                    children: [
                        {
                            id: 'plans',
                            name: 'Plans',
                            type: 'folder',
                            children: [{ id: 'plans-draft', name: 'Draft', type: 'file', children: [] }],
                        },
                    ],
                },
                {
                    id: 'archive',
                    name: 'Archive',
                    type: 'folder',
                    children: [{ id: 'archive-report', name: 'Report', type: 'file', children: [] }],
                },
            ];

            const api = createGrid('tree-managed-parent', rowData);

            const initialRows = createTreeRows(api, 'parent initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ └─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans"
            │ · └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report"
        `);

            const sourceRow = initialRows.getRowHtmlElement('plans');
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

            const finalRows = createTreeRows(api, 'parent after move');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── root LEAF id:root ag-Grid-AutoColumn:"Root"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · ├─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans"
            · │ └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report"
        `);
            expect(finalRows.getById('plans')?.parent?.id).toBe('archive');
        });

        test('moving a node with grandchildren carries the full subtree', async () => {
            const rowData = [
                {
                    id: 'documents',
                    name: 'Documents',
                    type: 'folder',
                    children: [
                        {
                            id: 'projects',
                            name: 'Projects',
                            type: 'folder',
                            children: [
                                {
                                    id: 'project-alpha',
                                    name: 'Alpha',
                                    type: 'folder',
                                    children: [
                                        { id: 'alpha-design', name: 'Design Notes', type: 'file', children: [] },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'storage',
                    name: 'Storage',
                    type: 'folder',
                    children: [{ id: 'storage-archive', name: 'Archive', type: 'file', children: [] }],
                },
            ];

            const api = createGrid('tree-managed-grandchildren', rowData);

            const initialRows = createTreeRows(api, 'grandchildren initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ documents GROUP id:documents ag-Grid-AutoColumn:"Documents"
            │ └─┬ projects GROUP id:projects ag-Grid-AutoColumn:"Projects"
            │ · └─┬ project-alpha GROUP id:project-alpha ag-Grid-AutoColumn:"Alpha"
            │ · · └── alpha-design LEAF id:alpha-design ag-Grid-AutoColumn:"Design Notes"
            └─┬ storage GROUP id:storage ag-Grid-AutoColumn:"Storage"
            · └── storage-archive LEAF id:storage-archive ag-Grid-AutoColumn:"Archive"
        `);

            const sourceRow = initialRows.getRowHtmlElement('projects');
            const targetRow = initialRows.getRowHtmlElement('storage');
            expect(sourceRow).toBeTruthy();
            expect(targetRow).toBeTruthy();

            await dragAndDropRow({
                api,
                source: sourceRow!,
                target: targetRow!,
                targetYOffsetPercent: 0.6,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'grandchildren after move');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── documents LEAF id:documents ag-Grid-AutoColumn:"Documents"
            └─┬ storage GROUP id:storage ag-Grid-AutoColumn:"Storage"
            · ├─┬ projects GROUP id:projects ag-Grid-AutoColumn:"Projects"
            · │ └─┬ project-alpha GROUP id:project-alpha ag-Grid-AutoColumn:"Alpha"
            · │ · └── alpha-design LEAF id:alpha-design ag-Grid-AutoColumn:"Design Notes"
            · └── storage-archive LEAF id:storage-archive ag-Grid-AutoColumn:"Archive"
        `);

            expect(api.getRowNode('projects')?.parent?.id).toBe('storage');
            expect(api.getRowNode('project-alpha')?.parent?.id).toBe('projects');
            expect(api.getRowNode('alpha-design')?.parent?.id).toBe('project-alpha');
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
            expect(dropInfo?.allowed ?? false).toBe(true);
        });

        test('unmanaged tree data drag leaves hierarchy unchanged', async () => {
            const rowData = [
                {
                    id: 'root',
                    name: 'Root',
                    type: 'folder',
                    children: [{ id: 'drafts', name: 'Drafts', type: 'file', children: [] }],
                },
                { id: 'archive', name: 'Archive', type: 'folder', children: [] },
            ];

            const api = createGrid('tree-unmanaged', rowData, {
                rowDragManaged: false,
            });

            const initialRows = createTreeRows(api, 'unmanaged initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ └── drafts LEAF id:drafts ag-Grid-AutoColumn:"Drafts"
            └── archive LEAF id:archive ag-Grid-AutoColumn:"Archive"
        `);

            const sourceRow = initialRows.getRowHtmlElement('drafts');
            const targetRow = initialRows.getRowHtmlElement('archive');
            expect(sourceRow).toBeTruthy();
            expect(targetRow).toBeTruthy();

            const result = await dragAndDropRow({
                api,
                source: sourceRow!,
                target: targetRow!,
                targetYOffsetPercent: 0.6,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'unmanaged final');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ └── drafts LEAF id:drafts ag-Grid-AutoColumn:"Drafts"
            └── archive LEAF id:archive ag-Grid-AutoColumn:"Archive"
        `);

            const endEvent = result.rowDragEndEvents[0];
            expect(endEvent?.rowsDrop?.newParent?.id).toBe('ROOT_NODE_ID');
        });

        test('isRowValidDropPosition can veto dropping into specific parents', async () => {
            const validatorParents: Array<string | null> = [];
            const rowData = [
                {
                    id: 'root',
                    name: 'Root',
                    type: 'folder',
                    children: [
                        {
                            id: 'protected',
                            name: 'System',
                            type: 'folder',
                            children: [{ id: 'protected-log', name: 'Log', type: 'file', children: [] }],
                        },
                        { id: 'draft', name: 'Draft', type: 'file', children: [] },
                    ],
                },
            ];

            const api = createGrid('tree-managed-validator', rowData, {
                isRowValidDropPosition: (rowsDrop) => {
                    validatorParents.push(rowsDrop.newParent?.id ?? null);
                    if (rowsDrop.newParent?.id === 'protected') {
                        return { allowed: false };
                    }
                    return true;
                },
            });

            const initialRows = createTreeRows(api, 'validator initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · ├─┬ protected GROUP id:protected ag-Grid-AutoColumn:"System"
            · │ └── protected-log LEAF id:protected-log ag-Grid-AutoColumn:"Log"
            · └── draft LEAF id:draft ag-Grid-AutoColumn:"Draft"
        `);

            const result = await dragAndDropRow({
                api,
                source: 'draft',
                target: 'protected',
                targetYOffsetPercent: 0.35,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'validator final');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · ├─┬ protected GROUP id:protected ag-Grid-AutoColumn:"System"
            · │ └── protected-log LEAF id:protected-log ag-Grid-AutoColumn:"Log"
            · └── draft LEAF id:draft ag-Grid-AutoColumn:"Draft"
        `);

            expect(validatorParents).toContain('protected');
            const endEvent = result.rowDragEndEvents[0];
            expect(endEvent?.rowsDrop?.allowed ?? false).toBe(false);
        });

        test('managed drag blocks creating circular hierarchies', async () => {
            const rowData = [
                {
                    id: 'root',
                    name: 'Root',
                    type: 'folder',
                    children: [
                        {
                            id: 'team',
                            name: 'Team',
                            type: 'folder',
                            children: [
                                {
                                    id: 'team-eng',
                                    name: 'Engineering',
                                    type: 'folder',
                                    children: [{ id: 'team-eng-notes', name: 'Notes', type: 'file', children: [] }],
                                },
                            ],
                        },
                    ],
                },
            ];

            const api = createGrid('tree-managed-cycle-guard', rowData, {
                isRowValidDropPosition: (rowsDrop) => {
                    const draggedIds = new Set(rowsDrop.rows.map((node) => node.id));
                    let current: IRowNode | null | undefined = rowsDrop.newParent;
                    while (current) {
                        if (draggedIds.has(current.id)) {
                            return { allowed: false };
                        }
                        current = current.parent;
                    }
                    return true;
                },
            });

            const initialRows = createTreeRows(api, 'cycle initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · └─┬ team GROUP id:team ag-Grid-AutoColumn:"Team"
            · · └─┬ team-eng GROUP id:team-eng ag-Grid-AutoColumn:"Engineering"
            · · · └── team-eng-notes LEAF id:team-eng-notes ag-Grid-AutoColumn:"Notes"
        `);

            const { rowDragEndEvents } = await dragAndDropRow({
                api,
                source: initialRows.getRowHtmlElement('team')!,
                target: initialRows.getRowHtmlElement('team-eng')!,
                targetYOffsetPercent: 0.6,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'cycle final');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            · └─┬ team GROUP id:team ag-Grid-AutoColumn:"Team"
            · · └─┬ team-eng GROUP id:team-eng ag-Grid-AutoColumn:"Engineering"
            · · · └── team-eng-notes LEAF id:team-eng-notes ag-Grid-AutoColumn:"Notes"
        `);

            const endEvent = rowDragEndEvents[0];
            expect(endEvent?.rowsDrop?.allowed ?? false).toBe(false);
            expect(endEvent?.rowsDrop?.newParent?.id).not.toBe('team-eng');
            expect(api.getRowNode('team')?.parent?.id).toBe('root');
        });

        test('getDataPath managed drag reassigns parent path', async () => {
            const rowData = [
                { id: 'library', name: 'Library', type: 'root', path: ['Library'] },
                { id: 'library-drafts', name: 'Drafts', type: 'folder', path: ['Library', 'Drafts'] },
                {
                    id: 'library-drafts-spec',
                    name: 'Spec',
                    type: 'file',
                    path: ['Library', 'Drafts', 'Spec'],
                },
                { id: 'library-archive', name: 'Archive', type: 'folder', path: ['Library', 'Archive'] },
                {
                    id: 'library-archive-reports',
                    name: 'Reports',
                    type: 'file',
                    path: ['Library', 'Archive', 'Reports'],
                },
            ];

            const api = createGrid('tree-managed-path', rowData, {
                treeDataChildrenField: undefined,
                getDataPath: (data) => data.path,
            });

            const initialRows = createTreeRows(api, 'path managed initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Library GROUP id:library ag-Grid-AutoColumn:"Library"
            · ├─┬ Drafts GROUP id:library-drafts ag-Grid-AutoColumn:"Drafts"
            · │ └── Spec LEAF id:library-drafts-spec ag-Grid-AutoColumn:"Spec"
            · └─┬ Archive GROUP id:library-archive ag-Grid-AutoColumn:"Archive"
            · · └── Reports LEAF id:library-archive-reports ag-Grid-AutoColumn:"Reports"
        `);

            const dragResult = await dragAndDropRow({
                api,
                source: 'library-drafts-spec',
                target: 'library-archive',
                targetYOffsetPercent: 0.35,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'path managed after');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Library GROUP id:library ag-Grid-AutoColumn:"Library"
            · ├── Drafts LEAF id:library-drafts ag-Grid-AutoColumn:"Drafts"
            · └─┬ Archive GROUP id:library-archive ag-Grid-AutoColumn:"Archive"
            · · ├── Spec LEAF id:library-drafts-spec ag-Grid-AutoColumn:"Spec"
            · · └── Reports LEAF id:library-archive-reports ag-Grid-AutoColumn:"Reports"
        `);

            expect(api.getRowNode('library-drafts-spec')?.parent?.id).toBe('library-archive');
            expect(dragResult.rowDragEndEvents[0]?.rowsDrop?.allowed ?? false).toBe(true);
        });

        test('getDataPath validator can block reassignment into protected folders', async () => {
            const attemptedPositions: Array<{ parent: string | null; target: string | null }> = [];
            let rejectedAttempt = false;
            const rowData = [
                { id: 'library', name: 'Library', type: 'root', path: ['Library'] },
                { id: 'library-protected', name: 'Protected', type: 'folder', path: ['Library', 'Protected'] },
                { id: 'library-shared', name: 'Shared', type: 'folder', path: ['Library', 'Shared'] },
                {
                    id: 'library-shared-manual',
                    name: 'Manual',
                    type: 'file',
                    path: ['Library', 'Shared', 'Manual'],
                },
            ];

            const api = createGrid('tree-managed-path-validator', rowData, {
                treeDataChildrenField: undefined,
                getDataPath: (data) => data.path,
                isRowValidDropPosition: (params) => {
                    const newParentId = params.newParent?.id ?? null;
                    const targetId = params.target?.id ?? null;
                    attemptedPositions.push({ parent: newParentId, target: targetId });
                    if (newParentId === 'library-protected' || targetId === 'library-protected') {
                        rejectedAttempt = true;
                        return { allowed: false };
                    }
                    return true;
                },
            });

            const initialRows = createTreeRows(api, 'path validator initial');
            await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Library GROUP id:library ag-Grid-AutoColumn:"Library"
            · ├── Protected LEAF id:library-protected ag-Grid-AutoColumn:"Protected"
            · └─┬ Shared GROUP id:library-shared ag-Grid-AutoColumn:"Shared"
            · · └── Manual LEAF id:library-shared-manual ag-Grid-AutoColumn:"Manual"
        `);

            const result = await dragAndDropRow({
                api,
                source: 'library-shared-manual',
                target: 'library-protected',
                targetYOffsetPercent: 0.35,
                beforeDrop: async ({ targetElement, dataTransfer, fireMouseEvent }) =>
                    hoverTargetCenter(api, targetElement, dataTransfer, fireMouseEvent),
            });
            await asyncSetTimeout(0);

            const finalRows = createTreeRows(api, 'path validator final');
            await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Library GROUP id:library ag-Grid-AutoColumn:"Library"
            · ├── Protected LEAF id:library-protected ag-Grid-AutoColumn:"Protected"
            · └─┬ Shared GROUP id:library-shared ag-Grid-AutoColumn:"Shared"
            · · └── Manual LEAF id:library-shared-manual ag-Grid-AutoColumn:"Manual"
        `);

            expect(rejectedAttempt).toBe(true);
            expect(
                attemptedPositions.some(
                    ({ parent, target }) => parent === 'library-protected' || target === 'library-protected'
                )
            ).toBe(true);
            expect(result.rowDragEndEvents[0]?.rowsDrop?.allowed ?? false).toBe(false);
            expect(api.getRowNode('library-shared-manual')?.parent?.id).toBe('library-shared');
        });
    }
);
