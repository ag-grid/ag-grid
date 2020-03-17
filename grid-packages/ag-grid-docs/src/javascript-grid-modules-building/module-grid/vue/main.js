import Vue from "vue";
import {AgGridVue} from "@ag-grid-community/vue";

import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {ExcelExportModule} from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";

const VueExample = {
    template: `
        <ag-grid-vue style="width: 100%; height: 150px;"
                     class="ag-theme-balham"
                     :columnDefs="columnDefs"
                     :rowData="rowData"
                     @grid-ready="onGridReady">
        </ag-grid-vue>
    `,
    components: {
        "ag-grid-vue": AgGridVue
    },
    data: function () {
        return {
            columnDefs: null,
            rowData: null
        };
    },
    beforeMount() {
        this.columnDefs = [
            {headerName: 'Make', field: 'make'},
            {headerName: 'Model', field: 'model'},
            {headerName: 'Price', field: 'price'}
        ];

        this.rowData = [
            {make: 'Toyota', model: 'Celica', price: 35000},
            {make: 'Ford', model: 'Mondeo', price: 32000},
            {make: 'Porsche', model: 'Boxter', price: 72000}
        ];
    },
    methods: {
        onGridReady(params) {
            params.api.sizeColumnsToFit();
        }
    }
};

new Vue({
    el: "#app",
    components: {
        "my-component": VueExample
    }
});
