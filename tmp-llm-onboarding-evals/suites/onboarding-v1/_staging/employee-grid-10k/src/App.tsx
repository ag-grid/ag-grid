import { useMemo, useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { Employee } from './data';
import { makeEmployees } from './data';

export default function App() {
    const [rowData] = useState<Employee[]>(() => makeEmployees(10000));

    const columnDefs = useMemo<ColDef<Employee>[]>(
        () => [{ field: 'name' }, { field: 'department' }, { field: 'startDate' }, { field: 'salary' }],
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
