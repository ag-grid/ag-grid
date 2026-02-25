import React, { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { CellClassRules, ColDef, RowClassRules, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    RowStyleModule,
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
    ClientSideRowModelModule,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    RowStyleModule,
]);

// Create a theme with light and dark modes
const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams(
        {
            accentColor: '#0e4491',
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
            accentColor: '#6ea8fe',
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

// Cell class rules for profit margin column
const profitMarginCellClassRules: CellClassRules = {
    'high-margin': (params) => params.value > 0.2,
};

// Row class rules for highlighting sales performance
const salesRowClassRules: RowClassRules<IProduct> = {
    'high-sales': (params) => (params.data?.salesRevenue ?? 0) > 10000,
    'low-sales': (params) => (params.data?.salesRevenue ?? 0) < 1000,
};

const GridExample = () => {
    // Current theme mode
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');

    // Data displayed within grid
    const [rowData] = useState<IProduct[]>(getData());

    // Column configurations
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
                cellClassRules: profitMarginCellClassRules,
            },
            {
                field: 'status',
                cellClassRules: statusCellClassRules,
            },
        ],
        []
    );

    // Configs applied to all columns
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    // Set initial theme mode
    useEffect(() => {
        document.body.dataset.agThemeMode = themeMode;
    }, [themeMode]);

    // Toggle theme mode
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
                    rowClassRules={salesRowClassRules}
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
