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
                    <div style="display: flex; flex-direction: column; margin-bottom: 1rem;">
                        <div><span style="font-weight: bold;">Athlete Description</span> column width:</div>
                        <div style="padding-left: 1em">- On gridReady event: <span style="font-weight: bold">{{athleteDescriptionColWidthOnReady}}</span></div>
                        <div style="padding-left: 1em">- On firstDataRendered event: <span style="font-weight: bold">{{athleteDescriptionColWidthOnFirstDataRendered}}</span></div>
                    </div>
                    <button v-if="isLoadDataButtonVisible" v-on:click="loadGridData()" style="margin-bottom: 1rem;">Load Grid Data</button>
                </div>
                <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :suppressLoadingOverlay="true"
                    @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const columnDefs = ref([{
            field: "athleteDescription",
            valueGetter: (params) => {
                const {data} = params;
                const {person} = data;
                return `The ${person.age} years old ${data.name} from ${person.country}`;
            }
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
            minWidth: 150,
        });

        onBeforeMount(() => {});

        const athleteDescriptionColWidthOnReady = ref('-');
        const athleteDescriptionColWidthOnFirstDataRendered = ref('-');
        const isLoadDataButtonVisible = ref(true);

        const onFirstDataRendered = (params) => {
            const {columnApi} = params;
            const column = columnApi.getColumn('athleteDescription');
            if (column) {
                columnApi.autoSizeColumns([column.getId()]);
                athleteDescriptionColWidthOnFirstDataRendered.value = `${column.getActualWidth()}px`;
            }

            console.warn('AG Grid: onFirstDataRendered event triggered');
        };
        const loadGridData = () => {
            gridApi.value.setRowData(getData());
        };
        const onGridReady = (params) => {
            gridApi.value = params.api;
            gridColumnApi.value = params.columnApi;

            const column = gridColumnApi.value.getColumn('athleteDescription');
            console.dir(column);

            if (column) {
                gridColumnApi.value.autoSizeColumns([column.getId()]);
                athleteDescriptionColWidthOnReady.value = `${column.getActualWidth()}px`;
            }

            console.warn('AG Grid: onGridReady event triggered');
        };

        return {
            columnDefs,
            gridApi,
            gridColumnApi,
            defaultColDef,
            onGridReady,
            onFirstDataRendered,
            isLoadDataButtonVisible,
            athleteDescriptionColWidthOnReady,
            athleteDescriptionColWidthOnFirstDataRendered,
            loadGridData
        }
    }
}

window._optionalChain = function _optionalChain(ops) {
    let lastAccessLHS = undefined;
    let value = ops[0];
    let i = 1;
    while (i < ops.length) {
        const op = ops[i];
        const fn = ops[i + 1];
        i += 2;
        if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
            return undefined;
        }
        if (op === 'access' || op === 'optionalAccess') {
            lastAccessLHS = value;
            value = fn(value);
        } else if (op === 'call' || op === 'optionalCall') {
            value = fn((...args) => value.call(lastAccessLHS, ...args));
            lastAccessLHS = undefined;
        }
    }
    return value;
}

createApp(VueExample).mount("#app")
