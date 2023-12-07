import Vue from 'vue';
import { AgGridVue } from "@ag-grid-community/vue";
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

const CompanyLogoRenderer = {
  template: 
    `
    <span style="display: flex; height: 100%; width: 100%; align-items: center;">
      <img :src="'https://www.ag-grid.com/example-assets/space-company-logos/' + cellValueLowerCase + '.png'" style="display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1);" />
      <p style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ cellValue }}</p>
    </span>
    `,
    data: function () {
      return {
        cellValue: '',
        cellValueLowerCase: ''
      };
    },
    beforeMount() {
      this.cellValue = this.params.value;
      this.cellValueLowerCase = this.params.value.toLowerCase();
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
        :defaultColDef="defaultColDef"
        :pagination="true"
        @cell-value-changed="onCellValueChanged"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue,
    companyLogoRenderer: CompanyLogoRenderer
  },
  data() {
    return {
      // Row Data: The data to be displayed.
      rowData: [],
      // Column Definitions: Defines & controls grid columns.
      columnDefs: [
        { 
          field: "mission", 
          filter: true 
        },
        { 
          field: "company",
          cellRenderer: "companyLogoRenderer" 
        },
        { 
          field: "location"
        },
        { field: "date" },
        { 
          field: "price",
          valueFormatter: params => { return '£' + params.value.toLocaleString(); } 
        },
        { field: "successful" },
        { field: "rocket" }
      ],
      defaultColDef: {
        filter: true,
        editable: true
      },
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  },
  methods: {
    fetchData: async function() {
      const response = await fetch('https://www.ag-grid.com/example-assets/space-mission-data.json');
      return response.json();
    },
    onCellValueChanged(event) {
      console.log(`New Cell Value: ${event.value}`);
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
