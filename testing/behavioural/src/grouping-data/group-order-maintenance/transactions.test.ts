import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../../test-utils';

describe('group order maintenance / transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('empty leaf group: leaf-column sort is applied when data is later added by transaction', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', total: 5 },
            { id: '2', country: 'BMW', athlete: 'B1', total: 8 },
        ];

        const api = gridsManager.createGrid('grid-empty-leaf', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'total', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'total', sort: 'desc' }] });

        applyTransactionChecked(api, {
            add: [
                { id: '3', country: 'Tesla', athlete: 'T1', total: 4 },
                { id: '4', country: 'Tesla', athlete: 'T2', total: 9 },
            ],
        });

        await new GridRows(api, 'empty-leaf: new rows in leaf-sort order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A1" total:5
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B1" total:8
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · ├── LEAF id:4 country:"Tesla" athlete:"T2" total:9
            · └── LEAF id:3 country:"Tesla" athlete:"T1" total:4
        `);
    });

    test('new group is appended at end when groupMaintainOrder is true', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Ireland', athlete: 'I2' },
            { id: '3', country: 'Italy', athlete: 'It1' },
        ];

        const api = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"It1"
        `);

        applyTransactionChecked(api, { add: [{ id: '4', country: 'France', athlete: 'F1' }] });

        await new GridRows(api, 'after add France').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── athlete "Athlete" width:200
        `);
    });

    test('updating a row without changing group does not change group order (groupMaintainOrder=true)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Ireland', athlete: 'I2' },
            { id: '3', country: 'Italy', athlete: 'It1' },
            { id: '4', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid2', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        applyTransactionChecked(api, { update: [{ id: '2', country: 'Ireland', athlete: 'I2-upd' }] });

        await new GridRows(api, 'after update').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2-upd"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── athlete "Athlete" width:200
        `);
    });

    test('group order is stable across rowData reorder (immutable mode, getRowId)', async () => {
        let rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '3', country: 'Tesla', athlete: 'T' },
        ];

        const api = gridsManager.createGrid('grid-reorder', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'reorder: initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);

        rowData = [
            { id: '3', country: 'Tesla', athlete: 'T' },
            { id: '2', country: 'BMW', athlete: 'B' },
            { id: '1', country: 'Audi', athlete: 'A' },
        ];
        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'reorder: groups stay in creation order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"T"
        `);
    });
});
