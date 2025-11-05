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
                <label class="toggle loading-toggle">
                    <input type="checkbox" :checked="loading === true" @change="onLoadingToggle" /> Loading
                </label>
                <button type="button" @click="showNoRowsOverlay">Show no-rows overlay</button>
                <button type="button" @click="showCustomOverlay">Show custom overlay</button>
                <button type="button" @click="clearOverlay">Hide overlay</button>
            </div>
            <ag-grid-vue
                class="grid-wrapper"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :components="components"
                :loading="loading"
                :activeOverlay="overlayState.activeOverlay"
                :activeOverlayParams="overlayState.activeOverlayParams"
            />
        </div>
    `,
    setup() {
        const overlayState = ref<OverlayState>({
            activeOverlay: undefined,
            activeOverlayParams: undefined,
        });
        const statusOverlayCounter = ref(0);
        const loading = ref<boolean | undefined>(undefined);
        const components = { statusOverlay: StatusOverlay };

        const showNoRowsOverlay = () => {
            overlayState.value = {
                activeOverlay: 'agNoRowsOverlay',
                activeOverlayParams: undefined,
            };
        };

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

        const onLoadingToggle = (event: Event) => {
            const checked = (event.target as HTMLInputElement).checked;
            loading.value = checked ? true : undefined;
        };

        return {
            columnDefs,
            defaultColDef,
            rowData,
            components,
            overlayState,
            loading,
            onLoadingToggle,
            showNoRowsOverlay,
            showCustomOverlay,
            clearOverlay,
        };
    },
});

createApp(VueExample).mount('#app');
