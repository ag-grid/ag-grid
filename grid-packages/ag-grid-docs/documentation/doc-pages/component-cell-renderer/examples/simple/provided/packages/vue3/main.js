import {createApp, ref} from 'vue';
import {AgGridVue} from 'ag-grid-vue3';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
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
                    :rowData="rowData">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        medalCellRenderer: MedalCellRenderer,
        totalValueRenderer: TotalValueRenderer
    },
    setup(props) {
        const rowData = ref(null);

        return {
            columnDefs: [
                {field: "athlete"},
                {field: "year"},
                {
                    field: "gold",
                    cellRenderer: "medalCellRenderer"
                },
                {
                    field: "silver",
                    cellRenderer: "medalCellRenderer"
                },
                {
                    field: "bronze",
                    cellRenderer: "medalCellRenderer"
                }, {
                    field: "total",
                    minWidth: 175,
                    cellRenderer: "totalValueRenderer"
                }
            ],
            defaultColDef: {
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            },
            rowData
        }
    },
    methods: {
        onGridReady(params) {
            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => this.rowData = data);
        },
    }
}

createApp(VueExample)
    .mount("#app")

