import { createApp } from 'vue'
import { ref } from 'vue';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridVue } from "ag-grid-vue3";

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
      {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
      {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
      {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
    ]);

    const colDefs = ref([
      { field: "mission" },
      { field: "country" },
      { field: "successful" },
      { field: "date" },
      { field: "price" },
      { field: "company" }
    ]);

    return {
      rowData,
      colDefs,
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  },
};

createApp(App).mount('#app')