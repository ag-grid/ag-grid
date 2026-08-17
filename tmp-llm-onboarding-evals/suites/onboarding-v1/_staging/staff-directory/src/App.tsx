import { useEffect, useMemo, useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import AmendmentLog from './AmendmentLog';
import type { StaffRecord } from './staffDirectory';
import { amendmentLog, currentRecords, watch } from './staffDirectory';

export default function App() {
    const [records, setRecords] = useState<StaffRecord[]>(currentRecords);
    const [amendments, setAmendments] = useState(amendmentLog);

    useEffect(
        () =>
            watch(() => {
                setRecords(currentRecords());
                setAmendments(amendmentLog());
            }),
        []
    );

    const columnDefs = useMemo<ColDef<StaffRecord>[]>(
        () => [{ field: 'name' }, { field: 'department' }, { field: 'startDate' }, { field: 'salary' }],
        []
    );

    const defaultColDef = useMemo<ColDef>(() => ({ flex: 1 }), []);

    const getRowId = useMemo(() => (params: { data: StaffRecord }) => String(params.data.id), []);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: '1 1 0', minHeight: 0 }}>
                    <AgGridReact
                        rowData={records}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        getRowId={getRowId}
                    />
                </div>
                <AmendmentLog amendments={amendments} />
            </div>
        </AgGridProvider>
    );
}
