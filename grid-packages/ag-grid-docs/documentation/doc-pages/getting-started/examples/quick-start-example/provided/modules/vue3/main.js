import { createApp } from 'vue'
import { ref } from 'vue';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from "@ag-grid-community/vue3";

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Define the component configuration
const App = {
  name: "App",
  template: 
    `
    <ag-grid-vue
        style="width: 100%; height: 100%"
        :class="themeClass"
        :columnDefs="colDefs"
        :rowData="rowData"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue
  },
  setup() {
    const rowData = ref([
      { make: "Toyota", model: "Celica", price: 35000 },
      { make: "Ford", model: "Mondeo", price: 32000 },
      { make: "Porsche", model: "Boxster", price: 72000 }
    ]);

    const colDefs = ref([
      { field: "make" },
      { field: "model" },
      { field: "price" }
    ]);

    return {
      rowData,
      colDefs,
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  },
};

createApp(App).mount('#app')