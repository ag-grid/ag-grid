import { createApp, defineComponent, ref, shallowRef } from 'vue';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import { CustomOverlay } from './customOverlay';
import './styles.css';

ModuleRegistry.registerModules([
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
                <button v-on:click="incrementParam()">Increment Param</button>
            </div>
            <ag-grid-vue
                class="grid-wrapper"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :activeOverlay="activeOverlay"
                :activeOverlayParams="activeOverlayParams"
            />
        </div>`,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete', flex: 1 },
            { field: 'country', flex: 1 },
        ]);
        const rowData = ref<IAthlete[] | null>([
            { athlete: 'Michael Phelps', country: 'United States' },
            { athlete: 'Natalie Coughlin', country: 'United States' },
            { athlete: 'Aleksey Nemov', country: 'Russia' },
            { athlete: 'Alicia Coutts', country: 'Australia' },
        ]);
        const activeOverlay = shallowRef<any>(CustomOverlay);
        const activeOverlayParams = ref<{ count: number }>({ count: 1 });

        function showActiveOverlay() {
            activeOverlay.value = CustomOverlay;
        }
        function clearActiveOverlay() {
            activeOverlay.value = undefined;
        }
        function incrementParam() {
            activeOverlayParams.value.count++;
        }

        return {
            columnDefs,
            rowData,
            activeOverlay,
            activeOverlayParams,
            showActiveOverlay,
            clearActiveOverlay,
            incrementParam,
        };
    },
});

const app = createApp(VueExample);
app.mount('#app');
