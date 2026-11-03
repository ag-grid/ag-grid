/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, Column, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowAutoHeightModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

describe('Column Mutations', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            PivotModule,
            RowAutoHeightModule,
            RowGroupingModule,
            RowNumbersModule,
            RowSelectionModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('column order preservation across service-col recreation', () => {
        test('rowSelection toggled on after user reorder: selection col at head, user order kept', async () => {
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

            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true });

            await new GridColumns(api, 'after selection enabled').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('rowNumbers toggled on after user reorder: rowNumbers col at head, user order kept', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            api.moveColumns(['c'], 0);

            api.setGridOption('rowNumbers', true);

            await new GridColumns(api, 'after rowNumbers enabled').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('auto-group col added after user reorder: auto col at head, user order kept', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            api.moveColumns(['c'], 0);

            api.setGridOption('columnDefs', [{ colId: 'a', rowGroup: true }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'after row grouping enabled').checkColumns(`
                CENTER
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

        test('multiple service cols added simultaneously appear at head in fixed order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            api.moveColumns(['c'], 0);

            api.setGridOption('columnDefs', [{ colId: 'a', rowGroup: true }, { colId: 'b' }, { colId: 'c' }]);
            api.setGridOption('rowNumbers', true);
            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true });

            // Display order at head: rowNumber (left-pinned) → selection (left-pinned in center
            // bucket) → autoGroup → user-reorder preserved.
            await new GridColumns(api, 'all service cols enabled').checkColumns(`
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

            const rgIds = api.getRowGroupColumns().map((c) => c.getColId());
            const dateIdx = rgIds.indexOf('date');
            const yearIdx = rgIds.findIndex((id) => id.includes('-date-year'));
            const monthIdx = rgIds.findIndex((id) => id.includes('-date-month'));

            expect(dateIdx).toBeGreaterThanOrEqual(0);
            expect(yearIdx).toBeGreaterThanOrEqual(0);
            expect(monthIdx).toBeGreaterThanOrEqual(0);
            expect(yearIdx).toBeLessThan(monthIdx);
            expect(monthIdx).toBeLessThan(dateIdx);
            expect(new Set(rgIds).size).toBe(rgIds.length);
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

        test('a column without colId or field replaced by another groups by its own hierarchy, as in a new grid', () => {
            const rowData = [{ date: new Date(2020, 0, 1), other: new Date(2021, 5, 1) }];
            const defs: ColDef[] = [
                { headerName: 'E', valueGetter: (p) => p.data?.other, groupHierarchy: ['year'], enableRowGroup: true },
                { headerName: 'D', valueGetter: (p) => p.data?.date },
            ];
            const read = (api: GridApi) => {
                api.setRowGroupColumns(['0']);
                const groups: string[] = [];
                api.forEachNode((node) => {
                    if (!node.group) {
                        return;
                    }
                    groups.push(node.key!);
                });
                const year = api.getColumns()!.find((col) => col.getColId() === 'ag-Grid-HierarchyColumn-0-year');
                return { groups, width: year?.getActualWidth() };
            };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'D',
                        valueGetter: (p) => p.data?.date,
                        groupHierarchy: ['year'],
                        enableRowGroup: true,
                    },
                ],
                rowData,
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-HierarchyColumn-0-year', width: 333 }] });
            api.setGridOption('columnDefs', defs);
            const live = read(api);
            gridsManager.reset();

            const fresh = read(gridsManager.createGrid('myGrid', { columnDefs: defs, rowData }));
            expect(live).toEqual(fresh);
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

    describe('hierarchy columns when the hierarchy changes', () => {
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
    });

    describe('columns generated from a column without colId or field replaced by another', () => {
        const rowData = [
            { sport: 'Rowing', country: 'Italy', gold: 1, silver: 7 },
            { sport: 'Swimming', country: 'France', gold: 2, silver: 8 },
        ];
        const state = (cols: Column[] | null) =>
            (cols ?? []).map((col) => `${col.getColId()}:${col.getActualWidth()}:${col.getSort() ?? '-'}`);

        test('the group column of its hierarchy column starts with its default width and sort, as in a new grid', () => {
            const dates = [{ date: new Date(2020, 0, 1), other: new Date(2021, 5, 1) }];
            const defs: ColDef[] = [
                { headerName: 'E', valueGetter: (p) => p.data?.other, groupHierarchy: ['year'], rowGroup: true },
                { headerName: 'D', valueGetter: (p) => p.data?.date },
            ];
            const group = 'ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-0-year';
            const read = (api: GridApi) =>
                state(api.getAllDisplayedColumns().filter((col) => col.getColId() === group));
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'D',
                        valueGetter: (p) => p.data?.date,
                        groupHierarchy: ['year'],
                        rowGroup: true,
                    },
                ],
                rowData: dates,
                groupDisplayType: 'multipleColumns',
            });
            expect(read(api)).toEqual([`${group}:200:-`]);
            api.applyColumnState({ state: [{ colId: group, width: 333, sort: 'desc' }] });

            api.setGridOption('columnDefs', defs);
            const live = read(api);
            gridsManager.reset();

            const fresh = read(
                gridsManager.createGrid('myGrid', {
                    columnDefs: defs,
                    rowData: dates,
                    groupDisplayType: 'multipleColumns',
                })
            );
            expect(live).toEqual(fresh);
        });

        test('a group column starts with its default width and sort, as in a new grid', () => {
            const defs: ColDef[] = [
                { headerName: 'Y', valueGetter: (p) => p.data?.country, rowGroup: true, hide: true },
                { headerName: 'X', valueGetter: (p) => p.data?.sport, hide: true },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'X', valueGetter: (p) => p.data?.sport, rowGroup: true, hide: true }],
                rowData,
                groupDisplayType: 'multipleColumns',
            });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn-0', width: 333, sort: 'desc' }] });

            api.setGridOption('columnDefs', defs);
            const live = state(api.getAllDisplayedColumns());
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', {
                columnDefs: defs,
                rowData,
                groupDisplayType: 'multipleColumns',
            });
            expect(live).toEqual(state(fresh.getAllDisplayedColumns()));
        });

        test('a moved group column is placed as a new one under maintainColumnOrder, as in a new grid', () => {
            const defs: ColDef[] = [
                { headerName: 'Y', valueGetter: (p) => p.data?.country, rowGroup: true, hide: true },
                { headerName: 'X', valueGetter: (p) => p.data?.sport, hide: true },
                { field: 'gold' },
                { field: 'silver' },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'X', valueGetter: (p) => p.data?.sport, rowGroup: true, hide: true },
                    { field: 'gold' },
                    { field: 'silver' },
                ],
                rowData,
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder: true,
            });
            api.moveColumns(['ag-Grid-AutoColumn-0'], 2);
            expect(api.getAllDisplayedColumns().map((col) => col.getColId())[1]).toBe('ag-Grid-AutoColumn-0');

            api.setGridOption('columnDefs', defs);
            const live = state(api.getAllDisplayedColumns());
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', {
                columnDefs: defs,
                rowData,
                groupDisplayType: 'multipleColumns',
            });
            expect(live).toEqual(state(fresh.getAllDisplayedColumns()));
        });

        test('pivot result columns of a value column start with their default width, sort and order, as in a new grid', () => {
            const defs: ColDef[] = [
                { headerName: 'W', valueGetter: (p) => p.data?.silver, aggFunc: 'sum' },
                { headerName: 'V', valueGetter: (p) => p.data?.gold },
                { field: 'country', pivot: true },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'V', valueGetter: (p) => p.data?.gold, aggFunc: 'sum' },
                    { field: 'country', pivot: true },
                ],
                rowData,
                pivotMode: true,
                maintainColumnOrder: true,
            });
            api.applyColumnState({ state: [{ colId: 'pivot_country_France_0', width: 333, sort: 'desc' }] });
            api.moveColumns(['pivot_country_France_0'], api.getAllDisplayedColumns().length - 1);

            api.setGridOption('columnDefs', defs);
            const live = state(api.getAllDisplayedColumns());
            gridsManager.reset();

            const fresh = gridsManager.createGrid('myGrid', { columnDefs: defs, rowData, pivotMode: true });
            expect(live).toEqual(state(fresh.getAllDisplayedColumns()));
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
