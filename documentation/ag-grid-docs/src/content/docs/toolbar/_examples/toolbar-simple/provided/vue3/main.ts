import { createApp, defineComponent, ref } from 'vue';

import type { ColDef, Toolbar } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { RowGroupingModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import CustomToolbarItem from './customToolbarItem';

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="width: 100%; height: 100%"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :autoGroupColumnDef="autoGroupColumnDef"
                :toolbar="toolbar"
                :rowData="rowData"
            />
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const rowData = ref<any[]>([]);

        const columnDefs: ColDef[] = [
            { field: 'athlete', minWidth: 200 },
            { field: 'country', minWidth: 200 },
            { field: 'sport', minWidth: 200 },
            { field: 'year', filter: 'agNumberColumnFilter' },
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
            { field: 'total' },
        ];

        const defaultColDef: ColDef = {
            flex: 1,
            minWidth: 100,
            filter: true,
        };

        const autoGroupColumnDef: ColDef = {
            minWidth: 200,
        };

        const toolbar: Toolbar = {
            items: [{ component: CustomToolbarItem, key: 'analyseByCountry' }],
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data) => (rowData.value = data));

        return {
            rowData,
            columnDefs,
            defaultColDef,
            autoGroupColumnDef,
            toolbar,
        };
    },
});

createApp(VueExample).mount('#app');
