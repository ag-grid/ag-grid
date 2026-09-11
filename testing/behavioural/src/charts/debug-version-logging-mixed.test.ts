import { AgChartsCommunityModule } from 'ag-charts-community';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { IntegratedChartsModule, SparklinesModule } from 'ag-grid-enterprise';

import { VERSION } from '../version';

// Two `.with()` calls in one process, each given a different AG Charts build. The version reported
// for a grid must come from the modules that grid registered, not from whichever call ran last.
describe('debug version logging with differently configured charts modules', () => {
    const integratedChartsEnterprise = IntegratedChartsModule.with(AgChartsEnterpriseModule);
    const sparklinesCommunity = SparklinesModule.with(AgChartsCommunityModule);

    const integratedChartsOnlyGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, integratedChartsEnterprise],
    });
    const bothGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, integratedChartsEnterprise, sparklinesCommunity],
    });
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        consoleLogSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        integratedChartsOnlyGrids.reset();
        bothGrids.reset();
        consoleLogSpy.mockRestore();
    });

    const gridOptions = { columnDefs: [{ field: 'a' }], rowData: [], debug: true };

    test('reports only the build the registered module was given', () => {
        integratedChartsOnlyGrids.reset();

        integratedChartsOnlyGrids.createGrid('myGrid', gridOptions);

        expect(consoleLogSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=${VERSION}, AG Charts Enterprise=${AgChartsEnterpriseModule.VERSION}`
        );
    });

    test('reports both builds when the grid registers both modules', () => {
        bothGrids.reset();

        bothGrids.createGrid('myGrid', gridOptions);

        expect(consoleLogSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=${VERSION}, ` +
                `AG Charts Enterprise=${AgChartsEnterpriseModule.VERSION}, AG Charts Community=${AgChartsCommunityModule.VERSION}`
        );
    });
});
