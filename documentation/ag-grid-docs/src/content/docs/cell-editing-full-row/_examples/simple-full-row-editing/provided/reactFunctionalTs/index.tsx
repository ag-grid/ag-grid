import React, { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule, ValidationModule } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
const { StrictMode } = React;

import './styles.css';

const modules = [
    ClientSideRowModelModule,
    TextEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

function getRowData(): any[] {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
    }
    return rowData;
}

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData] = useState<any[]>(getRowData());
    const [columnDefs] = useState<ColDef[]>([{ field: 'make' }, { field: 'model' }, { field: 'price' }]);
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
            editable: true,
            cellDataType: false,
        }),
        []
    );

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div style={gridStyle}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            editType={'fullRow'}
                        />
                    </div>
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
