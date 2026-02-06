import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import {
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    cachedJSONObjects,
    setRowDataChecked,
} from '../../../test-utils';

describe('ag-grid tree aggregation and filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each(['transactions', 'immutable'] as const)(
        'aggregation and filter %s',
        async (mode: 'transactions' | 'immutable') => {
            let rowData = cachedJSONObjects.array([
                { id: '0', y: 1, path: ['A'] },
                { id: '1', y: 2, path: ['A', 'B'] },
                { id: '2', x: 13, y: 3, path: ['A', 'C'] },
                { id: '3', x: 14, y: 4, path: ['A', 'B', 'D'] },
                { id: '4', x: 15, y: 5, path: ['A', 'B', 'E'] },
                { id: '5', x: 16, y: 1, path: ['A', 'C', 'F'] },
                { id: '6', x: 17, y: 2, path: ['A', 'C', 'G'] },
                { id: '7', x: 18, y: 3, path: ['A', 'C', 'H', 'I'] },
                { id: '8', y: 4, path: ['J'] },
                { id: '9', x: 20, y: 5, path: ['J', 'K'] },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'x', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                    { field: 'y', filter: 'agNumberColumnFilter' },
                ],
                autoGroupColumnDef: { headerName: 'Path' },
                treeData: true,
                animateRows: false,
                rowSelection: { mode: 'multiRow' },
                grandTotalRow: 'top',
                alwaysAggregateAtRootLevel: true,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.path,
                groupSuppressBlankHeader: true,
            });

            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID x:100
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:100
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:80 y:1
                │ ├─┬ B GROUP id:1 ag-Grid-AutoColumn:"B" x:29 y:2
                │ │ ├── D LEAF id:3 ag-Grid-AutoColumn:"D" x:14 y:4
                │ │ └── E LEAF id:4 ag-Grid-AutoColumn:"E" x:15 y:5
                │ └─┬ C GROUP id:2 ag-Grid-AutoColumn:"C" x:51 y:3
                │ · ├── F LEAF id:5 ag-Grid-AutoColumn:"F" x:16 y:1
                │ · ├── G LEAF id:6 ag-Grid-AutoColumn:"G" x:17 y:2
                │ · └─┬ H filler id:row-group-0-A-1-C-2-H ag-Grid-AutoColumn:"H" x:18
                │ · · └── I LEAF id:7 ag-Grid-AutoColumn:"I" x:18 y:3
                └─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                · └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:5
            `);

            api.setFilterModel({
                y: { filterType: 'number', type: 'greaterThan', filter: 4 },
            });

            await new GridRows(api, 'filter greater than').check(`
                ROOT id:ROOT_NODE_ID x:35
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:35
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:15 y:1
                │ └─┬ B GROUP id:1 ag-Grid-AutoColumn:"B" x:15 y:2
                │ · └── E LEAF id:4 ag-Grid-AutoColumn:"E" x:15 y:5
                └─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                · └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:5
            `);

            if (mode === 'transactions') {
                applyTransactionChecked(api, { update: [{ ...rowData[3], y: 200 }] });
            } else {
                rowData = cachedJSONObjects.array([
                    ...rowData.slice(0, 3),
                    { ...rowData[3], y: 200 },
                    ...rowData.slice(4),
                ]);
                setRowDataChecked(api, rowData);
            }

            await new GridRows(api, 'filter greater than - update 1').check(`
                ROOT id:ROOT_NODE_ID x:49
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:49
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:29 y:1
                │ └─┬ B GROUP id:1 ag-Grid-AutoColumn:"B" x:29 y:2
                │ · ├── D LEAF id:3 ag-Grid-AutoColumn:"D" x:14 y:200
                │ · └── E LEAF id:4 ag-Grid-AutoColumn:"E" x:15 y:5
                └─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                · └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:5
            `);

            if (mode === 'transactions') {
                applyTransactionChecked(api, { update: [{ ...rowData[9], y: 0 }] });
            } else {
                rowData = cachedJSONObjects.array([...rowData.slice(0, 9), { ...rowData[9], y: 0 }]);
                setRowDataChecked(api, rowData);
            }

            await new GridRows(api, 'filter greater than - update 2').check(`
                ROOT id:ROOT_NODE_ID x:29
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:29
                └─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:29 y:1
                · └─┬ B GROUP id:1 ag-Grid-AutoColumn:"B" x:29 y:2
                · · ├── D LEAF id:3 ag-Grid-AutoColumn:"D" x:14 y:200
                · · └── E LEAF id:4 ag-Grid-AutoColumn:"E" x:15 y:5
            `);

            if (mode === 'transactions') {
                applyTransactionChecked(api, { remove: [rowData[3]] });
            } else {
                rowData = rowData.filter((row) => row.id !== '3');
                setRowDataChecked(api, rowData);
            }

            await new GridRows(api, 'filter greater than - remove').check(`
                ROOT id:ROOT_NODE_ID x:15
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:15
                └─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:15 y:1
                · └─┬ B GROUP id:1 ag-Grid-AutoColumn:"B" x:15 y:2
                · · └── E LEAF id:4 ag-Grid-AutoColumn:"E" x:15 y:5
            `);

            api.setFilterModel({
                y: { filterType: 'number', type: 'lessThan', filter: 2 },
            });

            await new GridRows(api, 'filter less than').check(`
                ROOT id:ROOT_NODE_ID x:86
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:86
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:66 y:1
                │ ├─┬ B GROUP id:1 ag-Grid-AutoColumn:"B" x:15 y:2
                │ │ └── E LEAF id:4 ag-Grid-AutoColumn:"E" x:15 y:5
                │ └─┬ C GROUP id:2 ag-Grid-AutoColumn:"C" x:51 y:3
                │ · ├── F LEAF id:5 ag-Grid-AutoColumn:"F" x:16 y:1
                │ · ├── G LEAF id:6 ag-Grid-AutoColumn:"G" x:17 y:2
                │ · └─┬ H filler id:row-group-0-A-1-C-2-H ag-Grid-AutoColumn:"H" x:18
                │ · · └── I LEAF id:7 ag-Grid-AutoColumn:"I" x:18 y:3
                └─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                · └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:0
            `);

            api.setGridOption('excludeChildrenWhenTreeDataFiltering', true);

            await new GridRows(api, 'excludeChildrenWhenTreeDataFiltering=true').check(`
                ROOT id:ROOT_NODE_ID x:36
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:36
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:16 y:1
                │ └─┬ C GROUP id:2 ag-Grid-AutoColumn:"C" x:16 y:3
                │ · └── F LEAF id:5 ag-Grid-AutoColumn:"F" x:16 y:1
                └─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                · └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:0
            `);

            api.setGridOption('suppressAggFilteredOnly', true);

            await new GridRows(api, 'suppressAggFilteredOnly=true').check(`
                ROOT id:ROOT_NODE_ID x:86
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:86
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:66 y:1
                │ └─┬ C GROUP id:2 ag-Grid-AutoColumn:"C" x:51 y:3
                │ · └── F LEAF id:5 ag-Grid-AutoColumn:"F" x:16 y:1
                └─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                · └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:0
            `);

            api.setGridOption('suppressAggFilteredOnly', false);
            api.setGridOption('grandTotalRow', 'bottom');

            await new GridRows(api, 'suppressAggFilteredOnly=false grandTotalRow=bottom').check(`
                ROOT id:ROOT_NODE_ID x:36
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:16 y:1
                │ └─┬ C GROUP id:2 ag-Grid-AutoColumn:"C" x:16 y:3
                │ · └── F LEAF id:5 ag-Grid-AutoColumn:"F" x:16 y:1
                ├─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                │ └── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:0
                └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:36
            `);

            api.setGridOption('groupTotalRow', 'bottom');

            await new GridRows(api, 'groupTotalRow=top').check(`
                ROOT id:ROOT_NODE_ID x:36
                ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:16 y:1
                │ ├─┬ C GROUP id:2 ag-Grid-AutoColumn:"C" x:16 y:3
                │ │ ├── F LEAF id:5 ag-Grid-AutoColumn:"F" x:16 y:1
                │ │ └─ footer id:rowGroupFooter_2 ag-Grid-AutoColumn:"Total C" x:16 y:3
                │ └─ footer id:rowGroupFooter_0 ag-Grid-AutoColumn:"Total A" x:16 y:1
                ├─┬ J GROUP id:8 ag-Grid-AutoColumn:"J" x:20 y:4
                │ ├── K LEAF id:9 ag-Grid-AutoColumn:"K" x:20 y:0
                │ └─ footer id:rowGroupFooter_8 ag-Grid-AutoColumn:"Total J" x:20 y:4
                └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:36
            `);
        }
    );
});
