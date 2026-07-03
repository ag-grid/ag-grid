import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    type FindDetailCellRendererParams,
    FindOptions,
    FirstDataRenderedEvent,
    type GetFindMatchesParams,
    GridReadyEvent,
    ModuleRegistry,
    RowApiModule,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import DetailCellRenderer from './detailCellRenderer';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule, MasterDetailModule, RowApiModule]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <ag-grid-vue
        style="width: 100%; height: 100%;"
        @grid-ready="onGridReady"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :masterDetail="true"
        :detailCellRenderer="detailCellRenderer"
        :detailCellRendererParams="detailCellRendererParams"
        :detailRowHeight="100"
        :findOptions="findOptions"
        :toolbar="toolbar"
        @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        DetailCellRenderer,
    },
    data() {
        return {
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        };
    },
    methods: {
        onFirstDataRendered(event: FirstDataRenderedEvent) {
            event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
        },
        onGridReady(params: GridReadyEvent) {
            fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
                .then((resp) => resp.json())
                .then((data) => {
                    this.rowData = data;
                });
        },
    },
    setup() {
        const columnDefs = ref<ColDef[]>([
            // group cell renderer needed for expand / collapse icons
            { field: 'name', cellRenderer: 'agGroupCellRenderer' },
            { field: 'account' },
            { field: 'calls' },
        ]);
        const rowData = ref<any[]>(null);
        const findOptions = ref<FindOptions>({
            searchDetail: true,
        });
        const detailCellRenderer = ref('DetailCellRenderer');
        const detailCellRendererParams = ref<FindDetailCellRendererParams>({
            getFindMatches: (params: GetFindMatchesParams) => {
                return params.getMatchesForValue('My Custom Detail');
            },
        });

        return {
            columnDefs,
            rowData,
            detailCellRenderer,
            detailCellRendererParams,
            findOptions,
        };
    },
});

createApp(VueExample).mount('#app');
