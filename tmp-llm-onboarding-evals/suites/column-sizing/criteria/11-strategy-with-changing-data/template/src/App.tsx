import { useEffect, useMemo, useState } from 'react';

import type { ColDef, SizeColumnsToContentStrategy } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { Employee } from './data';
import { makeEmployees, makeIncomingEmployee } from './data';

export default function App() {
    const [rowData, setRowData] = useState<Employee[]>(() => makeEmployees(50));

    useEffect(() => {
        let sequence = 0;
        const timer = setInterval(() => {
            const incoming = makeIncomingEmployee(sequence);
            sequence += 1;
            setRowData((previous) => [incoming, ...previous]);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const columnDefs = useMemo<ColDef<Employee>[]>(
        () => [
            { field: 'id' },
            { field: 'name' },
            { field: 'role' },
            { field: 'department' },
            { field: 'location' },
            { field: 'startDate' },
            { field: 'salary' },
        ],
        []
    );

    const autoSizeStrategy = useMemo<SizeColumnsToContentStrategy>(() => ({ type: 'fitCellContents' }), []);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ height: '100%', width: '100%' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} autoSizeStrategy={autoSizeStrategy} />
            </div>
        </AgGridProvider>
    );
}
