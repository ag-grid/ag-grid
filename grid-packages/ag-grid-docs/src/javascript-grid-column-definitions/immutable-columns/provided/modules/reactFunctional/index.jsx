
'use strict'

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    
    
    
    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        
    var cols = params.columnApi.getAllColumns();
    cols.forEach(function (col) {
        var colDef = col.getUserProvidedColDef();
        console.log(colDef.headerName + ', Column ID = ' + col.getId(), colDef);
    });

    }

const createRowData = () => {
        var data = [];
        for (var i = 0; i < 20; i++) {
            data.push({
                height: Math.floor(Math.random() * 100),
                width: Math.floor(Math.random() * 100),
                depth: Math.floor(Math.random() * 100)
            });
        }
        return data;
    }

    return  (
            <div style={{ width: '100%', height: '100%' }}>
                <div style={{"height":"100%","boxSizing":"border-box"}}>
    <div
                id="myGrid"
                style={{
                    height: '100%',
                    width: '100%'}}
                    className="ag-theme-alpine">
            <AgGridReact
                modules={AllCommunityModules}
rowData={createRowData()}
onGridReady={onGridReady}
            >
                <AgGridColumn headerName="Col 1" colId="firstCol" field="height"></AgGridColumn><AgGridColumn headerName="Col 2" colId="firstCol" field="height"></AgGridColumn><AgGridColumn headerName="Col 3" field="height"></AgGridColumn><AgGridColumn headerName="Col 4" field="height"></AgGridColumn><AgGridColumn headerName="Col 5" valueGetter="data.width"></AgGridColumn><AgGridColumn headerName="Col 6" valueGetter="data.width"></AgGridColumn>
            </AgGridReact>
            </div>
</div>
            </div>
        );
    
}



render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
