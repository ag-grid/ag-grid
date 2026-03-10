import type {
    GetRowIdParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { GridStateModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../../test-utils';

describe('ssrm grouping column changes preserve expansion state', () => {
    const gridManager = new TestGridsManager({
        modules: [GridStateModule, RowGroupingModule, ServerSideRowModelModule],
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
        sport?: string;
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

    const serverSideRows3Level: ServerSideRow[] = [
        { id: 'ie-2020-foo', country: 'Ireland', year: '2020', sport: 'Football', medals: 2 },
        { id: 'ie-2020-rug', country: 'Ireland', year: '2020', sport: 'Rugby', medals: 1 },
        { id: 'ie-2021-foo', country: 'Ireland', year: '2021', sport: 'Football', medals: 3 },
        { id: 'fr-2020-foo', country: 'France', year: '2020', sport: 'Football', medals: 4 },
    ];

    const normaliseGroupKey = (key: string | null | undefined): string => (key == null || key === '' ? 'BLANK' : key);

    const getGroupId = (groupKeys: Array<string | null>, field: string, value: string | null | undefined) =>
        [...groupKeys.map(normaliseGroupKey), `${field}:${normaliseGroupKey(value)}`].join('|') || 'root';

    const getDataForRequest = (request: IServerSideGetRowsRequest, rows = serverSideRows): ServerSideResponseRow[] => {
        const rowGroupCols = request.rowGroupCols ?? [];
        const groupKeys = (request.groupKeys ?? []) as Array<string | null>;

        const normaliseForComparison = (value: string | null | undefined) => (value == null ? '' : value);

        const matching = rows.filter((row) =>
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

    const createDatasource = (rows = serverSideRows): IServerSideDatasource => ({
        getRows(params: IServerSideGetRowsParams) {
            const { request } = params;
            const rowData = getDataForRequest(request, rows);
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

        // waitForNoLoadingRows starts with asyncSetTimeout(0), flushing the debounced state update
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });

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

        // Ireland's ID is unchanged — it remains in the expanded set after the column change
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });
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

        // Flush the debounced state update (rowExpansionStateChanged is debounced 0ms)
        await asyncSetTimeout(0);

        // Ireland was auto-expanded by the callback (not in expandedRowGroupIds); France was
        // explicitly collapsed by the user (in collapsedRowGroupIds)
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: ['country:France'],
        });

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

        // France's explicitly-collapsed state is preserved across the column change
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: ['country:France'],
        });
    });

    test('resetRowGroupExpansion resets all groups back to defaults', async () => {
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

        // Both expanded nodes are recorded in the state
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });

        api.resetRowGroupExpansion();
        await waitForNoLoadingRows(api);

        // All groups should be collapsed (default)
        await new GridRows(api, 'after resetRowGroupExpansion — all collapsed').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // State cleared — no explicitly expanded or collapsed rows
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('resetRowGroupExpansion re-evaluates isServerSideGroupOpenByDefault callback', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            // Auto-expand Ireland only
            isServerSideGroupOpenByDefault: (params) => params.rowNode.key === 'Ireland',
        });

        await waitForNoLoadingRows(api);

        // Ireland auto-expanded via callback, France collapsed
        await new GridRows(api, 'initial — Ireland expanded via callback').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Manually collapse Ireland and expand France (overrides)
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, false);
        api.setRowNodeExpanded(api.getRowNode('country:France')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'user overrides: Ireland collapsed, France expanded').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └─┬ GROUP-leafGroup id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
            · └── LEAF id:fr-2020-1 country:"France" year:"2020" medals:4
        `);

        // User overrides are tracked: Ireland explicitly collapsed, France explicitly expanded
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:France'],
            collapsedRowGroupIds: ['country:Ireland'],
        });

        api.resetRowGroupExpansion();
        await waitForNoLoadingRows(api);

        // Callback re-evaluated: Ireland expanded, France collapsed (back to initial state)
        await new GridRows(api, 'after resetRowGroupExpansion — callback re-evaluated').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // State cleared — callback handles expansion, not the state service
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('add deeper group column with all top-level groups collapsed — no new getRows requests', async () => {
        let getRowsCallCount = 0;
        const countingDatasource: IServerSideDatasource = {
            getRows(params: IServerSideGetRowsParams) {
                getRowsCallCount++;
                const rowData = getDataForRequest(params.request);
                setTimeout(() => params.success?.({ rowData }), 0);
            },
        };

        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: countingDatasource,
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // All country groups are collapsed (default) — one root-level getRows request made
        await new GridRows(api, 'initial — all groups collapsed').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        const callsAfterInit = getRowsCallCount;
        expect(callsAfterInit).toBeGreaterThan(0);

        // No nodes have been interacted with — state is empty
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });

        // Add year as a second group column; no nodes are expanded so no child data is needed
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // No new getRows calls should have been made
        expect(getRowsCallCount).toBe(callsAfterInit);

        // Country groups still collapsed; leafGroup updated to false now that year sits below
        await new GridRows(api, 'after adding year — all still collapsed, no new requests').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // State remains empty — nothing was expanded or explicitly collapsed
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('expandAll (ssrmExpandAllAffectsAllRows) then add deeper group column — new sub-groups load collapsed', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            ssrmExpandAllAffectsAllRows: true,
        });

        await waitForNoLoadingRows(api);

        // Collapse France before expandAll to verify it gets expanded too
        api.setRowNodeExpanded(api.getRowNode('country:France')!, false);

        // expandAll switches to ExpandAllStrategy
        api.expandAll();
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'after expandAll — all countries expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └─┬ GROUP-leafGroup id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
            · └── LEAF id:fr-2020-1 country:"France" year:"2020" medals:4
        `);

        // expandAll with ssrmExpandAllAffectsAllRows uses the ExpandAllStrategy, stored in ssrmRowGroupExpansion
        expect(api.getState().ssrmRowGroupExpansion).toEqual({
            expandAll: true,
            invertedRowGroupIds: [],
        });

        // Add year as a second group column — ExpandAllStrategy is NOT preserved across group column changes
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Country groups remain expanded (node.expanded wasn't reset). New year sub-groups load
        // with the fresh ExpandStrategy (no state) so they default to collapsed.
        await new GridRows(api, 'after adding year — countries expanded, year sub-groups collapsed').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── GROUP-leafGroup collapsed id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └─┬ GROUP id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
            · └── GROUP-leafGroup collapsed id:"France|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:4
        `);

        // After the column change, the ExpandAllStrategy is replaced with a fresh ExpandStrategy.
        // The countries remain visually expanded (node.expanded was not reset), but the strategy
        // has no recorded expansions — state reflects what the strategy knows, not visual state.
        expect(api.getState().ssrmRowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
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

        // Both expanded nodes are tracked by the strategy
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });

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

        // SSRM does not purge loaded stores when a group column is removed, so the year sub-groups
        // remain visible and expanded. The expansion strategy is rebuilt on columnRowGroupChanged,
        // but because rowGroupColsSvc.columns is still the old value at that point (columns are
        // fully updated only by newColumnsLoaded), no IDs are filtered out. The state therefore
        // reflects the actual visual state: both country and year-level nodes remain expanded.
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });
    });

    test('removing the top group column resets root store — expansion state is stale', async () => {
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

        // Expand Ireland and Ireland/2020
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|year:2020')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland and Ireland/2020 expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });

        // Remove country from grouping — only year remains (firstDirtyLevel=0 → resetRootStore)
        api.setGridOption('columnDefs', [
            { field: 'country' },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // SSRM preserves existing stores on setGridOption column changes (rowGroupColsSvc.columns
        // is stale at the time onColumnEverything runs, so rowGroupDifferent stays false).
        // The country/year structure and expansion from before the column removal are intact.
        await new GridRows(api, 'after removing country group column').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // The expansion state retains the old IDs because rowGroupColsSvc.columns is stale at the
        // time preserveAndResetExpand runs on columnRowGroupChanged (firstDirtyLevel stays at
        // the stale column count, so no IDs are filtered).
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });
    });

    test('adding a group column above existing resets root store — expansion state is stale', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country' }, { field: 'year', rowGroupIndex: 0, hide: true }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand year:2020
        api.setRowNodeExpanded(api.getRowNode('year:2020')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'year:2020 expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:6
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:fr-2020-1 country:"France" year:"2020" medals:4
            └── GROUP-leafGroup collapsed id:"year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['year:2020'],
            collapsedRowGroupIds: [],
        });

        // Add country as a new top-level group column above year (firstDirtyLevel=0 → resetRootStore)
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 1, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Root store reset — country is now the top-level group. year:2020 stale expansion ID
        // no longer matches the new country-level structure, so everything loads collapsed.
        await new GridRows(api, 'after adding country above year').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Root store reset clears all expansion state — year:2020 is no longer valid
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('removing a middle group column — country preserved, deeper levels discarded', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'medals' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(serverSideRows3Level),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland → 2020 → Football
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|year:2020')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|2020|sport:Football')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'three levels expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:6
            │ ├─┬ GROUP id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:3
            │ │ ├─┬ GROUP-leafGroup id:"Ireland|2020|sport:Football" ag-Grid-AutoColumn:"Football" sport:"Football" medals:2
            │ │ │ └── LEAF id:ie-2020-foo country:"Ireland" year:"2020" sport:"Football" medals:2
            │ │ └── GROUP-leafGroup collapsed id:"Ireland|2020|sport:Rugby" ag-Grid-AutoColumn:"Rugby" sport:"Rugby" medals:1
            │ └── GROUP collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020', 'Ireland|2020|sport:Football'],
            collapsedRowGroupIds: [],
        });

        // Remove year from grouping (firstDirtyLevel=1 → refreshAfterGroupColumnChange preserves country)
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: false },
            { field: 'sport', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Country (Ireland) preserved expanded. Sport groups are fresh (new IDs without year in path)
        // so they load collapsed.
        await new GridRows(api, 'after removing middle year column').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:6
            │ ├── GROUP-leafGroup collapsed id:"Ireland|sport:Football" ag-Grid-AutoColumn:"Football" sport:"Football" medals:5
            │ └── GROUP-leafGroup collapsed id:"Ireland|sport:Rugby" ag-Grid-AutoColumn:"Rugby" sport:"Rugby" medals:1
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Stale IDs from year/sport levels are cleaned up — only country:Ireland remains
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });
    });

    test('adding a group column in the middle — country preserved, sport level discarded', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year' },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'medals' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(serverSideRows3Level),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland and Ireland/Football
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|sport:Football')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland and Ireland/Football expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:6
            │ ├─┬ GROUP-leafGroup id:"Ireland|sport:Football" ag-Grid-AutoColumn:"Football" sport:"Football" medals:5
            │ │ ├── LEAF id:ie-2020-foo country:"Ireland" year:"2020" sport:"Football" medals:2
            │ │ └── LEAF id:ie-2021-foo country:"Ireland" year:"2021" sport:"Football" medals:3
            │ └── GROUP-leafGroup collapsed id:"Ireland|sport:Rugby" ag-Grid-AutoColumn:"Rugby" sport:"Rugby" medals:1
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|sport:Football'],
            collapsedRowGroupIds: [],
        });

        // Add year in the middle (firstDirtyLevel=1 → sport slot replaced by year at level 1)
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 1, hide: true },
            { field: 'sport', rowGroupIndex: 2, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Country (Ireland) preserved expanded. Year groups load fresh (collapsed by default).
        // Sport expansion at the old level is stale.
        await new GridRows(api, 'after adding year in the middle').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:6
            │ ├── GROUP collapsed id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:3
            │ └── GROUP collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Stale sport-level ID is cleaned up — only country:Ireland remains
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });
    });

    test('swapping group column order — country preserved, deeper levels discarded', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroupIndex: 0, hide: true },
                { field: 'year', rowGroupIndex: 1, hide: true },
                { field: 'sport', rowGroupIndex: 2, hide: true },
                { field: 'medals' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(serverSideRows3Level),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland → 2020 → Football
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|year:2020')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|2020|sport:Football')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'three levels expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:6
            │ ├─┬ GROUP id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:3
            │ │ ├─┬ GROUP-leafGroup id:"Ireland|2020|sport:Football" ag-Grid-AutoColumn:"Football" sport:"Football" medals:2
            │ │ │ └── LEAF id:ie-2020-foo country:"Ireland" year:"2020" sport:"Football" medals:2
            │ │ └── GROUP-leafGroup collapsed id:"Ireland|2020|sport:Rugby" ag-Grid-AutoColumn:"Rugby" sport:"Rugby" medals:1
            │ └── GROUP collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020', 'Ireland|2020|sport:Football'],
            collapsedRowGroupIds: [],
        });

        // Swap year and sport (firstDirtyLevel=1 — sport replaces year at index 1)
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 2, hide: true },
            { field: 'sport', rowGroupIndex: 1, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Country (Ireland) preserved. Sport groups are fresh at level 1 — collapsed by default.
        await new GridRows(api, 'after swapping year and sport').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:6
            │ ├── GROUP collapsed id:"Ireland|sport:Football" ag-Grid-AutoColumn:"Football" sport:"Football" medals:5
            │ └── GROUP collapsed id:"Ireland|sport:Rugby" ag-Grid-AutoColumn:"Rugby" sport:"Rugby" medals:1
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Stale IDs from year/sport levels are cleaned up — only country:Ireland remains
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });
    });

    test('reversing all group columns resets root — all expansion lost', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [
                { field: 'country', rowGroupIndex: 0, hide: true },
                { field: 'year', rowGroupIndex: 1, hide: true },
                { field: 'sport', rowGroupIndex: 2, hide: true },
                { field: 'medals' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(serverSideRows3Level),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland → 2020
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|year:2020')!, true);
        await waitForNoLoadingRows(api);

        // Reverse all three: sport(0) → year(1) → country(2). firstDirtyLevel=0 — root resets.
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 2, hide: true },
            { field: 'year', rowGroupIndex: 1, hide: true },
            { field: 'sport', rowGroupIndex: 0, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'after reversing all group columns').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:"sport:Football" ag-Grid-AutoColumn:"Football" sport:"Football" medals:9
            └── GROUP collapsed id:"sport:Rugby" ag-Grid-AutoColumn:"Rugby" sport:"Rugby" medals:1
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('resetRowGroupExpansion clears preserved expansion state after column change', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);

        // Add year as a second group column — Ireland's expansion is preserved
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland preserved expanded after adding year').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── GROUP-leafGroup collapsed id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });

        api.resetRowGroupExpansion();
        await waitForNoLoadingRows(api);

        // Reset clears all expansion — all groups collapse back to default
        await new GridRows(api, 'after resetRowGroupExpansion — all collapsed').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('changing the server-side datasource reloads data, expansion state is preserved', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });

        // Replace with a new datasource using the same data structure
        api.setGridOption('serverSideDatasource', createDatasource());
        await waitForNoLoadingRows(api);

        // Data reloads from the new datasource. The expansion strategy is NOT reset on a datasource
        // change — country:Ireland remains in expandedRowGroupIds and is re-expanded when loaded.
        await new GridRows(api, 'after datasource change — Ireland re-expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Expansion state is preserved across datasource changes (the strategy is not cleared)
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });
    });

    test('purgeClosedRowNodes — collapsing a node purges its store and removes it from expansion state', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
            purgeClosedRowNodes: true,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });

        // Collapse Ireland — with purgeClosedRowNodes:true, the child store is destroyed
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, false);
        await asyncSetTimeout(0);

        await new GridRows(api, 'Ireland collapsed — child store purged').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Ireland is no longer in the expanded set after being collapsed
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
    });

    test('state round-trip via setState restores expansion correctly', async () => {
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

        // Expand Ireland and Ireland/2020
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);
        api.setRowNodeExpanded(api.getRowNode('Ireland|year:2020')!, true);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'Ireland and Ireland/2020 expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        const savedState = api.getState();
        expect(savedState.rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });

        // Reset all expansion
        api.resetRowGroupExpansion();
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'after reset — all collapsed').check(`
            ROOT id:<no-id>
            ├── GROUP collapsed id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Restore via setState
        api.setState(savedState);
        await waitForNoLoadingRows(api); // Wait for Ireland to expand and load year children
        await waitForNoLoadingRows(api); // Wait for Ireland/2020 to expand and load leaf rows

        // Ireland and Ireland/2020 should be re-expanded from the restored state
        await new GridRows(api, 'after setState — expansion restored').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├─┬ GROUP-leafGroup id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ │ └── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland', 'Ireland|year:2020'],
            collapsedRowGroupIds: [],
        });
    });

    test('setState-restored expansion IDs survive a subsequent group column change', async () => {
        const api = await gridManager.createGridAndWait(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'medals' }],
            autoGroupColumnDef: { headerName: 'Group' },
            rowModelType: 'serverSide',
            serverSideDatasource: createDatasource(),
            getRowId,
        });

        await waitForNoLoadingRows(api);

        // Expand Ireland via the UI so the strategy records its level
        api.setRowNodeExpanded(api.getRowNode('country:Ireland')!, true);
        await waitForNoLoadingRows(api);

        // Save the state, then reset expansion
        const savedState = api.getState();
        expect(savedState.rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });

        api.resetRowGroupExpansion();
        await waitForNoLoadingRows(api);

        // Restore expansion via setState — this calls setExpandedState which does NOT
        // populate nodeLevels in the strategy
        api.setState(savedState);
        await waitForNoLoadingRows(api);

        // Ireland should be expanded again from the restored state
        await new GridRows(api, 'after setState — Ireland re-expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── LEAF id:ie-2020-1 country:"Ireland" year:"2020" medals:2
            │ └── LEAF id:ie-2021-1 country:"Ireland" year:"2021" medals:3
            └── GROUP-leafGroup collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // Now add year as a second group column — this triggers preserveAndResetExpand
        // which filters IDs by getNodeLevel(). The bug: setState-restored IDs have no
        // recorded level, so getNodeLevel returns undefined and isValidLevel drops them.
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'medals' },
        ]);
        await waitForNoLoadingRows(api);

        // Ireland's expansion should be preserved — it's a level-0 ID and only level ≥ 1 changed
        await new GridRows(api, 'after adding year — Ireland should remain expanded').check(`
            ROOT id:<no-id>
            ├─┬ GROUP id:"country:Ireland" ag-Grid-AutoColumn:"Ireland" country:"Ireland" medals:5
            │ ├── GROUP-leafGroup collapsed id:"Ireland|year:2020" ag-Grid-AutoColumn:"2020" year:"2020" medals:2
            │ └── GROUP-leafGroup collapsed id:"Ireland|year:2021" ag-Grid-AutoColumn:"2021" year:"2021" medals:3
            └── GROUP collapsed id:"country:France" ag-Grid-AutoColumn:"France" country:"France" medals:4
        `);

        // The setState-restored ID should survive the column change
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['country:Ireland'],
            collapsedRowGroupIds: [],
        });
    });
});
