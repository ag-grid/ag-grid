import type {
    GetRowIdParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForNoLoadingRows } from '../../test-utils';

describe('ssrm refreshServerSide with expanded groups', () => {
    const gridManager = new TestGridsManager({
        modules: [RowGroupingModule, ServerSideRowModelModule, ServerSideRowModelApiModule],
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

    const getDataForRequest = (request: IServerSideGetRowsRequest, rows: ServerSideRow[]): ServerSideResponseRow[] => {
        const rowGroupCols = request.rowGroupCols ?? [];
        const groupKeys = (request.groupKeys ?? []) as Array<string | null>;

        const matching = rows.filter((row) =>
            groupKeys.every((key, idx) => {
                const field = rowGroupCols[idx].field! as keyof ServerSideRow;
                return String(row[field] ?? '') === String(key ?? '');
            })
        );

        if (rowGroupCols.length > groupKeys.length) {
            const nextField = rowGroupCols[groupKeys.length].field! as keyof ServerSideRow;
            const seen = new Set<string>();
            const result: ServerSideResponseRow[] = [];

            for (const row of matching) {
                const rawValue = String(row[nextField] ?? '');
                if (seen.has(rawValue)) continue;
                seen.add(rawValue);

                const keyValue = rawValue === '' ? null : rawValue;
                const childRows = matching.filter((c) => String(c[nextField] ?? '') === rawValue);
                const medals = childRows.reduce((total, c) => total + (c.medals ?? 0), 0);

                result.push({
                    id: [...groupKeys, `${nextField}:${rawValue}`].join('|') || 'root',
                    key: keyValue,
                    [nextField]: rawValue,
                    groupData: { [nextField]: keyValue },
                    group: true,
                    leafGroup: groupKeys.length === rowGroupCols.length - 1,
                    medals,
                });
            }
            return result;
        }

        return matching.map((row) => ({ ...row }));
    };

    const createMutableDatasource = (dataRef: { current: ServerSideRow[] }): IServerSideDatasource => ({
        getRows(params: IServerSideGetRowsParams) {
            const rowData = getDataForRequest(params.request, dataRef.current);
            setTimeout(() => {
                params.success?.({ rowData });
            }, 0);
        },
    });

    const getRowId = ({ data }: GetRowIdParams<ServerSideRow>): string => data.id;

    const originalData: ServerSideRow[] = [
        { id: 'ie-2020-1', country: 'Ireland', year: '2020', medals: 2 },
        { id: 'ie-2021-1', country: 'Ireland', year: '2021', medals: 3 },
        { id: 'fr-2020-1', country: 'France', year: '2020', medals: 4 },
    ];

    const updatedData: ServerSideRow[] = [
        { id: 'ie-2020-1', country: 'Ireland', year: '2020', medals: 2 },
        { id: 'ie-2021-1', country: 'Ireland', year: '2021', medals: 10 },
        { id: 'ie-2022-1', country: 'Ireland', year: '2022', medals: 7 },
        { id: 'fr-2020-1', country: 'France', year: '2020', medals: 4 },
    ];

    async function createGridWithExpandedIreland(
        dataRef: { current: ServerSideRow[] },
        extraOptions: Record<string, unknown> = {}
    ) {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createMutableDatasource(dataRef),
            getRowId,
            ...extraOptions,
        });

        await waitForNoLoadingRows(api);

        const irelandNode = api.getRowNode('country:Ireland');
        expect(irelandNode).toBeDefined();
        api.setRowNodeExpanded(irelandNode!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'initial — Ireland expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        return api;
    }

    test('non-purge refresh does not re-fetch expanded child stores', async () => {
        const dataRef = { current: originalData };
        const api = await createGridWithExpandedIreland(dataRef);

        // Simulate server-side data change
        dataRef.current = updatedData;

        api.refreshServerSide({ purge: false });
        await waitForNoLoadingRows(api);

        // Non-purge refresh marks nodes for refresh but does not re-fetch child stores,
        // so the expanded group retains its previously loaded data.
        await new GridRows(api, 'after non-purge refresh — children unchanged').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });

    test('purgeClosedRowNodes causes collapse then re-expand to fetch fresh data', async () => {
        const dataRef = { current: originalData };
        const api = await createGridWithExpandedIreland(dataRef, { purgeClosedRowNodes: true });

        // Simulate server-side data change
        dataRef.current = updatedData;

        // Collapse Ireland — purgeClosedRowNodes destroys the child store
        const irelandNode = api.getRowNode('country:Ireland');
        api.setRowNodeExpanded(irelandNode!, false);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'after collapse — both groups collapsed').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Re-expand Ireland — child store is recreated, fetching fresh data from the datasource
        api.setRowNodeExpanded(irelandNode!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'after re-expand — fresh data loaded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ ├── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:10
            │ └── LEAF id:ie-2022-1 country:"Ireland" year:"2022" medals:7
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });

    test('serverSideSortAllLevels re-fetches expanded child stores on sort change', async () => {
        const dataRef = { current: originalData };
        const api = await createGridWithExpandedIreland(dataRef, { serverSideSortAllLevels: true });

        // Simulate server-side data change
        dataRef.current = updatedData;

        // Apply a sort — serverSideSortAllLevels causes all levels to be re-fetched
        api.applyColumnState({ state: [{ colId: 'year', sort: 'desc' }] });
        await waitForNoLoadingRows(api);

        // Sort triggers refreshAfterSort which recurses into child stores and destroys/recreates
        // their caches, causing fresh data to be fetched. Expansion state is maintained.
        // (Row order depends on server response; the key assertion is that the data is fresh.)
        await new GridRows(api, 'after sort — fresh data, expansion maintained').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:19
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ ├── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:10
            │ └── LEAF id:ie-2022-1 country:"Ireland" year:"2022" medals:7
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });

    test('serverSideEnableClientSideSort with fully loaded store sorts in memory without re-fetching', async () => {
        // With default cacheBlockSize (100), 2 leaf rows fit in a single block → store is fully loaded.
        // Client-side sort reorders in memory without a server request, so data remains unchanged.
        const dataRef = { current: originalData };
        const api = await createGridWithExpandedIreland(dataRef, {
            serverSideSortAllLevels: true,
            serverSideEnableClientSideSort: true,
        });

        // Simulate server-side data change
        dataRef.current = updatedData;

        // Apply a sort — store is fully loaded so client-side sort is used
        api.applyColumnState({ state: [{ colId: 'year', sort: 'desc' }] });
        await waitForNoLoadingRows(api);

        // Client-side sort reorders the existing cached rows without re-fetching,
        // so the data values are unchanged (stale) but the order is updated.
        await new GridRows(api, 'after sort — client-side sorted, data unchanged').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });

    test('purge refresh reloads expanded child stores and maintains expansion', async () => {
        const dataRef = { current: originalData };
        const api = await createGridWithExpandedIreland(dataRef);

        // Simulate server-side data change
        dataRef.current = updatedData;

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Purge refresh destroys and recreates all stores, fetching fresh data,
        // while maintaining the expansion state of previously expanded groups.
        await new GridRows(api, 'after purge refresh — fresh data, expansion maintained').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:19
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ ├── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:10
            │ └── LEAF id:ie-2022-1 country:"Ireland" year:"2022" medals:7
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);
    });
});
