import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { AgGridReact } from './agGridReact';

const App = () => {
    const [rowData, setRowData] = useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
    ]);
    const [colDefs, setColDefs] = useState<ColDef[]>([{ field: 'make' }, { field: 'model' }, { field: 'price' }]);

    const onGridReady = (params: any) => {
        setTimeout(() => setRowData([...rowData, ...rowData]), 2000);
    };

    return (
        <div style={{ display: 'flex' }}>
            <div className="ag-theme-quartz" style={{ height: 400, width: 600, margin: 10 }}>
                <AgGridReact
                    defaultColDef={{
                        filter: true,
                        flex: 1,
                    }}
                    rowSelection="multiple"
                    onGridReady={onGridReady}
                    rowData={rowData}
                    columnDefs={colDefs}
                    modules={[ClientSideRowModelModule]}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
