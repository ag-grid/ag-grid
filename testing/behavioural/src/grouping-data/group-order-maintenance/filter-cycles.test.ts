import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked } from '../../test-utils';

describe('group order maintenance / filter cycles', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('clearing a filter restores the original group order', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Italy', athlete: 'T1' },
            { id: '3', country: 'France', athlete: 'F1' },
            { id: '4', country: 'Spain', athlete: 'S1' },
        ];

        const api = gridsManager.createGrid('grid-filter-reset', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.setGridOption('quickFilterText', 'T1');
        await new GridRows(api, 'after filter to Italy only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 country:"Italy" athlete:"T1"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'after clearing filter — original order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"T1"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"F1"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:4 country:"Spain" athlete:"S1"
        `);
    });

    test('filter cycle interleaved with add / update / remove transactions', async () => {
        const rowData = [
            { id: '1', country: 'Audi', athlete: 'Anna' },
            { id: '2', country: 'BMW', athlete: 'Bert' },
            { id: '3', country: 'Tesla', athlete: 'Tim' },
        ];

        const api = gridsManager.createGrid('grid-stress', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'stress: initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"Tim"
        `);

        api.setGridOption('quickFilterText', 'Tim');
        await new GridRows(api, 'stress: filter Tesla').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:3 country:"Tesla" athlete:"Tim"
        `);

        applyTransactionChecked(api, { add: [{ id: '4', country: 'Volvo', athlete: 'Timmy' }] });
        await new GridRows(api, 'stress: add Volvo (visible) while filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);

        applyTransactionChecked(api, { update: [{ id: '1', country: 'Audi', athlete: 'Anna-upd' }] });
        await new GridRows(api, 'stress: update hidden Audi while filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);

        applyTransactionChecked(api, { remove: [{ id: '2', country: 'BMW', athlete: 'Bert' }] });
        await new GridRows(api, 'stress: remove hidden BMW while filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'stress: clear filter — original positions restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:1 country:"Audi" athlete:"Anna-upd"
            ├─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            │ └── LEAF id:3 country:"Tesla" athlete:"Tim"
            └─┬ LEAF_GROUP id:row-group-country-Volvo ag-Grid-AutoColumn:"Volvo"
            · └── LEAF id:4 country:"Volvo" athlete:"Timmy"
        `);
    });

    test('initialGroupOrderComparator + groupMaintainOrder + filter cycle', async () => {
        const rowData = [
            { id: '1', country: 'Tesla', athlete: 'Tim' },
            { id: '2', country: 'BMW', athlete: 'Bert' },
            { id: '3', country: 'Audi', athlete: 'Anna' },
        ];

        const api = gridsManager.createGrid('grid-comparator', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            initialGroupOrderComparator: ({ nodeA, nodeB }) => (nodeA.key! < nodeB.key! ? -1 : 1),
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'comparator: initial alphabetical order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);

        api.setGridOption('quickFilterText', 'Tim');
        await new GridRows(api, 'comparator: filter Tesla only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);

        api.setGridOption('quickFilterText', undefined);
        await new GridRows(api, 'comparator: clear filter — alphabetical order restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);

        applyTransactionChecked(api, { add: [{ id: '4', country: 'Acura', athlete: 'Alex' }] });
        await new GridRows(api, 'comparator: add Acura via transaction — sorted alphabetically').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Acura ag-Grid-AutoColumn:"Acura"
            │ └── LEAF id:4 country:"Acura" athlete:"Alex"
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ └── LEAF id:3 country:"Audi" athlete:"Anna"
            ├─┬ LEAF_GROUP id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ └── LEAF id:2 country:"BMW" athlete:"Bert"
            └─┬ LEAF_GROUP id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └── LEAF id:1 country:"Tesla" athlete:"Tim"
        `);
    });

    test('after filtering removes a group, adding a new group appends at end', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Italy', athlete: 'T1' },
            { id: '3', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid-filter-removes-group-then-add', {
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
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"T1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"F1"
        `);

        api.setGridOption('quickFilterText', 'I1'); // shows only Ireland
        await new GridRows(api, 'after filter Ireland only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · └── LEAF id:1 country:"Ireland" athlete:"I1"
        `);

        api.setGridOption('quickFilterText', undefined);
        applyTransactionChecked(api, { add: [{ id: '4', country: 'Spain', athlete: 'S1' }] });

        await new GridRows(api, 'after add Spain').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"T1"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"F1"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:4 country:"Spain" athlete:"S1"
        `);
    });

    test('after removing a group, adding a new group appends at end (sentinel append)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Italy', athlete: 'It1' },
            { id: '3', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid8', {
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
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"F1"
        `);

        applyTransactionChecked(api, { remove: [{ id: '2', country: 'Italy', athlete: 'It1' }] });

        await new GridRows(api, 'after remove Italy').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"F1"
        `);

        applyTransactionChecked(api, { add: [{ id: '4', country: 'Spain', athlete: 'S1' }] });

        await new GridRows(api, 'after add Spain').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"I1"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"F1"
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:4 country:"Spain" athlete:"S1"
        `);
    });

    test('multi-level initialGroupOrderComparator + groupMaintainOrder: comparator applies at every level, per-level sort isolation overlays correctly', async () => {
        // Single comparator alphabetises by `node.key` — applies at BOTH the country level and
        // the year level (the comparator runs on every parent's children). Insertion order
        // intentionally NOT alphabetical so the comparator's effect is observable.
        const rowData = [
            { id: '1', country: 'Tesla', year: 2021, athlete: 'T1' },
            { id: '2', country: 'BMW', year: 2019, athlete: 'B1' },
            { id: '3', country: 'BMW', year: 2022, athlete: 'B2' },
            { id: '4', country: 'Audi', year: 2020, athlete: 'A1' },
            { id: '5', country: 'Audi', year: 2018, athlete: 'A2' },
        ];

        const api = gridsManager.createGrid('grid-multi-level-igoc', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'year', rowGroup: true, hide: true, sortable: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            initialGroupOrderComparator: ({ nodeA, nodeB }) => {
                const a = String(nodeA.key ?? '');
                const b = String(nodeB.key ?? '');
                return a < b ? -1 : a > b ? 1 : 0;
            },
            rowData,
            getRowId: (p) => p.data.id,
        });

        // Comparator applied at both levels: countries [Audi, BMW, Tesla]; years asc within each.
        await new GridRows(api, 'multi-level IGOC: comparator order at every level').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├─┬ LEAF_GROUP id:row-group-country-Audi-year-2018 ag-Grid-AutoColumn:2018
            │ │ └── LEAF id:5 country:"Audi" year:2018 athlete:"A2"
            │ └─┬ LEAF_GROUP id:row-group-country-Audi-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:4 country:"Audi" year:2020 athlete:"A1"
            ├─┬ filler id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ ├─┬ LEAF_GROUP id:row-group-country-BMW-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:2 country:"BMW" year:2019 athlete:"B1"
            │ └─┬ LEAF_GROUP id:row-group-country-BMW-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:3 country:"BMW" year:2022 athlete:"B2"
            └─┬ filler id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └─┬ LEAF_GROUP id:row-group-country-Tesla-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:1 country:"Tesla" year:2021 athlete:"T1"
        `);

        // Sort YEAR desc — under maintainOrder=true, [year desc] routes to the year level only.
        // Country level keeps the comparator-driven order; year groups within each country
        // reverse to descending. Locks in: per-level routing overlays correctly on the IGOC
        // baseline (sort doesn't displace the country comparator).
        api.applyColumnState({ state: [{ colId: 'year', sort: 'desc' }] });
        await new GridRows(api, 'multi-level IGOC: year sort desc only reorders year groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├─┬ LEAF_GROUP id:row-group-country-Audi-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:4 country:"Audi" year:2020 athlete:"A1"
            │ └─┬ LEAF_GROUP id:row-group-country-Audi-year-2018 ag-Grid-AutoColumn:2018
            │ · └── LEAF id:5 country:"Audi" year:2018 athlete:"A2"
            ├─┬ filler id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ ├─┬ LEAF_GROUP id:row-group-country-BMW-year-2022 ag-Grid-AutoColumn:2022
            │ │ └── LEAF id:3 country:"BMW" year:2022 athlete:"B2"
            │ └─┬ LEAF_GROUP id:row-group-country-BMW-year-2019 ag-Grid-AutoColumn:2019
            │ · └── LEAF id:2 country:"BMW" year:2019 athlete:"B1"
            └─┬ filler id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └─┬ LEAF_GROUP id:row-group-country-Tesla-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:1 country:"Tesla" year:2021 athlete:"T1"
        `);

        // Clear the year sort — both levels revert to the IGOC alphabetical order. This locks
        // in: clearing a sort restores the IGOC-driven structural order, not insertion order.
        api.applyColumnState({ state: [{ colId: 'year', sort: null }] });
        await new GridRows(api, 'multi-level IGOC: clear year sort, comparator order restored').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├─┬ LEAF_GROUP id:row-group-country-Audi-year-2018 ag-Grid-AutoColumn:2018
            │ │ └── LEAF id:5 country:"Audi" year:2018 athlete:"A2"
            │ └─┬ LEAF_GROUP id:row-group-country-Audi-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:4 country:"Audi" year:2020 athlete:"A1"
            ├─┬ filler id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ ├─┬ LEAF_GROUP id:row-group-country-BMW-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:2 country:"BMW" year:2019 athlete:"B1"
            │ └─┬ LEAF_GROUP id:row-group-country-BMW-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:3 country:"BMW" year:2022 athlete:"B2"
            └─┬ filler id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └─┬ LEAF_GROUP id:row-group-country-Tesla-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:1 country:"Tesla" year:2021 athlete:"T1"
        `);

        // Transaction: add a new country (Acura) and a new year (2017) inside an existing
        // country (BMW). Both should land at their IGOC position, not at the tail.
        applyTransactionChecked(api, {
            add: [
                { id: '6', country: 'Acura', year: 2023, athlete: 'AC1' },
                { id: '7', country: 'BMW', year: 2017, athlete: 'B0' },
            ],
        });
        await new GridRows(api, 'multi-level IGOC: transaction adds at comparator position').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Acura ag-Grid-AutoColumn:"Acura"
            │ └─┬ LEAF_GROUP id:row-group-country-Acura-year-2023 ag-Grid-AutoColumn:2023
            │ · └── LEAF id:6 country:"Acura" year:2023 athlete:"AC1"
            ├─┬ filler id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            │ ├─┬ LEAF_GROUP id:row-group-country-Audi-year-2018 ag-Grid-AutoColumn:2018
            │ │ └── LEAF id:5 country:"Audi" year:2018 athlete:"A2"
            │ └─┬ LEAF_GROUP id:row-group-country-Audi-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:4 country:"Audi" year:2020 athlete:"A1"
            ├─┬ filler id:row-group-country-BMW ag-Grid-AutoColumn:"BMW"
            │ ├─┬ LEAF_GROUP id:row-group-country-BMW-year-2017 ag-Grid-AutoColumn:2017
            │ │ └── LEAF id:7 country:"BMW" year:2017 athlete:"B0"
            │ ├─┬ LEAF_GROUP id:row-group-country-BMW-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:2 country:"BMW" year:2019 athlete:"B1"
            │ └─┬ LEAF_GROUP id:row-group-country-BMW-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:3 country:"BMW" year:2022 athlete:"B2"
            └─┬ filler id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla"
            · └─┬ LEAF_GROUP id:row-group-country-Tesla-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:1 country:"Tesla" year:2021 athlete:"T1"
        `);
    });
});
