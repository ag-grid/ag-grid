import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <div class="test-container">
        <div class="test-header">
          <button v-on:click="setHeaderNames()">Set Header Names</button>
          <button v-on:click="removeHeaderNames()">Remove Header Names</button>
          <button v-on:click="setValueFormatters()">Set Value Formatters</button>
          <button v-on:click="removeValueFormatters()">Remove Value Formatters</button>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            class="ag-theme-alpine"
            id="myGrid"
            :gridOptions="gridOptions"
            @grid-ready="onGridReady"
            :defaultColDef="defaultColDef"
            :columnDefs="columnDefs"
            :rowData="rowData"></ag-grid-vue>
      </div>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            gridOptions: null,
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                initialWidth: 100,
                sortable: true,
                resizable: true,
                filter: true,
            },
            columnDefs: null,
            rowData: null,
        };
    },
    beforeMount() {
        this.gridOptions = {};
        this.columnDefs = this.getColumnDefs();
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        setHeaderNames() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(function (colDef, index) {
                colDef.headerName = 'C' + index;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        removeHeaderNames() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(function (colDef, index) {
                colDef.headerName = undefined;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        setValueFormatters() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(function (colDef, index) {
                colDef.valueFormatter = function (params) {
                    return '[ ' + params.value + ' ]';
                };
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        removeValueFormatters() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(function (colDef, index) {
                colDef.valueFormatter = undefined;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        getColumnDefs() {
            return [
                { field: 'athlete' },
                { field: 'age' },
                { field: 'country' },
                { field: 'sport' },
                { field: 'year' },
                { field: 'date' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' }
            ];
        },
        onGridReady(params) {
            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        },
    },
};

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample,
    },
});
