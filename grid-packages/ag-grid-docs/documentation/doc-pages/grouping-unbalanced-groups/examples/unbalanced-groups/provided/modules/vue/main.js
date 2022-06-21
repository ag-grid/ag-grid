import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const COUNTRY_CODES = {
    Ireland: 'ie',
    'United Kingdom': 'gb',
    USA: 'us',
};

const numberParser = function numberParser(params) {
    return parseInt(params.newValue);
}

const countryCellRenderer = function countryCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = `<img border="0" width="15" height="10" src="https://flagcdn.com/h20/${COUNTRY_CODES[params.value]}.png">`;
        return `${flag} ${params.value}`;
    }
}

const stateCellRenderer = function stateCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = '<img border="0" height="10" src="https://www.ag-grid.com/example-assets/gold-star.png" width="15">';
        return `${flag} ${params.value}`;
    }
}

function cityCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return ''
    } else {
        const flag = '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/weather/sun.png">'
        return `${flag} ${params.value}`
    }
}

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue

                    style="width: 100%; height: 98%;"
                    class="ag-theme-alpine"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :columnTypes="columnTypes"
                    :rowData="rowData"
                    :groupDefaultExpanded="groupDefaultExpanded"
                    :rowGroupPanelShow="rowGroupPanelShow"
                    :animateRows="true"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        countryCellRenderer
    },
    data: function () {
        return {
            columnDefs: [{
                field: "city",
                type: "dimension",
                cellRenderer: cityCellRenderer
            }, {
                field: "country",
                type: "dimension",
                cellRenderer: countryCellRenderer,
                minWidth: 200
            }, {
                field: "state",
                type: "dimension",
                cellRenderer: stateCellRenderer,
                rowGroup: true
            }, {
                field: "val1",
                type: "numberValue"
            }, {
                field: "val2",
                type: "numberValue"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                resizable: true,
            },
            autoGroupColumnDef: null,
            columnTypes: null,
            rowData: null,
            groupDefaultExpanded: null,
            rowGroupPanelShow: null
        }
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
        this.rowGroupPanelShow = 'always'
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;

        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
