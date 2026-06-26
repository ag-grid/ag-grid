import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    GridReadyEvent,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    FindModule,
    ToolbarModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    PaginationModule,
]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <div class="example-wrapper">
        <div class="example-header">
            <div class="example-controls">
                <label>
                    <span>caseSensitive:</span>
                    <input type="checkbox" @change="toggleCaseSensitive" checked>
                </label>
                <label>
                    <span>currentPageOnly:</span>
                    <input type="checkbox" @change="toggleCurrentPageOnly" checked>
                </label>
            </div>
            <div class="example-controls">
                <span>Go to match:</span>
                <input type="number" v-model="goTo" />
                <button @click="goToFind()">Go To</button>
            </div>
            <div>{{ activeMatch }}</div>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            @grid-ready="onGridReady"
            :pinnedTopRowData="pinnedTopRowData"
            :pinnedBottomRowData="pinnedBottomRowData"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="paginationPageSize"
            :paginationPageSizeSelector="paginationPageSizeSelector"
            :toolbar="toolbar"
            :findOptions="findOptions"
            :rowData="rowData"
            @find-changed="onFindChanged"></ag-grid-vue>
    </div>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data() {
        return {
            goTo: undefined,
            gridApi: undefined,
            activeMatch: undefined,
            toolbar: {
                items: ['agRowGroupPanelToolbarItem', 'agFindToolbarItem'],
            },
            findOptions: {
                caseSensitive: true,
                currentPageOnly: true,
            },
        };
    },
    methods: {
        onFindChanged(event: FindChangedEvent) {
            const { activeMatch } = event;
            this.activeMatch = activeMatch
                ? `Active match: { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column?.getColId()}, match number in cell: ${activeMatch.numInMatch} }`
                : '';
        },
        goToFind() {
            const num = Number(this.goTo);
            if (isNaN(num) || num < 0) {
                return;
            }
            this.gridApi.findGoTo(num);
        },
        onGridReady(params: GridReadyEvent) {
            this.gridApi = params.api;

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => {
                    this.rowData = data;
                });
        },
        toggleCaseSensitive(event: Event) {
            const caseSensitive = (event.target as HTMLInputElement).checked;
            this.findOptions = {
                ...this.findOptions,
                caseSensitive,
            };
        },
        toggleCurrentPageOnly(event: Event) {
            const currentPageOnly = (event.target as HTMLInputElement).checked;
            this.findOptions = {
                ...this.findOptions,
                currentPageOnly,
            };
        },
    },
    setup() {
        const pinnedTopRowData = ref<any[]>([{ athlete: 'Top' }]);
        const pinnedBottomRowData = ref<any[]>([{ athlete: 'Bottom' }]);
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete' },
            { field: 'country' },
            { field: 'sport', rowGroup: true, hide: true },
            { field: 'year' },
            { field: 'age', minWidth: 100 },
            { field: 'gold', minWidth: 100 },
            { field: 'silver', minWidth: 100 },
            { field: 'bronze', minWidth: 100 },
        ]);
        const defaultColDef = ref<ColDef>({
            enableRowGroup: true,
        });
        const paginationPageSize = ref(5);
        const paginationPageSizeSelector = ref<number[] | boolean>([5, 10]);
        const rowData = ref<any[]>(null);

        return {
            pinnedTopRowData,
            pinnedBottomRowData,
            columnDefs,
            defaultColDef,
            paginationPageSize,
            paginationPageSizeSelector,
            rowData,
        };
    },
});

createApp(VueExample).mount('#app');
