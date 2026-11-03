/**
 * Issue: when `valueCache` is on, a `valueGetter` that returns an expression string (starting with '=') is not
 * evaluated as a cell expression. The grid shows the raw string instead of the result. The column value and the
 * cell expression result share one cache slot, so the cached getter result is returned in place of the evaluation.
 *
 * Setup: `enableCellExpressions` and `valueCache` both on, with a column whose `valueGetter` returns '=1+2'.
 *
 * Expected: the Cell Expressions docs say "To enable cell expressions, set `enableCellExpressions=true` in the
 * gridOptions. Then, whenever the grid comes across a value starting with '=', it will treat it as an expression."
 * The Value Cache docs describe the cache as only avoiding re-execution of getters, so it must not change values.
 * The cell value is therefore 3, as it is with `valueCache` off.
 *
 * Actual: the cell value is the string '=1+2'.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Value getters and the value cache for AG-18665.
 */
import { TestGridsManager } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValueCacheModule } from 'ag-grid-community';

describe('cell expressions returned by a valueGetter with valueCache', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, ValueCacheModule] });

    afterEach(() => gridMgr.reset());

    async function getSumCellValue(options: GridOptions) {
        const api = await gridMgr.createGridAndWait('grid', {
            enableCellExpressions: true,
            rowData: [{ a: 1, b: 2 }],
            columnDefs: [{ colId: 'sum', valueGetter: (p) => '=' + p.data.a + '+' + p.data.b }],
            ...options,
        });
        return api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum' });
    }

    test('the expression is evaluated with valueCache off', async () => {
        expect(await getSumCellValue({ valueCache: false })).toBe(3);
    });

    test('the expression is evaluated with valueCache on', async () => {
        expect(await getSumCellValue({ valueCache: true })).toBe(3);
    });
});
