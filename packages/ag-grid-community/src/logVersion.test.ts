import type { MockInstance } from 'vitest';

import type { Module } from './interfaces/iModule';
import { VERSION } from './version';

const integratedCharts = { moduleName: 'IntegratedCharts' } as Module;
const sparklines = { moduleName: 'Sparklines' } as Module;
const enterpriseCore = { moduleName: 'EnterpriseCore', version: '1.2.3' } as Module;

describe('_logVersionIfDebug', () => {
    let logSpy: MockInstance;

    beforeEach(() => {
        // `_setAgChartsInfo` is deliberately one-way and vitest isolation is per file, not per
        // test, so the module state must be reset between tests.
        vitest.resetModules();
        logSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    const loadModule = () => import('./logVersion');

    test.each([[undefined], [false]])('logs nothing when debug is %s', async (debug) => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(debug, [integratedCharts, enterpriseCore]);

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
        _setAgChartsInfo('9.9.9', isEnterprise);

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts]);

        expect(logSpy).toHaveBeenCalledWith(
            `AG Grid: Version: AG Grid Community=${VERSION}, AG Grid Enterprise=1.2.3, AG Charts ${label}=9.9.9`
        );
    });

    test('logs the AG Charts version for a sparklines-only grid', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        _setAgChartsInfo('9.9.9', false);

        _logVersionIfDebug(true, [enterpriseCore, sparklines]);

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('AG Charts Community=9.9.9'));
    });

    test('omits the AG Charts clause for a grid that uses no charts modules', async () => {
        const { _logVersionIfDebug, _setAgChartsInfo } = await loadModule();
        _setAgChartsInfo('9.9.9', true);

        _logVersionIfDebug(true, [enterpriseCore]);

        expect(logSpy).toHaveBeenCalledWith(expect.not.stringContaining('AG Charts'));
    });

    test('omits the AG Charts clause when no charts version was pushed in', async () => {
        const { _logVersionIfDebug } = await loadModule();

        _logVersionIfDebug(true, [enterpriseCore, integratedCharts]);

        expect(logSpy).toHaveBeenCalledWith(expect.not.stringContaining('AG Charts'));
    });
});
