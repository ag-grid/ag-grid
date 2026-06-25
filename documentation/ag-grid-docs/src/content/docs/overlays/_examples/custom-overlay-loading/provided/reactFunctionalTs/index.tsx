import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, TextEditorModule, TextFilterModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CustomLoadingOverlay from './customLoadingOverlay';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [TextEditorModule, TextFilterModule, ClientSideRowModelModule];

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', width: 120 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Natalie Coughlin', country: 'United States' },
    { athlete: 'Aleksey Nemov', country: 'Russia' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

const defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

const GridExample = () => {
    const [loading, setLoading] = useState(true);

    const loadingOverlayComponentParams = useMemo(() => {
        return { loadingMessage: 'One moment please...' };
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div>
                    <label className="checkbox">
                        <input type="checkbox" onChange={(e) => setLoading(e.target.checked)} checked={loading} />
                        loading
                    </label>
                </div>

                <div style={{ height: '100%', width: '100%' }}>
                    <AgGridReact<IAthlete>
                        loading={loading}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        loadingOverlayComponent={CustomLoadingOverlay}
                        loadingOverlayComponentParams={loadingOverlayComponentParams}
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
