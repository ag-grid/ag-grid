import {createApp} from 'vue';
import {AgGridVue} from '@ag-grid-community/vue';

import {AllCommunityModules} from '@ag-grid-community/all-modules';

import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

import 'styles.css';

const VueExample = {
    template: `
        <div style="height: 100%; display: flex; flex-direction: column" class="ag-theme-alpine">
            <div style="flex: 0 1 auto;">
                <label><input type="checkbox" checked @change="onCbAthlete($event.target.checked)"/>Athlete</label>
                <label><input type="checkbox" checked @change="onCbAge($event.target.checked)"/>Age</label>
                <label><input type="checkbox" checked @change="onCbCountry($event.target.checked)"/>Country</label>
            </div>

            <ag-grid-vue style="flex: 1 1 auto;"
                         ref="topGrid"
                         class="ag-theme-alpine"
                         :columnDefs="columnDefs"
                         :rowData="rowData"
                         :modules="modules"
                         :gridOptions="topOptions"
                         @first-data-rendered="onFirstDataRendered($event)">
            </ag-grid-vue>
            
            <ag-grid-vue style="flex: 1 1 auto;"
                         ref="bototmGrid"
                         class="ag-theme-alpine"
                         :columnDefs="columnDefs"
                         :rowData="rowData"
                         :modules="modules"
                         :gridOptions="bottomOptions">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue
    },
    data: function () {
        return {
            columnDefs: null,
            rowData: null,
            modules: AllCommunityModules,
            topOptions: {
                alignedGrids: [],
                defaultColDef: {
                    editable: true,
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 100
                }
            },
            bottomOptions: {
                alignedGrids: [],
                defaultColDef: {
                    editable: true,
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 100
                }
            }
        };
    },
    beforeMount() {
        this.columnDefs = [
            {field: 'athlete'},
            {field: 'age'},
            {field: 'country'},
            {field: 'year'},
            {field: 'date'},
            {field: 'sport'},
            {
                headerName: 'Medals',
                children: [
                    {
                        columnGroupShow: 'closed', field: "total",
                        valueGetter: "data.gold + data.silver + data.bronze", width: 200
                    },
                    {columnGroupShow: 'open', field: "gold", width: 100},
                    {columnGroupShow: 'open', field: "silver", width: 100},
                    {columnGroupShow: 'open', field: "bronze", width: 100}
                ]
            }
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);

        const httpRequest = new XMLHttpRequest();

        httpRequest.open(
            "GET",
            'https://www.ag-grid.com/example-assets/olympic-winners.json'
        );
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                this.rowData = JSON.parse(httpRequest.responseText);
            }
        };
    },
    methods: {
        onCbAthlete(value) {
            // we only need to update one grid, as the other is a slave
            this.topGridColumnApi.setColumnVisible('athlete', value);
        },

        onCbAge(value) {
            // we only need to update one grid, as the other is a slave
            this.topGridColumnApi.setColumnVisible('age', value);
        },

        onCbCountry(value) {
            // we only need to update one grid, as the other is a slave
            this.topGridColumnApi.setColumnVisible('country', value);
        },

        onFirstDataRendered(params) {
            this.topGridApi = params.api;
            this.topGridColumnApi = params.columnApi;

            this.topGridApi.sizeColumnsToFit();
        }
    }
};

createApp(VueExample).mount('#app');
