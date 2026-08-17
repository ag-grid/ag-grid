import { useMemo, useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { Employee } from './data';
import { makeEmployees } from './data';

export default function App() {
    const [rowData] = useState<Employee[]>(() => makeEmployees(200));

    const columnDefs = useMemo<ColDef<Employee>[]>(
        () => [{ field: 'name' }, { field: 'department' }, { field: 'salary' }],
        []
    );

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ height: '100%', width: '100%' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} />
            </div>
        </AgGridProvider>
    );
}
