import Vue from "vue";
import { AgGridVue } from "ag-grid-vue";

const VueExample = {
  template: `
    <div style="height: 100%">
        <div style="padding-bottom: 2px;">
            <button v-on:click="btSizeColsToFix">Size Cols to Fit</button>
        </div>
        <ag-grid-vue style="width: 100%; height: 420px;" class="ag-theme-balham"
            :gridOptions="topGridOptions"
            @grid-ready="onGridReady"
            :columnDefs="columnDefs"
            :rowData="rowData"
        ></ag-grid-vue>
        <ag-grid-vue style="width: 100%; height: 40px;" class="ag-theme-balham"
            :gridOptions="bottomGridOptions"
            :headerHeight="0"
            :columnDefs="columnDefs"
            :rowData="bottomData"
            :rowStyle="rowStyle"
        ></ag-grid-vue>
    </div>
    `,
  components: {
    "ag-grid-vue": AgGridVue
  },
  data: function() {
    return {
        topGridOptions: null,
        bottomGridOptions: null,
        gridApi: null,
        columnApi: null,
        rowData: null,
        bottomData: null,
        columnDefs: null,
        athleteVisible: true,
        ageVisible: true,
        countryVisible: true,
        rowStyle: { fontWeight: 'bold' } 
    };
  },
  beforeMount() {
    this.bottomData = [
        {
            athlete: 'Total',
            age: '15 - 61',
            country: 'Ireland',
            year: '2020',
            date: '26/11/1970',
            sport: 'Synchronised Riding',
            gold: 55,
            silver: 65,
            bronze: 12
        }
    ];

    this.topGridOptions = {alignedGrids: [], suppressHorizontalScroll: true};
    this.bottomGridOptions = {alignedGrids: []}
    this.topGridOptions.alignedGrids.push(this.bottomGridOptions);
    this.bottomGridOptions.alignedGrids.push(this.topGridOptions);
    
    this.columnDefs = [
        {headerName: 'Athlete', field: 'athlete', width: 200, hide: !this.athleteVisible},
        {headerName: 'Age', field: 'age', width: 150, hide: !this.ageVisible},
        {headerName: 'Country', field: 'country', width: 150, hide: !this.countryVisible},
        {headerName: 'Year', field: 'year', width: 120},
        {headerName: 'Date', field: 'date', width: 150},
        {headerName: 'Sport', field: 'sport', width: 150}
    ];
  },
  mounted() {
    this.gridApi = this.topGridOptions.api;
    this.gridColumnApi = this.topGridOptions.columnApi;
  },
  methods: {
    onGridReady(params) {
      const httpRequest = new XMLHttpRequest();
      const updateData = data => {
        this.rowData = data;
      };

      httpRequest.open(
        "GET",
        "https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json"
      );
      httpRequest.send();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          updateData(JSON.parse(httpRequest.responseText));
        }
      };
    },
    btSizeColsToFix() {
        this.gridApi.sizeColumnsToFit();
        console.log('btSizeColsToFix ');
    }
  },
};

new Vue({
  el: "#app",
  components: {
    "my-component": VueExample
  }
});
