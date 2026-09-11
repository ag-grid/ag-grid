import type { MockInstance } from 'vitest';

import type { Module } from './interfaces/iModule';
import { VERSION } from './version';

const enterpriseCore = { moduleName: 'EnterpriseCore', version: '1.2.3' } as Module;

// Fresh objects per test: the charts info is keyed on the module instance, exactly as
// `IntegratedChartsModule.with()` / `SparklinesModule.with()` return a new module per call.
const newIntegratedCharts = () => ({ moduleName: 'IntegratedCharts' }) as Module;
const newSparklines = () => ({ moduleName: 'Sparklines' }) as Module;

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

        _logVersionIfDebug(debug, [newIntegratedCharts(), enterpriseCore]);

        expect(logSpy).not.toHaveBeenCalled();
    });

    test('logs the community version alone for a community-only grid', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, []);

        expect(logSpy).toHaveBeenCalledWith(`AG Grid: Version: AG Grid Community=${VERSION}`);
    });

    test('logs the enterprise package version separately when enterprise is registered', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [enterpriseCore]);

        expect(logSpy).toHaveBeenCalledWith(`AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=1.2.3`);
    });

    test.each([
        [true, 'Enterprise'],
        [false, 'Community'],
    ])('labels the AG Charts edition from isEnterprise=%s', async (isEnterprise, label) => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        _setAgChartsInfo(integratedCharts, '9.9.9', isEnterprise);

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts]);

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=1.2.3, AG Charts ${label}=9.9.9`
        );
    });

    test('logs the AG Charts version for a sparklines-only grid', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        const sparklines = newSparklines();
        _setAgChartsInfo(sparklines, '9.9.9', false);

        _logVersionIfDebug(true, [enterpriseCore, sparklines]);

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('AG Charts Community=9.9.9'));
    });

    test('omits the AG Charts clause for a grid that uses no charts modules', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        _setAgChartsInfo(newIntegratedCharts(), '9.9.9', true);

        _logVersionIfDebug(true, [enterpriseCore]);

        expect(logSpy).toHaveBeenCalledWith(expect.not.stringContaining('AG Charts'));
    });

    test('omits the AG Charts clause when no charts version was pushed in', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [enterpriseCore, newIntegratedCharts()]);

        expect(logSpy).toHaveBeenCalledWith(expect.not.stringContaining('AG Charts'));
    });

    test('reports this grid\'s own charts build when another module was given a different one', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        _setAgChartsInfo(integratedCharts, '9.9.9', true);
        // A second `.with()` call elsewhere in the app, never registered for this grid.
        _setAgChartsInfo(newSparklines(), '8.8.8', false);

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts]);

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=1.2.3, AG Charts Enterprise=9.9.9`
        );
    });

    test('lists every distinct charts build registered for the grid', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        const sparklines = newSparklines();
        _setAgChartsInfo(integratedCharts, '9.9.9', true);
        _setAgChartsInfo(sparklines, '8.8.8', false);

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts, sparklines]);

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=1.2.3, ` +
                'AG Charts Enterprise=9.9.9, AG Charts Community=8.8.8'
        );
    });

    test('de-duplicates the clause when both charts modules share one build', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        const integratedCharts = newIntegratedCharts();
        const sparklines = newSparklines();
        _setAgChartsInfo(integratedCharts, '9.9.9', true);
        _setAgChartsInfo(sparklines, '9.9.9', true);

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts, sparklines]);

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=1.2.3, AG Charts Enterprise=9.9.9`
        );
    });
});
