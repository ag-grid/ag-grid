import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';
import 'https://unpkg.com/@ag-grid-community/polymer/index.js';

import CubeCellRenderer from './cubed-cell-renderer.js';
import ChildCellRenderer from './child-cell-renderer.js';
import CurrencyCellRenderer from './currency-cell-renderer.js';
import ParamsCellRenderer from './params-cell-renderer.js';
import SquareCellRenderer from './square-cell-renderer.js';

class AgGridPolymerExample extends PolymerElement {
    static get template() {
        return html`
            <link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/core/dist/styles/ag-grid.css">
            <link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/core/dist/styles/ag-theme-alpine.css">

            <div style="display: flex; flex-direction: column; height: 100%;">
                <div>
                    <button on-click="refreshRowData" style="margin-bottom: 1rem;">Refresh Data</button>
                </div>

                <div style="flex: 1 1 auto;">
                    <ag-grid-polymer
                        style="height: 100%;"
                        class="ag-theme-alpine"
                        gridOptions="{{gridOptions}}"
                        on-first-data-rendered="{{firstDataRendered}}"></ag-grid-polymer>
                </div>
            </div>
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
            { headerName: "Row", field: "row", width: 100 },
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
                minWidth: 135
            },
            {
                headerName: "Child/Parent",
                field: "value",
                cellRendererFramework: 'child-cell-renderer',
                colId: "params"
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
