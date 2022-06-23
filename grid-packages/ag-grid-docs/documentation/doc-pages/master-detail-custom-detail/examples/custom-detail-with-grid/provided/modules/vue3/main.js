import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import DetailCellRenderer from './detailCellRendererVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="example-wrapper">
                <div style="margin-bottom: 5px;">
                    <button v-on:click="printDetailGridInfo()">Print Detail Grid Info</button>
                    <button v-on:click="expandCollapseAll()">Toggle Expand / Collapse</button>
                </div>
                <ag-grid-vue
                        style="width: 100%; height: 100%;"
                        class="ag-theme-alpine"
                        id="myGrid"
                        :columnDefs="columnDefs"
                        @grid-ready="onGridReady"
                        :defaultColDef="defaultColDef"
                        :masterDetail="true"
                        :detailRowHeight="detailRowHeight"
                        :detailCellRenderer="detailCellRenderer"
                        :rowData="rowData"
                        @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        myDetailCellRenderer: DetailCellRenderer
    },
    data: function () {
        return {
            columnDefs: [{
                field: "name",
                cellRenderer: "agGroupCellRenderer"
            }, { field: "account" }, { field: "calls" }, {
                field: "minutes",
                valueFormatter: "x.toLocaleString() + 'm'"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: { flex: 1 },
            detailRowHeight: null,
            detailCellRenderer: null,
            rowData: null
        }
    },
    beforeMount() {
        this.detailRowHeight = 310;
        this.detailCellRenderer = "myDetailCellRenderer"
    },
    methods: {
        onFirstDataRendered(params) {
            setTimeout(function () {
                params.api.getDisplayedRowAtIndex(1).setExpanded(true);
            }, 0);
        },
        expandCollapseAll() {
            this.gridApi.forEachNode(function (node) {
                node.expanded = !!window.collapsed;
            });
            window.collapsed = !window.collapsed;
            this.gridApi.onGroupExpandedOrCollapsed();
        },
        printDetailGridInfo() {
            console.log('Currently registered detail grid\'s: ');
            this.gridApi.forEachDetailGridInfo(function (detailGridInfo) {
                console.log(detailGridInfo);
            });
        },
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;


            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
    }
}


createApp(VueExample)
    .mount("#app")

