import Vue from 'vue';
import { AgGridVue } from 'ag-grid-vue';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import CustomHeader from './customHeaderVue.js';

const VueExample = {
  template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <button v-on:click="onBtUpperNames()">Upper Header Names</button>
                    <button v-on:click="onBtLowerNames()">Lower Lower Names</button>
                    &nbsp;&nbsp;&nbsp;
                    <button v-on:click="onBtFilterOn()">Filter On</button>
                    <button v-on:click="onBtFilterOff()">Filter Off</button>
                    &nbsp;&nbsp;&nbsp;
                    <button v-on:click="onBtResizeOn()">Resize On</button>
                    <button v-on:click="onBtResizeOff()">Resize Off</button>
                </div>
                <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :frameworkComponents="frameworkComponents"
                :defaultColDef="defaultColDef"></ag-grid-vue>
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
      columnDefs: null,
      frameworkComponents: null,
      defaultColDef: null,
      rowData: null,
    };
  },
  beforeMount() {
    this.gridOptions = {};
    this.columnDefs = getColumnDefs();
    this.frameworkComponents = { CustomHeader: CustomHeader };
    this.defaultColDef = { headerComponent: 'CustomHeader' };
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
  },
  methods: {
    onBtUpperNames() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (c) {
        c.headerName = c.field.toUpperCase();
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtLowerNames() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (c) {
        c.headerName = c.field;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtFilterOn() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (c) {
        c.filter = true;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtFilterOff() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (c) {
        c.filter = false;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtResizeOn() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (c) {
        c.resizable = true;
      });
      this.gridApi.setColumnDefs(columnDefs);
    },
    onBtResizeOff() {
      var columnDefs = getColumnDefs();
      columnDefs.forEach(function (c) {
        c.resizable = false;
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
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
};

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});
