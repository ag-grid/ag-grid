import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, setRowDataChecked } from '../test-utils';

describe('grouping leaf ordering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('degrouped rows follow the base rowData order and blank groups refresh correctly', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'make' }, { field: 'model' }, { field: 'group', rowGroup: true }],
            defaultColDef: { flex: 1 },
            groupDisplayType: 'groupRows',
            groupDefaultExpanded: -1,
            rowData: getFirstScenarioData(),
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('grouping-leafs-order-update', gridOptions);

        await new GridRows(api, 'initial first scenario').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-New
            │ ├── LEAF id:A id:"A" make:"Toyota" model:"Celica" group:"New"
            │ └── LEAF id:B id:"B" make:"Ford" model:"Mondeo" group:"New"
            └─┬ LEAF_GROUP id:row-group-group-
            · ├── LEAF id:C id:"C" make:"Porsche" model:"Boxster"
            · └── LEAF id:D id:"D" make:"Ford2" model:"Boxster"
        `);

        applyTransactionChecked(api, {
            update: [
                {
                    id: 'B',
                    make: 'Ford',
                    model: 'Mondeo',
                    group: null,
                },
            ],
        });

        await new GridRows(api, 'after removing B from its group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-New
            │ └── LEAF id:A id:"A" make:"Toyota" model:"Celica" group:"New"
            └─┬ LEAF_GROUP id:row-group-group-
            · ├── LEAF id:B id:"B" make:"Ford" model:"Mondeo" group:null
            · ├── LEAF id:C id:"C" make:"Porsche" model:"Boxster"
            · └── LEAF id:D id:"D" make:"Ford2" model:"Boxster"
        `);

        api.refreshClientSideRowModel();

        await new GridRows(api, 'after refreshing client-side model').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-New
            │ └── LEAF id:A id:"A" make:"Toyota" model:"Celica" group:"New"
            └─┬ LEAF_GROUP id:row-group-group-
            · ├── LEAF id:B id:"B" make:"Ford" model:"Mondeo" group:null
            · ├── LEAF id:C id:"C" make:"Porsche" model:"Boxster"
            · └── LEAF id:D id:"D" make:"Ford2" model:"Boxster"
        `);
    });

    test('full row reorders honor new rowData both before and after refresh', async () => {
        const initialRowData = getSecondScenarioData();
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'make' }, { field: 'model' }, { field: 'group', rowGroup: true }],
            defaultColDef: { flex: 1 },
            groupDisplayType: 'groupRows',
            groupDefaultExpanded: -1,
            rowData: initialRowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('grouping-leafs-order-refresh', gridOptions);

        const reversedRowData = getSecondScenarioData().reverse();

        setRowDataChecked(api, reversedRowData);

        await new GridRows(api, 'after reversing rows via rowData setter').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-New
            │ ├── LEAF id:B id:"B" make:"Ford" model:"Mondeo" group:"New"
            │ └── LEAF id:A id:"A" make:"Toyota" model:"Celica" group:"New"
            └─┬ LEAF_GROUP id:row-group-group-Old
            · ├── LEAF id:D id:"D" make:"Ford2" model:"Boxster" group:"Old"
            · └── LEAF id:C id:"C" make:"Porsche" model:"Boxster" group:"Old"
        `);

        setRowDataChecked(api, []);
        setRowDataChecked(api, reversedRowData);

        await new GridRows(api, 'after clearing and reloading reversed rows').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Old
            │ ├── LEAF id:D id:"D" make:"Ford2" model:"Boxster" group:"Old"
            │ └── LEAF id:C id:"C" make:"Porsche" model:"Boxster" group:"Old"
            └─┬ LEAF_GROUP id:row-group-group-New
            · ├── LEAF id:B id:"B" make:"Ford" model:"Mondeo" group:"New"
            · └── LEAF id:A id:"A" make:"Toyota" model:"Celica" group:"New"
        `);
    });
});

function getFirstScenarioData() {
    return [
        {
            id: 'A',
            make: 'Toyota',
            model: 'Celica',
            group: 'New',
        },
        {
            id: 'B',
            make: 'Ford',
            model: 'Mondeo',
            group: 'New',
        },
        {
            id: 'C',
            make: 'Porsche',
            model: 'Boxster',
        },
        {
            id: 'D',
            make: 'Ford2',
            model: 'Boxster',
        },
    ];
}

function getSecondScenarioData() {
    return [
        {
            id: 'A',
            make: 'Toyota',
            model: 'Celica',
            group: 'New',
        },
        {
            id: 'B',
            make: 'Ford',
            model: 'Mondeo',
            group: 'New',
        },
        {
            id: 'C',
            make: 'Porsche',
            model: 'Boxster',
            group: 'Old',
        },
        {
            id: 'D',
            make: 'Ford2',
            model: 'Boxster',
            group: 'Old',
        },
    ];
}
