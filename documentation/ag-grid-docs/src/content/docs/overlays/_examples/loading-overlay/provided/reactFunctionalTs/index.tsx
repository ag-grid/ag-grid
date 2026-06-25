import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [ClientSideRowModelModule];

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 200 },
    { field: 'country', minWidth: 200 },
];

const GridExample = () => {
    const [loading, setLoading] = useState(true);
    const [rowData, setRowData] = useState<IAthlete[] | undefined>();

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div>
                    <label className="checkbox">
                        <input type="checkbox" onChange={(e) => setLoading(e.target.checked)} checked={loading} />
                        loading
                    </label>

                    <button onClick={() => setRowData([])}>Clear rowData</button>
                    <button onClick={() => setRowData([{ athlete: 'Michael Phelps', country: 'US' }])}>
                        Set rowData
                    </button>
                </div>

                <div style={{ height: '100%' }}>
                    <AgGridReact loading={loading} rowData={rowData} columnDefs={columnDefs} />
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
