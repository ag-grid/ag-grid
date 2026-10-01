import { TestGridsManager } from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, ValidationModule, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { VERSION } from '../version';

describe('debug version logging', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });
    const enterpriseGridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        consoleLogSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
        gridsManager.reset();
        enterpriseGridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        enterpriseGridsManager.reset();
        consoleLogSpy.mockRestore();
    });

    const loggedMessages = () => consoleLogSpy.mock.calls.map(([message]) => String(message));
    const hasVersionLine = () => loggedMessages().some((message) => message.includes('Version: ag-grid-community='));
    const hasInitialisedLine = () =>
        loggedMessages().some((message) => message.includes('AG Grid: initialised successfully'));

    const gridOptions = { columnDefs: [{ field: 'a' }], rowData: [] };

    // The enterprise licence banner is printed from a bean's `postConstruct` and fills the console, so
    // the version line is only readable once every bean has had its say.
    test.each<[string, TestGridsManager]>([
        ['community', gridsManager],
        ['enterprise', enterpriseGridsManager],
    ])('logs the grid version after the bean debug output for a %s grid', (_edition, manager) => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, debug: true });

        manager.createGrid('myGrid', gridOptions);

        const messages = loggedMessages();
        const versionIndex = messages.findIndex((message) => message.includes(`Version: ag-grid-community=${VERSION}`));
        const rowContainerIndex = messages.findIndex((message) => message.includes('RowContainerHeightService'));

        expect(versionIndex).toBeGreaterThanOrEqual(0);
        expect(rowContainerIndex).toBeGreaterThanOrEqual(0);
        expect(versionIndex).toBeGreaterThan(rowContainerIndex);
    });

    test('logs no version line when debug is not enabled', () => {
        gridsManager.createGrid('myGrid', gridOptions);

        expect(hasVersionLine()).toBe(false);
        expect(hasInitialisedLine()).toBe(false);
    });

    test('a later enableDevValidations call without debug turns debug logging off', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, debug: true });
        enableDevValidations({ throwOn: ALL_SEVERITIES });

        gridsManager.createGrid('myGrid', gridOptions);

        expect(hasVersionLine()).toBe(false);
        expect(hasInitialisedLine()).toBe(false);
    });

    test('registering the bare ValidationModule after ValidationModule.with({ debug: true }) keeps debug on', () => {
        const validationWithDebug = ValidationModule.with({ throwOn: ALL_SEVERITIES, debug: true });
        const manager = new TestGridsManager({
            modules: [ClientSideRowModelModule, validationWithDebug, ValidationModule],
        });

        try {
            manager.createGrid('myGrid', gridOptions);

            expect(hasInitialisedLine()).toBe(true);
            expect(hasVersionLine()).toBe(true);
        } finally {
            manager.reset();
        }
    });

    describe('deprecated gridOptions.debug', () => {
        let consoleWarnSpy: MockInstance;

        beforeEach(() => {
            // `debug` raises a deprecation, which the global setup would otherwise throw on.
            enableDevValidations({ throwOn: [] });
            consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            consoleWarnSpy.mockRestore();
        });

        test('still logs debug output', () => {
            gridsManager.createGrid('myGrid', { ...gridOptions, debug: true });

            expect(hasInitialisedLine()).toBe(true);
            expect(hasVersionLine()).toBe(true);
        });

        test('raises a deprecation naming enableDevValidations({ debug: true }) as the replacement', () => {
            gridsManager.createGrid('myGrid', { ...gridOptions, debug: true });

            const debugDeprecations = consoleWarnSpy.mock.calls.filter((args) => {
                const text = args.join(' ');
                return (
                    text.includes('warning #306') &&
                    text.includes('`debug` is deprecated') &&
                    text.includes('`enableDevValidations({ debug: true })`')
                );
            });
            expect(debugDeprecations).toHaveLength(1);
        });
    });
});
