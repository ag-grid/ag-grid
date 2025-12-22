import type {
    GetRowIdParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, ssrmExpandAndLoadAll, unindentText, waitForNoLoadingRows } from '../../test-utils';

describe('csv exports for server-side grouping', () => {
    const gridManager = new TestGridsManager({
        modules: [CsvExportModule, RowGroupingModule, ServerSideRowModelModule],
    });

    beforeEach(() => {
        gridManager.reset();
    });

    afterEach(() => {
        gridManager.reset();
    });

    interface ServerSideRow {
        id: string;
        country: string;
        year: string;
        medals: number;
    }

    type ServerSideResponseRow = Partial<ServerSideRow> & {
        id: string;
        group?: true;
        leafGroup?: boolean;
        key?: string | null;
        groupData?: Record<string, string | null>;
    };

    const serverSideRows: ServerSideRow[] = [
        { id: 'ie-2000-1', country: 'Ireland', year: '2000', medals: 2 },
        { id: 'ie-2000-2', country: 'Ireland', year: '2000', medals: 3 },
        { id: 'ie-blank-1', country: 'Ireland', year: '', medals: 1 },
        { id: 'es-2000-1', country: 'Spain', year: '2000', medals: 4 },
        { id: 'es-2001-1', country: 'Spain', year: '2001', medals: 5 },
        { id: 'blank-2000-1', country: '', year: '2000', medals: 6 },
        { id: 'blank-2000-2', country: '', year: '2000', medals: 7 },
        { id: 'blank-2001-1', country: '', year: '2001', medals: 8 },
        { id: 'blank-blank-1', country: '', year: '', medals: 9 },
    ];

    const normaliseGroupKey = (key: string | null | undefined): string => (key == null || key === '' ? 'BLANK' : key);

    const getGroupId = (groupKeys: Array<string | null>, field: string, value: string | null | undefined) =>
        [...groupKeys.map(normaliseGroupKey), `${field}:${normaliseGroupKey(value)}`].join('|') || 'root';

    const getDataForRequest = (request: IServerSideGetRowsRequest): ServerSideResponseRow[] => {
        const rowGroupCols = request.rowGroupCols ?? [];
        const groupKeys = (request.groupKeys ?? []) as Array<string | null>;

        const normaliseForComparison = (value: string | null | undefined) => (value == null ? '' : value);

        const matching = serverSideRows.filter((row) =>
            groupKeys.every((key, idx) => {
                const field = rowGroupCols[idx].field! as keyof ServerSideRow;
                return (row[field] ?? '') === normaliseForComparison(key);
            })
        );

        if (rowGroupCols.length > groupKeys.length) {
            const nextField = rowGroupCols[groupKeys.length].field! as keyof ServerSideRow;
            const seen = new Set<string>();
            const rows: ServerSideResponseRow[] = [];

            for (const row of matching) {
                const rawValue = (row[nextField] ?? '') as string;
                const seenKey = rawValue === '' ? '__BLANK__' : rawValue;
                if (seen.has(seenKey)) {
                    continue;
                }
                seen.add(seenKey);
                const keyValue = rawValue === '' ? null : rawValue;
                const valueForData = rawValue;
                const childRows = matching.filter((candidate) => (candidate[nextField] ?? '') === rawValue);
                const medals = childRows.reduce((total, candidate) => total + (candidate.medals ?? 0), 0);
                rows.push({
                    id: getGroupId(groupKeys, nextField, keyValue),
                    key: keyValue,
                    [nextField]: valueForData,
                    groupData: { [nextField]: keyValue },
                    group: true,
                    leafGroup: groupKeys.length === rowGroupCols.length - 1,
                    medals,
                });
            }
            return rows;
        }

        return matching.map((row) => ({ ...row }));
    };

    const createDatasource = (): IServerSideDatasource => ({
        getRows(params: IServerSideGetRowsParams) {
            const { request } = params;
            const rowData = getDataForRequest(request);
            setTimeout(() => {
                params.success?.({ rowData });
            }, 0);
        },
    });

    const getRowId = ({ data, parentKeys }: GetRowIdParams<ServerSideRow>): string => {
        if (data.id) {
            return data.id;
        }
        const keySegments = [...(parentKeys ?? [])];
        if ('country' in data) {
            keySegments.push(`country:${data.country ?? ''}`);
        }
        if ('year' in data && data.year !== undefined) {
            keySegments.push(`year:${data.year ?? ''}`);
        }
        return keySegments.join('|') || 'root';
    };

    test('grouping with aggregation and blanks ', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'medals', headerName: 'Medals', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country', useValueFormatterForExport: false },
            groupDisplayType: 'multipleColumns',
            showOpenedGroup: true,
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            groupTotalRow: 'bottom',
        });

        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'ssrm grouping state');
        await gridRows.check(unindentText`
            ROOT id:<no-id> ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null country:"Ireland"
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2000" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" year:"2000"
            │ │ ├── LEAF id:ie-2000-1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" country:"Ireland" year:"2000" medals:2
            │ │ ├── LEAF id:ie-2000-2 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" country:"Ireland" year:"2000" medals:3
            │ │ └─ footer collapsed id:"rowGroupFooter_Ireland|year:2000" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:BLANK" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"(Blanks)" year:""
            │ │ ├── LEAF id:ie-blank-1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"(Blanks)" country:"Ireland" year:"" medals:1
            │ │ └─ footer collapsed id:"rowGroupFooter_Ireland|year:BLANK" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"Total (Blanks)" year:"" medals:1
            │ └─ footer collapsed id:"rowGroupFooter_country:Ireland" ag-Grid-AutoColumn-country:"Total Ireland" ag-Grid-AutoColumn-year:null country:"Ireland" medals:6
            ├─┬ GROUP id:"country:Spain" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:null country:"Spain"
            │ ├─┬ GROUP-leafGroup id:"Spain|year:2000" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2000" year:"2000"
            │ │ ├── LEAF id:es-2000-1 ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2000" country:"Spain" year:"2000" medals:4
            │ │ └─ footer collapsed id:"rowGroupFooter_Spain|year:2000" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:4
            │ ├─┬ GROUP-leafGroup id:"Spain|year:2001" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2001" year:"2001"
            │ │ ├── LEAF id:es-2001-1 ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2001" country:"Spain" year:"2001" medals:5
            │ │ └─ footer collapsed id:"rowGroupFooter_Spain|year:2001" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"Total 2001" year:"2001" medals:5
            │ └─ footer collapsed id:"rowGroupFooter_country:Spain" ag-Grid-AutoColumn-country:"Total Spain" ag-Grid-AutoColumn-year:null country:"Spain" medals:9
            └─┬ GROUP id:"country:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:null country:""
            · ├─┬ GROUP-leafGroup id:"BLANK|year:2000" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" year:"2000"
            · │ ├── LEAF id:blank-2000-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" country:"" year:"2000" medals:6
            · │ ├── LEAF id:blank-2000-2 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" country:"" year:"2000" medals:7
            · │ └─ footer collapsed id:"rowGroupFooter_BLANK|year:2000" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:13
            · ├─┬ GROUP-leafGroup id:"BLANK|year:2001" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2001" year:"2001"
            · │ ├── LEAF id:blank-2001-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2001" country:"" year:"2001" medals:8
            · │ └─ footer collapsed id:"rowGroupFooter_BLANK|year:2001" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total 2001" year:"2001" medals:8
            · ├─┬ GROUP-leafGroup id:"BLANK|year:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"(Blanks)" year:""
            · │ ├── LEAF id:blank-blank-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"(Blanks)" country:"" year:"" medals:9
            · │ └─ footer collapsed id:"rowGroupFooter_BLANK|year:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total (Blanks)" year:"" medals:9
            · └─ footer collapsed id:"rowGroupFooter_country:BLANK" ag-Grid-AutoColumn-country:"Total (Blanks)" ag-Grid-AutoColumn-year:null country:"" medals:30
        `);

        expect(unindentText(api.getDataAsCsv({ suppressQuotes: true }))).toEqual(unindentText`
            Country,Country,sum(Medals)
            Ireland,,
            Ireland,2000,
            Ireland,2000,2
            Ireland,2000,3
            Ireland,Total 2000,5
            Ireland,(Blanks),
            Ireland,(Blanks),1
            Ireland,Total (Blanks),1
            Total Ireland,,6
            Spain,,
            Spain,2000,
            Spain,2000,4
            Spain,Total 2000,4
            Spain,2001,
            Spain,2001,5
            Spain,Total 2001,5
            Total Spain,,9
            (Blanks),,
            (Blanks),2000,
            (Blanks),2000,6
            (Blanks),2000,7
            (Blanks),Total 2000,13
            (Blanks),2001,
            (Blanks),2001,8
            (Blanks),Total 2001,8
            (Blanks),(Blanks),
            (Blanks),(Blanks),9
            (Blanks),Total (Blanks),9
            Total (Blanks),,30
        `);
    });

    test('grouping with aggregation and blanks (groupHideOpenParents)', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'medals', headerName: 'Medals', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country', useValueFormatterForExport: false },
            groupDisplayType: 'multipleColumns',
            groupHideOpenParents: true,
            showOpenedGroup: true,
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            groupTotalRow: 'bottom',
        });

        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'ssrm grouping state');
        await gridRows.check(unindentText`
            ROOT id:<no-id> ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├── LEAF id:ie-2000-1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" country:"Ireland" year:"2000" medals:2
            ├── LEAF id:ie-2000-2 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" country:"Ireland" year:"2000" medals:3
            ├─ footer collapsed id:"rowGroupFooter_Ireland|year:2000" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:5
            ├── LEAF id:ie-blank-1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"(Blanks)" country:"Ireland" year:"" medals:1
            ├─ footer collapsed id:"rowGroupFooter_Ireland|year:BLANK" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"Total (Blanks)" year:"" medals:1
            ├─ footer collapsed id:"rowGroupFooter_country:Ireland" ag-Grid-AutoColumn-country:"Total Ireland" ag-Grid-AutoColumn-year:null country:"Ireland" medals:6
            ├── LEAF id:es-2000-1 ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2000" country:"Spain" year:"2000" medals:4
            ├─ footer collapsed id:"rowGroupFooter_Spain|year:2000" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:4
            ├── LEAF id:es-2001-1 ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2001" country:"Spain" year:"2001" medals:5
            ├─ footer collapsed id:"rowGroupFooter_Spain|year:2001" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"Total 2001" year:"2001" medals:5
            ├─ footer collapsed id:"rowGroupFooter_country:Spain" ag-Grid-AutoColumn-country:"Total Spain" ag-Grid-AutoColumn-year:null country:"Spain" medals:9
            ├── LEAF id:blank-2000-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" country:"" year:"2000" medals:6
            ├── LEAF id:blank-2000-2 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" country:"" year:"2000" medals:7
            ├─ footer collapsed id:"rowGroupFooter_BLANK|year:2000" ag-Grid-AutoColumn-country:"" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:13
            ├── LEAF id:blank-2001-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2001" country:"" year:"2001" medals:8
            ├─ footer collapsed id:"rowGroupFooter_BLANK|year:2001" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total 2001" year:"2001" medals:8
            ├── LEAF id:blank-blank-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"(Blanks)" country:"" year:"" medals:9
            ├─ footer collapsed id:"rowGroupFooter_BLANK|year:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total (Blanks)" year:"" medals:9
            └─ footer collapsed id:"rowGroupFooter_country:BLANK" ag-Grid-AutoColumn-country:"Total (Blanks)" ag-Grid-AutoColumn-year:null country:"" medals:30
        `);

        expect(unindentText(api.getDataAsCsv({ suppressQuotes: true }))).toEqual(unindentText`
            Country,Country,sum(Medals)
            Ireland,2000,2
            Ireland,2000,3
            Ireland,Total 2000,5
            Ireland,(Blanks),1
            Ireland,Total (Blanks),1
            Total Ireland,,6
            Spain,2000,4
            Spain,Total 2000,4
            Spain,2001,5
            Spain,Total 2001,5
            Total Spain,,9
            (Blanks),2000,6
            (Blanks),2000,7
            ,Total 2000,13
            (Blanks),2001,8
            (Blanks),Total 2001,8
            (Blanks),(Blanks),9
            (Blanks),Total (Blanks),9
            Total (Blanks),,30
        `);
    });

    test('grouping csv export with aggregation and blanks (groupHideParentOfSingleChild)', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'medals', headerName: 'Medals', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country', useValueFormatterForExport: false },
            groupDisplayType: 'multipleColumns',
            groupHideParentOfSingleChild: true,
            showOpenedGroup: true,
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            groupTotalRow: 'bottom',
        });

        await ssrmExpandAndLoadAll(api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'ssrm grouping state');
        await gridRows.check(unindentText`
            ROOT id:<no-id> ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null country:"Ireland"
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2000" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" year:"2000"
            │ │ ├── LEAF id:ie-2000-1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" country:"Ireland" year:"2000" medals:2
            │ │ ├── LEAF id:ie-2000-2 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2000" country:"Ireland" year:"2000" medals:3
            │ │ └─ footer collapsed id:"rowGroupFooter_Ireland|year:2000" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:BLANK" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"(Blanks)" year:""
            │ │ ├── LEAF id:ie-blank-1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"(Blanks)" country:"Ireland" year:"" medals:1
            │ │ └─ footer collapsed id:"rowGroupFooter_Ireland|year:BLANK" ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"Total (Blanks)" year:"" medals:1
            │ └─ footer collapsed id:"rowGroupFooter_country:Ireland" ag-Grid-AutoColumn-country:"Total Ireland" ag-Grid-AutoColumn-year:null country:"Ireland" medals:6
            ├─┬ GROUP id:"country:Spain" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:null country:"Spain"
            │ ├─┬ GROUP-leafGroup id:"Spain|year:2000" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2000" year:"2000"
            │ │ ├── LEAF id:es-2000-1 ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2000" country:"Spain" year:"2000" medals:4
            │ │ └─ footer collapsed id:"rowGroupFooter_Spain|year:2000" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:4
            │ ├─┬ GROUP-leafGroup id:"Spain|year:2001" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2001" year:"2001"
            │ │ ├── LEAF id:es-2001-1 ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"2001" country:"Spain" year:"2001" medals:5
            │ │ └─ footer collapsed id:"rowGroupFooter_Spain|year:2001" ag-Grid-AutoColumn-country:"Spain" ag-Grid-AutoColumn-year:"Total 2001" year:"2001" medals:5
            │ └─ footer collapsed id:"rowGroupFooter_country:Spain" ag-Grid-AutoColumn-country:"Total Spain" ag-Grid-AutoColumn-year:null country:"Spain" medals:9
            └─┬ GROUP id:"country:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:null country:""
            · ├─┬ GROUP-leafGroup id:"BLANK|year:2000" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" year:"2000"
            · │ ├── LEAF id:blank-2000-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" country:"" year:"2000" medals:6
            · │ ├── LEAF id:blank-2000-2 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2000" country:"" year:"2000" medals:7
            · │ └─ footer collapsed id:"rowGroupFooter_BLANK|year:2000" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total 2000" year:"2000" medals:13
            · ├─┬ GROUP-leafGroup id:"BLANK|year:2001" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2001" year:"2001"
            · │ ├── LEAF id:blank-2001-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"2001" country:"" year:"2001" medals:8
            · │ └─ footer collapsed id:"rowGroupFooter_BLANK|year:2001" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total 2001" year:"2001" medals:8
            · ├─┬ GROUP-leafGroup id:"BLANK|year:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"(Blanks)" year:""
            · │ ├── LEAF id:blank-blank-1 ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"(Blanks)" country:"" year:"" medals:9
            · │ └─ footer collapsed id:"rowGroupFooter_BLANK|year:BLANK" ag-Grid-AutoColumn-country:"(Blanks)" ag-Grid-AutoColumn-year:"Total (Blanks)" year:"" medals:9
            · └─ footer collapsed id:"rowGroupFooter_country:BLANK" ag-Grid-AutoColumn-country:"Total (Blanks)" ag-Grid-AutoColumn-year:null country:"" medals:30
        `);

        const csv = unindentText(api.getDataAsCsv({ suppressQuotes: true }));

        expect(csv).toEqual(unindentText`
            Country,Country,sum(Medals)
            Ireland,,
            Ireland,2000,
            Ireland,2000,2
            Ireland,2000,3
            Ireland,Total 2000,5
            Ireland,(Blanks),
            Ireland,(Blanks),1
            Ireland,Total (Blanks),1
            Total Ireland,,6
            Spain,,
            Spain,2000,
            Spain,2000,4
            Spain,Total 2000,4
            Spain,2001,
            Spain,2001,5
            Spain,Total 2001,5
            Total Spain,,9
            (Blanks),,
            (Blanks),2000,
            (Blanks),2000,6
            (Blanks),2000,7
            (Blanks),Total 2000,13
            (Blanks),2001,
            (Blanks),2001,8
            (Blanks),Total 2001,8
            (Blanks),(Blanks),
            (Blanks),(Blanks),9
            (Blanks),Total (Blanks),9
            Total (Blanks),,30
        `);
    });
});
