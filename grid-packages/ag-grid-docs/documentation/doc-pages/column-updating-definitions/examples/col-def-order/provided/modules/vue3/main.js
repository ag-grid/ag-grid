import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

const VueExample = {
    template: `
      <div style="height: 100%">
      <div class="test-container">
        <div class="test-header">
          <button v-on:click="setColsA()">Column Set A</button>
          <button v-on:click="setColsB()">Column Set B</button>
          <button v-on:click="clearColDefs()">Clear</button>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            class="ag-theme-alpine"
            id="myGrid"
            :columnDefs="columnDefs"
            @grid-ready="onGridReady"
            :defaultColDef="defaultColDef"
            :maintainColumnOrder="true"
            :modules="modules"
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
                filter: true
            },
            modules: [ClientSideRowModelModule],
            rowData: null
        }
    },
    beforeMount() {
        this.columnDefs = this.getColumnDefsA();
    },
    methods: {
        setColsA() {
            this.gridApi.setColumnDefs(this.getColumnDefsA());
        },
        setColsB() {
            this.gridApi.setColumnDefs(this.getColumnDefsB());
        },
        clearColDefs() {
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
        getColumnDefsA() {
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
        getColumnDefsB() {
            return [
                {
                    field: 'athlete',
                    headerName: 'ATHLETE'
                },
                {
                    field: 'age',
                    headerName: 'AGE'
                },
                {
                    field: 'country',
                    headerName: 'COUNTRY'
                },
                {
                    field: 'sport',
                    headerName: 'SPORT'
                },
                {
                    field: 'year',
                    headerName: 'YEAR'
                },
                {
                    field: 'date',
                    headerName: 'DATE'
                },
                {
                    field: 'gold',
                    headerName: 'GOLD'
                },
                {
                    field: 'silver',
                    headerName: 'SILVER'
                },
                {
                    field: 'bronze',
                    headerName: 'BRONZE'
                },
                {
                    field: 'total',
                    headerName: 'TOTAL'
                }
            ];
        }
    }
}

createApp(VueExample)
    .mount("#app")

