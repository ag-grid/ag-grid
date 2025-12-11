import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule, RowDragModule, RowSelectionModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout, getRowHtmlElement } from '../../test-utils';

describe.each([false, true])('tree data drag basics (suppress move %s)', (suppressMoveWhenRowDragging) => {
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

        const initialRows = new GridRows(api, 'initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:docs ag-Grid-AutoColumn:"Documents" type:"folder"
            │ └─┬ docs-design GROUP id:docs-design ag-Grid-AutoColumn:"Design" type:"folder"
            │ · └── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts" type:"file"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old" type:"file"
        `);

        const sourceRowId = 'docs-drafts';
        const targetRowId = 'archive';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Drafts'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        await dispatcher.move(targetRowId, { center: true });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const finalRows = new GridRows(api, 'after move');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:docs ag-Grid-AutoColumn:"Documents" type:"folder"
            │ └── docs-design LEAF id:docs-design ag-Grid-AutoColumn:"Design" type:"folder"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · ├── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts" type:"file"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old" type:"file"
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

        const initialRows = new GridRows(api, 'parent initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            │ └─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans" type:"folder"
            │ · └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft" type:"file"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report" type:"file"
        `);

        const sourceRowId = 'plans';
        const targetRowId = 'archive';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Plans'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const finalRows = new GridRows(api, 'parent after move');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── root LEAF id:root ag-Grid-AutoColumn:"Root" type:"folder"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · ├─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans" type:"folder"
            · │ └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft" type:"file"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report" type:"file"
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

        let treeRows = new GridRows(api, 'initial');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ docs GROUP id:docs ag-Grid-AutoColumn:"Documents" type:"folder"
            │ └─┬ docs-design GROUP id:docs-design ag-Grid-AutoColumn:"Design" type:"folder"
            │ · └── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts" type:"file"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old" type:"file"
        `);

        const sourceId = 'docs-design';
        const targetId = 'archive';
        expect(getRowHtmlElement(api, sourceId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Design'));
        await dispatcher.move(targetId, { yOffsetPercent: 0.05 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        treeRows = new GridRows(api, 'after move');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── docs LEAF id:docs ag-Grid-AutoColumn:"Documents" type:"folder"
            ├─┬ docs-design GROUP id:docs-design ag-Grid-AutoColumn:"Design" type:"folder"
            │ └── docs-drafts LEAF id:docs-drafts ag-Grid-AutoColumn:"Drafts" type:"file"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-old LEAF id:archive-old ag-Grid-AutoColumn:"Old" type:"file"
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

        let treeRows = new GridRows(api, 'initial parent');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ root GROUP id:root ag-Grid-AutoColumn:"Root" type:"folder"
            │ └─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans" type:"folder"
            │ · └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft" type:"file"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report" type:"file"
        `);

        const sourceId = 'plans';
        const targetId = 'archive';
        expect(getRowHtmlElement(api, sourceId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Plans'));
        await dispatcher.move(targetId, { yOffsetPercent: 0.05 });
        await dispatcher.finish();

        await asyncSetTimeout(0);

        treeRows = new GridRows(api, 'after parent move');
        await treeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── root LEAF id:root ag-Grid-AutoColumn:"Root" type:"folder"
            ├─┬ plans GROUP id:plans ag-Grid-AutoColumn:"Plans" type:"folder"
            │ └── plans-draft LEAF id:plans-draft ag-Grid-AutoColumn:"Draft" type:"file"
            └─┬ archive GROUP id:archive ag-Grid-AutoColumn:"Archive" type:"folder"
            · └── archive-report LEAF id:archive-report ag-Grid-AutoColumn:"Report" type:"file"
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

        const initialRows = new GridRows(api, 'grandchildren initial');
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ documents GROUP id:documents ag-Grid-AutoColumn:"Documents" type:"folder"
            │ └─┬ projects GROUP id:projects ag-Grid-AutoColumn:"Projects" type:"folder"
            │ · └─┬ project-alpha GROUP id:project-alpha ag-Grid-AutoColumn:"Alpha" type:"folder"
            │ · · └── alpha-design LEAF id:alpha-design ag-Grid-AutoColumn:"Design Notes" type:"file"
            └─┬ storage GROUP id:storage ag-Grid-AutoColumn:"Storage" type:"folder"
            · └── storage-archive LEAF id:storage-archive ag-Grid-AutoColumn:"Archive" type:"file"
        `);

        const sourceRowId = 'projects';
        const targetRowId = 'storage';
        expect(getRowHtmlElement(api, sourceRowId)).toBeTruthy();
        expect(getRowHtmlElement(api, targetRowId)).toBeTruthy();

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start(sourceRowId);
        await waitFor(() => expect(dispatcher.getDragGhostLabel()).toBe('Projects'));
        await dispatcher.move(targetRowId, { yOffsetPercent: 0.6 });
        await dispatcher.move(targetRowId, { center: true });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        const finalRows = new GridRows(api, 'grandchildren after move');
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── documents LEAF id:documents ag-Grid-AutoColumn:"Documents" type:"folder"
            └─┬ storage GROUP id:storage ag-Grid-AutoColumn:"Storage" type:"folder"
            · ├─┬ projects GROUP id:projects ag-Grid-AutoColumn:"Projects" type:"folder"
            · │ └─┬ project-alpha GROUP id:project-alpha ag-Grid-AutoColumn:"Alpha" type:"folder"
            · │ · └── alpha-design LEAF id:alpha-design ag-Grid-AutoColumn:"Design Notes" type:"file"
            · └── storage-archive LEAF id:storage-archive ag-Grid-AutoColumn:"Archive" type:"file"
        `);

        expect(api.getRowNode('projects')?.parent?.id).toBe('storage');
        expect(api.getRowNode('project-alpha')?.parent?.id).toBe('projects');
        expect(api.getRowNode('alpha-design')?.parent?.id).toBe('project-alpha');
    });
});
