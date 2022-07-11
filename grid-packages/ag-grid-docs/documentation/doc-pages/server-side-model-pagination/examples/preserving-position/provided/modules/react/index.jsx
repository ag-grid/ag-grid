
'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ServerSideRowModelModule, RowGroupingModule, MenuModule, ColumnsToolPanelModule])

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                { field: 'index' },
                { field: 'country' },
                { field: 'athlete', minWidth: 190 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 90,
                resizable: true,
                sortable: true,
            },
            rowModelType: 'serverSide',
            paginationPageSize: 1000,
            serverSideInitialRowCount: 5000,

            displayGrid: true,
            initialPageTarget: 4,
            initialRowTarget: 4500,

            initialisedPosition: false,
        };
    }

    onGridReady = params => {
        const updateData = (data) => data.map((item, index) => ({ ...item, index }));
        
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data))
            .then(data => {
                // setup the fake server with entire dataset
                var fakeServer = new FakeServer(data);
                // create datasource with a reference to the fake server
                var datasource = getServerSideDatasource(fakeServer);
                // register the datasource with the grid
                params.api.setServerSideDatasource(datasource);
            });
    }

    onBodyScrollEnd = event => {
        if (!this.state.initialisedPosition) {
            return;
        }

        this.setState({
            ...this.state,
            initialRowTarget: event.api.getFirstVisibleRowIndex(),
            serverSideInitialRowCount: event.api.getDisplayedRowCount(),
        });
    }

    onPaginationChanged = event => {
        if (!this.state.initialisedPosition) {
            return;
        }

        this.setState({
            ...this.state,
            initialPageTarget: event.api.paginationGetCurrentPage(),
        });
    }

    onFirstDataRendered = (event) => {
        event.api.paginationGoToPage(this.state.initialPageTarget);
        event.api.ensureIndexVisible(this.state.initialRowTarget, 'top');
        this.setState({ ...this.state, initialisedPosition: true });
    }

    resetGrid = () => {
        this.setState({
            ...this.state,
            displayGrid: false,
            initialisedPosition: false,
        }, () => {
            this.setState({ ...this.state, displayGrid: true });
        });
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <button onClick={() => this.resetGrid()}>Reload Grid</button>
                {
                    this.state.displayGrid && (
                        <div className="grid-wrapper ag-theme-alpine-dark">
                            <AgGridReact
                                columnDefs={this.state.columnDefs}
                                defaultColDef={this.state.defaultColDef}
                                rowModelType={this.state.rowModelType}
                                pagination={true}
                                paginationPageSize={this.state.paginationPageSize}
                                serverSideInitialRowCount={this.state.serverSideInitialRowCount}
                                suppressAggFuncInHeader={true}
                                animateRows={true}
                                onGridReady={this.onGridReady}
                                onBodyScrollEnd={this.onBodyScrollEnd}
                                onPaginationChanged={this.onPaginationChanged}
                                onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}

function getServerSideDatasource(server) {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);
            var response = server.getData(params.request);
            // adding delay to simulate real server call
            setTimeout(function () {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                }
                else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
