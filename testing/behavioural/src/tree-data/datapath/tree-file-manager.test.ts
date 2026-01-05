import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridOptions, IRowNode } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked } from '../../test-utils';

describe('ag-grid tree transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function getRowData() {
        return [
            { id: 1, filePath: ['Documents'], size: 20 },
            { id: 2, filePath: ['Documents', 'txt'] },
            { id: 3, filePath: ['Documents', 'txt', 'notes.txt'], size: 14.7 },
            { id: 4, filePath: ['Documents', 'pdf'] },
            { id: 5, filePath: ['Documents', 'pdf', 'book.pdf'], size: 2.1 },
            { id: 6, filePath: ['Documents', 'pdf', 'cv.pdf'], size: 2.4 },
            { id: 7, filePath: ['Documents', 'xls'] },
            { id: 8, filePath: ['Documents', 'xls', 'accounts.xls'], size: 4.3 },
            { id: 9, filePath: ['Documents', 'stuff'] },
            { id: 10, filePath: ['Documents', 'stuff', 'xyz.txt'], size: 1.1 },
            { id: 11, filePath: ['Music', 'mp3', 'pop'], size: 14.3 },
            { id: 12, filePath: ['temp.txt'], size: 101 },
            { id: 13, filePath: ['Music', 'mp3', 'pop', 'theme.mp3'], size: 101 },
            { id: 14, filePath: ['Music', 'mp3', 'jazz'], size: 101 },
        ];
    }

    test('file manager', async () => {
        const api = gridsManager.createGrid('myGrid', getFileManagerGridOptions());

        api.getRowNode('2')!.setSelected(true);

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID size:"0 MB"
            ├─┬ Documents GROUP id:1 ag-Grid-AutoColumn:"Documents" size:"24.6 MB"
            │ ├─┬ txt GROUP selected id:2 ag-Grid-AutoColumn:"txt" size:"14.7 MB"
            │ │ └── notes.txt LEAF id:3 ag-Grid-AutoColumn:"notes.txt" size:"14.7 MB"
            │ ├─┬ pdf GROUP id:4 ag-Grid-AutoColumn:"pdf" size:"4.5 MB"
            │ │ ├── book.pdf LEAF id:5 ag-Grid-AutoColumn:"book.pdf" size:"2.1 MB"
            │ │ └── cv.pdf LEAF id:6 ag-Grid-AutoColumn:"cv.pdf" size:"2.4 MB"
            │ ├─┬ xls GROUP id:7 ag-Grid-AutoColumn:"xls" size:"4.3 MB"
            │ │ └── accounts.xls LEAF id:8 ag-Grid-AutoColumn:"accounts.xls" size:"4.3 MB"
            │ └─┬ stuff GROUP id:9 ag-Grid-AutoColumn:"stuff" size:"1.1 MB"
            │ · └── xyz.txt LEAF id:10 ag-Grid-AutoColumn:"xyz.txt" size:"1.1 MB"
            ├─┬ Music filler id:row-group-0-Music ag-Grid-AutoColumn:"Music" size:"202 MB"
            │ └─┬ mp3 filler id:row-group-0-Music-1-mp3 ag-Grid-AutoColumn:"mp3" size:"202 MB"
            │ · ├─┬ pop GROUP id:11 ag-Grid-AutoColumn:"pop" size:"101 MB"
            │ · │ └── theme.mp3 LEAF id:13 ag-Grid-AutoColumn:"theme.mp3" size:"101 MB"
            │ · └── jazz LEAF id:14 ag-Grid-AutoColumn:"jazz" size:"101 MB"
            └── temp.txt LEAF id:12 ag-Grid-AutoColumn:"temp.txt" size:"101 MB"
        `);

        // Move 'txt' into 'stuff'
        moveSelectedNodeToTarget('9');

        await new GridRows(api, 'move Documents/txt to Documents/stuff/').check(`
            ROOT id:ROOT_NODE_ID size:"0 MB"
            ├─┬ Documents GROUP id:1 ag-Grid-AutoColumn:"Documents" size:"24.6 MB"
            │ ├─┬ pdf GROUP id:4 ag-Grid-AutoColumn:"pdf" size:"4.5 MB"
            │ │ ├── book.pdf LEAF id:5 ag-Grid-AutoColumn:"book.pdf" size:"2.1 MB"
            │ │ └── cv.pdf LEAF id:6 ag-Grid-AutoColumn:"cv.pdf" size:"2.4 MB"
            │ ├─┬ xls GROUP id:7 ag-Grid-AutoColumn:"xls" size:"4.3 MB"
            │ │ └── accounts.xls LEAF id:8 ag-Grid-AutoColumn:"accounts.xls" size:"4.3 MB"
            │ └─┬ stuff GROUP id:9 ag-Grid-AutoColumn:"stuff" size:"15.8 MB"
            │ · ├─┬ txt GROUP selected id:2 ag-Grid-AutoColumn:"txt" size:"14.7 MB"
            │ · │ └── notes.txt LEAF id:3 ag-Grid-AutoColumn:"notes.txt" size:"14.7 MB"
            │ · └── xyz.txt LEAF id:10 ag-Grid-AutoColumn:"xyz.txt" size:"1.1 MB"
            ├─┬ Music filler id:row-group-0-Music ag-Grid-AutoColumn:"Music" size:"202 MB"
            │ └─┬ mp3 filler id:row-group-0-Music-1-mp3 ag-Grid-AutoColumn:"mp3" size:"202 MB"
            │ · ├─┬ pop GROUP id:11 ag-Grid-AutoColumn:"pop" size:"101 MB"
            │ · │ └── theme.mp3 LEAF id:13 ag-Grid-AutoColumn:"theme.mp3" size:"101 MB"
            │ · └── jazz LEAF id:14 ag-Grid-AutoColumn:"jazz" size:"101 MB"
            └── temp.txt LEAF id:12 ag-Grid-AutoColumn:"temp.txt" size:"101 MB"
        `);

        applyTransactionChecked(api, { update: [{ id: '7', filePath: ['Documents', 'stuff', 'var', 'xls-renamed'] }] });

        await new GridRows(api, 'rename "Documents/xls" to "Documents/stuff/var/xls-renamed"').check(`
            ROOT id:ROOT_NODE_ID size:"0 MB"
            ├─┬ Documents GROUP id:1 ag-Grid-AutoColumn:"Documents" size:"24.6 MB"
            │ ├─┬ pdf GROUP id:4 ag-Grid-AutoColumn:"pdf" size:"4.5 MB"
            │ │ ├── book.pdf LEAF id:5 ag-Grid-AutoColumn:"book.pdf" size:"2.1 MB"
            │ │ └── cv.pdf LEAF id:6 ag-Grid-AutoColumn:"cv.pdf" size:"2.4 MB"
            │ ├─┬ xls filler id:row-group-0-Documents-1-xls ag-Grid-AutoColumn:"xls" size:"4.3 MB"
            │ │ └── accounts.xls LEAF id:8 ag-Grid-AutoColumn:"accounts.xls" size:"4.3 MB"
            │ └─┬ stuff GROUP id:9 ag-Grid-AutoColumn:"stuff" size:"15.8 MB"
            │ · ├─┬ txt GROUP selected id:2 ag-Grid-AutoColumn:"txt" size:"14.7 MB"
            │ · │ └── notes.txt LEAF id:3 ag-Grid-AutoColumn:"notes.txt" size:"14.7 MB"
            │ · ├─┬ var filler id:row-group-0-Documents-1-stuff-2-var ag-Grid-AutoColumn:"var" size:"0 MB"
            │ · │ └── xls-renamed LEAF id:7 ag-Grid-AutoColumn:"xls-renamed" size:"0 MB"
            │ · └── xyz.txt LEAF id:10 ag-Grid-AutoColumn:"xyz.txt" size:"1.1 MB"
            ├─┬ Music filler id:row-group-0-Music ag-Grid-AutoColumn:"Music" size:"202 MB"
            │ └─┬ mp3 filler id:row-group-0-Music-1-mp3 ag-Grid-AutoColumn:"mp3" size:"202 MB"
            │ · ├─┬ pop GROUP id:11 ag-Grid-AutoColumn:"pop" size:"101 MB"
            │ · │ └── theme.mp3 LEAF id:13 ag-Grid-AutoColumn:"theme.mp3" size:"101 MB"
            │ · └── jazz LEAF id:14 ag-Grid-AutoColumn:"jazz" size:"101 MB"
            └── temp.txt LEAF id:12 ag-Grid-AutoColumn:"temp.txt" size:"101 MB"
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
            applyTransactionChecked(api, { update: getRowsToUpdate(selectedNode, targetNode!.data.filePath) });
        }
    });

    function getFileManagerGridOptions(): GridOptions {
        const rowData = getRowData();

        return {
            columnDefs: [
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
                cellRendererParams: { suppressCount: true },
            },
            rowData,
            treeData: true,
            groupDefaultExpanded: -1,
            getDataPath: (data) => data.filePath,
            getRowId: (params) => '' + params.data.id,
            animateRows: false,
            rowSelection: { mode: 'singleRow', checkboxLocation: 'autoGroupColumn' },
        };
    }
});
