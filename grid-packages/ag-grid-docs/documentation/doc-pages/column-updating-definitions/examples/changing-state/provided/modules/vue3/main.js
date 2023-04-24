import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <div class="test-container">
        <div class="test-header">
          <button v-on:click="onBtWithState()">Set Columns with State</button>
          <button v-on:click="onBtRemove()">Remove Columns</button>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            class="ag-theme-alpine"
            id="myGrid"
            :columnDefs="columnDefs"
            @grid-ready="onGridReady"
            :defaultColDef="defaultColDef"
            :rowData="rowData"></ag-grid-vue>
      </div>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,

    },
    data: function () {
        return {
            columnDefs: [],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                initialWidth: 100,
                sortable: true,
                resizable: true,
                pinned: null,
                sort: null
            },
            rowData: null
        }
    },
    beforeMount() {
        this.columnDefs = this.getColumnDefs();
    },
    methods: {
        onBtWithState() {
            this.gridApi.setColumnDefs(this.getColumnDefs());
        },
        onBtRemove() {
            this.gridApi.setColumnDefs([]);
        },
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;


            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
        getColumnDefs() {
            return [
                {
                    field: 'athlete',
                    width: 100,
                    sort: 'asc'
                },
                { field: 'age' },
                {
                    field: 'country',
                    pinned: 'left'
                },
                { field: 'sport' },
                { field: 'year' },
                { field: 'date' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' }
            ];
        }
    }
}

createApp(VueExample)
    .mount("#app")

