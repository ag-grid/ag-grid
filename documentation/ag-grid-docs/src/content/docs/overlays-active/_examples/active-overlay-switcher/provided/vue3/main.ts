import { createApp, defineComponent, ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import { StatusOverlay } from './statusOverlay';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface Athlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef<Athlete>[] = [
    { field: 'athlete', flex: 1 },
    { field: 'country', flex: 1 },
];

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
                <button type="button" @click="showNoRowsOverlay">activeOverlay = agNoRowsOverlay</button>
                <button type="button" @click="showCustomOverlay">activeOverlay = CustomOverlay</button>
                <button type="button" @click="clearOverlay">Hide activeOverlay</button>
            </div>
            <ag-grid-vue
                class="grid-wrapper"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :components="components"
                :loading="loading"
                :activeOverlay="activeOverlay"
            />
        </div>
    `,
    setup() {
        const activeOverlay = ref<string | undefined>();
        const loading = ref<boolean | undefined>(undefined);
        const components = { statusOverlay: StatusOverlay };

        const showNoRowsOverlay = () => {
            activeOverlay.value = 'agNoRowsOverlay';
        };

        const showCustomOverlay = () => {
            activeOverlay.value = 'statusOverlay';
        };

        const clearOverlay = () => {
            activeOverlay.value = undefined;
        };

        const onLoadingToggle = (event: Event) => {
            const checked = (event.target as HTMLInputElement).checked;
            loading.value = checked ? true : undefined;
        };

        return {
            columnDefs,
            rowData,
            components,
            activeOverlay,
            loading,
            onLoadingToggle,
            showNoRowsOverlay,
            showCustomOverlay,
            clearOverlay,
        };
    },
});

createApp(VueExample).mount('#app');
