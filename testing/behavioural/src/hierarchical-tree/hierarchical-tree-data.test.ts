import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid hierarchical tree data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
    });

    test('ag-grid hierarchical tree data (without id)', async () => {
        const rowData = [
            {
                x: 'A',
                children: [
                    {
                        x: 'B',
                        children: [
                            {
                                x: 'C',
                                children: [
                                    {
                                        x: 'D',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                x: 'E',
                children: [
                    {
                        x: 'F',
                        children: [
                            {
                                x: 'G',
                                children: [
                                    {
                                        x: 'H',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: true,
        };

        const gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" x:"A"
            │ └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" x:"B"
            │ · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" x:"C"
            │ · · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" x:"D"
            └─┬ 4 GROUP id:4 ag-Grid-AutoColumn:"4" x:"E"
            · └─┬ 5 GROUP id:5 ag-Grid-AutoColumn:"5" x:"F"
            · · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" x:"G"
            · · · └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" x:"H"
        `);
    });
});
