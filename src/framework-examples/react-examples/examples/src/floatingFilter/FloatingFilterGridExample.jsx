import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import FloatingFilter from "./floatingFilter";
import overrideStyle from "./floatingFilter.css";

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
                filter: 'set'
            },
            {headerName: "Model", field: "model"},
            {headerName: "Price", field: "price"}
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
            height: 400,
            width: 945
        };

        // combine the styles
        const style = Object.assign({}, divStyle, overrideStyle);

        return (
            <div style={style} className="ag-fresh">
                <h1>Floating Filter Example</h1>
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
