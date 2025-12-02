import { createApp, defineComponent, ref, shallowRef } from 'vue';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import { CustomOverlay } from './customOverlay';
import './styles.css';

ModuleRegistry.registerModules([
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const VueExample = defineComponent({
    template: `<div class="example-wrapper">
            <div class="button-row">
                <button v-on:click="showActiveOverlay()">Show custom overlay</button>
                <button v-on:click="clearActiveOverlay()">Hide custom overlay</button>
            </div>
            <ag-grid-vue
                class="grid-wrapper"
                @grid-ready="onGridReady"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :defaultColDef="defaultColDef"
                :activeOverlay="activeOverlay"
            />
        </div>`,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const gridApi = shallowRef<GridApi<IAthlete> | null>(null);
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete', width: 150 },
            { field: 'country', width: 150 },
        ]);
        const rowData = ref<IAthlete[] | null>([
            { athlete: 'Michael Phelps', country: 'United States' },
            { athlete: 'Natalie Coughlin', country: 'United States' },
            { athlete: 'Aleksey Nemov', country: 'Russia' },
            { athlete: 'Alicia Coutts', country: 'Australia' },
        ]);
        const activeOverlay = shallowRef<any>(undefined);
        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 120,
        });

        function showActiveOverlay() {
            activeOverlay.value = CustomOverlay;
        }
        function clearActiveOverlay() {
            activeOverlay.value = undefined;
        }
        const onGridReady = (params: GridReadyEvent) => {
            gridApi.value = params.api;
        };

        return {
            gridApi,
            columnDefs,
            rowData,
            defaultColDef,
            activeOverlay,
            onGridReady,
            showActiveOverlay,
            clearActiveOverlay,
        };
    },
});

const app = createApp(VueExample);
app.mount('#app');
