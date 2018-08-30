import React, {Component} from "react";
import {AgGridReact, AgGridColumn} from "ag-grid-react";

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rowData: [
                {make: "Toyota", model: "Celica", price: 35000},
                {make: "Ford", model: "Mondeo", price: 32000},
                {make: "Porsche", model: "Boxter", price: 72000}
            ]
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
    }

    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }

    render() {
        let containerStyle = {
            height: 131
        };

        return (

            <div>
                <div style={containerStyle} className="ag-theme-balham">
                    <AgGridReact
                        // properties
                        rowData={this.state.rowData}

                        // events
                        onGridReady={this.onGridReady}>
                        onFirstDataRendered={this.onFirstDataRendered}>


                        {/*column definitions */}
                        <AgGridColumn field="make" />
                        <AgGridColumn field="model" />
                        <AgGridColumn field="price" />
                    </AgGridReact>
                </div>
            </div>
        )
    }
};
