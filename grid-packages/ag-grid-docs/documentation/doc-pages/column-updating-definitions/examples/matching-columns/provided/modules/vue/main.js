import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const athleteColumn = {
    headerName: 'Athlete',
    valueGetter: (params) => {
        return params.data.athlete;
    }
};
const VueExample = {
    template: `
      <div style="height: 100%">
      <div class="test-container">
        <div class="test-header">
          <button v-on:click="onBtIncludeMedalColumns()">Include Medal Columns</button>
          <button v-on:click="onBtExcludeMedalColumns()">Exclude Medal Columns</button>
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
                resizable: true
            },
            rowData: null
        }
    },
    beforeMount() {
        this.columnDefs = this.getColDefsMedalsIncluded();
    },
    methods: {
        onBtExcludeMedalColumns() {
            this.gridApi.setColumnDefs(this.getColDefsMedalsExcluded());
        },
        onBtIncludeMedalColumns() {
            this.gridApi.setColumnDefs(this.getColDefsMedalsIncluded());
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
        getColDefsMedalsIncluded() {
            return [
                athleteColumn,
                {
                    colId: 'myAgeCol',
                    headerName: 'Age',
                    valueGetter: (params) => {
                        return params.data.age;
                    }
                },
                {
                    headerName: 'Country',
                    headerClass: 'country-header',
                    valueGetter: (params) => {
                        return params.data.country;
                    }
                },
                { field: 'sport' },
                { field: 'year' },
                { field: 'date' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' }
            ];
        },
        getColDefsMedalsExcluded() {
            return [
                athleteColumn,
                {
                    colId: 'myAgeCol',
                    headerName: 'Age',
                    valueGetter: (params) => {
                        return params.data.age;
                    }
                },
                {
                    headerName: 'Country',
                    headerClass: 'country-header',
                    valueGetter: (params) => {
                        return params.data.country;
                    }
                },
                { field: 'sport' },
                { field: 'year' },
                { field: 'date' }
            ];
        }
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
