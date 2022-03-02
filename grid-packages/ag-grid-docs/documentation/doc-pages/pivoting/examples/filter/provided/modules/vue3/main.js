import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule, MenuModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <div style="margin-bottom: 10px">
                        <button v-on:click="clearFilter()">Clear Filter</button>
                        <button v-on:click="filterUKAndIrelandBoxing()">UK and Ireland Boxing</button>
                        <button v-on:click="filterUKAndIrelandEquestrian()">UK and Ireland Equestrian</button>
                        <button v-on:click="filterUsaAndCanadaBoxing()">USA and Canada Bobsleigh</button>
                        <button v-on:click="filterUsaAndCanadaEquestrian()">USA and Canada Equestrian</button>
                    </div>
                    <div id="title">All Medals by Country</div>
                </div>
                <ag-grid-vue
                        style="width: 100%; height: 100%;"
                        class="ag-theme-alpine"
                        id="myGrid"
                        :columnDefs="columnDefs"
                        @grid-ready="onGridReady"
                        :defaultColDef="defaultColDef"
                        :pivotMode="true"
                        :sideBar="sideBar"
                        :rowData="rowData"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,

    },
    data: function () {
        return {
            columnDefs: [{
                field: "country",
                pivot: true,
                enablePivot: true
            }, { field: "year" }, { field: "date" }, { field: "sport" }, {
                field: "gold",
                aggFunc: "sum"
            }, {
                field: "silver",
                aggFunc: "sum"
            }, {
                field: "bronze",
                aggFunc: "sum"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                filter: true,
                sortable: true,
                resizable: true
            },
            sideBar: null,
            rowData: null
        }
    },
    beforeMount() {
        this.sideBar = true
    },
    methods: {
        clearFilter() {
            this.gridApi.setFilterModel(null);
            setTitle('All Medals by Country');
        },
        filterUKAndIrelandBoxing() {
            this.gridApi.setFilterModel({
                country: {
                    type: 'set',
                    values: [
                        'Ireland',
                        'Great Britain'
                    ]
                },
                sport: {
                    type: 'set',
                    values: ['Boxing']
                }
            });
            setTitle('UK and Ireland - Boxing');
        },
        filterUKAndIrelandEquestrian() {
            this.gridApi.setFilterModel({
                country: {
                    type: 'set',
                    values: [
                        'Ireland',
                        'Great Britain'
                    ]
                },
                sport: {
                    type: 'set',
                    values: ['Equestrian']
                }
            });
            setTitle('UK and Ireland - Equestrian');
        },
        filterUsaAndCanadaBoxing() {
            this.gridApi.setFilterModel({
                country: {
                    type: 'set',
                    values: [
                        'United States',
                        'Canada'
                    ]
                },
                sport: {
                    type: 'set',
                    values: ['Bobsleigh']
                }
            });
            setTitle('USA and Canada - Boxing');
        },
        filterUsaAndCanadaEquestrian() {
            this.gridApi.setFilterModel({
                country: {
                    type: 'set',
                    values: [
                        'United States',
                        'Canada'
                    ]
                },
                sport: {
                    type: 'set',
                    values: ['Equestrian']
                }
            });
            setTitle('USA and Canada - Equestrian');
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
    }
}

window.setTitle = function setTitle(title) {
    document.querySelector('#title').innerText = title;
}

createApp(VueExample)
    .mount("#app")

