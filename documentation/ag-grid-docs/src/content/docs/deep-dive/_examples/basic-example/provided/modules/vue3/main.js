import { createApp } from 'vue';
import { ref } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Define the component configuration
const App = {
    name: 'App',
    template: `
    <ag-grid-vue
        style="width: 100%; height: 100%"
        :columnDefs="colDefs"
        :rowData="rowData"
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
        ]);

        const colDefs = ref([{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }]);

        return {
            rowData,
            colDefs,
        };
    },
};

createApp(App).mount('#app');
