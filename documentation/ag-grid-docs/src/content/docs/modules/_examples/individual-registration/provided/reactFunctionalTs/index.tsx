import React, { StrictMode, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import type { AgModuleName, ColDef, GridReadyEvent } from 'ag-grid-community';
import {
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    ExcelExportModule,
    SetFilterModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

const sharedModules = [
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];
const leftModules = [SetFilterModule, ClipboardModule, CsvExportModule];
const rightModules = [TextFilterModule, NumberFilterModule, CsvExportModule, ExcelExportModule];

// Register shared Modules globally
ModuleRegistry.registerModules(sharedModules);

const columns: ColDef[] = [{ field: 'id' }, { field: 'color' }, { field: 'value1' }];

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 80,
    filter: true,
    floatingFilter: true,
};

let rowIdSequence = 100;
const createRowBlock = () =>
    ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    }));
const GridExample = () => {
    const leftRowData = useMemo(() => createRowBlock(), []);
    const rightRowData = useMemo(() => createRowBlock(), []);

    const onGridReady = useCallback((event: GridReadyEvent) => {
        const api = event.api;
        const moduleNames: AgModuleName[] = [
            'ClipboardModule',
            'ClientSideRowModelModule',
            'ColumnMenuModule',
            'ContextMenuModule',
            'CsvExportModule',
            'ExcelExportModule',
            'NumberFilterModule',
            'SetFilterModule',
            'TextFilterModule',
            'IntegratedChartsModule', // Not registered in this example
        ];
        const registered = moduleNames.filter((name) => api.isModuleRegistered(name));
        console.log(api.getGridId(), 'registered:', registered.join(', '));
    }, []);

    return (
        <div className="example-wrapper">
            <div className="inner-col">
                <AgGridReact
                    gridId="Left"
                    defaultColDef={defaultColDef}
                    rowData={leftRowData}
                    modules={leftModules}
                    columnDefs={columns}
                    onGridReady={onGridReady}
                />
            </div>

            <div className="inner-col">
                <AgGridReact
                    gridId="Right"
                    defaultColDef={defaultColDef}
                    rowData={rightRowData}
                    modules={rightModules}
                    columnDefs={columns}
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
