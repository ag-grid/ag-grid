import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <div class="test-container">
        <div class="test-header">
          <div class="test-button-row">
            <div class="test-button-group">
              <button v-on:click="onBtSortOn()">Sort On</button>
              <br/>
              <button v-on:click="onBtSortOff()">Sort Off</button>
            </div>
            <div class="test-button-group">
              <button v-on:click="onBtWidthNarrow()">Width Narrow</button>
              <br/>
              <button v-on:click="onBtWidthNormal()">Width Normal</button>
            </div>
            <div class="test-button-group">
              <button v-on:click="onBtHide()">Hide Cols</button>
              <br/>
              <button v-on:click="onBtShow()">Show Cols</button>
            </div>
            <div class="test-button-group">
              <button v-on:click="onBtPivotOn()">Pivot On</button>
              <br/>
              <button v-on:click="onBtPivotOff()">Pivot Off</button>
            </div>
            <div class="test-button-group">
              <button v-on:click="onBtRowGroupOn()">Row Group On</button>
              <br/>
              <button v-on:click="onBtRowGroupOff()">Row Group Off</button>
            </div>
            <div class="test-button-group">
              <button v-on:click="onBtAggFuncOn()">Agg Func On</button>
              <br/>
              <button v-on:click="onBtAggFuncOff()">Agg Func Off</button>
            </div>
            <div class="test-button-group">
              <button v-on:click="onBtPinnedOn()">Pinned On</button>
              <br/>
              <button v-on:click="onBtPinnedOff()">Pinned Off</button>
            </div>
          </div>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            class="ag-theme-alpine"
            id="myGrid"
            :columnDefs="columnDefs"
            @grid-ready="onGridReady"
            :defaultColDef="defaultColDef"
            :rowData="rowData"
            @sort-changed="onSortChanged"
            @column-resized="onColumnResized"
            @column-visible="onColumnVisible"
            @column-pivot-changed="onColumnPivotChanged"
            @column-row-group-changed="onColumnRowGroupChanged"
            @column-value-changed="onColumnValueChanged"
            @column-moved="onColumnMoved"
            @column-pinned="onColumnPinned"></ag-grid-vue>
      </div>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,

    },
    data: () => ({
        columnDefs: [],
        gridApi: null,
        columnApi: null,
        defaultColDef: {
            sortable: true,
            resizable: true,
            width: 150,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true
        },
        rowData: null
    }),
    beforeMount() {
        this.columnDefs = this.getColumnDefs()
    },
    methods: {
        onSortChanged(e) {
            console.log('Event Sort Changed', e);
        },
        onColumnResized(e) {
            console.log('Event Column Resized', e);
        },
        onColumnVisible(e) {
            console.log('Event Column Visible', e);
        },
        onColumnPivotChanged(e) {
            console.log('Event Pivot Changed', e);
        },
        onColumnRowGroupChanged(e) {
            console.log('Event Row Group Changed', e);
        },
        onColumnValueChanged(e) {
            console.log('Event Value Changed', e);
        },
        onColumnMoved(e) {
            console.log('Event Column Moved', e);
        },
        onColumnPinned(e) {
            console.log('Event Column Pinned', e);
        },
        onBtSortOn() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'age') {
                    colDef.sort = 'desc';
                }
                if (colDef.field === 'athlete') {
                    colDef.sort = 'asc';
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtSortOff() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.sort = null;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtWidthNarrow() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'age' || colDef.field === 'athlete') {
                    colDef.width = 100;
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtWidthNormal() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.width = 200;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtHide() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'age' || colDef.field === 'athlete') {
                    colDef.hide = true;
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtShow() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.hide = false;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtPivotOn() {
            this.gridColumnApi.setPivotMode(true);
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'country') {
                    colDef.pivot = true;
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtPivotOff() {
            this.gridColumnApi.setPivotMode(false);
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.pivot = false;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtRowGroupOn() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'sport') {
                    colDef.rowGroup = true;
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtRowGroupOff() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.rowGroup = false;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtAggFuncOn() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'gold' || colDef.field === 'silver' || colDef.field === 'bronze') {
                    colDef.aggFunc = 'sum';
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtAggFuncOff() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.aggFunc = null;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtPinnedOn() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                if (colDef.field === 'athlete') {
                    colDef.pinned = 'left';
                }
                if (colDef.field === 'age') {
                    colDef.pinned = 'right';
                }
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onBtPinnedOff() {
            const columnDefs = this.getColumnDefs();
            columnDefs.forEach(colDef => {
                colDef.pinned = null;
            });
            this.gridApi.setColumnDefs(columnDefs);
        },
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;


            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
        getColumnDefs() {
            return [
                { field: 'athlete' },
                { field: 'age' },
                { field: 'country' },
                { field: 'sport' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' }
            ];
        }
    }
}

window.getColumnDefs = function getColumnDefs() {
    return [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' }
    ];
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
