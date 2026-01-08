import { createApp, ref } from 'vue';

import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { generateTransactions, ITransaction } from './generateTransactions';
import { gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const App = {
    components: {
        AgGridVue,
    },
    setup() {
        // Generate synthetic transaction data
        const rowData = ref<ITransaction[]>(generateTransactions({ count: 10000, seed: 42 }));

        return {
            rowData,
            columnDefs: gridOptions.columnDefs,
            defaultColDef: gridOptions.defaultColDef,
            autoSizeStrategy: gridOptions.autoSizeStrategy,
            enableFilterHandlers: gridOptions.enableFilterHandlers,
            sideBar: gridOptions.sideBar,
            icons: gridOptions.icons,
        };
    },
    template: `
        <div style="width: 100%; height: 100%;">
            <ag-grid-vue
                style="width: 100%; height: 100%;"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :defaultColDef="defaultColDef"
                :autoSizeStrategy="autoSizeStrategy"
                :enableFilterHandlers="enableFilterHandlers"
                :sideBar="sideBar"
                :icons="icons"
            />
        </div>
    `,
};

createApp(App).mount('#app');
