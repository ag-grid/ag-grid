import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const VueExample = {
  template: `
        <div style="height: 100%">
            <div style="height: 100%; box-sizing: border-box;">
                <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :modules="modules"></ag-grid-vue>
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
      rowData: null,
      modules: AllCommunityModules,
    };
  },
  beforeMount() {
    this.gridOptions = {};
    this.columnDefs = [
      {
        headerName: 'Col 1',
        colId: 'firstCol',
        field: 'height',
      },
      {
        headerName: 'Col 2',
        colId: 'firstCol',
        field: 'height',
      },
      {
        headerName: 'Col 3',
        field: 'height',
      },
      {
        headerName: 'Col 4',
        field: 'height',
      },
      {
        headerName: 'Col 5',
        valueGetter: 'data.width',
      },
      {
        headerName: 'Col 6',
        valueGetter: 'data.width',
      },
    ];
    this.rowData = this.createRowData();
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
  },
  methods: {
    onGridReady(params) {
      var cols = params.columnApi.getAllColumns();
      cols.forEach(function (col) {
        var colDef = col.getUserProvidedColDef();
        console.log(
          colDef.headerName + ', Column ID = ' + col.getId(),
          JSON.stringify(colDef)
        );
      });
    },
    createRowData() {
      var data = [];
      for (var i = 0; i < 20; i++) {
        data.push({
          height: Math.floor(Math.random() * 100),
          width: Math.floor(Math.random() * 100),
          depth: Math.floor(Math.random() * 100),
        });
      }
      return data;
    },
  },
};

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});
