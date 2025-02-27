import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid parentId tree selection', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree selection and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'A', name: 'John Von Neumann' },
            { id: 'B', name: 'Alan Turing', parent: 'A' },
            { id: 'C', name: 'A. Church', parent: 'A' },
            { id: 'D', name: 'Donald Knuth', parent: 'B' },
            { id: 'E', name: 'Grace Hopper', parent: 'B' },
            { id: 'F', name: 'Linus Torvalds', parent: 'C' },
            { id: 'G', name: 'Brian Kernighan', parent: 'C' },
            { id: 'H', name: 'Claude Elwood Shannon', parent: 'G' },
            { id: 'I', name: 'E. Dijkstra' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parent',
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name'],
            checkDom: true,
            checkSelectedNodes: true,
        };

        api.setNodesSelected({
            nodes: [
                api.getRowNode('A')!,
                api.getRowNode('C')!,
                api.getRowNode('D')!,
                api.getRowNode('H')!,
                api.getRowNode('I')!,
            ],
            newValue: true,
        });

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP selected id:A name:"John Von Neumann"
            │ ├─┬ B GROUP id:B name:"Alan Turing"
            │ │ ├── D LEAF selected id:D name:"Donald Knuth"
            │ │ └── E LEAF id:E name:"Grace Hopper"
            │ └─┬ C GROUP selected id:C name:"A. Church"
            │ · ├── F LEAF id:F name:"Linus Torvalds"
            │ · └─┬ G GROUP id:G name:"Brian Kernighan"
            │ · · └── H LEAF selected id:H name:"Claude Elwood Shannon"
            └── I LEAF selected id:I name:"E. Dijkstra"
        `);

        api.setNodesSelected({
            nodes: [api.getRowNode('G')!],
            newValue: true,
        });

        await new GridRows(api, 'select 8', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP selected id:A name:"John Von Neumann"
            │ ├─┬ B GROUP id:B name:"Alan Turing"
            │ │ ├── D LEAF selected id:D name:"Donald Knuth"
            │ │ └── E LEAF id:E name:"Grace Hopper"
            │ └─┬ C GROUP selected id:C name:"A. Church"
            │ · ├── F LEAF id:F name:"Linus Torvalds"
            │ · └─┬ G GROUP selected id:G name:"Brian Kernighan"
            │ · · └── H LEAF selected id:H name:"Claude Elwood Shannon"
            └── I LEAF selected id:I name:"E. Dijkstra"
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: 'G', name: 'Linus Torvalds', parent: 'Y' },
                { id: 'Y', name: 'Brian Kernighan', parent: 'X' },
                { id: 'B', name: 'Alan Turing', parent: 'X' },
                { id: 'X', name: 'A. Church' },
                { id: 'A', name: 'John Von Neumann' },
                { id: 'E', name: 'Grace Hopper', parent: 'Y' },
                { id: 'J', name: 'E. Dijkstra' },
            ])
        );

        await new GridRows(api, 'rowData 2', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ X GROUP id:X name:"A. Church"
            │ ├─┬ Y GROUP id:Y name:"Brian Kernighan"
            │ │ ├── G LEAF selected id:G name:"Linus Torvalds"
            │ │ └── E LEAF id:E name:"Grace Hopper"
            │ └── B LEAF id:B name:"Alan Turing"
            ├── A LEAF selected id:A name:"John Von Neumann"
            └── J LEAF id:J name:"E. Dijkstra"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Grace Hopper' } });

        api.setNodesSelected({
            nodes: [api.getRowNode('E')!],
            newValue: true,
        });

        await new GridRows(api, 'filtered', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ X GROUP id:X name:"A. Church"
            · └─┬ Y GROUP id:Y name:"Brian Kernighan"
            · · └── E LEAF selected id:E name:"Grace Hopper"
        `);
    });
});
