import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../../test-utils';

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

    test('manual showRowGroup using a non-matching colId is not honoured by the grid — group order stays structural', async () => {
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
                    showRowGroup: 'unresolvable-link',
                    sortable: true,
                },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'unresolvable showRowGroup: initial structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-customCountry-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:1 customCountry:"Italy"
            ├─┬ LEAF_GROUP id:row-group-customCountry-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:2 customCountry:"France"
            └─┬ LEAF_GROUP id:row-group-customCountry-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:3 customCountry:"Spain"
        `);

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

        await new GridColumns(api, 'unresolvable showRowGroup: column state after sort').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── manualDisplay "Manual Display" width:200 sort:desc
        `);
    });

    test('unresolved showRowGroup colId with own field: group level unreachable, sort still applies at leaf level', async () => {
        // `showRowGroup: '<colId>'` that does not match an active rowGroup column is a
        // misconfiguration: the grid cannot render it as a group cell (no link). The group
        // level is unreachable. But the column still has its own `field` — the user has
        // expressed sort intent on a column with leaf data, so honour it at the leaf level.
        // Dropping the option entirely would silently ignore a deliberate user click.
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Charlie' },
            { id: '2', country: 'Italy', athlete: 'Alpha' },
            { id: '3', country: 'Italy', athlete: 'Bravo' },
            { id: '4', country: 'France', athlete: 'Zeta' },
            { id: '5', country: 'France', athlete: 'Yvette' },
        ];

        const api = gridsManager.createGrid('grid-unresolved-showrowgroup-with-field', {
            columnDefs: [
                { colId: 'customCountry', field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'manualDisplay',
                    headerName: 'Manual Display',
                    showRowGroup: 'unresolvable-link',
                    field: 'athlete',
                    sortable: true,
                },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Initial order: groups in insertion order, leaves in insertion order within each group.
        await new GridRows(api, 'unresolved showRowGroup: initial structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-customCountry-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:1 customCountry:"Italy" manualDisplay:"Charlie"
            │ ├── LEAF id:2 customCountry:"Italy" manualDisplay:"Alpha"
            │ └── LEAF id:3 customCountry:"Italy" manualDisplay:"Bravo"
            └─┬ LEAF_GROUP id:row-group-customCountry-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:4 customCountry:"France" manualDisplay:"Zeta"
            · └── LEAF id:5 customCountry:"France" manualDisplay:"Yvette"
        `);

        api.applyColumnState({ state: [{ colId: 'manualDisplay', sort: 'asc' }] });

        // Groups stay in structural order (no group level matched by the unresolved link).
        // Leaves inside each group sort by `field: 'athlete'` ascending — the column has own
        // leaf data and the user clicked sort, so the leaf bucket route applies.
        await new GridRows(api, 'unresolved showRowGroup with field: leaves sort by own data').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-customCountry-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:2 customCountry:"Italy" manualDisplay:"Alpha"
            │ ├── LEAF id:3 customCountry:"Italy" manualDisplay:"Bravo"
            │ └── LEAF id:1 customCountry:"Italy" manualDisplay:"Charlie"
            └─┬ LEAF_GROUP id:row-group-customCountry-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:5 customCountry:"France" manualDisplay:"Yvette"
            · └── LEAF id:4 customCountry:"France" manualDisplay:"Zeta"
        `);

        await new GridColumns(api, 'unresolved showRowGroup: column state shows sort recorded').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── manualDisplay "Manual Display" width:200 sort:asc
        `);
    });

    test('showRowGroup string matching a `field`: link resolves via getColDefCol, coupled-sort engages', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Charlie' },
            { id: '2', country: 'Italy', athlete: 'Alpha' },
            { id: '3', country: 'Italy', athlete: 'Bravo' },
            { id: '4', country: 'France', athlete: 'Zeta' },
            { id: '5', country: 'France', athlete: 'Yvette' },
        ];

        const api = gridsManager.createGrid('grid-showrowgroup-by-field', {
            columnDefs: [
                { colId: 'customCountry', field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'manualDisplay',
                    headerName: 'Manual Display',
                    showRowGroup: 'country',
                    field: 'athlete',
                    sortable: true,
                },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'manualDisplay', sort: 'asc' }] });

        // Sort only set on manualDisplay; customCountry's sort is null. Production's mixed-check
        // sees own=asc, linked=null → renders 'mixed'. Leaves still get sorted by 'athlete'.
        await new GridRows(api, 'field-resolved showRowGroup: leaves sort by own data').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-customCountry-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:2 customCountry:"Italy" manualDisplay:"Alpha"
            │ ├── LEAF id:3 customCountry:"Italy" manualDisplay:"Bravo"
            │ └── LEAF id:1 customCountry:"Italy" manualDisplay:"Charlie"
            └─┬ LEAF_GROUP id:row-group-customCountry-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:5 customCountry:"France" manualDisplay:"Yvette"
            · └── LEAF id:4 customCountry:"France" manualDisplay:"Zeta"
        `);

        // Column state still records sort:asc on manualDisplay (the model state, not the
        // displayed/rendered sort). The validator correctly accepts the resulting
        // aria-sort='other' because the linked customCountry has no sort, producing a mixed
        // displayed state.
        await new GridColumns(api, 'field-resolved showRowGroup: column state shows sort recorded').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── manualDisplay "Manual Display" width:200 sort:asc
        `);
    });

    test('unresolved showRowGroup colId without own data: option dropped (nothing to sort by)', async () => {
        // Same misconfig as above, but the manual display column has NO `field`/`valueGetter`/
        // `comparator` of its own. The group level is unreachable AND there is no leaf data —
        // nothing meaningful to sort by, so the option drops out entirely. Groups and leaves
        // both stay in structural order.
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Charlie' },
            { id: '2', country: 'Italy', athlete: 'Alpha' },
            { id: '3', country: 'Italy', athlete: 'Bravo' },
            { id: '4', country: 'France', athlete: 'Zeta' },
            { id: '5', country: 'France', athlete: 'Yvette' },
        ];

        const api = gridsManager.createGrid('grid-unresolved-showrowgroup-no-data', {
            columnDefs: [
                { colId: 'customCountry', field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'manualDisplay',
                    headerName: 'Manual Display',
                    showRowGroup: 'unresolvable-link',
                    sortable: true,
                    // No field / valueGetter / comparator.
                },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'manualDisplay', sort: 'asc' }] });

        // No own leaf data → option dropped → structural order at every level.
        await new GridRows(api, 'unresolved showRowGroup, no own data: structural order kept').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-customCountry-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:1 customCountry:"Italy"
            │ ├── LEAF id:2 customCountry:"Italy"
            │ └── LEAF id:3 customCountry:"Italy"
            └─┬ LEAF_GROUP id:row-group-customCountry-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:4 customCountry:"France"
            · └── LEAF id:5 customCountry:"France"
        `);
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

    test('singleColumn shared display + source rowGroup column with independent sortIndexes: priority follows the user-specified order at each level', async () => {
        const rowData = [
            { id: '1', country: 'Italy', sales: 5 },
            { id: '2', country: 'Audi', sales: 20 },
            { id: '3', country: 'France', sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-shared-display-priority', {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    sortable: true,
                    comparator: (_a, _b, nodeA, nodeB) => {
                        const aKey = String(nodeA?.key ?? '');
                        const bKey = String(nodeB?.key ?? '');
                        return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
                    },
                },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: {
                headerName: 'Group',
                sortable: true,
                // Uncoupled marker: the auto-display's own comparator orders groups by aggregate
                // sales descending (Italy=5, Audi=20, France=30 → France, Audi, Italy).
                comparator: (_a, _b, nodeA, nodeB) => (nodeB?.aggData?.sales ?? 0) - (nodeA?.aggData?.sales ?? 0),
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'ag-Grid-AutoColumn', sort: 'asc', sortIndex: 0 },
                { colId: 'country', sort: 'asc', sortIndex: 1 },
            ],
        });
        await new GridRows(api, 'priority A: auto-display primary, country secondary').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:30
            │ └── LEAF id:3 country:"France" sales:30
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:20
            │ └── LEAF id:2 country:"Audi" sales:20
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:5
            · └── LEAF id:1 country:"Italy" sales:5
        `);

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'ag-Grid-AutoColumn', sort: 'asc', sortIndex: 1 },
            ],
        });
        await new GridRows(api, 'priority B: country primary, auto-display secondary').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:20
            │ └── LEAF id:2 country:"Audi" sales:20
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:30
            │ └── LEAF id:3 country:"France" sales:30
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:5
            · └── LEAF id:1 country:"Italy" sales:5
        `);
    });
});
