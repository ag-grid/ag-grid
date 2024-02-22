
import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import './styles.css';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule, RangeSelectionModule])

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="example-wrapper">
                <div>
                    <span class="button-group">
                        <button v-on:click="reloadGrid()">Recreate Grid with Current State</button>
                        <button v-on:click="printState()">Print State</button>
                    </span>
                </div>
                <ag-grid-vue
                    v-if="gridVisible"
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :enableRangeSelection="true"
                    :sideBar="true"
                    :pagination="true"
                    :rowSelection="rowSelection"
                    :suppressRowClickSelection="true"
                    :suppressColumnMoveAnimation="true"
                    :rowData="rowData"
                    :initialState="initialState"
                    @grid-pre-destroyed="onGridPreDestroyed"
                    @state-updated="onStateUpdated"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function() {
        return {
            columnDefs: [
                {
                    field: 'athlete',
                    minWidth: 150,
                    headerCheckboxSelection: true,
                    checkboxSelection: true,
                },
                { field:"age", maxWidth:90 },
                { field:"country", minWidth:150 },
                { field:"year", maxWidth:90 },
                { field:"date", minWidth:150 },
                { field:"sport", minWidth:150 },
                { field:"gold" },
                { field:"silver" },
                { field:"bronze" },
                { field:"total" },
            ],
            gridApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                filter: true,
                enableRowGroup: true,
                enablePivot: true,
                enableValue: true,
            },
            rowSelection: null,
            rowData: null,
            initialState: undefined,
            gridVisible: true,
            themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
        }
    },
    created() {
        this.rowSelection = 'multiple'
    },
    methods: {
        reloadGrid() {
            const state = this.gridApi.getState();
            this.gridVisible = false;
            setTimeout(() => {
                this.initialState = state;
                this.rowData = undefined;
                this.gridVisible = true;
            });
        },
        printState() {
            console.log('Grid state', this.gridApi.getState());
        },
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => this.rowData = data;
            
            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
        onGridPreDestroyed(params) {
            console.log('Grid state on destroy (can be persisted)', params.state);
        },
        onStateUpdated(params) {
            console.log('State updated', params.state);
        }
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
