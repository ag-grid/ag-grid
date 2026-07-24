import type { MockInstance } from 'vitest';

import { AllCommunityModule } from '../allCommunityModule';
import { createGrid } from '../grid';
import { enableDevValidations } from './validationModule';

// Lives as a package unit test rather than in the behavioural suite: the behavioural global setup opts
// every test into dev validations before it runs, whereas this pins the *default-off* contract — that
// AllCommunityModule alone leaves validation disabled until enableDevValidations() is called — so it must
// run where that hook is absent. Registration is process-global, so the before/after assertions run in
// order within one test (Vitest isolates module state per file).
describe('enableDevValidations', () => {
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        document.body.innerHTML = '<div id="grid1"></div><div id="grid2"></div>';
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

        // AllCommunityModule does not bundle the ValidationModule, so an invalid grid option is silently
        // ignored - no validation warning is produced.
        createGrid(document.getElementById('grid1')!, invalidOptions, { modules: [AllCommunityModule] });
        expect(hasInvalidPropertyWarning()).toBe(false);

        enableDevValidations();

        // Once opted in, the same invalid option produces the validation warning.
        consoleWarnSpy.mockClear();
        createGrid(document.getElementById('grid2')!, invalidOptions, { modules: [AllCommunityModule] });
        expect(hasInvalidPropertyWarning()).toBe(true);
    });
});
