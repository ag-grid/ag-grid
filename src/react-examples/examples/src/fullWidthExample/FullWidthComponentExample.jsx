import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";
import NameAndAgeRenderer from "./NameAndAgeRenderer";

export default class FullWidthComponentExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {},

            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs()
        };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    isFullWidthCell(rowNode)  {
        return (rowNode.id === "0") || (parseInt(rowNode.id) % 2 === 0);
    }

    createColumnDefs() {
        return [
            {
                headerName: "Name",
                field: "name",
                width: 400
            },
            {
                headerName: "Age",
                field: "age",
                width: 399
            },
        ];
    }

    createRowData() {
        return [
            {name: "Bob", age: 10},
            {name: "Harry", age: 3},
            {name: "Sally", age: 20},
            {name: "Mary", age: 5},
            {name: "John", age: 15},
            {name: "Bob", age: 10},
            {name: "Harry", age: 3},
            {name: "Sally", age: 20},
            {name: "Mary", age: 5},
            {name: "John", age: 15},
            {name: "Jack", age: 25},
            {name: "Sue", age: 43},
            {name: "Sean", age: 44},
            {name: "Niall", age: 2},
            {name: "Alberto", age: 32},
            {name: "Fred", age: 53},
            {name: "Jenny", age: 34},
            {name: "Larry", age: 13},
        ];
    }

    render() {
        return (
            <div style={{height: 400, width: 945}}
                 className="ag-fresh">
                <h1>Full Width Renderer Example</h1>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    isFullWidthCell={this.isFullWidthCell}
                    fullWidthCellRendererFramework={NameAndAgeRenderer}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};
