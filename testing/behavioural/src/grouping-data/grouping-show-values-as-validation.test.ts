import { vi } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ServerSideRowModelModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Show Values As is clientSide-only. On other row models the property is inert, and the user must be told the
 * real reason — "not supported with this row model" — rather than a misleading "module not registered" error
 * for a module they did register.
 */
describe('showValuesAs row-model validation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ShowValuesAsModule],
    });

    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
        errorSpy.mockRestore();
        gridsManager.reset();
    });

    const ssrmOptions = (): Partial<GridOptions> => ({
        rowModelType: 'serverSide',
        serverSideDatasource: {
            getRows: (params) => params.success({ rowData: [{ amount: 10 }], rowCount: 1 }),
        },
    });

    test('on serverSide with the module registered, warns it is not supported with this row model', async () => {
        gridsManager.createGrid('sva-ssrm', {
            ...ssrmOptions(),
            columnDefs: [{ field: 'amount', showValuesAs: 'percentOfGrandTotal' }],
        });
        await asyncSetTimeout(1);

        // The accurate row-model message fires (note the value-name → message text in validationService).
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #309'),
            expect.stringContaining('`showValuesAs` is not supported with the `serverSide` row model'),
            expect.any(String)
        );
    });

    test('on serverSide the misleading "module not registered" error is NOT emitted for showValuesAs', async () => {
        gridsManager.createGrid('sva-ssrm-no-module-error', {
            ...ssrmOptions(),
            columnDefs: [
                { field: 'amount', showValuesAs: 'percentOfGrandTotal' },
                { field: 'units', initialShowValuesAs: 'percentOfGrandTotal' },
            ],
        });
        await asyncSetTimeout(1);

        // No console.error should mention the ShowValuesAs module — the gate skips the registration check off CSRM.
        for (const call of errorSpy.mock.calls) {
            expect(String(call[0])).not.toContain('ShowValuesAs');
        }
    });
});
