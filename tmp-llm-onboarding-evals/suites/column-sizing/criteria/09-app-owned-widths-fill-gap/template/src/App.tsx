import { useCallback, useMemo, useState } from 'react';

import type { ColDef, ColumnResizedEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { Employee } from './data';
import { makeEmployees } from './data';

const STORAGE_KEY = 'employee-grid-column-widths';

const FIELDS = ['id', 'name', 'role', 'department', 'location', 'startDate', 'salary'] as const;

const DEFAULT_WIDTHS: Record<string, number> = {
    id: 90,
    name: 150,
    role: 170,
    department: 130,
    location: 130,
    startDate: 120,
    salary: 110,
};

function loadWidths(): Record<string, number> {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return JSON.parse(saved ?? '{}');
    } catch {
        return {};
    }
}

export default function App() {
    const [rowData] = useState<Employee[]>(() => makeEmployees(200));
    const [widths, setWidths] = useState<Record<string, number>>(loadWidths);

    const columnDefs = useMemo<ColDef<Employee>[]>(
        () => FIELDS.map((field) => ({ field, width: widths[field] ?? DEFAULT_WIDTHS[field] })),
        [widths]
    );

    const onColumnResized = useCallback((event: ColumnResizedEvent<Employee>) => {
        if (!event.finished) {
            return;
        }
        setWidths((previous) => {
            const next = { ...previous };
            for (const column of event.columns ?? []) {
                next[column.getColId()] = column.getActualWidth();
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ height: '100%', width: '100%' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} onColumnResized={onColumnResized} />
            </div>
        </AgGridProvider>
    );
}
