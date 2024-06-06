import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { createApp } from 'vue';

import { getData } from './data.js';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const COUNTRY_CODES = {
    Ireland: 'ie',
    'United Kingdom': 'gb',
    USA: 'us',
};

const numberParser = function numberParser(params) {
    return parseInt(params.newValue);
};

const countryCellRenderer = function countryCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = `<img border="0" width="15" height="10" src="https://flagcdn.com/h20/${COUNTRY_CODES[params.value]}.png">`;
        return `${flag} ${params.value}`;
    }
};

const cityCellRenderer = function cityCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag =
            '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/weather/sun.png">';
        return `${flag} ${params.value}`;
    }
};

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue

                    style="width: 100%; height: 98%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :columnTypes="columnTypes"
                    :rowData="rowData"
                    :groupDefaultExpanded="groupDefaultExpanded"
                    :rowGroupPanelShow="rowGroupPanelShow"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            columnDefs: [
                {
                    field: 'city',
                    type: 'dimension',
                    cellRenderer: cityCellRenderer,
                },
                {
                    field: 'country',
                    type: 'dimension',
                    cellRenderer: countryCellRenderer,
                    minWidth: 200,
                },
                {
                    field: 'state',
                    type: 'dimension',
                    rowGroup: true,
                },
                {
                    field: 'val1',
                    type: 'numberValue',
                },
                {
                    field: 'val2',
                    type: 'numberValue',
                },
            ],
            gridApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 150,
            },
            autoGroupColumnDef: null,
            columnTypes: null,
            rowData: null,
            groupDefaultExpanded: null,
            rowGroupPanelShow: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    created() {
        this.autoGroupColumnDef = {
            field: 'city',
            minWidth: 200,
        };
        this.columnTypes = {
            numberValue: {
                enableValue: true,
                aggFunc: 'sum',
                editable: true,
                valueParser: numberParser,
            },
            dimension: {
                enableRowGroup: true,
                enablePivot: true,
            },
        };
        this.rowData = getData();
        this.groupDefaultExpanded = -1;
        this.rowGroupPanelShow = 'always';
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;
        },
    },
};

createApp(VueExample).mount('#app');
