import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { VERSION } from '../version';

describe('debug version logging', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        consoleLogSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleLogSpy.mockRestore();
    });

    const loggedMessages = () => consoleLogSpy.mock.calls.map(([message]) => String(message));

    test('logs the grid version before the other debug output', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
            debug: true,
        });

        const messages = loggedMessages();
        const versionIndex = messages.indexOf(`AG Grid: Version: AG Grid Community=${VERSION}`);
        const rowContainerIndex = messages.findIndex((message) => message.includes('RowContainerHeightService'));

        expect(versionIndex).toBeGreaterThanOrEqual(0);
        expect(rowContainerIndex).toBeGreaterThanOrEqual(0);
        expect(versionIndex).toBeLessThan(rowContainerIndex);
    });

    test('logs no version line when debug is not enabled', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
        });

        expect(loggedMessages().some((message) => message.includes('Version: AG Grid Community='))).toBe(false);
    });
});
