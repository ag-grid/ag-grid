import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

const VueExample = {
  template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <button v-on:click="onBtWithDefault()">Set Columns with Initials</button>
                    <button v-on:click="onBtRemove()">Remove Columns</button>
                </div>
                <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :columnDefs="columnDefs"
                :modules="modules"
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
      modules: [ClientSideRowModelModule],
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
    this.columnDefs = getColumnDefs();
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
  },
  methods: {
    onBtWithDefault() {
      this.gridApi.setColumnDefs(getColumnDefs());
    },
    onBtRemove() {
      this.gridApi.setColumnDefs([]);
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
    {
      field: 'athlete',
      initialWidth: 100,
      initialSort: 'asc',
    },
    { field: 'age' },
    {
      field: 'country',
      initialPinned: 'left',
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

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});
