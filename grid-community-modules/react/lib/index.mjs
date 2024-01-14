// @ag-grid-community/react v31.0.0
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridReact } from './agGridReact.mjs';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
const App = () => {
    const [rowData, setRowData] = useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]);
    const [colDefs, setColDefs] = useState([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
    ]);
    const onGridReady = (params) => {
        setTimeout(() => setRowData([...rowData, ...rowData]), 2000);
    };
    return (React.createElement("div", { style: { display: 'flex' } },
        React.createElement("div", { className: "ag-theme-quartz", style: { height: 400, width: 600, margin: 10 } },
            React.createElement(AgGridReact, { defaultColDef: {
                    filter: true,
                    flex: 1,
                }, rowSelection: "multiple", onGridReady: onGridReady, rowData: rowData, columnDefs: colDefs, modules: [ClientSideRowModelModule] }))));
};
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
