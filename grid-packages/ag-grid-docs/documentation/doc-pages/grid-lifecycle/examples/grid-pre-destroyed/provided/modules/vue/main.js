import Vue from 'vue';
import {AgGridVue} from '@ag-grid-community/vue';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
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
                    <div v-if="showExampleButtons" id="exampleButtons" style="margin-bottom: 1rem;">
                        <button v-on:click="updateColumnWidth()">Change Columns Width</button>
                        <button v-on:click="destroyGrid()">Destroy Grid</button>
                    </div>
                    <div v-if="showGridPreDestroyedState" id="gridPreDestroyedState">
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
    data: function () {
        return {
            columnDefs: [{
                field: "name",
                headerName: "Athlete"
            }, {
                field: "medals.gold",
                headerName: "Gold Medals"
            }, {
                field: "person.age",
                headerName: "Age"
            }],
            columnsWidthOnPreDestroyed: undefined,
            gridApi: null,
            defaultColDef: {
                editable: true,
            },
            rowData: null,
            showGrid: true,
            showExampleButtons: true,
            showGridPreDestroyedState: false,
            themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
        }
    },
    created() {
        this.rowData = getDataSet()
    },
    methods: {
        onGridPreDestroyed(params) {
            const {api} = params;
            const allColumns = api.getColumns();
            if (!allColumns) {
                return;
            }

            this.columnsWidthOnPreDestroyed = allColumns.map(column => ({
                field: column.getColDef().field || '-',
                width: column.getActualWidth(),
            }));

            this.showExampleButtons = false;
            this.showGridPreDestroyedState = true;
        },
        updateColumnWidth() {
            if (!this.gridApi) {
                return;
            }

            const newWidths = this.gridApi.getColumns().map(column => {
                return { key: column.getColId(), newWidth: Math.round((150 + Math.random() * 100) * 100) / 100 };
            })
            this.gridApi.setColumnWidths(newWidths);
        },
        destroyGrid() {
            this.showGrid = false;
        },
        reloadGrid() {
            const updatedColDefs = this.columnsWidthOnPreDestroyed ?
                this.columnDefs.map(val => {
                    const colDef = val;
                    const result = {
                        ...colDef,
                    };

                    const restoredColState = this.columnsWidthOnPreDestroyed
                        .find(col => col.field === colDef.field);
                    if (restoredColState && restoredColState.width) {
                        result.width = restoredColState.width;
                    }

                    return result;
                }) : this.columnDefs;

            this.columnDefs = updatedColDefs;
            this.showGrid = true;
            this.showGridPreDestroyedState = false;
            this.showExampleButtons = true;
        },
        onGridReady(params) {
            this.gridApi = params.api;
        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
