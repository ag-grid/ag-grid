/**
 * Tests for column features identified from documentation pages that aren't
 * well covered by other column test files. Covers:
 * - Column spanning (colSpan)
 * - Column sizing (flex, auto-size, sizeColumnsToFit)
 * - Column headers (headerValueGetter, tooltips, auto header height)
 * - Aligned grids (column sync)
 * - Value getters and formatters effect on column display
 * - Column definitions matching and updating
 * - defaultColDef and defaultColGroupDef
 * - Column types
 * - Cell ctrl recycling under column virtualisation, and which lane a cell renders into
 */
import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    mockGridLayout,
} from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import {
    AlignedGridsModule,
    CellStyleModule,
    ClientSideRowModelModule,
    DragAndDropModule,
    RenderApiModule,
    RowAutoHeightModule,
    RowDragModule,
    ScrollApiModule,
    TextEditorModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { allowLegacyTooltipProperties, resetLegacyTooltipProperties } from '../tooltip/legacyTooltipTestUtils';

/** Reads the rendered height of the (single) column header row from the grid DOM. */
function getHeaderRowHeight(api: GridApi): number {
    const gridElement = TestGridsManager.getHTMLElement(api)!;
    const headerRow = gridElement.querySelector('.ag-header-row-column') as HTMLElement | null;
    return parseFloat(headerRow!.style.height);
}

describe('Column Features', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            AlignedGridsModule,
            CellStyleModule,
            ClientSideRowModelModule,
            DragAndDropModule,
            RenderApiModule,
            RowAutoHeightModule,
            RowDragModule,
            RowGroupingModule,
            ScrollApiModule,
            TextEditorModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        resetLegacyTooltipProperties();
    });

    describe('column spanning (colSpan)', () => {
        test('column with colSpan still appears in column list', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', colSpan: () => 2 }, { colId: 'b' }, { colId: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            // colSpan affects cell rendering, not column structure
            await new GridColumns(api, 'with colSpan').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });
    });

    describe('column sizing: fixed width with constraints', () => {
        test('width is clamped to minWidth', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 50, minWidth: 100 }],
            });

            const col = api.getColumn('a')!;
            expect(col.getActualWidth()).toBeGreaterThanOrEqual(100);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a width:100
            `);
        });

        test('width is clamped to maxWidth', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 500, maxWidth: 200 }],
            });

            const col = api.getColumn('a')!;
            expect(col.getActualWidth()).toBeLessThanOrEqual(200);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a width:200
            `);
        });
    });

    describe('column headers', () => {
        test('headerValueGetter overrides headerName', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'a',
                        headerName: 'Original',
                        headerValueGetter: () => 'Dynamic Header',
                    },
                    { colId: 'b' },
                ],
            });

            // The display name should come from headerValueGetter
            const displayName = api.getDisplayNameForColumn(api.getColumn('a')!, 'header');
            expect(displayName).toBe('Dynamic Header');

            await new GridColumns(api, 'dynamic headers').checkColumns(`
                CENTER
                ├── a "Dynamic Header" width:200
                └── b width:200
            `);
        });

        test('field auto-generates headerName with camelCase split', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'firstName' }, { field: 'lastUpdatedDate' }],
            });

            await new GridColumns(api, 'auto headers').checkColumns(`
                CENTER
                ├── firstName "First Name" width:200
                └── lastUpdatedDate "Last Updated Date" width:200
            `);
        });
    });

    describe('column types', () => {
        test('rightAligned column type', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'name', type: 'rightAligned' }, { colId: 'value' }],
            });

            await new GridColumns(api, 'with type').checkColumns(`
                CENTER
                ├── name width:200
                └── value width:200
            `);
        });

        test('custom column type', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnTypes: {
                    wideColumn: { width: 400 },
                    narrowColumn: { width: 80 },
                },
                columnDefs: [{ colId: 'a', type: 'wideColumn' }, { colId: 'b', type: 'narrowColumn' }, { colId: 'c' }],
            });

            await new GridColumns(api, 'custom types').checkColumns(`
                CENTER
                ├── a width:400
                ├── b width:80
                └── c width:200
            `);
        });

        test('type as array applies all listed types', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnTypes: {
                    bold: { cellClass: 'bold' },
                    italic: { cellClass: 'italic' },
                },
                columnDefs: [{ colId: 'a', type: ['bold', 'italic'] }],
            });
            await new GridColumns(api, `type as array applies all listed types setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `type as array applies all listed types setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn('a')!;
            expect(col.getColDef().cellClass).toBeTruthy();
            await new GridRows(api, `type as array applies all listed types final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('unknown type key in colDef without userTypes is a warn-only no-op', async () => {
            // Asserts the warn-only #36; suppress only that id so any other diagnostic still throws.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [36] });
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', type: 'does-not-exist' }],
            });
            await new GridColumns(api, `unknown type key in colDef without userTypes is a warn-only no-op setup`)
                .checkColumns(`
                    CENTER
                    └── a width:200
                `);
            await new GridRows(api, `unknown type key in colDef without userTypes is a warn-only no-op setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            expect(api.getColumn('a')).toBeTruthy();
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #36');
            consoleWarnSpy.mockRestore();
            await new GridRows(api, `unknown type key in colDef without userTypes is a warn-only no-op final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });

        test('userTypes that override a default type are rejected (warn-only)', async () => {
            // Asserts the warn-only #34; suppress only that id so any other diagnostic still throws.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [34] });
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                // 'numericColumn' is a default — overriding should warn and be ignored
                columnTypes: { numericColumn: { cellClass: 'override' } as any },
                columnDefs: [{ colId: 'a', type: 'numericColumn' }],
            });
            await new GridColumns(api, `userTypes that override a default type are rejected (warn-only) setup`)
                .checkColumns(`
                    CENTER
                    └── a width:200
                `);
            await new GridRows(api, `userTypes that override a default type are rejected (warn-only) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')).toBeTruthy();
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #34');
            consoleWarnSpy.mockRestore();
            await new GridRows(api, `userTypes that override a default type are rejected (warn-only) final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });

        test('userTypes with nested `type` field is rejected (warn-only)', async () => {
            // Asserts the warn-only #35; suppress only that id so any other diagnostic still throws.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [35] });
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                columnTypes: { custom: { type: 'something', cellClass: 'c' } as any },
                columnDefs: [{ colId: 'a', type: 'custom' }],
            });
            await new GridColumns(api, `userTypes with nested _type_ field is rejected (warn-only) setup`).checkColumns(
                `
                    CENTER
                    └── a width:200
                `
            );
            await new GridRows(api, `userTypes with nested _type_ field is rejected (warn-only) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')).toBeTruthy();
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #35');
            consoleWarnSpy.mockRestore();
            await new GridRows(api, `userTypes with nested _type_ field is rejected (warn-only) final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('unknown type with userTypes present is a warn-only no-op', async () => {
            // Asserts the warn-only #36; suppress only that id so any other diagnostic still throws.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [36] });
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                columnTypes: { custom: { cellClass: 'c' } as any },
                columnDefs: [{ colId: 'a', type: 'unknown-type' }],
            });
            await new GridColumns(api, `unknown type with userTypes present is a warn-only no-op setup`).checkColumns(
                `
                    CENTER
                    └── a width:200
                `
            );
            await new GridRows(api, `unknown type with userTypes present is a warn-only no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')).toBeTruthy();
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #36');
            consoleWarnSpy.mockRestore();
            await new GridRows(api, `unknown type with userTypes present is a warn-only no-op final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('empty type array short-circuits the type assignment', async () => {
            // `convertColumnTypes([])` → empty array → `assignColumnTypes` early-returns on `typeKeysLen === 0`.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', type: [] }],
            });
            await new GridColumns(api, `empty type array short-circuits the type assignment setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `empty type array short-circuits the type assignment setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('a')).toBeTruthy();
            await new GridRows(api, `empty type array short-circuits the type assignment final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('defaultColDef and defaultColGroupDef', () => {
        test('defaultColDef applies to all columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                defaultColDef: { width: 150 },
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            await new GridColumns(api, 'default width').checkColumns(`
                CENTER
                ├── a width:150
                ├── b width:150
                └── c width:150
            `);
        });

        test('column-specific values override defaultColDef', async () => {
            const api = gridsManager.createGrid('myGrid', {
                defaultColDef: { width: 150 },
                columnDefs: [{ colId: 'a' }, { colId: 'b', width: 300 }, { colId: 'c' }],
            });

            await new GridColumns(api, 'override default').checkColumns(`
                CENTER
                ├── a width:150
                ├── b width:300
                └── c width:150
            `);
        });

        test('defaultColGroupDef applies to all groups', async () => {
            const api = gridsManager.createGrid('myGrid', {
                defaultColGroupDef: { openByDefault: true },
                columnDefs: [
                    {
                        headerName: 'Group',
                        children: [
                            { colId: 'a' },
                            { colId: 'b', columnGroupShow: 'open' },
                            { colId: 'c', columnGroupShow: 'closed' },
                        ],
                    },
                ],
            });

            // Group should be open by default, showing 'open' columns
            await new GridColumns(api, 'open by default').checkColumns(`
                CENTER
                └─┬ "Group" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);
        });
    });

    describe('column updating definitions matching', () => {
        test('columns match by colId when field changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'myCol', field: 'name', width: 100 }, { colId: 'other' }],
            });

            const col1 = api.getColumn('myCol')!;

            // Update field but keep colId — should reuse same column instance
            api.setGridOption('columnDefs', [{ colId: 'myCol', field: 'fullName', width: 200 }, { colId: 'other' }]);

            const col2 = api.getColumn('myCol')!;
            expect(col2).toBe(col1); // Same instance

            await new GridColumns(api, 'field changed').checkColumns(`
                CENTER
                ├── myCol "Full Name" width:200
                └── other width:200
            `);
        });

        test('columns match by field when colId not specified', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
            });

            const col1 = api.getColumn('name')!;

            api.setGridOption('columnDefs', [{ field: 'name', width: 300 }, { field: 'age' }]);

            const col2 = api.getColumn('name')!;
            expect(col2).toBe(col1); // Same instance matched by field

            await new GridColumns(api, 'matched by field').checkColumns(`
                CENTER
                ├── name "Name" width:300
                └── age "Age" width:200
            `);
        });
    });

    describe('aligned grids column sync', () => {
        test('column changes sync between aligned grids', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            // Both grids reference each other for bidirectional sync
            const api1 = gridsManager.createGrid('grid1', { columnDefs });
            const api2 = gridsManager.createGrid('grid2', { columnDefs });

            // Set up bidirectional alignment after both grids are created
            api1.setGridOption('alignedGrids', [{ api: api2 }]);
            api2.setGridOption('alignedGrids', [{ api: api1 }]);

            // Both grids should have same columns initially
            await new GridColumns(api1, 'grid1 initial').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridColumns(api2, 'grid2 initial').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Hide column in grid1 — grid2 should sync
            api1.setColumnsVisible(['b'], false);

            await new GridColumns(api1, 'grid1 after hide').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);

            // Grid2 should mirror grid1's change via aligned grid sync
            await new GridColumns(api2, 'grid2 after sync').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });
    });

    describe('value getters and formatters', () => {
        test('valueGetter column has correct header', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'fullName',
                        headerName: 'Full Name',
                        valueGetter: (p: any) => p.data?.first + ' ' + p.data?.last,
                    },
                    { field: 'age' },
                ],
                rowData: [{ first: 'John', last: 'Doe', age: 30 }],
            });

            await new GridColumns(api, 'value getter col').checkColumns(`
                CENTER
                ├── fullName "Full Name" width:200
                └── age "Age" width:200
            `);
        });
    });

    describe('suppressMovable and lockPosition', () => {
        test('suppressMovable prevents column movement', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'fixed', suppressMovable: true }, { colId: 'movable' }],
            });

            // Column structure should be normal
            await new GridColumns(api, 'with suppressMovable').checkColumns(`
                CENTER
                ├── fixed width:200 suppressMovable
                └── movable width:200
            `);
        });

        test('lockPosition=left keeps column at start', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'locked', lockPosition: 'left' }, { colId: 'b' }],
            });

            await new GridColumns(api, 'lockPosition left').checkColumns(`
                CENTER
                ├── locked width:200 lockPosition:left
                ├── a width:200
                └── b width:200
            `);
        });

        test('lockPosition=right keeps column at end', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'locked', lockPosition: 'right' }, { colId: 'b' }],
            });

            await new GridColumns(api, 'lockPosition right').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── locked width:200 lockPosition:right
            `);
        });
    });

    describe('lockVisible', () => {
        test('lockVisible does not prevent API-based hiding (only prevents UI hiding)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', lockVisible: true }, { colId: 'b' }],
            });

            // lockVisible only prevents hiding via UI (tool panel, menu) — API can still hide
            api.setColumnsVisible(['a'], false);

            // Column a IS hidden because lockVisible doesn't block the API
            await new GridColumns(api, 'a hidden via API despite lockVisible').checkColumns(`
                CENTER
                └── b width:200
            `);

            // But the colDef still has lockVisible set
            expect(api.getColumn('a')!.getColDef().lockVisible).toBe(true);
        });
    });

    describe('column group state', () => {
        test('getColumnGroupState returns expansion state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'myGroup',
                        headerName: 'My Group',
                        openByDefault: true,
                        children: [
                            { colId: 'a' },
                            { colId: 'b', columnGroupShow: 'open' },
                            { colId: 'c', columnGroupShow: 'closed' },
                        ],
                    },
                ],
            });

            const groupState = api.getColumnGroupState();
            expect(groupState).toBeDefined();
            expect(groupState.length).toBeGreaterThan(0);
            const myGroupState = groupState.find((g: any) => g.groupId === 'myGroup');
            expect(myGroupState?.open).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);
        });

        test('setColumnGroupState restores expansion state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'myGroup',
                        headerName: 'My Group',
                        openByDefault: true,
                        children: [
                            { colId: 'a' },
                            { colId: 'b', columnGroupShow: 'open' },
                            { colId: 'c', columnGroupShow: 'closed' },
                        ],
                    },
                ],
            });

            // Save state
            const savedState = api.getColumnGroupState();

            // Close the group
            api.setColumnGroupOpened('myGroup', false);

            await new GridColumns(api, 'closed').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP closed
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open hidden
                  └── c width:200 columnGroupShow:closed
            `);

            // Restore state
            api.setColumnGroupState(savedState);

            await new GridColumns(api, 'restored').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);
        });
    });

    describe('suppressColumnsToolPanel', () => {
        test('suppressColumnsToolPanel does not affect column structure', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', suppressColumnsToolPanel: true }, { colId: 'b' }],
            });

            // Column is still displayed in the grid
            await new GridColumns(api, 'with suppressed tool panel').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('editable columns', () => {
        test('editable flag shown in diagram', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', editable: true }, { colId: 'b', editable: false }, { colId: 'c' }],
            });

            await new GridColumns(api, 'editable columns').checkColumns(`
                CENTER
                ├── a width:200 editable
                ├── b width:200
                └── c width:200
            `);
        });
    });

    describe('resizable columns', () => {
        test('resizable=false column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', resizable: false }, { colId: 'b' }],
            });

            expect(api.getColumn('a')!.isResizable()).toBe(false);
            expect(api.getColumn('b')!.isResizable()).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200 !resizable
                └── b width:200
            `);
        });
    });

    describe('autoHeight', () => {
        test('colDef.autoHeight on a visible col activates rowAutoHeight tracking', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', autoHeight: true }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
            });
            await new GridColumns(api, `colDef.autoHeight on a visible col activates rowAutoHeight tracking setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `colDef.autoHeight on a visible col activates rowAutoHeight tracking setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `
            );

            expect(api.getColumn('a')!.getColDef().autoHeight).toBe(true);
            await new GridRows(api, `colDef.autoHeight on a visible col activates rowAutoHeight tracking final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `);
        });

        test('colDef.colSpan + colDef.autoHeight on same grid activates both tracking flags', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', autoHeight: true },
                    { colId: 'b', colSpan: () => 2 },
                ],
                rowData: [{ a: 1, b: 2 }],
            });
            await new GridColumns(
                api,
                `colDef.colSpan + colDef.autoHeight on same grid activates both tracking flags setup`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `colDef.colSpan + colDef.autoHeight on same grid activates both tracking flags setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            expect(api.getColumn('a')!.getColDef().autoHeight).toBe(true);
            await new GridRows(
                api,
                `colDef.colSpan + colDef.autoHeight on same grid activates both tracking flags final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });

    describe('initialSort', () => {
        test('initialSort populates the column state sort field', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', initialSort: 'asc' }, { colId: 'b' }],
            });
            await new GridColumns(api, `initialSort populates the column state sort field setup`).checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                └── b width:200
            `);
            await new GridRows(api, `initialSort populates the column state sort field setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const state = api.getColumnState();
            expect(state.find((s) => s.colId === 'a')!.sort).toBe('asc');
            await new GridRows(api, `initialSort populates the column state sort field final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('Column public-interface getters', () => {
        test('reflect colDef-driven flags (resizable / sortable / minWidth / maxWidth / fieldDots / tooltip / dndSource / rowDrag / isCellCheckboxSelection)', async () => {
            // Retains compatibility coverage for the legacy tooltip-field Column getters.
            allowLegacyTooltipProperties();
            // Single fixture exercising the bulk of Column public-interface getters that flip from
            // colDef properties. Each assertion is independent — combined to avoid N grid setups.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'a',
                        field: 'nested.value',
                        resizable: true,
                        sortable: true,
                        minWidth: 75,
                        maxWidth: 200,
                        tooltipField: 'nested.tip',
                        dndSource: true,
                        rowDrag: true,
                    },
                    {
                        colId: 'b',
                        field: 'flat',
                        resizable: false,
                        sortable: false,
                        tooltipValueGetter: () => 'tip',
                    },
                    { colId: 'c', tooltipField: 'flat' },
                    { colId: 'd' },
                ],
                rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            });
            await new GridColumns(
                api,
                `reflect colDef-driven flags (resizable / sortable / minWidth / maxWidth / fieldD setup`
            ).checkColumns(`
                CENTER
                ├── a "Nested Value" width:200
                ├── b "Flat" width:200 !resizable !sortable
                ├── c width:200
                └── d width:200
            `);
            await new GridRows(
                api,
                `reflect colDef-driven flags (resizable / sortable / minWidth / maxWidth / fieldD setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            const a = api.getColumn('a')!;
            const b = api.getColumn('b')!;
            const c = api.getColumn('c')!;
            const d = api.getColumn('d')!;
            const node = api.getDisplayedRowAtIndex(0)!;

            // Resizable / sortable / sizes
            expect(a.isResizable()).toBe(true);
            expect(a.isSortable()).toBe(true);
            expect(a.getMinWidth()).toBe(75);
            expect(a.isGreaterThanMax(150)).toBe(false);
            expect(a.isGreaterThanMax(250)).toBe(true);
            expect(b.isResizable()).toBe(false);
            expect(b.isSortable()).toBe(false);

            // Field-dot flags
            expect(a.isFieldContainsDots()).toBe(true);
            expect(b.isFieldContainsDots()).toBe(false);

            // Tooltip flags
            expect(a.isTooltipEnabled()).toBe(true);
            expect(b.isTooltipEnabled()).toBe(true);
            expect(c.isTooltipEnabled()).toBe(true);
            expect(d.isTooltipEnabled()).toBe(false);
            expect(a.isTooltipFieldContainsDots()).toBe(true);
            expect(c.isTooltipFieldContainsDots()).toBe(false);

            // Per-row callback-driven flags
            expect(a.isDndSource(node)).toBe(true);
            expect(a.isRowDrag(node)).toBe(true);
            expect(b.isDndSource(node)).toBe(false);
            expect(b.isRowDrag(node)).toBe(false);
            // No selection service wired — always false
            expect(a.isCellCheckboxSelection(node)).toBe(false);
            await new GridRows(
                api,
                `reflect colDef-driven flags (resizable / sortable / minWidth / maxWidth / fieldD final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('reflect colDef-driven aggregation/function flags + auto-header + parent', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        children: [
                            {
                                colId: 'all',
                                suppressFillHandle: true,
                                suppressPaste: true,
                                autoHeaderHeight: true,
                            },
                        ],
                    },
                    { colId: 'none' },
                ],
                rowData: [{ all: 1, none: 2 }],
            });
            await new GridColumns(api, `reflect colDef-driven aggregation/function flags + auto-header + parent setup`)
                .checkColumns(`
                    CENTER
                    ├─┬ GROUP
                    │ └── all width:200
                    └── none width:200
                `);
            await new GridRows(api, `reflect colDef-driven aggregation/function flags + auto-header + parent setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `);

            const allCol = api.getColumn('all')!;
            const noneCol = api.getColumn('none')!;
            const node = api.getDisplayedRowAtIndex(0)!;

            // Function-active flags: with no row-group / value / pivot configured, all false.
            expect(allCol.isValueActive()).toBe(false);
            expect(allCol.isPivotActive()).toBe(false);
            expect(allCol.isRowGroupActive()).toBe(false);
            expect(allCol.isAnyFunctionActive()).toBe(false);

            // Allowed flags from colDef.
            expect(allCol.isAllowValue()).toBe(false);
            expect(allCol.isAllowRowGroup()).toBe(false);
            expect(allCol.isAllowPivot()).toBe(false);
            expect(allCol.isAllowFormula()).toBe(false);
            expect(allCol.isAnyFunctionAllowed()).toBe(false);

            // Fill / paste / nav / edit guards — no selection/edit/nav modules wired.
            expect(allCol.isSuppressFillHandle()).toBe(true);
            expect(noneCol.isSuppressFillHandle()).toBe(false);
            expect(allCol.isSuppressPaste(node)).toBe(true);
            expect(allCol.isSuppressNavigable(node)).toBe(false);
            expect(allCol.isCellEditable(node)).toBe(false);

            // Auto header height
            expect(allCol.isAutoHeaderHeight()).toBe(true);
            expect(allCol.getAutoHeaderHeight()).toBeNull();
            expect(noneCol.isAutoHeaderHeight()).toBe(false);

            // Original parent reflects the group the col was originally defined under.
            // Use boolean assertions to avoid pretty-print walking the circular column-tree.
            const allParent = allCol.getOriginalParent();
            expect(allParent != null).toBe(true);
            expect(allParent?.getGroupId()).toBe('g');
            await new GridRows(
                api,
                `reflect colDef-driven aggregation/function flags + auto-header + parent final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('autoHeaderHeight: measurement runs and lands on the column when DOM offsets are available', async () => {
            mockGridLayout.useRealOffsetDimensions = true;
            try {
                const api = gridsManager.createGrid('autoHeaderHeight', {
                    columnDefs: [{ colId: 'auto', autoHeaderHeight: true, headerName: 'Auto' }, { colId: 'normal' }],
                    rowData: [{ auto: 1, normal: 2 }],
                });

                const autoCol = api.getColumn('auto')!;
                const normalCol = api.getColumn('normal')!;
                expect(autoCol.isAutoHeaderHeight()).toBe(true);
                expect(normalCol.isAutoHeaderHeight()).toBe(false);

                // After measurement (driven by animation frames), the auto-header col has a non-null height.
                await waitFor(() => expect(autoCol.getAutoHeaderHeight()).not.toBeNull());
                // Non-auto col is never measured.
                expect(normalCol.getAutoHeaderHeight()).toBeNull();
            } finally {
                mockGridLayout.useRealOffsetDimensions = false;
            }
        });

        test('autoHeaderHeight: measured height is cleared when autoHeaderHeight is toggled off', async () => {
            mockGridLayout.useRealOffsetDimensions = true;
            try {
                // headerHeight below the measured auto height so the auto column widens the header row,
                // making the contraction observable in the rendered header-row height.
                const api = gridsManager.createGrid('autoHeaderHeight', {
                    headerHeight: 10,
                    columnDefs: [{ colId: 'auto', autoHeaderHeight: true, headerName: 'Auto' }, { colId: 'normal' }],
                    rowData: [{ auto: 1, normal: 2 }],
                });

                const autoCol = api.getColumn('auto')!;
                expect(autoCol.isAutoHeaderHeight()).toBe(true);

                // Measurement is driven by animation frames: poll until it lands on the column.
                const measured = await waitFor(() => {
                    const height = autoCol.getAutoHeaderHeight();
                    expect(height).not.toBeNull();
                    return height!;
                });
                // Auto measurement has widened the rendered header beyond the configured headerHeight.
                expect(getHeaderRowHeight(api)).toBe(measured);

                // Toggle autoHeaderHeight off via columnDefs.
                api.setGridOption('columnDefs', [{ colId: 'auto', headerName: 'Auto' }, { colId: 'normal' }]);

                expect(autoCol.isAutoHeaderHeight()).toBe(false);
                // Stale measured height is cleared and the rendered header contracts to headerHeight.
                await waitFor(() => expect(getHeaderRowHeight(api)).toBe(10));
                expect(autoCol.getAutoHeaderHeight()).toBeNull();
            } finally {
                mockGridLayout.useRealOffsetDimensions = false;
            }
        });

        test('autoHeaderHeight: measured height is retained when the still-auto column is hidden', async () => {
            mockGridLayout.useRealOffsetDimensions = true;
            try {
                const api = gridsManager.createGrid('autoHeaderHeight', {
                    headerHeight: 10,
                    columnDefs: [{ colId: 'auto', autoHeaderHeight: true, headerName: 'Auto' }, { colId: 'normal' }],
                    rowData: [{ auto: 1, normal: 2 }],
                });

                const autoCol = api.getColumn('auto')!;
                const measured = await waitFor(() => {
                    const height = autoCol.getAutoHeaderHeight();
                    expect(height).not.toBeNull();
                    return height!;
                });
                expect(getHeaderRowHeight(api)).toBe(measured);

                // Hiding tears down the header cell but the column is still auto-height, so
                // the measured height must be kept and the rendered header must not contract.
                api.setColumnsVisible(['auto'], false);
                // Negative assertion (the height must NOT be cleared), so there is no positive signal to
                // poll for: hold open the animation-frame window in which a stale clear would land.
                for (let i = 0; i < 8; ++i) {
                    // eslint-disable-next-line no-restricted-syntax -- drains the animation-frame window in which an (incorrect) auto-header-height clear would land after hiding the column
                    await asyncSetTimeout(20);
                }

                expect(autoCol.isAutoHeaderHeight()).toBe(true);
                expect(autoCol.getAutoHeaderHeight()).toBe(measured);
                expect(getHeaderRowHeight(api)).toBe(measured);
            } finally {
                mockGridLayout.useRealOffsetDimensions = false;
            }
        });

        // The header set is the rendered-row set plus the columns the rows filtered out that still have to
        // be measured, and it is what the group header rows are built from. So a group whose leaves are
        // all outside the rendered window is still rendered when one of them has auto header height.
        test('autoHeaderHeight: keeps the group of an unrendered column in the header rows', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [];
            for (let i = 0; i < 28; ++i) {
                columnDefs.push({ colId: `c${i}`, width: 100 });
            }
            // Two equally distant groups, differing only in whether a leaf is auto-header-height.
            columnDefs.push({
                groupId: 'withAuto',
                headerName: 'With auto',
                children: [{ colId: 'auto', width: 100, autoHeaderHeight: true }],
            });
            columnDefs.push({
                groupId: 'withoutAuto',
                headerName: 'Without auto',
                children: [{ colId: 'plain', width: 100 }],
            });

            const api = gridsManager.createGrid('autoHeaderOutsideViewport', {
                columnDefs,
                rowData: [{ c0: 1 }],
                suppressColumnVirtualisation: false,
            });
            await asyncSetTimeout(0);

            // Without this the window is every column and the rest of the test proves nothing.
            const rendered = api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
            expect(rendered).not.toContain('auto');
            expect(rendered).not.toContain('plain');

            const renderedGroups = Array.from(document.querySelectorAll('.ag-header-group-cell'), (cell) =>
                cell.getAttribute('col-id')
            );
            // The auto-header column pulls its group in; its twin with no auto-header leaf stays out.
            expect(renderedGroups).toContain('withAuto_0');
            expect(renderedGroups).not.toContain('withoutAuto_0');
        });

        test('isColumnFunc invokes function with column params; clamps boolean false', async () => {
            // Function-driven colDef callbacks route through `createColumnFunctionCallbackParams`
            // which is otherwise only reached via internal cell-editable / dnd-source paths.
            let receivedColId: string | undefined;
            let receivedData: any = undefined;
            let receivedHasNode = false;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'fn',
                        rowDrag: (params: any) => {
                            receivedColId = params.column.getColId();
                            receivedData = params.data;
                            receivedHasNode = !!params.node;
                            return true;
                        },
                    },
                ],
                rowData: [{ fn: 1 }],
            });
            await new GridColumns(api, `isColumnFunc invokes function with column params; clamps boolean false setup`)
                .checkColumns(`
                    CENTER
                    └── fn width:200
                `);
            await new GridRows(api, `isColumnFunc invokes function with column params; clamps boolean false setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `);

            const col = api.getColumn('fn')!;
            const node = api.getDisplayedRowAtIndex(0)!;
            expect(col.isRowDrag(node)).toBe(true);
            expect(receivedColId).toBe('fn');
            expect(receivedData).toEqual({ fn: 1 });
            expect(receivedHasNode).toBe(true);
            await new GridRows(
                api,
                `isColumnFunc invokes function with column params; clamps boolean false final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('colSpan and rowSpan callbacks clamped min 1; default 1 when no callback', async () => {
            // rowSpan without suppressRowTransform legitimately warns (#319); this test only checks
            // callback clamping, not row-span rendering. Suppress that id and silence the console noise.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a' },
                    { colId: 'b', colSpan: () => 3, rowSpan: () => 2 },
                    { colId: 'c', colSpan: () => 0 },
                ],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            await new GridColumns(api, `colSpan and rowSpan callbacks clamped min 1; default 1 when no callback setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            await new GridRows(api, `colSpan and rowSpan callbacks clamped min 1; default 1 when no callback setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `);
            consoleWarnSpy.mockRestore();

            const node = api.getDisplayedRowAtIndex(0)!;
            expect(api.getColumn('a')!.getColSpan(node)).toBe(1);
            expect(api.getColumn('a')!.getRowSpan(node)).toBe(1);
            expect(api.getColumn('b')!.getColSpan(node)).toBe(3);
            expect(api.getColumn('b')!.getRowSpan(node)).toBe(2);
            // Clamped from 0 → 1
            expect(api.getColumn('c')!.getColSpan(node)).toBe(1);
            await new GridRows(
                api,
                `colSpan and rowSpan callbacks clamped min 1; default 1 when no callback final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('user resize clears flex; event-listener round-trip on widthChanged', async () => {
            // Combined: a resize fires `widthChanged` AND clears the flex flag — same single grid.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', flex: 1 }, { colId: 'b' }],
            });
            await new GridColumns(api, `user resize clears flex; event-listener round-trip on widthChanged setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:800 flex:1
                    └── b width:200
                `);
            await new GridRows(api, `user resize clears flex; event-listener round-trip on widthChanged setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            const a = api.getColumn('a')!;
            let fired = 0;
            const listener = () => {
                fired++;
            };
            a.addEventListener('widthChanged', listener);
            api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
            await new GridColumns(
                api,
                `user resize clears flex; event-listener round-trip on widthChanged after setColumnWidths`
            ).checkColumns(`
                CENTER
                ├── a width:150
                └── b width:200
            `);

            // Resize cleared flex + fired widthChanged
            const stateA = api.getColumnState().find((s) => s.colId === 'a')!;
            expect(stateA.flex).toBeNull();
            expect(stateA.width).toBe(150);
            const firedAfterFirstResize = fired;
            expect(firedAfterFirstResize).toBeGreaterThan(0);

            // Remove + resize again → no further dispatch
            a.removeEventListener('widthChanged', listener);
            api.setColumnWidths([{ key: 'a', newWidth: 180 }]);
            await new GridColumns(
                api,
                `user resize clears flex; event-listener round-trip on widthChanged after setColumnWidths #2`
            ).checkColumns(`
                CENTER
                ├── a width:180
                └── b width:200
            `);
            expect(fired).toBe(firedAfterFirstResize);
        });

        test('deprecated sort helpers reflect current sort + absolute-sort initialSort exercises absolute sort-types path', async () => {
            // Combined: cycling sort through asc/desc on a regular col covers isSortNone/Ascending/
            // Descending/Sorting. A second col with `initialSort: { type: 'absolute' }` exercises
            // the DEFAULT_ABSOLUTE_SORTING_ORDER selection in getSortingOrder.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', sortable: true },
                    { colId: 'b', sortable: true, initialSort: { type: 'absolute', direction: 'asc' } as any },
                ],
            });
            await new GridColumns(
                api,
                `deprecated sort helpers reflect current sort + absolute-sort initialSort exercis setup`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200 sort:asc
            `);
            await new GridRows(
                api,
                `deprecated sort helpers reflect current sort + absolute-sort initialSort exercis setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const a = api.getColumn('a')!;
            expect(a.isSortNone()).toBe(true);
            expect(a.isSorting()).toBe(false);
            expect(a.isSortAscending()).toBe(false);
            expect(a.isSortDescending()).toBe(false);

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await new GridColumns(
                api,
                `deprecated sort helpers reflect current sort + absolute-sort initialSort exercis after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                └── b width:200 sort:asc
            `);
            await new GridRows(
                api,
                `deprecated sort helpers reflect current sort + absolute-sort initialSort exercis after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(a.isSortAscending()).toBe(true);
            expect(a.isSorting()).toBe(true);

            api.applyColumnState({ state: [{ colId: 'a', sort: 'desc' }] });
            await new GridColumns(
                api,
                `deprecated sort helpers reflect current sort + absolute-sort initialSort exercis after applyColumnState #2`
            ).checkColumns(`
                CENTER
                ├── a width:200 sort:desc
                └── b width:200 sort:asc
            `);
            await new GridRows(
                api,
                `deprecated sort helpers reflect current sort + absolute-sort initialSort exercis after applyColumnState #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(a.isSortDescending()).toBe(true);

            // Absolute-sort initial state surfaces in column state
            const bState = api.getColumnState().find((s) => s.colId === 'b')!;
            expect(bState.sort).toBe('asc');
            expect((bState as any).sortType).toBe('absolute');
        });
    });

    // The row rebuilds its cell ctrls whenever the rendered column set changes, recycling by column
    // identity and deliberately keeping cells the viewport no longer covers.
    describe('cell ctrl recycling and render lanes', () => {
        const virtualisedCols = (count: number): ColDef[] => {
            const cols: ColDef[] = [];
            for (let i = 0; i < count; ++i) {
                cols.push({ colId: `c${i}`, field: `c${i}`, width: 120, editable: true });
            }
            return cols;
        };

        const virtualisedRow = (count: number): Record<string, string> => {
            const row: Record<string, string> = {};
            for (let i = 0; i < count; ++i) {
                row[`c${i}`] = `v${i}`;
            }
            return row;
        };

        const gridRoot = (api: GridApi): HTMLElement => TestGridsManager.getHTMLElement(api)!;

        const renderedCells = (api: GridApi): HTMLElement[] =>
            Array.from(gridRoot(api).querySelectorAll<HTMLElement>('.ag-cell'));

        const cellFor = (api: GridApi, colId: string): HTMLElement | null =>
            gridRoot(api).querySelector<HTMLElement>(`.ag-cell[col-id="${colId}"]`);

        const cellsFor = (api: GridApi, colId: string): HTMLElement[] =>
            Array.from(gridRoot(api).querySelectorAll<HTMLElement>(`.ag-cell[col-id="${colId}"]`));

        const createVirtualisedGrid = (): GridApi =>
            gridsManager.createGrid('virtualisedCells', {
                columnDefs: virtualisedCols(120),
                rowData: [virtualisedRow(120)],
                suppressColumnVirtualisation: false,
            });

        const renderedColIds = (api: GridApi): string[] =>
            renderedCells(api).map((cell) => cell.getAttribute('col-id')!);

        const virtualColIds = (api: GridApi): string[] =>
            api.getAllDisplayedVirtualColumns().map((col) => col.getColId());

        // A cell's element lives in its lane's container, so the lane a cell is rendered into has to
        // track its column's pinning rather than wherever the cell was first built.
        const laneOfCell = (cell: HTMLElement): string | null => {
            if (cell.closest('.ag-grid-pinned-left-cells')) {
                return 'left';
            }
            return cell.closest('.ag-grid-pinned-right-cells') ? 'right' : null;
        };

        const laneOfRenderedCell = (api: GridApi, colId: string): string | null | undefined => {
            const cell = cellFor(api, colId);
            return cell ? laneOfCell(cell) : undefined;
        };

        /** Every rendered cell of every row, judged on the element itself so a second row cannot hide. */
        const expectLanesConsistent = (api: GridApi) => {
            const cells = renderedCells(api);
            expect(cells.length).toBeGreaterThan(0);
            for (const cell of cells) {
                const colId = cell.getAttribute('col-id')!;
                const rowId = cell.closest<HTMLElement>('.ag-row')?.getAttribute('row-id');
                expect({ rowId, colId, lane: laneOfCell(cell) }).toEqual({
                    rowId,
                    colId,
                    lane: api.getColumn(colId)?.getPinned() ?? null,
                });
            }
        };

        // `true` is the legacy spelling of left-pinned, normalised on the way in; the rendered lane has
        // to follow the normalised value.
        test('a focused cell keeps its ctrl across both a short and a long scroll out of the viewport', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.setFocusedCell(0, 'c0');
            await asyncSetTimeout(0);

            // A short scroll moves the viewport by a few columns; a long one replaces it outright.
            for (const colId of ['c12', 'c60']) {
                api.ensureColumnVisible(colId);
                await asyncSetTimeout(0);

                expect(virtualColIds(api)).not.toContain('c0');
                // Destroying it would lose the focus position, which is what breaks keyboard navigation.
                expect(cellFor(api, 'c0')).not.toBeNull();
                expect(api.getFocusedCell()?.column.getColId()).toBe('c0');
            }
        });

        test('an unfocused cell is removed when its column scrolls out of the viewport', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.ensureColumnVisible('c60');
            await asyncSetTimeout(0);
            expect(cellFor(api, 'c60')).not.toBeNull();

            api.ensureColumnVisible('c0');
            await asyncSetTimeout(0);

            expect(cellFor(api, 'c60')).toBeNull();
        });

        test('an editing cell keeps its ctrl when its column scrolls out of the viewport', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.ensureColumnVisible('c60');
            await asyncSetTimeout(0);
            api.startEditingCell({ rowIndex: 0, colKey: 'c60' });
            await asyncSetTimeout(0);
            expect(api.getEditingCells().map((cell) => cell.column?.getColId())).toEqual(['c60']);

            api.ensureColumnVisible('c0');
            await asyncSetTimeout(0);

            expect(cellFor(api, 'c60')).not.toBeNull();
            expect(api.getEditingCells().map((cell) => cell.column?.getColId())).toEqual(['c60']);
        });

        // A short scroll changes the viewport by only a few columns, which is where a row is most likely
        // to keep a cell it should have dropped.
        test('a short scroll leaves the rendered cells matching the virtual columns', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            for (const colId of ['c12', 'c18', 'c90', 'c12', 'c6', 'c0']) {
                api.ensureColumnVisible(colId);
                await asyncSetTimeout(0);

                // A cell added twice, or dropped without its DOM, leaves the two out of step.
                expect(renderedColIds(api)).toEqual(virtualColIds(api));
            }
        });

        // With ordering off the cells are not re-sorted after a change, so the rendered set is all that
        // is promised — and it must still be exactly the virtual columns, with nothing rendered twice.
        test('a short scroll with ensureDomOrder off still renders exactly the virtual columns', async () => {
            const api = gridsManager.createGrid('virtualisedCells', {
                columnDefs: virtualisedCols(120),
                rowData: [virtualisedRow(120)],
                suppressColumnVirtualisation: false,
                ensureDomOrder: false,
            });
            await asyncSetTimeout(0);

            for (const colId of ['c12', 'c18', 'c6']) {
                api.ensureColumnVisible(colId);
                await asyncSetTimeout(0);

                const rendered = renderedColIds(api);
                expect(rendered.slice().sort()).toEqual(virtualColIds(api).slice().sort());
                expect(new Set(rendered).size).toBe(rendered.length);
            }
        });

        // A cell is kept past its column leaving the viewport only while it is focused, so once focus
        // moves on the next change has to drop it.
        test('a retained cell is dropped once it stops being focused', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.setFocusedCell(0, 'c0');
            await asyncSetTimeout(0);

            api.ensureColumnVisible('c12');
            await asyncSetTimeout(0);
            expect(cellFor(api, 'c0')).not.toBeNull();

            // Cleared rather than moved: focusing another column would retain that one in turn, which is
            // correct but would hide whether c0 was dropped.
            api.clearFocusedCell();
            await asyncSetTimeout(0);

            api.ensureColumnVisible('c16');
            await asyncSetTimeout(0);

            expect(virtualColIds(api)).not.toContain('c0');
            expect(cellFor(api, 'c0')).toBeNull();
            expect(renderedColIds(api).slice().sort()).toEqual(virtualColIds(api).slice().sort());
        });

        // A move leaves the column set alone and changes only its order, so a row that tracks only which
        // columns it renders would miss it entirely.
        test('a column move after a short scroll still reorders the rendered cells', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.ensureColumnVisible('c12');
            await asyncSetTimeout(0);

            const moved = virtualColIds(api)[1];
            const movedIndex = api.getAllDisplayedColumns().findIndex((col) => col.getColId() === moved);
            api.moveColumnByIndex(movedIndex, 0);
            await asyncSetTimeout(0);

            expect(api.getAllDisplayedColumns()[0].getColId()).toBe(moved);
            expect(renderedColIds(api)).toEqual(virtualColIds(api));
        });

        // Pinning moves a column out of the centre and into a lane, so the cell has to change container
        // as well as stay rendered.
        test('pinning a column after a short scroll keeps the rendered cells correct', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.ensureColumnVisible('c12');
            await asyncSetTimeout(0);

            const toPin = virtualColIds(api)[2];
            api.setColumnsPinned([toPin], 'left');
            await asyncSetTimeout(0);

            expect(cellFor(api, toPin)).not.toBeNull();
            expect(renderedColIds(api).slice().sort()).toEqual(virtualColIds(api).slice().sort());
        });

        test('a column pinned with `true` renders in the left lane', async () => {
            const cols = virtualisedCols(6);
            cols[1] = { ...cols[1], pinned: true };
            const api = gridsManager.createGrid('truePinnedLane', {
                columnDefs: cols,
                rowData: [virtualisedRow(6)],
            });
            await asyncSetTimeout(0);

            expect(api.getColumn('c1')?.getPinned()).toBe('left');
            expect(laneOfRenderedCell(api, 'c1')).toBe('left');
            expectLanesConsistent(api);
            await new GridColumns(api).checkColumns(`
                LEFT
                └── c1 "C1" width:120 editable
                CENTER
                ├── c0 "C0" width:120 editable
                ├── c2 "C2" width:120 editable
                ├── c3 "C3" width:120 editable
                ├── c4 "C4" width:120 editable
                └── c5 "C5" width:120 editable
            `);
        });

        // Print layout has no pinned lanes. Pinning cannot be changed under it (warning 37), so a
        // colDef is the only way to reach this.
        test('print layout renders a pinned column in the centre lane', async () => {
            const cols = virtualisedCols(6);
            cols[1] = { ...cols[1], pinned: 'left' };
            const api = gridsManager.createGrid('printLayoutLanes', {
                columnDefs: cols,
                rowData: [virtualisedRow(6)],
                domLayout: 'print',
            });
            await asyncSetTimeout(0);

            expect(api.getColumn('c1')?.getPinned()).toBe('left');
            expect(cellFor(api, 'c1')).not.toBeNull();
            expect(laneOfRenderedCell(api, 'c1')).toBeNull();
        });

        // A displayed column group instance is reused across rebuilds, so re-pinning a grouped column has
        // to re-lane the surviving group as well as the column.
        test('re-pinning a grouped column re-lanes its group header', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { headerName: 'G', groupId: 'g', children: [{ colId: 'a', field: 'a' }] },
                { colId: 'b', field: 'b' },
            ];
            const api = gridsManager.createGrid('groupedLanes', {
                columnDefs,
                rowData: [{ a: 'a1', b: 'b1' }],
            });
            await asyncSetTimeout(0);

            const groupHeaderLane = (): string | null | undefined => {
                const header = gridRoot(api).querySelector<HTMLElement>('.ag-header .ag-header-group-cell');
                return header ? laneOfCell(header) : undefined;
            };

            expect(groupHeaderLane()).toBeNull();

            api.setColumnsPinned(['a'], 'right');
            await asyncSetTimeout(0);

            expect(laneOfRenderedCell(api, 'a')).toBe('right');
            expect(groupHeaderLane()).toBe('right');
            expectLanesConsistent(api);

            api.setColumnsPinned(['a'], null);
            await asyncSetTimeout(0);

            expect(laneOfRenderedCell(api, 'a')).toBeNull();
            expect(groupHeaderLane()).toBeNull();
            expectLanesConsistent(api);
        });

        // A cell is rebuilt when its lane changes, so each operation can leave a later one placing a cell
        // in the wrong container. A single operation cannot show that; a sequence can.
        test('lanes stay consistent across a sequence of pin, move, scroll and toggle', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.setColumnsPinned(['c0'], 'left');
            await asyncSetTimeout(0);
            expectLanesConsistent(api);

            api.setColumnsPinned(['c2'], 'right');
            await asyncSetTimeout(0);
            expectLanesConsistent(api);

            api.ensureColumnVisible('c12');
            await asyncSetTimeout(0);
            expectLanesConsistent(api);

            api.moveColumnByIndex(3, 5);
            await asyncSetTimeout(0);
            expectLanesConsistent(api);

            api.setColumnsVisible(['c4'], false);
            await asyncSetTimeout(0);
            expectLanesConsistent(api);

            api.setColumnsPinned(['c0'], null);
            await asyncSetTimeout(0);
            expectLanesConsistent(api);

            api.ensureColumnVisible('c0');
            await asyncSetTimeout(0);
            expectLanesConsistent(api);
        });

        // Adding `rowDrag` gives the cell a handle the existing element cannot absorb, so it is destroyed
        // and rebuilt — and a pinned cell has to be rebuilt back into the lane it came from.
        test('a pinned cell rebuilt by a colDef change keeps its lane and is rendered once', async () => {
            const cols = virtualisedCols(8);
            const api = gridsManager.createGrid('recreateLanes', {
                columnDefs: cols,
                rowData: [virtualisedRow(8)],
                suppressColumnVirtualisation: false,
            });
            await asyncSetTimeout(0);

            api.setColumnsPinned(['c1'], 'left');
            await asyncSetTimeout(0);
            expect(laneOfRenderedCell(api, 'c1')).toBe('left');
            const beforeRebuild = cellFor(api, 'c1');
            expect(beforeRebuild).not.toBeNull();

            api.setGridOption(
                'columnDefs',
                cols.map((col) => (col.colId === 'c1' ? { ...col, pinned: 'left' as const, rowDrag: true } : col))
            );
            await asyncSetTimeout(0);
            api.refreshCells({ force: true });
            await asyncSetTimeout(0);

            expect(cellFor(api, 'c1')).not.toBe(beforeRebuild);
            expect(cellsFor(api, 'c1').length).toBe(1);
            expect(laneOfRenderedCell(api, 'c1')).toBe('left');
            expectLanesConsistent(api);
        });

        // Column spanning gives each row its own column set, so a lane has to be decided per row rather
        // than once for the grid. Only the marked row spans, so the two rows genuinely disagree.
        test('a scroll with column spanning renders each row consistently', async () => {
            const spanIfMarked: ColDef['colSpan'] = (params) => (params.data?.c0 === 'span' ? 2 : 1);
            const cols = virtualisedCols(40).map((col, i) => (i === 3 ? { ...col, colSpan: spanIfMarked } : col));
            cols[1] = { ...cols[1], pinned: 'left' };
            const api = gridsManager.createGrid('spanLanes', {
                columnDefs: cols,
                rowData: [{ ...virtualisedRow(40), c0: 'span' }, virtualisedRow(40)],
                suppressColumnVirtualisation: false,
            });
            await asyncSetTimeout(0);

            for (const colId of ['c10', 'c20', 'c4', 'c0']) {
                api.ensureColumnVisible(colId);
                await asyncSetTimeout(0);
                expectLanesConsistent(api);
            }

            // c3 swallows c4 in the spanning row only, so the two rows must not render the same columns.
            const rows = Array.from(gridRoot(api).querySelectorAll<HTMLElement>('.ag-row'));
            const colIdsOf = (row: HTMLElement): string[] =>
                Array.from(row.querySelectorAll<HTMLElement>('.ag-cell')).map((cell) => cell.getAttribute('col-id')!);
            expect(rows.length).toBe(2);
            expect(colIdsOf(rows[0])).toContain('c3');
            expect(colIdsOf(rows[0])).not.toContain('c4');
            expect(colIdsOf(rows[1])).toContain('c4');
        });

        // Recycling is by column identity, so a reorder must not rebuild a cell that is still rendered.
        test('a column move recycles the rendered cells rather than rebuilding them', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            const before = cellFor(api, 'c1');
            expect(before).not.toBeNull();

            api.moveColumnByIndex(0, 3);
            await asyncSetTimeout(0);

            expect(api.getAllDisplayedColumns()[3].getColId()).toBe('c0');
            expect(cellFor(api, 'c1')).toBe(before);
        });

        // A retained cell keeps its element and so its container. Unpinning a cell held only by focus is
        // the one way to re-lane it while it is in no lane's column list, where nothing else would notice.
        test('a cell retained by focus is rebuilt when its column is unpinned out of view', async () => {
            const api = createVirtualisedGrid();
            await asyncSetTimeout(0);

            api.setColumnsPinned(['c0'], 'left');
            api.setFocusedCell(0, 'c0');
            await asyncSetTimeout(0);
            expect(laneOfRenderedCell(api, 'c0')).toBe('left');

            api.ensureColumnVisible('c40');
            await asyncSetTimeout(0);
            expect(laneOfRenderedCell(api, 'c0')).toBe('left');

            api.setColumnsPinned(['c0'], null);
            await asyncSetTimeout(0);

            expect(virtualColIds(api)).not.toContain('c0');
            expect(api.getFocusedCell()?.column.getColId()).toBe('c0');
            expect(cellsFor(api, 'c0').length).toBe(1);
            expect(laneOfRenderedCell(api, 'c0')).toBeNull();
            expectLanesConsistent(api);
        });

        // Full-row editing makes every cell of the row worth retaining, so a scroll that takes them all out
        // of the viewport retains the whole row at once.
        test('a full-row edit retains every cell across a scroll', async () => {
            const api = gridsManager.createGrid('fullRowRetention', {
                columnDefs: virtualisedCols(120),
                rowData: [virtualisedRow(120)],
                suppressColumnVirtualisation: false,
                editType: 'fullRow',
            });
            await asyncSetTimeout(0);

            api.startEditingCell({ rowIndex: 0, colKey: 'c0' });
            await asyncSetTimeout(0);
            expect(api.getEditingCells().length).toBeGreaterThan(1);

            const renderedBefore = renderedColIds(api);
            api.ensureColumnVisible('c60');
            await asyncSetTimeout(0);

            const rendered = renderedColIds(api);
            // Every cell the edit held on to is still there, exactly once, alongside the new viewport.
            expect(new Set(rendered).size).toBe(rendered.length);
            for (const colId of renderedBefore) {
                expect(rendered).toContain(colId);
            }
            expect(rendered).toContain('c60');
            expectLanesConsistent(api);
        });
    });
});
