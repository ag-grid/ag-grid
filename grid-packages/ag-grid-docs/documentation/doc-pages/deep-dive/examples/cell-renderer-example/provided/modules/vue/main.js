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
        :class="themeClass"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDefs"
        :pagination="true"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue,
    countryFlagCellRenderer: CountryFlagCellRenderer
  },
  data() {
    return {
      // Row Data: The data to be displayed.
      rowData: [],
      // Column Definitions: Defines & controls grid columns.
      columnDefs: [
          { field: "mission", filter: true },
          { field: "country", cellRenderer: "countryFlagCellRenderer" },
          { field: "successful" },
          { field: "date" },
          { field: "price", valueFormatter: (params) => { return '£' + params.value.toLocaleString(); } },
          { field: "company" }
      ],
      defaultColDefs: {
        filter: true,
        editable: true
      },
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  },
  methods: {
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
