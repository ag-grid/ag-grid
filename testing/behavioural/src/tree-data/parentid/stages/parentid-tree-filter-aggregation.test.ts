import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid parentId tree aggregation and filter', () => {
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
                { id: '0', y: 1, n: 'A' }, // A group
                { id: '1', y: 2, parentId: '0', n: 'B' }, // B group under A
                { id: '2', x: 13, y: 3, parentId: '0', n: 'C' }, // C group under A (its own values are not used if children exist)
                { id: '3', x: 14, y: 4, parentId: '1', n: 'D' }, // D leaf under B
                { id: '4', x: 15, y: 5, parentId: '1', n: 'E' }, // E leaf under B
                { id: '5', x: 16, y: 1, parentId: '2', n: 'F' }, // F leaf under C
                { id: '6', x: 17, y: 2, parentId: '2', n: 'G' }, // G leaf under C
                { id: 'H', x: 18, parentId: '2', n: 'H' }, // H filler group under C (added explicitly)
                { id: '7', x: 18, y: 3, parentId: 'H', n: 'I' }, // I leaf under H
                { id: '8', y: 4, n: 'J' }, // J group
                { id: '9', x: 20, y: 5, parentId: '8', n: 'K' }, // K leaf under J
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'n' },
                    { field: 'x', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                    { field: 'y', filter: 'agNumberColumnFilter' },
                ],
                autoGroupColumnDef: { headerName: 'Parent' },
                treeData: true,
                animateRows: false,
                rowSelection: { mode: 'multiRow' },
                grandTotalRow: 'top',
                alwaysAggregateAtRootLevel: true,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
                groupSuppressBlankHeader: true,
            });

            const gridRowsOptions: GridRowsOptions = {
                columns: ['n', 'x', 'y'],
                checkDom: true,
            };

            await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:100
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:100
                ├─┬ 0 GROUP id:0 n:"A" x:80 y:1
                │ ├─┬ 1 GROUP id:1 n:"B" x:29 y:2
                │ │ ├── 3 LEAF id:3 n:"D" x:14 y:4
                │ │ └── 4 LEAF id:4 n:"E" x:15 y:5
                │ └─┬ 2 GROUP id:2 n:"C" x:51 y:3
                │ · ├── 5 LEAF id:5 n:"F" x:16 y:1
                │ · ├── 6 LEAF id:6 n:"G" x:17 y:2
                │ · └─┬ H GROUP id:H n:"H" x:18 y:undefined
                │ · · └── 7 LEAF id:7 n:"I" x:18 y:3
                └─┬ 8 GROUP id:8 n:"J" x:20 y:4
                · └── 9 LEAF id:9 n:"K" x:20 y:5
          `);

            // Set filter: only show rows with y > 4
            api.setFilterModel({
                y: { filterType: 'number', type: 'greaterThan', filter: 4 },
            });

            await new GridRows(api, 'filter greater than', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:35
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:35
                ├─┬ 0 GROUP id:0 n:"A" x:15 y:1
                │ └─┬ 1 GROUP id:1 n:"B" x:15 y:2
                │ · └── 4 LEAF id:4 n:"E" x:15 y:5
                └─┬ 8 GROUP id:8 n:"J" x:20 y:4
                · └── 9 LEAF id:9 n:"K" x:20 y:5
          `);

            // Update the y value for row D (id: '3')
            if (mode === 'transactions') {
                api.applyTransaction({ update: [{ ...rowData[3], y: 200 }] });
            } else {
                rowData = cachedJSONObjects.array([
                    ...rowData.slice(0, 3),
                    { ...rowData[3], y: 200 },
                    ...rowData.slice(4),
                ]);
                api.setGridOption('rowData', rowData);
            }

            await new GridRows(api, 'filter greater than - update 1', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:49
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:49
                ├─┬ 0 GROUP id:0 n:"A" x:29 y:1
                │ └─┬ 1 GROUP id:1 n:"B" x:29 y:2
                │ · ├── 3 LEAF id:3 n:"D" x:14 y:200
                │ · └── 4 LEAF id:4 n:"E" x:15 y:5
                └─┬ 8 GROUP id:8 n:"J" x:20 y:4
                · └── 9 LEAF id:9 n:"K" x:20 y:5
          `);

            // Update the y value for row K (id: '9')
            // (Note: with the additional filler row, row with id '9' is at index 10)
            if (mode === 'transactions') {
                api.applyTransaction({ update: [{ ...rowData[10], y: 0 }] });
            } else {
                rowData = cachedJSONObjects.array([...rowData.slice(0, 10), { ...rowData[10], y: 0 }]);
                api.setGridOption('rowData', rowData);
            }

            await new GridRows(api, 'filter greater than - update 2', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:29
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:29
                └─┬ 0 GROUP id:0 n:"A" x:29 y:1
                · └─┬ 1 GROUP id:1 n:"B" x:29 y:2
                · · ├── 3 LEAF id:3 n:"D" x:14 y:200
                · · └── 4 LEAF id:4 n:"E" x:15 y:5
          `);

            // Remove row D (id: '3')
            if (mode === 'transactions') {
                api.applyTransaction({ remove: [rowData[3]] });
            } else {
                rowData = rowData.filter((row) => row.id !== '3');
                api.setGridOption('rowData', rowData);
            }

            await new GridRows(api, 'filter greater than - remove', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:15
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:15
                └─┬ 0 GROUP id:0 n:"A" x:15 y:1
                · └─┬ 1 GROUP id:1 n:"B" x:15 y:2
                · · └── 4 LEAF id:4 n:"E" x:15 y:5
          `);

            // Change filter: show rows with y < 2
            api.setFilterModel({
                y: { filterType: 'number', type: 'lessThan', filter: 2 },
            });

            await new GridRows(api, 'filter less than', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:86
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:86
                ├─┬ 0 GROUP id:0 n:"A" x:66 y:1
                │ ├─┬ 1 GROUP id:1 n:"B" x:15 y:2
                │ │ └── 4 LEAF id:4 n:"E" x:15 y:5
                │ └─┬ 2 GROUP id:2 n:"C" x:51 y:3
                │ · ├── 5 LEAF id:5 n:"F" x:16 y:1
                │ · ├── 6 LEAF id:6 n:"G" x:17 y:2
                │ · └─┬ H GROUP id:H n:"H" x:18 y:undefined
                │ · · └── 7 LEAF id:7 n:"I" x:18 y:3
                └─┬ 8 GROUP id:8 n:"J" x:20 y:4
                · └── 9 LEAF id:9 n:"K" x:20 y:0
          `);

            api.setGridOption('excludeChildrenWhenTreeDataFiltering', true);

            await new GridRows(api, 'excludeChildrenWhenTreeDataFiltering=true', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:36
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:36
                ├─┬ 0 GROUP id:0 n:"A" x:16 y:1
                │ └─┬ 2 GROUP id:2 n:"C" x:16 y:3
                │ · └── 5 LEAF id:5 n:"F" x:16 y:1
                └─┬ 8 GROUP id:8 n:"J" x:20 y:4
                · └── 9 LEAF id:9 n:"K" x:20 y:0
          `);

            api.setGridOption('suppressAggFilteredOnly', true);

            await new GridRows(api, 'suppressAggFilteredOnly=true', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:86
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID x:86
                ├─┬ 0 GROUP id:0 n:"A" x:66 y:1
                │ └─┬ 2 GROUP id:2 n:"C" x:51 y:3
                │ · └── 5 LEAF id:5 n:"F" x:16 y:1
                └─┬ 8 GROUP id:8 n:"J" x:20 y:4
                · └── 9 LEAF id:9 n:"K" x:20 y:0
          `);

            api.setGridOption('suppressAggFilteredOnly', false);
            api.setGridOption('grandTotalRow', 'bottom');

            await new GridRows(api, 'suppressAggFilteredOnly=false grandTotalRow=bottom', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:36
                ├─┬ 0 GROUP id:0 n:"A" x:16 y:1
                │ └─┬ 2 GROUP id:2 n:"C" x:16 y:3
                │ · └── 5 LEAF id:5 n:"F" x:16 y:1
                ├─┬ 8 GROUP id:8 n:"J" x:20 y:4
                │ └── 9 LEAF id:9 n:"K" x:20 y:0
                └─ footer id:rowGroupFooter_ROOT_NODE_ID x:36
          `);

            api.setGridOption('groupTotalRow', 'bottom');

            await new GridRows(api, 'groupTotalRow=top', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID x:36
                ├─┬ 0 GROUP id:0 n:"A" x:16 y:1
                │ ├─┬ 2 GROUP id:2 n:"C" x:16 y:3
                │ │ ├── 5 LEAF id:5 n:"F" x:16 y:1
                │ │ └─ footer id:rowGroupFooter_2 n:"C" x:16 y:3
                │ └─ footer id:rowGroupFooter_0 n:"A" x:16 y:1
                ├─┬ 8 GROUP id:8 n:"J" x:20 y:4
                │ ├── 9 LEAF id:9 n:"K" x:20 y:0
                │ └─ footer id:rowGroupFooter_8 n:"J" x:20 y:4
                └─ footer id:rowGroupFooter_ROOT_NODE_ID x:36
          `);
        }
    );

    test('move at different levels, with filter and aggregation', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '11', y: 4, parentId: '2', n: 'K' },
            { id: '0', y: 1, n: 'A' },
            { id: '1', y: 2, parentId: '0', n: 'B' },
            { id: '2', y: 3, parentId: '1', n: 'C' },
            { id: '3', y: 4, parentId: '2', n: 'D' },
            { id: '4', y: 5, parentId: '0', n: 'E' },
            { id: '5', y: 6, parentId: '1', n: 'E' },
            { id: '6', y: 51, parentId: '4', n: 'F' },
            { id: '7', y: 52, parentId: '4', n: 'G' },
            { id: '8', y: 7, parentId: '0', n: 'H' },
            { id: '9', y: 8, parentId: '8', n: 'I' },
            { id: '10', y: 9, parentId: '8', n: 'J' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'n' }, { field: 'y', aggFunc: 'sum', filter: 'agNumberColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Parent' },
            treeData: true,
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            alwaysAggregateAtRootLevel: true,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
            groupSuppressBlankHeader: true,
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['n', 'y'],
            checkDom: true,
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID y:134
            └─┬ 0 GROUP id:0 n:"A" y:134
            · ├─┬ 1 GROUP id:1 n:"B" y:14
            · │ ├─┬ 2 GROUP id:2 n:"C" y:8
            · │ │ ├── 11 LEAF id:11 n:"K" y:4
            · │ │ └── 3 LEAF id:3 n:"D" y:4
            · │ └── 5 LEAF id:5 n:"E" y:6
            · ├─┬ 4 GROUP id:4 n:"E" y:103
            · │ ├── 6 LEAF id:6 n:"F" y:51
            · │ └── 7 LEAF id:7 n:"G" y:52
            · └─┬ 8 GROUP id:8 n:"H" y:17
            · · ├── 9 LEAF id:9 n:"I" y:8
            · · └── 10 LEAF id:10 n:"J" y:9
        `);

        // Set filter: only show rows with y > 4
        api.setFilterModel({
            y: { filterType: 'number', type: 'lessThan', filter: 50 },
        });

        await new GridRows(api, 'initial filtered', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID y:31
            └─┬ 0 GROUP id:0 n:"A" y:31
            · ├─┬ 1 GROUP id:1 n:"B" y:14
            · │ ├─┬ 2 GROUP id:2 n:"C" y:8
            · │ │ ├── 11 LEAF id:11 n:"K" y:4
            · │ │ └── 3 LEAF id:3 n:"D" y:4
            · │ └── 5 LEAF id:5 n:"E" y:6
            · └─┬ 8 GROUP id:8 n:"H" y:17
            · · ├── 9 LEAF id:9 n:"I" y:8
            · · └── 10 LEAF id:10 n:"J" y:9
        `);

        api.applyTransaction({
            update: [{ ...rowData.find((row) => row.id === '3'), parentId: '8' }],
        });

        await new GridRows(api, 'moved', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID y:31
            └─┬ 0 GROUP id:0 n:"A" y:31
            · ├─┬ 1 GROUP id:1 n:"B" y:10
            · │ ├─┬ 2 GROUP id:2 n:"C" y:4
            · │ │ └── 11 LEAF id:11 n:"K" y:4
            · │ └── 5 LEAF id:5 n:"E" y:6
            · ├── 4 GROUP id:4 n:"E" y:null
            · └─┬ 8 GROUP id:8 n:"H" y:21
            · · ├── 3 LEAF id:3 n:"D" y:4
            · · ├── 9 LEAF id:9 n:"I" y:8
            · · └── 10 LEAF id:10 n:"J" y:9
        `);

        api.applyTransaction({
            update: [{ ...rowData.find((row) => row.id === '3'), y: 100 }],
        });

        await new GridRows(api, 'moved', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID y:127
            └─┬ 0 GROUP id:0 n:"A" y:127
            · ├─┬ 1 GROUP id:1 n:"B" y:110
            · │ ├─┬ 2 GROUP id:2 n:"C" y:104
            · │ │ ├── 11 LEAF id:11 n:"K" y:4
            · │ │ └── 3 LEAF id:3 n:"D" y:100
            · │ └── 5 LEAF id:5 n:"E" y:6
            · ├── 4 GROUP id:4 n:"E" y:null
            · └─┬ 8 GROUP id:8 n:"H" y:17
            · · ├── 9 LEAF id:9 n:"I" y:8
            · · └── 10 LEAF id:10 n:"J" y:9
        `);
    });
});
