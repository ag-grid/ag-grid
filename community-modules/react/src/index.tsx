import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import { AgGridReactUi } from './reactUi/agGridReactUi';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';


const App = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

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

    const onGridReady = (params:any) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        setTimeout(() => setRowData([...rowData, ...rowData]), 2000);
    }

    return (
        <div style={{ display: 'flex' }}>
            <div className="ag-theme-alpine" style={{ height: 400, width: 600, margin: 10 }}>
                <AgGridReactUi
                    defaultColDef={{
                        resizable: true,
                        filter: true,
                        flex: 1,
                        sortable: true
                    }}
                    rowSelection="multiple"
                    animateRows={ true }
                    onGridReady={ onGridReady }
                    rowData={ rowData }
                    columnDefs={colDefs}
                    modules={[ClientSideRowModelModule]}>
                </AgGridReactUi>
            </div>
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
