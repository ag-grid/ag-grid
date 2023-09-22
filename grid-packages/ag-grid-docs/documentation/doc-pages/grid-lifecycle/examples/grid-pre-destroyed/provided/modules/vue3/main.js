import {createApp, onBeforeMount, ref} from 'vue';
import {AgGridVue} from '@ag-grid-community/vue3';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import './styles.css';
import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

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
                        <pre class="values"></pre>
                        <button v-on:click="reloadGrid()">Reload Grid</button>
                    </div>
                </div>
                <ag-grid-vue
                    v-if="showGrid"                
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
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
        const columnDefs = ref([{
            field: "name",
            headerName: "Athlete"
        }, {
            field: "medals.gold",
            headerName: "Gold Medals"
        }, {
            field: "person.age",
            headerName: "Age"
        }]);
        const gridApi = ref();
        const gridColumnApi = ref();
        const defaultColDef = ref({
            editable: true,
            resizable: true,
        });

        const currentColumnWidths = ref(null);
        const showGrid = ref(true);
        const showExampleButtons = ref(true);
        const showGridPreDestroyedState = ref(false);
        const rowData = ref(null)

        onBeforeMount(() => {
            rowData.value = getDataSet()
        });

        const onGridPreDestroyed = (params) => {
            const {columnApi} = params;
            const allColumns = columnApi.getColumns();
            if (!allColumns) {
                return;
            }

            const updatedColumnWidths = allColumns.map(column => ({
                field: column.getColDef().field || '-',
                width: column.getActualWidth(),
            }));

            currentColumnWidths.value = new Map(updatedColumnWidths
                .map(columnWidth => [columnWidth.field, columnWidth.width]));

            showExampleButtons.value = false;
            showGridPreDestroyedState.value = true;
        };
        const updateColumnWidth = () => {
            if (!gridColumnApi.value) {
                return;
            }

            gridColumnApi.value.getColumns().forEach(column => {
                const newRandomWidth = Math.round((150 + Math.random() * 100) * 100) / 100;
                gridColumnApi.value.setColumnWidth(column, newRandomWidth);
            });
        };
        const destroyGrid = () => {
            showGrid.value = false;

        };

        const reloadGrid = () => {
            const updatedColDefs = currentColumnWidths ?
                columnDefs.value.map(val => {
                    const colDef = val;
                    const result = {
                        ...colDef,
                    };

                    const restoredWidth = currentColumnWidths.value.get(colDef.field);
                    if (restoredWidth) {
                        result.width = restoredWidth;
                    }

                    return result;
                }) : currentColumnWidths;

            columnDefs.value = updatedColDefs;
            showGrid.value = true;
            showGridPreDestroyedState.value = false;
            showExampleButtons.value = true;
        };
        const onGridReady = (params) => {
            gridApi.value = params.api;
            gridColumnApi.value = params.columnApi;
        };

        return {
            columnDefs,
            gridApi,
            gridColumnApi,
            defaultColDef,
            rowData,
            currentColumnWidths,
            showGrid,
            showExampleButtons,
            showGridPreDestroyedState,
            onGridReady,
            onGridPreDestroyed,
            updateColumnWidth,
            destroyGrid,
            reloadGrid,
        }
    }
}

createApp(VueExample).mount("#app")

