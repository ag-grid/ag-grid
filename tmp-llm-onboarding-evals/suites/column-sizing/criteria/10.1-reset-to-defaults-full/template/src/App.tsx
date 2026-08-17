import { useCallback, useMemo, useState } from 'react';

import type { ColDef, GridState, StateUpdatedEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { Employee } from './data';
import { makeEmployees } from './data';

const STORAGE_KEY = 'employee-grid-state';

function loadState(): GridState | undefined {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? (JSON.parse(saved) as GridState) : undefined;
    } catch {
        return undefined;
    }
}

export default function App() {
    const [rowData] = useState<Employee[]>(() => makeEmployees(200));
    const [initialState] = useState<GridState | undefined>(loadState);

    const columnDefs = useMemo<ColDef<Employee>[]>(
        () => [
            { field: 'id', width: 90 },
            { field: 'name', width: 150 },
            { field: 'role', width: 170 },
            { field: 'department', width: 130 },
            { field: 'location', width: 130 },
            { field: 'startDate', width: 120 },
            { field: 'salary', width: 110 },
        ],
        []
    );

    const onStateUpdated = useCallback((event: StateUpdatedEvent<Employee>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(event.state));
    }, []);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ padding: 8 }}>Employees: {rowData.length}</div>
                <div style={{ flex: 1 }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        initialState={initialState}
                        onStateUpdated={onStateUpdated}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
}
