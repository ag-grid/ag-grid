import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { createApp, onBeforeMount, ref, shallowRef } from 'vue';

import MenuItem from './menuItemVue.js';
import './style.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    MenuModule,
    ExcelExportModule,
    RangeSelectionModule,
    ClipboardModule,
]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="width: 100%; height: 100%;"
                :class="themeClass"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :getMainMenuItems="getMainMenuItems">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        MenuItem,
    },
    setup(props) {
        const columnDefs = ref([
            { field: 'athlete' },
            { field: 'country' },
            { field: 'sport' },
            { field: 'year' },
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
        ]);
        const gridApi = shallowRef();
        const defaultColDef = ref({
            flex: 1,
            minWidth: 100,
            filter: true,
            suppressHeaderFilterButton: true,
        });
        const getMainMenuItems = ref(null);
        const rowData = ref(null);

        onBeforeMount(() => {
            getMainMenuItems.value = (params) => {
                return [
                    ...params.defaultItems,
                    'separator',
                    {
                        name: 'Filter',
                        menuItem: 'MenuItem',
                        menuItemParams: {
                            column: params.column,
                        },
                    },
                ];
            };
        });

        const onGridReady = (params) => {
            gridApi.value = params.api;

            const updateData = (data) => {
                rowData.value = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        };

        return {
            columnDefs,
            gridApi,
            defaultColDef,
            rowData,
            getMainMenuItems,
            onGridReady,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(VueExample).mount('#app');
