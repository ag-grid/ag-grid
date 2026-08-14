import { useMemo, useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { SaleRecord } from './data';
import { makeSales } from './data';

export default function App() {
    const [rowData] = useState<SaleRecord[]>(() => makeSales(120));

    const columnDefs = useMemo<ColDef<SaleRecord>[]>(
        () => [
            { field: 'region' },
            { field: 'product' },
            { field: 'quarter' },
            { field: 'units' },
            { field: 'revenue' },
        ],
        []
    );

    const defaultColDef = useMemo<ColDef>(() => ({ flex: 1 }), []);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ height: '100%', width: '100%' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} />
            </div>
        </AgGridProvider>
    );
}
