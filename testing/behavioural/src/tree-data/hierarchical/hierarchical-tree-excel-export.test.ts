import XLSX from 'xlsx';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, objectUrls } from '../../test-utils';

describe('ag-grid hierarchical tree excel export', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule, ExcelExportModule],
    });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        vitest.restoreAllMocks();
        gridsManager.reset();
    });

    test('excel exports calls value getter for groups and leafs', async () => {
        const rowData = [
            {
                uiId: '1',
                value: 100,
                children: [
                    {
                        uiId: '2',
                        value: 200,
                        children: [
                            { uiId: '3', value: 300 },
                            { uiId: '4', value: 400 },
                        ],
                    },
                    { uiId: '5', value: 500 },
                ],
            },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'value',
                    valueGetter: ({ data }) => (data ? 'value-' + data.value : 'filler'),
                },
            ],
            autoGroupColumnDef: {
                valueGetter: (params) => {
                    return 'grp-' + params.node?.rowIndex;
                },
            },
            rowData,
            treeData: true,
            groupDefaultExpanded: -1,
            treeDataChildrenField: 'children',
            getRowId: (params) => params.data.uiId,
        });
        await new GridColumns(api, `excel exports calls value getter for groups and leafs setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── 0 "value" width:200
        `);
        await new GridRows(api, `excel exports calls value getter for groups and leafs setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"grp-null" 0:"filler"
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"grp-0" 0:"value-100"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"grp-1" 0:"value-200"
            · │ ├── 3 LEAF id:3 ag-Grid-AutoColumn:"grp-2" 0:"value-300"
            · │ └── 4 LEAF id:4 ag-Grid-AutoColumn:"grp-3" 0:"value-400"
            · └── 5 LEAF id:5 ag-Grid-AutoColumn:"grp-4" 0:"value-500"
        `);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        expect(await getExcelJsonData(await objectUrls.pullBlob())).toEqual([
            { Group: ' -> grp-0', value: 'value-100' },
            { Group: ' -> grp-0 -> grp-1', value: 'value-200' },
            { Group: ' -> grp-0 -> grp-1 -> grp-2', value: 'value-300' },
            { Group: ' -> grp-0 -> grp-1 -> grp-3', value: 'value-400' },
            { Group: ' -> grp-0 -> grp-4', value: 'value-500' },
        ]);
        await new GridRows(api, `excel exports calls value getter for groups and leafs final state`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"grp-null" 0:"filler"
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"grp-0" 0:"value-100"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"grp-1" 0:"value-200"
            · │ ├── 3 LEAF id:3 ag-Grid-AutoColumn:"grp-2" 0:"value-300"
            · │ └── 4 LEAF id:4 ag-Grid-AutoColumn:"grp-3" 0:"value-400"
            · └── 5 LEAF id:5 ag-Grid-AutoColumn:"grp-4" 0:"value-500"
        `);
    });

    // TODO: disabled due to AG-13994 - Remove the treeData flattening behavior (from the API, not the codebase)
    test.skip('excel exports calls value getter for groups and leafs with flattened tree data', async () => {
        const rowData = [
            {
                uiId: '1',
                value: 100,
                children: [
                    {
                        uiId: '2',
                        value: 200,
                        children: [
                            { uiId: '3', value: 300 },
                            { uiId: '4', value: 400 },
                        ],
                    },
                    { uiId: '5', value: 500 },
                ],
            },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'value',
                    valueGetter: ({ data }) => (data ? 'value-' + data.value : 'filler'),
                },
            ],
            autoGroupColumnDef: {
                valueGetter: (params) => {
                    return 'grp-' + params.node?.rowIndex;
                },
            },
            rowData,
            treeData: false,
            groupDefaultExpanded: -1,
            treeDataChildrenField: 'children',
            getRowId: (params) => params.data.uiId,
        });

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        expect(await getExcelJsonData(await objectUrls.pullBlob())).toEqual([
            { value: 'value-100' },
            { value: 'value-200' },
            { value: 'value-300' },
            { value: 'value-400' },
            { value: 'value-500' },
        ]);
    });
});

async function getExcelJsonData(blob: Blob) {
    const workbook = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}
