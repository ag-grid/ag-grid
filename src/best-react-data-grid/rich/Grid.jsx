import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import SampleRowDataFactory from "./SampleRowData.jsx";
import ColumnDefinitionFactory from "./ColumnDefinitions.jsx";

// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

export default class Grid extends Component {

    constructor() {
        super();

        this.state = {
            // set the columns to use inside the grid
            columnDefs: new ColumnDefinitionFactory().createColDefs(),
            // set the row data to use inside the grid
            rowData: new SampleRowDataFactory().createRowData()
        };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

    render() {
        return (
            <div style={{height: 525, width: 900}} className="ag-fresh">
                <AgGridReact
                    // gridOptions is optional - it's possible to provide
                    // all values as React props
                    gridOptions={this.gridOptions}

                    // listening for events
                    onGridReady={this.onGridReady}

                    // binding to array properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    // no binding, just providing hard coded strings for the properties
                    suppressRowClickSelection="true"
                    rowSelection="multiple"
                    enableColResize="true"
                    enableSorting="true"
                    enableFilter="true"
                    groupHeaders="true"
                    rowHeight="22"
                />
            </div>
        );
    }
}
