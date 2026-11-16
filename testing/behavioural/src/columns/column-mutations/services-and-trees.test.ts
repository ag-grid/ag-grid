/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { vi } from 'vitest';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    RowAutoHeightModule,
    RowSelectionModule,
    enableDevValidations,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

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

        test('column state puts hierarchy columns grouped out of declared order back before their source, in declared order', () => {
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
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
                'date',
            ]);
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

        test.each(['source first'])(
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

        test.each([
            [
                'while another column gains a hierarchy',
                [{ field: 'other', enableRowGroup: true, groupHierarchy: ['month'] }],
            ],
        ] as [string, ColDef[]][])(
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
    });

    describe('a user column given the selection column’s colId', () => {
        test('gets another id, so every column id stays unique', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowSelection: { mode: 'multiRow' },
            });
            const selectionColumn = api.getColumn('ag-Grid-SelectionColumn');
            const gridColIds = (): string[] => api.getAllGridColumns().map((c) => c.getColId());
            expect(gridColIds()).toEqual(['ag-Grid-SelectionColumn', 'a']);

            api.setGridOption('columnDefs', [{ field: 'a' }, { colId: 'ag-Grid-SelectionColumn', headerName: 'Mine' }]);

            const ids = gridColIds();
            expect(ids.length).toBe(3);
            expect(new Set(ids).size).toBe(3);
            expect(api.getColumn('ag-Grid-SelectionColumn')).toBe(selectionColumn);
            expect(api.getColumns()!.map((c) => c.getColDef().headerName === 'Mine')).toEqual([false, true]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('keeps its column when its definition is set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: the colId is taken
            const colId = 'ag-Grid-SelectionColumn';
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                rowSelection: { mode: 'multiRow' },
            });
            api.setGridOption('columnDefs', [{ colId, headerName: 'A' }]);
            const column = api.getColumn(`${colId}_1`)!;

            api.setGridOption('columnDefs', [{ colId, headerName: 'A' }]);

            expect(api.getColumn(`${colId}_1`)).toBe(column);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
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
