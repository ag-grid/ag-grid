import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { createApp } from 'vue';
import { ref } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
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
        :defaultColDef="defaultColDef"
    >
    </ag-grid-vue>
    `,
    components: {
        AgGridVue,
    },
    setup() {
        const rowData = ref([
            { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
            { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
            { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
            { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
            { make: 'Fiat', model: '500', price: 15774, electric: false },
            { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
        ]);

        const colDefs = ref([{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }]);

        const defaultColDef = {
            flex: 1,
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
