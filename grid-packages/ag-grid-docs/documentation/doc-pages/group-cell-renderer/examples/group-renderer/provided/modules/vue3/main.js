import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import SimpleCellRenderer from './simpleCellRendererVue.js';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule])

const VueExample = {
    template: `
        <div style="height: 100%">
                <ag-grid-vue                
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :groupDisplayType="groupDisplayType"
                :suppressRowClickSelection="true"
                :groupDefaultExpanded="groupDefaultExpanded"
                :rowSelection="rowSelection"
                :groupSelectsChildren="true"
                :animateRows="true"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        SimpleCellRenderer
    },
    data: function () {
        return {
            columnDefs: [{
                headerName: "Country Group - No Renderer",
                showRowGroup: "country",
                minWidth: 250
            }, {
                headerName: "All Groups - No Renderer",
                showRowGroup: true,
                minWidth: 240
            }, {
                headerName: "Group Renderer A",
                showRowGroup: true,
                cellRenderer: "agGroupCellRenderer",
                minWidth: 220
            }, {
                headerName: "Group Renderer B",
                field: "city",
                showRowGroup: true,
                cellRenderer: "agGroupCellRenderer",
                minWidth: 220
            }, {
                headerName: "Group Renderer C",
                field: "city",
                minWidth: 240,
                showRowGroup: true,
                cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {
                    "suppressCount": true,
                    "checkbox": true,
                    "innerRenderer": 'SimpleCellRenderer',
                    "suppressDoubleClickExpand": true,
                    "suppressEnterExpand": true
                }
            }, {
                headerName: "Type",
                field: "type",
                rowGroup: true
            }, {
                headerName: "Country",
                field: "country",
                rowGroup: true
            }, {
                headerName: "City",
                field: "city"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 120,
                resizable: true,
            },
            rowData: null,
            groupDisplayType: null,
            groupDefaultExpanded: null,
            rowSelection: null
        }
    },
    created() {
        this.rowData = getData();
        this.groupDisplayType = 'custom';
        this.groupDefaultExpanded = 1;
        this.rowSelection = 'multiple'
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;

        },
    }
}


createApp(VueExample)
    .mount("#app")

