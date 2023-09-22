import Vue from 'vue';
import {AgGridVue} from '@ag-grid-community/vue';
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
                    <div v-if="showExampleButtons" id="exampleButtons" style="margin-bottom: 1rem;">
                        <button v-on:click="updateColumnWidth()">Change Columns Width</button>
                        <button v-on:click="destroyGrid()">Destroy Grid</button>
                    </div>
                    <div v-if="showGridPreDestroyedState" id="gridPreDestroyedState">
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
            currentColumnWidths: undefined,
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                editable: true,
                resizable: true,
            },
            rowData: null,
            showGrid: true,
            showExampleButtons: true,
            showGridPreDestroyedState: false,
        }
    },
    created() {
        this.rowData = getDataSet()
    },
    methods: {
        onGridPreDestroyed(params) {
            const {columnApi} = params;
            const allColumns = columnApi.getColumns();
            if (!allColumns) {
                return;
            }

            const currentColumnWidths = allColumns.map(column => ({
                field: column.getColDef().field || '-',
                width: column.getActualWidth(),
            }));

            this.currentColumnWidths = new Map(currentColumnWidths
                .map(columnWidth => [columnWidth.field, columnWidth.width]));

            this.showExampleButtons = false;
            this.showGridPreDestroyedState = true;
        },
        updateColumnWidth() {
            if (!this.gridColumnApi) {
                return;
            }

            this.gridColumnApi.getColumns().forEach(column => {
                const newRandomWidth = Math.round((150 + Math.random() * 100) * 100) / 100;
                this.gridColumnApi.setColumnWidth(column, newRandomWidth);
            });
        },
        destroyGrid() {
            this.showGrid = false;
        },
        reloadGrid() {
            const updatedColDefs = this.currentColumnWidths ?
                this.columnDefs.map(val => {
                    const colDef = val;
                    const result = {
                        ...colDef,
                    };

                    const restoredWidth = this.currentColumnWidths.get(colDef.field);
                    if (restoredWidth) {
                        result.width = restoredWidth;
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
            this.gridColumnApi = params.columnApi;

        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});
