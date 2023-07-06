// ag-grid-react v30.0.4
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridReactUi } from './reactUi/agGridReactUi.mjs';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
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
        React.createElement("div", { className: "ag-theme-alpine", style: { height: 400, width: 600, margin: 10 } },
            React.createElement(AgGridReactUi, { defaultColDef: {
                    resizable: true,
                    filter: true,
                    flex: 1,
                    sortable: true
                }, rowSelection: "multiple", animateRows: true, onGridReady: onGridReady, rowData: rowData, columnDefs: colDefs, modules: [ClientSideRowModelModule] }))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
