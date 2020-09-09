'use strict';

import React from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const onGridReady = params => {
        const cols = params.columnApi.getAllColumns();
        cols.forEach(function (col) {
            const colDef = col.getUserProvidedColDef();
            console.log(colDef.headerName + ', Column ID = ' + col.getId(), colDef);
        });
    };

    const createRowData = () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            data.push({
                height: Math.floor(Math.random() * 100),
                width: Math.floor(Math.random() * 100),
                depth: Math.floor(Math.random() * 100)
            });
        }
        return data;
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div style={{"height": "100%", "boxSizing": "border-box"}}>
                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        modules={AllCommunityModules}
                        rowData={createRowData()}
                        onGridReady={onGridReady}>
                        <AgGridColumn headerName="Col 1" colId="firstCol" field="height"/>
                        <AgGridColumn headerName="Col 2" colId="firstCol" field="height"/>
                        <AgGridColumn headerName="Col 3" field="height"/>
                        <AgGridColumn headerName="Col 4" field="height"/>
                        <AgGridColumn headerName="Col 5" valueGetter="data.width"/>
                        <AgGridColumn headerName="Col 6" valueGetter="data.width"/>
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
