import type { MockInstance } from 'vitest';

import type { Module } from './interfaces/iModule';
import { VERSION } from './version';

const enterpriseCore = { moduleName: 'EnterpriseCore', version: '1.2.3' } as Module;

// Fresh objects per test: the package info is keyed on the module instance, exactly as
// `IntegratedChartsModule.with()` / `SparklinesModule.with()` return a new module per call.
const newIntegratedCharts = () => ({ moduleName: 'IntegratedCharts' }) as Module;
const newSparklines = () => ({ moduleName: 'Sparklines' }) as Module;
const newStudio = () => ({ moduleName: 'Studio' }) as unknown as Module;

describe('_logVersionIfDebug', () => {
    let logSpy: MockInstance;

    beforeEach(() => {
        vitest.resetModules();
        logSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    const loadModule = () => import('./logVersion');

    test.each([[undefined], [false]])('logs nothing when debug is %s', async (debug) => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(debug, [newIntegratedCharts(), enterpriseCore], 'before-beans');
        _logVersionIfDebug(debug, [newIntegratedCharts(), enterpriseCore], 'after-beans');

        expect(logSpy).not.toHaveBeenCalled();
    });

    test('logs the community version alone for a community-only grid', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [], 'before-beans');

        expect(logSpy).toHaveBeenCalledWith(`AG Grid: Version: ag-grid-community=${VERSION}`);
    });

    test('logs the enterprise package version separately when enterprise is registered', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [enterpriseCore], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(`AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=1.2.3`);
    });

    test.each([['ag-charts-enterprise'], ['ag-charts-community']])(
        'names the registered package %s',
        async (packageName) => {
            const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
            const integratedCharts = newIntegratedCharts();
            _setAgPackageInfo(integratedCharts, packageName, '9.9.9');

            _logVersionIfDebug(true, [enterpriseCore, integratedCharts], 'after-beans');

            expect(logSpy).toHaveBeenCalledWith(
                `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=1.2.3, ${packageName}=9.9.9`
            );
        }
    );

    test('reports AG Studio when its module is registered', async () => {
        const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
        const studio = newStudio();
        _setAgPackageInfo(studio, 'ag-studio', '2.0.0');

        _logVersionIfDebug(true, [enterpriseCore, studio], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=1.2.3, ag-studio=2.0.0`
        );
    });

    test('logs the AG Charts version for a sparklines-only grid', async () => {
        const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
        const sparklines = newSparklines();
        _setAgPackageInfo(sparklines, 'ag-charts-community', '9.9.9');

        _logVersionIfDebug(true, [enterpriseCore, sparklines], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ag-charts-community=9.9.9'));
    });

    test('omits the AG Charts clause for a grid that uses no charts modules', async () => {
        const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
        _setAgPackageInfo(newIntegratedCharts(), 'ag-charts-enterprise', '9.9.9');

        _logVersionIfDebug(true, [enterpriseCore], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(expect.not.stringContaining('ag-charts'));
    });

    test('omits the AG Charts clause when no charts version was pushed in', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [enterpriseCore, newIntegratedCharts()], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(expect.not.stringContaining('ag-charts'));
    });

    test("reports this grid's own charts build when another module was given a different one", async () => {
        const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        _setAgPackageInfo(integratedCharts, 'ag-charts-enterprise', '9.9.9');
        // A second `.with()` call elsewhere in the app, never registered for this grid.
        _setAgPackageInfo(newSparklines(), 'ag-charts-community', '8.8.8');

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=1.2.3, ag-charts-enterprise=9.9.9`
        );
    });

    test('lists every distinct charts build registered for the grid', async () => {
        const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        const sparklines = newSparklines();
        _setAgPackageInfo(integratedCharts, 'ag-charts-enterprise', '9.9.9');
        _setAgPackageInfo(sparklines, 'ag-charts-community', '8.8.8');

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts, sparklines], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=1.2.3, ` +
                'ag-charts-enterprise=9.9.9, ag-charts-community=8.8.8'
        );
    });

    test('de-duplicates the clause when both charts modules share one build', async () => {
        const { _logVersionIfDebug, _setAgPackageInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        const sparklines = newSparklines();
        _setAgPackageInfo(integratedCharts, 'ag-charts-enterprise', '9.9.9');
        _setAgPackageInfo(sparklines, 'ag-charts-enterprise', '9.9.9');

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts, sparklines], 'after-beans');

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: ag-grid-community=${VERSION}, ag-grid-enterprise=1.2.3, ag-charts-enterprise=9.9.9`
        );
    });

    test('logs a community grid before the beans are built, and not after', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [], 'after-beans');
        expect(logSpy).not.toHaveBeenCalled();

        _logVersionIfDebug(true, [], 'before-beans');
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    // The enterprise licence banner is printed from a bean's `postConstruct`, and the version line is
    // easy to miss above it.
    test('logs an enterprise grid after the beans are built, and not before', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [enterpriseCore], 'before-beans');
        expect(logSpy).not.toHaveBeenCalled();

        _logVersionIfDebug(true, [enterpriseCore], 'after-beans');
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});
