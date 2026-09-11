import type { Module } from './interfaces/iModule';
import { _logDebug } from './utils/log';
import { VERSION } from './version';

// The AG Charts build handed to `IntegratedChartsModule.with()` / `SparklinesModule.with()`, keyed
// on the module object that `with()` returns. Community never imports ag-charts, so the enterprise
// modules push this in through a setter to keep the dependency direction one-way — the same idiom
// as `_configureDiagnostics` (validation/logging.ts) and `LicenseManager.setChartsLicenseManager`.
// Keying on the module rather than holding a single value means each grid reports the charts build
// of the modules it actually registered, even when another `.with()` call used a different one.
const agChartsInfoByModule = new WeakMap<Module, { version: string; isEnterprise: boolean }>();

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAgChartsInfo(module: Module, version: string, isEnterprise: boolean): void {
    agChartsInfoByModule.set(module, { version, isEnterprise });
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

    // Every distinct charts build registered for this grid is listed: two modules given different
    // AG Charts packages is exactly the mismatch this line exists to surface.
    const chartsVersions = new Set<string>();
    for (const module of registeredModules) {
        const info = agChartsInfoByModule.get(module);
        if (info) {
            chartsVersions.add(`AG Charts ${info.isEnterprise ? 'Enterprise' : 'Community'}=${info.version}`);
        }
    }
    versions.push(...chartsVersions);

    _logDebug(`Version: ${versions.join(', ')}`);
}
