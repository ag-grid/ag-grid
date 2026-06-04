import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../../test-utils';

describe('group order maintenance / delta sort', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    // 6-row leaf group used by the deltaSort tests below. ≥5 rows is required to exercise the
    // _doDeltaSort merge path (it falls back to full sort for unsortedRowsLen ≤ MIN_DELTA_SORT_ROWS=4).
    const ITALY_SIX_ROWS = [
        { id: '1', country: 'Italy', athlete: 'Mark' },
        { id: '2', country: 'Italy', athlete: 'Anna' },
        { id: '3', country: 'Italy', athlete: 'Carl' },
        { id: '4', country: 'Italy', athlete: 'Bob' },
        { id: '5', country: 'Italy', athlete: 'Zed' },
        { id: '6', country: 'Italy', athlete: 'David' },
    ] as const;

    const ITALY_SIX_ROWS_ASC = `
        ROOT id:ROOT_NODE_ID
        └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
        · ├── LEAF id:2 country:"Italy" athlete:"Anna"
        · ├── LEAF id:4 country:"Italy" athlete:"Bob"
        · ├── LEAF id:3 country:"Italy" athlete:"Carl"
        · ├── LEAF id:6 country:"Italy" athlete:"David"
        · ├── LEAF id:1 country:"Italy" athlete:"Mark"
        · └── LEAF id:5 country:"Italy" athlete:"Zed"
    `;

    // Generic helper for delta-sort + groupMaintainOrder grids — each test supplies its own
    // columnDefs / rowData / extras. Shared options (animateRows, groupDefaultExpanded,
    // groupMaintainOrder, deltaSort, getRowId) are the load-bearing setup for every delta-sort
    // scenario in this file.
    const createDeltaSortGrid = (gridName: string, overrides: Record<string, any>) =>
        gridsManager.createGrid(gridName, {
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            deltaSort: true,
            getRowId: (p: any) => p.data.id,
            ...overrides,
        });

    // Italy/athlete shorthand — used by the 6-row ITALY_SIX_ROWS tests.
    const createDeltaSortItalyGrid = (gridName: string) =>
        createDeltaSortGrid(gridName, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            rowData: ITALY_SIX_ROWS.map((r) => ({ ...r })),
        });

    test('deltaSort + groupMaintainOrder: per-level isolation holds across transactions', async () => {
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, athlete: 'Zed' },
            { id: '2', country: 'Italy', year: 2021, athlete: 'Anna' },
            { id: '3', country: 'France', year: 2019, athlete: 'Mark' },
            { id: '4', country: 'France', year: 2019, athlete: 'Bob' },
        ];

        const api = createDeltaSortGrid('grid-delta-sort', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowData,
        });

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'deltaSort: leaf rows sort, country/year groups stay structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Anna"
            │ · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            · · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
        `);

        // Transaction add: id=5 goes to Italy/2021. delta sort fires at the leaf group, structural
        // baseline stays at country and year levels. Bart sorts between Anna and Zed.
        applyTransactionChecked(api, { add: [{ id: '5', country: 'Italy', year: 2021, athlete: 'Bart' }] });
        await new GridRows(api, 'deltaSort: after add — Bart placed in sorted leaf position').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Anna"
            │ · ├── LEAF id:5 country:"Italy" year:2021 athlete:"Bart"
            │ · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            · · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
        `);

        // Update an athlete name to force a re-sort within the same leaf group; group order
        // must remain unchanged.
        applyTransactionChecked(api, {
            update: [{ id: '2', country: 'Italy', year: 2021, athlete: 'Yves' }],
        });
        await new GridRows(api, 'deltaSort: after update — re-sorted leaf, groups still structural').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:5 country:"Italy" year:2021 athlete:"Bart"
            │ · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Yves"
            │ · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            · · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            · · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
        `);
    });

    test('deltaSort + postSortRows-pinned group + transactions: per-level baseline integrity', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Mark' },
            { id: '2', country: 'France', athlete: 'Bob' },
            { id: '3', country: 'Italy', athlete: 'Anna' },
            { id: '4', country: 'France', athlete: 'Zed' },
        ];

        const api = createDeltaSortGrid('grid-delta-postsort', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            rowData,
            postSortRows: (params: any) => {
                const idx = params.nodes.findIndex((n: any) => n.key === 'Italy');
                if (idx > 0) {
                    const [pinned] = params.nodes.splice(idx, 1);
                    params.nodes.unshift(pinned);
                }
            },
        });

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        await new GridRows(api, 'delta+postSort: initial — Italy pinned, leaves sorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Mark"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);

        applyTransactionChecked(api, { add: [{ id: '5', country: 'France', athlete: 'Carl' }] });
        await new GridRows(api, 'delta+postSort: add — Carl placed in sorted slot, Italy still pinned').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Mark"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · ├── LEAF id:5 country:"France" athlete:"Carl"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);

        applyTransactionChecked(api, { update: [{ id: '1', country: 'Italy', athlete: 'Yann' }] });
        await new GridRows(api, 'delta+postSort: update reorders Italy leaves, Italy still pinned').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Yann"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · ├── LEAF id:5 country:"France" athlete:"Carl"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);
    });

    test('deltaSort + postSortRows pinning at a sorted leaf level: full-sort fallback places new rows correctly', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Mark' },
            { id: '2', country: 'Italy', athlete: 'Anna' },
            { id: '3', country: 'Italy', athlete: 'Carl' },
            { id: '4', country: 'Italy', athlete: 'Bob' },
            { id: '5', country: 'Italy', athlete: 'Zed' },
            { id: '6', country: 'Italy', athlete: 'David' },
        ];

        const api = createDeltaSortGrid('grid-delta-postsort-sorted-leaf', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            rowData,
            postSortRows: (params: any) => {
                // Pin Zed to the front of any leaf array containing him.
                const idx = params.nodes.findIndex((n: any) => n.data?.athlete === 'Zed');
                if (idx > 0) {
                    const [pinned] = params.nodes.splice(idx, 1);
                    params.nodes.unshift(pinned);
                }
            },
        });

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        await new GridRows(api, 'delta+postSort sorted leaf: initial — Zed pinned, rest asc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:5 country:"Italy" athlete:"Zed"
            · ├── LEAF id:2 country:"Italy" athlete:"Anna"
            · ├── LEAF id:4 country:"Italy" athlete:"Bob"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · ├── LEAF id:6 country:"Italy" athlete:"David"
            · └── LEAF id:1 country:"Italy" athlete:"Mark"
        `);

        applyTransactionChecked(api, { add: [{ id: '7', country: 'Italy', athlete: 'Eric' }] });
        await new GridRows(api, 'delta+postSort sorted leaf: add — Eric in correct sorted slot').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:5 country:"Italy" athlete:"Zed"
            · ├── LEAF id:2 country:"Italy" athlete:"Anna"
            · ├── LEAF id:4 country:"Italy" athlete:"Bob"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · ├── LEAF id:6 country:"Italy" athlete:"David"
            · ├── LEAF id:7 country:"Italy" athlete:"Eric"
            · └── LEAF id:1 country:"Italy" athlete:"Mark"
        `);

        applyTransactionChecked(api, { update: [{ id: '1', country: 'Italy', athlete: 'Yann' }] });
        await new GridRows(api, 'delta+postSort sorted leaf: update reorders, Zed still pinned').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:5 country:"Italy" athlete:"Zed"
            · ├── LEAF id:2 country:"Italy" athlete:"Anna"
            · ├── LEAF id:4 country:"Italy" athlete:"Bob"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · ├── LEAF id:6 country:"Italy" athlete:"David"
            · ├── LEAF id:7 country:"Italy" athlete:"Eric"
            · └── LEAF id:1 country:"Italy" athlete:"Yann"
        `);
    });

    test('deltaSort + filter cycle interleaved with transactions: leaves stay correctly sorted', async () => {
        const rowData = [
            { id: '1', country: 'Italy', athlete: 'Mark' },
            { id: '2', country: 'France', athlete: 'Bob' },
            { id: '3', country: 'Italy', athlete: 'Anna' },
            { id: '4', country: 'France', athlete: 'Zed' },
            { id: '5', country: 'Spain', athlete: 'Carlos' },
        ];

        const api = createDeltaSortGrid('grid-delta-filter-cycle', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            rowData,
        });

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        await new GridRows(api, 'delta-filter: initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Mark"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:2 country:"France" athlete:"Bob"
            │ └── LEAF id:4 country:"France" athlete:"Zed"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:5 country:"Spain" athlete:"Carlos"
        `);

        api.setGridOption('quickFilterText', 'France');
        await new GridRows(api, 'delta-filter: filtered to France').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);

        applyTransactionChecked(api, { add: [{ id: '6', country: 'Italy', athlete: 'Aaron' }] });
        await new GridRows(api, 'delta-filter: add to hidden group while filtered').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" athlete:"Bob"
            · └── LEAF id:4 country:"France" athlete:"Zed"
        `);

        applyTransactionChecked(api, { update: [{ id: '5', country: 'Spain', athlete: 'Aldo' }] });

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'delta-filter: clear filter — leaves still correctly sorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:6 country:"Italy" athlete:"Aaron"
            │ ├── LEAF id:3 country:"Italy" athlete:"Anna"
            │ └── LEAF id:1 country:"Italy" athlete:"Mark"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:2 country:"France" athlete:"Bob"
            │ └── LEAF id:4 country:"France" athlete:"Zed"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:5 country:"Spain" athlete:"Aldo"
        `);
    });

    test('deltaSort + filter cycle on a 6-row leaf group: re-entered rows are correctly placed', async () => {
        const api = createDeltaSortItalyGrid('grid-delta-large-leaf');
        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'delta-large: initial sorted').check(ITALY_SIX_ROWS_ASC);

        // Filter to 'r' — matches Carl + Mark only (2 rows → full-sort fallback path).
        api.setGridOption('quickFilterText', 'r');
        await new GridRows(api, 'delta-large: filter to 2 rows').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · └── LEAF id:1 country:"Italy" athlete:"Mark"
        `);

        // Clear filter — re-entered rows are NOT in changedRowNodes; they must still land in
        // the correct sorted positions on the merge path.
        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'delta-large: clear filter — all 6 rows correctly sorted').check(ITALY_SIX_ROWS_ASC);
    });

    test('deltaSort: changing sort direction triggers full sort, then transactions use the fresh baseline', async () => {
        // Sort-option changes refresh WITHOUT a transaction → full-sort path rebuilds the
        // baseline under the new options. The next transaction then engages delta sort with a
        // baseline that matches the current sortOptionsForLevel.
        const api = createDeltaSortItalyGrid('grid-delta-direction-flip');

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'delta-direction: initial asc').check(ITALY_SIX_ROWS_ASC);

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'desc' }] });
        await new GridRows(api, 'delta-direction: flipped to desc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:5 country:"Italy" athlete:"Zed"
            · ├── LEAF id:1 country:"Italy" athlete:"Mark"
            · ├── LEAF id:6 country:"Italy" athlete:"David"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · ├── LEAF id:4 country:"Italy" athlete:"Bob"
            · └── LEAF id:2 country:"Italy" athlete:"Anna"
        `);

        // Add a row — delta sort engages with the desc baseline. Eric must land between Mark
        // and David in desc order (after Mark, before David).
        applyTransactionChecked(api, { add: [{ id: '7', country: 'Italy', athlete: 'Eric' }] });
        await new GridRows(api, 'delta-direction: add Eric — placed in desc slot').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:5 country:"Italy" athlete:"Zed"
            · ├── LEAF id:1 country:"Italy" athlete:"Mark"
            · ├── LEAF id:7 country:"Italy" athlete:"Eric"
            · ├── LEAF id:6 country:"Italy" athlete:"David"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · ├── LEAF id:4 country:"Italy" athlete:"Bob"
            · └── LEAF id:2 country:"Italy" athlete:"Anna"
        `);
    });

    test('deltaSort + leaf group fully filtered out, mutated while hidden, then re-shown: leaves still correctly sorted', async () => {
        // Filter out every row in the only leaf group, mutate a hidden row via transaction, then
        // clear the filter. ≥5 rows after re-show ensures the merge path runs in _doDeltaSort.
        const api = createDeltaSortItalyGrid('grid-delta-fully-filtered');
        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'fully-filtered: initial sorted').check(ITALY_SIX_ROWS_ASC);

        // Filter to a substring no row matches — Italy group becomes fully filtered out.
        api.setGridOption('quickFilterText', 'NO-MATCH-TOKEN');
        await new GridRows(api, 'fully-filtered: nothing visible').check(`
            ROOT id:ROOT_NODE_ID
        `);

        // Mutate a hidden row's athlete: 'Anna' → 'Yvette' (was first asc, becomes near-last).
        applyTransactionChecked(api, { update: [{ id: '2', country: 'Italy', athlete: 'Yvette' }] });

        // Clear filter — all 6 rows reappear, sorted asc with Yvette in its new position.
        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'fully-filtered: re-shown — leaves sorted with mutation applied').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:4 country:"Italy" athlete:"Bob"
            · ├── LEAF id:3 country:"Italy" athlete:"Carl"
            · ├── LEAF id:6 country:"Italy" athlete:"David"
            · ├── LEAF id:1 country:"Italy" athlete:"Mark"
            · ├── LEAF id:2 country:"Italy" athlete:"Yvette"
            · └── LEAF id:5 country:"Italy" athlete:"Zed"
        `);
    });

    test('deltaSort + groupMaintainOrder runtime toggle + transaction: post-toggle refresh + transaction produces correct order', async () => {
        const rowData = [
            { id: '1', country: 'Italy', sales: 5 },
            { id: '2', country: 'Italy', sales: 3 },
            { id: '3', country: 'France', sales: 50 },
            { id: '4', country: 'France', sales: 20 },
            { id: '5', country: 'USA', sales: 100 },
            { id: '6', country: 'Germany', sales: 40 },
            { id: '7', country: 'Spain', sales: 10 },
        ];

        const api = gridsManager.createGrid('grid-runtime-toggle-delta-stale-baseline', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: false,
            deltaSort: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'sales', sort: 'desc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'initial: country asc + sales desc, groupMaintainOrder=false').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:70
            │ ├── LEAF id:3 country:"France" sales:50
            │ └── LEAF id:4 country:"France" sales:20
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" sales:40
            │ └── LEAF id:6 country:"Germany" sales:40
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:8
            │ ├── LEAF id:1 country:"Italy" sales:5
            │ └── LEAF id:2 country:"Italy" sales:3
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" sales:10
            │ └── LEAF id:7 country:"Spain" sales:10
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:100
            · └── LEAF id:5 country:"USA" sales:100
        `);

        api.setGridOption('groupMaintainOrder', true);
        applyTransactionChecked(api, { add: [{ id: '8', country: 'Italy', sales: 7 }] });

        await new GridRows(api, 'after toggle to true + add Italy row: per-level sort, no corruption').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:70
            │ ├── LEAF id:3 country:"France" sales:50
            │ └── LEAF id:4 country:"France" sales:20
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" sales:40
            │ └── LEAF id:6 country:"Germany" sales:40
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:15
            │ ├── LEAF id:8 country:"Italy" sales:7
            │ ├── LEAF id:1 country:"Italy" sales:5
            │ └── LEAF id:2 country:"Italy" sales:3
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" sales:10
            │ └── LEAF id:7 country:"Spain" sales:10
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:100
            · └── LEAF id:5 country:"USA" sales:100
        `);
    });

    test('deltaSort + groupMaintainOrder runtime toggle: aggregate-reading comparator + per-level narrowing produces correct order', async () => {
        // Under groupMaintainOrder=false the baseline is sorted by a custom country comparator
        // that reads `node.aggData.sales` (a per-group aggregate) AND a secondary `sales desc`
        // tie-breaker. Toggling to true is reactive: per-level narrowing strips the secondary,
        // and the toggle-triggered refresh re-sorts the country level with ONLY the aggregate
        // comparator. The subsequent transaction's delta-sort merge runs against this fresh
        // baseline.
        const rowData = [
            { id: '1', country: 'Italy', sales: 5 },
            { id: '2', country: 'Italy', sales: 4 },
            { id: '3', country: 'Italy', sales: 3 },
            { id: '4', country: 'Italy', sales: 2 },
            { id: '5', country: 'Italy', sales: 1 },
            { id: '6', country: 'France', sales: 50 },
            { id: '7', country: 'France', sales: 40 },
            { id: '8', country: 'France', sales: 30 },
            { id: '9', country: 'France', sales: 20 },
            { id: '10', country: 'France', sales: 10 },
            { id: '11', country: 'USA', sales: 200 },
            { id: '12', country: 'USA', sales: 100 },
            { id: '13', country: 'Germany', sales: 25 },
            { id: '14', country: 'Germany', sales: 15 },
            { id: '15', country: 'Spain', sales: 8 },
            { id: '16', country: 'Spain', sales: 7 },
        ];

        const api = gridsManager.createGrid('grid-runtime-toggle-stale-aggregate-comparator', {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    sortable: true,
                    // Aggregate-reading comparator on the rowGroup column. Non-zero between
                    // groups (different aggregates), zero between leaves in the same group
                    // (same aggregate). Drives an ordering that doesn't reduce to the group
                    // key alone, so narrowing the secondary tie-breaker can change the result.
                    comparator: (_a, _b, nodeA, nodeB) => {
                        const aggA = nodeA?.aggData?.sales ?? 0;
                        const aggB = nodeB?.aggData?.sales ?? 0;
                        return aggA - aggB;
                    },
                },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: false, // start with false → root sorted with FULL sortOptions
            deltaSort: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Activate sort: country asc (custom aggregate-reading comparator) + sales desc.
        // Under groupMaintainOrder=false, root level was sorted with BOTH options.
        // Country aggregates: Italy=15, France=150, USA=300, Germany=40, Spain=15.
        // Italy ties Spain on country comparator (both agg 15) → sales-desc tie-breaker reads
        // group-row aggregate sales = 15 for both, ties again → stable insertion order:
        // Italy before Spain.
        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'sales', sort: 'desc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'baseline: groupMaintainOrder=false, full options sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:15
            │ ├── LEAF id:1 country:"Italy" sales:5
            │ ├── LEAF id:2 country:"Italy" sales:4
            │ ├── LEAF id:3 country:"Italy" sales:3
            │ ├── LEAF id:4 country:"Italy" sales:2
            │ └── LEAF id:5 country:"Italy" sales:1
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" sales:15
            │ ├── LEAF id:15 country:"Spain" sales:8
            │ └── LEAF id:16 country:"Spain" sales:7
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" sales:40
            │ ├── LEAF id:13 country:"Germany" sales:25
            │ └── LEAF id:14 country:"Germany" sales:15
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:150
            │ ├── LEAF id:6 country:"France" sales:50
            │ ├── LEAF id:7 country:"France" sales:40
            │ ├── LEAF id:8 country:"France" sales:30
            │ ├── LEAF id:9 country:"France" sales:20
            │ └── LEAF id:10 country:"France" sales:10
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:300
            · ├── LEAF id:11 country:"USA" sales:200
            · └── LEAF id:12 country:"USA" sales:100
        `);

        // The hidden source `country` column carries the sort:asc state — only `sales` is
        // visible with its own sort indicator. The auto-display column has no own sort
        // indicator (the country sort is on the hidden source column, not propagated to the
        // auto-display column header in this configuration).
        await new GridColumns(api, 'baseline: column sort indicators').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── sales "Sales" width:200 sort:desc sortIndex:1 aggFunc:sum
        `);

        // Toggle to true → refreshProps triggers a refresh; root level narrows to ONLY the
        // country comparator (no sales tie-break). Then add an Italy row via transaction —
        // delta sort runs at the root level against the post-toggle baseline. Adding sales=20
        // changes Italy's aggregate from 15 → 35.
        // Re-ranking: Spain=15, Italy=35, Germany=40, France=150, USA=300.
        api.setGridOption('groupMaintainOrder', true);
        applyTransactionChecked(api, { add: [{ id: '17', country: 'Italy', sales: 20 }] });

        // The merge MUST place groups in current-narrowed-options order. Italy moves from
        // (tied with Spain at agg=15, before Spain by insertion order) to (agg=35, after
        // Spain). If the merge silently preserved the stale Italy-before-Spain ordering we
        // would see an inversion at agg=35 vs Spain agg=15.
        await new GridRows(api, 'after toggle + transaction: narrowed options applied').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" sales:15
            │ ├── LEAF id:15 country:"Spain" sales:8
            │ └── LEAF id:16 country:"Spain" sales:7
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:35
            │ ├── LEAF id:17 country:"Italy" sales:20
            │ ├── LEAF id:1 country:"Italy" sales:5
            │ ├── LEAF id:2 country:"Italy" sales:4
            │ ├── LEAF id:3 country:"Italy" sales:3
            │ ├── LEAF id:4 country:"Italy" sales:2
            │ └── LEAF id:5 country:"Italy" sales:1
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" sales:40
            │ ├── LEAF id:13 country:"Germany" sales:25
            │ └── LEAF id:14 country:"Germany" sales:15
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" sales:150
            │ ├── LEAF id:6 country:"France" sales:50
            │ ├── LEAF id:7 country:"France" sales:40
            │ ├── LEAF id:8 country:"France" sales:30
            │ ├── LEAF id:9 country:"France" sales:20
            │ └── LEAF id:10 country:"France" sales:10
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:300
            · ├── LEAF id:11 country:"USA" sales:200
            · └── LEAF id:12 country:"USA" sales:100
        `);

        // Sort indicators unchanged after the toggle + transaction — the runtime toggle of
        // `groupMaintainOrder` does not change column state, only the per-level routing in
        // the sort stage.
        await new GridColumns(api, 'after toggle: sort indicators preserved').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── sales "Sales" width:200 sort:desc sortIndex:1 aggFunc:sum
        `);
    });

    test('deltaSort + groupMaintainOrder runtime toggle true→false: structural baseline at toggle time is rebuilt by the auto-refresh', async () => {
        // Reverse direction of the test above. Under maintainOrder=true with a leaf-only sort,
        // the country level holds a STRUCTURAL baseline (no per-level options route there) — its
        // children are in data-insertion order, NOT in sort order. Toggling maintainOrder=false
        // re-runs the sort stage (refreshProps reactivity) which rebuilds the country baseline
        // under the new fallback routing BEFORE any transaction can use it. A subsequent
        // transaction then deltaSorts against a correctly-sorted baseline.
        const rowData = [
            // Insertion order (Audi, Charlie, Bravo, Delta) intentionally does NOT match
            // sales-desc-by-aggregate (Delta=90, Bravo=60, Audi=40, Charlie=10) so the toggle
            // has observable work to do.
            { id: '1', country: 'Audi', sales: 25 },
            { id: '2', country: 'Audi', sales: 15 },
            { id: '3', country: 'Charlie', sales: 5 },
            { id: '4', country: 'Charlie', sales: 5 },
            { id: '5', country: 'Bravo', sales: 35 },
            { id: '6', country: 'Bravo', sales: 25 },
            { id: '7', country: 'Delta', sales: 50 },
            { id: '8', country: 'Delta', sales: 40 },
        ];

        const api = createDeltaSortGrid('grid-runtime-toggle-true-to-false', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            rowData,
        });

        // Leaf-only sort: with maintainOrder=true, [sales desc] routes to the leaf bucket only.
        // Country level keeps STRUCTURAL order (insertion order) — NOT in sort order.
        api.applyColumnState({ state: [{ colId: 'sales', sort: 'desc' }] });

        await new GridRows(api, 'maintainOrder=true: country structural, leaves sales-desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:40
            │ ├── LEAF id:1 country:"Audi" sales:25
            │ └── LEAF id:2 country:"Audi" sales:15
            ├─┬ LEAF_GROUP id:row-group-country-Charlie ag-Grid-AutoColumn:"Charlie" sales:10
            │ ├── LEAF id:3 country:"Charlie" sales:5
            │ └── LEAF id:4 country:"Charlie" sales:5
            ├─┬ LEAF_GROUP id:row-group-country-Bravo ag-Grid-AutoColumn:"Bravo" sales:60
            │ ├── LEAF id:5 country:"Bravo" sales:35
            │ └── LEAF id:6 country:"Bravo" sales:25
            └─┬ LEAF_GROUP id:row-group-country-Delta ag-Grid-AutoColumn:"Delta" sales:90
            · ├── LEAF id:7 country:"Delta" sales:50
            · └── LEAF id:8 country:"Delta" sales:40
        `);

        // Toggle to false. `groupMaintainOrder` is in `refreshProps`, so this triggers a sort
        // refresh. The refresh has no `changedRowNodes` (not a transaction), so deltaSort is
        // bypassed and the country level is full-sorted by [sales desc] using aggregated values:
        // Delta(90), Bravo(60), Audi(40), Charlie(10).
        api.setGridOption('groupMaintainOrder', false);

        await new GridRows(api, 'after toggle: country level sorted desc by aggregated sales').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Delta ag-Grid-AutoColumn:"Delta" sales:90
            │ ├── LEAF id:7 country:"Delta" sales:50
            │ └── LEAF id:8 country:"Delta" sales:40
            ├─┬ LEAF_GROUP id:row-group-country-Bravo ag-Grid-AutoColumn:"Bravo" sales:60
            │ ├── LEAF id:5 country:"Bravo" sales:35
            │ └── LEAF id:6 country:"Bravo" sales:25
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:40
            │ ├── LEAF id:1 country:"Audi" sales:25
            │ └── LEAF id:2 country:"Audi" sales:15
            └─┬ LEAF_GROUP id:row-group-country-Charlie ag-Grid-AutoColumn:"Charlie" sales:10
            · ├── LEAF id:3 country:"Charlie" sales:5
            · └── LEAF id:4 country:"Charlie" sales:5
        `);

        // Subsequent transactions deltaSort correctly against the rebuilt baseline. Bumping
        // Audi's aggregate to 130 places it above Bravo (60) and Delta (90).
        applyTransactionChecked(api, { add: [{ id: '9', country: 'Audi', sales: 90 }] });

        await new GridRows(api, 'after transaction: deltaSort against fresh baseline').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:130
            │ ├── LEAF id:9 country:"Audi" sales:90
            │ ├── LEAF id:1 country:"Audi" sales:25
            │ └── LEAF id:2 country:"Audi" sales:15
            ├─┬ LEAF_GROUP id:row-group-country-Delta ag-Grid-AutoColumn:"Delta" sales:90
            │ ├── LEAF id:7 country:"Delta" sales:50
            │ └── LEAF id:8 country:"Delta" sales:40
            ├─┬ LEAF_GROUP id:row-group-country-Bravo ag-Grid-AutoColumn:"Bravo" sales:60
            │ ├── LEAF id:5 country:"Bravo" sales:35
            │ └── LEAF id:6 country:"Bravo" sales:25
            └─┬ LEAF_GROUP id:row-group-country-Charlie ag-Grid-AutoColumn:"Charlie" sales:10
            · ├── LEAF id:3 country:"Charlie" sales:5
            · └── LEAF id:4 country:"Charlie" sales:5
        `);
    });
});
