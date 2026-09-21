import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
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

    const gridOptions = { columnDefs: [{ field: 'a' }], rowData: [], debug: true };

    // The enterprise licence banner is printed from a bean's `postConstruct` and fills the console, so
    // the version line is only readable once every bean has had its say.
    test.each<[string, TestGridsManager]>([
        ['community', gridsManager],
        ['enterprise', enterpriseGridsManager],
    ])('logs the grid version after the bean debug output for a %s grid', (_edition, manager) => {
        manager.createGrid('myGrid', gridOptions);

        const messages = loggedMessages();
        const versionIndex = messages.findIndex((message) => message.includes(`Version: ag-grid-community=${VERSION}`));
        const rowContainerIndex = messages.findIndex((message) => message.includes('RowContainerHeightService'));

        expect(versionIndex).toBeGreaterThanOrEqual(0);
        expect(rowContainerIndex).toBeGreaterThanOrEqual(0);
        expect(versionIndex).toBeGreaterThan(rowContainerIndex);
    });

    test('logs no version line when debug is not enabled', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
        });

        expect(loggedMessages().some((message) => message.includes('Version: ag-grid-community='))).toBe(false);
    });
});
