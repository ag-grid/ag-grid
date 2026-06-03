import { _areEqual } from 'ag-stack';
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

/** Defaults to null (no AgGridProvider in the tree). When an AgGridProvider is present, it provides Module[] (possibly empty). */
export const ModulesContext = React.createContext<Module[] | null>(null);
export const LicenseContext = React.createContext<string | undefined>(undefined);

/**
 * Provide AG Grid Modules to all grid instances within this scope via React Context. If nested, modules are accumulated from all providers and provided to each AgGridReact instance.
 *
 * If a licenseKey is provided it will be passed to the global `LicenseManager.setLicenseKey(licenseKey)`.
 *
 * This is an alternative to providing modules globally via `ModuleRegistry.registerModules()` and setting the license key via `LicenseManager.setLicenseKey()`.
 */
export function AgGridProvider({ modules, licenseKey, children }: Readonly<AgGridProviderProps>) {
    const parentModulesRaw = useContext(ModulesContext);
    const parentModules = parentModulesRaw ?? [];
    const parentLicenseKey = useContext(LicenseContext);

    const modulesRef = useRef<Module[]>(modules);
    const parentModulesRef = useRef<Module[]>(parentModules);
    const mergedModules = useRef<Module[]>([...parentModules, ...modules]);

    const parentModulesChanged = !_areEqual(parentModulesRef.current, parentModules);
    if (parentModulesChanged) {
        parentModulesRef.current = parentModules;
    }
    const modulesChanged = !_areEqual(modulesRef.current, modules);
    if (modulesChanged) {
        modulesRef.current = modules;
    }

    // The grid handles duplicated modules so no need to worry about that here
    // Only update the ref if modules have changed.
    // Assuming that the order of modules will be stable between renders so not going to do any sorting here.
    if (parentModulesChanged || modulesChanged) {
        mergedModules.current = [...parentModulesRef.current, ...modulesRef.current];
    }

    // Use this provider's licenseKey if provided, otherwise inherit from parent
    // We cannot safely set the licenseKey here as enterprise modules my have been provided to the
    // AGGridReact component directly and so the list of modules we have access to here may not have the
    // license manager on them.
    const effectiveLicenseKey = licenseKey ?? parentLicenseKey;

    return (
        <ModulesContext.Provider value={mergedModules.current}>
            <LicenseContext.Provider value={effectiveLicenseKey}>{children}</LicenseContext.Provider>
        </ModulesContext.Provider>
    );
}
