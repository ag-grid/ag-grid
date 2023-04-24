import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import DoublingEditor from './doublingEditorVue.js';
import MoodEditor from './moodEditorVue.js';
import MoodRenderer from './moodRendererVue.js';
import NumericEditor from './numericEditorVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <div style="height: 100%; box-sizing: border-box;">
                <ag-grid-vue
                        style="width: 100%; height: 100%;"
                        class="ag-theme-alpine"
                        id="myGrid"
                        :columnDefs="columnDefs"
                        @grid-ready="onGridReady"
                        :rowData="rowData"
                        :defaultColDef="defaultColDef"
                        ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        doublingEditor: DoublingEditor,
        moodRenderer: MoodRenderer,
        moodEditor: MoodEditor,
        numericEditor: NumericEditor
    },
    data: function () {
        return {
            columnDefs: [{
                headerName: "Doubling",
                field: "number",
                cellEditor: "doublingEditor",
                editable: true,
                width: 300
            }, {
                field: "mood",
                cellRenderer: "moodRenderer",
                cellEditor: "moodEditor",
                editable: true,
                width: 300
            }, {
                headerName: "Numeric",
                field: "number",
                cellEditor: "numericEditor",
                editable: true,
                width: 280
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                editable: true,
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            },
            rowData: null
        }
    },
    beforeMount() {
        this.rowData = [
            {
                name: "Bob",
                mood: "Happy",
                number: 10
            },
            {
                name: "Harry",
                mood: "Sad",
                number: 3
            },
            {
                name: "Sally",
                mood: "Happy",
                number: 20
            },
            {
                name: "Mary",
                mood: "Sad",
                number: 5
            },
            {
                name: "John",
                mood: "Happy",
                number: 15
            },
            {
                name: "Jack",
                mood: "Happy",
                number: 25
            },
            {
                name: "Sue",
                mood: "Sad",
                number: 43
            },
            {
                name: "Sean",
                mood: "Sad",
                number: 1335
            },
            {
                name: "Niall",
                mood: "Happy",
                number: 2
            },
            {
                name: "Alberto",
                mood: "Happy",
                number: 123
            },
            {
                name: "Fred",
                mood: "Sad",
                number: 532
            },
            {
                name: "Jenny",
                mood: "Happy",
                number: 34
            },
            {
                name: "Larry",
                mood: "Happy",
                number: 13
            }
        ]
    },
    methods: {
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
