import { createApp } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MasterDetailModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import DetailCellRenderer from './detailCellRendererVue.js';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    MasterDetailModule,
    MenuModule,
    ColumnsToolPanelModule,
]);

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
                        :class="themeClass"
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
        myDetailCellRenderer: DetailCellRenderer,
    },
    data: function () {
        return {
            columnDefs: [
                {
                    field: 'name',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'account' },
                { field: 'calls' },
                {
                    field: 'minutes',
                    valueFormatter: "x.toLocaleString() + 'm'",
                },
            ],
            gridApi: null,
            defaultColDef: { flex: 1 },
            detailRowHeight: null,
            detailCellRenderer: null,
            rowData: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    beforeMount() {
        this.detailRowHeight = 310;
        this.detailCellRenderer = 'myDetailCellRenderer';
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
            console.log("Currently registered detail grid's: ");
            this.gridApi.forEachDetailGridInfo(function (detailGridInfo) {
                console.log(detailGridInfo);
            });
        },
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        },
    },
};

createApp(VueExample).mount('#app');
