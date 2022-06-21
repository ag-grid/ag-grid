import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import MyInnerRenderer from './myInnerRendererVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue

                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :groupIncludeFooter="true"
                    :groupIncludeTotalFooter="true"
                    :animateRows="true"
                    :rowData="rowData"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        MyInnerRenderer
    },
    data: function () {
        return {
            columnDefs: [{
                field: "country",
                rowGroup: true,
                hide: true
            }, {
                field: "year",
                rowGroup: true,
                hide: true
            }, {
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
                sortable: true,
                resizable: true,
            },
            autoGroupColumnDef: {
                minWidth: 300,
                cellRendererParams: {
                    innerRenderer: 'MyInnerRenderer'
                }
            },
            rowData: null
        }
    },
    created() {
        this.rowData = getData()
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
