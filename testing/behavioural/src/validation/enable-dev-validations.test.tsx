import type { MockInstance } from 'vitest';

import { AllCommunityModule, createGrid, enableDevValidations } from 'ag-grid-community';

// Module registration is global and persists for the lifetime of this test file, so the
// before-opt-in and after-opt-in assertions must run in order within a single test.
describe('enableDevValidations', () => {
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        vitest.spyOn(console, 'error').mockImplementation(() => {});
        document.body.innerHTML = '<div id="grid1"></div><div id="grid2"></div>';
    });

    afterEach(() => {
        vitest.restoreAllMocks();
    });

    test('validations are off until opted into, then on after enableDevValidations()', () => {
        const invalidOptions = {
            columnDefs: [],
            rowData: [],
            ['notARealOption' as any]: true,
        };
        const hasInvalidPropertyWarning = () =>
            consoleWarnSpy.mock.calls.some((args) =>
                args.join(' ').includes('Invalid `gridOptions` property `notARealOption`')
            );

        // AllCommunityModule no longer bundles the ValidationModule, so an invalid grid option is
        // silently ignored - no validation warning is produced.
        createGrid(document.getElementById('grid1')!, invalidOptions, { modules: [AllCommunityModule] });
        expect(hasInvalidPropertyWarning()).toBe(false);

        enableDevValidations();

        // Once opted in, the same invalid option produces the validation warning.
        consoleWarnSpy.mockClear();
        createGrid(document.getElementById('grid2')!, invalidOptions, { modules: [AllCommunityModule] });
        expect(hasInvalidPropertyWarning()).toBe(true);
    });
});
