'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([InfiniteRowModelModule]);

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                // this row shows the row index, doesn't use any data from the row
                {
                    headerName: 'ID',
                    maxWidth: 100,
                    // it is important to have node.id here, so that when the id changes (which happens
                    // when the row is loaded) then the cell is refreshed.
                    valueGetter: 'node.id',
                    cellRenderer: props => {
                        if (props.value !== undefined) {
                            return props.value;
                        } else {
                            return <img src="https://www.ag-grid.com/example-assets/loading.gif" />;
                        }
                    },
                },
                { field: 'athlete', minWidth: 150 },
                { field: 'age' },
                { field: 'country', minWidth: 150 },
                { field: 'year' },
                { field: 'date', minWidth: 150 },
                { field: 'sport', minWidth: 150 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ],
            defaultColDef: {
                flex: 1,
                resizable: true,
                minWidth: 100,
            },
            rowBuffer: 0,
            rowSelection: 'multiple',
            rowModelType: 'infinite',
            cacheBlockSize: 100,
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 1000,
            maxBlocksInCache: 10
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            const dataSource = {
                rowCount: undefined,
                getRows: (params) => {
                    console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                    // At this point in your code, you would call the server.
                    // To make the demo look real, wait for 500ms before returning
                    setTimeout(function () {
                        // take a slice of the total rows
                        const rowsThisPage = data.slice(params.startRow, params.endRow);
                        // if on or after the last page, work out the last row.
                        let lastRow = -1;
                        if (data.length <= params.endRow) {
                            lastRow = data.length;
                        }
                        // call the success callback
                        params.successCallback(rowsThisPage, lastRow);
                    }, 500);
                },
            };
            params.api.setDatasource(dataSource);
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }


    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div

                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        rowBuffer={this.state.rowBuffer}
                        rowSelection={this.state.rowSelection}
                        rowModelType={this.state.rowModelType}
                        cacheBlockSize={this.state.cacheBlockSize}
                        cacheOverflowSize={this.state.cacheOverflowSize}
                        maxConcurrentDatasourceRequests={this.state.maxConcurrentDatasourceRequests}
                        infiniteInitialRowCount={this.state.infiniteInitialRowCount}
                        maxBlocksInCache={this.state.maxBlocksInCache}
                        onGridReady={this.onGridReady}
                    />
                </div>

            </div>
        );
    }
}


render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
