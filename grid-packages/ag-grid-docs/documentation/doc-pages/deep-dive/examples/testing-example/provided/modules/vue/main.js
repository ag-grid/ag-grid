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

const MissionResultRenderer = {
  template: 
    `
    <span style="display: flex; justify-content: center; height: 100%; align-items: center;">
      <img
        :alt="params.value"
        :src="'https://www.ag-grid.com/example-assets/icons/' + cellValue + '.png'"
        style="width: auto; height: auto;"
      />
    </span>
    `,
    data: function () {
      return {
        cellValue: ''
      };
    },
    beforeMount() {
      this.cellValue = this.params.value ? 'tick-in-circle' : 'cross-in-circle';
    },
};

const App = {
  template: 
    `
    <ag-grid-vue
        style="width: 100%; height: 100%"
        :class="themeClass"
        :columnDefs="colDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :pagination="true"
        :rowSelection="'multiple'"
        @cell-value-changed="onCellValueChanged"
        @selection-changed="onSelectionChanged"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue,
    companyLogoRenderer: CompanyLogoRenderer,
    missionResultRenderer: MissionResultRenderer
  },
  data() {
    return {
      rowData: [],
      colDefs: [
        {
          field: "mission", 
          width: 150,
          checkboxSelection: true
        },
        {
          field: "company", 
          width: 130,
          cellRenderer: "companyLogoRenderer" 
        },
        {
          field: "location",
          width: 225
        },
        {
          field: "date",
          valueFormatter: this.dateFormatter
        },
        {
          field: "price",
          width: 130,
          valueFormatter: (params) => { return '£' + params.value.toLocaleString(); } 
        },
        {
          field: "successful", 
          width: 120,
          cellRenderer: "missionResultRenderer" 
        },
        { field: "rocket" },
      ],
      // Default Column Definitions: Apply configurations to all columns
      defaultColDef: {
        filter: true,
        editable: true
      },
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
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
      const response = await fetch('https://www.ag-grid.com/example-assets/space-mission-data.json');
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
