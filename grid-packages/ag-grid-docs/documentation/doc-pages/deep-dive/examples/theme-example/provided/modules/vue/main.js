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
        {mission: "CRS SpX-25", company: "SpaceX", location: "LC-39A, Kennedy Space Center, Florida, USA", date: "2022-07-15", time: "0:44:00", rocket: "Falcon 9 Block 5", price: 12480000, successful: true},
        {mission: "LARES 2 & Cubesats", company: "ESA", location: "ELV-1, Guiana Space Centre, French Guiana, France", date: "2022-07-13", time: "13:13:00", rocket: "Vega C", price: 4470000, successful: true},
        {mission: "Wise One Looks Ahead (NROL-162)", company: "Rocket Lab", location: "Rocket Lab LC-1A, Māhia Peninsula, New Zealand", date: "2022-07-13", time: "6:30:00", rocket: "Electron/Curie", price: 9750000, successful: true}    
      ],
      // Column Definitions: Defines & controls grid columns.
      columnDefs: [
        { field: "mission" },
        { field: "company" },
        { field: "location" },
        { field: "date" },
        { field: "price" },
        { field: "successful" },
        { field: "rocket" }
      ],
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  }
};

// Create the Vue instance and mount the component
new Vue({
  render: h => h(App),
}).$mount('#app');
