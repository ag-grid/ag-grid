import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindOptions,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    GridReadyEvent,
    IDetailCellRendererParams,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function getFindMatches(params: GetFindMatchesParams) {
    const getMatchesForValue = params.getMatchesForValue;
    let numMatches = 0;
    const checkRow = (row: any) => {
        for (const key of Object.keys(row)) {
            if (key === 'children') {
                row.children.forEach((child: any) => checkRow(child));
            } else {
                numMatches += getMatchesForValue(row[key]);
            }
        }
    };
    params.data.children.forEach(checkRow);
    return numMatches;
}

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
            :defaultColDef="defaultColDef"
            :rowData="rowData"
            :masterDetail="true"
            :getRowId="getRowId"
            :detailCellRendererParams="detailCellRendererParams"
            :findOptions="findOptions"
            :findSearchValue="findSearchValue"
            @find-changed="onFindChanged"
            @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
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
        getRowId(params: GetRowIdParams) {
            return params.data.a1;
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
        },
    },
    setup() {
        const columnDefs = ref<ColDef[]>([{ field: 'a1', cellRenderer: 'agGroupCellRenderer' }, { field: 'b1' }]);
        const defaultColDef = ref<ColDef>({ flex: 1 });
        const rowData = ref<any[]>(getData());
        const findOptions = ref<FindOptions>({
            searchDetail: true,
        });
        const detailCellRendererParams = ref<Partial<IDetailCellRendererParams>>({
            // level 2 grid options
            detailGridOptions: {
                columnDefs: [{ field: 'a2', cellRenderer: 'agGroupCellRenderer' }, { field: 'b2' }],
                defaultColDef: {
                    flex: 1,
                },
                masterDetail: true,
                detailRowHeight: 240,
                getRowId: (params: GetRowIdParams) => params.data.a2,
                findOptions: {
                    searchDetail: true,
                },
                detailCellRendererParams: {
                    // level 3 grid options
                    detailGridOptions: {
                        columnDefs: [{ field: 'a3', cellRenderer: 'agGroupCellRenderer' }, { field: 'b3' }],
                        defaultColDef: {
                            flex: 1,
                        },
                        getRowId: (params: GetRowIdParams) => params.data.a3,
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) => {
                        params.successCallback(params.data.children);
                    },
                    getFindMatches,
                } as IDetailCellRendererParams,
            },
            getDetailRowData: (params: GetDetailRowDataParams) => {
                params.successCallback(params.data.children);
            },
            getFindMatches,
        });

        return {
            columnDefs,
            defaultColDef,
            rowData,
            findOptions,
            detailCellRendererParams,
        };
    },
});

createApp(VueExample).mount('#app');
