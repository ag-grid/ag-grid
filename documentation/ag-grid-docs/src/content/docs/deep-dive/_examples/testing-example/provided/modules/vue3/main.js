import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { createApp } from 'vue';
import { onMounted, ref } from 'vue';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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

const MissionResultRenderer = {
    template: `
    <span style="display: flex; justify-content: center; height: 100%; align-items: center;">
      <img
        :alt="params.value"
        :src="'https://www.ag-grid.com/example-assets/icons/' + cellValue + '.png'"
        style="width: auto; height: auto;"
      />
    </span>
    `,
    setup(props) {
        const cellValue = props.params.value ? 'tick-in-circle' : 'cross-in-circle';
        return {
            cellValue,
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
        :rowSelection="rowSelection"
        @cell-value-changed="onCellValueChanged"
        @selection-changed="onSelectionChanged"
    >
    </ag-grid-vue>
    `,
    components: {
        AgGridVue,
        companyLogoRenderer: CompanyLogoRenderer,
        missionResultRenderer: MissionResultRenderer,
    },
    methods: {
        onCellValueChanged(event) {
            console.log(`New Cell Value: ${event.value}`);
        },
        onSelectionChanged(event) {
            console.log('Row Selection Event!');
        },
    },
    setup() {
        const rowData = ref([]);

        // Fetch data when the component is mounted
        onMounted(async () => {
            rowData.value = await fetchData();
        });

        const dateFormatter = (params) => {
            return new Date(params.value).toLocaleDateString('en-us', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        };

        const colDefs = ref([
            {
                field: 'mission',
                width: 150,
            },
            {
                field: 'company',
                width: 130,
                cellRenderer: 'companyLogoRenderer',
            },
            {
                field: 'location',
                width: 225,
            },
            {
                field: 'date',
                valueFormatter: dateFormatter,
            },
            {
                field: 'price',
                width: 130,
                valueFormatter: (params) => {
                    return '£' + params.value.toLocaleString();
                },
            },
            {
                field: 'successful',
                width: 120,
                cellRenderer: 'missionResultRenderer',
            },
            { field: 'rocket' },
        ]);

        const rowSelection = ref({
            mode: 'multiRow',
            headerCheckbox: false,
        });

        const defaultColDef = ref({
            filter: true,
            editable: true,
        });

        const fetchData = async () => {
            const response = await fetch('https://www.ag-grid.com/example-assets/space-mission-data.json');
            return response.json();
        };

        return {
            rowData,
            colDefs,
            rowSelection,
            defaultColDef,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(App).mount('#app');
