import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";
import MedalCellRenderer from './medalCellRendererVue.js';
import TotalValueRenderer from './totalValueRendererVue.js';

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
                    id="myGrid"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :modules="modules"
                    :rowData="rowData"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        medalCellRenderer: MedalCellRenderer,
        totalValueRenderer: TotalValueRenderer
    },
    data: function () {
        return {
            columnDefs: [{ field: "athlete" }, { field: "year" }, {
                field: "gold",
                cellRendererFramework: "medalCellRenderer"
            }, {
                field: "silver",
                cellRendererFramework: "medalCellRenderer"
            }, {
                field: "bronze",
                cellRendererFramework: "medalCellRenderer"
            }, {
                field: "total",
                minWidth: 175,
                cellRendererFramework: "totalValueRenderer"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                editable: true,
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            },
            modules: [ClientSideRowModelModule],
            rowData: null
        }
    },
    beforeMount() {

    },
    methods: {
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
    }
}


new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
