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
 * Every enterprise module depends on `EnterpriseCore` and `registeredModules` is dependency-flattened,
 * so this module carries the enterprise package's own version whenever enterprise is in use.
 */
function findEnterpriseCore(registeredModules: Module[]): Module | undefined {
    return registeredModules.find(({ moduleName }) => moduleName === 'EnterpriseCore');
}

/**
 * Builds the `ag-grid-community=<v>, ...` clause list for the AG npm packages this grid has registered.
 * Shared by the `debug` console line and the dev validation overlay so both report the same versions.
 */
export function _getAgVersionsText(registeredModules: Module[]): string {
    const versions = [`ag-grid-community=${VERSION}`];

    const enterpriseCore = findEnterpriseCore(registeredModules);
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

/** Where in grid creation the `debug` version line is emitted. */
type VersionLogPoint = 'before-beans' | 'after-beans';

/**
 * Enterprise prints its licence banner from a bean's `postConstruct`, which fills the console — a
 * version line above that wall of output is easy to miss, so enterprise grids log theirs below it.
 * Community has no banner, so its version line stays the first thing `debug` mode prints.
 */
function getVersionLogPoint(registeredModules: Module[]): VersionLogPoint {
    return findEnterpriseCore(registeredModules) ? 'after-beans' : 'before-beans';
}

/**
 * Logs the version of each AG package in use, once per grid, so that mismatched versions across the
 * packages are visible in `debug` mode. Called at both log points; emits at the one this grid uses.
 */
export function _logVersionIfDebug(
    debug: boolean | undefined,
    registeredModules: Module[],
    logPoint: VersionLogPoint
): void {
    if (debug && getVersionLogPoint(registeredModules) === logPoint) {
        _logDebug(`Version: ${_getAgVersionsText(registeredModules)}`);
    }
}
