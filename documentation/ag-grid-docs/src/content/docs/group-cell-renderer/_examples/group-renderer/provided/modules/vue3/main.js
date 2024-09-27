import { createApp } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data.js';
import SimpleCellRenderer from './simpleCellRendererVue.js';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule, RowGroupingModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
                <ag-grid-vue                
                style="width: 100%; height: 100%;"
                :class="themeClass"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :groupDisplayType="groupDisplayType"
                :groupDefaultExpanded="groupDefaultExpanded"
                :selection="selection"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        SimpleCellRenderer,
    },
    data: function () {
        return {
            columnDefs: [
                {
                    headerName: 'Country Group - No Renderer',
                    showRowGroup: 'country',
                    minWidth: 250,
                },
                {
                    headerName: 'All Groups - No Renderer',
                    showRowGroup: true,
                    minWidth: 240,
                },
                {
                    headerName: 'Group Renderer A',
                    showRowGroup: true,
                    cellRenderer: 'agGroupCellRenderer',
                    minWidth: 220,
                },
                {
                    headerName: 'Group Renderer B',
                    field: 'city',
                    showRowGroup: true,
                    cellRenderer: 'agGroupCellRenderer',
                    minWidth: 220,
                },
                {
                    headerName: 'Group Renderer C',
                    field: 'city',
                    minWidth: 240,
                    showRowGroup: true,
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                        checkbox: true,
                        innerRenderer: 'SimpleCellRenderer',
                        suppressDoubleClickExpand: true,
                        suppressEnterExpand: true,
                    },
                },
                {
                    headerName: 'Type',
                    field: 'type',
                    rowGroup: true,
                },
                {
                    headerName: 'Country',
                    field: 'country',
                    rowGroup: true,
                },
                {
                    headerName: 'City',
                    field: 'city',
                },
            ],
            gridApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 120,
            },
            rowData: null,
            groupDisplayType: null,
            groupDefaultExpanded: null,
            selection: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    created() {
        this.rowData = getData();
        this.groupDisplayType = 'custom';
        this.groupDefaultExpanded = 1;
        this.selection = {
            mode: 'multiRow',
            checkboxes: false,
            headerCheckbox: false,
            groupSelects: 'descendants',
            headerCheckbox: false,
            checkboxes: false,
        };
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;
        },
    },
};

createApp(VueExample).mount('#app');
