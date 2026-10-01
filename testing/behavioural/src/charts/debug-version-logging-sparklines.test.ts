import { AgChartsCommunityModule } from 'ag-charts-community';
import { TestGridsManager } from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { SparklinesModule } from 'ag-grid-enterprise';

import { VERSION } from '../version';

describe('debug version logging with sparklines', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SparklinesModule.with(AgChartsCommunityModule)],
    });
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, debug: true });
        consoleLogSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleLogSpy.mockRestore();
    });

    test('names the ag-charts-community package used by sparklines', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(
            `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=${VERSION}, ag-charts-community=${AgChartsCommunityModule.VERSION}`
        );
    });
});
