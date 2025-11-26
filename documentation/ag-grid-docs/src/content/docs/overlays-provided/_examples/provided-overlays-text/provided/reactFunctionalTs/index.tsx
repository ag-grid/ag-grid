import React, { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, ModuleRegistry, TextFilterModule, ValidationModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

const defaultColDef: ColDef = {
    filter: true,
};

const rawRowData = [
    { athlete: 'Michael Phelps', country: 'US' },
    { athlete: 'Chris Hoy', country: 'UK' },
];
const overlayComponentParams = {
    agLoadingOverlayText: 'Please wait while your data is loading...',
    agNoRowsOverlayText: 'This grid has no data!',
    agNoMatchingRowsOverlayText: 'Current Filter Matches No Rows',
};

const GridExample = () => {
    const [loading, setLoading] = useState(true);
    const [rowData, setRowData] = useState<IAthlete[] | undefined>();
    const gridRef = useRef<AgGridReact>(null);

    return (
        <div className="example-wrapper">
            <div>
                <label className="checkbox">
                    <input type="checkbox" onChange={(e) => setLoading(e.target.checked)} defaultChecked={loading} />
                    loading
                </label>

                <button onClick={() => setRowData(rawRowData)}>Set Row Data</button>
                <button onClick={() => setRowData([])}>Clear Row Data</button>
                <button
                    onClick={() => {
                        setRowData(rawRowData);
                        gridRef.current?.api.setFilterModel({
                            country: { filterType: 'text', type: 'equals', filter: 'Spain' },
                        });
                    }}
                >
                    Set Non Matching Filter
                </button>
                <button onClick={() => gridRef.current?.api.setFilterModel(null)}>Clear Filter</button>
            </div>

            <div style={{ height: '100%' }}>
                <AgGridReact
                    ref={gridRef}
                    loading={loading}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    overlayComponentParams={overlayComponentParams}
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
