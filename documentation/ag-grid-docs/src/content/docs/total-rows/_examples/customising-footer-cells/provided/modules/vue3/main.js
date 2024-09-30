import { createApp } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data.js';
import MyInnerRenderer from './myInnerRendererVue.js';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue

                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :groupTotalRow="'bottom'"
                    :grandTotalRow="'bottom'"
                    :rowData="rowData"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        MyInnerRenderer,
    },
    data: function () {
        return {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                },
                {
                    field: 'gold',
                    aggFunc: 'sum',
                },
                {
                    field: 'silver',
                    aggFunc: 'sum',
                },
                {
                    field: 'bronze',
                    aggFunc: 'sum',
                },
            ],
            gridApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 150,
            },
            autoGroupColumnDef: {
                minWidth: 300,
                cellRendererParams: {
                    innerRenderer: 'MyInnerRenderer',
                },
            },
            rowData: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    created() {
        this.rowData = getData();
    },
};

createApp(VueExample).mount('#app');
