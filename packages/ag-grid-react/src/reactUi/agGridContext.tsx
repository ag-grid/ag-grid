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
