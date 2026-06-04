import type { IAggFunc, IAggFuncParams } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, unindentText } from '../test-utils';

const qualifiedAggFunc: IAggFunc = ({ values }: IAggFuncParams) => {
    let qualified = 0;
    let total = 0;

    for (const raw of values ?? []) {
        if (typeof raw === 'boolean') {
            total += 1;
            if (raw) {
                qualified += 1;
            }
            continue;
        }

        if (typeof raw === 'string') {
            const [qualifiedPart, remainder] = raw.split('/', 2);
            const totalPart = remainder?.split(' ', 1)[0];
            const parsedQualified = Number(qualifiedPart);
            const parsedTotal = Number(totalPart);
            if (!Number.isNaN(parsedQualified) && !Number.isNaN(parsedTotal)) {
                qualified += parsedQualified;
                total += parsedTotal;
            }
        }
    }

    return total === 0 ? '' : `${qualified}/${total} Qualified`;
};

// Built-in aggregations handle the remaining columns; only `qualifiedAggFunc` is custom.

describe('csv exports for grouped aggregations', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('includes totals before and after transactions', async () => {
        const rowData = getRowData();
        const api = await gridsManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', headerName: 'Athlete' },
                { field: 'score', headerName: 'Score', aggFunc: 'sum' },
                { field: 'rating', headerName: 'Rating', aggFunc: 'avg' },
                { field: 'qualified', headerName: 'Qualified', aggFunc: qualifiedAggFunc },
                { field: 'coach', headerName: 'Coaches', aggFunc: 'max' },
            ],
            autoGroupColumnDef: {
                headerName: 'Country',
                valueFormatter: (params) => (params.value ? `Country: ${params.value}` : ''),
                useValueFormatterForExport: true,
            },
            rowData,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `includes totals before and after transactions setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            ├── score "Score" width:200 aggFunc:sum
            ├── rating "Rating" width:200 aggFunc:avg
            ├── qualified "Qualified" width:200 aggFunc:custom
            └── coach "Coaches" width:200 aggFunc:max
        `);
        await new GridRows(api, `includes totals before and after transactions setup`).check(`
            ROOT id:ROOT_NODE_ID score:37 rating:{"count":5,"value":4.2} qualified:"3/5 Qualified" coach:null
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10 rating:4.2 qualified:true coach:"Coach A"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Brendan" score:6 rating:3.9 qualified:false coach:"Coach B"
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Total Ireland" score:16 rating:{"count":2,"value":4.05} qualified:"1/2 Qualified" coach:null
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:3 country:"Spain" athlete:"Carlos" score:7 rating:4.5 qualified:true coach:"Coach C"
            │ ├── LEAF id:4 country:"Spain" athlete:"Diana" score:9 rating:4.8 qualified:true coach:"Coach C"
            │ ├── LEAF id:5 country:"Spain" athlete:"Elena" score:5 rating:3.6 qualified:false coach:"Coach D"
            │ └─ footer id:rowGroupFooter_row-group-country-Spain ag-Grid-AutoColumn:"Total Spain" score:21 rating:{"count":3,"value":4.3} qualified:"2/3 Qualified" coach:null
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " score:37 rating:{"count":5,"value":4.2} qualified:"3/5 Qualified" coach:null
        `);

        const initialCsv = api.getDataAsCsv({ suppressQuotes: true })!;

        expect(unindentText(initialCsv)).toEqual(unindentText`
            Country,Athlete,Score,Rating,Qualified,Coaches
             -> Ireland,,,,,
            ,Alice,10,4.2,true,Coach A
            ,Brendan,6,3.9,false,Coach B
             -> Total Ireland,,16,4.05,1/2 Qualified,
             -> Spain,,,,,
            ,Carlos,7,4.5,true,Coach C
            ,Diana,9,4.8,true,Coach C
            ,Elena,5,3.6,false,Coach D
             -> Total Spain,,21,4.3,2/3 Qualified,
            Total ,,37,4.2,3/5 Qualified,
        `);

        applyTransactionChecked(api, {
            add: [
                {
                    id: '6',
                    country: 'Germany',
                    athlete: 'Fritz',
                    score: 8,
                    rating: 4.1,
                    qualified: true,
                    coach: 'Coach E',
                },
            ],
            update: [
                {
                    id: '3',
                    country: 'Spain',
                    athlete: 'Carlos',
                    score: 11,
                    rating: 4.9,
                    qualified: true,
                    coach: 'Coach C',
                },
            ],
            remove: [{ id: '2' }],
        });

        const afterCsv = api.getDataAsCsv({ suppressQuotes: true })!;
        expect(unindentText(afterCsv)).toEqual(unindentText`
            Country,Athlete,Score,Rating,Qualified,Coaches
             -> Ireland,,,,,
            ,Alice,10,4.2,true,Coach A
             -> Total Ireland,,10,4.2,1/1 Qualified,
             -> Spain,,,,,
            ,Carlos,11,4.9,true,Coach C
            ,Diana,9,4.8,true,Coach C
            ,Elena,5,3.6,false,Coach D
             -> Total Spain,,25,4.433333333333333,2/3 Qualified,
             -> Germany,,,,,
            ,Fritz,8,4.1,true,Coach E
             -> Total Germany,,8,4.1,1/1 Qualified,
            Total ,,43,4.3199999999999985,4/5 Qualified,
        `);
        await new GridRows(api, `includes totals before and after transactions final state`).check(`
            ROOT id:ROOT_NODE_ID score:43 rating:{"count":5,"value":4.3199999999999985} qualified:"4/5 Qualified" coach:null
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10 rating:4.2 qualified:true coach:"Coach A"
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Total Ireland" score:10 rating:{"count":1,"value":4.2} qualified:"1/1 Qualified" coach:null
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:3 country:"Spain" athlete:"Carlos" score:11 rating:4.9 qualified:true coach:"Coach C"
            │ ├── LEAF id:4 country:"Spain" athlete:"Diana" score:9 rating:4.8 qualified:true coach:"Coach C"
            │ ├── LEAF id:5 country:"Spain" athlete:"Elena" score:5 rating:3.6 qualified:false coach:"Coach D"
            │ └─ footer id:rowGroupFooter_row-group-country-Spain ag-Grid-AutoColumn:"Total Spain" score:25 rating:{"count":3,"value":4.433333333333333} qualified:"2/3 Qualified" coach:null
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:6 country:"Germany" athlete:"Fritz" score:8 rating:4.1 qualified:true coach:"Coach E"
            │ └─ footer id:rowGroupFooter_row-group-country-Germany ag-Grid-AutoColumn:"Total Germany" score:8 rating:{"count":1,"value":4.1} qualified:"1/1 Qualified" coach:null
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " score:43 rating:{"count":5,"value":4.3199999999999985} qualified:"4/5 Qualified" coach:null
        `);
    });
});

const getRowData = () => [
    {
        id: '1',
        country: 'Ireland',
        athlete: 'Alice',
        score: 10,
        rating: 4.2,
        qualified: true,
        coach: 'Coach A',
    },
    {
        id: '2',
        country: 'Ireland',
        athlete: 'Brendan',
        score: 6,
        rating: 3.9,
        qualified: false,
        coach: 'Coach B',
    },
    {
        id: '3',
        country: 'Spain',
        athlete: 'Carlos',
        score: 7,
        rating: 4.5,
        qualified: true,
        coach: 'Coach C',
    },
    {
        id: '4',
        country: 'Spain',
        athlete: 'Diana',
        score: 9,
        rating: 4.8,
        qualified: true,
        coach: 'Coach C',
    },
    {
        id: '5',
        country: 'Spain',
        athlete: 'Elena',
        score: 5,
        rating: 3.6,
        qualified: false,
        coach: 'Coach D',
    },
];
