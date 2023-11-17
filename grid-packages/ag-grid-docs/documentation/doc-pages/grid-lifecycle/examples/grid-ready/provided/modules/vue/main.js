import Vue from 'vue';
import {AgGridVue} from '@ag-grid-community/vue';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

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
                    :rowData="rowData"
                    :rowSelection="rowSelection"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,

    },
    data: function () {
        return {
            columnDefs: [{
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
            }],
            gridApi: null,

            rowData: null,
            rowSelection: null,

            isVisible: true,
            themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
        }
    },
    created() {
        this.rowData = getData();
        this.rowSelection = 'multiple'
    },
    methods: {
        reloadGrid() {
            this.isVisible = false;
            setTimeout(() => this.isVisible = true, 1);
        },
        onGridReady(params) {
            this.gridApi = params.api;

            const checkbox = document.querySelector('#pinFirstColumnOnLoad');
            const shouldPinFirstColumn = checkbox && checkbox.checked;

            if (shouldPinFirstColumn) {
                params.api.applyColumnState({
                    state: [
                        {colId: 'name', pinned: 'left'},
                    ],
                });
            }
        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
