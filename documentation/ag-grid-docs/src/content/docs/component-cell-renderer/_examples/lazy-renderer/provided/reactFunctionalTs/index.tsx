'use client';

import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, ColDef, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { IOlympicData } from './interfaces';
import { LazyCellLoader } from './lazyCellComp';
import './styles.css';
import { useFetchJson } from './useFetchJson';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const LazyCellRenderer = React.lazy(LazyCellLoader);

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'athlete',
        },
        {
            field: 'country',
            headerName: 'Lazy Loaded Renderer',
            cellRenderer: LazyCellRenderer,
        },
        {
            field: 'gold',
        },
        {
            field: 'sport',
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            autoHeaderHeight: true,
            wrapHeaderText: true,
        };
    }, []);

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={gridStyle}>
                    <AgGridReact<IOlympicData>
                        rowData={data}
                        loading={loading}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                    />
                </div>
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
