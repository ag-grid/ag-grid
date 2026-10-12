import { waitFor } from '@testing-library/dom';
import { RowDragDispatcher, TestGridsManager, mockGridLayout, nextAnimationFrame } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ExternalFilterModule,
    NumberFilterModule,
    PaginationModule,
    PinnedRowModule,
    QuickFilterModule,
    RowDragModule,
    RowSelectionModule,
    ScrollApiModule,
    TextFilterModule,
    VisibleRowsModule,
} from 'ag-grid-community';
import { MasterDetailModule, PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { createRecorder, range } from './visibleRowsTestUtils';

describe('CSRM subscribeToVisibleRows integration', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            VisibleRowsModule,
            ScrollApiModule,
            NumberFilterModule,
            TextFilterModule,
            QuickFilterModule,
            ExternalFilterModule,
            PaginationModule,
            PinnedRowModule,
            RowSelectionModule,
            RowDragModule,
            CellSpanModule,
            RowGroupingModule,
            TreeDataModule,
            PivotModule,
            MasterDetailModule,
        ],
    });

    let originalGridHeight: number;

    beforeAll(() => {
        // The grid then shows rows 0-5 (rows are 42px high), with row 5 partly visible.
        mockGridLayout.useRealOffsetDimensions = true;
        originalGridHeight = mockGridLayout.gridHeight;
        mockGridLayout.gridHeight = 300;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.gridHeight = originalGridHeight;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createRows(count: number) {
        return Array.from({ length: count }, (_, i) => ({ id: String(i), value: i }));
    }

    async function createFlatGrid(options: GridOptions = {}, rowCount = 100): Promise<GridApi> {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
            rowData: createRows(rowCount),
            rowBuffer: 5,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            ...options,
        });
        await nextAnimationFrame();
        return api;
    }

    /** Waits long enough for any batch a change scheduled to have been delivered. */
    async function settle(): Promise<void> {
        await nextAnimationFrame();
        await nextAnimationFrame();
    }

    describe('tree data', () => {
        const treeRows = [
            { id: 'a', path: ['A'] },
            { id: 'a1', path: ['A', 'A1'] },
            { id: 'a2', path: ['A', 'A2'] },
            { id: 'b', path: ['B'] },
            { id: 'b1', path: ['B', 'B1'] },
            { id: 'b1x', path: ['B', 'B1', 'X'] },
            { id: 'c', path: ['C'] },
        ];

        async function createTreeGrid(options: GridOptions = {}): Promise<GridApi> {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }],
                autoGroupColumnDef: { filter: 'agTextColumnFilter' },
                treeData: true,
                getDataPath: (data) => data.path,
                getRowId: (params) => params.data.id,
                rowData: treeRows,
                ...options,
            });
            await nextAnimationFrame();
            return api;
        }

        test('expanding a tree parent subscribes its children and keeps the rest', async () => {
            const api = await createTreeGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(['a', 'b', 'c']);

            api.setRowNodeExpanded(api.getRowNode('b')!, true);

            await waitFor(() => expect(recorder.ids()).toEqual(['a', 'b', 'b1', 'c']));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', ids: ['b1'] }]);
            expect(recorder.subscribed.get('b1')).toMatchObject({ route: ['B', 'B1'], parentKeys: ['B'], level: 1 });
            expect(recorder.violations).toEqual([]);
        });

        test('collapsing a tree parent unsubscribes every visible descendant', async () => {
            const api = await createTreeGrid({ groupDefaultExpanded: -1 });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(['a', 'a1', 'a2', 'b', 'b1', 'b1x']);

            api.setRowNodeExpanded(api.getRowNode('b')!, false);

            await waitFor(() => expect(recorder.ids()).toEqual(['a', 'a1', 'a2', 'b', 'c']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['b1', 'b1x'] },
                { type: 'subscribe', ids: ['c'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('rows shown by groupDefaultExpanded when data arrives after subscribing are subscribed', async () => {
            const api = await createTreeGrid({ groupDefaultExpanded: -1, rowData: [] });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.calls).toEqual([{ type: 'subscribe', ids: [] }]);

            api.setGridOption('rowData', treeRows);

            await waitFor(() => expect(recorder.ids()).toEqual(['a', 'a1', 'a2', 'b', 'b1', 'b1x']));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', ids: ['a', 'a1', 'a2', 'b', 'b1', 'b1x'] }]);
            expect(recorder.violations).toEqual([]);
        });

        test('filtering tree data keeps the ancestors of matching rows subscribed', async () => {
            const api = await createTreeGrid({ groupDefaultExpanded: -1 });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setGridOption('quickFilterText', 'b1x');

            await waitFor(() => expect(recorder.ids()).toEqual(['b', 'b1', 'b1x']));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: ['a', 'a1', 'a2'] }]);
            expect(recorder.violations).toEqual([]);
        });

        test('treeDataParentIdField rows carry the parent ids as parentKeys', async () => {
            const api = await createTreeGrid({
                getDataPath: undefined,
                treeDataParentIdField: 'parentId',
                groupDefaultExpanded: -1,
                rowData: [{ id: 'p' }, { id: 'q', parentId: 'p' }, { id: 'r', parentId: 'q' }],
            });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.ids()).toEqual(['p', 'q', 'r']);
            expect(recorder.subscribed.get('r')).toMatchObject({
                route: ['p', 'q', 'r'],
                parentKeys: ['p', 'q'],
                level: 2,
            });
        });

        test('treeDataParentIdField: a transaction re-parenting a visible row unsubscribes its old ref and subscribes the new one', async () => {
            const api = await createTreeGrid({
                getDataPath: undefined,
                treeDataParentIdField: 'parentId',
                groupDefaultExpanded: -1,
                rowData: [{ id: 'p' }, { id: 'q', parentId: 'p' }, { id: 'r', parentId: 'q' }, { id: 's' }],
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyTransaction({ update: [{ id: 'r', parentId: 's' }] });

            await waitFor(() => expect(recorder.subscribed.get('r')).toMatchObject({ parentKeys: ['s'], level: 1 }));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['r'] },
                { type: 'subscribe', ids: ['r'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('row grouping', () => {
        const countries = ['Ireland', 'Spain', 'France'];

        function createGroupedRows(perCountry = 10) {
            return countries.flatMap((country) =>
                Array.from({ length: perCountry }, (_, i) => ({
                    id: `${country}-${i}`,
                    country,
                    sport: i % 2 ? 'Golf' : 'Rugby',
                    value: i,
                }))
            );
        }

        async function createGroupedGrid(options: GridOptions = {}): Promise<GridApi> {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport' },
                    { field: 'value', sortable: true, filter: 'agNumberColumnFilter' },
                ],
                rowData: createGroupedRows(),
                rowBuffer: 5,
                suppressRowVirtualisation: false,
                getRowId: (params) => params.data.id,
                ...options,
            });
            await nextAnimationFrame();
            return api;
        }

        const groupIds = (api: GridApi) => [0, 1, 2].map((i) => api.getDisplayedRowAtIndex(i)!.id!);

        test('groupHideOpenParents: expanding a group shows its children in place of its row, and collapsing it restores the groups', async () => {
            const api = await createGroupedGrid({ groupHideOpenParents: true, groupDisplayType: 'multipleColumns' });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const groups = groupIds(api);
            const [ireland, spain, france] = groups;
            const irelandRows = range(0, 5).map((i) => `Ireland-${i}`);

            api.setRowNodeExpanded(api.getRowNode(ireland)!, true);
            await waitFor(() => expect(recorder.ids()).toEqual(irelandRows));
            api.setRowNodeExpanded(api.getRowNode(ireland)!, false);
            await waitFor(() => expect(recorder.ids()).toEqual([...groups].sort()));

            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: [ireland, spain, france] },
                { type: 'subscribe', ids: irelandRows },
                { type: 'unsubscribe', ids: irelandRows },
                { type: 'subscribe', ids: groups },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('groupHideOpenParents: expandAll unsubscribes the open parents it hides', async () => {
            const api = await createGroupedGrid({ groupHideOpenParents: true, groupDisplayType: 'multipleColumns' });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const groups = groupIds(api);

            api.expandAll();

            await waitFor(() => expect(recorder.calls.length).toBeGreaterThan(1));
            expect(recorder.calls.filter((c) => c.type === 'unsubscribe')).toEqual([
                { type: 'unsubscribe', ids: groups },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test("groupDisplayType 'groupRows' still reports the group rows, which are drawn full width", async () => {
            const api = await createGroupedGrid({ groupDisplayType: 'groupRows' });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.calls).toEqual([{ type: 'subscribe', ids: groupIds(api) }]);
            expect(recorder.subscribed.get(groupIds(api)[0])).toMatchObject({ group: true, route: ['Ireland'] });
        });

        test("groupDisplayType 'multipleColumns' with two levels gives nested rows their full route", async () => {
            const api = await createGroupedGrid({
                groupDisplayType: 'multipleColumns',
                groupDefaultExpanded: -1,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'value' },
                ],
            });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            const sportGroup = api.getDisplayedRowAtIndex(1)!;
            expect(recorder.subscribed.get(sportGroup.id!)).toMatchObject({
                route: ['Ireland', 'Rugby'],
                parentKeys: ['Ireland'],
                level: 1,
                group: true,
            });
            expect(recorder.subscribed.get('Ireland-0')).toMatchObject({ parentKeys: ['Ireland', 'Rugby'], level: 2 });
        });

        test('group total rows and the grand total row are never reported', async () => {
            const api = await createGroupedGrid({
                groupTotalRow: 'bottom',
                grandTotalRow: 'top',
                rowData: createGroupedRows(2),
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            // The grand total row takes the first row.
            expect(recorder.ids()).toEqual(countries.map((c) => `row-group-country-${c}`).sort());

            api.expandAll();

            await waitFor(() => expect(recorder.subscribed.has('Ireland-1')).toBe(true));
            // Rows 0-5 are now: grand total, Ireland, Ireland-0, Ireland-1, Ireland total, Spain.
            expect(recorder.ids()).toEqual([
                'Ireland-0',
                'Ireland-1',
                'row-group-country-Ireland',
                'row-group-country-Spain',
            ]);
            expect(
                recorder.calls.flatMap((c) => c.ids).filter((id) => id.includes('Footer') || id.includes('footer'))
            ).toEqual([]);
            expect(recorder.violations).toEqual([]);
        });

        test('groupHideParentOfSingleChild reports a lone child in place of its hidden group, with that group as its parent', async () => {
            const api = await createGroupedGrid({
                groupHideParentOfSingleChild: true,
                rowData: [
                    { id: 'Ireland-0', country: 'Ireland', value: 0 },
                    { id: 'Spain-0', country: 'Spain', value: 0 },
                    { id: 'Spain-1', country: 'Spain', value: 1 },
                ],
            });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.ids()).toEqual(['Ireland-0', 'row-group-country-Spain']);
            expect(recorder.subscribed.get('Ireland-0')).toMatchObject({
                parentKeys: ['Ireland'],
                level: 1,
                group: false,
            });
        });

        test('grouping flat rows at runtime unsubscribes the leaf rows it moves into collapsed groups', async () => {
            const api = await createGroupedGrid({
                columnDefs: [{ field: 'country' }, { field: 'value' }],
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(range(0, 5).map((i) => `Ireland-${i}`));

            api.applyColumnState({ state: [{ colId: 'country', rowGroup: true }] });

            await waitFor(() => expect(recorder.ids()).toHaveLength(3));
            expect(recorder.calls.slice(1)).toEqual([
                // The leaf rows keep their nodes and move under the new groups.
                { type: 'unsubscribe', ids: range(0, 5).map((i) => `Ireland-${i}`) },
                { type: 'subscribe', ids: groupIds(api) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('changing the group column at runtime unsubscribes the old groups', async () => {
            const api = await createGroupedGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const oldGroups = groupIds(api);

            api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: false },
                    { colId: 'sport', rowGroup: true },
                ],
            });

            await waitFor(() => expect(recorder.ids()).toEqual(['row-group-sport-Golf', 'row-group-sport-Rugby']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: oldGroups },
                { type: 'subscribe', ids: ['row-group-sport-Rugby', 'row-group-sport-Golf'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('sorting the leaf rows of an expanded group unsubscribes and subscribes the rows it moves out of and into view', async () => {
            const api = await createGroupedGrid();
            api.setRowNodeExpanded(api.getDisplayedRowAtIndex(0)!, true);
            await nextAnimationFrame();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const ireland = api.getDisplayedRowAtIndex(0)!.id!;
            expect(recorder.ids()).toEqual([...range(0, 4).map((i) => `Ireland-${i}`), ireland]);

            api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

            await waitFor(() => expect(recorder.ids()).toEqual([...range(5, 9).map((i) => `Ireland-${i}`), ireland]));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 4).map((i) => `Ireland-${i}`) },
                {
                    type: 'subscribe',
                    ids: range(5, 9)
                        .map((i) => `Ireland-${i}`)
                        .reverse(),
                },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a filter that removes every leaf of a group unsubscribes the group', async () => {
            let hideSpain = false;
            const api = await createGroupedGrid({
                isExternalFilterPresent: () => hideSpain,
                doesExternalFilterPass: (node) => node.data.country !== 'Spain',
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const [ireland, spain, france] = groupIds(api);

            hideSpain = true;
            api.onFilterChanged();

            await waitFor(() => expect(recorder.ids()).toEqual([france, ireland]));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: [spain] }]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('master/detail and full width rows', () => {
        async function createMasterDetailGrid(options: GridOptions = {}): Promise<GridApi> {
            return createFlatGrid({
                masterDetail: true,
                detailCellRenderer: () => 'detail',
                detailRowHeight: 100,
                ...options,
            });
        }

        test('expanding a master row never reports its detail row, and scrolls the rows it pushes out of view', async () => {
            const api = await createMasterDetailGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setRowNodeExpanded(api.getRowNode('1')!, true);

            // Rows 0 and 1, the 100px detail row, then row 2.
            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 2)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(3, 5) }]);

            api.setRowNodeExpanded(api.getRowNode('1')!, false);

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(3, 5) }]);
            expect(recorder.calls.flatMap((c) => c.ids).some((id) => id.startsWith('detail'))).toBe(false);
            expect(recorder.violations).toEqual([]);
        });

        test('an expanded master row scrolled into view is reported, but its detail row is not', async () => {
            const api = await createMasterDetailGrid();
            api.setRowNodeExpanded(api.getRowNode('50')!, true);
            await nextAnimationFrame();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.ensureIndexVisible(50, 'top');

            // Row 50, its 100px detail row, then rows 51 and 52.
            await waitFor(() => expect(recorder.ids()).toEqual(range(50, 52)));
            expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(50, 52)]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('filtering', () => {
        test('a quick filter unsubscribes the rows it hides and subscribes the rows it reveals', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            // Matches 1, 10-19 and 21, 31, ...
            api.setGridOption('quickFilterText', '1');

            await waitFor(() => expect(recorder.ids()).toEqual(['1', ...range(10, 14)]));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['0', ...range(2, 5)] },
                { type: 'subscribe', ids: range(10, 14) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('an external filter unsubscribes the rows it hides and subscribes the rows it reveals', async () => {
            let even = false;
            const api = await createFlatGrid({
                isExternalFilterPresent: () => even,
                doesExternalFilterPass: (node) => node.data.value % 2 === 0,
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            even = true;
            api.onFilterChanged();

            await waitFor(() => expect(recorder.ids()).toEqual(['0', '2', '4', '6', '8', '10']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['1', '3', '5'] },
                { type: 'subscribe', ids: ['6', '8', '10'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a filter that removes every row unsubscribes them all, and clearing it subscribes them again', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 1000 });
            api.onFilterChanged();
            await waitFor(() => expect(recorder.subscribed.size).toBe(0));

            await api.setColumnFilterModel('value', null);
            api.onFilterChanged();
            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));

            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(0, 5) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a filter applied while scrolled down unsubscribes the rows moved out of view', async () => {
            const api = await createFlatGrid();
            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(range(50, 55));

            // Rows 0-10 are filtered out, so rows 61-66 move up to where rows 50-55 were.
            await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 10 });
            api.onFilterChanged();

            await waitFor(() => expect(recorder.ids()).toEqual(range(61, 66)));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(50, 55) },
                { type: 'subscribe', ids: range(61, 66) },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('pivot and aggregation', () => {
        async function createPivotGrid(options: GridOptions = {}): Promise<GridApi> {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', pivot: true },
                    { field: 'value', aggFunc: 'sum' },
                ],
                rowData: ['Ireland', 'Spain'].flatMap((country) =>
                    Array.from({ length: 4 }, (_, i) => ({
                        id: `${country}-${i}`,
                        country,
                        sport: i % 2 ? 'Golf' : 'Rugby',
                        value: i,
                    }))
                ),
                groupDefaultExpanded: -1,
                getRowId: (params) => params.data.id,
                ...options,
            });
            await nextAnimationFrame();
            return api;
        }

        test('turning pivot mode on unsubscribes the leaf rows it hides, and turning it off subscribes them again', async () => {
            const api = await createPivotGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const ireland = api.getDisplayedRowAtIndex(0)!.id!;
            const spain = api.getDisplayedRowAtIndex(5)!.id!;
            const irelandRows = range(0, 3).map((i) => `Ireland-${i}`);
            expect(recorder.ids()).toEqual([...irelandRows, ireland, spain]);

            api.setGridOption('pivotMode', true);
            await waitFor(() => expect(recorder.ids()).toEqual([ireland, spain]));
            api.setGridOption('pivotMode', false);
            await waitFor(() => expect(recorder.ids()).toEqual([...irelandRows, ireland, spain]));

            // The groups stay subscribed throughout.
            expect(recorder.calls.slice(1).flatMap((c) => c.ids)).toEqual([...irelandRows, ...irelandRows]);
            expect(recorder.violations).toEqual([]);
        });

        test('changing an aggregation function does not resubscribe the visible rows', async () => {
            const api = await createPivotGrid({
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                ],
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const initial = recorder.ids();

            api.applyColumnState({ state: [{ colId: 'value', aggFunc: 'max' }] });
            await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.aggData?.value).toBe(3));
            await settle();

            expect(recorder.calls).toHaveLength(1);
            expect(recorder.ids()).toEqual(initial);
        });
    });

    describe('pinned rows', () => {
        test('pinned rows are never reported, and pinning rows at runtime scrolls out the rows they cover', async () => {
            const api = await createFlatGrid({ pinnedBottomRowData: [{ id: 'bottom', value: -2 }] });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(range(0, 4));

            api.setGridOption('pinnedTopRowData', [
                { id: 'top1', value: -1 },
                { id: 'top2', value: -1 },
            ]);

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 2)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: ['3', '4'] }]);
            expect(recorder.calls.flatMap((c) => c.ids).filter((id) => /top|bottom/.test(id))).toEqual([]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('pagination', () => {
        test('going to the last, partly filled page subscribes only its rows', async () => {
            const api = await createFlatGrid({ pagination: true, paginationPageSize: 20 }, 42);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.paginationGoToLastPage();

            await waitFor(() => expect(recorder.ids()).toEqual(['40', '41']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: ['40', '41'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('shrinking the page size unsubscribes rows, and growing it subscribes them again', async () => {
            const api = await createFlatGrid({
                pagination: true,
                paginationPageSize: 20,
                paginationPageSizeSelector: [3, 20],
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setGridOption('paginationPageSize', 3);
            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 2)));

            api.setGridOption('paginationPageSize', 20);
            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));

            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(3, 5) },
                { type: 'subscribe', ids: range(3, 5) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('paginationAutoPageSize keeps the visible rows of the first page subscribed', async () => {
            const api = await createFlatGrid({ pagination: true, paginationAutoPageSize: true });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const pageSize = api.paginationGetPageSize();
            expect(recorder.ids()).toEqual(range(0, pageSize - 1));

            api.paginationGoToNextPage();

            await waitFor(() => expect(recorder.ids()).toEqual(range(pageSize, 2 * pageSize - 1)));
            expect(recorder.batches('unsubscribe')).toEqual([range(0, pageSize - 1)]);
            expect(recorder.batches('subscribe')).toEqual([range(0, pageSize - 1), range(pageSize, 2 * pageSize - 1)]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('transactions and row data', () => {
        test('adding a row above the view subscribes it and scrolls out the row it pushes down', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyTransaction({ add: [{ id: 'new', value: -1 }], addIndex: 0 });

            await waitFor(() => expect(recorder.ids()).toEqual([...range(0, 4), 'new']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['5'] },
                { type: 'subscribe', ids: ['new'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('updating the data of visible rows does not resubscribe them', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyTransaction({ update: [{ id: '2', value: 200 }] });
            await waitFor(() => expect(api.getRowNode('2')!.data.value).toBe(200));
            await settle();

            expect(recorder.calls).toHaveLength(1);
        });

        test('an async add sorted to the top is reported once the transaction is flushed', async () => {
            const api = await createFlatGrid({
                columnDefs: [{ field: 'value', sort: 'asc' }],
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyTransactionAsync({ add: [{ id: 'new', value: -1 }] });
            await settle();
            expect(recorder.calls).toHaveLength(1);

            api.flushAsyncTransactions();
            await waitFor(() => expect(recorder.ids()).toEqual([...range(0, 4), 'new']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['5'] },
                { type: 'subscribe', ids: ['new'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a transaction removing every row unsubscribes them all', async () => {
            const api = await createFlatGrid({}, 10);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyTransaction({ remove: createRows(10) });

            await waitFor(() => expect(recorder.subscribed.size).toBe(0));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(0, 5) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('replacing row data with the same ids keeps every row subscribed', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setGridOption(
                'rowData',
                createRows(100).map((row) => ({ ...row, value: row.value * 10 }))
            );
            await waitFor(() => expect(api.getRowNode('2')!.data.value).toBe(20));
            await settle();

            expect(recorder.calls).toHaveLength(1);
        });

        test('setting empty row data unsubscribes every row', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setGridOption('rowData', []);

            await waitFor(() => expect(recorder.subscribed.size).toBe(0));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(0, 5) }]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('row heights and layout', () => {
        test('getRowHeight decides how many rows are visible', async () => {
            const api = await createFlatGrid({ getRowHeight: (params) => (params.data.value < 2 ? 100 : 42) });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            // Rows 0 and 1 take 200px, so row 2 is partly visible.
            expect(recorder.ids()).toEqual(range(0, 2));
        });

        test('resetting row heights subscribes rows that now fit', async () => {
            let tall = true;
            const api = await createFlatGrid({ getRowHeight: () => (tall ? 100 : 42) });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(range(0, 2));

            tall = false;
            api.resetRowHeights();

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', ids: range(3, 5) }]);
            expect(recorder.violations).toEqual([]);
        });

        test("domLayout 'print' reports every row", async () => {
            const api = await createFlatGrid({ domLayout: 'print' }, 20);
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.ids()).toEqual(range(0, 19));
        });

        test('suppressRowVirtualisation renders every row but reports only the visible ones as you scroll', async () => {
            const api = await createFlatGrid({ suppressRowVirtualisation: true }, 30);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(range(0, 5));

            api.ensureIndexVisible(20, 'top');

            await waitFor(() => expect(recorder.ids()).toEqual(range(20, 25)));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(20, 25) },
            ]);

            const buffered = createRecorder();
            api.subscribeToVisibleRows(buffered.handlers, { includeBuffer: true });
            expect(buffered.ids()).toEqual(range(0, 29));
        });

        test('rowBuffer 0 makes includeBuffer report only the visible rows', async () => {
            const api = await createFlatGrid({ rowBuffer: 0 });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers, { includeBuffer: true });

            expect(recorder.ids()).toEqual(range(0, 5));
        });
    });

    describe('scrolling', () => {
        test("ensureIndexVisible with 'bottom' reports the rows ending at that index", async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.ensureIndexVisible(50, 'bottom');

            await waitFor(() => expect(recorder.ids()).toEqual(range(45, 50)));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(45, 50) },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('subscription lifecycle', () => {
        test('subscribing before any row data subscribes the first rows once they arrive', async () => {
            const api = await createFlatGrid({ rowData: undefined });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setGridOption('rowData', createRows(100));

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: [] },
                { type: 'subscribe', ids: range(0, 5) },
            ]);
        });

        test('a subscription started inside another handler gets the rows visible at that moment', async () => {
            const api = await createFlatGrid();
            const inner = createRecorder();
            let started = false;
            const outer = createRecorder((call) => {
                if (call.type === 'subscribe' && call.ids.includes('50') && !started) {
                    started = true;
                    api.subscribeToVisibleRows(inner.handlers);
                }
            });
            api.subscribeToVisibleRows(outer.handlers);

            api.ensureIndexVisible(50, 'top');

            await waitFor(() => expect(inner.ids()).toEqual(range(50, 55)));
            await settle();
            expect(inner.calls).toEqual([{ type: 'subscribe', ids: range(50, 55) }]);
            expect(outer.ids()).toEqual(range(50, 55));
            expect(outer.violations).toEqual([]);
        });

        test('stopping one subscription from inside another leaves the other unaffected', async () => {
            const api = await createFlatGrid();
            const second = createRecorder();
            let stopSecond: () => void = () => {};
            const first = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    stopSecond();
                }
            });
            api.subscribeToVisibleRows(first.handlers);
            stopSecond = api.subscribeToVisibleRows(second.handlers);

            api.ensureIndexVisible(50, 'top');

            await waitFor(() => expect(first.ids()).toEqual(range(50, 55)));
            await settle();
            expect(second.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(first.violations).toEqual([]);
        });

        test('destroying the grid inside a handler unsubscribes the remaining rows', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    api.destroy();
                }
            });
            const other = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            api.subscribeToVisibleRows(other.handlers);

            api.ensureIndexVisible(50, 'top');

            await waitFor(() => expect(api.isDestroyed()).toBe(true));
            await settle();
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(0, 5) }]);
            expect(other.calls.at(-1)).toEqual({ type: 'unsubscribe', ids: range(0, 5) });
            expect(recorder.subscribed.size).toBe(0);
            expect(other.subscribed.size).toBe(0);
            expect(recorder.violations).toEqual([]);
            expect(other.violations).toEqual([]);
        });

        test('setting rowModelType after creation leaves the subscription on the client-side rows', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            expect(() => api.setGridOption('rowModelType' as any, 'serverSide')).toThrow();
            await settle();

            expect(recorder.calls).toHaveLength(1);
            expect(recorder.ids()).toEqual(range(0, 5));
        });
    });

    describe('selection, row spanning and row drag', () => {
        test('selecting rows does not resubscribe them', async () => {
            const api = await createFlatGrid({ rowSelection: { mode: 'multiRow' } });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.selectAll();
            await waitFor(() => expect(api.getSelectedRows()).toHaveLength(100));
            await settle();

            expect(recorder.calls).toHaveLength(1);
        });

        test('rows that a spanned cell covers are each still reported', async () => {
            const api = await createFlatGrid({
                enableCellSpan: true,
                columnDefs: [{ field: 'group', spanRows: true }, { field: 'value' }],
                rowData: createRows(100).map((row) => ({ ...row, group: Math.floor(row.value / 4) })),
            });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.ids()).toEqual(range(0, 5));
        });

        test('a managed row drag that reorders the visible rows does not resubscribe them', async () => {
            const api = await createFlatGrid({
                rowDragManaged: true,
                columnDefs: [{ field: 'value', rowDrag: true }],
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            const dispatcher = new RowDragDispatcher({ api });
            await dispatcher.start('0');
            await dispatcher.move('4', { yOffsetPercent: 0.9 });
            await dispatcher.finish();

            await waitFor(() => expect(api.getDisplayedRowAtIndex(4)!.id).toBe('0'));
            await settle();
            expect(recorder.calls).toHaveLength(1);
            expect(recorder.ids()).toEqual(range(0, 5));
        });
    });
});
