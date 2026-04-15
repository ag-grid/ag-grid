import type { RowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

describe('RowNode.expanded getter without expansionSvc', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('root node expanded returns true without expansionSvc', async () => {
        const api = gridsManager.createGrid('G', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }],
        });

        const gridRows = new GridRows(api, 'root node expanded');
        const rootNode = gridRows.rootRowNode!;

        expect(rootNode).toBeDefined();
        expect(rootNode.id).toBe('ROOT_NODE_ID');
        expect(rootNode.level).toBe(-1);
        expect(rootNode._expanded).toBe(true);
        expect(rootNode.expanded).toBe(true);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
    });

    test('leaf nodes expanded returns false without expansionSvc', async () => {
        const api = gridsManager.createGrid('G', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            getRowId: ({ data }) => data.name,
        });

        const leafNode = api.getRowNode('Alice')!;

        expect(leafNode).toBeDefined();
        expect(leafNode.group).toBe(false);
        expect((leafNode as RowNode)._expanded).toBeUndefined();
        // Without expansionSvc, the getter falls back to `_expanded as boolean` which is undefined (falsy)
        expect(leafNode.expanded).toEqual(false);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
    });
});
