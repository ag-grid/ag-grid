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
        :rowSelection="'multiple'"
        @cell-value-changed="onCellValueChanged"
        @selection-changed="onSelectionChanged"
    >
    </ag-grid-vue>
    `,
  components: {
    AgGridVue,
    countryFlagCellRenderer: CountryFlagCellRenderer,
  },
  methods: {
    onCellValueChanged(event) {
      console.log(`New Cell Value: ${event.value}`);
    },
    onSelectionChanged(event) {
      console.log('Row Selection Event!');
    }
  },
  setup() {
    const rowData = ref([]);

    // Fetch data when the component is mounted
    onMounted(async () => {
      rowData.value = await fetchData();
    });

    const dateFormatter = (params) => {
      return new Date(params.value).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    }

    const priceFormatter = (params) => {
      return '£' + params.value.toLocaleString();
    }

    const colDefs = ref([
      { field: "mission", filter: true, checkboxSelection: true },
      { field: "country", cellRenderer: "countryFlagCellRenderer" },
      { field: "successful" },
      { field: "date", valueFormatter: dateFormatter },
      { field: "price", valueFormatter: priceFormatter },
      { field: "company" }
    ]);

    const defaultColDefs = ref({
      filter: true,
      editable: true
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