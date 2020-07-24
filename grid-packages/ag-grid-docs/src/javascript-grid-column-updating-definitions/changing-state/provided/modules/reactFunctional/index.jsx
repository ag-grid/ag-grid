'use strict';

import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';

import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const columnsWithState = [
    {field: 'athlete', width: 100, sort: 'asc'},
    {field: 'age'},
    {field: 'country', pinned: 'left'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState(columnsWithState);

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

    const onBtWithState = () => {
        // we need to alter the columns so ensure both react and agGridReact act on this change
        // otherwise react & agGridReact would assume (correctly) that the state was the same and not propagate the
        // "reset" of column state
        // this could also be done via the api which would remove the need for a dirty flag: gridApi.setColumnDefs(...);
        const newColumns = [...columnsWithState];
        newColumns[0]['dirty'] = new Date().getMilliseconds();
        setColumns(newColumns);
    }

    const onBtRemove = () => {
        setColumns([]);
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtWithState}>Set Definitions with State</button>
                    <button onClick={onBtRemove}>Remove Columns</button>
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
                                pinned: null, // important - clears pinned if not specified in col def
                                sort: null // important - clears sort if not specified in col def
                            }}>
                            {columns.map(column => (<AgGridColumn {...column} key={column.field}/>))}
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
