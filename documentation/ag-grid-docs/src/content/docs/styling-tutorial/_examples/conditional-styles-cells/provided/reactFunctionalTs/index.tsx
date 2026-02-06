import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { CellClassRules, ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    iconSetMaterial,
    themeQuartz,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import type { IProduct } from './data';
import { getData } from './data';
import './styles.css';

type ThemeMode = 'light' | 'dark';

ModuleRegistry.registerModules([
    CellStyleModule,
    RowSelectionModule,
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
]);

// Create a theme with light and dark modes
const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams(
        {
            backgroundColor: '#ffffff',
            foregroundColor: '#1a1a1a',
            headerBackgroundColor: '#faf8f5',
            selectedRowBackgroundColor: 'rgba(14, 68, 145, 0.15)',
            spacing: 10,
            fontSize: 12,
            headerFontSize: 14,
        },
        'light'
    )
    .withParams(
        {
            backgroundColor: '#1e1e2f',
            foregroundColor: '#e2e8f0',
            headerBackgroundColor: '#2d2d44',
            selectedRowBackgroundColor: 'rgba(110, 168, 254, 0.2)',
            spacing: 10,
            fontSize: 12,
            headerFontSize: 14,
        },
        'dark'
    );

// Cell class rules for status column
const statusCellClassRules: CellClassRules = {
    'status-delivered': (params) => params.value === 'Delivered',
    'status-pending': (params) => params.value === 'Pending',
    'status-cancelled': (params) => params.value === 'Cancelled',
};

const GridExample = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [rowData] = useState<IProduct[]>(getData());

    const columnDefs = useMemo<ColDef<IProduct>[]>(
        () => [
            { field: 'productName', headerName: 'Product', minWidth: 180 },
            {
                field: 'salesRevenue',
                headerName: 'Revenue',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value != null ? `$${params.value.toLocaleString()}` : '',
            },
            {
                field: 'profitMargin',
                headerName: 'Margin',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value != null ? `${(params.value * 100).toFixed(0)}%` : '',
            },
            {
                field: 'status',
                cellClassRules: statusCellClassRules,
            },
        ],
        []
    );

    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    useEffect(() => {
        document.body.dataset.agThemeMode = themeMode;
    }, [themeMode]);

    const toggleThemeMode = () => {
        setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <p style={{ flex: '0 1 0%' }}>
                <button className="ag-toggleButton" onClick={toggleThemeMode}>
                    {themeMode === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode'}
                </button>
            </p>
            <div style={{ flex: '1 1 0%' }}>
                <AgGridReact
                    theme={myTheme}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowSelection={{ mode: 'multiRow' }}
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
