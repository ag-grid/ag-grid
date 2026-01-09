import React, { useContext, useMemo, useRef } from 'react';

import type { Module } from 'ag-grid-community';

export interface AgGridContextValue {
    /**
     * The AG Grid modules to be used by all grid instances within this context.
     */
    modules: Module[];
    /**
     * The AG Grid license key to be used by all grid instances within this context when Enterprise features are used.
     */
    licenseKey?: string;
}

export interface AgGridProviderProps {
    /**
     * The AG Grid modules to be used by all grid instances within this provider.
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

export const AgGridContext = React.createContext<AgGridContextValue>({ modules: [] });

/**
 * Compares two module arrays to determine if they contain the same modules.
 * Uses module names for comparison to avoid reference equality issues.
 */
function areModulesEqual(prevModules: Module[], nextModules: Module[]): boolean {
    if (prevModules.length !== nextModules.length) {
        return false;
    }
    for (let i = 0; i < prevModules.length; i++) {
        if (prevModules[i].moduleName !== nextModules[i].moduleName) {
            return false;
        }
    }
    return true;
}

/**
 * Provider component that supplies AG Grid modules and license key to all grid instances within its scope.
 * This component memoizes the modules array to prevent unnecessary re-renders when the array reference
 * changes but the contents remain the same.
 *
 * When nested, child providers inherit modules from parent providers. The merged modules are deduplicated
 * by module name, with child modules taking precedence.
 */
export function AgGridProvider({ modules, licenseKey, children }: AgGridProviderProps) {
    const parentContext = useContext(AgGridContext);

    // The grid handles duplicated modules so no need to worry about that here
    const mergedModules = useMemo(() => [...parentContext.modules, ...modules], [parentContext.modules, modules]);

    const modulesRef = useRef<Module[]>(mergedModules);

    // Only update the ref if modules have actually changed
    if (!areModulesEqual(modulesRef.current, mergedModules)) {
        modulesRef.current = mergedModules;
    }

    const stableModules = modulesRef.current;
    // Use this provider's licenseKey if provided, otherwise inherit from parent
    const effectiveLicenseKey = licenseKey ?? parentContext.licenseKey;

    const contextValue = useMemo<AgGridContextValue>(
        () => ({
            modules: stableModules,
            licenseKey: effectiveLicenseKey,
        }),
        [stableModules, effectiveLicenseKey]
    );

    return <AgGridContext.Provider value={contextValue}>{children}</AgGridContext.Provider>;
}

export function findModuleByName(
    moduleName: string,
    modules: Module[],
    visited: Set<string> = new Set()
): Module | undefined {
    for (const module of modules) {
        if (visited.has(module.moduleName)) {
            return undefined;
        }
        visited.add(module.moduleName);

        if (module.moduleName === moduleName) {
            return module;
        }

        if (module.dependsOn) {
            const found = findModuleByName(moduleName, module.dependsOn, visited);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}
