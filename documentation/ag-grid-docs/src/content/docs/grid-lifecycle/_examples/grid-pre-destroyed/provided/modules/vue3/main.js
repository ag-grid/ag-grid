import { createApp, onBeforeMount, ref, shallowRef } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data.js';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <div v-if="showExampleButtons" style="margin-bottom: 1rem;">
                        <button v-on:click="updateColumnWidth()">Change Columns Width</button>
                        <button v-on:click="destroyGrid()">Destroy Grid</button>
                    </div>
                    <div v-if="showGridPreDestroyedState">
                        State captured on grid pre-destroyed event:<br />
                        <strong>Column fields and widths</strong>
                        <div class="values">
                            <ul>
                                <li v-for="item in columnsWidthOnPreDestroyed" key="field">
                                    Field: {{item.field}} | Width: {{item.width}}px
                                </li>
                            </ul>
                        </div>
                        <button v-on:click="reloadGrid()">Reload Grid</button>
                    </div>
                </div>
                <ag-grid-vue
                    v-if="showGrid"                
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData"
                    @grid-pre-destroyed="onGridPreDestroyed"></ag-grid-vue>
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
            },
            {
                field: 'medals.gold',
                headerName: 'Gold Medals',
            },
            {
                field: 'person.age',
                headerName: 'Age',
            },
        ]);
        const gridApi = shallowRef();
        const defaultColDef = ref({
            editable: true,
        });

        const columnsWidthOnPreDestroyed = ref([]);
        const showGrid = ref(true);
        const showExampleButtons = ref(true);
        const showGridPreDestroyedState = ref(false);
        const rowData = ref(null);

        onBeforeMount(() => {
            rowData.value = getData();
        });

        const onGridPreDestroyed = (params) => {
            const { api } = params;
            const allColumns = api.getColumns();
            if (!allColumns) {
                return;
            }

            columnsWidthOnPreDestroyed.value = allColumns.map((column) => ({
                field: column.getColDef().field || '-',
                width: column.getActualWidth(),
            }));

            showExampleButtons.value = false;
            showGridPreDestroyedState.value = true;
        };
        const updateColumnWidth = () => {
            if (!gridApi.value) {
                return;
            }

            const newWidths = gridApi.value.getColumns().map((column) => {
                return { key: column.getColId(), newWidth: Math.round((150 + pRandom() * 100) * 100) / 100 };
            });
            gridApi.value.setColumnWidths(newWidths);
        };
        const destroyGrid = () => {
            showGrid.value = false;
        };

        const reloadGrid = () => {
            const updatedColDefs = columnsWidthOnPreDestroyed
                ? columnDefs.value.map((val) => {
                      const colDef = val;
                      const result = {
                          ...colDef,
                      };

                      const restoredColConfig = columnsWidthOnPreDestroyed.value.find(
                          (columnWidth) => columnWidth.field === colDef.field
                      );
                      if (restoredColConfig && restoredColConfig.width) {
                          result.width = restoredColConfig.width;
                      }

                      return result;
                  })
                : columnDefs;

            columnDefs.value = updatedColDefs;
            showGrid.value = true;
            showGridPreDestroyedState.value = false;
            showExampleButtons.value = true;
        };
        const onGridReady = (params) => {
            gridApi.value = params.api;
        };

        return {
            columnDefs,
            gridApi,
            defaultColDef,
            rowData,
            columnsWidthOnPreDestroyed,
            showGrid,
            showExampleButtons,
            showGridPreDestroyedState,
            onGridReady,
            onGridPreDestroyed,
            updateColumnWidth,
            destroyGrid,
            reloadGrid,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(VueExample).mount('#app');
