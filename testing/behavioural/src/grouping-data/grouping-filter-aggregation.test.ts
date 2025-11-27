import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects, unindentText } from '../test-utils';

describe('ag-grid grouping filter aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, RowGroupingModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each(['transactions', 'immutable'] as const)(
        'grouping aggregation and filter %s',
        async (mode: 'transactions' | 'immutable') => {
            let rowData = cachedJSONObjects.array([
                { id: '0', country: 'Ireland', year: 2020, sport: 'Sailing', gold: 1 },
                { id: '1', country: 'Ireland', year: 2020, sport: 'Soccer', gold: 2 },
                { id: '2', country: 'Ireland', year: 2021, sport: 'Football', gold: 3 },
                { id: '3', country: 'Italy', year: 2020, sport: 'Soccer', gold: 4 },
                { id: '4', country: 'Italy', year: 2021, sport: 'Football', gold: 5 },
                { id: '5', country: 'France', year: 2020, sport: 'Tennis', gold: 1 },
                { id: '6', country: 'France', year: 2021, sport: 'Soccer', gold: 2 },
                { id: '7', country: 'Spain', year: 2020, sport: 'Basketball', gold: 3 },
                { id: '8', country: 'Spain', year: 2021, sport: 'Soccer', gold: 4 },
                { id: '9', country: 'Germany', year: 2021, sport: 'Football', gold: 5 },
            ]);

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', filter: 'agNumberColumnFilter' },
                    { field: 'sport', filter: 'agTextColumnFilter' },
                    { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                autoGroupColumnDef: { headerName: 'Country' },
                animateRows: false,
                rowSelection: { mode: 'multiRow' },
                grandTotalRow: 'top',
                alwaysAggregateAtRootLevel: true,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                groupSuppressBlankHeader: true,
            });

            const gridRowsOptions: GridRowsOptions = {
                columns: ['year', 'sport', 'gold'],
            };

            await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID gold:30
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID gold:30
                ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:6
                │ ├── LEAF id:0 year:2020 sport:"Sailing" gold:1
                │ ├── LEAF id:1 year:2020 sport:"Soccer" gold:2
                │ └── LEAF id:2 year:2021 sport:"Football" gold:3
                ├─┬ LEAF_GROUP id:row-group-country-Italy gold:9
                │ ├── LEAF id:3 year:2020 sport:"Soccer" gold:4
                │ └── LEAF id:4 year:2021 sport:"Football" gold:5
                ├─┬ LEAF_GROUP id:row-group-country-France gold:3
                │ ├── LEAF id:5 year:2020 sport:"Tennis" gold:1
                │ └── LEAF id:6 year:2021 sport:"Soccer" gold:2
                ├─┬ LEAF_GROUP id:row-group-country-Spain gold:7
                │ ├── LEAF id:7 year:2020 sport:"Basketball" gold:3
                │ └── LEAF id:8 year:2021 sport:"Soccer" gold:4
                └─┬ LEAF_GROUP id:row-group-country-Germany gold:5
                · └── LEAF id:9 year:2021 sport:"Football" gold:5
            `);

            // Filter by year >= 2021
            api.setFilterModel({
                year: { filterType: 'number', type: 'greaterThanOrEqual', filter: 2021 },
            });

            await new GridRows(api, 'filter by year >= 2021', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID gold:19
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID gold:19
                ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
                │ └── LEAF id:2 year:2021 sport:"Football" gold:3
                ├─┬ LEAF_GROUP id:row-group-country-Italy gold:5
                │ └── LEAF id:4 year:2021 sport:"Football" gold:5
                ├─┬ LEAF_GROUP id:row-group-country-France gold:2
                │ └── LEAF id:6 year:2021 sport:"Soccer" gold:2
                ├─┬ LEAF_GROUP id:row-group-country-Spain gold:4
                │ └── LEAF id:8 year:2021 sport:"Soccer" gold:4
                └─┬ LEAF_GROUP id:row-group-country-Germany gold:5
                · └── LEAF id:9 year:2021 sport:"Football" gold:5
            `);

            // Additional filter by sport containing "Soccer"
            api.setFilterModel({
                year: { filterType: 'number', type: 'greaterThanOrEqual', filter: 2021 },
                sport: { filterType: 'text', type: 'contains', filter: 'Soccer' },
            });

            await new GridRows(api, 'filter by year >= 2021 AND sport contains Soccer', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID gold:6
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID gold:6
                ├─┬ LEAF_GROUP id:row-group-country-France gold:2
                │ └── LEAF id:6 year:2021 sport:"Soccer" gold:2
                └─┬ LEAF_GROUP id:row-group-country-Spain gold:4
                · └── LEAF id:8 year:2021 sport:"Soccer" gold:4
            `);

            // Update data during filtering
            if (mode === 'transactions') {
                api.applyTransaction({
                    add: [{ id: '10', country: 'Portugal', year: 2021, sport: 'Soccer', gold: 6 }],
                });
                // Ensure grid consistency after adding new group during filtering
                api.refreshClientSideRowModel('group');
            } else {
                rowData = cachedJSONObjects.array([
                    ...rowData,
                    { id: '10', country: 'Portugal', year: 2021, sport: 'Soccer', gold: 6 },
                ]);
                api.setGridOption('rowData', rowData);
            }

            await new GridRows(api, 'after adding Portugal Soccer 2021', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID gold:12
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID gold:12
                ├─┬ LEAF_GROUP id:row-group-country-France gold:2
                │ └── LEAF id:6 year:2021 sport:"Soccer" gold:2
                ├─┬ LEAF_GROUP id:row-group-country-Spain gold:4
                │ └── LEAF id:8 year:2021 sport:"Soccer" gold:4
                └─┬ LEAF_GROUP id:row-group-country-Portugal gold:6
                · └── LEAF id:10 year:2021 sport:"Soccer" gold:6
            `);

            // Clear filters
            api.setFilterModel(null);

            await new GridRows(api, 'filters cleared', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID gold:36
                ├─ footer id:rowGroupFooter_ROOT_NODE_ID gold:36
                ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:6
                │ ├── LEAF id:0 year:2020 sport:"Sailing" gold:1
                │ ├── LEAF id:1 year:2020 sport:"Soccer" gold:2
                │ └── LEAF id:2 year:2021 sport:"Football" gold:3
                ├─┬ LEAF_GROUP id:row-group-country-Italy gold:9
                │ ├── LEAF id:3 year:2020 sport:"Soccer" gold:4
                │ └── LEAF id:4 year:2021 sport:"Football" gold:5
                ├─┬ LEAF_GROUP id:row-group-country-France gold:3
                │ ├── LEAF id:5 year:2020 sport:"Tennis" gold:1
                │ └── LEAF id:6 year:2021 sport:"Soccer" gold:2
                ├─┬ LEAF_GROUP id:row-group-country-Spain gold:7
                │ ├── LEAF id:7 year:2020 sport:"Basketball" gold:3
                │ └── LEAF id:8 year:2021 sport:"Soccer" gold:4
                ├─┬ LEAF_GROUP id:row-group-country-Germany gold:5
                │ └── LEAF id:9 year:2021 sport:"Football" gold:5
                └─┬ LEAF_GROUP id:row-group-country-Portugal gold:6
                · └── LEAF id:10 year:2021 sport:"Soccer" gold:6
            `);

            const csv = unindentText(api.getDataAsCsv({ suppressQuotes: true }));
            expect(csv).toEqual(unindentText`
                Country,Year,Sport,sum(Gold)
                Total ,,,36
                 -> Ireland,,,6
                ,2020,Sailing,1
                ,2020,Soccer,2
                ,2021,Football,3
                 -> Italy,,,9
                ,2020,Soccer,4
                ,2021,Football,5
                 -> France,,,3
                ,2020,Tennis,1
                ,2021,Soccer,2
                 -> Spain,,,7
                ,2020,Basketball,3
                ,2021,Soccer,4
                 -> Germany,,,5
                ,2021,Football,5
                 -> Portugal,,,6
                ,2021,Soccer,6
            `);
        }
    );

    test('grouping with quick filter', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 3 },
            { id: '4', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis', gold: 1 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['athlete', 'sport', 'gold'],
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            │ └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer" gold:3
            └─┬ LEAF_GROUP id:row-group-country-France gold:1
            · └── LEAF id:4 athlete:"Jean Dupont" sport:"Tennis" gold:1
        `);

        // Apply quick filter for "Soccer"
        api.setGridOption('quickFilterText', 'Soccer');

        await new GridRows(api, 'quick filter Soccer', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:2
            │ └── LEAF id:2 athlete:"Jane Doe" sport:"Soccer" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            · └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer" gold:3
        `);

        // Clear quick filter
        api.setGridOption('quickFilterText', '');

        await new GridRows(api, 'quick filter cleared', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF id:2 athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            │ └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer" gold:3
            └─┬ LEAF_GROUP id:row-group-country-France gold:1
            · └── LEAF id:4 athlete:"Jean Dupont" sport:"Tennis" gold:1
        `);

        const csv = unindentText(api.getDataAsCsv({ suppressQuotes: true }));
        expect(csv).toEqual(unindentText`
            Country,Athlete,Sport,sum(Gold)
             -> Ireland,,,3
            ,John Smith,Sailing,1
            ,Jane Doe,Soccer,2
             -> Italy,,,3
            ,Mario Rossi,Soccer,3
             -> France,,,1
            ,Jean Dupont,Tennis,1
        `);
    });

    test('grouping with external filter', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1, active: true },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2, active: false },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 3, active: true },
            { id: '4', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis', gold: 1, active: false },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'active' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node) => (node.data ? node.data.active : true),
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['athlete', 'sport', 'gold', 'active'],
        };

        await new GridRows(api, 'external filter active=true', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:1
            │ └── LEAF id:1 athlete:"John Smith" sport:"Sailing" gold:1 active:true
            └─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            · └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer" gold:3 active:true
        `);

        // Change external filter to show all
        api.setGridOption('doesExternalFilterPass', (_node) => true);
        api.onFilterChanged();

        await new GridRows(api, 'external filter removed', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland gold:3
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing" gold:1 active:true
            │ └── LEAF id:2 athlete:"Jane Doe" sport:"Soccer" gold:2 active:false
            ├─┬ LEAF_GROUP id:row-group-country-Italy gold:3
            │ └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer" gold:3 active:true
            └─┬ LEAF_GROUP id:row-group-country-France gold:1
            · └── LEAF id:4 athlete:"Jean Dupont" sport:"Tennis" gold:1 active:false
        `);

        const csv = unindentText(api.getDataAsCsv({ suppressQuotes: true }));
        expect(csv).toEqual(unindentText`
            Country,Athlete,Sport,sum(Gold),Active
             -> Ireland,,,3,
            ,John Smith,Sailing,1,true
            ,Jane Doe,Soccer,2,false
             -> Italy,,,3,
            ,Mario Rossi,Soccer,3,true
             -> France,,,1,
            ,Jean Dupont,Tennis,1,false
        `);
    });
});
