import type { Module } from './interfaces/iModule';
import { _logDebug } from './utils/log';
import { VERSION } from './version';

/** The npm package an AG library was registered from, with the version of that build. */
interface AgPackageInfo {
    packageName: string;
    version: string;
}

// Keyed on the module rather than a single value, so each grid reports the builds of the modules it
// actually registered even when another `with()` call used a different one.
const agPackageInfoByModule = new WeakMap<Module, AgPackageInfo>();

/**
 * Records the npm package and version an AG library was registered from, against the module providing
 * it, so the version line and the dev validation overlay report it. Community imports neither ag-charts
 * nor ag-studio, so those packages push their info in through here to keep the dependency direction
 * one-way — AG Charts via integrated charts / sparklines, AG Studio via its own module.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _setAgPackageInfo(module: Module, packageName: string, version: string): void {
    agPackageInfoByModule.set(module, { packageName, version });
}

/**
 * Builds the `ag-grid-community=<v>, ...` clause list for the AG npm packages this grid has registered.
 * Shared by the `debug` console line and the dev validation overlay so both report the same versions.
 */
export function _getAgVersionsText(registeredModules: Module[]): string {
    const versions = [`ag-grid-community=${VERSION}`];

    // Every enterprise module depends on `EnterpriseCore` and `registeredModules` is
    // dependency-flattened, so this is the enterprise package's own version whenever it is in use.
    const enterpriseCore = registeredModules.find(({ moduleName }) => moduleName === 'EnterpriseCore');
    if (enterpriseCore) {
        versions.push(`ag-grid-enterprise=${enterpriseCore.version}`);
    }

    // Each distinct build is listed: two modules given different builds of one package is exactly the
    // mismatch this line exists to surface.
    const packageVersions = new Set<string>();
    for (const module of registeredModules) {
        const info = agPackageInfoByModule.get(module);
        if (info) {
            packageVersions.add(`${info.packageName}=${info.version}`);
        }
    }
    versions.push(...packageVersions);

    return versions.join(', ');
}

/**
 * Logs the version of each AG package in use. Called once per grid, so that mismatched versions across
 * the packages are visible in `debug` mode.
 */
export function _logVersionIfDebug(debug: boolean | undefined, registeredModules: Module[]): void {
    if (debug) {
        _logDebug(`Version: ${_getAgVersionsText(registeredModules)}`);
    }
}
