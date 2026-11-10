import { createApp, defineComponent, ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = defineComponent({
    components: { 'ag-grid-vue': AgGridVue },
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <label>
                    <input type="checkbox" v-model="debounceVerticalScrollbar" />
                    Debounce vertical scroll
                </label>
            </div>
            <!-- This initial-only option requires a new grid when toggled. -->
            <ag-grid-vue
                id="myGrid"
                :key="String(debounceVerticalScrollbar)"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :rowHeight="40"
                :debounceVerticalScrollbar="debounceVerticalScrollbar"
            />
        </div>
    `,
    setup() {
        const debounceVerticalScrollbar = ref(false);
        const columnDefs: ColDef[] = [{ field: 'row' }, { field: 'name' }];
        const defaultColDef: ColDef = { flex: 1 };
        const rowData = Array.from({ length: 1000 }, (_, index) => ({ row: index + 1, name: `Item ${index + 1}` }));
        return { debounceVerticalScrollbar, columnDefs, defaultColDef, rowData };
    },
});

const app = createApp(VueExample);
app.mount('#app');
