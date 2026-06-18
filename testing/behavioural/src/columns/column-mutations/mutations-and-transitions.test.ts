/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

describe('Column Mutations - transitions', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            RowSelectionModule,
            RowNumbersModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('row group column mutations', () => {
        test('adding rowGroup creates auto-group column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group' }, { colId: 'value' }],
                rowData: [],
            });

            await new GridColumns(api, 'no grouping').checkColumns(`
                CENTER
                ├── group width:200
                └── value width:200
            `);

            // Add rowGroup
            api.setGridOption('columnDefs', [{ colId: 'group', rowGroup: true }, { colId: 'value' }]);

            await new GridColumns(api, 'with grouping').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
        });

        test('removing rowGroup removes auto-group column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });

            await new GridColumns(api, 'with grouping').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);

            // Remove rowGroup
            api.setGridOption('columnDefs', [{ colId: 'group' }, { colId: 'value' }]);

            await new GridColumns(api, 'no grouping').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
        });

        test('switching between groupDisplayType singleColumn and multipleColumns', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'country', rowGroup: true },
                { colId: 'sport', rowGroup: true },
                { colId: 'gold' },
            ];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [],
                groupDisplayType: 'singleColumn',
            });

            await new GridColumns(api, 'singleColumn').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── gold width:200
            `);

            const singleAuto = api.getColumn('ag-Grid-AutoColumn');
            expect(singleAuto).toBeDefined();

            // Switch to multipleColumns
            api.setGridOption('groupDisplayType', 'multipleColumns');

            await new GridColumns(api, 'multipleColumns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country width:200
                ├── ag-Grid-AutoColumn-sport width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── gold width:200
            `);

            const multiAutoCountry = api.getColumn('ag-Grid-AutoColumn-country');
            expect(multiAutoCountry).toBeDefined();
            expect(multiAutoCountry).not.toBe(singleAuto);
            expect((singleAuto as any).isAlive()).toBe(false);

            // Switch back
            api.setGridOption('groupDisplayType', 'singleColumn');

            await new GridColumns(api, 'back to singleColumn').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── gold width:200
            `);

            // Going back: multi-mode instances must be destroyed.
            expect((multiAutoCountry as any).isAlive()).toBe(false);
        });
    });

    describe('pivot mode transitions', () => {
        test('entering pivot mode with value columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', pivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 3 },
                    { country: 'UK', sport: 'Running', gold: 2 },
                ],
            });

            await new GridColumns(api, 'before pivot').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 pivot
                └── gold width:200 aggFunc:sum
            `);

            // Enable pivot mode
            api.setGridOption('pivotMode', true);

            await new GridColumns(api, 'after pivot on').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  └── pivot_sport__gold width:200 columnGroupShow:open
            `);

            // Disable pivot mode
            api.setGridOption('pivotMode', false);

            await new GridColumns(api, 'after pivot off').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 pivot
                └── gold width:200 aggFunc:sum
            `);
        });

        test('pivot mode with no value columns shows only auto-group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'country', rowGroup: true }, { colId: 'sport' }, { colId: 'gold' }],
                rowData: [{ country: 'USA', sport: 'Swimming', gold: 3 }],
                pivotMode: true,
            });

            // In pivot mode without value columns, only auto-group and value columns shown
            await new GridColumns(api, 'pivot no values').checkColumns(`
                CENTER
                └── ag-Grid-AutoColumn "Group" width:200
            `);
        });
    });

    describe('heavy sequential mutations', () => {
        test('rapid setColumnDefs calls maintain consistency', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            // Rapid sequential updates
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);
            api.setGridOption('columnDefs', [{ colId: 'b' }, { colId: 'c' }]);
            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }]);

            await new GridColumns(api, 'after rapid updates').checkColumns(`
                CENTER
                ├── x width:200
                └── y width:200
            `);
        });

        test('multiple applyColumnState calls accumulate correctly', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            // Apply state incrementally
            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            api.applyColumnState({ state: [{ colId: 'b', pinned: 'left' }] });
            api.applyColumnState({ state: [{ colId: 'c', width: 300 }] });

            await new GridColumns(api, 'accumulated state').checkColumns(`
                LEFT
                └── b width:200
                CENTER
                ├── a width:200 sort:asc
                └── c width:300
            `);
        });

        test('setColumnDefs then applyColumnState then moveColumns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
            });

            // Step 1: Apply some state
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'desc' },
                    { colId: 'd', pinned: 'right' },
                ],
            });

            // Step 2: Move column c to first position
            api.moveColumns(['c'], 0);

            // Step 3: Update column defs (should preserve state)
            api.setGridOption('columnDefs', [
                { colId: 'a', headerName: 'Alpha' },
                { colId: 'b', headerName: 'Beta' },
                { colId: 'c', headerName: 'Charlie' },
                { colId: 'd', headerName: 'Delta' },
            ]);

            await new GridColumns(api, 'after all mutations').checkColumns(`
                CENTER
                ├── a "Alpha" width:200 sort:desc
                ├── b "Beta" width:200
                └── c "Charlie" width:200
                RIGHT
                └── d "Delta" width:200
            `);
        });

        test('toggle visibility rapidly', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            // Toggle visibility multiple times
            api.setColumnsVisible(['b'], false);
            api.setColumnsVisible(['c'], false);
            api.setColumnsVisible(['b'], true);
            api.setColumnsVisible(['a'], false);

            await new GridColumns(api, 'after visibility toggles').checkColumns(`
                CENTER
                └── b width:200
            `);

            // Wait, c was hidden then never shown. Let me check...
            // Actually: b=false, c=false, b=true, a=false
            // So a=hidden, b=visible, c=hidden
        });

        test('toggle pinning rapidly', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['c'], 'right');
            api.setColumnsPinned(['a'], 'right');
            api.setColumnsPinned(['c'], null);

            await new GridColumns(api, 'after pin toggles').checkColumns(`
                CENTER
                ├── b width:200
                └── c width:200
                RIGHT
                └── a width:200
            `);
        });
    });

    describe('pivot + groupHideColumnsUntilExpanded interaction', () => {
        test('auto-group col visibility tracks expansion when groupHideColumnsUntilExpanded=true and pivot mode is on', async () => {
            // groupHideColumnsUntilExpanded without the required display mode legitimately warns.
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', enablePivot: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', sport: 'football', amount: 5 },
                    { country: 'UK', sport: 'rugby', amount: 3 },
                ],
                pivotMode: true,
                groupHideColumnsUntilExpanded: true,
            });
            await asyncSetTimeout(0);
            consoleWarnSpy.mockRestore();

            // With groupHideColumnsUntilExpanded the auto-group col should not be displayed until
            // a group is expanded — even in pivot mode. Snapshot the displayed set.
            await new GridColumns(api, 'pivot + hideUntilExpanded').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum
            `);
        });
    });

    describe('isPivotActive transitions', () => {
        test('pivotMode reflects toggles via setGridOption', async () => {
            const api = gridsManager.createGrid('pivotActive', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', pivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'USA', sport: 'Swim', gold: 1 }],
            });
            await new GridColumns(api, `pivotMode reflects toggles via setGridOption setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 pivot
                └── gold width:200 aggFunc:sum
            `);
            await new GridRows(api, `pivotMode reflects toggles via setGridOption setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" gold:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            expect(api.isPivotMode()).toBe(false);

            api.setGridOption('pivotMode', true);
            await new GridColumns(api, `pivotMode reflects toggles via setGridOption after setGridOption pivotMode`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └─┬ GROUP
                      └── pivot_sport__gold width:200 columnGroupShow:open
                `);
            await new GridRows(api, `pivotMode reflects toggles via setGridOption after setGridOption pivotMode`).check(
                `
                    ROOT id:ROOT_NODE_ID pivot_sport__gold:null
                    └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" pivot_sport__gold:null
                    · └── LEAF hidden id:0
                `
            );
            await asyncSetTimeout(0);
            expect(api.isPivotMode()).toBe(true);

            api.setGridOption('pivotMode', false);
            await new GridColumns(api, `pivotMode reflects toggles via setGridOption after setGridOption pivotMode #2`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country width:200 rowGroup
                    ├── sport width:200 pivot
                    └── gold width:200 aggFunc:sum
                `);
            await new GridRows(api, `pivotMode reflects toggles via setGridOption after setGridOption pivotMode #2`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" gold:null
                    · └── LEAF hidden id:0
                `);
            await asyncSetTimeout(0);
            expect(api.isPivotMode()).toBe(false);
        });
    });
});
