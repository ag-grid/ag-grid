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
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue
  },
  data() {
    return {
      // Row Data: The data to be displayed.
      rowData: [
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
        { make: 'Fiat', model: '500', price: 15774, electric: false },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
      ],
      // Column Definitions: Defines & controls grid columns.
      columnDefs: [
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "electric" }
      ],
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  }
};

// Create the Vue instance and mount the component
new Vue({
  render: h => h(App),
}).$mount('#app');
