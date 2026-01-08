import React from 'react';

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

export const AgGridContext = React.createContext<AgGridContextValue>({ modules: [] });

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
