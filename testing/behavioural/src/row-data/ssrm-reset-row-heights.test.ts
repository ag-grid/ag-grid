import type { GridOptions } from 'ag-grid-community';
import { RowAutoHeightModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * `api.resetRowHeights()` is a shared row-model API usable under the Server-Side Row Model.
 * It recomputes row heights, but recomputing makes no sense when Auto Row Height is active
 * (heights are measured from content, not from the row-height option). In that case the call
 * must warn the user and no-op.
 *
 * Pinned through the public API and the user-visible console warning — no reaching into beans.
 */
describe('SSRM resetRowHeights', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowAutoHeightModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `Row ${i}` }));

    function baseGridOptions(overrides: Partial<GridOptions> = {}): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: rowData.length });
                },
            },
            ...overrides,
        };
    }

    test('resetRowHeights works without warning when auto row height is off', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid(null, baseGridOptions());
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.resetRowHeights();

        expect(consoleWarnSpy).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    test('resetRowHeights warns and no-ops when auto row height is active', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid(
            null,
            baseGridOptions({
                columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true, wrapText: true }],
            })
        );
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.resetRowHeights();

        expect(consoleWarnSpy).toHaveBeenCalled();
        const warnedAboutAutoHeight = consoleWarnSpy.mock.calls.some((args) =>
            args.some(
                (arg) => typeof arg === 'string' && arg.includes('resetRowHeights') && arg.includes('Auto Row Height')
            )
        );
        expect(warnedAboutAutoHeight).toBe(true);

        consoleWarnSpy.mockRestore();
    });
});
