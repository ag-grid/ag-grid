import Vue from 'vue';
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

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
        {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
        {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
        {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
      ],
      // Column Definitions: Defines & controls grid columns.
      columnDefs: [
          { field: "mission" },
          { field: "country" },
          { field: "successful" },
          { field: "date" },
          { field: "price" },
          { field: "company" }
      ],
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  }
};

// Create the Vue instance and mount the component
new Vue({
  render: h => h(App),
}).$mount('#app');
