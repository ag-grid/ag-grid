import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout, getRowHtmlElement } from '../../test-utils';

describe.each([false, true])('tree data drag basics (suppress move %s)', (suppressMoveWhenRowDragging) => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, TreeDataModule],
    });

    const treeGridRowsOptions: GridRowsOptions = {
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

        const sourceRowId = 'docs-drafts';
        const targetRowId = 'archive';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        await dispatcher.move(targetRowId, { center: true });
        await dispatcher.finish();
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

        const sourceRowId = 'plans';
        const targetRowId = 'archive';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        await dispatcher.finish();
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

    test('allows dropping a nested group between shallower nodes', async () => {
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

        const api = createGrid('tree-edge-drop-nested', rowData);

        let treeRows = createTreeRows(api, 'initial');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:docs ag-Grid-AutoColumn:"Documents"
            │ └─┬ docs-design GROUP id:docs-design ag-Grid-AutoColumn:"Design"
            │ · └── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old"
        `);

        const sourceId = 'docs-design';
        const targetId = 'archive';
        expect(getRowHtmlElement(api, sourceId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceId);
        await dispatcher.move(targetId, { yOffsetPercent: 0.05 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        treeRows = createTreeRows(api, 'after move');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── docs LEAF id:docs ag-Grid-AutoColumn:"Documents"
            ├─┬ docs-design GROUP id:docs-design ag-Grid-AutoColumn:"Design"
            │ └── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old"
        `);

        expect(api.getRowNode('docs-design')?.parent?.id).toBe('ROOT_NODE_ID');
        expect(api.getRowNode('docs-drafts')?.parent?.id).toBe('docs-design');
    });

    test('allows moving a parent between different levels without entering the target', async () => {
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

        const api = createGrid('tree-edge-drop-parent', rowData);

        let treeRows = createTreeRows(api, 'initial parent');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root"
            │ └─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans"
            │ · └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report"
        `);

        const sourceId = 'plans';
        const targetId = 'archive';
        expect(getRowHtmlElement(api, sourceId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceId);
        await dispatcher.move(targetId, { yOffsetPercent: 0.05 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        treeRows = createTreeRows(api, 'after parent move');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── root LEAF id:root ag-Grid-AutoColumn:"Root"
            ├─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans"
            │ └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report"
        `);

        expect(api.getRowNode('plans')?.parent?.id).toBe('ROOT_NODE_ID');
        expect(api.getRowNode('plans-draft')?.parent?.id).toBe('plans');
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
                                children: [{ id: 'alpha-design', name: 'Design Notes', type: 'file', children: [] }],
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

        const sourceRowId = 'projects';
        const targetRowId = 'storage';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        await dispatcher.move(targetRowId, { center: true });
        await dispatcher.finish();
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
});
