import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import ChildMessageRenderer from './childMessageRendererVue.js';
import CubeRenderer from './cubeRendererVue.js';
import CurrencyRenderer from './currencyRendererVue.js';
import ParamsRenderer from './paramsRendererVue.js';
import SquareRenderer from './squareRendererVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
        <div class="example-wrapper">
            <button v-on:click="refreshEvenRowsCurrencyData()" style="margin-bottom: 10px" class="btn btn-primary">
                Refresh Even Row Currency Data
            </button>
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
                    id="myGrid"
                    @grid-ready="onGridReady"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    :context="context"
                    :defaultColDef="defaultColDef"
                    ></ag-grid-vue>
        </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        squareRenderer: SquareRenderer,
        cubeRenderer: CubeRenderer,
        paramsRenderer: ParamsRenderer,
        currencyRenderer: CurrencyRenderer,
        childMessageRenderer: ChildMessageRenderer
    },
    data: function () {
        return {
            gridApi: null,
            columnApi: null,
            columnDefs: [
                {
                    headerName: "Row",
                    field: "row",
                    width: 150
                },
                {
                    headerName: "Square",
                    field: "value",
                    cellRenderer: "squareRenderer",
                    editable: true,
                    colId: "square",
                    width: 150
                },
                {
                    headerName: "Cube",
                    field: "value",
                    cellRenderer: "cubeRenderer",
                    colId: "cube",
                    width: 150
                },
                {
                    headerName: "Row Params",
                    field: "row",
                    cellRenderer: "paramsRenderer",
                    colId: "params",
                    width: 150
                },
                {
                    headerName: "Currency (Pipe)",
                    field: "currency",
                    cellRenderer: "currencyRenderer",
                    colId: "currency",
                    width: 120
                },
                {
                    headerName: "Child/Parent",
                    field: "value",
                    cellRenderer: "childMessageRenderer",
                    colId: "params",
                    editable: false,
                    minWidth: 150
                }
            ],
            rowData: null,
            context: null,
            defaultColDef: {
                editable: true,
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            }
        }
    },
    beforeMount() {
        this.rowData = this.createRowData();
        this.context = { componentParent: this };
    },
    methods: {
        createRowData() {
            const rowData = [];
            for (let i = 0; i < 15; i++) {
                rowData.push({
                    row: 'Row ' + i,
                    value: i,
                    currency: i + Number(Math.random().toFixed(2))
                });
            }
            return rowData;
        },
        refreshEvenRowsCurrencyData() {
            this.gridApi.forEachNode(rowNode => {
                if (rowNode.data.value % 2 === 0) {
                    rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)));
                }
            });
            this.gridApi.refreshCells({ columns: ['currency'] });
        },
        onGridReady(params) {
            this.gridApi = params.api;
        },
        methodFromParent(cell) {
            alert("Parent Component Method from " + cell + "!");
        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
