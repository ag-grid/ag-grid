import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import SampleRowDataFactory from "./SampleRowData.jsx";
import ColumnDefinitionFactory from "./ColumnDefinitions.jsx";
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
    }

    render() {
        return (
            <div style={{height: 525, width: 900}} className="ag-theme-balham">
                <AgGridReact
                    // binding to array properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    // no simple properties
                    suppressRowClickSelection="true"
                    rowSelection="multiple"
                    enableColResize="true"
                    enableSorting="true"
                    enableFilter="true"
                    animateRows="true"
                    groupHeaders="true"
                />
            </div>
        );
    }
}
