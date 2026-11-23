/*
 * Issue: size-to-fit resizes the selection (checkbox) column along with the other columns, although the docs say
 * the checkbox column is sized statically.
 *
 * Setup: ClientSideRowModelModule, RowSelectionModule and ColumnAutoSizeModule registered, three 200px columns and
 * `rowSelection: { mode: 'multiRow' }`, so the grid adds its 50px selection column. The columns are then sized to fit
 * 1000px, either with `api.sizeColumnsToFit(1000)` or with `autoSizeStrategy: { type: 'fitProvidedWidth' }`.
 *
 * Expected: the Multiple Row Selection docs (Customising the Checkbox Column) say "The checkbox column is sized
 * statically, and is therefore not affected by Auto-Sizing", linking to the Column Sizing section that covers
 * size-to-fit, so the selection column stays 50px wide.
 *
 * Actual: the selection column is scaled with the other columns, to 76px here.
 *
 * Reported on: Angular 34.3.1.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent using the Angular docs (34.3.1, Apr 2026)
 * searched for "selectionColumnDef suppressSizeToFit prevent checkbox column resize sizeColumnsToFit".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, ColumnAutoSizeModule, RowSelectionModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';

const SELECTION_COLUMN_ID = 'ag-Grid-SelectionColumn';

// TODO: disabled due to AG-19388 - re-enable once fixed
describe.skip('selection column and size-to-fit', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowSelectionModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const baseOptions: GridOptions = {
        columnDefs: [
            { field: 'make', width: 200 },
            { field: 'model', width: 200 },
            { field: 'price', width: 200 },
        ],
        rowData: [{ make: 'Tesla', model: 'Model Y', price: 64950 }],
        rowSelection: { mode: 'multiRow' },
    };

    const selectionWidth = (api: GridApi) => api.getColumn(SELECTION_COLUMN_ID)!.getActualWidth();

    test('api.sizeColumnsToFit() leaves the selection column at 50px', () => {
        const api = gridMgr.createGrid('size-to-fit-api', baseOptions);
        expect(selectionWidth(api)).toBe(50);

        api.sizeColumnsToFit(1000);

        expect(api.getColumn('make')!.getActualWidth()).toBeGreaterThan(200);
        expect(selectionWidth(api)).toBe(50);
    });

    test("autoSizeStrategy 'fitProvidedWidth' leaves the selection column at 50px", async () => {
        const api = gridMgr.createGrid('size-to-fit-strategy', {
            ...baseOptions,
            autoSizeStrategy: { type: 'fitProvidedWidth', width: 1000 },
        });

        await vi.waitFor(() => expect(api.getColumn('make')!.getActualWidth()).toBeGreaterThan(200));
        expect(selectionWidth(api)).toBe(50);
    });
});
