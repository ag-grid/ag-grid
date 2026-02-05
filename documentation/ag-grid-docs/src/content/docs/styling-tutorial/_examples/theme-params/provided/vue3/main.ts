import { createApp, defineComponent, ref } from 'vue';

import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    themeQuartz,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import type { IProduct } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([RowSelectionModule, TextFilterModule, NumberFilterModule, ClientSideRowModelModule]);

// Customise the theme with parameters
const myTheme = themeQuartz.withParams({
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
    headerBackgroundColor: '#faf8f5',
    spacing: 10,
    fontSize: 12,
    headerFontSize: 14,
});

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="height: 100%;"
                :theme="theme"
                :rowData="rowData"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowSelection="rowSelection"
            ></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const rowData = ref<IProduct[]>(getData());

        const columnDefs = ref<ColDef<IProduct>[]>([
            { field: 'productName', headerName: 'Product', minWidth: 180 },
            {
                field: 'salesRevenue',
                headerName: 'Revenue',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value != null ? `$${params.value.toLocaleString()}` : '',
            },
            {
                field: 'profitMargin',
                headerName: 'Margin',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value != null ? `${(params.value * 100).toFixed(0)}%` : '',
            },
            { field: 'status' },
        ]);

        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 100,
            filter: true,
        });

        return {
            theme: myTheme,
            rowData,
            columnDefs,
            defaultColDef,
            rowSelection: { mode: 'multiRow' as const },
        };
    },
});

createApp(VueExample).mount('#app');
