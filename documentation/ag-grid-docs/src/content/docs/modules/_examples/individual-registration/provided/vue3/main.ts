import { createApp, defineComponent } from 'vue';

import type { AgModuleName, ColDef, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    ExcelExportModule,
    SetFilterModule,
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

const sharedModules = [
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];
const leftModules = [SetFilterModule, ClipboardModule, CsvExportModule];
const rightModules = [TextFilterModule, NumberFilterModule, CsvExportModule, ExcelExportModule];

// Register shared Modules globally
ModuleRegistry.registerModules(sharedModules);

let rowIdSequence = 100;
const createRowBlock = () =>
    ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    }));

const VueExample = defineComponent({
    /* html */
    template: `<div class="example-wrapper">

            <div class="inner-col">
                <div style="height: 100%;" class="inner-col">
                    <ag-grid-vue
                        style="height: 100%;"
                        :gridId="'Left'"
                        :defaultColDef="defaultColDef"
                        :rowData="leftRowData"
                        :columnDefs="columns"
                        :modules="leftModules"
                        @gridReady="onGridReady"
                        >
                    </ag-grid-vue>
                </div>
            </div>

            <div class="inner-col">
                <div style="height: 100%;" class="inner-col">
                    <ag-grid-vue
                        style="height: 100%;"
                        :gridId="'Right'"
                        :defaultColDef="defaultColDef"
                        :rowData="rightRowData"
                        :columnDefs="columns"
                        :modules="rightModules"
                        @gridReady="onGridReady"
                        >
                    </ag-grid-vue>
                </div>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            leftRowData: createRowBlock(),
            rightRowData: createRowBlock(),
            leftModules,
            rightModules,
            defaultColDef: <ColDef>{
                flex: 1,
                minWidth: 100,
                filter: true,
                floatingFilter: true,
            },
            columns: <ColDef[]>[{ field: 'id' }, { field: 'color' }, { field: 'value1' }],
            onGridReady: (event: GridReadyEvent) => {
                const api = event.api;
                const moduleNames: AgModuleName[] = [
                    'ClipboardModule',
                    'ClientSideRowModelModule',
                    'ColumnMenuModule',
                    'ContextMenuModule',
                    'CsvExportModule',
                    'ExcelExportModule',
                    'NumberFilterModule',
                    'SetFilterModule',
                    'TextFilterModule',
                    'IntegratedChartsModule', // Not registered in this example
                ];
                const registered = moduleNames.filter((name) => api.isModuleRegistered(name));
                console.log(api.getGridId(), 'registered:', registered.join(','));
            },
        };
    },
});

createApp(VueExample).mount('#app');
