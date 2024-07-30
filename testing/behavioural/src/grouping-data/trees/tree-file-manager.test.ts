import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { TreeDiagram } from './tree-test-utils';

describe('ag-grid tree transactions', () => {
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);
    });

    beforeEach(() => {
        resetGrids();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy?.mockRestore();
    });

    test('file manager', async () => {
        const api = createMyGrid(getFileManagerGridOptions());

        api.getRowNode('2')!.setSelected(true);

        new TreeDiagram(api, 'initial').check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ Documents LEAF level:0 id:1
            │ ├─┬ txt LEAF level:1 selected id:2
            │ │ └── notes.txt LEAF level:2 id:3
            │ ├─┬ pdf LEAF level:1 id:4
            │ │ ├── book.pdf LEAF level:2 id:5
            │ │ └── cv.pdf LEAF level:2 id:6
            │ ├─┬ xls LEAF level:1 id:7
            │ │ └── accounts.xls LEAF level:2 id:8
            │ └─┬ stuff LEAF level:1 id:9
            │ · └── xyz.txt LEAF level:2 id:10
            ├─┬ Music filler level:0 id:row-group-0-Music
            │ └─┬ mp3 filler level:1 id:row-group-0-Music-1-mp3
            │ · ├─┬ pop LEAF level:2 id:11
            │ · │ └── theme.mp3 LEAF level:3 id:13
            │ · └── jazz LEAF level:2 id:14
            └── temp.txt LEAF level:0 id:12
        `);

        function getRowsToUpdate(node: IRowNode, parentPath: string[]) {
            let res: IRowNode[] = [];
            const newPath = parentPath.concat([node.key!]);
            if (node.data) {
                node.data.filePath = newPath; // groups without data, i.e. 'filler groups' don't need path updated
            }
            const children = node.childrenAfterGroup || [];
            for (let i = 0; i < children.length; i++) {
                res = res.concat(getRowsToUpdate(children[i], newPath));
            }
            return node.data ? res.concat([node.data]) : res; // ignore nodes that have no data, i.e. 'filler groups'
        }

        function moveSelectedNodeToTarget(targetRowId) {
            const selectedNode = api.getSelectedNodes()[0]; // single selection
            const targetNode = api.getRowNode(targetRowId);
            api.applyTransaction({ update: getRowsToUpdate(selectedNode, targetNode!.data.filePath) });
        }

        // Move 'txt' into 'stuff'
        moveSelectedNodeToTarget('9');

        new TreeDiagram(api, 'move Documents/txt to Documents/stuff/').check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ Documents LEAF level:0 id:1
            │ ├─┬ pdf LEAF level:1 id:4
            │ │ ├── book.pdf LEAF level:2 id:5
            │ │ └── cv.pdf LEAF level:2 id:6
            │ ├─┬ xls LEAF level:1 id:7
            │ │ └── accounts.xls LEAF level:2 id:8
            │ └─┬ stuff LEAF level:1 id:9
            │ · ├── xyz.txt LEAF level:2 id:10
            │ · └─┬ txt LEAF level:2 selected id:2
            │ · · └── notes.txt LEAF level:3 id:3
            ├─┬ Music filler level:0 id:row-group-0-Music
            │ └─┬ mp3 filler level:1 id:row-group-0-Music-1-mp3
            │ · ├─┬ pop LEAF level:2 id:11
            │ · │ └── theme.mp3 LEAF level:3 id:13
            │ · └── jazz LEAF level:2 id:14
            └── temp.txt LEAF level:0 id:12
        `);

        api.applyTransaction({ update: [{ id: '7', filePath: ['Documents', 'stuff', 'var', 'xls-renamed'] }] });

        new TreeDiagram(api, 'rename "Documents/xls" to "Documents/stuff/var/xls-renamed"').check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ Documents LEAF level:0 id:1
            │ ├─┬ pdf LEAF level:1 id:4
            │ │ ├── book.pdf LEAF level:2 id:5
            │ │ └── cv.pdf LEAF level:2 id:6
            │ ├─┬ xls filler level:1 id:row-group-0-Documents-1-xls
            │ │ └── accounts.xls LEAF level:2 id:8
            │ └─┬ stuff LEAF level:1 id:9
            │ · ├── xyz.txt LEAF level:2 id:10
            │ · ├─┬ txt LEAF level:2 selected id:2
            │ · │ └── notes.txt LEAF level:3 id:3
            │ · └─┬ var filler level:2 id:row-group-0-Documents-1-stuff-2-var
            │ · · └── xls-renamed LEAF level:3 id:7
            ├─┬ Music filler level:0 id:row-group-0-Music
            │ └─┬ mp3 filler level:1 id:row-group-0-Music-1-mp3
            │ · ├─┬ pop LEAF level:2 id:11
            │ · │ └── theme.mp3 LEAF level:3 id:13
            │ · └── jazz LEAF level:2 id:14
            └── temp.txt LEAF level:0 id:12
        `);
    });
});

function getFileManagerGridOptions(): GridOptions {
    const rowData = [
        { id: 1, filePath: ['Documents'], size: 20 },
        { id: 2, filePath: ['Documents', 'txt'] },
        { id: 3, filePath: ['Documents', 'txt', 'notes.txt'], dateModified: 'May 21 2017 01:50:00 PM', size: 14.7 },
        { id: 4, filePath: ['Documents', 'pdf'] },
        { id: 5, filePath: ['Documents', 'pdf', 'book.pdf'], dateModified: 'May 20 2017 01:50:00 PM', size: 2.1 },
        { id: 6, filePath: ['Documents', 'pdf', 'cv.pdf'], dateModified: 'May 20 2016 11:50:00 PM', size: 2.4 },
        { id: 7, filePath: ['Documents', 'xls'] },
        { id: 8, filePath: ['Documents', 'xls', 'accounts.xls'], dateModified: 'Aug 12 2016 10:50:00 AM', size: 4.3 },
        { id: 9, filePath: ['Documents', 'stuff'] },
        { id: 10, filePath: ['Documents', 'stuff', 'xyz.txt'], dateModified: 'Jan 17 2016 08:03:00 PM', size: 1.1 },
        { id: 11, filePath: ['Music', 'mp3', 'pop'], dateModified: 'Sep 11 2016 08:03:00 PM', size: 14.3 },
        { id: 12, filePath: ['temp.txt'], dateModified: 'Aug 12 2016 10:50:00 PM', size: 101 },
        { id: 13, filePath: ['Music', 'mp3', 'pop', 'theme.mp3'], dateModified: 'Aug 12 2016 10:50:00 PM', size: 101 },
        { id: 14, filePath: ['Music', 'mp3', 'jazz'], dateModified: 'Aug 12 2016 10:50:00 PM', size: 101 },
    ];

    return {
        columnDefs: [
            {
                field: 'dateModified',
                minWidth: 250,
                comparator: (d1, d2) => (new Date(d1).getTime() < new Date(d2).getTime() ? -1 : 1),
            },
            {
                field: 'size',
                aggFunc: 'sum',
                valueFormatter: (params) => (params.value ? Math.round(params.value * 10) / 10 + ' MB' : '0 MB'),
            },
        ],
        defaultColDef: { flex: 1, filter: true },
        autoGroupColumnDef: {
            headerName: 'Files',
            minWidth: 330,
            cellRendererParams: { checkbox: true, suppressCount: true },
        },
        rowData,
        treeData: true,
        groupDefaultExpanded: -1,
        getDataPath: (data) => data.filePath,
        getRowId: (params) => '' + params.data.id,
        animateRows: true,
    };
}
