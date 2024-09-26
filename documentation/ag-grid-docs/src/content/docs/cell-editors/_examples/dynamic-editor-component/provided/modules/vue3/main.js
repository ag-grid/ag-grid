import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { createApp } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RichSelectModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data.js';
import MoodEditor from './moodEditorVue.js';
import NumericCellEditor from './numericCellEditorVue.js';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    MenuModule,
    ColumnsToolPanelModule,
    RichSelectModule,
]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    id="myGrid"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData"
                    
                    @row-editing-started="onRowEditingStarted"
                    @row-editing-stopped="onRowEditingStopped"
                    @cell-editing-started="onCellEditingStarted"
                    @cell-editing-stopped="onCellEditingStopped"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        MoodEditor,
        NumericCellEditor,
    },
    data: function () {
        return {
            columnDefs: [
                {
                    field: 'type',
                },
                {
                    field: 'value',
                    editable: true,
                    cellEditorSelector: (params) => {
                        if (params.data.type === 'age') {
                            return {
                                component: 'NumericCellEditor',
                            };
                        }
                        if (params.data.type === 'gender') {
                            return {
                                component: 'agRichSelectCellEditor',
                                params: {
                                    values: ['Male', 'Female'],
                                },
                            };
                        }
                        if (params.data.type === 'mood') {
                            return {
                                component: 'MoodEditor',
                                popup: true,
                                popupPosition: 'under',
                            };
                        }
                        return undefined;
                    },
                },
            ],
            gridApi: null,
            defaultColDef: {
                flex: 1,
                cellDataType: false,
            },
            rowData: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    created() {
        this.rowData = getData();
    },
    methods: {
        onRowEditingStarted(event) {
            console.log('never called - not doing row editing');
        },
        onRowEditingStopped(event) {
            console.log('never called - not doing row editing');
        },
        onCellEditingStarted(event) {
            console.log('cellEditingStarted');
        },
        onCellEditingStopped(event) {
            console.log('cellEditingStopped');
        },
        onGridReady(params) {
            this.gridApi = params.api;
        },
    },
};

createApp(VueExample).mount('#app');
