import { useState } from 'react';

import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import type { Employee } from './data';
import { makeEmployees } from './data';

const ROWS: Employee[] = makeEmployees(200);

export default function App() {
    const [filter, setFilter] = useState('');

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ padding: 8 }}>
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter employees"
                        style={{ padding: 4, width: 240 }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <AgGridReact
                        rowData={ROWS}
                        quickFilterText={filter}
                        columnDefs={[
                            { field: 'id' },
                            { field: 'name' },
                            { field: 'role' },
                            { field: 'department' },
                            { field: 'location' },
                            { field: 'startDate' },
                            { field: 'salary' },
                        ]}
                        defaultColDef={{ flex: 1 }}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
}
