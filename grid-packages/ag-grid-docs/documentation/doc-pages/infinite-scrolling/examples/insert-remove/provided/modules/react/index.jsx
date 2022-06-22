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
                {
                    headerName: 'Item ID',
                    field: 'id',
                    valueGetter: 'node.id',
                    cellRenderer: props => {
                        if (props.value !== undefined) {
                            return props.value;
                        } else {
                            return <img src="https://www.ag-grid.com/example-assets/loading.gif" />;
                        }
                    },
                },
                { field: 'make' },
                { field: 'model' },
                {
                    field: 'price',
                    valueFormatter: valueFormatter,
                },
            ],
            datasource: {
                rowCount: undefined,
                getRows: (params) => {
                    console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                    // At this point in your code, you would call the server.
                    // To make the demo look real, wait for 500ms before returning
                    setTimeout(function () {
                        // take a slice of the total rows
                        const rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                        // make a copy of each row - this is what would happen if taking data from server
                        for (let i = 0; i < rowsThisPage.length; i++) {
                            const item = rowsThisPage[i];
                            // this is a trick to copy an object
                            const itemCopy = JSON.parse(JSON.stringify(item));
                            rowsThisPage[i] = itemCopy;
                        }
                        // if on or after the last page, work out the last row.
                        let lastRow = -1;
                        if (allOfTheData.length <= params.endRow) {
                            lastRow = allOfTheData.length;
                        }
                        // call the success callback
                        params.successCallback(rowsThisPage, lastRow);
                    }, 500);
                },
            },
            defaultColDef: {
                resizable: true,
            },
            rowSelection: 'multiple',
            rowModelType: 'infinite',
            maxBlocksInCache: 2,
            infiniteInitialRowCount: 500,
            maxConcurrentDatasourceRequests: 2,
            getRowId: (params) => {
                return params.data.id.toString();
            },
            getRowStyle: (params) => {
                if (params.data && params.data.make === 'Honda') {
                    return {
                        fontWeight: 'bold',
                    };
                } else {
                    return undefined;
                }
            }
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        sequenceId = 1;
        allOfTheData = [];
        for (let i = 0; i < 1000; i++) {
            allOfTheData.push(createRowData(sequenceId++));
        }

    }

    insertItemsAt2AndRefresh = (count) => {
        insertItemsAt2(count);
        // if the data has stopped looking for the last row, then we need to adjust the
        // row count to allow for the extra data, otherwise the grid will not allow scrolling
        // to the last row. eg if we have 1000 rows, scroll all the way to the bottom (so
        // maxRowFound=true), and then add 5 rows, the rowCount needs to be adjusted
        // to 1005, so grid can scroll to the end. the grid does NOT do this for you in the
        // refreshVirtualPageCache() method, as this would be assuming you want to do it which
        // is not true, maybe the row count is constant and you just want to refresh the details.
        const maxRowFound = this.gridApi.isLastRowIndexKnown();
        if (maxRowFound) {
            const rowCount = this.gridApi.getInfiniteRowCount() || 0;
            this.gridApi.setRowCount(rowCount + count);
        }
        // get grid to refresh the data
        this.gridApi.refreshInfiniteCache();
    }

    removeItem = (start, limit) => {
        allOfTheData.splice(start, limit);
        this.gridApi.refreshInfiniteCache();
    }

    refreshCache = () => {
        this.gridApi.refreshInfiniteCache();
    }

    purgeCache = () => {
        this.gridApi.purgeInfiniteCache();
    }

    setRowCountTo200 = () => {
        this.gridApi.setRowCount(200, false);
    }

    rowsAndMaxFound = () => {
        console.log('getInfiniteRowCount() => ' + this.gridApi.getInfiniteRowCount());
        console.log('isLastRowIndexKnown() => ' + this.gridApi.isLastRowIndexKnown());
    }

    // function just gives new prices to the row data, it does not update the grid
    setPricesHigh = () => {
        allOfTheData.forEach(function (dataItem) {
            dataItem.price = Math.round(55500 + 400 * (0.5 + Math.random()));
        });
    }

    setPricesLow = () => {
        allOfTheData.forEach(function (dataItem) {
            dataItem.price = Math.round(1000 + 100 * (0.5 + Math.random()));
        });
    }

    printCacheState = () => {
        console.log('*** Cache State ***');
        console.log(this.gridApi.getCacheBlockState());
    }

    jumpTo500 = () => {
        // first up, need to make sure the grid is actually showing 500 or more rows
        if ((this.gridApi.getInfiniteRowCount() || 0) < 501) {
            this.gridApi.setRowCount(501, false);
        }
        // next, we can jump to the row
        this.gridApi.ensureIndexVisible(500);
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div style={{ "display": "flex", "flexDirection": "column", "height": "100%" }}>
                    <div style={{ "marginBottom": "10px" }}>
                        <button onClick={() => this.insertItemsAt2AndRefresh(5)}>Insert Rows</button>
                        <button onClick={() => this.removeItem(3, 10)}>Delete Rows</button>
                        <button onClick={() => this.setRowCountTo200()}>Set Row Count</button>
                        <button onClick={() => this.rowsAndMaxFound()}>Print Info</button>
                        <button onClick={() => this.jumpTo500()}>Jump to 500</button>
                        <button onClick={() => this.printCacheState()}>Print Cache State</button>
                    </div>
                    <div style={{ "marginBottom": "10px" }}>
                        <button onClick={() => this.setPricesHigh()}>Set Prices High</button>
                        <button onClick={() => this.setPricesLow()}>Set Prices Low</button>
                        <button onClick={() => this.refreshCache()}>Refresh Cache</button>
                        <button onClick={() => this.purgeCache()}>Purge Cache</button>
                    </div>
                    <div style={{ "flexGrow": "1" }}>
                        <div

                            style={{
                                height: '100%',
                                width: '100%'
                            }}
                            className="ag-theme-alpine">
                            <AgGridReact
                                columnDefs={this.state.columnDefs}
                                datasource={this.state.datasource}
                                defaultColDef={this.state.defaultColDef}
                                rowSelection={this.state.rowSelection}
                                rowModelType={this.state.rowModelType}
                                maxBlocksInCache={this.state.maxBlocksInCache}
                                infiniteInitialRowCount={this.state.infiniteInitialRowCount}
                                maxConcurrentDatasourceRequests={this.state.maxConcurrentDatasourceRequests}
                                getRowId={this.state.getRowId}
                                getRowStyle={this.state.getRowStyle}
                                onGridReady={this.onGridReady}
                            />
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

const valueFormatter = function (params) {
    if (typeof params.value === 'number') {
        return '£' + params.value.toLocaleString();
    } else {
        return params.value;
    }
};
// this counter is used to give id's to the rows
var sequenceId = 0;
var allOfTheData = [];

function createRowData(id) {
    const makes = ['Toyota', 'Ford', 'Porsche', 'Chevy', 'Honda', 'Nissan'];
    const models = [
        'Cruze',
        'Celica',
        'Mondeo',
        'Boxster',
        'Genesis',
        'Accord',
        'Taurus',
    ];
    return {
        id: id,
        make: makes[id % makes.length],
        model: models[id % models.length],
        price: 72000,
    };
}

function insertItemsAt2(count) {
    const newDataItems = [];
    for (let i = 0; i < count; i++) {
        const newItem = createRowData(sequenceId++);
        allOfTheData.splice(2, 0, newItem);
        newDataItems.push(newItem);
    }
    return newDataItems;
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
