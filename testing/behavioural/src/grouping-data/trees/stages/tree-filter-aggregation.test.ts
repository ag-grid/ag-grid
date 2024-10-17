import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid tree aggregation and filter', () => {
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

    test('aggregation and filter', async () => {
        const rowData = cachedJSONObjects.array([
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['x', 'y'],
            checkDom: 'myGrid',
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:100
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:100
            ├─┬ A GROUP id:0 x:80 y:1
            │ ├─┬ B GROUP id:1 x:29 y:2
            │ │ ├── D LEAF id:3 x:14 y:4
            │ │ └── E LEAF id:4 x:15 y:5
            │ └─┬ C GROUP id:2 x:51 y:3
            │ · ├── F LEAF id:5 x:16 y:1
            │ · ├── G LEAF id:6 x:17 y:2
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:18
            │ · · └── I LEAF id:7 x:18 y:3
            └─┬ J GROUP id:8 x:20 y:4
            · └── K LEAF id:9 x:20 y:5
        `);

        api.setFilterModel({
            y: { filterType: 'number', type: 'greaterThan', filter: 4 },
        });

        await new GridRows(api, 'filter greater than', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:35
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:35
            ├─┬ A GROUP id:0 x:15 y:1
            │ └─┬ B GROUP id:1 x:15 y:2
            │ · └── E LEAF id:4 x:15 y:5
            └─┬ J GROUP id:8 x:20 y:4
            · └── K LEAF id:9 x:20 y:5
        `);

        api.applyTransaction({ update: [{ ...rowData[3], y: 200 }] });

        await new GridRows(api, 'filter greater than - update 1', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:49
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:49
            ├─┬ A GROUP id:0 x:29 y:1
            │ └─┬ B GROUP id:1 x:29 y:2
            │ · ├── D LEAF id:3 x:14 y:200
            │ · └── E LEAF id:4 x:15 y:5
            └─┬ J GROUP id:8 x:20 y:4
            · └── K LEAF id:9 x:20 y:5
        `);

        api.applyTransaction({ update: [{ ...rowData[9], y: 0 }] });

        await new GridRows(api, 'filter greater than - update 2', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:29
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:29
            └─┬ A GROUP id:0 x:29 y:1
            · └─┬ B GROUP id:1 x:29 y:2
            · · ├── D LEAF id:3 x:14 y:200
            · · └── E LEAF id:4 x:15 y:5
        `);

        api.applyTransaction({ remove: [rowData[3]] });

        await new GridRows(api, 'filter greater than - remove', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:15
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:15
            └─┬ A GROUP id:0 x:15 y:1
            · └─┬ B GROUP id:1 x:15 y:2
            · · └── E LEAF id:4 x:15 y:5
        `);

        api.setFilterModel({
            y: { filterType: 'number', type: 'lessThan', filter: 2 },
        });

        await new GridRows(api, 'filter less than', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:86
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:86
            ├─┬ A GROUP id:0 x:66 y:1
            │ ├─┬ B GROUP id:1 x:15 y:2
            │ │ └── E LEAF id:4 x:15 y:5
            │ └─┬ C GROUP id:2 x:51 y:3
            │ · ├── F LEAF id:5 x:16 y:1
            │ · ├── G LEAF id:6 x:17 y:2
            │ · └─┬ H filler id:row-group-0-A-1-C-2-H x:18
            │ · · └── I LEAF id:7 x:18 y:3
            └─┬ J GROUP id:8 x:20 y:4
            · └── K LEAF id:9 x:20 y:0
        `);

        api.setGridOption('excludeChildrenWhenTreeDataFiltering', true);

        await new GridRows(api, 'excludeChildrenWhenTreeDataFiltering=true', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:36
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:36
            ├─┬ A GROUP id:0 x:16 y:1
            │ └─┬ C GROUP id:2 x:16 y:3
            │ · └── F LEAF id:5 x:16 y:1
            └─┬ J GROUP id:8 x:20 y:4
            · └── K LEAF id:9 x:20 y:0
        `);

        api.setGridOption('suppressAggFilteredOnly', true);

        await new GridRows(api, 'suppressAggFilteredOnly=true', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:86
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:86
            ├─┬ A GROUP id:0 x:66 y:1
            │ └─┬ C GROUP id:2 x:51 y:3
            │ · └── F LEAF id:5 x:16 y:1
            └─┬ J GROUP id:8 x:20 y:4
            · └── K LEAF id:9 x:20 y:0
        `);

        api.setGridOption('suppressAggFilteredOnly', false);
        api.setGridOption('grandTotalRow', 'bottom');

        await new GridRows(api, 'suppressAggFilteredOnly=false grandTotalRow=bottom', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:36
            ├─┬ A GROUP id:0 x:16 y:1
            │ └─┬ C GROUP id:2 x:16 y:3
            │ · └── F LEAF id:5 x:16 y:1
            ├─┬ J GROUP id:8 x:20 y:4
            │ └── K LEAF id:9 x:20 y:0
            └─ footer id:rowGroupFooter_ROOT_NODE_ID x:36
        `);

        api.setGridOption('groupTotalRow', 'bottom');

        await new GridRows(api, 'groupTotalRow=top', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID x:36
            ├─┬ A GROUP id:0 x:16 y:1
            │ ├─┬ C GROUP id:2 x:16 y:3
            │ │ ├── F LEAF id:5 x:16 y:1
            │ │ └─ footer id:rowGroupFooter_2 x:16 y:3
            │ └─ footer id:rowGroupFooter_0 x:16 y:1
            ├─┬ J GROUP id:8 x:20 y:4
            │ ├── K LEAF id:9 x:20 y:0
            │ └─ footer id:rowGroupFooter_8 x:20 y:4
            └─ footer id:rowGroupFooter_ROOT_NODE_ID x:36
        `);
    });
});
