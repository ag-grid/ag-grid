import { createApp, defineComponent, ref } from 'vue';

import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = defineComponent({
    components: { 'ag-grid-vue': AgGridVue },
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <div class="controls-row">
                    <label for="scrollGestureMode">Scroll gesture mode:</label>
                    <select id="scrollGestureMode" v-model="scrollGestureMode">
                        <option value="native">native</option>
                        <option value="axisLocked">axisLocked</option>
                    </select>
                </div>
            </div>
            <div id="myGrid">
                <!-- Recreate the grid when this initial-only option changes. -->
                <ag-grid-vue
                    :key="scrollGestureMode"
                    style="width: 100%; height: 100%;"
                    :scrollGestureMode="scrollGestureMode"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData"
                />
            </div>
        </div>
    `,
    setup() {
        const scrollGestureMode = ref<NonNullable<GridOptions['scrollGestureMode']>>('native');
        const columnDefs: ColDef[] = Array.from({ length: 10 }, (_, i) => ({
            field: `c${i}`,
            headerName: `Column ${i + 1}`,
        }));
        const defaultColDef: ColDef = { width: 180 };
        const rowData = Array.from({ length: 100 }, (_, row) =>
            Object.fromEntries(Array.from({ length: 10 }, (_, col) => [`c${col}`, `Row ${row + 1}, column ${col + 1}`]))
        );

        return { scrollGestureMode, columnDefs, defaultColDef, rowData };
    },
});

const app = createApp(VueExample);
app.mount('#app');
