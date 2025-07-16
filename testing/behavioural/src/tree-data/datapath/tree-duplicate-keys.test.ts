import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects } from '../../test-utils';

describe('ag-grid tree duplicate keys', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('duplicate keys are allowed', async () => {
        const rowData = cachedJSONObjects.array([
            { path: ['A'], v: '0' },
            { path: ['A', 'B', 'C'], v: '1' },
            { path: ['A', 'B'], v: '2' },
            { path: ['A', 'B', 'C'], v: '3' },
            { path: ['A', 'B'], v: '4' },
            { path: ['A', 'B', 'D'], v: '5' },
            { path: ['A', 'B', 'E'], v: '6' },
            { path: ['A', 'B'], v: '7' },
            { path: ['A', 'B', 'F'], v: '8' },
            { path: ['A', 'B', 'F'], v: '9' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath: (data) => data.path,
            getRowId: ({ data }) => data.v,
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: true,
            checkDom: true,
        };

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 ag-Grid-AutoColumn:"A"
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B"
            · │ ├── C LEAF id:1 ag-Grid-AutoColumn:"C"
            · │ └── C LEAF id:3 ag-Grid-AutoColumn:"C"
            · ├─┬ B GROUP id:4 ag-Grid-AutoColumn:"B"
            · │ ├── D LEAF id:5 ag-Grid-AutoColumn:"D"
            · │ └── E LEAF id:6 ag-Grid-AutoColumn:"E"
            · └─┬ B GROUP id:7 ag-Grid-AutoColumn:"B"
            · · ├── F LEAF id:8 ag-Grid-AutoColumn:"F"
            · · └── F LEAF id:9 ag-Grid-AutoColumn:"F"
        `);

        // Change order of row data
        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { path: ['A', 'B', 'E'], v: '6' },
                { path: ['A', 'B', 'C'], v: '1' },
                { path: ['A', 'B'], v: '4' },
                { path: ['A'], v: '0' },
                { path: ['A', 'B', 'D'], v: '5' },
                { path: ['A', 'B'], v: '2' },
                { path: ['A', 'B'], v: '7' },
                { path: ['A', 'B', 'C'], v: '3' },
                { path: ['A', 'B', 'F'], v: '9' },
                { path: ['A', 'B', 'F'], v: '8' },
            ])
        );

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 ag-Grid-AutoColumn:"A"
            · ├─┬ B GROUP id:4 ag-Grid-AutoColumn:"B"
            · │ ├── E LEAF id:6 ag-Grid-AutoColumn:"E"
            · │ ├── C LEAF id:1 ag-Grid-AutoColumn:"C"
            · │ └── D LEAF id:5 ag-Grid-AutoColumn:"D"
            · ├── B LEAF id:2 ag-Grid-AutoColumn:"B"
            · └─┬ B GROUP id:7 ag-Grid-AutoColumn:"B"
            · · ├── C LEAF id:3 ag-Grid-AutoColumn:"C"
            · · ├── F LEAF id:9 ag-Grid-AutoColumn:"F"
            · · └── F LEAF id:8 ag-Grid-AutoColumn:"F"
        `);

        // Remove A,B duplicates
        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { path: ['A', 'B', 'E'], v: '6' },
                { path: ['A', 'B', 'C'], v: '1' },
                { path: ['A', 'B', 'D'], v: '5' },
                { path: ['A', 'B', 'C'], v: '3' },
                { path: ['A', 'B'], v: '7' },
                { path: ['A', 'B', 'F'], v: '9' },
                { path: ['A', 'B', 'F'], v: '8' },
                { path: ['A'], v: '0' },
            ])
        );

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:0 ag-Grid-AutoColumn:"A"
            · └─┬ B GROUP id:7 ag-Grid-AutoColumn:"B"
            · · ├── E LEAF id:6 ag-Grid-AutoColumn:"E"
            · · ├── C LEAF id:1 ag-Grid-AutoColumn:"C"
            · · ├── D LEAF id:5 ag-Grid-AutoColumn:"D"
            · · ├── C LEAF id:3 ag-Grid-AutoColumn:"C"
            · · ├── F LEAF id:9 ag-Grid-AutoColumn:"F"
            · · └── F LEAF id:8 ag-Grid-AutoColumn:"F"
        `);
    });

    test('can handle duplicate leafs of a group', async () => {
        const rowData = [
            { id: 'j4SDrJw-0', orgHierarchy: ['A', 'B'] },
            { id: 'BexVZIg-1', orgHierarchy: ['A', 'B'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath: (data) => data.orgHierarchy,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = { checkDom: true };

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A filler id:row-group-0-A
            · ├── B LEAF id:j4SDrJw-0
            · └── B LEAF id:BexVZIg-1
        `);

        api.applyTransaction({
            update: [{ id: rowData[1].id, orgHierarchy: ['A', 'B', 'C'] }],
        });

        await new GridRows(api, 'updated', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A filler id:row-group-0-A
            · └─┬ B GROUP id:j4SDrJw-0
            · · └── C LEAF id:BexVZIg-1
        `);
    });

    test('can handle duplicates in the root', async () => {
        const rowData = [
            { id: 'KtTkR5g-0', orgHierarchy: ['A'] },
            { id: 'X80CJzw-1', orgHierarchy: ['A'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath: (data) => data.orgHierarchy,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = { checkDom: true };

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── A LEAF id:KtTkR5g-0
            └── A LEAF id:X80CJzw-1
        `);

        api.setGridOption('rowData', [
            { id: 'KtTkR5g-0', orgHierarchy: ['A'] },
            { id: 'X80CJzw-1', orgHierarchy: ['B'] },
        ]);

        await new GridRows(api, 'after update', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── A LEAF id:KtTkR5g-0
            └── B LEAF id:X80CJzw-1
        `);
    });

    test('allow swapping two nodes', async () => {
        const rowData = [
            { id: 'B5XPAQx-0', orgHierarchy: ['A', 'B'] },
            { id: 'K7mRgOg-2', orgHierarchy: ['A', 'C'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath: (data) => data.orgHierarchy,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = { checkDom: true };

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A filler id:row-group-0-A
            · ├── B LEAF id:B5XPAQx-0
            · └── C LEAF id:K7mRgOg-2
        `);

        api.applyTransaction({
            update: [
                { id: rowData[0].id, orgHierarchy: ['A', 'C'] },
                { id: rowData[1].id, orgHierarchy: ['A', 'B'] },
            ],
        });

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A filler id:row-group-0-A
            · ├── C LEAF id:B5XPAQx-0
            · └── B LEAF id:K7mRgOg-2
        `);
    });
});
