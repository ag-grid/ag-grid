import { createApp } from 'vue'
import { ref, onMounted } from 'vue';
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
        class="ag-theme-quartz-dark"
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
      { field: "mission", resizable: true },
      { field: "country" },
      { field: "successful" },
      { field: "date" },
      { field: "price" },
      { field: "company" }
    ]);

    // Fetch data when the component is mounted
    onMounted(async () => {
      rowData.value = await fetchData();
    });

    const fetchData = async () => {
      const response = await fetch('https://downloads.jamesswinton.com/space-mission-data.json');
      return response.json();
    };

    return {
      rowData,
      colDefs
    };
  },
};

createApp(App).mount('#app')