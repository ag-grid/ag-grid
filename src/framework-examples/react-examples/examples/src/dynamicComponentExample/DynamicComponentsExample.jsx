import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";
import SquareRenderer from "./SquareRenderer";
import CubeRenderer from "./CubeRenderer";
import ParamsRenderer from "./ParamsRenderer";
import CurrencyRenderer from "./CurrencyRenderer";
import ChildMessageRenderer from "./ChildMessageRenderer";

export default class DynamicComponentsExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {
                context: {
                    componentParent: this
                }
            },

            rowData: this.createRowData(),

            columnDefs: this.createColumnDefs()
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.refreshRowData = this.refreshRowData.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    onCellValueChanged($event) {
        this.gridApi.refreshCells([$event.node],["cube"]);
    }

    methodFromParent(cell) {
        alert(`Parent Component Method from ${cell}!`);
    }

    createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 100},
            {
                headerName: "Square",
                field: "value",
                cellRendererFramework: SquareRenderer,
                editable:true,
                colId: "square",
                width: 100
            },
            {
                headerName: "Cube",
                field: "value",
                cellRendererFramework: CubeRenderer,
                colId: "cube",
                width: 100
            },
            {
                headerName: "Row Params",
                field: "row",
                cellRendererFramework: ParamsRenderer,
                colId: "params",
                width: 215
            },
            {
                headerName: "Currency",
                field: "currency",
                cellRendererFramework: CurrencyRenderer,
                colId: "params",
                width: 135
            },
            {
                headerName: "Child/Parent",
                field: "value",
                cellRendererFramework: ChildMessageRenderer,
                colId: "params",
                width: 120
            }
        ];
    }

    refreshRowData() {
        let rowData = this.createRowData();
        this.gridApi.setRowData(rowData);
    }

    createRowData() {
        let rowData = [];

        for (let i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i,
                currency: 1 + Number(Math.random()).toFixed(2)
            });
        }

        return rowData;
    }
    render() {
        return (
            <div style={{height: 400, width: 945}}
                 className="ag-fresh">
                <h1>Dynamic React Component Example</h1>
                <button onClick={this.refreshRowData}>Refresh Data</button>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    gridOptions={this.state.gridOptions}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};
