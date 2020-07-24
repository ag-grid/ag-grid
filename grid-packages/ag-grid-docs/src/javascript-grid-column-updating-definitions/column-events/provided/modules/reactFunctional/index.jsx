'use strict';

import React, {useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';

import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [rowData, setRowData] = useState([]);

    const onGridReady = (params) => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                setRowData(JSON.parse(httpRequest.responseText));
            }
        };
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine test-grid">
                        <AgGridReact
                            modules={AllModules}
                            rowData={rowData}
                            onGridReady={onGridReady}
                            defaultColDef={{
                                initialWidth: 100,
                                sortable: true,
                                resizable: true,
                                filter: true
                            }}
                            onSortChanged={e => console.log('Event Sort Changed', e)}
                            onColumnResized={e => console.log('Event Column Resized', e)}
                            onColumnVisible={e => console.log('Event Column Visible', e)}
                            onColumnPivotChanged={e => console.log('Event Pivot Changed', e)}
                            onColumnRowGroupChanged={e => console.log('Event Row Group Changed', e)}
                            onColumnValueChanged={e => console.log('Event Value Changed', e)}
                            onColumnMoved={e => console.log('Event Column Moved', e)}
                            onColumnPinned={e => console.log('Event Column Pinned', e)}>
                            <AgGridColumn field="athlete"/>
                            <AgGridColumn field="age"/>
                            <AgGridColumn field="country"/>
                            <AgGridColumn field="sport"/>
                            <AgGridColumn field="gold"/>
                            <AgGridColumn field="silver"/>
                            <AgGridColumn field="bronze"/>
                        </AgGridReact>
                    </div>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
