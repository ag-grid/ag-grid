import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('group order maintenance / clear sort', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    afterEach(() => gridsManager.reset());

    test('apply group sort then clear: structural order is restored, not the prior sorted order', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'France', athlete: 'F' },
            { id: '3', country: 'Italy', athlete: 'I' },
        ];

        const api = gridsManager.createGrid('grid-clear-sort', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true, sortable: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'clear-sort: initial structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"I"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
        await new GridRows(api, 'clear-sort: country desc reorders groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"I"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · └── LEAF id:1 country:"Audi" athlete:"A"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: null }] });
        await new GridRows(api, 'clear-sort: structural order restored, not the prior desc order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"I"
        `);
    });

    test('single-sort: applying a leaf sort while a group sort is active clears the group sort and restores structural group order', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'It' },
            { id: '2', country: 'France', athlete: 'Fr' },
            { id: '3', country: 'Audi', athlete: 'Au' },
        ];

        const api = gridsManager.createGrid('grid-single-sort-clear-other', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });
        await new GridRows(api, 'single-sort: country asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Au"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"Fr"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:1 country:"Italy" athlete:"It"
        `);

        api.applyColumnState({
            state: [{ colId: 'athlete', sort: 'asc' }],
            defaultState: { sort: null },
        });
        await new GridRows(api, 'single-sort: leaf sort active, group sort cleared — structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:1 country:"Italy" athlete:"It"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"Fr"
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · └── LEAF id:3 country:"Audi" athlete:"Au"
        `);
    });

    test('multi-level clear-sort: clearing one level restores structural order at that level only', async () => {
        const rowData = [
            { id: '1', country: 'Italy', year: 2021 },
            { id: '2', country: 'Italy', year: 2020 },
            { id: '3', country: 'France', year: 2019 },
            { id: '4', country: 'France', year: 2022 },
        ];

        const api = gridsManager.createGrid('grid-multilevel-clear-sort', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'year', rowGroup: true, hide: true, sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'desc', sortIndex: 0 },
                { colId: 'year', sort: 'asc', sortIndex: 1 },
            ],
        });
        await new GridRows(api, 'multilevel: country desc + year asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:2 country:"Italy" year:2020
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:1 country:"Italy" year:2021
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · │ └── LEAF id:3 country:"France" year:2019
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            · · └── LEAF id:4 country:"France" year:2022
        `);

        api.applyColumnState({ state: [{ colId: 'year', sort: null }] });
        await new GridRows(api, 'multilevel: clear year — country desc kept, years structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ │ └── LEAF id:1 country:"Italy" year:2021
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:2 country:"Italy" year:2020
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · │ └── LEAF id:3 country:"France" year:2019
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            · · └── LEAF id:4 country:"France" year:2022
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: null }] });
        await new GridRows(api, 'multilevel: clear country too — fully structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ │ └── LEAF id:1 country:"Italy" year:2021
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:2 country:"Italy" year:2020
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · │ └── LEAF id:3 country:"France" year:2019
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            · · └── LEAF id:4 country:"France" year:2022
        `);
    });

    test('clear-sort after coincidental match: structural order persists after subsequent refresh', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A' },
            { id: '2', country: 'France', athlete: 'F' },
            { id: '3', country: 'Italy', athlete: 'I' },
        ];

        const api = gridsManager.createGrid('grid-coincidental-match-clear', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true, sortable: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Sort country asc — produces [Audi, France, Italy] which equals structural order.
        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });
        await new GridRows(api, 'coincidental: country asc matches structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"I"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: null }] });
        api.refreshClientSideRowModel('sort');
        await new GridRows(api, 'coincidental: cleared and re-refreshed — structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 country:"France" athlete:"F"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"I"
        `);
    });

    test('treeData + groupMaintainOrder: per-level isolation does not apply, sort still runs', async () => {
        const rowData = [
            { id: '1', path: ['Audi'], name: 'Audi' },
            { id: '2', path: ['Audi', 'A2'], name: 'A2' },
            { id: '3', path: ['Audi', 'A1'], name: 'A1' },
            { id: '4', path: ['BMW'], name: 'BMW' },
            { id: '5', path: ['BMW', 'B1'], name: 'B1' },
        ];

        const api = gridsManager.createGrid('grid-tree-data-maintain', {
            columnDefs: [{ field: 'name', sortable: true }],
            treeData: true,
            getDataPath: (data: any) => data.path,
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'tree+maintain: initial structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Audi GROUP id:1 ag-Grid-AutoColumn:"Audi" name:"Audi"
            │ ├── A2 LEAF id:2 ag-Grid-AutoColumn:"A2" name:"A2"
            │ └── A1 LEAF id:3 ag-Grid-AutoColumn:"A1" name:"A1"
            └─┬ BMW GROUP id:4 ag-Grid-AutoColumn:"BMW" name:"BMW"
            · └── B1 LEAF id:5 ag-Grid-AutoColumn:"B1" name:"B1"
        `);

        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
        await new GridRows(api, 'tree+maintain: sort cascades — full reorder, no isolation').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Audi GROUP id:1 ag-Grid-AutoColumn:"Audi" name:"Audi"
            │ ├── A1 LEAF id:3 ag-Grid-AutoColumn:"A1" name:"A1"
            │ └── A2 LEAF id:2 ag-Grid-AutoColumn:"A2" name:"A2"
            └─┬ BMW GROUP id:4 ag-Grid-AutoColumn:"BMW" name:"BMW"
            · └── B1 LEAF id:5 ag-Grid-AutoColumn:"B1" name:"B1"
        `);

        api.applyColumnState({ state: [{ colId: 'name', sort: null }] });
        await new GridRows(api, 'tree+maintain: clear sort — structural order restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Audi GROUP id:1 ag-Grid-AutoColumn:"Audi" name:"Audi"
            │ ├── A2 LEAF id:2 ag-Grid-AutoColumn:"A2" name:"A2"
            │ └── A1 LEAF id:3 ag-Grid-AutoColumn:"A1" name:"A1"
            └─┬ BMW GROUP id:4 ag-Grid-AutoColumn:"BMW" name:"BMW"
            · └── B1 LEAF id:5 ag-Grid-AutoColumn:"B1" name:"B1"
        `);
    });

    test('manual showRowGroup + own field: leaves reorder by the column own data', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'A1', label: 'M' },
            { id: '2', country: 'Italy', athlete: 'A2', label: 'A' },
            { id: '3', country: 'France', athlete: 'B1', label: 'Z' },
        ];

        const api = gridsManager.createGrid('grid-manual-showrowgroup-own-data', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                {
                    colId: 'manualDisplay',
                    headerName: 'Manual',
                    showRowGroup: 'country',
                    field: 'label',
                    sortable: true,
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: { suppressCount: true },
                },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'manualDisplay', sort: 'asc' }] });

        await new GridRows(api, 'manual showRowGroup + own field: leaves reorder by label').check(`
            ROOT id:ROOT_NODE_ID manualDisplay:null
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" manualDisplay:"Italy"
            │ ├── LEAF id:2 country:"Italy" athlete:"A2" manualDisplay:"A"
            │ └── LEAF id:1 country:"Italy" athlete:"A1" manualDisplay:"M"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" manualDisplay:"France"
            · └── LEAF id:3 country:"France" athlete:"B1" manualDisplay:"Z"
        `);
    });

    test('uncoupled manual showRowGroup with custom comparator: groups reorder by the manual column comparator', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'A1', label: 'M' },
            { id: '2', country: 'Italy', athlete: 'A2', label: 'A' },
            { id: '3', country: 'France', athlete: 'B1', label: 'Z' },
            { id: '4', country: 'BMW', athlete: 'C1', label: 'Q' },
        ];

        const api = gridsManager.createGrid('grid-manual-showrowgroup-own-data-uncoupled', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                {
                    colId: 'manualDisplay',
                    headerName: 'Manual',
                    showRowGroup: 'country',
                    field: 'label',
                    sortable: true,
                    comparator: (a: unknown, b: unknown) => {
                        const aLen = a == null ? 0 : String(a).length;
                        const bLen = b == null ? 0 : String(b).length;
                        return aLen - bLen;
                    },
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: { suppressCount: true },
                },
            ],
            autoGroupColumnDef: { comparator: () => 0 },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'manualDisplay', sort: 'asc' }] });

        await new GridRows(api, 'manual showRowGroup sort: groups reorder by length').check(`
            ROOT id:ROOT_NODE_ID manualDisplay:null
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW" manualDisplay:"BMW"
            │ └── LEAF id:4 country:"BMW" athlete:"C1" manualDisplay:"Q"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" manualDisplay:"Italy"
            │ ├── LEAF id:1 country:"Italy" athlete:"A1" manualDisplay:"M"
            │ └── LEAF id:2 country:"Italy" athlete:"A2" manualDisplay:"A"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" manualDisplay:"France"
            · └── LEAF id:3 country:"France" athlete:"B1" manualDisplay:"Z"
        `);
    });
});
