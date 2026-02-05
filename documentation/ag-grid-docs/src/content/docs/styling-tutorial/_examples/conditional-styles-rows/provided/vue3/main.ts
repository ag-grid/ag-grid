import { createApp, defineComponent, ref } from 'vue';

import type { CellClassRules, ColDef, RowClassRules, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    RowStyleModule,
    TextFilterModule,
    iconSetMaterial,
    themeQuartz,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import type { IProduct } from './data';
import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    RowSelectionModule,
    RowStyleModule,
    TextFilterModule,
]);

// Create a theme with light and dark modes
const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams(
        {
            backgroundColor: '#ffffff',
            foregroundColor: '#1a1a1a',
            headerBackgroundColor: '#faf8f5',
            selectedRowBackgroundColor: 'rgba(14, 68, 145, 0.15)',
            spacing: 10,
            fontSize: 12,
            headerFontSize: 14,
        },
        'light'
    )
    .withParams(
        {
            backgroundColor: '#1e1e2f',
            foregroundColor: '#e2e8f0',
            headerBackgroundColor: '#2d2d44',
            selectedRowBackgroundColor: 'rgba(110, 168, 254, 0.2)',
            spacing: 10,
            fontSize: 12,
            headerFontSize: 14,
        },
        'dark'
    );

// Cell class rules for status column
const statusCellClassRules: CellClassRules = {
    'status-delivered': (params) => params.value === 'Delivered',
    'status-pending': (params) => params.value === 'Pending',
    'status-cancelled': (params) => params.value === 'Cancelled',
};

// Row class rules for highlighting sales performance
const salesRowClassRules: RowClassRules<IProduct> = {
    'high-sales': (params) => (params.data?.salesRevenue ?? 0) > 10000,
};

const VueExample = defineComponent({
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <p style="flex: 0 1 0%">
                <button class="ag-toggleButton" @click="setThemeMode()">
                    {{ themeMode === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode' }}
                </button>
            </p>
            <div style="flex: 1 1 0%">
                <ag-grid-vue
                    style="height: 100%;"
                    :theme="theme"
                    :rowData="rowData"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :rowClassRules="rowClassRules"
                    :rowSelection="rowSelection"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const themeMode = ref<'light' | 'dark'>('light');
        document.body.dataset.agThemeMode = themeMode.value;

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
            {
                field: 'status',
                cellClassRules: statusCellClassRules,
            },
        ]);

        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 100,
            filter: true,
        });

        function setThemeMode() {
            themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark';
            document.body.dataset.agThemeMode = themeMode.value;
        }

        return {
            theme: myTheme,
            themeMode,
            rowData,
            columnDefs,
            defaultColDef,
            rowClassRules: salesRowClassRules,
            rowSelection: { mode: 'multiRow' as const },
            setThemeMode,
        };
    },
});

createApp(VueExample).mount('#app');
