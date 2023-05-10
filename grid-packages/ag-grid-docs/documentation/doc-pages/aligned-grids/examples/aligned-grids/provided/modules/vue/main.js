import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import 'styles.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
                         
                         :gridOptions="topOptions"
                         @first-data-rendered="onFirstDataRendered($event)">
            </ag-grid-vue>

            <ag-grid-vue style="flex: 1 1 auto;"
                         ref="bottomGrid"
                         class="ag-theme-alpine"
                         :columnDefs="columnDefs"
                         :rowData="rowData"
                         
                         :gridOptions="bottomOptions">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue
    },
    data: function () {
        return {
            columnDefs: [
                { field: 'athlete' },
                { field: 'age' },
                { field: 'country' },
                { field: 'year' },
                { field: 'date' },
                { field: 'sport' },
                {
                    headerName: 'Medals',
                    children: [
                        {
                            columnGroupShow: 'closed', field: "total",
                            valueGetter: "data.gold + data.silver + data.bronze", width: 200
                        },
                        { columnGroupShow: 'open', field: "gold", width: 100 },
                        { columnGroupShow: 'open', field: "silver", width: 100 },
                        { columnGroupShow: 'open', field: "bronze", width: 100 }
                    ]
                }
            ],
            rowData: null,
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
    mounted() {
        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(rowData => this.rowData = rowData);
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

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
