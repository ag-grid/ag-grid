import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
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
        consoleLogSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        integratedChartsGrids.reset();
        allEnterpriseGrids.reset();
        consoleLogSpy.mockRestore();
    });

    const expectedMessage = `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=${VERSION}, AG Charts Enterprise=${AgChartsEnterpriseModule.VERSION}`;

    test.each([
        ['IntegratedChartsModule.with()', () => integratedChartsGrids],
        ['AllEnterpriseModule.with()', () => allEnterpriseGrids],
    ])('logs every package version for %s', (_name, getGridsManager) => {
        getGridsManager().createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            rowData: [],
            debug: true,
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(expectedMessage);
    });
});
