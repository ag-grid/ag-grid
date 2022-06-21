'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    headerName: "#",
                    colId: "rowNum",
                    valueGetter: "node.id"
                },
                {
                    field: "athlete",
                    minWidth: 170
                },
                { field: "age" },
                { field: "country" },
                { field: "year" },
                { field: "date" },
                { field: "sport" },
                { field: "gold" },
                { field: "silver" },
                { field: "bronze" },
                { field: "total" }
            ],
            rowData: null,
            defaultColDef: {
                editable: true,
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            }
        };

        this.myInput = React.createRef();
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            this.setState({ rowData: data });
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }

    componentDidMount() {
        this.myInput.current.addEventListener('keydown', event => {
            if (event.key !== 'Tab') {
                return;
            }

            event.preventDefault();
            this.gridApi.ensureIndexVisible(0);

            const firstCol = this.gridColumnApi.getAllDisplayedColumns()[0];

            this.gridApi.ensureColumnVisible(firstCol);
            this.gridApi.setFocusedCell(0, firstCol);
        }, true);
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div className="test-container">
                    <div>
                        <div className="form-container">
                            <label>Tab into Grid (Focus the First Cell)</label>
                            <input ref={this.myInput} />
                        </div>
                        <div className="form-container">
                            <label>Tab into the Grid (Default Behavior)</label>
                            <input />
                        </div>
                    </div>
                    <div id="myGrid" style={{ height: '100%', width: '100%' }} className="ag-theme-alpine">
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            defaultColDef={this.state.defaultColDef}
                            onGridReady={this.onGridReady} />
                    </div>
                    <div className="form-container">
                        <label>Tab into the grid with Shift-Tab (Default Behavior)</label>
                        <input />
                    </div>
                </div>
            </div>
        );
    }
}

render(<GridExample></GridExample>, document.querySelector('#root'))
