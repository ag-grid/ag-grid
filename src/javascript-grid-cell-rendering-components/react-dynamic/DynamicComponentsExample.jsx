import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";
import SquareRenderer from "./SquareRenderer.jsx";
import CubeRenderer from "./CubeRenderer.jsx";
import ParamsRenderer from "./ParamsRenderer.jsx";
import CurrencyRenderer from "./CurrencyRenderer.jsx";
import ChildMessageRenderer from "./ChildMessageRenderer.jsx";

export default class DynamicComponentsExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {
                context: {
                    componentParent: this
                }
            },

            rowData: DynamicComponentsExample.createRowData(),

            columnDefs: DynamicComponentsExample.createColumnDefs()
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.refreshEvenRowsCurrencyData = this.refreshEvenRowsCurrencyData.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    methodFromParent(cell) {
        alert(`Parent Component Method from ${cell}!`);
    }

    refreshEvenRowsCurrencyData() {
        this.gridApi.forEachNode(rowNode => {
            if (rowNode.data.value % 2 === 0) {
                rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)))
            }
        });

        this.gridApi.refreshCells({
            columns: ['currency']
        })
    }

    static createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 100},
            {
                headerName: "Square",
                field: "value",
                cellRendererFramework: SquareRenderer,
                editable: true,
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
                colId: "currency",
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

    static createRowData() {
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
            <div style={{height: 400, width: 900}} className="ag-theme-balham">
                <button onClick={this.refreshEvenRowsCurrencyData} style={{marginBottom: 10}} className="btn btn-primary">Refresh Even Row Currency Data</button>
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
