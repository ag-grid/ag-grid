import { createApp, onBeforeMount, ref, shallowRef } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { createTheme, iconSetMaterial } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const myCustomTheme = createTheme().withPart(iconSetMaterial).withParams({
    accentColor: 'red',
    foregroundColor: '#660000',
    iconSize: 18,
});

const VueExample = {
    template: `
        <ag-grid-vue
            style="height: 100%;"
            :theme="theme"
            :rowSelection="rowSelection"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :rowData="rowData"
        ></ag-grid-vue>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        return {
            theme: myCustomTheme,
            rowSelection: { mode: 'multiRow', checkboxes: true },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            defaultColDef: {
                editable: true,
                flex: 1,
                // minWidth: 100,
                filter: true,
            },
            rowData: (() => {
                const rowData = [];
                for (let i = 0; i < 10; i++) {
                    rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
                    rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
                    rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
                }
                return rowData;
            })(),
        };
    },
};

createApp(VueExample).mount('#app');
