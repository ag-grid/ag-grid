import type { _ModuleWithLicenseManager } from 'packages/ag-grid-community/dist/types/src/main-internal';
import React, { useContext, useRef } from 'react';

import type { Module } from 'ag-grid-community';

export interface AgGridProviderProps {
    /**
     * The AG Grid Modules to be used by all grid instances within this provider.
     */
    modules: Module[];
    /**
     * The AG Grid license key to be used by all grid instances within this provider when Enterprise features are used.
     */
    licenseKey?: string;
    /**
     * The child components that will have access to the AG Grid context.
     */
    children: React.ReactNode;
}

export const ModulesContext = React.createContext<Module[]>([]);
export const LicenseContext = React.createContext<string | undefined>(undefined);

/**
 * Compares two module arrays to determine if they contain the same modules.
 * Uses module names for comparison to avoid reference equality issues.
 * Order-independent: [A, B] is considered equal to [B, A].
 */
function areModulesEqual(prevModules: Module[], nextModules: Module[]): boolean {
    if (prevModules.length !== nextModules.length) {
        return false;
    }
    if (prevModules === nextModules) {
        return true;
    }
    const prevNames = new Set(prevModules.map((m) => m.moduleName));
    return nextModules.every((m) => prevNames.has(m.moduleName));
}

/**
 * Provider component that supplies AG Grid Modules and license key to all grid instances within its scope via React Context.
 *
 * When nested, modules are accumulated from all providers and provided to each AgGridReact instance.
 *
 * This is an alternative to providing modules globally via `ModuleRegistry.registerModules()` and setting the license key via `LicenseManager.setLicenseKey()`.
 */
export function AgGridProvider({ modules, licenseKey, children }: AgGridProviderProps) {
    const parentModules = useContext(ModulesContext);
    const parentLicenseKey = useContext(LicenseContext);

    // The grid handles duplicated modules so no need to worry about that here
    const mergedModules = [...parentModules, ...modules];
    const modulesRef = useRef<Module[]>(mergedModules);

    // Only update the ref if modules have actually changed
    if (!areModulesEqual(modulesRef.current, mergedModules)) {
        modulesRef.current = mergedModules;
    }

    // Use this provider's licenseKey if provided, otherwise inherit from parent
    const effectiveLicenseKey = licenseKey ?? parentLicenseKey;

    return (
        <ModulesContext.Provider value={modulesRef.current}>
            <LicenseContext.Provider value={effectiveLicenseKey}>{children}</LicenseContext.Provider>
        </ModulesContext.Provider>
    );
}

export function findEnterpriseCoreModule(
    modules: Module[],
    visited: Set<string> = new Set()
): _ModuleWithLicenseManager | undefined {
    for (const module of modules) {
        if (visited.has(module.moduleName)) {
            return undefined;
        }
        visited.add(module.moduleName);

        if ('setLicenseKey' in module) {
            return module as _ModuleWithLicenseManager;
        }

        if (module.dependsOn) {
            const found = findEnterpriseCoreModule(module.dependsOn, visited);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}
