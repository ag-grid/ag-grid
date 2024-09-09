import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { createApp, onBeforeMount, ref, shallowRef } from 'vue';

import { getData } from './data.js';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <div style="margin-bottom: 1rem;">
                        <input type="checkbox" id="pinFirstColumnOnLoad">
                        <label for="pinFirstColumnOnLoad">Pin first column on load</label>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <button id="reloadGridButton" v-on:click="reloadGrid()">Reload Grid</button>
                    </div>
                </div>
                <ag-grid-vue
                    v-if="isVisible"              
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :rowData="rowData"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const columnDefs = ref([
            {
                field: 'name',
                headerName: 'Athlete',
                width: 250,
            },
            {
                field: 'person.country',
                headerName: 'Country',
            },
            {
                field: 'person.age',
                headerName: 'Age',
            },
            {
                field: 'medals.gold',
                headerName: 'Gold Medals',
            },
            {
                field: 'medals.silver',
                headerName: 'Silver Medals',
            },
            {
                field: 'medals.bronze',
                headerName: 'Bronze Medals',
            },
        ]);

        const gridApi = shallowRef();

        const rowData = ref(null);
        const isVisible = ref(true);

        onBeforeMount(() => {
            rowData.value = getData();
        });

        const reloadGrid = () => {
            isVisible.value = false;
            setTimeout(() => (isVisible.value = true), 1);
        };
        const onGridReady = (params) => {
            gridApi.value = params.api;

            const checkbox = document.querySelector('#pinFirstColumnOnLoad');
            const shouldPinFirstColumn = checkbox && checkbox.checked;

            if (shouldPinFirstColumn) {
                params.api.applyColumnState({
                    state: [{ colId: 'name', pinned: 'left' }],
                });
            }
        };

        return {
            columnDefs,
            gridApi,
            rowData,
            onGridReady,
            reloadGrid,
            isVisible,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(VueExample).mount('#app');
