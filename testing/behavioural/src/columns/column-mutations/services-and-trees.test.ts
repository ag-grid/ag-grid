/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { vi } from 'vitest';

import type {
    CalculatedUserColumnState,
    ColDef,
    ColGroupDef,
    Column,
    GridApi,
    GridOptions,
    GridStateKey,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    RowAutoHeightModule,
    RowSelectionModule,
    SELECTION_COLUMN_ID,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

/** The `providedId -> usedId` of each warning 273 among the console calls, in the order raised. */
const warnings273 = (calls: unknown[][]): string[] =>
    calls.flatMap((call) => {
        const match = /Provided column id `([^`]+)` was already in use.*Using `([^`]+)` instead/.exec(call.join(' '));
        return match ? [`${match[1]} -> ${match[2]}`] : [];
    });

describe('Column Mutations', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            PivotModule,
            RowAutoHeightModule,
            RowGroupingModule,
            RowNumbersModule,
            RowSelectionModule,
            TextFilterModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    describe('column order preservation across service-col recreation', () => {
        test('service columns added one by one after a user reorder go at the head in fixed order, user order kept', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            api.moveColumns(['c'], 0);

            await new GridColumns(api, 'after user reorder').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);

            api.setGridOption('columnDefs', [{ colId: 'a', rowGroup: true }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'after row grouping enabled').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── c width:200
                ├── a width:200 rowGroup
                └── b width:200
            `);

            api.setGridOption('rowNumbers', true);

            await new GridColumns(api, 'after rowNumbers enabled').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── c width:200
                ├── a width:200 rowGroup
                └── b width:200
            `);

            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true });

            await new GridColumns(api, 'after selection enabled').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── c width:200
                ├── a width:200 rowGroup
                └── b width:200
            `);
        });

        test('toggle rowSelection off then on preserves user reorder', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
                maintainColumnOrder: true,
            });

            api.moveColumns(['c'], 1);

            await new GridColumns(api, 'after user reorder with selection').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);

            api.setGridOption('rowSelection', undefined);

            await new GridColumns(api, 'after selection disabled').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);

            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true });

            await new GridColumns(api, 'after selection re-enabled').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('user-reordered selection col stays at moved position when its config changes', async () => {
            // With maintainColumnOrder=true and the user having overridden the default
            // lockPosition so the selection col is movable, a regenerated selection col should
            // stay at the user's position rather than snapping to the head — per the docs:
            // "prioritise the order of the columns as they appear in the grid".
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
                selectionColumnDef: { lockPosition: false, suppressMovable: false },
                maintainColumnOrder: true,
            });

            // Move selection col to position 2 (after 'a', 'b').
            api.moveColumns(['ag-Grid-SelectionColumn'], 2);

            await new GridColumns(api, 'user moved selection col').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable
                └── c width:200
            `);

            // Change selection config — triggers selection col regeneration.
            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true, headerCheckbox: true });

            // Selection col should remain at the user-chosen position.
            await new GridColumns(api, 'after selection regenerated').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable
                └── c width:200
            `);
        });
    });

    describe('service col instance preservation across configuration changes', () => {
        test('autoGroupColumnDef change keeps auto-col instance, updates the colDef', async () => {
            const api = gridsManager.createGrid('autoGroup', {
                columnDefs: [{ field: 'country', rowGroup: true }, { field: 'value' }],
                rowData: [
                    { country: 'USA', value: 1 },
                    { country: 'UK', value: 2 },
                ],
                autoGroupColumnDef: { headerName: 'Group A', width: 180 },
            });
            await asyncSetTimeout(0);

            const autoColBefore = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColBefore).not.toBeNull();
            expect(autoColBefore!.getColDef().headerName).toBe('Group A');
            expect(autoColBefore!.getActualWidth()).toBe(180);

            api.setGridOption('autoGroupColumnDef', { headerName: 'Group B', width: 220 });
            await asyncSetTimeout(0);

            const autoColAfter = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColAfter).toBe(autoColBefore);
            expect(autoColAfter!.getColDef().headerName).toBe('Group B');
            expect(autoColAfter!.getActualWidth()).toBe(220);

            await new GridColumns(api, 'autoGroupColumnDef changed; auto col instance preserved').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group B" width:220
                ├── country "Country" width:200 rowGroup
                └── value "Value" width:200
            `);
            await new GridRows(api, 'rows after autoGroupColumnDef change').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
                │ └── LEAF hidden id:0 country:"USA" value:1
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · └── LEAF hidden id:1 country:"UK" value:2
            `);
        });

        test('a columnDefs update keeps the width the user gave the group column over its autoGroupColumnDef width', () => {
            const defs = () => [{ field: 'country', rowGroup: true }, { field: 'value' }];
            const api = gridsManager.createGrid('autoGroup', {
                columnDefs: defs(),
                rowData: [{ country: 'USA', value: 1 }],
                autoGroupColumnDef: { width: 180 },
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', width: 333 }] });

            api.setGridOption('columnDefs', defs());

            expect(api.getColumn('ag-Grid-AutoColumn')!.getActualWidth()).toBe(333);
        });

        test.each<[GridOptions['groupDisplayType'], string[]]>([
            ['singleColumn', ['ag-Grid-AutoColumn']],
            ['multipleColumns', ['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']],
        ])(
            'a new autoGroupColumnDef applies the width, sort and pinned it sets to the %s auto columns and keeps the rest of their state',
            (groupDisplayType, autoColIds) => {
                const api = gridsManager.createGrid('autoGroup', {
                    columnDefs: [
                        { field: 'country', rowGroup: true },
                        { field: 'year', rowGroup: true },
                        { field: 'value' },
                    ],
                    rowData: [{ country: 'USA', year: 2000, value: 1 }],
                    groupDisplayType,
                    autoGroupColumnDef: { width: 180 },
                });
                const read = () =>
                    Object.fromEntries(
                        autoColIds.map((colId) => {
                            const column = api.getColumn(colId)!;
                            return [
                                colId,
                                {
                                    width: column.getActualWidth(),
                                    sort: column.getSort() ?? null,
                                    pinned: column.getPinned() ?? null,
                                },
                            ];
                        })
                    );
                const all = (state: { width: number; sort: string | null; pinned: string | null }) =>
                    Object.fromEntries(autoColIds.map((colId) => [colId, state]));

                expect(read()).toEqual(all({ width: 180, sort: null, pinned: null }));

                // the user sorts the auto columns, then the definition sets a width and pinned: the sort stays
                api.applyColumnState({ state: autoColIds.map((colId) => ({ colId, sort: 'desc' as const })) });
                api.setGridOption('autoGroupColumnDef', { width: 220, pinned: 'left' });
                expect(read()).toEqual(all({ width: 220, sort: 'desc', pinned: 'left' }));

                // the next definition sets the sort only: the width and pinned stay
                api.setGridOption('autoGroupColumnDef', { sort: 'asc' });
                expect(read()).toEqual(all({ width: 220, sort: 'asc', pinned: 'left' }));
            }
        );

        describe('the auto group column of a tree data grid with no columnDefs', () => {
            const treeGrid = (autoGroupColumnDef: ColDef) =>
                gridsManager.createGrid('treeAuto', {
                    columnDefs: [],
                    treeData: true,
                    getDataPath: (data) => data.path,
                    rowData: [{ path: ['a'] }],
                    autoGroupColumnDef,
                });

            test('a new autoGroupColumnDef headerName reaches the column and its header cell', async () => {
                const api = treeGrid({ headerName: 'A' });

                api.setGridOption('autoGroupColumnDef', { headerName: 'B' });

                expect(api.getColumn('ag-Grid-AutoColumn')!.getColDef().headerName).toBe('B');
                await vi.waitFor(() =>
                    expect(
                        getGridElement(api)!.querySelector('.ag-header-cell[col-id="ag-Grid-AutoColumn"]')?.textContent
                    ).toContain('B')
                );
            });

            test('a new autoGroupColumnDef width, then applyColumnState width and sort, reporting success, reach the column, and resetColumnState restores the autoGroupColumnDef width after setColumnWidths', () => {
                const api = treeGrid({ width: 200 });
                const column = () => api.getColumn('ag-Grid-AutoColumn')!;
                const initial = column().getActualWidth();

                api.setGridOption('autoGroupColumnDef', { width: 300 });
                const afterDef = column().getActualWidth();
                const applied = api.applyColumnState({
                    state: [{ colId: 'ag-Grid-AutoColumn', width: 250, sort: 'desc' }],
                });
                const afterApply = { width: column().getActualWidth(), sort: column().getSort() };
                api.setColumnWidths([{ key: 'ag-Grid-AutoColumn', newWidth: 333 }]);
                const afterSet = column().getActualWidth();
                api.resetColumnState();

                expect({
                    initial,
                    afterDef,
                    applied,
                    afterApply,
                    afterSet,
                    afterReset: column().getActualWidth(),
                }).toEqual({
                    initial: 200,
                    afterDef: 300,
                    applied: true,
                    afterApply: { width: 250, sort: 'desc' },
                    afterSet: 333,
                    afterReset: 300,
                });
            });
        });

        test('the row numbers column takes applyColumnState width and returns to its rowNumbers width on resetColumnState', () => {
            const api = gridsManager.createGrid('rowNumbersState', { columnDefs: [], rowNumbers: { width: 70 } });
            const width = () => api.getColumn('ag-Grid-RowNumbersColumn')!.getActualWidth();

            const applied = api.applyColumnState({ state: [{ colId: 'ag-Grid-RowNumbersColumn', width: 150 }] });
            const afterApply = width();
            api.setColumnWidths([{ key: 'ag-Grid-RowNumbersColumn', newWidth: 200 }]);
            const afterSet = width();
            api.resetColumnState();

            expect({ applied, afterApply, afterSet, afterReset: width() }).toEqual({
                applied: true,
                afterApply: 150,
                afterSet: 200,
                afterReset: 70,
            });
        });

        test('resetColumnState after the user reorders the columns gives the order of a new grid, service columns first', () => {
            const options = (): GridOptions => ({
                columnDefs: [{ colId: 'a', rowGroup: true }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
                rowNumbers: true,
                rowSelection: { mode: 'multiRow' },
            });
            const ids = (api: GridApi) => api.getAllGridColumns().map((col) => col.getColId());

            const expected = ids(gridsManager.createGrid('newGridOrder', options()));
            gridsManager.reset();

            const api = gridsManager.createGrid('resetOrder', options());
            api.applyColumnState({
                state: [
                    { colId: 'd' },
                    { colId: SELECTION_COLUMN_ID },
                    { colId: 'ag-Grid-RowNumbersColumn' },
                    { colId: 'c' },
                ],
                applyOrder: true,
            });
            const reordered = ids(api);
            api.resetColumnState();

            expect({ reorderedDiffers: reordered.join() !== expected.join(), reset: ids(api) }).toEqual({
                reorderedDiffers: true,
                reset: expected,
            });
        });

        test('column state for a column that does not exist returns false and raises no column events, nor does a reset', async () => {
            const api = gridsManager.createGrid('noCols', { columnDefs: [] });
            await asyncSetTimeout(0);
            const raised: string[] = [];
            for (const type of [
                'displayedColumnsChanged',
                'columnEverythingChanged',
                'columnResized',
                'gridColumnsChanged',
            ] as const) {
                api.addEventListener(type, () => raised.push(type));
            }

            const applied = api.applyColumnState({ state: [{ colId: 'x', width: 1 }] });
            api.resetColumnState();
            await asyncSetTimeout(0);

            expect({ applied, raised }).toEqual({ applied: false, raised: [] });
        });

        test('pivot mode toggle preserves selection col instance', async () => {
            const api = gridsManager.createGrid('pivotToggle', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', enablePivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 5 },
                    { country: 'UK', sport: 'Running', gold: 3 },
                ],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });
            await asyncSetTimeout(0);

            const selBefore = api.getColumn('ag-Grid-SelectionColumn');
            expect(selBefore).not.toBeNull();

            await new GridColumns(api, 'cols with selection before pivot').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200 rowGroup
                ├── sport "Sport" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);

            api.setGridOption('pivotMode', true);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols with selection in pivot mode').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            expect(api.getColumn('ag-Grid-SelectionColumn')).toBe(selBefore);

            api.setGridOption('pivotMode', false);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols with selection after pivot off').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200 rowGroup
                ├── sport "Sport" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            expect(api.getColumn('ag-Grid-SelectionColumn')).toBe(selBefore);
            expect((selBefore as any).isAlive()).toBe(true);
        });
    });

    describe('service col wrapper cache identity', () => {
        test('selection col instance preserved across multiple rowGroup toggles', async () => {
            const api = gridsManager.createGrid('selWrapperIdentity', {
                columnDefs: [{ colId: 'country' }, { colId: 'sport' }, { colId: 'value' }],
                rowData: [{ country: 'USA', sport: 'Swim', value: 1 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });
            await asyncSetTimeout(0);

            const selCol = api.getColumn('ag-Grid-SelectionColumn');
            expect(selCol).not.toBeNull();
            await new GridColumns(api, 'cols before rowGroup add').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── country width:200
                ├── sport width:200
                └── value width:200
            `);

            api.setRowGroupColumns(['country']);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after country added to rowGroup').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── sport width:200
                └── value width:200
            `);
            expect(api.getColumn('ag-Grid-SelectionColumn')).toBe(selCol);

            api.setRowGroupColumns(['country', 'sport']);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after sport added to rowGroup').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value width:200
            `);
            expect(api.getColumn('ag-Grid-SelectionColumn')).toBe(selCol);

            api.setRowGroupColumns([]);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after rowGroups cleared').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── country width:200
                ├── sport width:200
                └── value width:200
            `);
            expect(api.getColumn('ag-Grid-SelectionColumn')).toBe(selCol);
            expect((selCol as any).isAlive()).toBe(true);
        });

        test('rowNumbers col instance preserved across pivot toggles', async () => {
            const api = gridsManager.createGrid('rnWrapperIdentity', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', enablePivot: true },
                    { colId: 'value', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'USA', sport: 'Swim', value: 1 }],
                rowNumbers: true,
            });
            await asyncSetTimeout(0);

            const rnCol = api.getColumn('ag-Grid-RowNumbersColumn');
            expect(rnCol).not.toBeNull();
            await new GridColumns(api, 'cols with rowNumbers before pivot').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200
                └── value width:200 aggFunc:sum
            `);

            api.setGridOption('pivotMode', true);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols with rowNumbers in pivot').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value width:200 aggFunc:sum
            `);
            expect(api.getColumn('ag-Grid-RowNumbersColumn')).toBe(rnCol);

            api.setGridOption('pivotMode', false);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols with rowNumbers after pivot off').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200
                └── value width:200 aggFunc:sum
            `);
            expect(api.getColumn('ag-Grid-RowNumbersColumn')).toBe(rnCol);
            expect((rnCol as any).isAlive()).toBe(true);
        });
    });

    describe('insertVirtualColumnsForCol splice position', () => {
        test('hierarchy virtuals precede source col, in declared order', async () => {
            const api = gridsManager.createGrid('splicePos', {
                columnDefs: [
                    { colId: 'a' },
                    { colId: 'b', rowGroup: true },
                    { colId: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
                    { colId: 'c' },
                ],
                rowData: [{ a: 1, b: 'x', date: new Date(2020, 5, 15), c: 2 }],
                groupDisplayType: 'multipleColumns',
            });
            await asyncSetTimeout(0);

            await new GridColumns(api, 'cols with hierarchy virtuals spliced before source').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-b width:200
                ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year width:200
                ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month width:200
                ├── ag-Grid-AutoColumn-date width:200
                ├── a width:200
                ├── b width:200 rowGroup
                ├── date width:200 rowGroup
                └── c width:200
            `);

            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
                'b',
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
                'date',
            ]);
        });

        test('columns grouped by rowGroupIndex keep each source’s hierarchy columns before it, in declared order', () => {
            const api = gridsManager.createGrid('splicePos', {
                columnDefs: [
                    { field: 'country', rowGroup: true, rowGroupIndex: 3 },
                    {
                        colId: 'date2',
                        field: 'date',
                        rowGroup: true,
                        rowGroupIndex: 2,
                        groupHierarchy: ['day', 'year'],
                    },
                    { field: 'date', rowGroup: true, rowGroupIndex: 1, groupHierarchy: ['month', 'year'] },
                    { field: 'sport', rowGroup: true, rowGroupIndex: 0 },
                ],
                rowData: [{ country: 'Italy', sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'sport',
                'ag-Grid-HierarchyColumn-date-month',
                'ag-Grid-HierarchyColumn-date-year',
                'date',
                'ag-Grid-HierarchyColumn-date2-day',
                'ag-Grid-HierarchyColumn-date2-year',
                'date2',
                'country',
            ]);
        });

        test('a hierarchy column whose id a declared colId takes gets a suffixed id, its definition keeping the part’s', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const api = gridsManager.createGrid('takenPart', {
                columnDefs: [
                    { field: 'date', rowGroup: true, enableRowGroup: true, groupHierarchy: ['year'] },
                    { colId: year, field: 'sport' },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            const hierarchyCol = api.getRowGroupColumns()[0];
            expect([hierarchyCol.getColId(), hierarchyCol.getColDef().colId]).toEqual([`${year}_1`, year]);
        });

        test('a columnDefs update dropping a hierarchy part groups by the parts left', () => {
            const defs = (groupHierarchy: string[]) => [
                { field: 'date', rowGroup: true, enableRowGroup: true, groupHierarchy },
                { field: 'sport' },
            ];
            const api = gridsManager.createGrid('dropPart', {
                columnDefs: defs(['year', 'month']),
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            api.setGridOption('columnDefs', defs(['year']));

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'ag-Grid-HierarchyColumn-date-year',
                'date',
            ]);
        });

        test('a column state ordering the row groups after a columnDefs update with the same hierarchy lists each level once', () => {
            const defs = () => [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const api = gridsManager.createGrid('sameHierarchy', {
                columnDefs: defs(),
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.setGridOption('columnDefs', defs());

            api.applyColumnState({
                state: [
                    { colId: 'sport', rowGroupIndex: 1 },
                    { colId: 'date', rowGroupIndex: 0 },
                ],
            });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
                'date',
                'sport',
            ]);
        });

        test('a column state naming neither hierarchy columns grouped after their source nor the source leaves them there', () => {
            const api = gridsManager.createGrid('splicePos', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.setRowGroupColumns(['date', 'ag-Grid-HierarchyColumn-date-month', 'ag-Grid-HierarchyColumn-date-year']);
            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'date',
                'ag-Grid-HierarchyColumn-date-month',
                'ag-Grid-HierarchyColumn-date-year',
            ]);

            api.applyColumnState({ state: [{ colId: 'sport', rowGroupIndex: 0 }] });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'sport',
                'date',
                'ag-Grid-HierarchyColumn-date-month',
                'ag-Grid-HierarchyColumn-date-year',
            ]);
        });

        test('a column state re-asserting a grouping already in place moves nothing, also when it groups another column', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const api = gridsManager.createGrid('spliceAlone', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                    { field: 'sport', enableRowGroup: true },
                    { field: 'country', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', country: 'Italy', date: new Date(2020, 5, 15) }],
            });
            const ids = () => api.getRowGroupColumns().map((col) => col.getColId());
            const apart = ['date', 'sport', year];
            const apply = (state: { colId: string; rowGroup: true }[]) => {
                api.setRowGroupColumns(apart);
                expect(ids()).toEqual(apart);
                api.applyColumnState({ state });
                return ids();
            };

            expect({
                hierarchyColumnAlone: apply([{ colId: year, rowGroup: true }]),
                hierarchyColumnAndAnother: apply([
                    { colId: year, rowGroup: true },
                    { colId: 'country', rowGroup: true },
                ]),
                sourceAndAnother: apply([
                    { colId: 'date', rowGroup: true },
                    { colId: 'country', rowGroup: true },
                ]),
            }).toEqual({
                hierarchyColumnAlone: ['date', 'sport', year],
                hierarchyColumnAndAnother: ['date', 'sport', year, 'country'],
                sourceAndAnother: ['date', 'sport', year, 'country'],
            });
        });

        test('a column state re-asserting a grouping already in place moves nothing, also when another column joins right after a column state started it', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const api = gridsManager.createGrid('spliceAfterStart', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                    { field: 'sport', enableRowGroup: true },
                    { field: 'country', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', country: 'Italy', date: new Date(2020, 5, 15) }],
            });
            const ids = () => api.getRowGroupColumns().map((col) => col.getColId());

            api.applyColumnState({
                state: [
                    { colId: 'date', rowGroupIndex: 0 },
                    { colId: 'sport', rowGroupIndex: 1 },
                    { colId: year, rowGroup: false },
                ],
            });
            const ungrouped = ids();
            api.applyColumnState({ state: [{ colId: year, rowGroup: true }] });
            const starting = ids();

            api.setRowGroupColumns(['date', 'sport', year]);
            api.applyColumnState({
                state: [
                    { colId: year, rowGroup: true },
                    { colId: 'country', rowGroup: true },
                ],
            });

            expect({ ungrouped, starting, reasserting: ids() }).toEqual({
                ungrouped: ['date', 'sport'],
                starting: [year, 'date', 'sport'],
                reasserting: ['date', 'sport', year, 'country'],
            });
        });

        test('a column state listing a hierarchy column twice starts its grouping just before the grouped source, as listing it once does', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const api = gridsManager.createGrid('spliceListedTwice', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            const ids = () => api.getRowGroupColumns().map((col) => col.getColId());

            api.applyColumnState({
                state: [
                    { colId: 'date', rowGroupIndex: 0 },
                    { colId: 'sport', rowGroupIndex: 1 },
                    { colId: year, rowGroup: false },
                ],
            });
            expect(ids()).toEqual(['date', 'sport']);

            api.applyColumnState({
                state: [
                    { colId: year, rowGroup: true },
                    { colId: year, rowGroup: true },
                ],
            });

            expect(ids()).toEqual([year, 'date', 'sport']);
        });

        test('a column state re-asserting a pivot already in place moves nothing, also when it pivots another column', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const api = gridsManager.createGrid('splicePivot', {
                columnDefs: [
                    { field: 'date', enablePivot: true, groupHierarchy: ['year'] },
                    { field: 'sport', enablePivot: true },
                    { field: 'country', enablePivot: true },
                ],
                pivotMode: true,
                rowData: [{ sport: 'Rowing', country: 'Italy', date: new Date(2020, 5, 15) }],
            });
            api.setPivotColumns(['date', 'sport', year]);
            expect(api.getPivotColumns().map((col) => col.getColId())).toEqual(['date', 'sport', year]);

            api.applyColumnState({
                state: [
                    { colId: year, pivot: true },
                    { colId: 'country', pivot: true },
                ],
            });

            expect(api.getPivotColumns().map((col) => col.getColId())).toEqual(['date', 'sport', year, 'country']);
        });

        test('a column state naming neither a hierarchy column grouped apart from its source nor the source leaves it there', () => {
            const api = gridsManager.createGrid('splicePos', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                    { field: 'sport', enableRowGroup: true },
                    { field: 'country', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', country: 'Italy', date: new Date(2020, 5, 15) }],
            });
            api.setRowGroupColumns(['date', 'sport', 'ag-Grid-HierarchyColumn-date-year']);
            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'date',
                'sport',
                'ag-Grid-HierarchyColumn-date-year',
            ]);

            api.applyColumnState({ state: [{ colId: 'country', rowGroupIndex: 0 }] });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'country',
                'date',
                'sport',
                'ag-Grid-HierarchyColumn-date-year',
            ]);
        });

        test('a saved grouping with a hierarchy column apart from its source is restored in its order through applyColumnState and initialState', () => {
            const columnDefs: ColDef[] = [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const rowData = [{ sport: 'Rowing', date: new Date(2020, 5, 15) }];
            const saved = gridsManager.createGrid('saved', { columnDefs, rowData });
            const grouping = ['date', 'sport', 'ag-Grid-HierarchyColumn-date-year'];
            saved.setRowGroupColumns(grouping);
            const applied = gridsManager.createGrid('applied', { columnDefs, rowData });
            applied.applyColumnState({ state: saved.getColumnState(), applyOrder: true });
            const initial = gridsManager.createGrid('initial', { columnDefs, rowData, initialState: saved.getState() });

            const ids = (api: GridApi) => api.getRowGroupColumns().map((col) => col.getColId());
            expect({ applied: ids(applied), initial: ids(initial) }).toEqual({ applied: grouping, initial: grouping });
        });

        test('a saved grouping that leaves a hierarchy level out is restored without it through applyColumnState and initialState', () => {
            const columnDefs: ColDef[] = [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const rowData = [{ sport: 'Rowing', date: new Date(2020, 5, 15) }];
            const saved = gridsManager.createGrid('saved', { columnDefs, rowData });
            const grouping = ['ag-Grid-HierarchyColumn-date-month', 'date', 'sport'];
            saved.setRowGroupColumns(grouping);
            const applied = gridsManager.createGrid('applied', { columnDefs, rowData });
            applied.applyColumnState({ state: saved.getColumnState(), applyOrder: true });
            const initial = gridsManager.createGrid('initial', { columnDefs, rowData, initialState: saved.getState() });

            const ids = (api: GridApi) => api.getRowGroupColumns().map((col) => col.getColId());
            expect({ saved: ids(saved), applied: ids(applied), initial: ids(initial) }).toEqual({
                saved: grouping,
                applied: grouping,
                initial: grouping,
            });
        });

        test.each([{ rowGroup: true }, { rowGroupIndex: 0 }, { initialRowGroup: true }, { initialRowGroupIndex: 0 }])(
            'resetColumnState groups by every hierarchy level of a source its colDef groups by with %o',
            (grouping) => {
                const api = gridsManager.createGrid('reset', {
                    columnDefs: [
                        { field: 'date', ...grouping, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                        { field: 'sport', enableRowGroup: true },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                });
                api.setRowGroupColumns(['sport']);

                api.resetColumnState();

                expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                    'ag-Grid-HierarchyColumn-date-year',
                    'ag-Grid-HierarchyColumn-date-month',
                    'date',
                ]);
            }
        );

        test.each(['rowGroup', 'pivot'] as const)(
            'resetColumnState leaves out every hierarchy level of a %s source its colDef does not set it on, as a new grid does',
            (prop) => {
                const api = gridsManager.createGrid('resetOff', {
                    columnDefs: [
                        { field: 'date', enableRowGroup: true, enablePivot: true, groupHierarchy: ['year', 'month'] },
                        { field: 'sport', enableRowGroup: true, enableValue: true, aggFunc: 'count' },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                    pivotMode: prop === 'pivot',
                });
                if (prop === 'pivot') {
                    api.setPivotColumns(['date']);
                } else {
                    api.setRowGroupColumns(['date']);
                }

                api.resetColumnState();

                const active = prop === 'pivot' ? api.getPivotColumns() : api.getRowGroupColumns();
                expect(active.map((col) => col.getColId())).toEqual([]);
            }
        );

        const year = 'ag-Grid-HierarchyColumn-date-year';
        const resetRoleRows: [string, string[], ColDef, string[], number?][] = [
            ['rowGroup after another level', ['year', 'q'], { rowGroup: true }, ['q', year, 'date']],
            ['rowGroup before another level', ['q', 'year'], { rowGroup: true }, ['q', year, 'date']],
            ['rowGroup, a source index', ['year', 'q'], { rowGroupIndex: 0 }, [year, 'q', 'date']],
            ['rowGroup, an index after the source', ['year', 'q'], { rowGroupIndex: 0 }, [year, 'q', 'date'], 5],
            ['rowGroup, the source index', ['year', 'q'], { rowGroupIndex: 0 }, ['q', year, 'date'], 0],
            ['pivot after another level', ['year', 'q'], { pivot: true }, ['q', year, 'date']],
        ];
        test.each(resetRoleRows)(
            'resetColumnState sets the role of a hierarchy part declaring %s as a new grid does',
            (name, parts, sourceRole, active, qIndex) => {
                const pivot = name.startsWith('pivot');
                const q: ColDef = {
                    colId: 'q',
                    valueGetter: () => 'Q',
                    [pivot ? 'pivot' : 'rowGroup']: true,
                    rowGroupIndex: qIndex,
                };
                const columnDefs = (): ColDef[] => [
                    {
                        field: 'date',
                        ...sourceRole,
                        groupHierarchy: parts.map((part) => (part === 'q' ? q : part)),
                    },
                    { field: 'x', enableRowGroup: true, enablePivot: true },
                ];
                const rowData = [{ date: new Date(2020, 5, 15), x: 1 }];
                const ids = (grid: GridApi) =>
                    (pivot ? grid.getPivotColumns() : grid.getRowGroupColumns()).map((col) => col.getColId());
                const fresh = gridsManager.createGrid('fresh', { columnDefs: columnDefs(), rowData, pivotMode: pivot });
                const api = gridsManager.createGrid('reset', { columnDefs: columnDefs(), rowData, pivotMode: pivot });
                if (pivot) {
                    api.setPivotColumns(['x']);
                } else {
                    api.setRowGroupColumns(['x']);
                }

                api.resetColumnState();

                expect({ fresh: ids(fresh), reset: ids(api) }).toEqual({ fresh: active, reset: active });
            }
        );

        test('resetColumnState after the user reorders and removes row groups groups as a new grid does', () => {
            const columnDefs = (): ColDef[] => [
                { field: 'a', rowGroup: true },
                { field: 'b', rowGroup: true },
                { field: 'date', enableRowGroup: true, initialRowGroup: true, groupHierarchy: ['year'] },
            ];
            const rowData = [{ a: 1, b: 2, date: new Date(2020, 5, 15) }];
            const ids = (grid: GridApi) => grid.getRowGroupColumns().map((col) => col.getColId());
            const fresh = gridsManager.createGrid('fresh', { columnDefs: columnDefs(), rowData });
            const api = gridsManager.createGrid('reset', { columnDefs: columnDefs(), rowData });
            api.setGridOption('defaultColDef', { minWidth: 20 }); // a rebuild keeping every column
            api.setRowGroupColumns(['b', 'a']);

            api.resetColumnState();

            const asNew = ['a', 'b', 'ag-Grid-HierarchyColumn-date-year', 'date'];
            expect({ fresh: ids(fresh), reset: ids(api) }).toEqual({ fresh: asNew, reset: asNew });
        });

        test.each(['rowGroup', 'pivot'] as const)(
            'resetColumnState leaves out a column whose %s index is null, as a new grid does, whatever its initial value',
            (role) => {
                const columnDefs = (): ColDef[] => [
                    role === 'rowGroup'
                        ? { field: 'a', rowGroupIndex: null, initialRowGroup: true, enableRowGroup: true }
                        : { field: 'a', pivotIndex: null, initialPivot: true, enablePivot: true },
                    { field: 'b', aggFunc: 'sum' },
                ];
                const rowData = [{ a: 'x', b: 1 }];
                const ids = (grid: GridApi) =>
                    (role === 'rowGroup' ? grid.getRowGroupColumns() : grid.getPivotColumns()).map((c) => c.getColId());
                const fresh = gridsManager.createGrid('fresh', { columnDefs: columnDefs(), rowData });
                const api = gridsManager.createGrid('reset', { columnDefs: columnDefs(), rowData });
                if (role === 'rowGroup') {
                    api.setRowGroupColumns(['a']);
                } else {
                    api.setPivotColumns(['a']);
                }

                api.resetColumnState();

                expect({ fresh: ids(fresh), reset: ids(api) }).toEqual({ fresh: [], reset: [] });
            }
        );

        test('a grid state grouping that names a hierarchy source without its levels groups by the source alone', () => {
            const columnDefs: ColDef[] = [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const api = gridsManager.createGrid('state', {
                columnDefs,
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.setRowGroupColumns(['sport']);
            const saved = api.getState();

            api.setState({ ...saved, rowGroup: { groupColIds: ['sport', 'date'] } });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'date']);
        });

        test.each(['rowGroup', 'pivot'] as const)(
            'a saved column state edited to set %s on a hierarchy source keeps out the levels it saved inactive',
            (prop) => {
                const api = gridsManager.createGrid('edited', {
                    columnDefs: [
                        { field: 'date', enableRowGroup: true, enablePivot: true, groupHierarchy: ['year', 'month'] },
                        { field: 'sport', enableRowGroup: true, enableValue: true, aggFunc: 'count' },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                    pivotMode: prop === 'pivot',
                });
                const state = api
                    .getColumnState()
                    .map((item) => (item.colId === 'date' ? { ...item, [prop]: true } : item));

                api.applyColumnState({ state });

                const active = prop === 'pivot' ? api.getPivotColumns() : api.getRowGroupColumns();
                expect(active.map((col) => col.getColId())).toEqual(['date']);
            }
        );

        test.each(['level first', 'source first'])(
            'column state giving a hierarchy level only a rowGroupIndex groups by that level of its source alone, %s',
            (order) => {
                const api = gridsManager.createGrid('indexOnly', {
                    columnDefs: [
                        { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                        { field: 'sport', enableRowGroup: true },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                });
                const state = [
                    { colId: 'ag-Grid-HierarchyColumn-date-month', rowGroupIndex: 0 },
                    { colId: 'date', rowGroupIndex: 1 },
                ];

                api.applyColumnState({ state: order === 'level first' ? state : state.reverse() });

                expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                    'ag-Grid-HierarchyColumn-date-month',
                    'date',
                ]);
            }
        );

        test.each(['rowGroup', 'pivot'] as const)(
            'resetColumnState keeps every hierarchy level of a source its colDef sets %s on when the source is already active',
            (prop) => {
                const api = gridsManager.createGrid('reset', {
                    columnDefs: [
                        {
                            field: 'date',
                            [prop]: true,
                            enableRowGroup: true,
                            enablePivot: true,
                            groupHierarchy: ['year', 'month'],
                        },
                        { field: 'sport', enableRowGroup: true, enableValue: true, aggFunc: 'count' },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                    pivotMode: prop === 'pivot',
                });

                api.resetColumnState();

                const active = prop === 'pivot' ? api.getPivotColumns() : api.getRowGroupColumns();
                expect(active.map((col) => col.getColId())).toEqual([
                    'ag-Grid-HierarchyColumn-date-year',
                    'ag-Grid-HierarchyColumn-date-month',
                    'date',
                ]);
            }
        );

        test.each(['rowGroup', 'pivot'] as const)(
            'a saved %s by a hierarchy source without its levels is restored without them, on a new grid and on one using every level',
            (prop) => {
                const columnDefs: ColDef[] = [
                    { field: 'date', enableRowGroup: true, enablePivot: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true, enableValue: true, aggFunc: 'count' },
                ];
                const options = { columnDefs, rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }] };
                const levels = ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month'];
                const activeIds = (api: GridApi) =>
                    (prop === 'pivot' ? api.getPivotColumns() : api.getRowGroupColumns()).map((col) => col.getColId());
                const useDate = (api: GridApi) =>
                    prop === 'pivot' ? api.setPivotColumns(['date']) : api.setRowGroupColumns(['date']);
                const saved = gridsManager.createGrid('saved', { ...options, pivotMode: prop === 'pivot' });
                useDate(saved);
                if (prop === 'pivot') {
                    saved.removePivotColumns(levels);
                } else {
                    saved.removeRowGroupColumns(levels);
                }
                const state = saved.getColumnState();
                const fresh = gridsManager.createGrid('fresh', { ...options, pivotMode: prop === 'pivot' });
                const everyLevel = gridsManager.createGrid('everyLevel', { ...options, pivotMode: prop === 'pivot' });
                useDate(everyLevel);
                const initial = gridsManager.createGrid('initial', { ...options, initialState: saved.getState() });

                fresh.applyColumnState({ state, applyOrder: true });
                everyLevel.applyColumnState({ state, applyOrder: true });

                expect({
                    saved: activeIds(saved),
                    fresh: activeIds(fresh),
                    everyLevel: activeIds(everyLevel),
                    initial: activeIds(initial),
                }).toEqual({ saved: ['date'], fresh: ['date'], everyLevel: ['date'], initial: ['date'] });
            }
        );

        test.each(['levels first', 'source first'])(
            'column state setting a hierarchy source’s levels inactive groups by the source alone, %s',
            (order) => {
                const api = gridsManager.createGrid('levelsOff', {
                    columnDefs: [
                        { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                        { field: 'sport', enableRowGroup: true },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                });
                const levels = [
                    { colId: 'ag-Grid-HierarchyColumn-date-year', rowGroup: false },
                    { colId: 'ag-Grid-HierarchyColumn-date-month', rowGroup: false },
                ];
                const source = { colId: 'date', rowGroup: true };

                api.applyColumnState({ state: order === 'levels first' ? [...levels, source] : [source, ...levels] });

                expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['date']);
            }
        );

        test('column state grouping by a hierarchy source with one level inactive groups by the level it leaves unset too', () => {
            const api = gridsManager.createGrid('oneLevelOff', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            api.applyColumnState({
                state: [
                    { colId: 'ag-Grid-HierarchyColumn-date-year', rowGroup: false },
                    { colId: 'date', rowGroup: true },
                ],
            });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'ag-Grid-HierarchyColumn-date-month',
                'date',
            ]);
        });

        test('column state turning a hierarchy source off leaves out the levels it leaves unset', () => {
            const api = gridsManager.createGrid('sourceOff', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', rowGroup: true, enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            api.applyColumnState({ state: [{ colId: 'date', rowGroup: false }] });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport']);
        });

        test('a saved grouping that keeps one hierarchy level is restored without the other when the source is listed between them', () => {
            const columnDefs: ColDef[] = [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const rowData = [{ sport: 'Rowing', date: new Date(2020, 5, 15) }];
            const saved = gridsManager.createGrid('saved', { columnDefs, rowData });
            saved.setRowGroupColumns(['ag-Grid-HierarchyColumn-date-month', 'date']);
            saved.moveColumns(['date'], 2);
            const state = saved.getColumnState();
            const restored = gridsManager.createGrid('restored', { columnDefs, rowData });

            restored.applyColumnState({ state, applyOrder: true });

            expect({
                listed: state.map((item) => item.colId),
                grouping: restored.getRowGroupColumns().map((col) => col.getColId()),
            }).toEqual({
                listed: [
                    'ag-Grid-AutoColumn',
                    'ag-Grid-HierarchyColumn-date-year',
                    'date',
                    'ag-Grid-HierarchyColumn-date-month',
                    'sport',
                ],
                grouping: ['ag-Grid-HierarchyColumn-date-month', 'date'],
            });
        });

        test.each([
            ['every level', ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month']],
            ['its first level', ['ag-Grid-HierarchyColumn-date-year']],
        ])(
            'column state grouping again by a hierarchy source grouped without %s groups by every level, before it',
            (_name, removed) => {
                const api = gridsManager.createGrid('reassert', {
                    columnDefs: [
                        { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                        { field: 'sport', enableRowGroup: true },
                    ],
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                });
                api.setRowGroupColumns(['date']);
                api.removeRowGroupColumns(removed);

                api.applyColumnState({ state: [{ colId: 'date', rowGroup: true }] });

                expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                    'ag-Grid-HierarchyColumn-date-year',
                    'ag-Grid-HierarchyColumn-date-month',
                    'date',
                ]);
            }
        );

        test('column state grouping again by a hierarchy source keeps its levels where they are when all are grouped', () => {
            const api = gridsManager.createGrid('reassertApart', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            const grouping = [
                'date',
                'sport',
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
            ];
            api.setRowGroupColumns(grouping);

            api.applyColumnState({ state: [{ colId: 'date', rowGroup: true }] });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(grouping);
        });

        test('column state that does not name a hierarchy source leaves its removed levels out after an earlier state grouped by it', () => {
            const api = gridsManager.createGrid('laterPass', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.applyColumnState({ state: [{ colId: 'date', rowGroup: true }] });
            api.removeRowGroupColumns(['ag-Grid-HierarchyColumn-date-year']);

            api.applyColumnState({ state: [{ colId: 'sport', rowGroup: true }] });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'ag-Grid-HierarchyColumn-date-month',
                'date',
                'sport',
            ]);
        });

        test.each(['rowGroup', 'pivot'] as const)(
            'a columnDefs update that does not set a hierarchy source’s %s keeps its levels as they are',
            (prop) => {
                const year = 'ag-Grid-HierarchyColumn-date-year';
                const month = 'ag-Grid-HierarchyColumn-date-month';
                const defs = (sportHeader: string): ColDef[] => [
                    { field: 'date', enableRowGroup: true, enablePivot: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', headerName: sportHeader, enableValue: true, aggFunc: 'count' },
                ];
                const rows: [string, string[], string[], string[]][] = [
                    ['every level removed', ['date'], [year, month], ['date']],
                    ['one level removed', ['date'], [year], [month, 'date']],
                    ['no level removed', ['date'], [], [year, month, 'date']],
                    ['a level after its source', ['date', year], [], ['date', year]],
                ];
                for (const [name, grouping, removed, expected] of rows) {
                    const api = gridsManager.createGrid('update', {
                        columnDefs: defs('Sport'),
                        pivotMode: prop === 'pivot',
                        rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                    });
                    const activeIds = () =>
                        (prop === 'pivot' ? api.getPivotColumns() : api.getRowGroupColumns()).map((col) =>
                            col.getColId()
                        );
                    if (prop === 'pivot') {
                        api.setPivotColumns(grouping);
                        api.removePivotColumns(removed);
                    } else {
                        api.setRowGroupColumns(grouping);
                        api.removeRowGroupColumns(removed);
                    }
                    const before = activeIds();

                    api.setGridOption('columnDefs', defs('Sport 2'));

                    expect({ name, before, after: activeIds() }).toEqual({ name, before: expected, after: expected });
                    gridsManager.reset();
                }
            }
        );

        test('a hierarchy source grouped without its levels groups by every level when setRowGroupColumns or a columnDefs update sets it', () => {
            const levels = ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month'];
            const defs = (rowGroup: boolean | undefined): ColDef[] => [
                { field: 'date', rowGroup, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const api = gridsManager.createGrid('listAgain', {
                columnDefs: defs(undefined),
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.setGridOption('columnDefs', defs(undefined));
            api.setRowGroupColumns(['date']);
            api.removeRowGroupColumns(levels);

            api.setRowGroupColumns(['date']);
            const listed = api.getRowGroupColumns().map((col) => col.getColId());
            api.removeRowGroupColumns(levels);
            api.setGridOption('columnDefs', defs(true));

            expect({ listed, declared: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                listed: [...levels, 'date'],
                declared: [...levels, 'date'],
            });
        });

        test('a columnDefs update ungrouping a grouped hierarchy source ungroups its levels too: rowGroup false, nothing enabled', () => {
            const hierarchy: ColDef = { field: 'date', groupHierarchy: ['year', 'month'] };
            const api = gridsManager.createGrid('ungroup', {
                columnDefs: [{ ...hierarchy, rowGroup: true }],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            const before = api.getRowGroupColumns().map((col) => col.getColId());

            api.setGridOption('columnDefs', [{ ...hierarchy, rowGroup: false }]);

            expect({ before, after: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                before: ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month', 'date'],
                after: [],
            });
        });

        test.each<[string, ColDef, ColDef | undefined, ColDef]>([
            ['rowGroup false, enableRowGroup', { enableRowGroup: true }, undefined, { rowGroup: false }],
            ['rowGroup false, enablePivot', { enablePivot: true }, undefined, { rowGroup: false }],
            ['rowGroup false, default enableRowGroup', {}, { enableRowGroup: true }, { rowGroup: false }],
            ['rowGroupIndex null', { enableRowGroup: true }, undefined, { rowGroupIndex: null }],
        ])(
            'a columnDefs update ungrouping a grouped hierarchy source ungroups its levels too: %s',
            (_name, enabled, defaultColDef, patch) => {
                const hierarchy: ColDef = { field: 'date', groupHierarchy: ['year', 'month'] };
                const api = gridsManager.createGrid('ungroup', {
                    columnDefs: [{ ...hierarchy, ...enabled, rowGroup: true }],
                    defaultColDef,
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                });
                const before = api.getRowGroupColumns().map((col) => col.getColId());

                api.setGridOption('columnDefs', [{ ...hierarchy, ...enabled, ...patch }]);

                expect({ before, after: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                    before: ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month', 'date'],
                    after: [],
                });
            }
        );

        test('a columnTypes update ungrouping a grouped hierarchy source ungroups its levels too', () => {
            const api = gridsManager.createGrid('typeUngroup', {
                columnTypes: { grouped: { rowGroup: true } },
                columnDefs: [
                    { field: 'date', type: 'grouped', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            const before = api.getRowGroupColumns().map((col) => col.getColId());

            api.setGridOption('columnTypes', { grouped: { rowGroup: false } });

            expect({ before, after: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                before: ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month', 'date'],
                after: [],
            });
        });

        test('a columnDefs update unpivoting a pivoted hierarchy source unpivots its levels too', () => {
            const defs = (pivot: boolean): ColDef[] => [
                { field: 'date', enablePivot: true, pivot, groupHierarchy: ['year', 'month'] },
                { field: 'sport', rowGroup: true },
                { field: 'n', aggFunc: 'sum' },
            ];
            const api = gridsManager.createGrid('unpivot', {
                columnDefs: defs(true),
                pivotMode: true,
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15), n: 1 }],
            });
            const before = api.getPivotColumns().map((col) => col.getColId());

            api.setGridOption('columnDefs', defs(false));

            expect({ before, after: api.getPivotColumns().map((col) => col.getColId()) }).toEqual({
                before: ['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month', 'date'],
                after: [],
            });
        });

        test('a columnDefs update ungrouping a hierarchy source keeps a level that is grouped by its own definition', () => {
            const defs = (rowGroup: boolean): ColDef[] => [
                {
                    field: 'date',
                    rowGroup,
                    enableRowGroup: true,
                    groupHierarchy: ['year', { colId: 'q', valueGetter: () => 'q', rowGroup: true }],
                },
            ];
            const api = gridsManager.createGrid('ownLevel', {
                columnDefs: defs(true),
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            const before = api.getRowGroupColumns().map((col) => col.getColId());

            api.setGridOption('columnDefs', defs(false));

            expect({
                before: before.includes('date'),
                after: api.getRowGroupColumns().map((col) => col.getColId()),
            }).toEqual({
                before: true,
                after: ['q'],
            });
        });

        test('a columnDefs update re-stating rowGroup false ungroups a level the user grouped alone, as it does a plain column', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const defs = (): ColDef[] => [
                { field: 'date', rowGroup: false, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', rowGroup: false, enableRowGroup: true },
            ];
            const api = gridsManager.createGrid('levelAlone', {
                columnDefs: defs(),
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.setRowGroupColumns([year, 'sport']);
            const before = api.getRowGroupColumns().map((col) => col.getColId());

            api.setGridOption('columnDefs', defs());

            expect({ before, after: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                before: [year, 'sport'],
                after: [],
            });
        });

        test('a level a columnDefs update adds to a grouped hierarchy source follows the source', () => {
            const year = 'ag-Grid-HierarchyColumn-date-year';
            const month = 'ag-Grid-HierarchyColumn-date-month';
            const day = 'ag-Grid-HierarchyColumn-date-day';
            const defs = (groupHierarchy: ('year' | 'month' | 'day')[]): ColDef[] => [
                { field: 'date', enableRowGroup: true, groupHierarchy },
                { field: 'sport', enableRowGroup: true },
            ];
            const rows: [string, string[], string[]][] = [
                ['grouped by every level', [], [year, month, day, 'date']],
                ['grouped by the source alone', [year, month], [day, 'date']],
            ];
            for (const [name, removed, expected] of rows) {
                const api = gridsManager.createGrid('added', {
                    columnDefs: defs(['year', 'month']),
                    rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
                });
                api.setRowGroupColumns(['date']);
                api.removeRowGroupColumns(removed);

                api.setGridOption('columnDefs', defs(['year', 'month', 'day']));

                expect({ name, grouping: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                    name,
                    grouping: expected,
                });
                gridsManager.reset();
            }
        });

        test('column state listing a hierarchy source twice groups as its last item alone does', () => {
            const columnDefs: ColDef[] = [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const rowData = [{ sport: 'Rowing', date: new Date(2020, 5, 15) }];
            const twice = gridsManager.createGrid('twice', { columnDefs, rowData });
            const once = gridsManager.createGrid('once', { columnDefs, rowData });

            twice.applyColumnState({
                state: [
                    { colId: 'date', rowGroup: true },
                    { colId: 'date', rowGroup: false },
                ],
            });
            once.applyColumnState({ state: [{ colId: 'date', rowGroup: false }] });

            expect(twice.getRowGroupColumns().map((col) => col.getColId())).toEqual(
                once.getRowGroupColumns().map((col) => col.getColId())
            );
        });

        test('column state grouping by a hierarchy source with a null defaultState for the rest groups by the source alone', () => {
            const api = gridsManager.createGrid('defaultNull', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            api.applyColumnState({ state: [{ colId: 'date', rowGroup: true }], defaultState: { rowGroup: null } });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['date']);
        });

        test('a grid state grouping without a column order that names a hierarchy source without its levels groups by the source alone', () => {
            const api = gridsManager.createGrid('stateNoOrder', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            api.setState({ rowGroup: { groupColIds: ['sport', 'date'] } });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'date']);
        });

        test('a hierarchy source added after a restore that left one of its levels out groups by every level again', () => {
            const columnDefs: ColDef[] = [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'sport', enableRowGroup: true },
            ];
            const rowData = [{ sport: 'Rowing', date: new Date(2020, 5, 15) }];
            const saved = gridsManager.createGrid('saved', { columnDefs, rowData });
            saved.setRowGroupColumns(['ag-Grid-HierarchyColumn-date-month', 'date', 'sport']);
            const api = gridsManager.createGrid('restored', { columnDefs, rowData });
            api.applyColumnState({ state: saved.getColumnState(), applyOrder: true });

            api.removeRowGroupColumns(['date', 'ag-Grid-HierarchyColumn-date-month']);
            api.addRowGroupColumns(['date']);

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'sport',
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
                'date',
            ]);
        });

        test('a hierarchy column grouped without its source column takes its own rowGroupIndex', () => {
            const api = gridsManager.createGrid('splicePos', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });

            api.applyColumnState({
                state: [
                    { colId: 'sport', rowGroupIndex: 1 },
                    { colId: 'ag-Grid-HierarchyColumn-date-year', rowGroupIndex: 0 },
                ],
            });

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
                'ag-Grid-HierarchyColumn-date-year',
                'sport',
            ]);
        });

        test('rowGroupIndex applied through column state keeps each source’s hierarchy columns before it, in declared order', () => {
            const api = gridsManager.createGrid('splicePos', {
                columnDefs: [
                    { field: 'country', enableRowGroup: true },
                    { colId: 'date2', field: 'date', enableRowGroup: true, groupHierarchy: ['day', 'year'] },
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['month', 'year'] },
                    { field: 'sport', enableRowGroup: true },
                ],
                rowData: [{ country: 'Italy', sport: 'Rowing', date: new Date(2020, 5, 15) }],
            });
            api.applyColumnState({
                state: [
                    { colId: 'country', rowGroupIndex: 3 },
                    { colId: 'date2', rowGroupIndex: 2 },
                    { colId: 'date', rowGroupIndex: 1 },
                    { colId: 'sport', rowGroupIndex: 0 },
                ],
            });
            const applied = api.getRowGroupColumns().map((col) => col.getColId());

            api.applyColumnState({
                state: [
                    { colId: 'date', rowGroupIndex: 3 },
                    { colId: 'country', rowGroupIndex: 0 },
                ],
            });

            expect({ applied, reapplied: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                applied: [
                    'sport',
                    'ag-Grid-HierarchyColumn-date-month',
                    'ag-Grid-HierarchyColumn-date-year',
                    'date',
                    'ag-Grid-HierarchyColumn-date2-day',
                    'ag-Grid-HierarchyColumn-date2-year',
                    'date2',
                    'country',
                ],
                reapplied: [
                    'country',
                    'ag-Grid-HierarchyColumn-date-month',
                    'ag-Grid-HierarchyColumn-date-year',
                    'date',
                    'sport',
                    'ag-Grid-HierarchyColumn-date2-day',
                    'ag-Grid-HierarchyColumn-date2-year',
                    'date2',
                ],
            });
        });
    });

    describe('row group, pivot and value columns when columns are rebuilt without setting column definitions', () => {
        const year = 'ag-Grid-HierarchyColumn-date-year';
        const month = 'ag-Grid-HierarchyColumn-date-month';
        const rowData = [{ sport: 'Rowing', country: 'UK', m: 2, n: 1, date: new Date(2020, 5, 15) }];

        const rebuild = (api: GridApi) => {
            const others = Object.keys(api.getState()).filter((key): key is GridStateKey => key !== 'userColumns');
            api.setState(
                { userColumns: [{ colId: 'n', properties: [{ property: 'headerName', value: 'N' }] }] },
                others
            );
        };
        const ids = (cols: Column[]) => cols.map((col) => col.getColId());
        const headerTexts = (api: GridApi) =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell-text'), (el) => el.textContent);

        test('a rebuild keeps a level the user grouped alone under a source that is not grouped', async () => {
            const api = gridsManager.createGrid('levelGrouped', {
                columnDefs: [
                    { field: 'date', rowGroup: false, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport' },
                    { field: 'n' },
                ],
                rowData,
            });
            api.setRowGroupColumns([year]);
            const before = ids(api.getRowGroupColumns());
            const colDefBefore = api.getColumn('n')!.getColDef();

            rebuild(api);
            // setState applies part of the state in a timeout; the renamed header shows the rebuild rendered
            await asyncSetTimeout(0);

            expect({
                before,
                after: ids(api.getRowGroupColumns()),
                rebuilt: api.getColumn('n')!.getColDef() !== colDefBefore,
                headers: headerTexts(api),
            }).toEqual({
                before: [year],
                after: [year],
                rebuilt: true,
                headers: ['Group', 'Date', 'Sport', 'N'],
            });
        });

        test('a rebuild keeps a level the user pivoted alone under a source that is not pivoted', async () => {
            const api = gridsManager.createGrid('levelPivoted', {
                columnDefs: [
                    { field: 'date', pivot: false, enablePivot: true, groupHierarchy: ['year', 'month'] },
                    { field: 'sport', rowGroup: true },
                    { field: 'n', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowData,
            });
            api.setPivotColumns([year]);
            const before = ids(api.getPivotColumns());
            const colDefBefore = api.getColumn('n')!.getColDef();

            rebuild(api);
            // setState applies part of the state in a timeout; the renamed header shows the rebuild rendered
            await asyncSetTimeout(0);

            expect({
                before,
                after: ids(api.getPivotColumns()),
                rebuilt: api.getColumn('n')!.getColDef() !== colDefBefore,
                headers: headerTexts(api),
            }).toEqual({
                before: [year],
                after: [year],
                rebuilt: true,
                headers: ['Group', 'sum(N)'],
            });
        });

        test('a rebuild keeps a plain column the user grouped or pivoted where its definition says it is not', () => {
            const api = gridsManager.createGrid('plainSet', {
                columnDefs: [
                    { field: 'sport', rowGroup: false, enableRowGroup: true },
                    { field: 'country', pivot: false, enablePivot: true },
                    { field: 'n', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowData,
            });
            api.setRowGroupColumns(['sport']);
            api.setPivotColumns(['country']);
            const before = { rowGroup: ids(api.getRowGroupColumns()), pivot: ids(api.getPivotColumns()) };

            rebuild(api);

            expect({
                before,
                after: { rowGroup: ids(api.getRowGroupColumns()), pivot: ids(api.getPivotColumns()) },
            }).toEqual({
                before: { rowGroup: ['sport'], pivot: ['country'] },
                after: { rowGroup: ['sport'], pivot: ['country'] },
            });
        });

        test('a rebuild keeps ungrouped a plain column and a hierarchy source the user ungrouped where their definition groups them', () => {
            const api = gridsManager.createGrid('ungrouped', {
                columnDefs: [
                    { field: 'sport', rowGroup: true },
                    { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'n' },
                ],
                rowData,
            });
            const initial = ids(api.getRowGroupColumns());
            api.setRowGroupColumns([]);
            const before = ids(api.getRowGroupColumns());

            rebuild(api);

            expect({ initial, before, after: ids(api.getRowGroupColumns()) }).toEqual({
                initial: ['sport', year, month, 'date'],
                before: [],
                after: [],
            });
        });

        test('a rebuild keeps the row group order the user set over the order the definitions give', () => {
            const api = gridsManager.createGrid('order', {
                columnDefs: [
                    { field: 'sport', rowGroup: true, rowGroupIndex: 1 },
                    { field: 'country', rowGroup: true, rowGroupIndex: 0 },
                    { field: 'n' },
                ],
                rowData,
            });
            const initial = ids(api.getRowGroupColumns());
            api.setRowGroupColumns(['sport', 'country']);
            const before = ids(api.getRowGroupColumns());

            rebuild(api);

            expect({ initial, before, after: ids(api.getRowGroupColumns()) }).toEqual({
                initial: ['country', 'sport'],
                before: ['sport', 'country'],
                after: ['sport', 'country'],
            });
        });

        test('a rebuild keeps removed a level the user removed from a grouped hierarchy source', () => {
            const api = gridsManager.createGrid('levelRemoved', {
                columnDefs: [{ field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }, { field: 'n' }],
                rowData,
            });
            const initial = ids(api.getRowGroupColumns());
            api.removeRowGroupColumns([month]);
            const before = ids(api.getRowGroupColumns());

            rebuild(api);

            expect({ initial, before, after: ids(api.getRowGroupColumns()) }).toEqual({
                initial: [year, month, 'date'],
                before: [year, 'date'],
                after: [year, 'date'],
            });
        });

        test('a rebuild keeps removed a value column the user removed, and the aggregation function the user set over the one the definition gives', () => {
            const api = gridsManager.createGrid('valueRemoved', {
                columnDefs: [
                    { field: 'm', aggFunc: 'sum' },
                    { field: 'n', aggFunc: 'sum' },
                ],
                rowData,
            });
            const values = () => ({ ids: ids(api.getValueColumns()), aggFunc: api.getColumn('m')?.getAggFunc() });
            const initial = values();
            api.removeValueColumns(['n']);
            api.setColumnAggFunc('m', 'avg');
            const before = values();

            rebuild(api);

            expect({ initial, before, after: values() }).toEqual({
                initial: { ids: ['m', 'n'], aggFunc: 'sum' },
                before: { ids: ['m'], aggFunc: 'avg' },
                after: { ids: ['m'], aggFunc: 'avg' },
            });
        });

        test('a rebuild keeps the value column order the user set over the order the definitions give', () => {
            const api = gridsManager.createGrid('valueOrder', {
                columnDefs: [
                    { field: 'n', aggFunc: 'sum', valueIndex: 0 },
                    { field: 'm', aggFunc: 'sum', valueIndex: 1 },
                ],
                rowData,
            });
            const initial = ids(api.getValueColumns());
            api.setValueColumns(['m', 'n']);
            const before = ids(api.getValueColumns());

            rebuild(api);

            expect({ initial, before, after: ids(api.getValueColumns()) }).toEqual({
                initial: ['n', 'm'],
                before: ['m', 'n'],
                after: ['m', 'n'],
            });
        });

        test('a rebuild keeps a value column the user added where its definition has no aggregation function', () => {
            const api = gridsManager.createGrid('valueAdded', {
                columnDefs: [{ field: 'm' }, { field: 'n', aggFunc: null, enableValue: true }],
                rowData,
            });
            const initial = ids(api.getValueColumns());
            api.addValueColumns(['n']);
            const before = ids(api.getValueColumns());

            rebuild(api);

            expect({ initial, before, after: ids(api.getValueColumns()) }).toEqual({
                initial: [],
                before: ['n'],
                after: ['n'],
            });
        });
    });

    describe('hierarchy columns and maintainColumnOrder', () => {
        test('a moved hierarchy column keeps its place when its source column gains a hierarchy part', () => {
            const defs = (groupHierarchy: string[]) => [
                { colId: 'a' },
                { colId: 'date', rowGroup: true, groupHierarchy },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs(['year', 'month']),
                rowData: [{ a: 1, date: new Date(2020, 5, 15) }],
                maintainColumnOrder: true,
            });
            const order = () =>
                api
                    .getColumnState()
                    .map((s) => s.colId.replace('ag-Grid-HierarchyColumn-date-', ''))
                    .filter((id) => !id.startsWith('ag-Grid-AutoColumn'));
            api.moveColumns(['ag-Grid-HierarchyColumn-date-year'], api.getColumnState().length - 1);
            const moved = order();
            expect(moved.at(-1)).toBe('year');

            api.setGridOption('columnDefs', defs(['year', 'month', 'day']));

            expect(order()).toEqual([...moved, 'day']);
        });

        test('a new column given a removed column’s generated id groups by its own hierarchy, as in a new grid', () => {
            const rowData = [{ date: new Date(2020, 0, 1), other: new Date(2021, 5, 1) }];
            const e: ColDef = {
                headerName: 'E',
                valueGetter: (p) => p.data?.other,
                groupHierarchy: ['year'],
                enableRowGroup: true,
            };
            const read = (api: GridApi) => {
                api.setRowGroupColumns(['1']);
                const groups: string[] = [];
                api.forEachNode((node) => {
                    if (!node.group) {
                        return;
                    }
                    groups.push(node.key!);
                });
                const year = api.getColumns()!.find((col) => col.getColId() === 'ag-Grid-HierarchyColumn-1-year');
                return { e: api.getColumn('1')?.getColDef().headerName, groups, width: year?.getActualWidth() };
            };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'A' },
                    {
                        headerName: 'D',
                        valueGetter: (p) => p.data?.date,
                        groupHierarchy: ['year'],
                        enableRowGroup: true,
                    },
                    { headerName: 'Gone' },
                ],
                rowData,
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-HierarchyColumn-1-year', width: 333 }] });
            api.setGridOption('columnDefs', [e, { headerName: 'A' }]);
            const live = read(api);
            gridsManager.reset();

            // Listed so E gets the same id as in the update.
            const fresh = read(gridsManager.createGrid('myGrid', { columnDefs: [{ headerName: 'A' }, e], rowData }));
            expect({ live, fresh }).toEqual({
                live: fresh,
                fresh: { e: 'E', groups: [`2021`, expect.any(String)], width: 200 },
            });
        });
    });

    describe('group columns when the grouping changes', () => {
        test('a group column keeps its width and sort when another grouping is added', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }],
                rowData: [{ country: 'Italy', sport: 'Rowing' }],
                groupDisplayType: 'multipleColumns',
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn-country', width: 333, sort: 'desc' }] });

            api.addRowGroupColumns(['sport']);

            const col = api.getAllGridColumns().find((c) => c.getColId() === 'ag-Grid-AutoColumn-country')!;
            expect(`${col.getActualWidth()}:${col.getSort()}`).toBe('333:desc');
        });
    });

    describe('column definitions set while the grid builds its columns', () => {
        test('a rebuild for a user columns state keeps the width the user gave the group column', () => {
            const api = gridsManager.createGrid('myGrid', {
                rowData: [{ a: 'x', b: 'y' }],
                columnDefs: [{ field: 'a', rowGroup: true }, { field: 'b' }],
                autoGroupColumnDef: { width: 150 },
            });
            const autoCol = 'ag-Grid-AutoColumn';
            api.setColumnWidths([{ key: autoCol, newWidth: 300 }]);

            const others = (Object.keys(api.getState()) as GridStateKey[]).filter((key) => key !== 'userColumns');
            api.setState(
                { userColumns: [{ colId: 'b', properties: [{ property: 'headerName', value: 'B' }] }] },
                others
            );

            expect(api.getColumn(autoCol)!.getActualWidth()).toBe(300);
        });

        test('column definitions a callback sets beside a user columns state during a build apply their width, in either order', () => {
            let onMatch: (() => void) | null = null;
            let api: GridApi | undefined = undefined;
            api = gridsManager.createGrid('myGrid', {
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                columnDefs: [{ field: 'a' }],
                dataTypeDefinitions: {
                    mine: {
                        baseDataType: 'text',
                        extendsDataType: 'text',
                        dataTypeMatcher: (value) => {
                            const run = onMatch;
                            onMatch = null;
                            run?.();
                            return value === 'never';
                        },
                    },
                },
            });
            const width = () => api!.getColumn('a')!.getActualWidth();
            const named = (headerName: string): CalculatedUserColumnState[] => [
                { colId: 'a', properties: [{ property: 'headerName', value: headerName }] },
            ];

            onMatch = () => {
                api!.setState({ userColumns: named('X') });
                api!.setGridOption('columnDefs', [{ field: 'a', width: 300 }, { field: 'b' }]);
            };
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
            const stateFirst = width();

            onMatch = () => {
                api!.setGridOption('columnDefs', [{ field: 'a', width: 400 }, { field: 'b' }]);
                api!.setState({ userColumns: named('Y') });
            };
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'c' }]);

            expect({ stateFirst, stateLast: width() }).toEqual({ stateFirst: 300, stateLast: 400 });
        });

        test('column definitions a callback sets beside a column state reset during a build apply their width, in either order', () => {
            let onMatch: (() => void) | null = null;
            let api: GridApi | undefined = undefined;
            api = gridsManager.createGrid('myGrid', {
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                columnDefs: [{ field: 'a' }],
                initialState: { userColumns: [{ colId: 'a', properties: [{ property: 'headerName', value: 'X' }] }] },
                dataTypeDefinitions: {
                    mine: {
                        baseDataType: 'text',
                        extendsDataType: 'text',
                        dataTypeMatcher: (value) => {
                            const run = onMatch;
                            onMatch = null;
                            run?.();
                            return value === 'never';
                        },
                    },
                },
            });
            const width = () => api!.getColumn('a')!.getActualWidth();

            onMatch = () => {
                api!.resetColumnState();
                api!.setGridOption('columnDefs', [{ field: 'a', width: 300 }, { field: 'b' }]);
            };
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
            const resetFirst = width();

            api.setState({ userColumns: [{ colId: 'a', properties: [{ property: 'headerName', value: 'X' }] }] });
            onMatch = () => {
                api!.setGridOption('columnDefs', [{ field: 'a', width: 400 }, { field: 'b' }]);
                api!.resetColumnState();
            };
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'c' }]);

            expect({ resetFirst, resetLast: width() }).toEqual({ resetFirst: 300, resetLast: 400 });
        });
    });

    describe('padding groups', () => {
        test('a defaultColGroupDef feature only padding groups take is reported when its module is missing', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES });

            expect(() =>
                gridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { headerName: 'G', headerTooltip: undefined, children: [{ field: 'a' }] },
                        { field: 'b' },
                    ],
                    defaultColGroupDef: { headerTooltip: 'tip' },
                })
            ).toThrow(/Tooltip/);
        });
    });

    describe('hierarchy columns when the hierarchy changes', () => {
        test('a source added before others with the same part colId leaves their hierarchy columns their width', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the part colId is taken
            const source = (field: string): ColDef => ({
                field,
                enableRowGroup: true,
                groupHierarchy: [{ colId: 'q', headerName: field, valueGetter: () => 'Q' }],
            });
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [source('a'), source('b')],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            const levels = () =>
                api
                    .getAllGridColumns()
                    .filter((c) => c.getColId().startsWith('q'))
                    .map((c) => `${c.getColDef().headerName}:${c.getActualWidth()}`);
            api.applyColumnState({
                state: [
                    { colId: 'q', width: 333 },
                    { colId: 'q_1', width: 222 },
                ],
            });
            expect(levels()).toEqual(['a:333', 'b:222']);

            api.setGridOption('columnDefs', [source('c'), source('a'), source('b')]);

            expect(levels()).toEqual(['c:200', 'a:333', 'b:222']);
            expect(warn).toHaveBeenCalled();
        });

        test('a part added with the colId another part suffixes leaves that part its hierarchy column', () => {
            const part = (colId: string, headerName: string): ColDef => ({ colId, headerName, valueGetter: () => 'Q' });
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a', enableRowGroup: true, groupHierarchy: [part('q_1', 'X')] }],
                rowData: [{ a: 1 }],
            });
            api.applyColumnState({ state: [{ colId: 'q_1', width: 333 }] });

            api.setGridOption('columnDefs', [
                { field: 'a', enableRowGroup: true, groupHierarchy: [part('q', 'Y'), part('q_1', 'X')] },
            ]);

            const levels = api
                .getAllGridColumns()
                .filter((c) => c.getColId().startsWith('q'))
                .map((c) => `${c.getColId()}:${c.getColDef().headerName}:${c.getActualWidth()}`);
            expect(levels).toEqual(['q:Y:200', 'q_1:X:333']);
        });
        test.each([
            ['moved to another source', [], ['q']],
            ['its source repeated once less, given to another source', ['q'], ['q_1']],
        ] as [string, string[], string[]][])(
            'a hierarchy part %s takes its colId, as in a new grid',
            (_name, keptParts, movedParts) => {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
                const part = (colId: string): ColDef => ({ colId, valueGetter: () => 'Q' });
                const source = (field: string, colIds: string[]): ColDef => ({
                    field,
                    enableRowGroup: true,
                    groupHierarchy: colIds.map(part),
                });
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [source('a', [...keptParts, 'q']), source('b', [])],
                    rowData: [{ a: 1, b: 2 }],
                });
                warn.mockClear();

                api.setGridOption('columnDefs', [source('a', keptParts), source('b', movedParts)]);

                const ids = api
                    .getAllGridColumns()
                    .map((c) => c.getColId())
                    .filter((id) => id.startsWith('q'));
                expect([ids, warn.mock.calls.length]).toEqual([[...keptParts, ...movedParts], 0]);
            }
        );

        // A kept part keeps its id over a field, yields to a declared colId or groupId, wherever the other column sits.
        const groupY: ColGroupDef = { groupId: 'y', children: [{ field: 'z' }] };
        const keptPartRows: [string, ColDef[], ColDef | ColGroupDef, boolean, string[], string | null][] = [
            [
                'a kept hierarchy part’s colId as its colId, placed before',
                [{ colId: 'y' }],
                { colId: 'y', field: 'y' },
                true,
                ['y:y', 'y_1:-'],
                null,
            ],
            [
                'a kept hierarchy part’s colId as its colId, placed after',
                [{ colId: 'y' }],
                { colId: 'y', field: 'y' },
                false,
                ['y:y', 'y_1:-'],
                null,
            ],
            ['a dropped hierarchy part’s colId as its field, placed before', [], { field: 'y' }, true, ['y:y'], null],
            ['a dropped hierarchy part’s colId as its field, placed after', [], { field: 'y' }, false, ['y:y'], null],
            [
                'a kept hierarchy part’s colId as its groupId, placed before',
                [{ colId: 'y' }],
                groupY,
                true,
                ['y_1:-'],
                'y',
            ],
            [
                'a kept hierarchy part’s colId as its groupId, placed after',
                [{ colId: 'y' }],
                groupY,
                false,
                ['y_1:-'],
                'y',
            ],
        ];
        test.each(keptPartRows)(
            'a new column given %s its source takes it, as in a new grid',
            (_name, parts, added, before, expectedIds, expectedGroup) => {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: `y` is taken
                const source = (groupHierarchy: ColDef[]): ColDef => ({
                    field: 'date',
                    enableRowGroup: true,
                    groupHierarchy: groupHierarchy.map((part) => ({ ...part, valueGetter: () => 'Q' })),
                });
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [source([{ colId: 'y' }])],
                    rowData: [{ date: 1, y: 2 }],
                });

                api.setGridOption('columnDefs', before ? [added, source(parts)] : [source(parts), added]);

                const ids = api
                    .getAllGridColumns()
                    .map((c) => `${c.getColId()}:${c.getColDef().field ?? '-'}`)
                    .filter((id) => id.startsWith('y'))
                    .sort();
                const group = api.getColumn('z')?.getOriginalParent()?.getGroupId() ?? null;
                const warned = warn.mock.calls.flat().join(' ').includes('warning #273');
                expect({ ids, group, warned }).toEqual({
                    ids: expectedIds,
                    group: expectedGroup,
                    warned: parts.length > 0,
                });
            }
        );

        // A kept part keeps its id over a field, yields to a declared colId or groupId, wherever the other column sits.
        test.each(['before', 'after'])(
            'a kept hierarchy part keeps its id and width over a new column with its colId as field, placed %s its source',
            (placement) => {
                const source: ColDef = {
                    field: 'date',
                    enableRowGroup: true,
                    groupHierarchy: [{ colId: 'y', valueGetter: () => 'Q' }],
                };
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [source],
                    rowData: [{ date: 1, y: 2 }],
                });
                api.applyColumnState({ state: [{ colId: 'y', width: 333 }] });

                api.setGridOption(
                    'columnDefs',
                    placement === 'before' ? [{ field: 'y' }, source] : [source, { field: 'y' }]
                );

                const ids = api
                    .getAllGridColumns()
                    .filter((c) => c.getColId().startsWith('y'))
                    .map((c) => `${c.getColId()}:${c.getColDef().field ?? '-'}:${c.getActualWidth()}`)
                    .sort();
                expect(ids).toEqual(['y:-:333', 'y_1:y:200']);
            }
        );

        test('a configured part added with the name another part suffixes leaves that part its hierarchy column', () => {
            const prefix = 'ag-Grid-HierarchyColumn-date-';
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', enableRowGroup: true, groupHierarchy: ['fy_1'] }],
                groupHierarchyConfig: {
                    fy: { headerName: 'Y', valueGetter: () => 'Y' },
                    fy_1: { headerName: 'X', valueGetter: () => 'X' },
                },
                rowData: [{ date: new Date(2020, 5, 15) }],
            });
            api.applyColumnState({ state: [{ colId: `${prefix}fy_1`, width: 333 }] });

            api.setGridOption('columnDefs', [{ field: 'date', enableRowGroup: true, groupHierarchy: ['fy', 'fy_1'] }]);

            const levels = api
                .getAllGridColumns()
                .filter((c) => c.getColId().startsWith(prefix))
                .map((c) => `${c.getColId().slice(prefix.length)}:${c.getColDef().headerName}:${c.getActualWidth()}`);
            expect(levels).toEqual(['fy:Y:200', 'fy_1:X:333']);
        });

        test('a hierarchy column whose groupHierarchyConfig colId is removed is replaced by a new one at the generated id, with its default width', () => {
            const columnDefs: ColDef[] = [{ field: 'date', enableRowGroup: true, groupHierarchy: ['year'] }];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupHierarchyConfig: { year: { colId: 'Y', valueGetter: () => 2020 } },
                rowData: [{ date: new Date(2020, 5, 15) }],
            });
            const before = api.getColumn('Y');
            api.applyColumnState({ state: [{ colId: 'Y', width: 333 }] });

            api.setGridOption('groupHierarchyConfig', undefined);
            api.setGridOption('columnDefs', [...columnDefs]);

            const after = api.getColumn('ag-Grid-HierarchyColumn-date-year');
            expect({
                beforeWidth: before?.getActualWidth(),
                oldGone: api.getColumn('Y'),
                isNew: after != null && after !== before,
                width: after?.getActualWidth(),
            }).toEqual({ beforeWidth: 333, oldGone: null, isNew: true, width: 200 });
        });

        test('a hierarchy removed from a kept column and added back gives it new hierarchy columns with their default width', () => {
            const defs = (parts: string[] | undefined): ColDef[] => [
                { field: 'date', enableRowGroup: true, groupHierarchy: parts },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs(['year']),
                rowData: [{ date: new Date(2020, 5, 15) }],
            });
            const level = () =>
                api.getAllGridColumns().find((c) => c.getColId() === 'ag-Grid-HierarchyColumn-date-year');
            api.applyColumnState({ state: [{ colId: 'ag-Grid-HierarchyColumn-date-year', width: 333 }] });
            api.setGridOption('columnDefs', defs(['year']));
            const before = level();

            api.setGridOption('columnDefs', defs(undefined));
            api.setGridOption('columnDefs', defs(['year']));

            expect([level() === before, level()?.getActualWidth()]).toEqual([false, 200]);
        });

        test('each hierarchy column’s definition names its part, a configured part without a colId too', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'fy'] }],
                groupHierarchyConfig: { fy: { headerName: 'FY', valueGetter: () => 'FY' } },
                rowData: [{ date: new Date(2020, 5, 15) }],
            });

            expect(
                api
                    .getAllGridColumns()
                    .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-'))
                    .map((c) => `${c.getColId()}:${c.getColDef().colId}`)
            ).toEqual([
                'ag-Grid-HierarchyColumn-date-year:ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-fy:ag-Grid-HierarchyColumn-date-fy',
            ]);
        });

        test('a part replaced by another shows the new part, with its default width and sort', () => {
            const defs = (parts: string[]): ColDef[] => [
                { field: 'date', enableRowGroup: true, groupHierarchy: parts },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs(['year']),
                rowData: [{ date: new Date(2020, 5, 15) }],
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-HierarchyColumn-date-year', width: 333, sort: 'desc' }] });

            api.setGridOption('columnDefs', defs(['month']));

            expect(
                api
                    .getAllGridColumns()
                    .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-'))
                    .map((c) => `${c.getColId()}:${c.getActualWidth()}:${c.getSort() ?? '-'}`)
            ).toEqual(['ag-Grid-HierarchyColumn-date-month:200:-']);
        });

        test('repeated parts each keep a column of their own when a part is added', () => {
            const defs = (parts: string[]): ColDef[] => [
                { field: 'date', enableRowGroup: true, groupHierarchy: parts },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs(['year', 'year']),
                rowData: [{ date: new Date(2020, 5, 15) }],
            });

            api.setGridOption('columnDefs', defs(['year', 'year', 'month']));

            const hierarchyCols = api
                .getAllGridColumns()
                .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-'));
            expect(new Set(hierarchyCols).size).toBe(3);
        });

        test('an unchanged part’s group column keeps its width and sort, and its hierarchy column takes the new definition, when a part is added', () => {
            const defs = (yearHeader: string, parts: string[]): ColDef[] => [
                {
                    colId: 'date',
                    rowGroup: true,
                    groupHierarchy: [
                        { colId: 'yr', headerName: yearHeader, valueGetter: (p) => p.data?.date.getFullYear() },
                        ...parts,
                    ],
                },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs('Year', ['month']),
                rowData: [{ date: new Date(2020, 5, 15) }],
                groupDisplayType: 'multipleColumns',
            });
            api.applyColumnState({
                state: [{ colId: 'ag-Grid-AutoColumn-yr', width: 333, sort: 'desc' }],
            });

            api.setGridOption('columnDefs', defs('Year!', ['month', 'day']));

            const read = (colId: string) => {
                const col = api.getAllGridColumns().find((c) => c.getColId() === colId)!;
                return `${col.getActualWidth()}:${col.getSort() ?? '-'}`;
            };
            expect(read('ag-Grid-AutoColumn-yr')).toBe('333:desc');
            expect(
                api
                    .getAllGridColumns()
                    .find((c) => c.getColId() === 'yr')!
                    .getColDef().headerName
            ).toBe('Year!');
        });

        test('a part defined only in groupHierarchyConfig groups by its own column', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'date', rowGroup: true, groupHierarchy: ['half'] }],
                groupHierarchyConfig: { half: { valueGetter: (p) => (p.data?.date.getMonth() < 6 ? 'H1' : 'H2') } },
                rowData: [{ date: new Date(2020, 0, 1) }, { date: new Date(2020, 8, 1) }],
            });
            const keys: string[] = [];
            api.forEachNode((node) => {
                if (node.group && node.level === 0) {
                    keys.push(String(node.key));
                }
            });

            expect(keys).toEqual(['H1', 'H2']);
        });

        const removedEntryRows: [string, ColDef[]][] = [
            ['alone', []],
            [
                'while another column gains a hierarchy',
                [{ field: 'other', enableRowGroup: true, groupHierarchy: ['month'] }],
            ],
        ];
        test.each(removedEntryRows)(
            'a part whose groupHierarchyConfig entry is removed groups by its date part, %s',
            (_name, others) => {
                const date: ColDef = { field: 'date', rowGroup: true, groupHierarchy: ['year'] };
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [date],
                    groupHierarchyConfig: { year: { valueGetter: () => 'custom' } },
                    rowData: [{ date: new Date(2020, 0, 1) }],
                });
                const groupKeys = () => {
                    const keys: string[] = [];
                    api.forEachNode((node) => {
                        if (node.group) {
                            keys.push(String(node.key));
                        }
                    });
                    return keys;
                };
                expect(groupKeys()).toEqual(['custom', '2020-01-01']);

                api.setGridOption('groupHierarchyConfig', {});
                api.setGridOption('columnDefs', [...others, date]);

                expect(groupKeys()).toEqual(['2020', '2020-01-01']);
            }
        );

        test('a date part’s hierarchy column keeps its definition when groupHierarchyConfig is set to a new but equal object', () => {
            const defs = (): ColDef[] => [{ field: 'date', enableRowGroup: true, groupHierarchy: ['year'] }];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs(),
                groupHierarchyConfig: {},
                rowData: [{ date: new Date(2020, 0, 1) }],
            });
            const valueGetter = () => api.getColumn('ag-Grid-HierarchyColumn-date-year')!.getColDef().valueGetter;
            const before = valueGetter();

            api.setGridOption('groupHierarchyConfig', {});
            api.setGridOption('columnDefs', defs());

            expect(valueGetter()).toBe(before);
        });

        test('a column’s hierarchy columns keep their width and sort when another column gains or loses a hierarchy', () => {
            const rowData = [{ date: new Date(2020, 0, 1), other: new Date(2021, 5, 1) }];
            const date: ColDef = { field: 'date', groupHierarchy: ['year', 'month'], enableRowGroup: true };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [date], rowData });
            api.applyColumnState({
                state: [
                    { colId: 'ag-Grid-HierarchyColumn-date-year', width: 333, sort: 'desc' },
                    { colId: 'ag-Grid-HierarchyColumn-date-month', width: 222 },
                ],
            });
            const read = () =>
                api
                    .getAllGridColumns()
                    .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-'))
                    .map((c) => `${c.getColId()}:${c.getActualWidth()}:${c.getSort() ?? '-'}`);

            api.setGridOption('columnDefs', [{ field: 'other', groupHierarchy: ['year'], enableRowGroup: true }, date]);
            const gained = read();
            api.setGridOption('columnDefs', [{ field: 'other', enableRowGroup: true }, date]);

            expect({ gained, lost: read() }).toEqual({
                gained: [
                    'ag-Grid-HierarchyColumn-other-year:200:-',
                    'ag-Grid-HierarchyColumn-date-year:333:desc',
                    'ag-Grid-HierarchyColumn-date-month:222:-',
                ],
                lost: ['ag-Grid-HierarchyColumn-date-year:333:desc', 'ag-Grid-HierarchyColumn-date-month:222:-'],
            });
        });

        test('another column’s hierarchy columns keep their width and sort when a new column gets a removed column’s generated id', () => {
            const date: ColDef = { field: 'date', groupHierarchy: ['year'], enableRowGroup: true };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'A' },
                    {
                        headerName: 'D',
                        valueGetter: (p) => p.data?.date,
                        groupHierarchy: ['year'],
                        enableRowGroup: true,
                    },
                    date,
                    { headerName: 'Gone' },
                ],
                rowData: [{ date: new Date(2020, 0, 1), other: new Date(2021, 5, 1) }],
            });
            api.applyColumnState({
                state: [
                    { colId: 'ag-Grid-HierarchyColumn-1-year', width: 111, sort: 'asc' },
                    { colId: 'ag-Grid-HierarchyColumn-date-year', width: 333, sort: 'desc' },
                ],
            });

            api.setGridOption('columnDefs', [
                { headerName: 'E', valueGetter: (p) => p.data?.other, groupHierarchy: ['year'], enableRowGroup: true },
                { headerName: 'A' },
                date,
            ]);

            const read = (colId: string) => {
                const col = api.getAllGridColumns().find((c) => c.getColId() === colId)!;
                return `${col.getActualWidth()}:${col.getSort() ?? '-'}`;
            };
            expect(api.getColumn('1')!.getColDef().headerName).toBe('E');
            expect(read('ag-Grid-HierarchyColumn-1-year')).toBe('200:-');
            expect(read('ag-Grid-HierarchyColumn-date-year')).toBe('333:desc');
        });
    });

    test('pivot result columns set again after a column took their id while they were cleared get another id', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
            pivotMode: true,
        });
        api.setPivotResultColumns([{ colId: 'a', headerName: 'P' }]);
        api.setPivotResultColumns(null);
        api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
        api.setPivotResultColumns([{ colId: 'a', headerName: 'P' }]);

        expect(api.getColumn('a')!.getColDef().field).toBe('a');
        expect(api.getPivotResultColumns()!.map((col) => col.getColId())).toEqual(['a_1']);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    test('a colDef object with a colId a pivot result column holds, used twice and then once, takes the first column it built', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
        const x: ColDef = { colId: 'p', field: 'p' };
        const v: ColDef = { field: 'v', aggFunc: 'sum' };
        const api = gridsManager.createGrid('myGrid', { columnDefs: [v], rowData: [{ p: 1, v: 2 }], pivotMode: true });
        api.setPivotResultColumns([{ colId: 'p', headerName: 'P' }]);
        api.setGridOption('columnDefs', [x, { colId: 'p', field: 'p' }, x, v]);
        api.setPivotResultColumns([{ colId: 'p', headerName: 'P' }]);
        const first = api.getColumn('p_1')!;
        const third = api.getColumn('p_3')!;
        api.applyColumnState({ state: [{ colId: 'p_1', width: 111 }] });

        api.setGridOption('columnDefs', [{ field: 'p' }, x, v]);

        const takers = api.getColumns()!.filter((col) => col.getColDef().colId === 'p');
        expect(takers.map((col) => [col === first, col === third, col.getActualWidth()])).toEqual([[true, false, 111]]);
        expect(api.getColumns()!.length).toBe(3);
        expect(warn).toHaveBeenCalled();
    });

    test('pivot result columns without colId set again after a column took their id while they were cleared get another id', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ b: 2 }],
            pivotMode: true,
        });
        api.setPivotResultColumns([{ headerName: 'P' }]);
        const [pivotId] = api.getPivotResultColumns()!.map((col) => col.getColId());
        api.setPivotResultColumns(null);
        api.setGridOption('columnDefs', [{ headerName: 'X' }, { field: 'b' }]);
        expect(api.getColumn(pivotId)!.getColDef().headerName).toBe('X');

        api.setPivotResultColumns([{ headerName: 'P' }]);

        const [pivotCol] = api.getPivotResultColumns()!;
        expect(pivotCol.getColId()).not.toBe(pivotId);
        expect(api.getColumn(pivotId)!.getColDef().headerName).toBe('X');
    });

    test('pivot result columns set again as the same objects after a column took their id while they were cleared get another id', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ b: 2 }],
            pivotMode: true,
        });
        const results: ColDef[] = [{ headerName: 'P' }, { field: 'q' }];
        api.setPivotResultColumns(results);
        expect(api.getPivotResultColumns()!.map((col) => col.getColId())).toEqual(['0', 'q']);
        api.setPivotResultColumns(null);
        api.setGridOption('columnDefs', [{ headerName: 'X' }, { field: 'q' }, { field: 'b' }]);

        api.setPivotResultColumns(results);

        expect(api.getPivotResultColumns()!.map((col) => col.getColId())).not.toContain('0');
        expect(api.getPivotResultColumns()!.map((col) => col.getColId())).not.toContain('q');
        expect(api.getColumn('0')!.getColDef().headerName).toBe('X');
    });

    test('pivot result columns set again without colId or field keep their state by headerName, then by position', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ b: 2 }],
            pivotMode: true,
        });
        const widths = () =>
            api.getPivotResultColumns()!.map((col) => `${col.getColDef().headerName} ${col.getActualWidth()}`);
        api.setPivotResultColumns([{ headerName: 'P' }, { headerName: 'Q' }]);
        api.applyColumnState({ state: [{ colId: api.getPivotResultColumns()![1].getColId(), width: 333 }] });

        api.setPivotResultColumns([{ headerName: 'Q' }, { headerName: 'P' }]);
        const swapped = widths();
        api.setPivotResultColumns([{ headerName: 'Q2' }, { headerName: 'P2' }]);

        expect({ swapped, renamed: widths() }).toEqual({ swapped: ['Q 333', 'P 200'], renamed: ['Q2 333', 'P2 200'] });
    });

    test('a renamed repeat of a pivot result colId takes no later repeat’s state when a column took an earlier repeat’s id while they were cleared', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId repeats
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ b: 2, p_1: 3 }],
            pivotMode: true,
        });
        api.setPivotResultColumns([
            { colId: 'p', headerName: 'A' },
            { colId: 'p', headerName: 'B' },
            { colId: 'p', headerName: 'C' },
        ]);
        api.applyColumnState({ state: [{ colId: 'p_2', width: 333 }] });
        api.setPivotResultColumns(null);
        api.setGridOption('columnDefs', [{ field: 'b' }, { field: 'p_1' }]);

        api.setPivotResultColumns([
            { colId: 'p', headerName: 'A2' },
            { colId: 'p', headerName: 'B2' },
        ]);

        const widths = api
            .getPivotResultColumns()!
            .map((col) => `${col.getColDef().headerName} ${col.getActualWidth()}`);
        expect(widths).toEqual(['A2 200', 'B2 200']);
        expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
    });

    test('a pivot result column whose id a column took while they were cleared does not count as removed by the next update', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ b: 2 }],
            pivotMode: true,
        });
        api.setPivotResultColumns([{ headerName: 'A' }, { headerName: 'B' }]);
        const colB = api.getColumn('1')!;
        api.applyColumnState({ state: [{ colId: '1', width: 333 }] });
        api.setPivotResultColumns(null);
        api.setGridOption('columnDefs', [{ headerName: 'X' }, { field: 'b' }]);

        api.setPivotResultColumns([{ headerName: 'C' }]);

        const [colC] = api.getPivotResultColumns()!;
        expect(colC).not.toBe(colB);
        expect(colC.getActualWidth()).toBe(200);
    });

    test('duplicate pivot result colIds set again after a column took the suffixed id while they were cleared get another id', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'b' }],
            rowData: [{ b: 2, r_1: 3 }],
            pivotMode: true,
        });
        const results = (): ColDef[] => [
            { colId: 'r', headerName: 'R' },
            { colId: 'r', headerName: 'R' },
        ];
        api.setPivotResultColumns(results());
        api.setPivotResultColumns(null);
        api.setGridOption('columnDefs', [{ field: 'b' }, { field: 'r_1' }]);

        api.setPivotResultColumns(results());

        expect(api.getColumn('r_1')!.getColDef().field).toBe('r_1');
        expect(api.getPivotResultColumns()!.map((col) => col.getColId())).toEqual(['r', 'r_2']);
        expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
    });

    describe('a user column given the selection column’s colId', () => {
        test('set while the selection column is on gets the first free suffixed id with warning 273, the selection column keeping its own, and keeps that column and its width when its definition is set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const userId = `${SELECTION_COLUMN_ID}_1`;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowSelection: { mode: 'multiRow' },
            });
            const selectionColumn = api.getColumn(SELECTION_COLUMN_ID);
            const gridColIds = (): string[] => api.getAllGridColumns().map((c) => c.getColId());
            expect(gridColIds()).toEqual([SELECTION_COLUMN_ID, 'a']);

            api.setGridOption('columnDefs', [{ field: 'a' }, { colId: SELECTION_COLUMN_ID, headerName: 'Mine' }]);

            expect(gridColIds()).toEqual([SELECTION_COLUMN_ID, 'a', userId]);
            expect(api.getColumn(SELECTION_COLUMN_ID)).toBe(selectionColumn);
            expect(api.getColumns()!.map((c) => c.getColDef().headerName === 'Mine')).toEqual([false, true]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');

            const userColumn = api.getColumn(userId)!;
            api.applyColumnState({ state: [{ colId: userId, width: 222 }] });
            api.setGridOption('columnDefs', [{ field: 'a' }, { colId: SELECTION_COLUMN_ID, headerName: 'Mine' }]);

            expect(api.getColumn(userId)).toBe(userColumn);
            expect(userColumn.getActualWidth()).toBe(222);
            expect(api.getColumn(SELECTION_COLUMN_ID)).toBe(selectionColumn);
            expect(gridColIds()).toEqual([SELECTION_COLUMN_ID, 'a', userId]);
        });

        test('a grid column created while a column of the definitions holds its id takes the first free suffix with warning 273, the defined column keeping its id and instance, in a new grid or when the grid column comes later', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const idsOf = (api: GridApi) => api.getAllGridColumns().map((col) => col.getColId());
            const created = (colId: string, options: GridOptions, key: 'colId' | 'field' = 'colId') => {
                warn.mockClear();
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { [key]: colId, headerName: 'U' },
                        { field: 'country', rowGroup: true },
                    ],
                    ...options,
                });
                const result = {
                    ids: idsOf(api),
                    userColumnKeepsItsId: api.getColumn(colId)?.getColDef().headerName === 'U',
                    warnings: warnings273(warn.mock.calls),
                };
                gridsManager.reset();
                return result;
            };
            const comesLater = (colId: string, options: GridOptions, enable: (api: GridApi) => void) => {
                warn.mockClear();
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { colId, headerName: 'U' },
                        { field: 'country', enableRowGroup: true },
                    ],
                    ...options,
                });
                const user = api.getColumn(colId);
                const before = idsOf(api);
                const warningsBefore = warnings273(warn.mock.calls);
                enable(api);
                const suffixed = api.getColumn(`${colId}_1`);
                const result = {
                    before,
                    warningsBefore,
                    after: idsOf(api).sort(),
                    userColumnKept: user !== undefined && api.getColumn(colId) === user,
                    gridColumnAtSuffix: !!suffixed && suffixed !== user && suffixed.getColDef().headerName !== 'U',
                    warnings: warnings273(warn.mock.calls),
                };
                gridsManager.reset();
                return result;
            };
            const takesSuffixLater = (colId: string) => ({
                before: [colId, 'country'],
                warningsBefore: [],
                after: [colId, `${colId}_1`, 'country'].sort(),
                userColumnKept: true,
                gridColumnAtSuffix: true,
                warnings: [`${colId} -> ${colId}_1`],
            });
            const takesSuffix = (colId: string) => ({
                userColumnKeepsItsId: true,
                warnings: [`${colId} -> ${colId}_1`],
            });
            const rowNumbersId = 'ag-Grid-RowNumbersColumn';
            const groupBy = (api: GridApi) => api.setRowGroupColumns(['country']);

            expect({
                selection: created(SELECTION_COLUMN_ID, { rowSelection: { mode: 'multiRow' } }),
                selectionByField: created(SELECTION_COLUMN_ID, { rowSelection: { mode: 'multiRow' } }, 'field'),
                rowNumbers: created(rowNumbersId, { rowNumbers: true }),
                autoGroup: created('ag-Grid-AutoColumn', {}),
                autoGroupOfCountry: created('ag-Grid-AutoColumn-country', { groupDisplayType: 'multipleColumns' }),
                selectionLater: comesLater(SELECTION_COLUMN_ID, {}, (api) =>
                    api.setGridOption('rowSelection', { mode: 'multiRow' })
                ),
                rowNumbersLater: comesLater(rowNumbersId, {}, (api) => api.setGridOption('rowNumbers', true)),
                autoGroupLater: comesLater('ag-Grid-AutoColumn', {}, groupBy),
                autoGroupOfCountryLater: comesLater(
                    'ag-Grid-AutoColumn-country',
                    { groupDisplayType: 'multipleColumns' },
                    groupBy
                ),
            }).toEqual({
                selection: {
                    ids: [`${SELECTION_COLUMN_ID}_1`, 'ag-Grid-AutoColumn', SELECTION_COLUMN_ID, 'country'],
                    ...takesSuffix(SELECTION_COLUMN_ID),
                },
                selectionByField: {
                    ids: [`${SELECTION_COLUMN_ID}_1`, 'ag-Grid-AutoColumn', SELECTION_COLUMN_ID, 'country'],
                    ...takesSuffix(SELECTION_COLUMN_ID),
                },
                rowNumbers: {
                    ids: [`${rowNumbersId}_1`, 'ag-Grid-AutoColumn', rowNumbersId, 'country'],
                    ...takesSuffix(rowNumbersId),
                },
                autoGroup: {
                    ids: ['ag-Grid-AutoColumn_1', 'ag-Grid-AutoColumn', 'country'],
                    ...takesSuffix('ag-Grid-AutoColumn'),
                },
                autoGroupOfCountry: {
                    ids: ['ag-Grid-AutoColumn-country_1', 'ag-Grid-AutoColumn-country', 'country'],
                    ...takesSuffix('ag-Grid-AutoColumn-country'),
                },
                selectionLater: takesSuffixLater(SELECTION_COLUMN_ID),
                rowNumbersLater: takesSuffixLater(rowNumbersId),
                autoGroupLater: takesSuffixLater('ag-Grid-AutoColumn'),
                autoGroupOfCountryLater: takesSuffixLater('ag-Grid-AutoColumn-country'),
            });
        });

        test('a column declaring the group column’s id keeps it when a callback sets it during a build and when column state groups by another, the group column taking the first free suffix with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const colId = 'ag-Grid-AutoColumn';
            const idsOf = (api: GridApi) => api.getAllGridColumns().map((col) => col.getColId());
            let onMatch: (() => void) | null = null;
            let api: GridApi | undefined = undefined;
            api = gridsManager.createGrid('myGrid', {
                rowData: [{ a: 'x', country: 'UK' }],
                columnDefs: [{ field: 'a' }],
                dataTypeDefinitions: {
                    mine: {
                        baseDataType: 'text',
                        extendsDataType: 'text',
                        dataTypeMatcher: (value) => {
                            const run = onMatch;
                            onMatch = null;
                            run?.();
                            return value === 'never';
                        },
                    },
                },
            });
            onMatch = () => {
                api!.setGridOption('columnDefs', [
                    { colId, headerName: 'U' },
                    { field: 'country', rowGroup: true },
                ]);
            };
            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'country' }]);
            const byCallback = idsOf(api);
            const userColumnByCallback = api.getColumn(colId)?.getColDef().headerName;
            const warningsByCallback = warnings273(warn.mock.calls);
            gridsManager.reset();

            warn.mockClear();
            const stateApi = gridsManager.createGrid('myGrid', { columnDefs: [{ colId }, { field: 'country' }] });
            const userColumn = stateApi.getColumn(colId);
            const idsBeforeState = idsOf(stateApi);
            const warningsBeforeState = warnings273(warn.mock.calls);
            stateApi.applyColumnState({ state: [{ colId: 'country', rowGroup: true }] });
            const suffixed = stateApi.getColumn(`${colId}_1`);

            expect({
                byCallback,
                userColumnByCallback,
                warningsByCallback,
                idsBeforeState,
                warningsBeforeState,
                byState: idsOf(stateApi).sort(),
                userColumnKept: userColumn !== undefined && stateApi.getColumn(colId) === userColumn,
                groupColumnAtSuffix: !!suffixed && suffixed !== userColumn,
                warningsByState: warnings273(warn.mock.calls),
            }).toEqual({
                byCallback: [`${colId}_1`, colId, 'country'],
                userColumnByCallback: 'U',
                warningsByCallback: [`${colId} -> ${colId}_1`],
                idsBeforeState: [colId, 'country'],
                warningsBeforeState: [],
                byState: [colId, `${colId}_1`, 'country'].sort(),
                userColumnKept: true,
                groupColumnAtSuffix: true,
                warningsByState: [`${colId} -> ${colId}_1`],
            });
        });

        test('keeps the column definition order of the row groups, values and pivots when one of them declares the group column’s id, the group column taking the first free suffix with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const rowData = [
                { country: 'UK', sport: 'Rowing', year: 2000, gold: 1, silver: 3 },
                { country: 'Italy', sport: 'Fencing', year: 2004, gold: 2, silver: 4 },
            ];
            const grouped: ColDef[] = [
                { colId: 'ag-Grid-AutoColumn', field: 'country', rowGroup: true },
                { field: 'sport', rowGroup: true },
                { field: 'gold', aggFunc: 'sum' },
            ];
            const observed = (api: GridApi) => {
                const result = {
                    rowGroups: api.getRowGroupColumns().map((col) => `${col.getColId()} ${col.getColDef().field}`),
                    firstRowGroupField: api.getDisplayedRowAtIndex(0)!.field,
                    warnings: warnings273(warn.mock.calls),
                };
                warn.mockClear();
                return result;
            };

            const created = observed(gridsManager.createGrid('myGrid', { columnDefs: grouped, rowData }));
            gridsManager.reset();

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'ag-Grid-AutoColumn', field: 'country' }, { field: 'sport' }, { field: 'gold' }],
                rowData,
            });
            api.setGridOption('columnDefs', grouped);
            const columnDefsSetLater = observed(api);
            gridsManager.reset();

            const fieldsOf = (cols: Column[]) => cols.map((col) => `${col.getColId()} ${col.getColDef().field}`);
            const valuesApi = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'ag-Grid-AutoColumn', field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                    { field: 'country', rowGroup: true },
                ],
                rowData,
            });
            const values = { fields: fieldsOf(valuesApi.getValueColumns()), warnings: warnings273(warn.mock.calls) };
            gridsManager.reset();
            warn.mockClear();

            const pivotsApi = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'ag-Grid-AutoColumn', field: 'country', pivot: true },
                    { field: 'sport', pivot: true },
                    { field: 'year', rowGroup: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData,
                pivotMode: true,
            });
            const pivots = { fields: fieldsOf(pivotsApi.getPivotColumns()), warnings: warnings273(warn.mock.calls) };

            const clash = ['ag-Grid-AutoColumn -> ag-Grid-AutoColumn_1'];
            const expected = {
                rowGroups: ['ag-Grid-AutoColumn country', 'sport sport'],
                firstRowGroupField: 'country',
                warnings: clash,
            };
            expect({ created, columnDefsSetLater, values, pivots }).toEqual({
                created: expected,
                columnDefsSetLater: expected,
                values: { fields: ['ag-Grid-AutoColumn gold', 'silver silver'], warnings: clash },
                pivots: { fields: ['ag-Grid-AutoColumn country', 'sport sport'], warnings: clash },
            });
        });

        test('orders the row groups and pivots by their initial indexes when one of them takes the group column’s id, in a new grid and when set later', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const colId = 'ag-Grid-AutoColumn';
            const rowData = [
                { country: 'UK', sport: 'Rowing', year: 2000, gold: 1 },
                { country: 'Italy', sport: 'Fencing', year: 2004, gold: 2 },
            ];
            const fieldsOf = (cols: Column[]) => cols.map((col) => col.getColDef().field);
            const both = (
                columnDefs: ColDef[],
                read: (api: GridApi) => Column[],
                options: GridOptions = {}
            ): { created: (string | undefined)[]; setLater: (string | undefined)[] } => {
                const created = fieldsOf(read(gridsManager.createGrid('myGrid', { columnDefs, rowData, ...options })));
                gridsManager.reset();
                const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'x' }], rowData, ...options });
                api.setGridOption('columnDefs', columnDefs);
                const setLater = fieldsOf(read(api));
                gridsManager.reset();
                return { created, setLater };
            };
            const rowGroups = (api: GridApi) => api.getRowGroupColumns();

            const result = {
                initialRowGroupIndexOnTaker: both(
                    [
                        { colId, field: 'country', initialRowGroup: true, initialRowGroupIndex: 1 },
                        { field: 'sport', initialRowGroup: true, initialRowGroupIndex: 0 },
                        { field: 'gold' },
                    ],
                    rowGroups
                ),
                rowGroupIndexOnTaker: both(
                    [
                        { colId, field: 'country', rowGroupIndex: 1 },
                        { field: 'sport', initialRowGroup: true, initialRowGroupIndex: 0 },
                        { field: 'gold' },
                    ],
                    rowGroups
                ),
                takerWithoutRole: both(
                    [
                        { field: 'sport', initialRowGroupIndex: 1 },
                        { field: 'year', initialRowGroupIndex: 0 },
                        { colId, field: 'country' },
                    ],
                    rowGroups
                ),
                initialPivotIndexOnTaker: both(
                    [
                        { colId, field: 'country', initialPivot: true, initialPivotIndex: 1 },
                        { field: 'sport', initialPivotIndex: 0 },
                        { field: 'year', rowGroup: true },
                        { field: 'gold', aggFunc: 'sum' },
                    ],
                    (api) => api.getPivotColumns(),
                    { pivotMode: true }
                ),
            };

            expect(result).toEqual({
                initialRowGroupIndexOnTaker: { created: ['sport', 'country'], setLater: ['sport', 'country'] },
                rowGroupIndexOnTaker: { created: ['sport', 'country'], setLater: ['sport', 'country'] },
                takerWithoutRole: { created: ['year', 'sport'], setLater: ['year', 'sport'] },
                initialPivotIndexOnTaker: { created: ['sport', 'country'], setLater: ['sport', 'country'] },
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('two of them set again with the first renamed take the two columns by position, whatever their headerName', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const colId = SELECTION_COLUMN_ID;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                rowSelection: { mode: 'multiRow' },
            });
            api.setGridOption('columnDefs', [
                { colId, headerName: 'A' },
                { colId, headerName: 'B' },
            ]);
            const [a, b] = api.getColumns()!;

            api.setGridOption('columnDefs', [
                { colId, headerName: 'N' },
                { colId, headerName: 'A' },
            ]);

            expect(api.getColumns()!.map((col) => [col === a, col === b])).toEqual([
                [true, false],
                [false, true],
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('keeps its column, id, width, sort and value role when the group column comes later, which takes the first free suffix with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const colId = 'ag-Grid-AutoColumn';
            const groupId = `${colId}_1`;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId, field: 'n', aggFunc: 'sum' },
                    { field: 'g', enableRowGroup: true },
                ],
                rowData: [
                    { n: 1, g: 'a' },
                    { n: 2, g: 'b' },
                ],
            });
            const column = api.getColumn(colId)!;
            api.applyColumnState({ state: [{ colId, width: 150, sort: 'desc' }] });
            const idsOf = (): string[] => api.getAllGridColumns().map((col) => col.getColId());
            expect({ ids: idsOf(), width: column.getActualWidth(), sort: column.getSort() }).toEqual({
                ids: [colId, 'g'],
                width: 150,
                sort: 'desc',
            });
            expect(warn.mock.calls).toEqual([]);

            api.setRowGroupColumns(['g']);

            const groupColumn = api.getColumn(groupId)!;
            expect({
                ids: idsOf().sort(),
                idStillOnTheUserColumn: api.getColumn(colId) === column,
                groupColumnIsAnother: groupColumn !== column,
                width: column.getActualWidth(),
                sort: column.getSort() ?? null,
                values: api.getValueColumns().map((col) => col === column),
                rowGroups: api.getRowGroupColumns().map((col) => col.getColId()),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: [colId, groupId, 'g'].sort(),
                idStillOnTheUserColumn: true,
                groupColumnIsAnother: true,
                width: 150,
                sort: 'desc',
                values: [true],
                rowGroups: ['g'],
                warnings: [`${colId} -> ${groupId}`],
            });
        });

        test('keeps its column, id, width, sort and filter when the selection column comes later, which takes the first free suffix with warning 273, every rendered cell and header cell having a col-id of its own', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const selectionId = `${SELECTION_COLUMN_ID}_1`;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: SELECTION_COLUMN_ID, field: 'a', filter: true }, { field: 'x' }],
                rowData: [
                    { a: 'p', x: 1 },
                    { a: 'q', x: 2 },
                ],
            });
            const column = api.getColumn(SELECTION_COLUMN_ID)!;
            api.applyColumnState({ state: [{ colId: SELECTION_COLUMN_ID, width: 150, sort: 'desc' }] });
            api.setFilterModel({ [SELECTION_COLUMN_ID]: { type: 'equals', filter: 'p' } });
            const idsOf = (): string[] => api.getAllGridColumns().map((col) => col.getColId());
            expect({
                ids: idsOf(),
                widthAndSort: [column.getActualWidth(), column.getSort()],
                filteredIds: Object.keys(api.getFilterModel()),
                rowCount: api.getDisplayedRowCount(),
            }).toEqual({
                ids: [SELECTION_COLUMN_ID, 'x'],
                widthAndSort: [150, 'desc'],
                filteredIds: [SELECTION_COLUMN_ID],
                rowCount: 1,
            });
            expect(warn.mock.calls).toEqual([]);

            api.setGridOption('rowSelection', { mode: 'multiRow' });

            const selectionColumn = api.getColumn(selectionId)!;
            expect({
                ids: idsOf().sort(),
                idStillOnTheUserColumn: api.getColumn(SELECTION_COLUMN_ID) === column,
                selectionColumnIsAnother: selectionColumn !== column,
                widthAndSort: [column.getActualWidth(), column.getSort() ?? null],
                filteredIds: Object.keys(api.getFilterModel()),
                rowCount: api.getDisplayedRowCount(),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: [SELECTION_COLUMN_ID, selectionId, 'x'].sort(),
                idStillOnTheUserColumn: true,
                selectionColumnIsAnother: true,
                widthAndSort: [150, 'desc'],
                filteredIds: [SELECTION_COLUMN_ID],
                rowCount: 1,
                warnings: [`${SELECTION_COLUMN_ID} -> ${selectionId}`],
            });
            const gridElement = getGridElement(api)!;
            const colIds = (parent: ParentNode, selector: string): string[] =>
                Array.from(parent.querySelectorAll(selector), (el) => el.getAttribute('col-id')!);
            const rows = Array.from(gridElement.querySelectorAll('.ag-row'));
            expect(rows.map((row) => row.getAttribute('row-index'))).toEqual(['0']);
            for (const row of rows) {
                const ids = colIds(row, '.ag-cell[col-id]');
                expect(ids).toEqual([...new Set(ids)]);
            }
            const headerIds = colIds(gridElement, '.ag-header-cell[col-id]');
            expect(headerIds).toEqual(api.getAllDisplayedColumns().map((col) => col.getColId()));
            expect(colIds(rows[0], '.ag-cell[col-id]')).toEqual(
                api.getAllDisplayedColumns().map((col) => col.getColId())
            );
        });

        test('three of them: the group column takes the first free suffix in a new grid, the selection and row numbers columns when they come later, the three keeping their columns, widths and sorts', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const rowNumbersId = 'ag-Grid-RowNumbersColumn';
            const groupId = 'ag-Grid-AutoColumn';
            const ids = {
                selection: `${SELECTION_COLUMN_ID}_1`,
                rowNumbers: `${rowNumbersId}_1`,
                group: `${groupId}_1`,
            };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: SELECTION_COLUMN_ID, field: 'country', rowGroup: true },
                    { colId: rowNumbersId, field: 'gold', aggFunc: 'sum' },
                    { colId: groupId, field: 'year', pivot: true },
                ],
                rowData: [
                    { country: 'UK', gold: 1, year: 2000 },
                    { country: 'Italy', gold: 2, year: 2004 },
                ],
            });
            const before = {
                selection: api.getColumn(SELECTION_COLUMN_ID)!,
                rowNumbers: api.getColumn(rowNumbersId)!,
                pivot: api.getColumn(groupId)!,
            };
            api.applyColumnState({
                state: [
                    { colId: SELECTION_COLUMN_ID, width: 150 },
                    { colId: rowNumbersId, width: 160, sort: 'desc' },
                    { colId: groupId, width: 170 },
                ],
            });
            const idsOf = (): string[] => api.getAllGridColumns().map((col) => col.getColId());
            const roles = (): { rowGroups: string[]; values: string[]; pivots: string[] } => ({
                rowGroups: api.getRowGroupColumns().map((col) => col.getColId()),
                values: api.getValueColumns().map((col) => col.getColId()),
                pivots: api.getPivotColumns().map((col) => col.getColId()),
            });
            const userColumns = [before.selection, before.rowNumbers, before.pivot];
            expect({
                ids: idsOf(),
                widths: userColumns.map((col) => col.getActualWidth()),
                sorts: userColumns.map((col) => col.getSort() ?? null),
                ...roles(),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: [ids.group, SELECTION_COLUMN_ID, rowNumbersId, groupId],
                widths: [150, 160, 170],
                sorts: [null, 'desc', null],
                rowGroups: [SELECTION_COLUMN_ID],
                values: [rowNumbersId],
                pivots: [groupId],
                warnings: [`${groupId} -> ${ids.group}`],
            });
            warn.mockClear();

            api.updateGridOptions({ rowSelection: { mode: 'multiRow' }, rowNumbers: true });

            expect({
                ids: idsOf().sort(),
                kept: [
                    api.getColumn(SELECTION_COLUMN_ID) === before.selection,
                    api.getColumn(rowNumbersId) === before.rowNumbers,
                    api.getColumn(groupId) === before.pivot,
                ],
                gridColumnsAreOthers: [ids.selection, ids.rowNumbers].map(
                    (id) => !userColumns.includes(api.getColumn(id)!)
                ),
                widths: userColumns.map((col) => col.getActualWidth()),
                sorts: userColumns.map((col) => col.getSort() ?? null),
                ...roles(),
                warnings: warnings273(warn.mock.calls).sort(),
            }).toEqual({
                ids: [rowNumbersId, SELECTION_COLUMN_ID, groupId, ids.group, ids.selection, ids.rowNumbers].sort(),
                kept: [true, true, true],
                gridColumnsAreOthers: [true, true],
                widths: [150, 160, 170],
                sorts: [null, 'desc', null],
                rowGroups: [SELECTION_COLUMN_ID],
                values: [rowNumbersId],
                pivots: [groupId],
                warnings: [`${rowNumbersId} -> ${ids.rowNumbers}`, `${SELECTION_COLUMN_ID} -> ${ids.selection}`].sort(),
            });
        });

        test('a column declaring the group column’s id and a hierarchy keeps it, its level column taking an id from it and the group column the first free suffix, and keeps the level when its definition is set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const columnDefs: ColDef[] = [
                {
                    colId: 'ag-Grid-AutoColumn',
                    field: 'date',
                    rowGroup: true,
                    enableRowGroup: true,
                    groupHierarchy: ['year'],
                },
            ];
            const levelId = 'ag-Grid-HierarchyColumn-ag-Grid-AutoColumn-year';
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ date: new Date(2020, 5, 15) }],
            });
            expect(
                api
                    .getAllGridColumns()
                    .map((col) => col.getColId())
                    .sort()
            ).toEqual(['ag-Grid-AutoColumn', 'ag-Grid-AutoColumn_1', levelId].sort());
            expect(warnings273(warn.mock.calls)).toEqual(['ag-Grid-AutoColumn -> ag-Grid-AutoColumn_1']);
            const level = api.getColumn(levelId)!;
            const source = api.getColumn('ag-Grid-AutoColumn')!;
            expect(source.getUserProvidedColDef()).toBe(columnDefs[0]);

            api.setGridOption(
                'columnDefs',
                columnDefs.map((def) => ({ ...def }))
            );

            expect(api.getColumn(levelId)).toBe(level);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(source);
        });

        test('after columnDefs [] is a new column in definition order, never the removed user column, keeping its colId and column when the grid creates the selection column, which takes the first free suffix', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const error = vi.spyOn(console, 'error');
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const order = (api: GridApi): string[] =>
                api
                    .getAllDisplayedColumns()
                    .map((c) => `${c.getColId()} ${c.getUserProvidedColDef()?.field ?? 'selection'}`);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: SELECTION_COLUMN_ID, field: 'a' }, { field: 'b' }],
                maintainColumnOrder: true,
            });
            api.moveColumns(['b'], 0);
            expect(order(api)).toEqual(['b b', `${SELECTION_COLUMN_ID} a`]);
            api.setGridOption('columnDefs', []);

            api.updateGridOptions({ columnDefs: [{ field: 'b' }], rowSelection: { mode: 'multiRow' } });
            expect(order(api)).toEqual([`${SELECTION_COLUMN_ID} selection`, 'b b']);

            api.setGridOption('columnDefs', []);
            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: false, headerCheckbox: false });
            const userDef: ColDef = { colId: SELECTION_COLUMN_ID, field: 'a' };
            api.setGridOption('columnDefs', [{ field: 'b' }, userDef]);
            expect(order(api)).toEqual(['b b', `${SELECTION_COLUMN_ID} a`]);
            const keptId = api.getColumn(SELECTION_COLUMN_ID)!;
            expect(keptId.getUserProvidedColDef()).toBe(userDef);
            expect(warn.mock.calls).toEqual([]);

            api.setGridOption('rowSelection', { mode: 'multiRow' });

            expect(order(api)).toEqual([`${SELECTION_COLUMN_ID}_1 selection`, 'b b', `${SELECTION_COLUMN_ID} a`]);
            expect(api.getColumn(SELECTION_COLUMN_ID)).toBe(keptId);
            expect(keptId.getUserProvidedColDef()).toBe(userDef);
            expect(api.getColumn(`${SELECTION_COLUMN_ID}_1`)).not.toBe(keptId);
            expect(error.mock.calls).toEqual([]);
            expect(warnings273(warn.mock.calls)).toEqual([`${SELECTION_COLUMN_ID} -> ${SELECTION_COLUMN_ID}_1`]);
            expect(warnings273(warn.mock.calls)).toHaveLength(warn.mock.calls.length);
        });

        test('a hierarchy part with the row numbers column’s colId keeps it, its column and width, whether the row numbers column is on from the start or comes later, which takes the first free suffix with warning 273', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const rowNumbersId = 'ag-Grid-RowNumbersColumn';
            const rowNumbersColumnId = `${rowNumbersId}_1`;
            const options: GridOptions = {
                columnDefs: [
                    {
                        field: 'date',
                        rowGroup: true,
                        enableRowGroup: true,
                        groupHierarchy: [{ colId: rowNumbersId, headerName: 'P', valueGetter: () => 'P' }],
                    },
                ],
                rowData: [{ date: new Date(2020, 5, 15) }],
            };
            const api = gridsManager.createGrid('myGrid', options);
            const idsOf = (): string[] => api.getAllGridColumns().map((col) => col.getColId());
            const part = api.getColumn(rowNumbersId)!;
            expect({
                ids: idsOf().sort(),
                partHeaderName: part?.getColDef().headerName,
                rowGroups: api.getRowGroupColumns().map((col) => col.getColId()),
                warned: warn.mock.calls.length > 0,
            }).toEqual({
                ids: ['ag-Grid-AutoColumn', rowNumbersId, 'date'],
                partHeaderName: 'P',
                rowGroups: [rowNumbersId, 'date'],
                warned: false,
            });
            api.applyColumnState({ state: [{ colId: rowNumbersId, width: 333 }] });
            expect(part.getActualWidth()).toBe(333);
            const idsUniqueAtEachCall: boolean[] = [];
            api.addEventListener('gridColumnsChanged', () => {
                const ids = idsOf();
                idsUniqueAtEachCall.push(new Set(ids).size === ids.length);
            });

            api.setGridOption('rowNumbers', true);
            await vi.waitFor(() => expect(idsUniqueAtEachCall).toEqual([true]), { timeout: 1000 });

            const rowNumbersColumn = api.getColumn(rowNumbersColumnId);
            expect({
                ids: idsOf().sort(),
                partKept: api.getColumn(rowNumbersId) === part,
                partHeaderName: part.getColDef().headerName,
                partWidth: part.getActualWidth(),
                rowNumbersColumnIsAnother: rowNumbersColumn !== undefined && rowNumbersColumn !== part,
                rowGroups: api.getRowGroupColumns().map((col) => col.getColId()),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: ['ag-Grid-AutoColumn', rowNumbersId, rowNumbersColumnId, 'date'],
                partKept: true,
                partHeaderName: 'P',
                partWidth: 333,
                rowNumbersColumnIsAnother: true,
                rowGroups: [rowNumbersId, 'date'],
                warnings: [`${rowNumbersId} -> ${rowNumbersColumnId}`],
            });
            expect(idsUniqueAtEachCall.every(Boolean)).toBe(true);
            gridsManager.reset();
            warn.mockClear();

            const withRowNumbers = gridsManager.createGrid('myGrid', { ...options, rowNumbers: true });
            expect({
                ids: withRowNumbers
                    .getAllGridColumns()
                    .map((col) => col.getColId())
                    .sort(),
                partId: withRowNumbers
                    .getAllGridColumns()
                    .find((col) => col.getColDef().headerName === 'P')
                    ?.getColId(),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: ['ag-Grid-AutoColumn', rowNumbersId, rowNumbersColumnId, 'date'],
                partId: rowNumbersId,
                warnings: [`${rowNumbersId} -> ${rowNumbersColumnId}`],
            });
        });

        test('a user column declaring a group column’s id keeps it and its column when the group columns come later, the group column taking the first free suffix with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const api = gridsManager.createGrid('myGrid', {
                groupDisplayType: 'multipleColumns',
                columnDefs: [
                    { colId: 'ag-Grid-AutoColumn-x', field: 'a' },
                    { field: 'x', enableRowGroup: true },
                    { field: 'y', enableRowGroup: true },
                ],
                rowData: [{ a: 1, x: 'p', y: 'q' }],
            });
            const idsOf = (): string[] => api.getAllGridColumns().map((col) => col.getColId());
            expect(idsOf()).toEqual(['ag-Grid-AutoColumn-x', 'x', 'y']);
            expect(warn.mock.calls).toEqual([]);
            const user = api.getColumn('ag-Grid-AutoColumn-x')!;

            api.setRowGroupColumns(['x', 'y']);

            const groupColumn = api.getColumn('ag-Grid-AutoColumn-x_1');
            expect({
                ids: idsOf().sort(),
                userColumnKept: api.getColumn('ag-Grid-AutoColumn-x') === user,
                userColumnField: user.getColDef().field,
                groupColumnIsAnother: groupColumn !== undefined && groupColumn !== user,
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: ['ag-Grid-AutoColumn-x', 'ag-Grid-AutoColumn-y', 'ag-Grid-AutoColumn-x_1', 'x', 'y'].sort(),
                userColumnKept: true,
                userColumnField: 'a',
                groupColumnIsAnother: true,
                warnings: ['ag-Grid-AutoColumn-x -> ag-Grid-AutoColumn-x_1'],
            });
        });

        test('a group column that took the first free suffix keeps its instance, id and width when the grouping changes, one warning 273 in total', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const api = gridsManager.createGrid('myGrid', {
                groupDisplayType: 'multipleColumns',
                columnDefs: [
                    { colId: 'ag-Grid-AutoColumn-x', field: 'a' },
                    { field: 'x', rowGroup: true },
                    { field: 'y' },
                ],
                rowData: [{ a: 1, x: 'p', y: 'q' }],
            });
            const user = api.getColumn('ag-Grid-AutoColumn-x')!;
            const groupX = api.getColumn('ag-Grid-AutoColumn-x_1')!;
            expect({
                userField: user.getColDef().field,
                groupIsAnother: groupX !== undefined && groupX !== user,
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                userField: 'a',
                groupIsAnother: true,
                warnings: ['ag-Grid-AutoColumn-x -> ag-Grid-AutoColumn-x_1'],
            });
            api.setColumnWidths([{ key: 'ag-Grid-AutoColumn-x_1', newWidth: 222 }]);
            expect(groupX.getActualWidth()).toBe(222);

            api.setRowGroupColumns(['y', 'x']);

            expect({
                groupXKept: api.getColumn('ag-Grid-AutoColumn-x_1') === groupX,
                groupXWidth: groupX.getActualWidth(),
                groupYAtOwnId: api.getColumn('ag-Grid-AutoColumn-y') != null,
                userColumnKept: api.getColumn('ag-Grid-AutoColumn-x') === user,
                ids: api
                    .getAllGridColumns()
                    .map((col) => col.getColId())
                    .sort(),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                groupXKept: true,
                groupXWidth: 222,
                groupYAtOwnId: true,
                userColumnKept: true,
                ids: ['ag-Grid-AutoColumn-x', 'ag-Grid-AutoColumn-x_1', 'ag-Grid-AutoColumn-y', 'x', 'y'].sort(),
                warnings: ['ag-Grid-AutoColumn-x -> ag-Grid-AutoColumn-x_1'],
            });
        });

        test('two group columns whose ids a user column pushes onto each other each get an id of their own, in a new grid and when the grouping is reordered', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const createGrid = (grouped: string[]) =>
                gridsManager.createGrid('myGrid', {
                    groupDisplayType: 'multipleColumns',
                    columnDefs: [
                        { colId: 'a', field: 'a', rowGroup: grouped.includes('a'), enableRowGroup: true },
                        { colId: 'a_1', field: 'b', rowGroup: grouped.includes('a_1'), enableRowGroup: true },
                        { colId: 'ag-Grid-AutoColumn-a', field: 'c' },
                    ],
                    rowData: [{ a: 'p', b: 'q', c: 1 }],
                });
            const read = (api: GridApi) => {
                const cols = api.getAllGridColumns();
                return {
                    cols: cols
                        .map((col) => `${col.getColId()} ${col.getColDef().showRowGroup ?? col.getColDef().field}`)
                        .sort(),
                    ownLookup: cols.map((col) => api.getColumn(col.getColId()) === col),
                    headers: Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell[col-id]'), (el) =>
                        el.getAttribute('col-id')
                    ).sort(),
                    warnings: warnings273(warn.mock.calls),
                };
            };
            const expected = {
                cols: [
                    'a a',
                    'a_1 b',
                    'ag-Grid-AutoColumn-a c',
                    'ag-Grid-AutoColumn-a_1 a',
                    'ag-Grid-AutoColumn-a_1_1 a_1',
                ].sort(),
                ownLookup: [true, true, true, true, true],
                headers: [
                    'a',
                    'a_1',
                    'ag-Grid-AutoColumn-a',
                    'ag-Grid-AutoColumn-a_1',
                    'ag-Grid-AutoColumn-a_1_1',
                ].sort(),
                warnings: [
                    'ag-Grid-AutoColumn-a -> ag-Grid-AutoColumn-a_1',
                    'ag-Grid-AutoColumn-a_1 -> ag-Grid-AutoColumn-a_1_1',
                ],
            };

            expect(read(createGrid(['a', 'a_1']))).toEqual(expected);

            gridsManager.reset();
            warn.mockClear();
            const api = createGrid(['a']);
            const groupA = api.getColumn('ag-Grid-AutoColumn-a_1')!;
            expect(groupA.getColDef().showRowGroup).toBe('a');

            api.setRowGroupColumns(['a_1', 'a']);

            expect({ ...read(api), groupAKept: api.getColumn('ag-Grid-AutoColumn-a_1') === groupA }).toEqual({
                ...expected,
                // grouping through the API hides the grouped column
                headers: expected.headers.filter((id) => id !== 'a_1'),
                groupAKept: true,
            });
        });

        test('a grouped user column with a hierarchy keeps its column and its level column’s id when the selection column comes later, which takes the first free suffix with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const selectionId = `${SELECTION_COLUMN_ID}_1`;
            const levelId = `ag-Grid-HierarchyColumn-${SELECTION_COLUMN_ID}-year`;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: SELECTION_COLUMN_ID, field: 'd', rowGroup: true, groupHierarchy: ['year'] },
                    { field: 'b' },
                ],
                rowData: [{ d: new Date(2020, 5, 15), b: 1 }],
            });
            const rowGroupColumns = api.getRowGroupColumns().slice();
            expect(rowGroupColumns.map((col) => col.getColId())).toEqual([levelId, SELECTION_COLUMN_ID]);
            expect(warn.mock.calls).toEqual([]);

            api.setGridOption('rowSelection', { mode: 'multiRow' });

            expect({
                ids: api
                    .getAllGridColumns()
                    .map((col) => col.getColId())
                    .sort(),
                rowGroups: api.getRowGroupColumns().map((col) => col.getColId()),
                rowGroupsKept: api.getRowGroupColumns().map((col, i) => col === rowGroupColumns[i]),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                ids: ['ag-Grid-AutoColumn', levelId, SELECTION_COLUMN_ID, selectionId, 'b'].sort(),
                rowGroups: [levelId, SELECTION_COLUMN_ID],
                rowGroupsKept: [true, true],
                warnings: [`${SELECTION_COLUMN_ID} -> ${selectionId}`],
            });
        });

        test.each([
            ['ag-Grid-AutoColumn', ['ag-Grid-AutoColumn -> ag-Grid-AutoColumn_1']],
            ['myN', []],
        ])(
            'a column with colId %s keeps it and has its data type inferred from rowData set later',
            (colId, warnings) => {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // 273: colId taken
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { colId, field: 'n' },
                        { field: 'g', rowGroup: true },
                    ],
                });

                api.setGridOption('rowData', [{ n: 1, g: 'a' }]);

                expect(api.getColumn(colId)?.getColDef().field).toBe('n');
                expect(api.getColumn(colId)?.getColDef().cellDataType).toBe('number');
                expect(warnings273(warn.mock.calls)).toEqual(warnings);
            }
        );

        test('a pivot result column the app gives the row numbers column’s id keeps it when the row numbers column is turned on, which takes the first free suffix with warning 273, every displayed column keeping an id of its own', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const rowNumbersId = 'ag-Grid-RowNumbersColumn';
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', pivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'UK', sport: 'Rowing', gold: 1 }],
                pivotMode: true,
            });
            api.setPivotResultColumns([
                { colId: rowNumbersId, field: 'gold' },
                { colId: 'p2', field: 'gold' },
            ]);
            const pivotResults = api.getPivotResultColumns()!.slice();
            expect(pivotResults.map((col) => col.getColId())).toEqual([rowNumbersId, 'p2']);
            expect(warn).not.toHaveBeenCalled();

            api.setGridOption('rowNumbers', true);

            // the order of the displayed columns is not this claim's: sorted, a repeated id still shows
            const displayed = api.getAllDisplayedColumns();
            const rowNumbersColumn = api.getColumn(`${rowNumbersId}_1`)!;
            expect({
                displayed: displayed.map((col) => col.getColId()).sort(),
                rowNumbersColumnDisplayed: displayed.includes(rowNumbersColumn),
                rowNumbersColumnField: rowNumbersColumn.getColDef().field,
                pivotResults: api.getPivotResultColumns()!.map((col) => col.getColId()),
                pivotResultsKept: api.getPivotResultColumns()!.map((col, i) => col === pivotResults[i]),
                pivotResultAtItsId: api.getColumn(rowNumbersId) === pivotResults[0],
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                displayed: ['ag-Grid-AutoColumn', rowNumbersId, `${rowNumbersId}_1`, 'p2'].sort(),
                rowNumbersColumnDisplayed: true,
                rowNumbersColumnField: undefined,
                pivotResults: [rowNumbersId, 'p2'],
                pivotResultsKept: [true, true],
                pivotResultAtItsId: true,
                warnings: [`${rowNumbersId} -> ${rowNumbersId}_1`],
            });
        });

        test('a user column taking a row group column’s generated id keeps the row group order the user set, as with an id nothing takes', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const rowGroupIdsAfter = (colId: string): string[] => {
                const api = gridsManager.createGrid('myGrid', {
                    groupDisplayType: 'multipleColumns',
                    columnDefs: [
                        { field: 'a', rowGroup: true },
                        { field: 'b', rowGroup: true },
                        { field: 'c' },
                        { field: 'x' },
                    ],
                    rowData: [{ a: 1, b: 2, c: 3, x: 4 }],
                });
                api.setRowGroupColumns(['b', 'a']);
                expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['b', 'a']);

                api.setGridOption('columnDefs', [
                    { field: 'a', rowGroup: true },
                    { field: 'b', rowGroup: true },
                    { field: 'c', rowGroup: true },
                    { colId, field: 'x' },
                ]);

                const ids = api.getRowGroupColumns().map((col) => col.getColId());
                gridsManager.reset();
                return ids;
            };

            const control = rowGroupIdsAfter('mine');
            expect(warn).not.toHaveBeenCalled();
            const clash = rowGroupIdsAfter('ag-Grid-AutoColumn-c');

            expect({ control, clash }).toEqual({ control: ['b', 'a', 'c'], clash: ['b', 'a', 'c'] });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a user calculated column restored with the row numbers column’s colId keeps its id and expression when rowNumbers is turned on, the row numbers column coming up with the first free suffix and warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const rowNumbersId = 'ag-Grid-RowNumbersColumn';
            const api = gridsManager.createGrid(
                'myGrid',
                {
                    columnDefs: [{ field: 'a' }, { field: 'b' }],
                    rowData: [{ a: 1, b: 2 }],
                    calculatedColumns: true,
                    initialState: {
                        userColumns: [
                            {
                                colId: rowNumbersId,
                                created: true,
                                properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }],
                            },
                        ],
                    },
                },
                { modules: [CalculatedColumnsModule] }
            );
            const calculated = api.getColumn(rowNumbersId)!;
            expect(calculated.getColDef().calculatedExpression).toBe('[a] + [b]');
            expect(warn.mock.calls).toEqual([]);

            api.setGridOption('rowNumbers', true);

            const rowNumbers = api.getColumn(`${rowNumbersId}_1`)!;
            const displayedIds = api.getAllDisplayedColumns().map((col) => col.getColId());
            expect({
                calculatedKept: api.getColumn(rowNumbersId) === calculated,
                calculatedExpression: calculated.getColDef().calculatedExpression,
                rowNumbersField: rowNumbers.getColDef().field,
                rowNumbersCalculatedExpression: rowNumbers.getColDef().calculatedExpression,
                rowNumbersDisplayed: api.getAllDisplayedColumns().includes(rowNumbers),
                warnings: warnings273(warn.mock.calls),
            }).toEqual({
                calculatedKept: true,
                calculatedExpression: '[a] + [b]',
                rowNumbersField: undefined,
                rowNumbersCalculatedExpression: undefined,
                rowNumbersDisplayed: true,
                warnings: [`${rowNumbersId} -> ${rowNumbersId}_1`],
            });
            expect(displayedIds).toEqual([...new Set(displayedIds)]);
        });

        test('a columnDefs update a throwing callback interrupts leaves the next update keeping the column ids and the row group order the user set', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            let throwOnce = false;
            const api = gridsManager.createGrid('myGrid', {
                groupDisplayType: 'multipleColumns',
                columnDefs: [
                    { field: 'a', rowGroup: true },
                    { field: 'b', rowGroup: true },
                    { field: 'c' },
                    { field: 'x' },
                ],
                rowData: [{ a: 1, b: 2, c: 3, x: 'text' }],
                dataTypeDefinitions: {
                    mine: {
                        baseDataType: 'text',
                        extendsDataType: 'text',
                        dataTypeMatcher: (value) => {
                            if (throwOnce) {
                                throwOnce = false;
                                throw new Error('listener failed');
                            }
                            return value === 'never';
                        },
                    },
                },
            });
            api.setRowGroupColumns(['b', 'a']);
            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['b', 'a']);

            throwOnce = true;
            try {
                api.setGridOption('columnDefs', [
                    { field: 'a', rowGroup: true },
                    { field: 'b', rowGroup: true },
                    { field: 'c', rowGroup: true },
                    { colId: 'ag-Grid-AutoColumn-c', field: 'x' },
                ]);
            } catch {
                // the grid may report the error instead of throwing it
            }
            expect(throwOnce).toBe(false); // the callback ran, so the update was interrupted

            api.setGridOption('columnDefs', [
                { field: 'a', rowGroup: true },
                { field: 'b', rowGroup: true },
                { field: 'c', rowGroup: true },
                { colId: 'mine', field: 'x' },
            ]);

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['b', 'a', 'c']);
            expect(warn).not.toHaveBeenCalled();
        });
    });

    // A, kept by its headerName, holds '0'; the new column gets the removed one's '1', as a new grid listing A first.
    describe('columns generated from a new column given a removed column’s generated id', () => {
        const rowData = [
            { sport: 'Rowing', country: 'Italy', gold: 1, silver: 7 },
            { sport: 'Swimming', country: 'France', gold: 2, silver: 8 },
        ];
        const state = (cols: Column[] | null) =>
            (cols ?? []).map((col) => `${col.getColId()}:${col.getActualWidth()}:${col.getSort() ?? '-'}`);
        const a: ColDef = { headerName: 'A', hide: true };

        test('the group column of its hierarchy column starts with its default width and sort, as in a new grid', () => {
            const dates = [{ date: new Date(2020, 0, 1), other: new Date(2021, 5, 1) }];
            const e: ColDef = {
                headerName: 'E',
                valueGetter: (p) => p.data?.other,
                groupHierarchy: ['year'],
                rowGroup: true,
            };
            const group = 'ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-1-year';
            const read = (api: GridApi) =>
                state(api.getAllDisplayedColumns().filter((col) => col.getColId() === group));
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { ...a },
                    {
                        headerName: 'D',
                        valueGetter: (p) => p.data?.date,
                        groupHierarchy: ['year'],
                        rowGroup: true,
                    },
                    { headerName: 'Gone' },
                ],
                rowData: dates,
                groupDisplayType: 'multipleColumns',
            });
            expect(read(api)).toEqual([`${group}:200:-`]);
            api.applyColumnState({ state: [{ colId: group, width: 333, sort: 'desc' }] });

            api.setGridOption('columnDefs', [e, { ...a }]);
            const live = read(api);
            gridsManager.reset();

            const fresh = read(
                gridsManager.createGrid('myGrid', {
                    columnDefs: [{ ...a }, e],
                    rowData: dates,
                    groupDisplayType: 'multipleColumns',
                })
            );
            expect({ live, fresh }).toEqual({ live: fresh, fresh: [`${group}:200:-`] });
        });

        test('a group column starts with its default width and sort, as in a new grid', () => {
            const y: ColDef = { headerName: 'Y', valueGetter: (p) => p.data?.country, rowGroup: true, hide: true };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { ...a },
                    { headerName: 'X', valueGetter: (p) => p.data?.sport, rowGroup: true, hide: true },
                    { headerName: 'Gone' },
                ],
                rowData,
                groupDisplayType: 'multipleColumns',
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn-1', width: 333, sort: 'desc' }] });

            api.setGridOption('columnDefs', [y, { ...a }]);
            const live = state(api.getAllDisplayedColumns());
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', {
                columnDefs: [{ ...a }, y],
                rowData,
                groupDisplayType: 'multipleColumns',
            });
            const asNew = state(fresh.getAllDisplayedColumns());
            expect({ live, asNew }).toEqual({ live: asNew, asNew: ['ag-Grid-AutoColumn-1:200:-'] });
        });

        test('a moved group column is placed as a new one under maintainColumnOrder, as in a new grid', () => {
            const y: ColDef = { headerName: 'Y', valueGetter: (p) => p.data?.country, rowGroup: true, hide: true };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { ...a },
                    { headerName: 'X', valueGetter: (p) => p.data?.sport, rowGroup: true, hide: true },
                    { field: 'gold' },
                    { field: 'silver' },
                    { headerName: 'Gone' },
                ],
                rowData,
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder: true,
            });
            api.moveColumns(['ag-Grid-AutoColumn-1'], 3);
            expect(api.getAllDisplayedColumns().map((col) => col.getColId())[1]).toBe('ag-Grid-AutoColumn-1');

            api.setGridOption('columnDefs', [y, { ...a }, { field: 'gold' }, { field: 'silver' }]);
            const live = state(api.getAllDisplayedColumns());
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', {
                columnDefs: [{ ...a }, y, { field: 'gold' }, { field: 'silver' }],
                rowData,
                groupDisplayType: 'multipleColumns',
            });
            const asNew = state(fresh.getAllDisplayedColumns());
            expect({ live, asNew }).toEqual({
                live: asNew,
                asNew: ['ag-Grid-AutoColumn-1:200:-', 'gold:200:-', 'silver:200:-'],
            });
        });

        test('pivot result columns of a value column start with their default width, sort and order, as in a new grid', () => {
            const w: ColDef = { headerName: 'W', valueGetter: (p) => p.data?.silver, aggFunc: 'sum' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { ...a },
                    { headerName: 'V', valueGetter: (p) => p.data?.gold, aggFunc: 'sum' },
                    { field: 'country', pivot: true },
                    { headerName: 'Gone' },
                ],
                rowData,
                pivotMode: true,
                maintainColumnOrder: true,
            });
            api.applyColumnState({ state: [{ colId: 'pivot_country_France_1', width: 333, sort: 'desc' }] });
            api.moveColumns(['pivot_country_France_1'], api.getAllDisplayedColumns().length - 1);

            api.setGridOption('columnDefs', [w, { ...a }, { field: 'country', pivot: true }]);
            const live = state(api.getAllDisplayedColumns());
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', {
                columnDefs: [{ ...a }, w, { field: 'country', pivot: true }],
                rowData,
                pivotMode: true,
            });
            const asNew = state(fresh.getAllDisplayedColumns());
            expect({ live, asNew }).toEqual({
                live: asNew,
                asNew: ['pivot_country_France_1:200:-', 'pivot_country_Italy_1:200:-'],
            });
        });
    });

    describe('service wrapper cache lifecycle', () => {
        test('disabling rowSelection destroys the cached selection-col wrapper', async () => {
            const api = gridsManager.createGrid('selWrapperDestroy', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });
            await asyncSetTimeout(0);

            const sel = api.getColumn('ag-Grid-SelectionColumn');
            expect(sel).not.toBeNull();

            api.setGridOption('rowSelection', undefined);
            await asyncSetTimeout(0);

            expect(api.getColumn('ag-Grid-SelectionColumn')).toBeNull();
            expect((sel as any).isAlive()).toBe(false);

            await new GridColumns(api, 'after disabling rowSelection').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('autoColService groupDisplayType=custom suppresses auto col', () => {
        test('with groupDisplayType=custom, no auto-group col is created', async () => {
            const api = gridsManager.createGrid('customGroupDisplay', {
                columnDefs: [{ colId: 'country', rowGroup: true }, { colId: 'value' }],
                rowData: [
                    { country: 'USA', value: 1 },
                    { country: 'UK', value: 2 },
                ],
                groupDisplayType: 'custom',
            });
            await asyncSetTimeout(0);

            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country']);

            await new GridColumns(api, 'groupDisplayType=custom — no auto col').checkColumns(`
                CENTER
                ├── country width:200 rowGroup
                └── value width:200
            `);
        });
    });

    describe('pinned-edge and stale-left invariants across refresh', () => {
        test('lastLeftPinned flag cleared when col is unpinned via API', async () => {
            const api = gridsManager.createGrid('lastLeftClear', {
                columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b', pinned: 'left' }, { colId: 'c' }],
            });
            await asyncSetTimeout(0);

            const b = api.getColumn('b') as any;
            expect(b.isLastLeftPinned()).toBe(true);

            api.setColumnsPinned(['b'], null);
            await asyncSetTimeout(0);

            expect(b.isLastLeftPinned()).toBe(false);
            expect((api.getColumn('a') as any).isLastLeftPinned()).toBe(true);

            await new GridColumns(api, 'last-left flag transitions after API unpin').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                ├── b width:200
                └── c width:200
            `);
        });

        test('firstRightPinned flag cleared when col is unpinned via API', async () => {
            const api = gridsManager.createGrid('firstRightClear', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', pinned: 'right' }, { colId: 'c', pinned: 'right' }],
            });
            await asyncSetTimeout(0);

            const b = api.getColumn('b') as any;
            expect(b.isFirstRightPinned()).toBe(true);

            api.setColumnsPinned(['b'], null);
            await asyncSetTimeout(0);

            expect(b.isFirstRightPinned()).toBe(false);
            expect((api.getColumn('c') as any).isFirstRightPinned()).toBe(true);

            await new GridColumns(api, 'first-right flag transitions after API unpin').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
                RIGHT
                └── c width:200
            `);
        });

        test('col hidden across refresh has its left reset to null', async () => {
            const api = gridsManager.createGrid('leftResetOnHide', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 100 },
                    { colId: 'c', width: 100 },
                ],
            });
            await asyncSetTimeout(0);

            const b = api.getColumn('b') as any;
            expect(b.getLeft()).toBe(100);

            api.setColumnsVisible(['b'], false);
            await asyncSetTimeout(0);

            expect(b.getLeft()).toBeNull();
            await new GridColumns(api, 'col hidden; left reset').checkColumns(`
                CENTER
                ├── a width:100
                └── c width:100
            `);
        });

        test('col removed via columnDefs change has lastLeftPinned cleared (no stale flag on destroyed bean)', async () => {
            const api = gridsManager.createGrid('removedAfterPin', {
                columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b', pinned: 'left' }, { colId: 'c' }],
            });
            await asyncSetTimeout(0);
            const b = api.getColumn('b') as any;
            expect(b.isLastLeftPinned()).toBe(true);

            api.setGridOption('columnDefs', [{ colId: 'a', pinned: 'left' }, { colId: 'c' }]);
            await asyncSetTimeout(0);

            expect(api.getColumn('b')).toBeNull();
            expect((api.getColumn('a') as any).isLastLeftPinned()).toBe(true);
            expect(b.isLastLeftPinned()).toBe(false);
            await new GridColumns(api, 'col removed; pinned-edge flag cleared on destroyed bean').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── c width:200
            `);
        });
    });

    describe('treeData auto-col lifecycle', () => {
        test('treeData=true creates auto-group col without rowGroup colDef', async () => {
            const api = gridsManager.createGrid('treeDataAuto', {
                columnDefs: [{ field: 'jobTitle' }, { field: 'employmentType' }],
                rowData: [
                    { orgHierarchy: ['Erica'], jobTitle: 'CEO', employmentType: 'Permanent' },
                    { orgHierarchy: ['Erica', 'Malcolm'], jobTitle: 'VP', employmentType: 'Permanent' },
                ],
                treeData: true,
                getDataPath: (data: any) => data.orgHierarchy,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(0);

            expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();

            await new GridColumns(api, 'treeData auto col').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── jobTitle "Job Title" width:200
                └── employmentType "Employment Type" width:200
            `);
        });
    });

    // Coverage for VisibleColsService.joinCols autoHeight + flex flag paths. The internal
    // accumulators (autoHeightCols / lastFlexIndex) aren't exposed via public API; these tests
    // exercise the loop branches via setup and assert observable downstream behaviour.
    describe('joinCols accumulators', () => {
        test('grid with autoHeight col + flex col renders without errors', async () => {
            // Exercises the `col.colDef.autoHeight` push branch AND the centre-flex detection
            // branch in joinCols. The mere fact that refresh completes (no errors) confirms the
            // branches ran; the structural snapshot doubles as a sanity check.
            const api = gridsManager.createGrid('autoHeightFlex', {
                columnDefs: [{ colId: 'tall', autoHeight: true }, { colId: 'short' }, { colId: 'flexCol', flex: 1 }],
            });
            await asyncSetTimeout(0);
            await new GridColumns(api, 'autoHeight + flex cols built').checkColumns(`
                CENTER
                ├── tall width:200
                ├── short width:200
                └── flexCol width:600 flex:1
            `);
        });

        test('flex col pinned does NOT set lastFlexIndex (joinCols `col.pinned == null` guard)', async () => {
            // Pinned flex col → the joinCols guard `col.pinned == null` skips the flex check.
            // Without crashing under flex-then-reveal logic the guard is exercised.
            const api = gridsManager.createGrid('flexPinned', {
                columnDefs: [{ colId: 'a', pinned: 'left', flex: 1 }, { colId: 'b' }],
            });
            await asyncSetTimeout(0);
            await new GridColumns(api, 'pinned flex col').checkColumns(`
                LEFT
                └── a width:200 flex:1
                CENTER
                └── b width:200
            `);
        });
    });
});
