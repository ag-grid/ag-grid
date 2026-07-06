/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import { vi } from 'vitest';

import type { ColDef, ColGroupDef, Column } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, RowSelectionModule, TooltipModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, getGridHTMLElement } from '../../test-utils';

describe('Column Mutations', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            CellSpanModule,
            ClientSideRowModelModule,
            PivotModule,
            RowGroupingModule,
            RowNumbersModule,
            RowSelectionModule,
            TooltipModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('setColumnDefs: instance preservation', () => {
        test('column instances are reused when colId matches', async () => {
            const columnDefs1: ColDef[] = [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 200 },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: columnDefs1 });

            // Capture column references
            const colA1 = api.getColumn('a')!;
            const colB1 = api.getColumn('b')!;
            expect(colA1).toBeTruthy();
            expect(colB1).toBeTruthy();

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a width:100
                └── b width:200
            `);

            // Capture grid-level events fired by setGridOption(columnDefs) + col-level colDefChanged.
            const newColsLoadedEvents: any[] = [];
            const gridColsChangedEvents: any[] = [];
            const colEverythingEvents: any[] = [];
            const colDefChangedEvents: any[] = [];
            api.addEventListener('newColumnsLoaded', (e) => newColsLoadedEvents.push(e));
            api.addEventListener('gridColumnsChanged', (e) => gridColsChangedEvents.push(e));
            api.addEventListener('columnEverythingChanged', (e) => colEverythingEvents.push(e));
            (colA1 as any).__addEventListener('colDefChanged', (e: any) => colDefChangedEvents.push(e));

            // Update columnDefs with same colIds but different widths
            const columnDefs2: ColDef[] = [
                { colId: 'a', width: 300 },
                { colId: 'b', width: 400 },
            ];
            api.setGridOption('columnDefs', columnDefs2);
            await asyncSetTimeout(0);

            // Same instances should be reused
            const colA2 = api.getColumn('a')!;
            const colB2 = api.getColumn('b')!;
            expect(colA2).toBe(colA1);
            expect(colB2).toBe(colB1);

            await new GridColumns(api, 'after update').checkColumns(`
                CENTER
                ├── a width:300
                └── b width:400
            `);

            expect(newColsLoadedEvents.length).toBeGreaterThan(0);
            expect(colEverythingEvents.length).toBeGreaterThan(0);
            expect(Array.isArray(gridColsChangedEvents)).toBe(true);
            expect(colDefChangedEvents.length).toBeGreaterThan(0);

            const countAfterRealChange = colDefChangedEvents.length;
            api.setGridOption('columnDefs', [
                { colId: 'a', width: 300 },
                { colId: 'b', width: 400 },
            ]);
            await asyncSetTimeout(0);
            expect(colDefChangedEvents.length).toBe(countAfterRealChange);
        });

        test('column instances are replaced when colId is removed and re-added', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            const colB1 = api.getColumn('b')!;

            // Remove b, then re-add it
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'c' }]);

            await new GridColumns(api, 'b removed').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);

            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            // b should be a NEW instance since it was destroyed and recreated
            const colB2 = api.getColumn('b')!;
            expect(colB2).not.toBe(colB1);

            await new GridColumns(api, 'b re-added').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('column state is preserved when setColumnDefs with same colIds', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            // Apply state: sort a, pin b, hide c
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc' },
                    { colId: 'b', pinned: 'left' },
                    { colId: 'c', hide: true },
                ],
            });

            await new GridColumns(api, 'state applied').checkColumns(`
                LEFT
                └── b width:200
                CENTER
                └── a width:200 sort:asc
            `);

            // Update columnDefs — state should be preserved for matching colIds
            api.setGridOption('columnDefs', [
                { colId: 'a', headerName: 'Alpha' },
                { colId: 'b', headerName: 'Beta' },
                { colId: 'c', headerName: 'Gamma' },
            ]);

            await new GridColumns(api, 'state preserved').checkColumns(`
                LEFT
                └── b "Beta" width:200
                CENTER
                └── a "Alpha" width:200 sort:asc
            `);
        });
    });

    describe('setColumnDefs: structural changes', () => {
        test('switch from flat columns to grouped columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            await new GridColumns(api, 'flat').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Switch to grouped structure
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Group 1',
                    children: [{ colId: 'a' }, { colId: 'b' }],
                },
                { colId: 'c' },
            ]);

            await new GridColumns(api, 'grouped').checkColumns(`
                CENTER
                ├─┬ "Group 1" GROUP
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);
        });

        test('switch from grouped columns to flat columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Group 1',
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                    { colId: 'c' },
                ],
            });

            await new GridColumns(api, 'grouped').checkColumns(`
                CENTER
                ├─┬ "Group 1" GROUP
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);

            // Switch to flat structure
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'flat').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('move a column out of its group while sibling groups remain', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                    {
                        groupId: 'g2',
                        children: [{ colId: 'c' }, { colId: 'd' }],
                    },
                ],
            });

            await new GridColumns(api, 'initial 2 groups').checkColumns(`
                CENTER
                ├─┬ GROUP
                │ ├── a width:200
                │ └── b width:200
                └─┬ GROUP
                  ├── c width:200
                  └── d width:200
            `);

            // Promote `b` to top-level while g1 and g2 remain — exercises the run-emitter's
            // top-level branch that clears a stale `parent` on a previously-grouped col.
            api.setGridOption('columnDefs', [
                {
                    groupId: 'g1',
                    children: [{ colId: 'a' }],
                },
                { colId: 'b' },
                {
                    groupId: 'g2',
                    children: [{ colId: 'c' }, { colId: 'd' }],
                },
            ]);

            await new GridColumns(api, 'b promoted').checkColumns(`
                CENTER
                ├─┬ GROUP
                │ └── a width:200
                ├── b width:200
                └─┬ GROUP
                  ├── c width:200
                  └── d width:200
            `);
        });

        test('add new columns to existing grid', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            await new GridColumns(api, 'initial 2 cols').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);

            // Add column c at the end
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'added c').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('remove columns from existing grid', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            // Remove middle column
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'c' }]);

            await new GridColumns(api, 'b removed').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);

            expect(api.getColumn('b')).toBeNull();
        });

        test('completely replace all columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }]);

            await new GridColumns(api, 'replaced').checkColumns(`
                CENTER
                ├── x width:200
                ├── y width:200
                └── z width:200
            `);

            // Old columns should not exist
            expect(api.getColumn('a')).toBeNull();
            expect(api.getColumn('b')).toBeNull();
        });

        test('change group nesting depth', async () => {
            // Start with 1 level of grouping
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'G1', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
            });

            await new GridColumns(api, 'depth 1').checkColumns(`
                CENTER
                ├─┬ "G1" GROUP
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);

            // Change to 2 levels of nesting
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Outer',
                    children: [{ headerName: 'Inner', children: [{ colId: 'a' }] }, { colId: 'b' }],
                },
                { colId: 'c' },
            ]);

            await new GridColumns(api, 'depth 2').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ ├─┬ "Inner" GROUP
                │ │ └── a width:200
                │ └── b width:200
                └── c width:200
            `);

            // Back to flat
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'flat again').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });
    });

    describe('column groups structural mutations', () => {
        test('add group around existing columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.setGridOption('columnDefs', [
                { headerName: 'AB', children: [{ colId: 'a' }, { colId: 'b' }] },
                { colId: 'c' },
            ]);

            await new GridColumns(api, 'group added').checkColumns(`
                CENTER
                ├─┬ "AB" GROUP
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);
        });

        test('remove group, keeping columns flat', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'AB', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
            });

            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'group removed').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('move column between groups', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'G1', children: [{ colId: 'a' }, { colId: 'b' }] },
                    { headerName: 'G2', children: [{ colId: 'c' }] },
                ],
            });

            await new GridColumns(api, 'initial groups').checkColumns(`
                CENTER
                ├─┬ "G1" GROUP
                │ ├── a width:200
                │ └── b width:200
                └─┬ "G2" GROUP
                  └── c width:200
            `);

            // Move b from G1 to G2
            api.setGridOption('columnDefs', [
                { headerName: 'G1', children: [{ colId: 'a' }] },
                { headerName: 'G2', children: [{ colId: 'b' }, { colId: 'c' }] },
            ]);

            await new GridColumns(api, 'b moved to G2').checkColumns(`
                CENTER
                ├─┬ "G1" GROUP
                │ └── a width:200
                └─┬ "G2" GROUP
                  ├── b width:200
                  └── c width:200
            `);
        });

        test('add expandable group with columnGroupShow', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            // Change to expandable group
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Expandable',
                    children: [
                        { colId: 'a' },
                        { colId: 'b', columnGroupShow: 'open' },
                        { colId: 'c', columnGroupShow: 'closed' },
                    ],
                },
            ]);

            await new GridColumns(api, 'expandable group added').checkColumns(`
                CENTER
                └─┬ "Expandable" GROUP closed
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open hidden
                  └── c width:200 columnGroupShow:closed
            `);
        });
    });

    describe('getAllGridColumns vs getAllDisplayedColumns consistency', () => {
        test('hidden columns are in getAllGridColumns but not getAllDisplayedColumns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }],
            });

            const allGrid = api.getAllGridColumns();
            const allDisplayed = api.getAllDisplayedColumns();

            expect(allGrid.length).toBe(3);
            expect(allDisplayed.length).toBe(2);

            // b should be in allGrid but not allDisplayed
            expect(allGrid.map((c: Column) => c.getColId())).toContain('b');
            expect(allDisplayed.map((c: Column) => c.getColId())).not.toContain('b');

            // Validators should pass for the displayed columns
            await new GridColumns(api, 'with hidden col').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });

        test('getColumnState includes hidden columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }],
            });

            const state = api.getColumnState();
            expect(state.length).toBe(3);
            expect(state.find((s: any) => s.colId === 'b')?.hide).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });
    });

    describe('defaultColDef mutations', () => {
        test('changing defaultColDef recreates column definitions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                defaultColDef: { width: 100 },
            });

            await new GridColumns(api, 'width 100').checkColumns(`
                CENTER
                ├── a width:100
                └── b width:100
            `);

            // Change default width
            api.setGridOption('defaultColDef', { width: 300 });

            await new GridColumns(api, 'width 300').checkColumns(`
                CENTER
                ├── a width:300
                └── b width:300
            `);
        });

        test('defaultColDef sortable affects all columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                defaultColDef: { sortable: true },
            });

            // Both columns should be sortable
            expect(api.getColumn('a')!.isSortable()).toBe(true);
            expect(api.getColumn('b')!.isSortable()).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('in-place colDef mutations (same ref)', () => {
        test('mutating headerName in place is picked up on refresh', async () => {
            const colA: any = { colId: 'a', headerName: 'A' };
            const colB: any = { colId: 'b', headerName: 'B' };
            const cols = [colA, colB];
            const api = gridsManager.createGrid('myGrid', { columnDefs: cols });

            expect(api.getColumn('a')!.getColDef().headerName).toBe('A');
            await new GridColumns(api, 'initial headerNames').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);

            colA.headerName = 'A renamed';
            api.setGridOption('columnDefs', cols);

            expect(api.getColumn('a')!.getColDef().headerName).toBe('A renamed');
            expect(api.getColumn('b')!.getColDef().headerName).toBe('B');
            await new GridColumns(api, 'colA headerName mutated').checkColumns(`
                CENTER
                ├── a "A renamed" width:200
                └── b "B" width:200
            `);
        });

        test('mutating width in place is picked up on refresh', async () => {
            const colA: any = { colId: 'a', width: 100 };
            const cols = [colA];
            const api = gridsManager.createGrid('myGrid', { columnDefs: cols });

            expect(api.getColumn('a')!.getActualWidth()).toBe(100);
            await new GridColumns(api, 'initial width 100').checkColumns(`
                CENTER
                └── a width:100
            `);

            colA.width = 250;
            api.setGridOption('columnDefs', cols);

            expect(api.getColumn('a')!.getActualWidth()).toBe(250);
            await new GridColumns(api, 'width mutated to 250').checkColumns(`
                CENTER
                └── a width:250
            `);
        });

        test('adding a property in place is picked up on refresh', async () => {
            const colA: any = { colId: 'a' };
            const cols = [colA];
            const api = gridsManager.createGrid('myGrid', { columnDefs: cols });

            expect(api.getColumn('a')!.getColDef().headerTooltip).toBeUndefined();
            await new GridColumns(api, 'before adding headerTooltip').checkColumns(`
                CENTER
                └── a width:200
            `);

            colA.headerTooltip = 'added';
            api.setGridOption('columnDefs', cols);

            expect(api.getColumn('a')!.getColDef().headerTooltip).toBe('added');
            await new GridColumns(api, 'after adding headerTooltip').checkColumns(`
                CENTER
                └── a width:200
            `);
        });

        test('removing a property in place is picked up on refresh', async () => {
            const colA: any = { colId: 'a', headerName: 'A', headerTooltip: 'tip' };
            const cols = [colA];
            const api = gridsManager.createGrid('myGrid', { columnDefs: cols });

            expect(api.getColumn('a')!.getColDef().headerTooltip).toBe('tip');
            await new GridColumns(api, 'with headerTooltip').checkColumns(`
                CENTER
                └── a "A" width:200
            `);

            delete colA.headerTooltip;
            api.setGridOption('columnDefs', cols);

            expect(api.getColumn('a')!.getColDef().headerTooltip).toBeUndefined();
            await new GridColumns(api, 'headerTooltip removed').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });

        test('mutating spanRows in place is picked up by the row-span service', async () => {
            const colA: any = { colId: 'a' };
            const cols = [colA];
            const api = gridsManager.createGrid('myGrid', { columnDefs: cols, enableCellSpan: true });
            await new GridColumns(api, `mutating spanRows in place is picked up by the row-span service setup`)
                .checkColumns(`
                    CENTER
                    └── a width:200
                `);
            await new GridRows(api, `mutating spanRows in place is picked up by the row-span service setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')!.getColDef().spanRows).toBeUndefined();

            colA.spanRows = true;
            api.setGridOption('columnDefs', cols);
            await new GridColumns(
                api,
                `mutating spanRows in place is picked up by the row-span service after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └── a width:200 spanRows
            `);
            await new GridRows(
                api,
                `mutating spanRows in place is picked up by the row-span service after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')!.getColDef().spanRows).toBe(true);
        });
    });

    describe('column tree reuse edge cases', () => {
        test('two cols sharing the same field both materialise (one keeps field, other gets unique colId)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'sport' }, { field: 'sport' }],
            });

            await new GridColumns(api, 'duplicate fields produce two distinct cols').checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                └── sport_1 "Sport" width:200
            `);
        });

        test('new colId matching prior groupId produces a fresh leaf, not a stale group child', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'x', children: [{ colId: 'leaf1' }, { colId: 'leaf2' }] }],
            });

            await new GridColumns(api, 'before: group x with leaves').checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── leaf1 width:200
                  └── leaf2 width:200
            `);

            // Replace with a single flat col whose colId collides with the old groupId.
            api.setGridOption('columnDefs', [{ colId: 'x', field: 'foo' }]);
            await asyncSetTimeout(0);

            await new GridColumns(api, 'after: flat col x replaces group').checkColumns(`
                CENTER
                └── x "Foo" width:200
            `);
            expect(api.getColumn('x')!.getColDef().field).toBe('foo');
        });
    });

    describe('column group instance reuse across pinned sections', () => {
        test('group with a leaf that unpins has no stale left-pinned wrapper afterwards', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', children: [{ colId: 'a', pinned: 'left' }] }],
            });
            await asyncSetTimeout(0);

            await new GridColumns(api, 'before: leaf a pinned left').checkColumns(`
                LEFT
                └─┬ GROUP
                  └── a width:200
            `);

            api.applyColumnState({ state: [{ colId: 'a', pinned: null }] });
            await asyncSetTimeout(0);

            // The leaf moved to centre; there must be no left-pinned wrapper for group 'g' left.
            await new GridColumns(api, 'after: leaf a unpinned, group sits in centre only').checkColumns(`
                CENTER
                └─┬ GROUP
                  └── a width:200
            `);
        });
    });

    describe('all-leaves padded chain wiring', () => {
        test('mixed-depth siblings: naked leaf in a mixed level gets padded ancestor', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'G',
                        children: [{ headerName: 'Inner', children: [{ colId: 'a' }, { colId: 'b' }] }],
                    },
                    { colId: 'c' },
                ],
            });
            await asyncSetTimeout(0);

            // `c` sits at level 0 while the other branch has depth 2 → c must be wrapped in a
            // padded chain so the tree is balanced. Snapshot shows the padded wrapper visually.
            await new GridColumns(api, 'naked c padded under same depth as Inner').checkColumns(`
                CENTER
                ├─┬ "G" GROUP
                │ └─┬ "Inner" GROUP
                │   ├── a width:200
                │   └── b width:200
                └── c width:200
            `);
        });
    });

    describe('column group run-merging', () => {
        test('two adjacent siblings sharing the same originalParent fold under one display wrapper', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'outer',
                        children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                    },
                ],
            });
            await new GridColumns(
                api,
                `two adjacent siblings sharing the same originalParent fold under one display wra setup`
            ).checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── a width:200
                  ├── b width:200
                  └── c width:200
            `);
            await new GridRows(
                api,
                `two adjacent siblings sharing the same originalParent fold under one display wra setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const groups = api.getAllDisplayedColumnGroups()!;
            const outerWrappers: any[] = [];
            const walk = (nodes: any[]) => {
                for (const n of nodes) {
                    if (n.getGroupId?.() === 'outer') {
                        outerWrappers.push(n);
                    }
                    if (n.getChildren) {
                        walk(n.getChildren() ?? []);
                    }
                }
            };
            walk(groups);
            expect(outerWrappers.length).toBe(1);
            expect(outerWrappers[0].getDisplayedChildren()!.length).toBe(3);
            await new GridRows(
                api,
                `two adjacent siblings sharing the same originalParent fold under one display wra final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('column tree building edge cases', () => {
        test('empty columnDefs creates empty column set', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
            });

            expect(api.getAllGridColumns().length).toBe(0);
            expect(api.getAllDisplayedColumns().length).toBe(0);
            await new GridColumns(api, 'empty').checkColumns('empty');
        });

        test('setColumnDefs with empty array clears all columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);

            api.setGridOption('columnDefs', []);

            expect(api.getAllGridColumns().length).toBe(0);
            await new GridColumns(api, 'cleared').checkColumns('empty');
        });

        test('setColumnDefs round-trip empty, populated, empty leaves no stale header DOM', async () => {
            const columnDefs = [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b' },
            ];
            const rowData = [
                { a: 'a1', b: 'b1' },
                { a: 'a2', b: 'b2' },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });

            const gridElement = getGridHTMLElement(api)!;
            const headerCellCount = () => gridElement.querySelectorAll('.ag-header-cell[col-id]').length;

            expect(headerCellCount()).toBe(2);
            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"a1" b:"b1"
                └── LEAF id:1 a:"a2" b:"b2"
            `);

            api.setGridOption('columnDefs', []);
            expect(headerCellCount()).toBe(0);
            await new GridColumns(api, 'cleared').checkColumns('empty');
            await new GridRows(api, 'cleared').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `);

            api.setGridOption('columnDefs', columnDefs);
            expect(headerCellCount()).toBe(2);
            await new GridColumns(api, 're-added').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
            await new GridRows(api, 're-added').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"a1" b:"b1"
                └── LEAF id:1 a:"a2" b:"b2"
            `);

            api.setGridOption('columnDefs', []);
            expect(headerCellCount()).toBe(0);
            await new GridColumns(api, 'cleared again').checkColumns('empty');
            await new GridRows(api, 'cleared again').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `);
        });

        test('column tree depth is consistent across sections', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Group',
                        children: [{ colId: 'a', pinned: 'left' }, { colId: 'b' }],
                    },
                    { colId: 'c', pinned: 'right' },
                ],
            });

            // Tree balancing should ensure all columns are at same depth
            await new GridColumns(api, 'balanced tree').checkColumns(`
                LEFT
                └─┬ "Group" GROUP
                  └── a width:200
                CENTER
                └─┬ "Group" GROUP
                  └── b width:200
                RIGHT
                └── c width:200
            `);
        });

        test('column map is rebuilt after setColumnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            // Column map should have entries for a and b
            expect(api.getColumn('a')).not.toBeNull();
            expect(api.getColumn('b')).not.toBeNull();

            // Replace columns
            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }]);

            // Map should now have x and y, not a and b
            expect(api.getColumn('x')).not.toBeNull();
            expect(api.getColumn('y')).not.toBeNull();
            expect(api.getColumn('a')).toBeNull();
            expect(api.getColumn('b')).toBeNull();

            await new GridColumns(api, 'rebuilt map').checkColumns(`
                CENTER
                ├── x width:200
                └── y width:200
            `);
        });

        test('getAllGridColumns returns colsList + auto columns in correct order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'a' }, { colId: 'b' }],
                rowData: [],
            });

            const allGrid = api.getAllGridColumns();
            const colIds = allGrid.map((c: any) => c.getColId());

            // Auto-group column should be first, then user columns
            expect(colIds[0]).toBe('ag-Grid-AutoColumn');
            expect(colIds).toContain('group');
            expect(colIds).toContain('a');
            expect(colIds).toContain('b');

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                ├── a width:200
                └── b width:200
            `);
        });

        test('getColumns returns colDefList (user columns only)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });
            await new GridColumns(api, `getColumns returns colDefList (user columns only) setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
            await new GridRows(api, `getColumns returns colDefList (user columns only) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const cols = api.getColumns();
            const colIds = cols!.map((c: any) => c.getColId());

            // Only user-defined columns, no auto-group
            expect(colIds).toEqual(['group', 'value']);
            expect(colIds).not.toContain('ag-Grid-AutoColumn');
            await new GridRows(api, `getColumns returns colDefList (user columns only) final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('auto columns appear when row grouping is added via setColumnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [],
            });

            // No auto-group initially
            const allBefore = api.getAllGridColumns().map((c: any) => c.getColId());
            expect(allBefore).not.toContain('ag-Grid-AutoColumn');

            // Add row grouping via new columnDefs — auto-group column should appear
            api.setGridOption('columnDefs', [{ colId: 'a', rowGroup: true }, { colId: 'b' }]);

            const allAfter = api.getAllGridColumns().map((c: any) => c.getColId());
            expect(allAfter).toContain('ag-Grid-AutoColumn');

            await new GridColumns(api, 'with auto group').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                └── b width:200
            `);
        });

        test('auto columns removed when row grouping is cleared via removeRowGroupColumns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', rowGroup: true, enableRowGroup: true }, { colId: 'b' }],
                rowData: [],
            });

            // Auto-group present
            expect(api.getAllGridColumns().map((c: any) => c.getColId())).toContain('ag-Grid-AutoColumn');

            // Remove row grouping via API
            api.removeRowGroupColumns(['a']);

            // Auto-group should be gone
            const allFinal = api.getAllGridColumns().map((c: any) => c.getColId());
            expect(allFinal).not.toContain('ag-Grid-AutoColumn');

            await new GridColumns(api, 'no auto group').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('column order restored via restoreColOrder preserves user reordering', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // Reorder: c, a, b
            api.moveColumns(['c'], 0);

            expect(api.getAllDisplayedColumns().map((c: any) => c.getColId())).toEqual(['c', 'a', 'b']);

            // Update colDefs — order should be preserved
            api.setGridOption('columnDefs', [
                { colId: 'a', headerName: 'A2' },
                { colId: 'b', headerName: 'B2' },
                { colId: 'c', headerName: 'C2' },
            ]);

            expect(api.getAllDisplayedColumns().map((c: any) => c.getColId())).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'order preserved').checkColumns(`
                CENTER
                ├── c "C2" width:200
                ├── a "A2" width:200
                └── b "B2" width:200
            `);
        });

        test('locked columns are placed correctly after refreshCols', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', lockPosition: 'left' },
                    { colId: 'b' },
                    { colId: 'c', lockPosition: 'right' },
                ],
            });

            await new GridColumns(api, 'locked positions').checkColumns(`
                CENTER
                ├── a width:200 lockPosition:left
                ├── b width:200
                └── c width:200 lockPosition:right
            `);

            // Add a new column — locked positions should be maintained
            api.setGridOption('columnDefs', [
                { colId: 'a', lockPosition: 'left' },
                { colId: 'new' },
                { colId: 'b' },
                { colId: 'c', lockPosition: 'right' },
            ]);

            await new GridColumns(api, 'after adding column').checkColumns(`
                CENTER
                ├── a width:200 lockPosition:left
                ├── new width:200
                ├── b width:200
                └── c width:200 lockPosition:right
            `);
        });
    });

    describe('deeply nested column group depth', () => {
        test('tree depth reflects 4-level nested groups', async () => {
            const api = gridsManager.createGrid('deepGroups', {
                columnDefs: [
                    {
                        headerName: 'L1',
                        children: [
                            {
                                headerName: 'L2',
                                children: [
                                    {
                                        headerName: 'L3',
                                        children: [{ colId: 'leaf' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            await asyncSetTimeout(0);

            await new GridColumns(api, 'four-level nested groups').checkColumns(`
                CENTER
                └─┬ "L1" GROUP
                  └─┬ "L2" GROUP
                    └─┬ "L3" GROUP
                      └── leaf width:200
            `);
            const leaf = api.getColumn('leaf');
            expect(leaf).not.toBeNull();
        });
    });

    describe('balanceColumnTree padding (mixed-depth user trees)', () => {
        test('flat leaf and grouped leaf coexist at the same render depth', async () => {
            const api = gridsManager.createGrid('mixDepth', {
                columnDefs: [
                    { colId: 'flat' },
                    {
                        headerName: 'OuterGroup',
                        children: [{ colId: 'nested' }],
                    },
                ],
            });
            await asyncSetTimeout(0);

            await new GridColumns(api, 'flat + nested coexist').checkColumns(`
                CENTER
                ├── flat width:200
                └─┬ "OuterGroup" GROUP
                  └── nested width:200
            `);

            expect(api.getColumn('flat')).not.toBeNull();
            expect(api.getColumn('nested')).not.toBeNull();
        });

        test('autoGroupCol wraps to match user tree depth when rowGroup is added', async () => {
            const api = gridsManager.createGrid('autoColDepth', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    {
                        headerName: 'Stats',
                        children: [
                            {
                                headerName: 'Medals',
                                children: [{ colId: 'gold' }, { colId: 'silver' }],
                            },
                        ],
                    },
                ],
                rowData: [{ country: 'USA', gold: 1, silver: 2 }],
            });
            await asyncSetTimeout(0);

            await new GridColumns(api, 'auto col wrapped to deep tree').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                └─┬ "Stats" GROUP
                  └─┬ "Medals" GROUP
                    ├── gold width:200
                    └── silver width:200
            `);
            expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
        });
    });

    describe('group reuse by groupId across colDef changes', () => {
        test('AgProvidedColumnGroup with same groupId is reused after setColumnDefs', async () => {
            const api = gridsManager.createGrid('groupReuse', {
                columnDefs: [
                    {
                        headerName: 'G1',
                        groupId: 'g1',
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                ],
            });
            await asyncSetTimeout(0);

            const beforeCount = api.getAllGridColumns().length;
            api.setGridOption('columnDefs', [
                {
                    headerName: 'G1 Renamed',
                    groupId: 'g1',
                    children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                },
            ]);
            await asyncSetTimeout(0);

            const afterCount = api.getAllGridColumns().length;
            expect(afterCount).toBe(beforeCount + 1);
            expect(api.getColumn('c')).not.toBeNull();

            await new GridColumns(api, 'group reused with new child').checkColumns(`
                CENTER
                └─┬ "G1 Renamed" GROUP
                  ├── a width:200
                  ├── b width:200
                  └── c width:200
            `);
        });

        test('group with different groupId is treated as new instance (not reused)', async () => {
            const columnDefs1: ColGroupDef[] = [{ headerName: 'G1', groupId: 'old', children: [{ colId: 'a' }] }];
            const api = gridsManager.createGrid('groupIdMismatch', { columnDefs: columnDefs1 });
            await asyncSetTimeout(0);

            // Same structure but different groupId — should NOT be reused.
            api.setGridOption('columnDefs', [{ headerName: 'G1', groupId: 'new', children: [{ colId: 'a' }] }]);
            await asyncSetTimeout(0);

            await new GridColumns(api, 'new groupId').checkColumns(`
                CENTER
                └─┬ "G1" GROUP
                  └── a width:200
            `);
        });

        test('groupId-less group does not match by reference across setGridOption', async () => {
            // Without groupId, groups can never be reused — every setColumnDefs creates a fresh
            // AgProvidedColumnGroup. Verifies the existing-lookup correctly skips entries
            // without `colGroupDef.groupId`.
            const api = gridsManager.createGrid('noGroupId', {
                columnDefs: [{ headerName: 'G', children: [{ colId: 'a' }] }],
            });
            await new GridColumns(api, `groupId-less group does not match by reference across setGridOption setup`)
                .checkColumns(`
                    CENTER
                    └─┬ "G" GROUP
                      └── a width:200
                `);
            await new GridRows(api, `groupId-less group does not match by reference across setGridOption setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            await asyncSetTimeout(0);

            // Round-trip with identical structure but no groupId — colId 'a' still reused
            // (cols reuse independently of groups).
            const colABefore = api.getColumn('a');
            api.setGridOption('columnDefs', [{ headerName: 'G', children: [{ colId: 'a' }] }]);
            await new GridColumns(
                api,
                `groupId-less group does not match by reference across setGridOption after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  └── a width:200
            `);
            await new GridRows(
                api,
                `groupId-less group does not match by reference across setGridOption after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);
            expect(api.getColumn('a')).toBe(colABefore);
        });

        test('expanded state restored on group reuse via groupId', async () => {
            // `setExpanded(existingGroup.isExpanded())` propagates the prior open/close state to
            // the new group instance when groupId matches.
            const api = gridsManager.createGrid('expandRestore', {
                columnDefs: [
                    {
                        headerName: 'G',
                        groupId: 'g',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });
            await new GridColumns(api, `expanded state restored on group reuse via groupId setup`).checkColumns(`
                CENTER
                └─┬ "G" GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
            await new GridRows(api, `expanded state restored on group reuse via groupId setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // Collapse the group.
            api.setColumnGroupOpened('g', false);
            await new GridColumns(api, `expanded state restored on group reuse via groupId after setColumnGroupOpened`)
                .checkColumns(`
                    CENTER
                    └─┬ "G" GROUP closed
                      ├── a width:200
                      └── b width:200 columnGroupShow:open hidden
                `);
            await asyncSetTimeout(0);
            // Sanity: 'b' is hidden when group is collapsed.
            const beforeIds = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(beforeIds).not.toContain('b');

            // Re-apply same defs — group should be reused AND keep its collapsed state.
            api.setGridOption('columnDefs', [
                {
                    headerName: 'G',
                    groupId: 'g',
                    openByDefault: true,
                    children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                },
            ]);
            await new GridColumns(
                api,
                `expanded state restored on group reuse via groupId after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);
            await new GridRows(api, `expanded state restored on group reuse via groupId after setGridOption columnDefs`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
            await asyncSetTimeout(0);

            const afterIds = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(afterIds).not.toContain('b');
        });

        test('group instance is reused when colGroupDef is structurally unchanged', async () => {
            const api = gridsManager.createGrid('groupReuse', {
                columnDefs: [{ headerName: 'G', groupId: 'g', children: [{ colId: 'a' }, { colId: 'b' }] }],
            });
            await new GridColumns(api, `group instance is reused when colGroupDef is structurally unchanged setup`)
                .checkColumns(`
                    CENTER
                    └─┬ "G" GROUP
                      ├── a width:200
                      └── b width:200
                `);
            await new GridRows(api, `group instance is reused when colGroupDef is structurally unchanged setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            await asyncSetTimeout(0);

            const groupBefore = (api.getColumn('a') as any).parent.providedColumnGroup;
            expect(groupBefore.groupId).toBe('g');

            api.setGridOption('columnDefs', [
                { headerName: 'G', groupId: 'g', children: [{ colId: 'a' }, { colId: 'b' }] },
            ]);
            await new GridColumns(
                api,
                `group instance is reused when colGroupDef is structurally unchanged after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(
                api,
                `group instance is reused when colGroupDef is structurally unchanged after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const groupAfter = (api.getColumn('a') as any).parent.providedColumnGroup;
            expect(groupAfter === groupBefore).toBe(true);
        });

        test('group instance is replaced when colGroupDef structurally changes', async () => {
            const api = gridsManager.createGrid('groupReplace', {
                columnDefs: [{ headerName: 'Original', groupId: 'g', children: [{ colId: 'a' }] }],
            });
            await new GridColumns(api, `group instance is replaced when colGroupDef structurally changes setup`)
                .checkColumns(`
                    CENTER
                    └─┬ "Original" GROUP
                      └── a width:200
                `);
            await new GridRows(api, `group instance is replaced when colGroupDef structurally changes setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const groupBefore = (api.getColumn('a') as any).parent.providedColumnGroup;

            api.setGridOption('columnDefs', [{ headerName: 'Changed', groupId: 'g', children: [{ colId: 'a' }] }]);
            await new GridColumns(
                api,
                `group instance is replaced when colGroupDef structurally changes after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "Changed" GROUP
                  └── a width:200
            `);
            await new GridRows(
                api,
                `group instance is replaced when colGroupDef structurally changes after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const groupAfter = (api.getColumn('a') as any).parent.providedColumnGroup;
            expect(groupAfter !== groupBefore).toBe(true);
            expect(groupAfter.colGroupDef.headerName).toBe('Changed');
        });

        test('reused group has its colGroupDef updated to reflect the latest children array', async () => {
            // Even though `children` is excluded from the structural compare (refs change per
            // call), the reused instance's `colGroupDef.children` MUST point to the latest
            // user-supplied array so consumers reading `getColGroupDef().children` don't see
            // stale data after a child was added/removed.
            const api = gridsManager.createGrid('groupColDefRef', {
                columnDefs: [{ headerName: 'G', groupId: 'g', children: [{ colId: 'a' }] }],
            });
            await new GridColumns(
                api,
                `reused group has its colGroupDef updated to reflect the latest children array setup`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  └── a width:200
            `);
            await new GridRows(
                api,
                `reused group has its colGroupDef updated to reflect the latest children array setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const groupBefore = (api.getColumn('a') as any).parent.providedColumnGroup;
            expect(groupBefore.colGroupDef.children.length).toBe(1);

            api.setGridOption('columnDefs', [
                { headerName: 'G', groupId: 'g', children: [{ colId: 'a' }, { colId: 'b' }] },
            ]);
            await new GridColumns(
                api,
                `reused group has its colGroupDef updated to reflect the latest children array after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(
                api,
                `reused group has its colGroupDef updated to reflect the latest children array after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const groupAfter = (api.getColumn('a') as any).parent.providedColumnGroup;
            // Same instance was reused.
            expect(groupAfter === groupBefore).toBe(true);
            // But its colGroupDef.children reflects the NEW children array (length 2 not 1).
            expect(groupAfter.colGroupDef.children.length).toBe(2);
            expect(groupAfter.colGroupDef.children[1].colId).toBe('b');
        });

        test('reused group picks up new children when cols are added to it', async () => {
            const api = gridsManager.createGrid('groupChildrenAdd', {
                columnDefs: [{ headerName: 'G', groupId: 'g', children: [{ colId: 'a' }, { colId: 'b' }] }],
            });
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols before adding child').checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  ├── a width:200
                  └── b width:200
            `);

            const groupBefore = (api.getColumn('a') as any).parent.providedColumnGroup;

            api.setGridOption('columnDefs', [
                {
                    headerName: 'G',
                    groupId: 'g',
                    children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                },
            ]);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after adding child c').checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  ├── a width:200
                  ├── b width:200
                  └── c width:200
            `);

            const groupAfter = (api.getColumn('a') as any).parent.providedColumnGroup;
            expect(groupAfter === groupBefore).toBe(true);
            expect(api.getColumn('c')).not.toBeNull();
            expect((api.getColumn('c') as any).parent.providedColumnGroup === groupBefore).toBe(true);
        });

        test('mutating colGroupDef in place is picked up on refresh', async () => {
            const group: any = { headerName: 'G', groupId: 'g', children: [{ colId: 'a' }] };
            const api = gridsManager.createGrid('groupMutate', { columnDefs: [group] });
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols with original group headerName').checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  └── a width:200
            `);

            expect((api.getColumn('a') as any).parent.providedColumnGroup.colGroupDef.headerName).toBe('G');

            group.headerName = 'G renamed';
            api.setGridOption('columnDefs', [group]);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols with renamed group headerName').checkColumns(`
                CENTER
                └─┬ "G renamed" GROUP
                  └── a width:200
            `);

            expect((api.getColumn('a') as any).parent.providedColumnGroup.colGroupDef.headerName).toBe('G renamed');
        });

        // Cascade: when AgProvidedColumnGroup is reused, the displayed AgColumnGroup wrapper
        // also reuses (its lookup gated on `columnGroup.providedColumnGroup === providedGroup`).
        // Before AgProvidedColumnGroup reuse, this cascade was always broken.
        test('displayed AgColumnGroup is reused when AgProvidedColumnGroup is reused', async () => {
            const api = gridsManager.createGrid('groupCascade', {
                columnDefs: [{ headerName: 'G', groupId: 'g', children: [{ colId: 'a' }] }],
            });
            await new GridColumns(api, `displayed AgColumnGroup is reused when AgProvidedColumnGroup is reused setup`)
                .checkColumns(`
                    CENTER
                    └─┬ "G" GROUP
                      └── a width:200
                `);
            await new GridRows(api, `displayed AgColumnGroup is reused when AgProvidedColumnGroup is reused setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
            await asyncSetTimeout(0);

            const displayedBefore = (api.getColumn('a') as any).parent;
            const providedBefore = displayedBefore.providedColumnGroup;

            api.setGridOption('columnDefs', [{ headerName: 'G', groupId: 'g', children: [{ colId: 'a' }] }]);
            await new GridColumns(
                api,
                `displayed AgColumnGroup is reused when AgProvidedColumnGroup is reused after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  └── a width:200
            `);
            await new GridRows(
                api,
                `displayed AgColumnGroup is reused when AgProvidedColumnGroup is reused after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const displayedAfter = (api.getColumn('a') as any).parent;
            const providedAfter = displayedAfter.providedColumnGroup;
            expect(providedAfter === providedBefore).toBe(true);
            expect(displayedAfter === displayedBefore).toBe(true);
        });

        // Edge case: a NEW sibling claims the same id-string that the existing group used.
        // Reuse must NOT fire — would collide and silently shadow the sibling col.
        test('group reuse falls back to a fresh id when a sibling claimed the existing groupId first', async () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const api = gridsManager.createGrid('groupIdClash', {
                    columnDefs: [{ headerName: 'G', groupId: 'g', children: [{ colId: 'a' }] }],
                });
                await asyncSetTimeout(0);

                const groupBefore = (api.getColumn('a') as any).parent.providedColumnGroup;
                expect(groupBefore.groupId).toBe('g');

                // New defs: a col with colId='g' is processed FIRST, claiming the 'g' id. The
                // group def below with groupId='g' must NOT reuse (would collide) — gets 'g_1'.
                api.setGridOption('columnDefs', [
                    { colId: 'g' },
                    { headerName: 'G', groupId: 'g', children: [{ colId: 'a' }] },
                ]);
                await asyncSetTimeout(0);

                const groupAfter = (api.getColumn('a') as any).parent.providedColumnGroup;
                expect(groupAfter !== groupBefore).toBe(true);
                expect(groupAfter.groupId).toBe('g_1');
                expect(api.getColumn('g')).not.toBeNull();

                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    expect.stringContaining('warning #273'),
                    expect.stringContaining('Provided column id `g` was already in use'),
                    expect.any(String)
                );
            } finally {
                consoleWarnSpy.mockRestore();
            }
        });
    });

    describe('column-tree build edge cases', () => {
        test('col reuse by ColDef reference when no colId/field', async () => {
            // Tail-of-priority `findExistingCol` path: neither colId nor field set, so the new
            // def has to literally `===` the prior `userProvidedColDef` to be reused. Verified by
            // passing the SAME def object twice.
            const sharedDef: ColDef = { width: 123 };
            const api = gridsManager.createGrid('refReuse', { columnDefs: [sharedDef] });
            await new GridColumns(api, `col reuse by ColDef reference when no colId/field setup`).checkColumns(`
                CENTER
                └── 0 width:123
            `);
            await new GridRows(api, `col reuse by ColDef reference when no colId/field setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const colBefore = api.getAllGridColumns()[0];
            expect(colBefore.getActualWidth()).toBe(123);

            // Re-apply the same def object — col should be reused (same instance).
            api.setGridOption('columnDefs', [sharedDef]);
            await new GridColumns(
                api,
                `col reuse by ColDef reference when no colId/field after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └── 0 width:123
            `);
            await new GridRows(api, `col reuse by ColDef reference when no colId/field after setGridOption columnDefs`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
            await asyncSetTimeout(0);

            expect(api.getAllGridColumns()[0]).toBe(colBefore);
        });

        test('padding: leaf at depth 0 paired with leaves nested deep gets synthetic groups', async () => {
            // `balanceColumnTree` pads leaf 'flat' (at depth 0) with synthetic groups so it
            // shares the depth of the nested leaves. Test verifies the grid still renders
            // correctly — the padded synthetic groups are transparent to displayed col lists.
            const api = gridsManager.createGrid('padding', {
                columnDefs: [
                    { colId: 'flat' },
                    {
                        headerName: 'L1',
                        children: [
                            {
                                headerName: 'L2',
                                children: [{ colId: 'deep' }],
                            },
                        ],
                    },
                ],
            });
            await asyncSetTimeout(0);

            // Both leaves displayed; tree depth driven by the deeper branch.
            const ids = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(ids).toContain('flat');
            expect(ids).toContain('deep');
            await new GridColumns(api, 'padded leaf').checkColumns(`
                CENTER
                ├── flat width:200
                └─┬ "L1" GROUP
                  └─┬ "L2" GROUP
                    └── deep width:200
            `);
        });

        test('padding works on community grid mock without colGroupSvc', async () => {
            // When `colGroupSvc` is undefined (community grids w/o group module), `buildGroup`
            // returns null and balance is skipped. Cover with empty groups via lack of children
            // module — we can't easily disable colGroupSvc from tests, but we verify the
            // colGroup-less path doesn't error by using flat defs only (group module no-ops).
            const api = gridsManager.createGrid('flatNoGroups', {
                columnDefs: [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }],
            });
            await new GridColumns(api, `padding works on community grid mock without colGroupSvc setup`).checkColumns(
                `
                    CENTER
                    ├── x width:200
                    ├── y width:200
                    └── z width:200
                `
            );
            await new GridRows(api, `padding works on community grid mock without colGroupSvc setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const ids = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(ids).toEqual(['x', 'y', 'z']);
            await new GridRows(api, `padding works on community grid mock without colGroupSvc final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getColDefColOrCol vs getCol semantics', () => {
        test('getColumn resolves both user cols and service cols by id', async () => {
            const api = gridsManager.createGrid('getColSurface', {
                columnDefs: [{ field: 'country', rowGroup: true }, { field: 'value' }],
                rowData: [{ country: 'USA', value: 1 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
                rowNumbers: true,
            });
            await new GridColumns(api, `getColumn resolves both user cols and service cols by id setup`).checkColumns(
                `
                    LEFT
                    └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country "Country" width:200 rowGroup
                    └── value "Value" width:200
                `
            );
            await new GridRows(api, `getColumn resolves both user cols and service cols by id setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-USA row-number:"1" ag-Grid-AutoColumn:"USA"
                · └── LEAF hidden id:0 row-number:"1" country:"USA" value:1
            `);
            await asyncSetTimeout(0);

            expect(api.getColumn('value')).not.toBeNull();
            expect(api.getColumn('country')).not.toBeNull();
            expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
            expect(api.getColumn('ag-Grid-SelectionColumn')).not.toBeNull();
            expect(api.getColumn('ag-Grid-RowNumbersColumn')).not.toBeNull();
            expect(api.getColumn('does-not-exist')).toBeNull();
            await new GridRows(api, `getColumn resolves both user cols and service cols by id final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-USA row-number:"1" ag-Grid-AutoColumn:"USA"
                · └── LEAF hidden id:0 row-number:"1" country:"USA" value:1
            `);
        });
    });

    describe('colDef ref adoption on structurally-equal refresh', () => {
        test('AgColumn adopts new colDef + userProvidedColDef refs even when structurally equal', async () => {
            const initialColA: ColDef = { colId: 'a', headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [initialColA, { colId: 'b' }] });
            await new GridColumns(
                api,
                `AgColumn adopts new colDef + userProvidedColDef refs even when structurally equa setup`
            ).checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `AgColumn adopts new colDef + userProvidedColDef refs even when structurally equa setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const column = api.getColumn('a')!;
            expect(column.getUserProvidedColDef()).toBe(initialColA);
            const initialMergedRef = column.getColDef();

            const replacementColA: ColDef = { colId: 'a', headerName: 'A' };
            api.setGridOption('columnDefs', [replacementColA, { colId: 'b' }]);
            await new GridColumns(
                api,
                `AgColumn adopts new colDef + userProvidedColDef refs even when structurally equa after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `AgColumn adopts new colDef + userProvidedColDef refs even when structurally equa after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')!).toBe(column);
            expect(column.getUserProvidedColDef()).toBe(replacementColA);
            expect(column.getColDef()).not.toBe(initialMergedRef);
        });

        test('AgProvidedColumnGroup adopts new colGroupDef ref when structurally equal', async () => {
            const initialGroup: ColGroupDef = {
                groupId: 'g',
                headerName: 'G',
                children: [{ colId: 'a' }],
            };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [initialGroup] });
            await new GridColumns(api, `AgProvidedColumnGroup adopts new colGroupDef ref when structurally equal setup`)
                .checkColumns(`
                    CENTER
                    └─┬ "G" GROUP
                      └── a width:200
                `);
            await new GridRows(api, `AgProvidedColumnGroup adopts new colGroupDef ref when structurally equal setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const providedGroup = api.getProvidedColumnGroup('g')! as any;
            const initialMergedRef = providedGroup.getColGroupDef();

            const replacementGroup: ColGroupDef = {
                groupId: 'g',
                headerName: 'G',
                children: [{ colId: 'a' }],
            };
            api.setGridOption('columnDefs', [replacementGroup]);
            await new GridColumns(
                api,
                `AgProvidedColumnGroup adopts new colGroupDef ref when structurally equal after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  └── a width:200
            `);
            await new GridRows(
                api,
                `AgProvidedColumnGroup adopts new colGroupDef ref when structurally equal after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getProvidedColumnGroup('g')! as any).toBe(providedGroup);
            expect(providedGroup.getColGroupDef()).not.toBe(initialMergedRef);
        });
    });

    describe('orphan destruction on group child removal', () => {
        test('removed leaf is destroyed when parent group is reused with fewer children', async () => {
            const defs1: ColGroupDef[] = [
                {
                    groupId: 'g',
                    children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs1 });
            await new GridColumns(
                api,
                `removed leaf is destroyed when parent group is reused with fewer children setup`
            ).checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── a width:200
                  ├── b width:200
                  └── c width:200
            `);
            await new GridRows(api, `removed leaf is destroyed when parent group is reused with fewer children setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const colC = api.getColumn('c')! as any;
            expect(colC.isAlive()).toBe(true);

            const defs2: ColGroupDef[] = [
                {
                    groupId: 'g',
                    children: [{ colId: 'a' }, { colId: 'b' }],
                },
            ];
            api.setGridOption('columnDefs', defs2);
            await new GridColumns(
                api,
                `removed leaf is destroyed when parent group is reused with fewer children after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(
                api,
                `removed leaf is destroyed when parent group is reused with fewer children after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(colC.isAlive()).toBe(false);
            expect(api.getColumn('a')).not.toBeNull();
            expect(api.getColumn('b')).not.toBeNull();
            expect(api.getColumn('c')).toBeNull();
        });

        test('removed nested group is destroyed when ancestor group is reused', async () => {
            const defs1: ColGroupDef[] = [
                {
                    groupId: 'outer',
                    children: [
                        { groupId: 'inner1', children: [{ colId: 'a' }] },
                        { groupId: 'inner2', children: [{ colId: 'b' }] },
                    ],
                },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs1 });
            await new GridColumns(api, `removed nested group is destroyed when ancestor group is reused setup`)
                .checkColumns(`
                    CENTER
                    └─┬ GROUP
                      ├─┬ GROUP
                      │ └── a width:200
                      └─┬ GROUP
                        └── b width:200
                `);
            await new GridRows(api, `removed nested group is destroyed when ancestor group is reused setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const innerGroup2 = api.getProvidedColumnGroup('inner2')! as any;
            const colB = api.getColumn('b')! as any;
            expect(innerGroup2.isAlive()).toBe(true);
            expect(colB.isAlive()).toBe(true);

            const defs2: ColGroupDef[] = [
                {
                    groupId: 'outer',
                    children: [{ groupId: 'inner1', children: [{ colId: 'a' }] }],
                },
            ];
            api.setGridOption('columnDefs', defs2);
            await new GridColumns(
                api,
                `removed nested group is destroyed when ancestor group is reused after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └─┬ GROUP
                  └─┬ GROUP
                    └── a width:200
            `);
            await new GridRows(
                api,
                `removed nested group is destroyed when ancestor group is reused after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(innerGroup2.isAlive()).toBe(false);
            expect(colB.isAlive()).toBe(false);
        });
    });

    describe('setColumnDefs: stateful colDef attrs still apply on update (BC)', () => {
        test('a present pinned colDef re-applies, overwriting a runtime unpin', async () => {
            const api = gridsManager.createGrid('myGrid', {
                rowData: [{ a: 1, b: 2 }],
                columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b' }],
            });
            await new GridColumns(api, 'pinned via colDef').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
            `);

            api.setColumnsPinned(['a'], null);
            await asyncSetTimeout(0);
            expect(api.getColumn('a')!.getPinned()).toBeNull();

            api.setGridOption('columnDefs', [{ colId: 'a', pinned: 'left' }, { colId: 'b' }]);
            await asyncSetTimeout(0);
            expect(api.getColumn('a')!.getPinned()).toBe('left');
            await new GridColumns(api, 'pinned re-applied on update').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
            `);
            await new GridRows(api, 'pinned re-applied on update - rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('an absent pinned colDef preserves a runtime pin', async () => {
            const api = gridsManager.createGrid('myGrid', {
                rowData: [{ a: 1, b: 2 }],
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsPinned(['a'], 'left');
            await asyncSetTimeout(0);
            expect(api.getColumn('a')!.getPinned()).toBe('left');

            api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'Alpha' }, { colId: 'b' }]);
            await asyncSetTimeout(0);
            expect(api.getColumn('a')!.getPinned()).toBe('left');
            await new GridColumns(api, 'runtime pin preserved on absent-pinned update').checkColumns(`
                LEFT
                └── a "Alpha" width:200
                CENTER
                └── b width:200
            `);
            await new GridRows(api, 'runtime pin preserved on absent-pinned update - rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });
});
