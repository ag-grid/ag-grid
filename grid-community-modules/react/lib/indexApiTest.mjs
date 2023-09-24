// @ag-grid-community/react v30.2.0
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridReact } from './agGridReact.mjs';
import useGridApis from "./useGridApi.mjs";
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
const App = () => {
    const gridRef = useRef(null);
    const [gridApi, columnApi] = useGridApis(gridRef);
    const [rowData] = useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ]);
    const [colDefs, setColDefs] = useState([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
    ]);
    useEffect(() => {
        console.log(gridApi);
        console.log(columnApi);
    }, [gridApi, columnApi]);
    return (React.createElement("div", { className: "ag-theme-alpine", style: { height: 400, width: 600 } },
        React.createElement(AgGridReact, { ref: gridRef, rowData: rowData, columnDefs: colDefs, modules: [ClientSideRowModelModule] })));
};
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
