import { createApp } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IRow {
    name: string;
    category: string;
    price: number;
}

const App = {
    components: { AgGridVue },
    data() {
        return {
            defaultColDef: {
                flex: 1,
                minWidth: 120,
            } as ColDef<IRow>,
            columnDefs: [
                { field: 'name', headerName: 'Product', flex: 2 },
                { field: 'category' },
                { field: 'price' },
            ] as ColDef<IRow>[],
            rowData: [
                { name: 'Wireless Mouse', category: 'Electronics', price: 24.99 },
                { name: 'Standing Desk', category: 'Furniture', price: 349.0 },
                { name: 'Coffee Mug', category: 'Kitchen', price: 9.5 },
                { name: 'Desk Lamp', category: 'Furniture', price: 34.99 },
                { name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99 },
                { name: 'Bookshelf', category: 'Furniture', price: 120 },
            ] as IRow[],
        };
    },
    template: `
        <ag-grid-vue
            style="width: 100%; height: 100%"
            :defaultColDef="defaultColDef"
            :columnDefs="columnDefs"
            :rowData="rowData"
        >
            <template #cell-price="params">
                <strong>£{{ params.value.toFixed(2) }}</strong>
            </template>
        </ag-grid-vue>
    `,
};

createApp(App).mount('#app');
