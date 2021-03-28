import React, {forwardRef} from 'react';
import {AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const Grid = forwardRef((props, ref) => {
    return (
        <div className="ag-theme-alpine" style={{height: "100vh", width: "100%"}}>
            <AgGridReact ref={ref} {...props}></AgGridReact>
        </div>
    );
});

export default Grid;



