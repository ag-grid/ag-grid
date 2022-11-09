import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridReact } from './agGridReact';
import useGridApis from "./useGridApi";

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';


const App = () => {
    const gridRef = useRef<AgGridReact>(null);
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
    }, [gridApi, columnApi])

    return (
        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
            <AgGridReact
                ref={ gridRef }
                rowData={ rowData }
                columnDefs={colDefs}
                modules={[ClientSideRowModelModule]}>
            </AgGridReact>
        </div>
    );
};

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
