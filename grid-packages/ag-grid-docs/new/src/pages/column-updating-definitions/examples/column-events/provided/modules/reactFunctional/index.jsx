'use strict';

import React, {useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';

import {AllModules} from "@ag-grid-enterprise/all-modules";
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [columns, setColumns] = useState([
            {field: 'athlete'},
            {field: 'age'},
            {field: 'country'},
            {field: 'sport'},
            {field: 'gold'},
            {field: 'silver'},
            {field: 'bronze'}
        ]
    );
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState([]);
 
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

    const onBtSortOn = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'age') {
                colDef.sort = 'desc';
            }
            if (colDef.field === 'athlete') {
                colDef.sort = 'asc';
            }
        });
        setColumns(columnDefs)
    };

    const onBtSortOff = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.sort = null;
        });
        setColumns(columnDefs)
    };

    const onBtWidthNarrow = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'age' || colDef.field === 'athlete') {
                colDef.width = 100;
            }
        });
        setColumns(columnDefs)
    };

    const onBtWidthNormal = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.width = 200;
        });
        setColumns(columnDefs)
    };

    const onBtHide = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'age' || colDef.field === 'athlete') {
                colDef.hide = true;
            }
        });
        setColumns(columnDefs)
    };

    const onBtShow = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.hide = false;
        });
        setColumns(columnDefs)
    };

    const onBtPivotOn = () => {
        gridColumnApi.setPivotMode(true);

        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'country') {
                colDef.pivot = true;
            }
        });
        setColumns(columnDefs)
    };

    const onBtPivotOff = () => {
        gridColumnApi.setPivotMode(false);

        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.pivot = false;
        });
        setColumns(columnDefs)
    };

    const onBtRowGroupOn = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'sport') {
                colDef.rowGroup = true;
            }
        });
        setColumns(columnDefs)
    };

    const onBtRowGroupOff = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.rowGroup = false;
        });
        setColumns(columnDefs)
    };

    const onBtAggFuncOn = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'gold' || colDef.field === 'silver' || colDef.field === 'bronze') {
                colDef.aggFunc = 'sum';
            }
        });
        setColumns(columnDefs)
    };

    const onBtAggFuncOff = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.aggFunc = null;
        });
        setColumns(columnDefs)
    };

    const onBtPinnedOn = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            if (colDef.field === 'athlete') {
                colDef.pinned = 'left';
            }
            if (colDef.field === 'age') {
                colDef.pinned = 'right';
            }
        });
        setColumns(columnDefs)
    };

    const onBtPinnedOff = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(colDef => {
            colDef.pinned = null;
        });
        setColumns(columnDefs)
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <div className="test-button-row">
                        <div className="test-button-group">
                            <button onClick={() => onBtSortOn()}>Sort On</button>
                            <br/>
                            <button onClick={() => onBtSortOff()}>Sort Off</button>
                        </div>
                        <div className="test-button-group">
                            <button onClick={() => onBtWidthNarrow()}>Width Narrow</button>
                            <br/>
                            <button onClick={() => onBtWidthNormal()}>Width Normal</button>
                        </div>
                        <div className="test-button-group">
                            <button onClick={() => onBtHide()}>Hide Cols</button>
                            <br/>
                            <button onClick={() => onBtShow()}>Show Cols</button>
                        </div>
                        <div className="test-button-group">
                            <button onClick={() => onBtPivotOn()}>Pivot On</button>
                            <br/>
                            <button onClick={() => onBtPivotOff()}>Pivot Off</button>
                        </div>
                        <div className="test-button-group">
                            <button onClick={() => onBtRowGroupOn()}>Row Group On</button>
                            <br/>
                            <button onClick={() => onBtRowGroupOff()}>Row Group Off</button>
                        </div>
                        <div className="test-button-group">
                            <button onClick={() => onBtAggFuncOn()}>Agg Func On</button>
                            <br/>
                            <button onClick={() => onBtAggFuncOff()}>Agg Func Off</button>
                        </div>
                        <div className="test-button-group">
                            <button onClick={() => onBtPinnedOn()}>Pinned On</button>
                            <br/>
                            <button onClick={() => onBtPinnedOff()}>Pinned Off</button>
                        </div>
                    </div>
                </div>
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
                            sortable: true,
                            resizable: true,
                            width: 150,
                            enableRowGroup: true,
                            enablePivot: true,
                            enableValue: true
                        }}
                        onSortChanged={e => console.log('Event Sort Changed', e)}
                        onColumnResized={e => console.log('Event Column Resized', e)}
                        onColumnVisible={e => console.log('Event Column Visible', e)}
                        onColumnPivotChanged={e => console.log('Event Pivot Changed', e)}
                        onColumnRowGroupChanged={e => console.log('Event Row Group Changed', e)}
                        onColumnValueChanged={e => console.log('Event Value Changed', e)}
                        onColumnMoved={e => console.log('Event Column Moved', e)}
                        onColumnPinned={e => console.log('Event Column Pinned', e)}>
                        { columns.map(column => <AgGridColumn {...column}></AgGridColumn>)}
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
