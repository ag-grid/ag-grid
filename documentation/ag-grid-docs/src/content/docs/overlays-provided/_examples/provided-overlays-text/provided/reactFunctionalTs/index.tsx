import React, { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import type { ColDef, OverlayComponentUserParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CsvExportModule,
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

const overlayComponentParams: OverlayComponentUserParams = {
    loading: { overlayText: 'Please wait while your data is loading...' },
    noRows: { overlayText: 'This grid has no data!' },
    noMatchingRows: { overlayText: 'Current Filter Matches No Rows' },
    exporting: { overlayText: 'Exporting your data...' },
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
                <button onClick={() => gridRef.current?.api.exportDataAsCsv()}>Export CSV</button>
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
