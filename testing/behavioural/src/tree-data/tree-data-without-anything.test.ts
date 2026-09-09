import { GridRows, TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

describe('ag-grid tree data without hierarchical and without data path', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
        // This file deliberately triggers validation/missing-module diagnostics; the global throw-on-validation must be off here.
        enableDevValidations({ throwOn: [] });
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    test('ag-grid tree data without getDataPath and without treeDataChildrenField and without treeDataParentIdField still works properly and raises warnings', async () => {
        const rowData = [{ x: 1 }, { x: 2, children: [{ x: 3 }] }];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            rowData,
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
        };

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', gridOptions);

        expect(consoleWarnSpy).toHaveBeenCalled();

        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0" x:1
            └── 1 LEAF id:1 ag-Grid-AutoColumn:"1" x:2
        `);
    });
});
