'use strict';

import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState([
        {field: 'athlete'},
        {field: 'age'},
        {field: 'country'},
        {field: 'sport'},
        {field: 'year'},
        {field: 'date'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ]);

    const [forceRefresh, setForceRefresh] = useState(false);

    useEffect(() => {
        if (forceRefresh) {
            gridApi.refreshCells({force: true});
            setForceRefresh(false);
        }
    }, [forceRefresh]);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                setRowData(JSON.parse(httpRequest.responseText));
            }
        };
    };

    const setHeaderNames = () => {
        const newColumns = [...columns];
        newColumns.forEach((newColumn, index) => {
            newColumn.headerName = 'C' + index;
        });
        setColumns(newColumns);
    };

    const removeHeaderNames = () => {
        const newColumns = [...columns];
        newColumns.forEach((newColumn, index) => {
            newColumn.headerName = undefined;
        });
        setColumns(newColumns);
    };

    const setValueFormatters = () => {
        const newColumns = [...columns];
        newColumns.forEach((newColumn, index) => {
            newColumn.valueFormatter = params => '[ ' + params.value + ' ]';
        });

        setColumns(newColumns);
        setForceRefresh(true);
    };

    const removeValueFormatters = () => {
        const newColumns = [...columns];
        newColumns.forEach((newColumn, index) => {
            newColumn.valueFormatter = undefined;
        });

        setColumns(newColumns);
        setForceRefresh(true);
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={setHeaderNames}>Set Header Names</button>
                    <button onClick={removeHeaderNames}>Remove Header Names</button>
                    <button onClick={setValueFormatters}>Set Value Formatters</button>
                    <button onClick={removeValueFormatters}>Remove Value Formatters</button>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine test-grid">
                        <AgGridReact
                            rowData={rowData}
                            onGridReady={onGridReady}
                            defaultColDef={{
                                initialWidth: 100,
                                sortable: true,
                                resizable: true,
                                filter: true
                            }}
                            applyColumnDefOrder={true}>
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
