/*
 * Issue: `colDef.icons.rowDrag` is ignored by the row drag handle. Only the grid-level `icons.rowDrag`
 * option changes the handle icon.
 *
 * Setup: RowDragModule, Client-Side Row Model, one column
 * `{ field: 'name', rowDrag: true, icons: { rowDrag: '<span class="custom-row-drag">X</span>' } }`.
 *
 * Expected: `colDef.icons` is documented (colDef.ts) as "Icons to use inside the column instead of the
 * grid's default icons", and `_createIconNoSpan` checks the column's `icons` before the grid option, so
 * the row drag handle should show the column-level icon.
 *
 * Actual: rowDragComp.ts calls `_createIconNoSpan('rowDrag', beans, null)` with no column, so the
 * column-level icons are never consulted and the default icon is rendered.
 *
 * Reported on grid version: React 34.2.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 34.2.0 searched, in
 * August 2026, "rowDrag column drag handle icon not showing custom icons.rowDrag".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, RowDragModule } from 'ag-grid-community';

describe('rowDrag column icons', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule],
    });

    afterEach(() => gridsManager.reset());

    test('colDef.icons.rowDrag is used for the row drag handle', async () => {
        await gridsManager.createGridAndWait('rowDragIcons', {
            columnDefs: [
                { field: 'name', rowDrag: true, icons: { rowDrag: '<span class="custom-row-drag">X</span>' } },
            ],
            rowData: [{ name: 'a' }, { name: 'b' }],
        });

        expect(document.querySelector('.ag-row .ag-drag-handle .custom-row-drag')).not.toBeNull();
    });
});
