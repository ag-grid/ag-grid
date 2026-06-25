import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FirstDataRenderedEvent,
    GetFindTextParams,
    GridReadyEvent,
    ModuleRegistry,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import FindRenderer from './findRenderer';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <ag-grid-vue
        style="width: 100%; height: 100%;"
        @grid-ready="onGridReady"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :findSearchValue="findSearchValue"
        :toolbar="toolbar"
        @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        FindRenderer,
    },
    data() {
        return {
            findSearchValue: 'e',
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        };
    },
    methods: {
        onFirstDataRendered(event: FirstDataRenderedEvent) {
            event.api.findNext();
        },
        onGridReady(params: GridReadyEvent) {
            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => {
                    this.rowData = data;
                });
        },
    },
    setup() {
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete' },
            { field: 'country' },
            {
                field: 'year',
                cellRenderer: 'FindRenderer',
                getFindText: (params: GetFindTextParams) => {
                    const cellValue = params.getValueFormatted() ?? params.value?.toString();
                    if (!cellValue?.length) {
                        return null;
                    }
                    return `Year is ${cellValue}`;
                },
            },
        ]);
        const rowData = ref<any[]>(null);

        return {
            columnDefs,
            rowData,
        };
    },
});

createApp(VueExample).mount('#app');
