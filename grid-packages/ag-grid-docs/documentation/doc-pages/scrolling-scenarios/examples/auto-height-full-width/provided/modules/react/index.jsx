'use strict';

import React, { Component, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule])

const makes = ['Toyota', 'Ford', 'BMW', 'Phantom', 'Porsche'];

function createRow(index) {
    return {
        id: 'D' + (1000 + index),
        make: makes[Math.floor(Math.random() * makes.length)],
        price: Math.floor(Math.random() * 100000),
        // every third row is full width
        fullWidth: index % 3 === 0,
        val1: Math.floor(Math.random() * 1000),
        val2: Math.floor(Math.random() * 1000),
        val3: Math.floor(Math.random() * 1000),
        val4: Math.floor(Math.random() * 1000),
        val5: Math.floor(Math.random() * 1000),
        val6: Math.floor(Math.random() * 1000),
        val7: Math.floor(Math.random() * 1000),
        val8: Math.floor(Math.random() * 1000),
        val9: Math.floor(Math.random() * 1000),
        val10: Math.floor(Math.random() * 1000),
    };
}

const createRowData = () => {
    const rowData = [];
    for (let i = 0; i < 15; i++) {
        rowData.push(createRow(i));
    }
    return rowData;
};

const fullWidthCellRenderer = (props) => {
    // pinned rows will have node.floating set to either 'top' or 'bottom' - see docs for floating
    const [cssClass] = useState(props.node.rowPinned ? 'example-full-width-floating-row' : 'example-full-width-row')
    const [message] = useState(props.node.rowPinned ? `Floating full width row at index ${props.rowIndex}` : `Normal full width row at index ${props.rowIndex}`)

    return (
        <div>
            <div className={cssClass}>
                <button onClick={() => alert('button clicked')}>Click</button>
                {message}
            </div>
        </div>
    )
}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    headerName: 'Core',
                    children: [
                        { headerName: 'ID', field: 'id' },
                        { headerName: 'Make', field: 'make' },
                        { headerName: 'Price', field: 'price', filter: 'number' },
                    ],
                },
                {
                    headerName: 'Extra',
                    children: [
                        { headerName: 'Val 1', field: 'val1', filter: 'number', pinned: 'left' },
                        { headerName: 'Val 2', field: 'val2', filter: 'number', pinned: 'left' },
                        { headerName: 'Val 3', field: 'val3', filter: 'number' },
                        { headerName: 'Val 4', field: 'val4', filter: 'number' },
                        { headerName: 'Val 5', field: 'val5', filter: 'number' },
                        { headerName: 'Val 6', field: 'val6', filter: 'number' },
                        { headerName: 'Val 7', field: 'val7', filter: 'number' },
                        { headerName: 'Val 8', field: 'val8', filter: 'number' },
                        { headerName: 'Val 9', field: 'val9', filter: 'number', pinned: 'right' },
                        {
                            headerName: 'Val 10',
                            field: 'val10',
                            filter: 'number',
                            pinned: 'right',
                        },
                    ],
                },
            ],
            defaultColDef: {
                enableRowGroup: true,
                enablePivot: true,
                enableValue: true,
                width: 100,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100,
            },
            rowData: createRowData(),
            paginationPageSize: 10,
            statusBar: {
                statusPanels: [{ statusPanel: 'agAggregationComponent' }],
            },
            domLayout: 'autoHeight'
        };
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    isFullWidthRow = (params) => {
        return params.rowNode.data.fullWidth;
    }

    render() {
        return (
            <div>
                <div

                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        rowData={this.state.rowData}
                        pagination={true}
                        paginationPageSize={this.state.paginationPageSize}
                        statusBar={this.state.statusBar}
                        enableRangeSelection={true}
                        domLayout={this.state.domLayout}
                        isFullWidthRow={this.isFullWidthRow}
                        fullWidthCellRenderer={fullWidthCellRenderer}
                        onGridReady={this.onGridReady}
                    />
                </div>

                <p>
                    This text is under the grid and should move up and down as the height of the grid changes.
                </p>

                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                </p>

                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                </p>

                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                </p>

            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
