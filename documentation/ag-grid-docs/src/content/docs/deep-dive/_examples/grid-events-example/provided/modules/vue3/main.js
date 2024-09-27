import { createApp } from 'vue';
import { onMounted, ref } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const CompanyLogoRenderer = {
    template: `
    <span style="display: flex; height: 100%; width: 100%; align-items: center;">
      <img :src="'https://www.ag-grid.com/example-assets/space-company-logos/' + cellValueLowerCase + '.png'" style="display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1);" />
      <p style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ cellValue }}</p>
    </span>
    `,
    setup(props) {
        const cellValue = props.params.value;
        const cellValueLowerCase = cellValue.toLowerCase();
        return {
            cellValue,
            cellValueLowerCase,
        };
    },
};

// Define the component configuration
const App = {
    name: 'App',
    template: `
    <ag-grid-vue
        style="width: 100%; height: 100%"
        :class="themeClass"
        :columnDefs="colDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :pagination="true"
        @cell-value-changed="onCellValueChanged"
    >
    </ag-grid-vue>
    `,
    components: {
        AgGridVue,
        companyLogoRenderer: CompanyLogoRenderer,
    },
    methods: {
        onCellValueChanged(event) {
            console.log(`New Cell Value: ${event.value}`);
        },
    },
    setup() {
        const rowData = ref([]);

        const colDefs = ref([
            {
                field: 'mission',
                filter: true,
            },
            {
                field: 'company',
                cellRenderer: 'companyLogoRenderer',
            },
            {
                field: 'location',
            },
            { field: 'date' },
            {
                field: 'price',
                valueFormatter: (params) => {
                    return '£' + params.value.toLocaleString();
                },
            },
            { field: 'successful' },
            { field: 'rocket' },
        ]);

        const defaultColDef = ref({
            editable: true,
            filter: true,
        });

        // Fetch data when the component is mounted
        onMounted(async () => {
            rowData.value = await fetchData();
        });

        const fetchData = async () => {
            const response = await fetch('https://www.ag-grid.com/example-assets/space-mission-data.json');
            return response.json();
        };

        return {
            rowData,
            colDefs,
            defaultColDef,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(App).mount('#app');
