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
            <ag-grid-vue
                style="width: 100%; height: 45%;"
                class="ag-theme-alpine"
                ref="topGrid"
                :gridOptions="topOptions"
                @first-data-rendered="onFirstDataRendered($event)"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData">
            </ag-grid-vue>
            <div style='height: 5%'></div>
            <ag-grid-vue
                style="width: 100%; height: 45%;"
                class="ag-theme-alpine"
                ref="bottomGrid"
                :gridOptions="bottomOptions"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            topOptions: {
                alignedGrids: () => [this.$refs.bottomGrid],
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
                alignedGrids: () => [this.$refs.topGrid],
                defaultColDef: {
                    editable: true,
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 100
                }
            },
            topGridApi: null,
            columnDefs: [
                {
                    headerName: 'Group 1',
                    headerClass: 'blue',
                    groupId: 'Group1',
                    children: [
                        { field: 'athlete', pinned: true, width: 100 },
                        { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                        { field: 'country', width: 100 },
                        { field: 'year', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 }
                    ]
                },
                {
                    headerName: 'Group 2',
                    headerClass: 'green',
                    groupId: 'Group2',
                    children: [
                        { field: 'athlete', pinned: true, width: 100 },
                        { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                        { field: 'country', width: 100 },
                        { field: 'year', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 },
                        { field: 'date', width: 100 },
                        { field: 'sport', columnGroupShow: 'open', width: 100 }
                    ]
                }
            ],
            defaultColDef: {
                resizable: true
            },
            rowData: null
        };
    },
    mounted() {
        this.topGridApi = this.$refs.topGrid.api;

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(rowData => {
                this.rowData = rowData

                // mix up some columns
                this.topGridApi.moveColumnByIndex(11, 4);
                this.topGridApi.moveColumnByIndex(11, 4);
            });
    },
    methods: {
        onFirstDataRendered(params) {
            this.topGridApi.sizeColumnsToFit();
        }
    }
};

createApp(VueExample).mount('#app');
