import Vue from 'vue';
import { AgGridVue } from 'ag-grid-vue';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const VueExample = {
  template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <button v-on:click="onBtIncludeMedalColumns()">Include Medal Columns</button>
                    <button v-on:click="onBtExcludeMedalColumns()">Exclude Medal Columns</button>
                </div>
                <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :columnDefs="columnDefs"
                :rowData="rowData"></ag-grid-vue>
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
      rowData: null,
    };
  },
  beforeMount() {
    this.gridOptions = {};
    this.defaultColDef = {
      initialWidth: 100,
      sortable: true,
      resizable: true,
    };
    this.columnDefs = getColDefsMedalsIncluded();
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
  },
  methods: {
    onBtExcludeMedalColumns() {
      this.gridApi.setColumnDefs(getColDefsMedalsExcluded());
    },
    onBtIncludeMedalColumns() {
      this.gridApi.setColumnDefs(getColDefsMedalsIncluded());
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

window.getColDefsMedalsIncluded = function getColDefsMedalsIncluded() {
  return [
    athleteColumn,
    {
      colId: 'myAgeCol',
      headerName: 'Age',
      valueGetter: function (params) {
        return params.data.age;
      },
    },
    {
      headerName: 'Country',
      headerClass: 'country-header',
      valueGetter: function (params) {
        return params.data.country;
      },
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
};

window.getColDefsMedalsExcluded = function getColDefsMedalsExcluded() {
  return [
    athleteColumn,
    {
      colId: 'myAgeCol',
      headerName: 'Age',
      valueGetter: function (params) {
        return params.data.age;
      },
    },
    {
      headerName: 'Country',
      headerClass: 'country-header',
      valueGetter: function (params) {
        return params.data.country;
      },
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
  ];
};

var athleteColumn = {
  headerName: 'Athlete',
  valueGetter: function (params) {
    return params.data.athlete;
  },
};

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});
