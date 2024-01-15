import Vue from 'vue';
import { AgGridVue } from "@ag-grid-community/vue";
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

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
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue
  },
  data() {
    return {
      // Row Data: The data to be displayed.
      rowData: [],
      // Column Definitions: Defines & controls grid columns.
      columnDefs: [
        { field: "mission", filter: true },
        { field: "company" },
        { field: "location" },
        { field: "date" },
        { field: "price" },
        { field: "successful" },
        { field: "rocket" }
      ],
      defaultColDef: {
        filter: true
      },
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  },
  methods: {
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
