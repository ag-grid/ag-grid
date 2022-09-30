import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import './styles.css';
import CustomGroupCellRenderer from './customGroupCellRendererVue.js';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);


const VueExample = {
    template: `
        <div style="height: 100%">
                <ag-grid-vue
                
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :autoGroupColumnDef="autoGroupColumnDef"
                :defaultColDef="defaultColDef"
                :groupDefaultExpanded="groupDefaultExpanded"
                :animateRows="true"
                :rowData="rowData"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        CustomGroupCellRenderer
    },
    data: function () {
        return {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'total', aggFunc: 'sum' },
            ],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 120,
                resizable: true,
            },
            autoGroupColumnDef: null,
            groupDefaultExpanded: null,
            rowData: null,
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
            this.gridColumnApi = params.columnApi;

            const updateData = (data) => params.api.setRowData(data);

            fetch(
                'https://www.ag-grid.com/example-assets/small-olympic-winners.json'
            )
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        },
    },
};


new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
