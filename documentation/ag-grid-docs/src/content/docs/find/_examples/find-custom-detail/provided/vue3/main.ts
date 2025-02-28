import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    type FindDetailCellRendererParams,
    FindOptions,
    FirstDataRenderedEvent,
    type GetFindMatchesParams,
    GridReadyEvent,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import DetailCellRenderer from './detailCellRenderer';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ValidationModule /* Development Only */,
]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <div class="example-wrapper">
        <div class="example-header">
            <div class="example-controls">
                <span>Find:</span>
                <input type="text" @input="onInput" @keydown="onKeyDown" />
                <button @click="previous()">Previous</button>
                <button @click="next()">Next</button>
                <span>{{activeMatchNum}}</span>
            </div>
            <div class="example-controls">
                <span>Go to match:</span>
                <input type="number" v-model="goTo" />
                <button @click="goToFind()">Go To</button>
            </div>
        </div>
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
            :findSearchValue="findSearchValue"
            @find-changed="onFindChanged"
            @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
    </div>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        DetailCellRenderer,
    },
    data() {
        return {
            goTo: undefined,
            gridApi: undefined,
            activeMatchNum: undefined,
            findSearchValue: undefined,
        };
    },
    methods: {
        onFindChanged(event: FindChangedEvent) {
            const { activeMatch, totalMatches, findSearchValue } = event;
            this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
        },
        onFirstDataRendered(event: FirstDataRenderedEvent) {
            event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
        },
        next() {
            this.gridApi.findNext();
        },
        previous() {
            this.gridApi.findPrevious();
        },
        goToFind() {
            const num = Number(this.goTo);
            if (isNaN(num) || num < 0) {
                return;
            }
            this.gridApi.findGoTo(num);
        },
        onInput(event: Event) {
            this.findSearchValue = (event.target as HTMLInputElement).value;
        },
        onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const backwards = event.shiftKey;
                if (backwards) {
                    this.previous();
                } else {
                    this.next();
                }
            }
        },
        onGridReady(params: GridReadyEvent) {
            this.gridApi = params.api;

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
