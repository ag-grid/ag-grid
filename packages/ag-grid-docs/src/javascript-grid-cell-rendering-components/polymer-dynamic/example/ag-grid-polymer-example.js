import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";
import "../node_modules/ag-grid-polymer/index.js";

import CubeCellRenderer from "./cubed-cell-renderer.js";
import ChildCellRenderer from "./child-cell-renderer.js";
import CurrencyCellRenderer from "./currency-cell-renderer.js";
import ParamsCellRenderer from "./params-cell-renderer.js";
import SquareCellRenderer from "./square-cell-renderer.js";

class AgGridPolymerExample extends PolymerElement {
    static get template() {
        return html`
            <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
            <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-balham.css">
          
            <button on-click="refreshRowData" style="margin-bottom: 15px">Refresh Data</button>
            <ag-grid-polymer style="width: 100%; height: 420px; "
                             class="ag-theme-balham"
                             gridOptions="{{gridOptions}}"
                             on-first-data-rendered="{{firstDataRendered}}"></ag-grid-polymer>
    `;
    }

    constructor() {
        super();

        this.gridOptions = {
            context: {
                componentParent: this
            },
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            components: {
                squareCellRenderer: SquareCellRenderer,
                cubeCellRenderer: CubeCellRenderer,
                childCellRenderer: ChildCellRenderer,
                currencyCellRenderer: CurrencyCellRenderer,
                paramsCellRenderer: ParamsCellRenderer
            }
        };
    }

    methodFromParent(cell) {
        alert(`"Parent Component Method from ${cell}!`);
    }

    createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 100},
            {
                headerName: "Square",
                field: "value",
                cellRendererFramework: 'square-cell-renderer',
                editable: true,
                colId: "square",
                width: 100
            },
            {
                headerName: "Cube",
                field: "value",
                cellRendererFramework: 'cube-cell-renderer',
                editable: true,
                colId: "cube",
                width: 100
            },
            {
                headerName: "Row Params",
                field: "row",
                cellRendererFramework: 'params-cell-renderer',
                colId: "params",
                width: 215
            },
            {
                headerName: "Currency (Pipe)",
                field: "currency",
                cellRendererFramework: 'currency-cell-renderer',
                cellRendererParams: {
                    currency: "EUR"
                },
                colId: "params",
                width: 135
            },
            {
                headerName: "Child/Parent",
                field: "value",
                cellRendererFramework: 'child-cell-renderer',
                colId: "params",
                width: 120
            }
        ];
    }

    refreshRowData() {
        let rowData = this.createRowData();
        this.gridOptions.api.setRowData(rowData);
    }

    createRowData() {
        let rowData = [];

        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i,
                currency: i + Number(Math.random().toFixed(2))
            });
        }

        return rowData;
    }


    firstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }

}

customElements.define('ag-grid-polymer-example', AgGridPolymerExample);