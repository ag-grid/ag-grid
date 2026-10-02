import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager } from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule, CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

import { VERSION } from '../version';

describe('debug version logging with integrated charts', () => {
    const integratedChartsGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });
    const allEnterpriseGrids = new TestGridsManager({
        modules: [AllEnterpriseModule.with(AgChartsEnterpriseModule)],
    });
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, debug: true });
        consoleLogSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        integratedChartsGrids.reset();
        allEnterpriseGrids.reset();
        consoleLogSpy.mockRestore();
    });

    const expectedMessage = `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=${VERSION}, ag-charts-enterprise=${AgChartsEnterpriseModule.VERSION}`;

    test.each([
        ['IntegratedChartsModule.with()', () => integratedChartsGrids],
        ['AllEnterpriseModule.with()', () => allEnterpriseGrids],
    ])('logs every package version for %s', (_name, getGridsManager) => {
        getGridsManager().createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(expectedMessage);
    });
});
