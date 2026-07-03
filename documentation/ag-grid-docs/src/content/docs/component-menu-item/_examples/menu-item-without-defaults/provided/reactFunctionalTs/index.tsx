import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GetMainMenuItems } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    ExcelExportModule,
} from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import MenuItem from './menuItem';
import './style.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ExcelExportModule,
    CellSelectionModule,
    ClipboardModule,
];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            suppressHeaderFilterButton: true,
        };
    }, []);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const getMainMenuItems = useCallback<GetMainMenuItems>((params) => {
        return [
            ...params.defaultItems.filter((item) => item !== 'columnFilter'),
            'separator',
            {
                name: 'Filter',
                menuItem: MenuItem,
                menuItemParams: {
                    column: params.column,
                },
            },
        ];
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div style={gridStyle}>
                    <AgGridReact<IOlympicData>
                        rowData={data}
                        loading={loading}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        getMainMenuItems={getMainMenuItems}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
