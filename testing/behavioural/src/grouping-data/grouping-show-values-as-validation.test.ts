import { vi } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ServerSideRowModelModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Show Values As is clientSide-only. On other row models the property is inert, and the user must be told the
 * real reason — "not supported with this row model" — rather than a misleading "module not registered" error
 * for a module they did register.
 */
describe('showValueAs row-model validation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ShowValueAsModule],
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
            columnDefs: [{ field: 'amount', showValueAs: 'percentOfGrandTotal' }],
        });
        await asyncSetTimeout(1);

        // The accurate row-model message fires (note the value-name → message text in validationService).
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("showValueAs is not supported with the 'serverSide' row model")
        );
    });

    test('on serverSide the misleading "module not registered" error is NOT emitted for showValueAs', async () => {
        gridsManager.createGrid('sva-ssrm-no-module-error', {
            ...ssrmOptions(),
            columnDefs: [
                { field: 'amount', showValueAs: 'percentOfGrandTotal' },
                { field: 'units', showValueAsInitial: 'percentOfGrandTotal' },
            ],
        });
        await asyncSetTimeout(1);

        // No console.error should mention the ShowValueAs module — the gate skips the registration check off CSRM.
        for (const call of errorSpy.mock.calls) {
            expect(String(call[0])).not.toContain('ShowValueAs');
        }
    });
});
