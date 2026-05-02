import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('group order maintenance / sort isolation', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('per-level sort isolation: secondary sort cannot tie-break a non-targeted level', async () => {
        const rowData = [
            { id: '1', country: 'Alpha', sales: 10 },
            { id: '2', country: 'Bravo', sales: 20 },
            { id: '3', country: 'Charlie', sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-isolation', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true, comparator: () => 0 },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'sales', sort: 'desc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'isolation: country in structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Alpha ag-Grid-AutoColumn:"Alpha" sales:10
            │ └── LEAF id:1 country:"Alpha" sales:10
            ├─┬ LEAF_GROUP id:row-group-country-Bravo ag-Grid-AutoColumn:"Bravo" sales:20
            │ └── LEAF id:2 country:"Bravo" sales:20
            └─┬ LEAF_GROUP id:row-group-country-Charlie ag-Grid-AutoColumn:"Charlie" sales:30
            · └── LEAF id:3 country:"Charlie" sales:30
        `);
    });

    test('leaf-column sort with custom comparator inspecting aggData does not reorder groups under groupMaintainOrder', async () => {
        const rowData = [
            { id: '1', country: 'Italy', sales: 5 },
            { id: '2', country: 'Italy', sales: 3 },
            { id: '3', country: 'France', sales: 2 },
            { id: '4', country: 'France', sales: 6 },
            { id: '5', country: 'USA', sales: 100 },
        ];

        const api = gridsManager.createGrid('grid-aggdata-comparator', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'sales',
                    aggFunc: 'sum',
                    sortable: true,
                    comparator: (_a, _b, nodeA, nodeB) => {
                        const aggA = (nodeA as any)?.aggData?.sales ?? (nodeA as any)?.data?.sales ?? 0;
                        const aggB = (nodeB as any)?.aggData?.sales ?? (nodeB as any)?.data?.sales ?? 0;
                        return aggA - aggB;
                    },
                },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'sales', sort: 'desc' }] });

        await new GridRows(api, 'aggData comparator: groups stay structural, leaves reorder').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:8
            │ ├── LEAF id:1 country:"Italy" sales:5
            │ └── LEAF id:2 country:"Italy" sales:3
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:8
            │ ├── LEAF id:4 country:"France" sales:6
            │ └── LEAF id:3 country:"France" sales:2
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:100
            · └── LEAF id:5 country:"USA" sales:100
        `);
    });

    test('uncoupled mode + aggFunc leaf-column sort: groups stay structural', async () => {
        const rowData = [
            { id: '1', country: 'Italy', sales: 5 },
            { id: '2', country: 'Italy', sales: 3 },
            { id: '3', country: 'France', sales: 2 },
            { id: '4', country: 'France', sales: 100 },
            { id: '5', country: 'USA', sales: 7 },
        ];

        const api = gridsManager.createGrid('grid-uncoupled-aggfunc-leaf', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: {
                headerName: 'Country',
                comparator: (a: unknown, b: unknown) =>
                    (a == null ? 0 : String(a).length) - (b == null ? 0 : String(b).length),
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'sales', sort: 'desc' }] });

        await new GridRows(api, 'uncoupled + aggFunc leaf sort: groups structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:8
            │ ├── LEAF id:1 country:"Italy" sales:5
            │ └── LEAF id:2 country:"Italy" sales:3
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:102
            │ ├── LEAF id:4 country:"France" sales:100
            │ └── LEAF id:3 country:"France" sales:2
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:7
            · └── LEAF id:5 country:"USA" sales:7
        `);
    });

    test('leaf rows are not reordered by a custom group-column comparator (data-row sort isolation)', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'Z' },
            { id: '2', country: 'Audi', athlete: 'A' },
            { id: '3', country: 'BMW', athlete: 'M' },
        ];

        const api = gridsManager.createGrid('grid-leaf-isolation', {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    sortable: true,
                    // Comparator that always returns 1 — even rows that share the group key would
                    // get reordered if this option reached the data-row sort.
                    comparator: () => 1,
                },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        await new GridRows(api, 'leaf isolation: data rows in data order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:1 country:"Audi" athlete:"Z"
            │ └── LEAF id:2 country:"Audi" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:3 country:"BMW" athlete:"M"
        `);
    });

    test('display column with own data: sort reaches both leaf rows AND group levels', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', displayLabel: 'Z-display' },
            { id: '2', country: 'Audi', athlete: 'A2', displayLabel: 'A-display' },
            { id: '3', country: 'BMW', athlete: 'B1', displayLabel: 'M-display' },
        ];

        const api = gridsManager.createGrid('grid-display-data', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true, comparator: () => 0 }, { field: 'athlete' }],
            autoGroupColumnDef: {
                headerName: 'Group',
                showRowGroup: true,
                field: 'displayLabel',
                sortable: true,
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });

        await new GridRows(api, 'display-data: leaf rows reordered by displayLabel').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:2 ag-Grid-AutoColumn:"A-display" country:"Audi" athlete:"A2"
            │ └── LEAF id:1 ag-Grid-AutoColumn:"Z-display" country:"Audi" athlete:"A1"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:3 ag-Grid-AutoColumn:"M-display" country:"BMW" athlete:"B1"
        `);
    });

    test('manual showRowGroup using source field (not colId) is not honoured by the grid — group order stays structural', async () => {
        const rowData = [
            { id: '1', country: 'Italy' },
            { id: '2', country: 'France' },
            { id: '3', country: 'Spain' },
        ];

        const api = gridsManager.createGrid('grid-manual-showrowgroup-by-field', {
            columnDefs: [
                {
                    colId: 'customCountry',
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                },
                {
                    colId: 'manualDisplay',
                    headerName: 'Manual Display',
                    showRowGroup: 'country', // field name, not colId — the grid does NOT resolve this
                    sortable: true,
                },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        const groupRowsBefore = api
            .getRenderedNodes()
            .filter((n) => n.group)
            .map((n) => ({ key: n.key, groupData: n.groupData?.['manualDisplay'] }));
        expect(groupRowsBefore.every((r) => r.groupData == null)).toBe(true);

        api.applyColumnState({ state: [{ colId: 'manualDisplay', sort: 'desc' }] });
        const groupOrderAfterSort = api
            .getRenderedNodes()
            .filter((n) => n.group)
            .map((n) => n.key);
        expect(groupOrderAfterSort).toEqual(['Italy', 'France', 'Spain']);
    });

    test('auto-display column with own field reorders groups under custom comparator (uncoupled escape hatch)', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'A1', displayLabel: 'long-label-Z' },
            { id: '2', country: 'Audi', athlete: 'A2', displayLabel: 'short-A' },
            { id: '3', country: 'BMW', athlete: 'B1', displayLabel: 'm-BMW' },
            { id: '4', country: 'Tesla', athlete: 'T1', displayLabel: 'mid-T' },
        ];

        const api = gridsManager.createGrid('grid-display-regression', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                headerName: 'Group',
                showRowGroup: true,
                field: 'displayLabel',
                sortable: true,
                // Custom comparator on autoGroupColumnDef triggers uncoupled mode.
                comparator: (a: unknown, b: unknown) => {
                    const aLen = a == null ? 0 : String(a).length;
                    const bLen = b == null ? 0 : String(b).length;
                    return aLen - bLen;
                },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });

        await new GridRows(api, 'auto-display sort: groups + leaves reorder by length').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:3 ag-Grid-AutoColumn:"m-BMW" country:"BMW" athlete:"B1"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:2 ag-Grid-AutoColumn:"short-A" country:"Audi" athlete:"A2"
            │ └── LEAF id:1 ag-Grid-AutoColumn:"long-label-Z" country:"Audi" athlete:"A1"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:4 ag-Grid-AutoColumn:"mid-T" country:"Tesla" athlete:"T1"
        `);
    });

    test('display column with own comparator (no field/valueGetter): leaf rows sort by the comparator', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'Anna' },
            { id: '2', country: 'Audi', athlete: 'Marco' },
            { id: '3', country: 'BMW', athlete: 'Luca' },
        ];

        const api = gridsManager.createGrid('grid-comparator-only-display', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                headerName: 'Group',
                showRowGroup: true,
                sortable: true,
                comparator: (_a, _b, nodeA, nodeB) => {
                    const lenA = nodeA?.data?.athlete?.length ?? 0;
                    const lenB = nodeB?.data?.athlete?.length ?? 0;
                    return lenA - lenB;
                },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'desc' }] });

        await new GridRows(api, 'comparator-only display column: leaves reorder by length desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├── LEAF id:2 country:"Audi" athlete:"Marco"
            │ └── LEAF id:1 country:"Audi" athlete:"Anna"
            └─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            · └── LEAF id:3 country:"BMW" athlete:"Luca"
        `);
    });
});
