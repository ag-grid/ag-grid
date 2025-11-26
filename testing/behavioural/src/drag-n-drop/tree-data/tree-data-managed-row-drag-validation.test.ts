import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import {
    GridRows,
    RowDragDispatcher,
    TestGridsManager,
    assertDropIndicatorVisible,
    asyncSetTimeout,
} from '../../test-utils';

describe.each([false, true])('tree row dragging validation (suppress move %s)', (suppressMoveWhenRowDragging) => {
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

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRow!);
        await dispatcher.move(targetRow!, { yOffsetPercent: 0.6 });
        await dispatcher.finish({
            beforeDrop: async (context) => {
                await dispatcher.hoverTargetCenter(context.targetElement);
                assertDropIndicatorVisible(api);
            },
        });
        await asyncSetTimeout(0);

        const finalRows = createTreeRows(api, 'unmanaged final');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ └── drafts LEAF id:drafts ag-Grid-AutoColumn:"Drafts"
            └── archive LEAF id:archive ag-Grid-AutoColumn:"Archive"
        `);

        const endEvent = dispatcher.rowDragEndEvents[0];
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

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('draft');
        await dispatcher.move('protected', { yOffsetPercent: 0.35 });
        await dispatcher.finish({
            beforeDrop: async (context) => {
                await dispatcher.hoverTargetCenter(context.targetElement);
                assertDropIndicatorVisible(api);
            },
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
        const endEvent = dispatcher.rowDragEndEvents[0];
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

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(initialRows.getRowHtmlElement('team')!);
        await dispatcher.move(initialRows.getRowHtmlElement('team-eng')!, { yOffsetPercent: 0.6 });
        await dispatcher.finish({
            beforeDrop: async (context) => {
                await dispatcher.hoverTargetCenter(context.targetElement);
                assertDropIndicatorVisible(api);
            },
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

        const endEvent = dispatcher.rowDragEndEvents[0];
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

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('library-drafts-spec');
        await dispatcher.move('library-archive', { yOffsetPercent: 0.35 });
        await dispatcher.finish({
            beforeDrop: async (context) => {
                await dispatcher.hoverTargetCenter(context.targetElement);
                assertDropIndicatorVisible(api);
            },
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
        expect(dispatcher.rowDragEndEvents[0]?.rowsDrop?.allowed ?? false).toBe(true);
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

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('library-shared-manual');
        await dispatcher.move('library-protected', { yOffsetPercent: 0.35 });
        await dispatcher.finish({
            beforeDrop: async (context) => {
                await dispatcher.hoverTargetCenter(context.targetElement);
                assertDropIndicatorVisible(api);
            },
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
        expect(dispatcher.rowDragEndEvents[0]?.rowsDrop?.allowed ?? false).toBe(false);
        expect(api.getRowNode('library-shared-manual')?.parent?.id).toBe('library-shared');
    });
});
