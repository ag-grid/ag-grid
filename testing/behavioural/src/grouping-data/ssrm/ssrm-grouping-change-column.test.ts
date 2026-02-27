import type {
    GetRowIdParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForNoLoadingRows } from '../../test-utils';

describe('ssrm grouping column changes preserve expansion state', () => {
    const gridManager = new TestGridsManager({
        modules: [RowGroupingModule, ServerSideRowModelModule],
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
        { id: 'ie-2020-1', country: 'Ireland', year: '2020', medals: 2 },
        { id: 'ie-2021-1', country: 'Ireland', year: '2021', medals: 3 },
        { id: 'fr-2020-1', country: 'France', year: '2020', medals: 4 },
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

    const getRowId = ({ data }: GetRowIdParams<ServerSideRow>): string => data.id;

    test('expand groups then add deeper group column — groups remain expanded', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland
        const irelandNode = api.getRowNode('country:Ireland');
        expect(irelandNode).toBeDefined();
        api.setRowNodeExpanded(irelandNode!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland expanded, France collapsed').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Add year as a second group column
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Ireland should remain expanded; new year sub-groups get default state (collapsed)
        await new GridRows(api, 'after adding year as group column').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── GROUP-leafGroup collapsed id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });

    test('isServerSideGroupOpenByDefault — user collapse preserved, callback consulted for new nodes', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            // Auto-expand all country groups by default
            isServerSideGroupOpenByDefault: () => true,
        });

        await waitForNoLoadingRows(api);

        // Both countries auto-expanded via callback
        await new GridRows(api, 'initial — both countries expanded via callback').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └─┬ GROUP-leafGroup id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
            · └── LEAF id:fr-2020-1 country:"France" year:"2020" medals:4
        `);

        // Manually collapse France — overrides the callback default
        api.setRowNodeExpanded(api.getRowNode('country:France')!, false);

        await new GridRows(api, 'France manually collapsed').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Add year as a second group column
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Ireland stays expanded (preserved). France stays collapsed (user intent beats callback).
        // New year sub-groups under Ireland are expanded via isServerSideGroupOpenByDefault callback.
        await new GridRows(api, 'after adding year — callback consulted for new nodes').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └─┬ GROUP-leafGroup id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            │ · └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });

    test('expand groups then remove deepest group column — groups remain expanded', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'medals' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland
        const irelandNode = api.getRowNode('country:Ireland');
        expect(irelandNode).toBeDefined();
        api.setRowNodeExpanded(irelandNode!, true);
        await waitForNoLoadingRows(api);

        // Expand Ireland/2020
        const ireland2020Node = api.getRowNode('Ireland|year:2020');
        expect(ireland2020Node).toBeDefined();
        api.setRowNodeExpanded(ireland2020Node!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland and Ireland/2020 expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Remove year from grouping
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year' },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Ireland should remain expanded (with year sub-groups intact — SSRM doesn't auto-refresh stores on column removal).
        // Ireland/2020 should remain expanded. France should remain collapsed.
        await new GridRows(api, 'after removing year group column').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });
});
