import type { MockInstance } from 'vitest';

import { AllCommunityModule } from '../allCommunityModule';
import { createGrid } from '../grid';
import { enableDevValidations } from './validationModule';

// A package test: the behavioural setup opts every test into validations, and registration is one-way, so
// the default-off state is only observable in the fresh module graph per-file isolation gives this file.
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
