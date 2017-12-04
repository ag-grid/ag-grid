import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import FloatingFilter from "./floatingFilter.jsx";

import "ag-grid-enterprise";

export default class FloatingFilterGridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData()
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    createColumnDefs() {
        return [
            {
                headerName: "Make",
                field: "make",
                floatingFilterComponentFramework: FloatingFilter,
                filter: 'set',
                width: 300
            },
            {
                headerName: "Model",
                field: "model",
                width: 300
            },
            {
                headerName: "Price",
                field: "price",
                width: 300
            }
        ];
    }

    createRowData() {
        return [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ];
    }

    render() {
        let divStyle = {
            height: 150,
            width: 900
        };

        // combine the styles
        const style = Object.assign({}, divStyle);

        return (
            <div style={style} className="ag-theme-fresh">
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    floatingFilter={true}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        )
    }
};
