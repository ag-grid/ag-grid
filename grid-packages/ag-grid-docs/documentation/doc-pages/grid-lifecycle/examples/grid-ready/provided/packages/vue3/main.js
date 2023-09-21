import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-alpine.css";
import {createApp, onBeforeMount, ref} from 'vue';
import {AgGridVue} from 'ag-grid-vue3';

const VueExample = {
    template: `
        <div style="height: 100%">
            <div style="height: 100%; box-sizing: border-box;">
                <div style="margin-bottom: 1rem;">
                    <input type="checkbox" id="pinFirstColumnOnLoad">
                    <label for="pinFirstColumnOnLoad">Pin first column on load</label>
                </div>
                <div style="margin-bottom: 1rem;">
                    <button id="reloadGridButton" v-on:click="reloadGrid()">Reload Grid</button>
                </div>
                <ag-grid-vue
                    v-if="isVisible"              
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :rowData="rowData"
                    :rowSelection="rowSelection"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const columnDefs = ref([{
            field: "name",
            headerName: "Athlete",
            width: 250
        }, {
            field: "person.country",
            headerName: "Country"
        }, {
            field: "person.age",
            headerName: "Age"
        }, {
            field: "medals.gold",
            headerName: "Gold Medals"
        }, {
            field: "medals.silver",
            headerName: "Silver Medals"
        }, {
            field: "medals.bronze",
            headerName: "Bronze Medals"
        }]);

        const gridApi = ref();
        const gridColumnApi = ref();

        const rowData = ref(null);
        const rowSelection = ref(null);
        const isVisible = ref(true);

        onBeforeMount(() => {
            rowData.value = getData();
            rowSelection.value = 'multiple'
        });

        const reloadGrid = () => {
            isVisible.value = false;
            setTimeout(() => isVisible.value = true, 1);
        };
        const onGridReady = (params) => {
            gridApi.value = params.api;
            gridColumnApi.value = params.columnApi;

            const checkbox = document.querySelector('#pinFirstColumnOnLoad');
            const shouldPinFirstColumn = checkbox && checkbox.checked;

            if (shouldPinFirstColumn) {
                params.columnApi.applyColumnState({
                    state: [
                        {colId: 'name', pinned: 'left'},
                    ],
                });
            }
        };

        return {
            columnDefs,
            gridApi,
            gridColumnApi,
            rowData,
            rowSelection,
            onGridReady,
            reloadGrid,
            isVisible,
        }
    }
}

createApp(VueExample).mount("#app");
