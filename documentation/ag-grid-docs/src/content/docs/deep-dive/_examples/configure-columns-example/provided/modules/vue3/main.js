import { createApp } from 'vue';
import { onMounted, ref } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

// Define the component configuration
const App = {
    name: 'App',
    template: `
    <ag-grid-vue
        style="width: 100%; height: 100%"
        :class="themeClass"
        :columnDefs="colDefs"
        :rowData="rowData"
    >
    </ag-grid-vue>
    `,
    components: {
        AgGridVue,
    },
    setup() {
        const rowData = ref([]);

        const colDefs = ref([
            { field: 'mission', filter: true },
            { field: 'company' },
            { field: 'location' },
            { field: 'date' },
            { field: 'price' },
            { field: 'successful' },
            { field: 'rocket' },
        ]);

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
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(App).mount('#app');
