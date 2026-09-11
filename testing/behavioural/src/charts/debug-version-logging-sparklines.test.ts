import { AgChartsCommunityModule } from 'ag-charts-community';
import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { SparklinesModule } from 'ag-grid-enterprise';

import { VERSION } from '../version';

describe('debug version logging with sparklines', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SparklinesModule.with(AgChartsCommunityModule)],
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

    test('labels the AG Charts Community build used by sparklines', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
            debug: true,
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=${VERSION}, AG Charts Community=${AgChartsCommunityModule.VERSION}`
        );
    });
});
