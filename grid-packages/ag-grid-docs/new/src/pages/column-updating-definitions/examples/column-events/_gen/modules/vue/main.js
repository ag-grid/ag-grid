import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const VueExample = {
  template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <div class="test-button-row">
                        <div class="test-button-group">
                            <button v-on:click="onBtSortOn()">Sort On</button>
                            <br />
                            <button v-on:click="onBtSortOff()">Sort Off</button>
                        </div>
                        <div class="test-button-group">
                            <button v-on:click="onBtWidthNarrow()">Width Narrow</button>
                            <br />
                            <button v-on:click="onBtWidthNormal()">Width Normal</button>
                        </div>
                        <div class="test-button-group">
                            <button v-on:click="onBtHide()">Hide Cols</button>
                            <br />
                            <button v-on:click="onBtShow()">Show Cols</button>
                        </div>
                        <div class="test-button-group">
                            <button v-on:click="onBtPivotOn()">Pivot On</button>
                            <br />
                            <button v-on:click="onBtPivotOff()">Pivot Off</button>
                        </div>
                        <div class="test-button-group">
                            <button v-on:click="onBtRowGroupOn()">Row Group On</button>
                            <br />
                            <button v-on:click="onBtRowGroupOff()">Row Group Off</button>
                        </div>
                        <div class="test-button-group">
                            <button v-on:click="onBtAggFuncOn()">Agg Func On</button>
                            <br />
                            <button v-on:click="onBtAggFuncOff()">Agg Func Off</button>
                        </div>
                        <div class="test-button-group">
                            <button v-on:click="onBtPinnedOn()">Pinned On</button>
                            <br />
                            <button v-on:click="onBtPinnedOff()">Pinned Off</button>
                        </div>
                    </div>
                </div>
                <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :debug="true"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :modules="modules"
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
  data: function () {
    return {
      gridOptions: null,
      gridApi: null,
      columnApi: null,
      defaultColDef: null,
      columnDefs: null,
      modules: AllModules,
      rowData: null,
    };
  },
  beforeMount() {
    this.gridOptions = {};
    this.defaultColDef = {
      sortable: true,
      resizable: true,
      width: 150,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
    };
    this.columnDefs = getColumnDefs();
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
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
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
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
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.sort = null;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtWidthNarrow() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        if (colDef.field === 'age' || colDef.field === 'athlete') {
          colDef.width = 100;
        }
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtWidthNormal() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.width = 200;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtHide() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        if (colDef.field === 'age' || colDef.field === 'athlete') {
          colDef.hide = true;
        }
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtShow() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.hide = false;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtPivotOn() {
      this.gridColumnApi.setPivotMode(true);
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        if (colDef.field === 'country') {
          colDef.pivot = true;
        }
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtPivotOff() {
      this.gridColumnApi.setPivotMode(false);
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.pivot = false;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtRowGroupOn() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        if (colDef.field === 'sport') {
          colDef.rowGroup = true;
        }
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtRowGroupOff() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.rowGroup = false;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtAggFuncOn() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        if (
          colDef.field === 'gold' ||
          colDef.field === 'silver' ||
          colDef.field === 'bronze'
        ) {
          colDef.aggFunc = 'sum';
        }
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtAggFuncOff() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.aggFunc = null;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtPinnedOn() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
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
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (colDef) {
        colDef.pinned = null;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onGridReady(params) {
      const httpRequest = new XMLHttpRequest();
      const updateData = (data) => {
        this.rowData = data;
      };

      httpRequest.open(
        'GET',
        'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'
      );
      httpRequest.send();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          updateData(JSON.parse(httpRequest.responseText));
        }
      };
    },
  },
};

window.getColumnDefs = function getColumnDefs() {
  return [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ];
};

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});
