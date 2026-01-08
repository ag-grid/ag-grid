import React from 'react';

import type { GridOptions, Module } from 'ag-grid-community';

export const AgGridContext = React.createContext<{
    /**
     * The AG Grid modules to be used by all grid instances within this context.
     */
    modules: Module[];
    licenseKey?: string;
    gridOptions?: GridOptions;
    mergeStrategy?: 'deep' | 'shallow';
}>({ modules: [] });
