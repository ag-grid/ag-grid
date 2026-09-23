import { createApp, defineComponent, ref, shallowRef } from 'vue';

import type { ColDef, GridApi, GridReadyEvent, GridState } from 'ag-grid-community';
import { ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

// Only the column order is supplied; every other column state section is omitted.
const columnOrderState: GridState = {
    columnOrder: {
        orderedColIds: ['gold', 'silver', 'athlete', 'sport', 'country', 'year'],
    },
};

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <div class="example-wrapper">
                <div>
                    <span class="button-group">
                        <button v-on:click="recreateWithNoState()">No State</button>
                        <button v-on:click="recreateWithColumnOrder()">Column Order (overrides defaults)</button>
                        <button v-on:click="recreateWithPartialColumnOrder()">
                            Column Order + partialColumnState (keeps defaults)
                        </button>
                    </span>
                </div>
                <ag-grid-vue
                    v-if="gridVisible"
                    style="width: 100%; height: 100%;"
                    gridId="partialColumnState"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    grandTotalRow="bottom"
                    :rowData="rowData"
                    :initialState="initialState"
                    @grid-ready="onGridReady"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete' },
            { field: 'country', pinned: 'left' },
            { field: 'year', hide: true },
            { field: 'sport' },
            { field: 'gold', aggFunc: 'sum' },
            { field: 'silver', aggFunc: 'sum' },
        ]);
        const gridApi = shallowRef<GridApi | null>(null);
        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 100,
        });
        const rowData = ref<any[] | undefined>(undefined);
        const gridVisible = ref(true);
        const initialState = ref<GridState | undefined>(undefined);

        const recreateGrid = (state?: GridState) => {
            gridVisible.value = false;
            console.log('Recreating grid with initialState', state);
            setTimeout(() => {
                initialState.value = state;
                rowData.value = undefined;
                gridVisible.value = true;
            });
        };
        const recreateWithNoState = () => recreateGrid();
        const recreateWithColumnOrder = () => recreateGrid(columnOrderState);
        const recreateWithPartialColumnOrder = () => recreateGrid({ ...columnOrderState, partialColumnState: true });
        const onGridReady = (params: GridReadyEvent) => {
            gridApi.value = params.api;

            const updateData = (data: any[]) => (rowData.value = data);

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        };

        return {
            columnDefs,
            gridApi,
            defaultColDef,
            rowData,
            gridVisible,
            initialState,
            onGridReady,
            recreateWithNoState,
            recreateWithColumnOrder,
            recreateWithPartialColumnOrder,
        };
    },
});

createApp(VueExample).mount('#app');
