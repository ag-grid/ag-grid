import type { Module } from './interfaces/iModule';
import { _logDebug } from './utils/log';
import { VERSION } from './version';

// The AG Charts build handed to `IntegratedChartsModule.with()` / `SparklinesModule.with()`.
// Community never imports ag-charts, so the enterprise modules push this in through a setter to
// keep the dependency direction one-way — the same idiom as `_configureDiagnostics`
// (validation/logging.ts) and `LicenseManager.setChartsLicenseManager`.
let agChartsInfo: { version: string; isEnterprise: boolean } | undefined;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAgChartsInfo(version: string, isEnterprise: boolean): void {
    agChartsInfo = { version, isEnterprise };
}

/**
 * Logs the version of each AG package in use. Called once per grid, before any bean exists, so that
 * mismatched versions across the packages are visible as the first thing `debug` mode prints.
 */
export function _logVersionIfDebug(debug: boolean | undefined, registeredModules: Module[]): void {
    if (!debug) {
        return;
    }

    const versions = [`AG Grid Community=${VERSION}`];

    // Every enterprise module depends on `EnterpriseCore`, and `registeredModules` is
    // dependency-flattened, so this is the enterprise package's own version whenever it is in use.
    const enterpriseCore = registeredModules.find(({ moduleName }) => moduleName === 'EnterpriseCore');
    if (enterpriseCore) {
        versions.push(`AG Grid Enterprise=${enterpriseCore.version}`);
    }

    // Presence is per-grid; the charts info above is process-global. Both must hold.
    const usesAgCharts = registeredModules.some(
        ({ moduleName }) => moduleName === 'IntegratedCharts' || moduleName === 'Sparklines'
    );
    if (agChartsInfo && usesAgCharts) {
        const { version, isEnterprise } = agChartsInfo;
        versions.push(`AG Charts ${isEnterprise ? 'Enterprise' : 'Community'}=${version}`);
    }

    _logDebug(`Version: ${versions.join(', ')}`);
}
