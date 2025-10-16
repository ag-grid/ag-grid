import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid grouping expanded total aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    const gridRowsOptions: GridRowsOptions = {
        checkDom: true,
        columns: true,
    };

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('aggregation value gets hidden on an expanded group if it has a group total row', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'year', pivot: true },
                { field: 'country', rowGroup: true, hide: true, minWidth: 150 },
                { field: 'sport', rowGroup: true, hide: true, minWidth: 150 },
                { field: 'gold', aggFunc: 'sum' },
            ],
            groupTotalRow: 'bottom',
            rowData: getRowData(),
        });

        await new GridRows(api, 'initial - only country level expanded', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:2
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics" gold:1
            │ │ └── LEAF hidden id:0 ag-Grid-AutoColumn:undefined year:2012 country:"Russia" sport:"Gymnastics" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Russia-sport-Diving ag-Grid-AutoColumn:"Diving" gold:1
            │ · └── LEAF hidden id:1 ag-Grid-AutoColumn:undefined year:2000 country:"Russia" sport:"Diving" gold:1
            └─┬ filler collapsed id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands" gold:3
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Netherlands-sport-Cycling ag-Grid-AutoColumn:"Cycling" gold:3
            · · └── LEAF hidden id:2 ag-Grid-AutoColumn:undefined year:2000 country:"Netherlands" sport:"Cycling" gold:3
        `);

        api.getRowNode('row-group-country-Russia')!.setExpanded(true, undefined, true);
        await new GridRows(api, 'expand Russia', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics" gold:1
            │ │ └── LEAF hidden id:0 ag-Grid-AutoColumn:undefined year:2012 country:"Russia" sport:"Gymnastics" gold:1
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia-sport-Diving ag-Grid-AutoColumn:"Diving" gold:1
            │ │ └── LEAF hidden id:1 ag-Grid-AutoColumn:undefined year:2000 country:"Russia" sport:"Diving" gold:1
            │ └─ footer id:rowGroupFooter_row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:2
            └─┬ filler collapsed id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands" gold:3
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Netherlands-sport-Cycling ag-Grid-AutoColumn:"Cycling" gold:3
            · · └── LEAF hidden id:2 ag-Grid-AutoColumn:undefined year:2000 country:"Netherlands" sport:"Cycling" gold:3
        `);

        api.getRowNode('row-group-country-Russia')!.setExpanded(false, undefined, true);

        await new GridRows(api, 'collapse Russia', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:2
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics" gold:1
            │ │ └── LEAF hidden id:0 ag-Grid-AutoColumn:undefined year:2012 country:"Russia" sport:"Gymnastics" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Russia-sport-Diving ag-Grid-AutoColumn:"Diving" gold:1
            │ · └── LEAF hidden id:1 ag-Grid-AutoColumn:undefined year:2000 country:"Russia" sport:"Diving" gold:1
            └─┬ filler collapsed id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands" gold:3
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Netherlands-sport-Cycling ag-Grid-AutoColumn:"Cycling" gold:3
            · · └── LEAF hidden id:2 ag-Grid-AutoColumn:undefined year:2000 country:"Netherlands" sport:"Cycling" gold:3
        `);

        api.getRowNode('row-group-country-Russia')!.setExpanded(true);
        await asyncSetTimeout(66); // wait for debounce

        await new GridRows(api, 'expand Russia async', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics" gold:1
            │ │ └── LEAF hidden id:0 ag-Grid-AutoColumn:undefined year:2012 country:"Russia" sport:"Gymnastics" gold:1
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia-sport-Diving ag-Grid-AutoColumn:"Diving" gold:1
            │ │ └── LEAF hidden id:1 ag-Grid-AutoColumn:undefined year:2000 country:"Russia" sport:"Diving" gold:1
            │ └─ footer id:rowGroupFooter_row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:2
            └─┬ filler collapsed id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands" gold:3
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Netherlands-sport-Cycling ag-Grid-AutoColumn:"Cycling" gold:3
            · · └── LEAF hidden id:2 ag-Grid-AutoColumn:undefined year:2000 country:"Netherlands" sport:"Cycling" gold:3
        `);
    });
});

function getRowData() {
    return [
        {
            athlete: 'A',
            age: 17,
            country: 'Russia',
            year: 2012,
            date: '12/08/2012',
            sport: 'Gymnastics',
            gold: 1,
            silver: 1,
            bronze: 2,
            total: 4,
        },
        {
            athlete: 'B',
            age: 26,
            country: 'Russia',
            year: 2000,
            date: '01/10/2000',
            sport: 'Diving',
            gold: 1,
            silver: 1,
            bronze: 2,
            total: 4,
        },
        {
            athlete: 'C',
            age: 30,
            country: 'Netherlands',
            year: 2000,
            date: '01/10/2000',
            sport: 'Cycling',
            gold: 3,
            silver: 1,
            bronze: 0,
            total: 4,
        },
    ];
}
