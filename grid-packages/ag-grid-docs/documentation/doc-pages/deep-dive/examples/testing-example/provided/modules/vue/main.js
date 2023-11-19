import Vue from 'vue';
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const CountryFlagCellRenderer = {
  template: 
    `
      <span>
        <img :src="'https://www.ag-grid.com/example-assets/flags/' + cellValue + '-flag-sm.png'" height="30" />
      </span>
    `,
  data: function () {
    return {
        cellValue: ''
    };
  },
  beforeMount() {
      this.cellValue = this.params.value.toLowerCase();
  },
};

const App = {
  template: 
    `
    <ag-grid-vue
        style="width: 100%; height: 100%"
        class="ag-theme-quartz-dark"
        :columnDefs="colDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDefs"
        :pagination="true"
        :rowSelection="'multiple'"
        @cell-value-changed="onCellValueChanged"
        @selection-changed="onSelectionChanged"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue,
    countryFlagCellRenderer: CountryFlagCellRenderer
  },
  data() {
    return {
      rowData: [],
      colDefs: [
        { field: "mission", resizable: true, checkboxSelection: true },
        { field: "country", cellRenderer: "countryFlagCellRenderer" },
        { field: "successful" },
        { field: "date", valueFormatter: this.dateFormatter },
        { field: "price", valueFormatter: this.priceFormatter },
        { field: "company" }
      ],
      // Default Column Definitions: Apply configurations to all columns
      defaultColDefs: {
        resizable: true,
        editable: true
      },
    };
  },
  methods: {
    onCellValueChanged(event) {
      console.log(`New Cell Value: ${event.value}`);
    },
    onSelectionChanged(event) {
      console.log('Row Selection Event!');
    },
    dateFormatter(params) {
      return new Date(params.value).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    },
    priceFormatter(params) {
      return '£' + params.value.toLocaleString();
    },
    fetchData: async function() {
      const response = await fetch('https://downloads.jamesswinton.com/space-mission-data.json');
      return response.json();
    },
  },
  mounted: async function() {
    this.rowData = await this.fetchData();
  },
};

// Create the Vue instance and mount the component
new Vue({
  render: h => h(App),
}).$mount('#app');
