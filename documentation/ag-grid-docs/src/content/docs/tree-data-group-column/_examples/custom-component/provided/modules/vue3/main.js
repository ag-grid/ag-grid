import { createApp } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import CustomGroupCellRenderer from './customGroupCellRendererVue.js';
import { getData } from './data.js';

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
                <ag-grid-vue
                
                style="width: 100%; height: 100%;"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                @cell-double-clicked="onCellDoubleClicked"
                @cell-key-down="onCellKeyDown"
                :autoGroupColumnDef="autoGroupColumnDef"
                :defaultColDef="defaultColDef"
                :groupDefaultExpanded="groupDefaultExpanded"
                :rowData="rowData"
                :treeData="true"
                :getDataPath="getDataPath"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        CustomGroupCellRenderer,
    },
    data: function () {
        return {
            columnDefs: [
                { field: 'created' },
                { field: 'modified' },
                {
                    field: 'size',
                    aggFunc: 'sum',
                    valueFormatter: (params) => {
                        const sizeInKb = params.value / 1024;

                        if (sizeInKb > 1024) {
                            return `${+(sizeInKb / 1024).toFixed(2)} MB`;
                        } else {
                            return `${+sizeInKb.toFixed(2)} KB`;
                        }
                    },
                },
            ],
            gridApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 120,
            },
            autoGroupColumnDef: null,
            groupDefaultExpanded: null,
            rowData: null,
            getDataPath: (data) => data.path,
        };
    },
    created() {
        this.autoGroupColumnDef = {
            cellRenderer: 'CustomGroupCellRenderer',
        };
        this.groupDefaultExpanded = 1;
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;

            params.api.setGridOption('rowData', getData());
        },
        onCellDoubleClicked: (params) => {
            if (params.colDef.showRowGroup) {
                params.node.setExpanded(!params.node.expanded);
            }
        },
        onCellKeyDown: (params) => {
            if (!('colDef' in params)) {
                return;
            }
            if (!(params.event instanceof KeyboardEvent)) {
                return;
            }
            if (params.event.code !== 'Enter') {
                return;
            }
            if (params.colDef.showRowGroup) {
                params.node.setExpanded(!params.node.expanded);
            }
        },
    },
};

createApp(VueExample).mount('#app');
