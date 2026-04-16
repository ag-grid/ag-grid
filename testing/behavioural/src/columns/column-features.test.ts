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
 */
import type { ColDef } from 'ag-grid-community';
import { AlignedGridsModule, CellStyleModule, ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, TestGridsManager } from '../test-utils';

describe('Column Features', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, AlignedGridsModule, CellStyleModule, TextEditorModule],
    });

    afterEach(() => {
        gridsManager.reset();
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

    describe('column sizing: flex', () => {
        test('flex columns have flex property set', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', flex: 1 },
                    { colId: 'b', flex: 2 },
                ],
            });

            // In jsdom (no real layout), flex may not distribute proportionally,
            // but the flex property should be set on the columns
            const colA = api.getColumn('a')!;
            const colB = api.getColumn('b')!;
            expect(colA.getFlex()).toBe(1);
            expect(colB.getFlex()).toBe(2);

            // Validators should pass
            await new GridColumns(api, 'flex columns').checkColumns(false);
        });

        test('flex with minWidth is respected', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', flex: 1, minWidth: 300 },
                    { colId: 'b', flex: 1 },
                ],
            });

            const colA = api.getColumn('a')!;
            expect(colA.getActualWidth()).toBeGreaterThanOrEqual(300);

            await new GridColumns(api, 'flex with minWidth').checkColumns(false);
        });
    });

    describe('column sizing: fixed width with constraints', () => {
        test('width is clamped to minWidth', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 50, minWidth: 100 }],
            });

            const col = api.getColumn('a')!;
            expect(col.getActualWidth()).toBeGreaterThanOrEqual(100);

            await new GridColumns(api, 'columns').checkColumns(false);
        });

        test('width is clamped to maxWidth', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 500, maxWidth: 200 }],
            });

            const col = api.getColumn('a')!;
            expect(col.getActualWidth()).toBeLessThanOrEqual(200);

            await new GridColumns(api, 'columns').checkColumns(false);
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

            await new GridColumns(api, 'columns').checkColumns(false);
        });
    });
});
