import { createApp, defineComponent, ref, shallowRef } from 'vue';

import type {
    ColDef,
    ColGroupDef,
    GridApi,
    GridPreDestroyedEvent,
    GridReadyEvent,
    GridState,
    RowSelectionOptions,
    StateUpdatedEvent,
    Toolbar,
} from 'ag-grid-community';
import { ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <div class="example-wrapper">
                <div>
                    <span class="button-group">
                        <button v-on:click="saveState()">Save State</button>
                        <button v-on:click="reloadGrid()">Recreate Grid with No State</button>
                        <button v-on:click="setState()">Set State</button>
                        <button v-on:click="printState()">Print State</button>
                    </span>
                </div>
                <ag-grid-vue
                    v-if="gridVisible"
                    style="width: 100%; height: 100%;"
                    gridId="setState"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :defaultColGroupDef="defaultColGroupDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :sideBar="true"
                    :toolbar="toolbar"
                    :pagination="true"
                    :rowSelection="rowSelection"
                    :cellSelection="true"
                    :calculatedColumns="true"
                    :enableRowPinning="true"
                    :suppressColumnMoveAnimation="true"
                    :rowData="rowData"
                    @grid-pre-destroyed="onGridPreDestroyed"
                    @state-updated="onStateUpdated"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const columnDefs = ref<(ColDef | ColGroupDef)[]>([
            { field: 'athlete', minWidth: 150 },
            { field: 'age' },
            { field: 'country', minWidth: 150 },
            {
                headerName: 'Competition',
                groupId: 'competition',
                children: [{ field: 'year' }, { field: 'date', minWidth: 150 }, { field: 'sport', minWidth: 150 }],
            },
            {
                headerName: 'Medals',
                groupId: 'medals',
                children: [
                    { field: 'gold' },
                    { field: 'silver', columnGroupShow: 'open' },
                    { field: 'bronze', columnGroupShow: 'open' },
                    { field: 'total', columnGroupShow: 'closed' },
                ],
            },
        ]);
        const gridApi = shallowRef<GridApi | null>(null);
        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 100,
            filter: true,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            headerNameEditable: true,
        });
        const defaultColGroupDef = ref<Partial<ColGroupDef>>({ headerNameEditable: true });
        const autoGroupColumnDef = ref<ColDef>({ minWidth: 200 });
        const rowSelection = ref<RowSelectionOptions>({
            mode: 'multiRow',
        });
        const toolbar = ref<Toolbar>({ items: ['agQuickFilterToolbarItem'] });
        const rowData = ref<any[] | undefined>(undefined);
        const gridVisible = ref(true);
        const savedState = ref<GridState>();

        const reloadGrid = () => {
            gridVisible.value = false;
            setTimeout(() => {
                rowData.value = undefined;
                gridVisible.value = true;
            });
        };
        const printState = () => {
            console.log('Grid state', gridApi.value!.getState());
        };
        const saveState = () => {
            const state = gridApi.value!.getState();
            savedState.value = state;
            console.log('Saved state', state);
        };
        const setState = () => {
            if (savedState.value) {
                gridApi.value!.setState(savedState.value);
                console.log('Set state', savedState.value);
            }
        };
        const onGridReady = (params: GridReadyEvent) => {
            gridApi.value = params.api;

            const updateData = (data: any[]) => (rowData.value = data);

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        };
        const onGridPreDestroyed = (params: GridPreDestroyedEvent) => {
            console.log('Grid state on destroy (can be persisted)', params.state);
        };
        const onStateUpdated = (params: StateUpdatedEvent) => {
            console.log('State updated', params.state);
        };

        return {
            columnDefs,
            gridApi,
            defaultColDef,
            defaultColGroupDef,
            autoGroupColumnDef,
            rowSelection,
            toolbar,
            rowData,
            gridVisible,
            onGridReady,
            onGridPreDestroyed,
            onStateUpdated,
            reloadGrid,
            printState,
            saveState,
            setState,
        };
    },
});

createApp(VueExample).mount('#app');
