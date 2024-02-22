import {createApp} from 'vue';
import {AgGridVue} from '@ag-grid-community/vue3';

import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {ExcelExportModule} from '@ag-grid-enterprise/excel-export';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);

const VueExample = {
    template: `
        <ag-grid-vue style="width: 100%; height: 100%;"
                     class="ag-theme-quartz"
                     :columnDefs="columnDefs"
                     :rowData="rowData">
        </ag-grid-vue>
    `,
    components: {
        'ag-grid-vue': AgGridVue
    },
    setup() {
        const columnDefs = [
            {headerName: 'Make', field: 'make'},
            {headerName: 'Model', field: 'model'},
            {headerName: 'Price', field: 'price'}
        ];

        const rowData = [
            {make: 'Toyota', model: 'Celica', price: 35000},
            {make: 'Ford', model: 'Mondeo', price: 32000},
            {make: 'Porsche', model: 'Boxster', price: 72000}
        ];

        return {
            columnDefs,
            rowData,
        };
    },
};

createApp(VueExample).mount('#app');
