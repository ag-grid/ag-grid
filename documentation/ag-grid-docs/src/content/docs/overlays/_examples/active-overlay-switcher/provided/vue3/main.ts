import { createApp, defineComponent, ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import { StatusOverlay } from './statusOverlay';
import type { StatusOverlayParams } from './statusOverlay';
import './styles.css';

ModuleRegistry.registerModules([
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface Athlete {
    athlete: string;
    country: string;
}

interface OverlayState {
    activeOverlay: 'agLoadingOverlay' | 'agNoRowsOverlay' | 'statusOverlay' | undefined;
    activeOverlayParams: StatusOverlayParams | undefined;
}

const columnDefs: ColDef<Athlete>[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', width: 150 },
];

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
};

const rowData: Athlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

const VueExample = defineComponent({
    components: {
        'ag-grid-vue': AgGridVue,
    },
    template: `
        <div class="example-wrapper">
            <div class="button-row">
                <button type="button" @click="showCustomOverlay">Show custom overlay</button>
                <button type="button" @click="clearOverlay">Hide overlay</button>
            </div>
            <ag-grid-vue
                class="grid-wrapper"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :components="components"
                :activeOverlay="overlayState.activeOverlay"
                :activeOverlayParams="overlayState.activeOverlayParams"
            />
        </div>
    `,
    setup() {
        const statusOverlayCounter = ref(1);
        const overlayState = ref<OverlayState>({
            activeOverlay: 'statusOverlay',
            activeOverlayParams: { myCounter: statusOverlayCounter.value },
        });
        const components = { statusOverlay: StatusOverlay };

        const showCustomOverlay = () => {
            statusOverlayCounter.value += 1;
            overlayState.value = {
                activeOverlay: 'statusOverlay',
                activeOverlayParams: { myCounter: statusOverlayCounter.value },
            };
        };

        const clearOverlay = () => {
            overlayState.value = {
                activeOverlay: undefined,
                activeOverlayParams: undefined,
            };
        };

        return {
            columnDefs,
            defaultColDef,
            rowData,
            components,
            overlayState,
            showCustomOverlay,
            clearOverlay,
        };
    },
});

createApp(VueExample).mount('#app');
