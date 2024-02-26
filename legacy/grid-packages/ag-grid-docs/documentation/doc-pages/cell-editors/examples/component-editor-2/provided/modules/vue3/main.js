import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { createApp } from 'vue';
import GenderRenderer from './genderRendererVue.js';
import MoodEditor from './moodEditorVue.js';
import MoodRenderer from './moodRendererVue.js';
import NumericEditor from './numericEditorVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RichSelectModule]);

class CountryCellRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<span style="overflow: hidden; text-overflow: ellipsis">${params.value.name}</span>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return false;
    }
}

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                
                style="width: 100%; height: 100%;"
                :class="themeClass"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :rowData="rowData"
                :defaultColDef="defaultColDef"
                ></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        GenderRenderer,
        NumericEditor,
        MoodRenderer,
        MoodEditor,
    },
    data: function () {
        return {
            columnDefs: [
                {
                    field: 'first_name',
                    headerName: 'First Name',
                    width: 120,
                    editable: true,
                },
                {
                    field: 'last_name',
                    headerName: 'Last Name',
                    width: 120,
                    editable: true,
                },
                {
                    field: 'gender',
                    width: 100,
                    editable: true,
                    cellRenderer: 'GenderRenderer',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        cellRenderer: 'GenderRenderer',
                        values: ['Male', 'Female'],
                    },
                },
                {
                    field: 'age',
                    width: 80,
                    editable: true,
                    cellEditor: 'NumericEditor',
                },
                {
                    field: 'mood',
                    width: 100,
                    cellRenderer: 'MoodRenderer',
                    cellEditor: 'MoodEditor',
                    cellEditorPopup: true,
                    editable: true,
                },
                {
                    field: 'country',
                    width: 110,
                    cellEditor: 'agRichSelectCellEditor',
                    cellRenderer: CountryCellRenderer,
                    keyCreator: (params) => {
                        return params.value.name;
                    },
                    cellEditorParams: {
                        cellRenderer: CountryCellRenderer,
                        values: [
                            { name: 'Ireland', code: 'IE' },
                            { name: 'UK', code: 'UK' },
                            { name: 'France', code: 'FR' },
                        ],
                    },
                    editable: true,
                    cellDataType: false,
                },
                {
                    field: 'address',
                    editable: true,
                    cellEditor: 'agLargeTextCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: { maxLength: '300', cols: '50', rows: '6' },
                },
            ],
            gridApi: null,
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            rowData: null,
            themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
        };
    },
    created() {
        this.rowData = getData();
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;
        },
    },
};

createApp(VueExample).mount('#app');
