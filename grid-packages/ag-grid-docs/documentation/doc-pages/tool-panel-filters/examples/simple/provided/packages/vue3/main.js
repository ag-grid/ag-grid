import {createApp} from 'vue';
import {AgGridVue} from 'ag-grid-vue3';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

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
                    :sideBar="sideBar"
                    :rowData="rowData"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,

    },
    data: function () {
        return {
            columnDefs: [
                {
                    field: "athlete",
                    minWidth: 200,
                    filter: "agTextColumnFilter"
                },
                {
                    field: "age"
                },
                {
                    field: "country",
                    minWidth: 200
                },
                {
                    field: "year"
                },
                {
                    field: "date",
                    minWidth: 180
                },
                {
                    field: "gold",
                    filter: false
                },
                {
                    field: "silver",
                    filter: false
                },
                {
                    field: "bronze",
                    filter: false
                },
                {
                    field: "total",
                    filter: false
                }
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            },
            sideBar: null,
            rowData: null
        }
    },
    beforeMount() {
        this.sideBar = "filters"
    },
    methods: {
        onGridReady(params) {
            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
    }
}


createApp(VueExample)
    .mount("#app")

