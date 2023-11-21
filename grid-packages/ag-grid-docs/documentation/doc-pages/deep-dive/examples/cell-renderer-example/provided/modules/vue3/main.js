import { createApp } from 'vue'
import { ref, onMounted } from 'vue';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridVue } from "ag-grid-vue3";

const CountryFlagCellRenderer = {
  template: 
    `
      <span>
        <img :src="'https://www.ag-grid.com/example-assets/flags/' + cellValue + '-flag-sm.png'" height="30" />
      </span>
    `,
  setup(props) {
    const cellValue = props.params.value.toLowerCase();
    return {
      cellValue
    };
  },
};

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
        :defaultColDef="defaultColDefs"
        :pagination="true"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue,
    countryFlagCellRenderer: CountryFlagCellRenderer
  },
  setup() {
    const rowData = ref([]);

    const colDefs = ref([
      { field: "mission", resizable: true },
      { field: "country", cellRenderer: "countryFlagCellRenderer" },
      { field: "successful" },
      { field: "date" },
      { field: "price", valueFormatter: (params) => { return '£' + params.value.toLocaleString(); } },
      { field: "company" }
    ]);

    const defaultColDefs = ref({
      resizable: true
    });

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
      colDefs,
      defaultColDefs,
      themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
    };
  },
};

createApp(App).mount('#app')