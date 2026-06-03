import XLSX from 'xlsx';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, objectUrls } from '../../test-utils';

describe('ag-grid tree excel export', () => {
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
            { uiId: '1', productHierarchy: ['Product Group'], value: 100 },
            { uiId: '2', productHierarchy: ['Product Group', 'Product Sub Group'], value: 200 },
            { uiId: '3', productHierarchy: ['Product Group', 'Product Sub Group', 'Product 1'], value: 300 },
            { uiId: '4', productHierarchy: ['Product Group', 'Product Sub Group', 'Product 2'], value: 400 },
            { uiId: '5', productHierarchy: ['Product Group', 'filler', 'Product 3'], value: 500 },
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
            getDataPath: (data) => data.productHierarchy,
            getRowId: (params) => params.data.uiId,
        });
        await new GridColumns(api, `excel exports calls value getter for groups and leafs setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── 0 "value" width:200
        `);
        await new GridRows(api, `excel exports calls value getter for groups and leafs setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"grp-null" 0:"filler"
            └─┬ "Product Group" GROUP id:1 ag-Grid-AutoColumn:"grp-0" 0:"value-100"
            · ├─┬ "Product Sub Group" GROUP id:2 ag-Grid-AutoColumn:"grp-1" 0:"value-200"
            · │ ├── "Product 1" LEAF id:3 ag-Grid-AutoColumn:"grp-2" 0:"value-300"
            · │ └── "Product 2" LEAF id:4 ag-Grid-AutoColumn:"grp-3" 0:"value-400"
            · └─┬ filler filler id:"row-group-0-Product Group-1-filler" ag-Grid-AutoColumn:"grp-4" 0:"filler"
            · · └── "Product 3" LEAF id:5 ag-Grid-AutoColumn:"grp-5" 0:"value-500"
        `);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        expect(await getExcelJsonData(await objectUrls.pullBlob())).toEqual([
            { Group: ' -> grp-0', value: 'value-100' },
            { Group: ' -> grp-0 -> grp-1', value: 'value-200' },
            { Group: ' -> grp-0 -> grp-1 -> grp-2', value: 'value-300' },
            { Group: ' -> grp-0 -> grp-1 -> grp-3', value: 'value-400' },
            { Group: ' -> grp-0 -> grp-4', value: 'filler' },
            { Group: ' -> grp-0 -> grp-4 -> grp-5', value: 'value-500' },
        ]);

        // Try to disable tree data now
        api.setGridOption('treeData', false);
        await new GridColumns(api, `excel exports calls value getter for groups and leafs after setGridOption treeData`)
            .checkColumns(`
                CENTER
                └── 0 "value" width:200
            `);
        await new GridRows(api, `excel exports calls value getter for groups and leafs after setGridOption treeData`)
            .check(`
                ROOT id:ROOT_NODE_ID 0:"filler"
                ├── LEAF id:1 0:"value-100"
                ├── LEAF id:2 0:"value-200"
                ├── LEAF id:3 0:"value-300"
                ├── LEAF id:4 0:"value-400"
                └── LEAF id:5 0:"value-500"
            `);

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
