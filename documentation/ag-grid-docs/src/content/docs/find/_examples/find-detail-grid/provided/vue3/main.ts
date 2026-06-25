import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindOptions,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    IDetailCellRendererParams,
    ModuleRegistry,
    RowApiModule,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule, MasterDetailModule, RowApiModule]);

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
    <ag-grid-vue
        style="width: 100%; height: 100%;"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :rowData="rowData"
        :masterDetail="true"
        :getRowId="getRowId"
        :detailCellRendererParams="detailCellRendererParams"
        :findOptions="findOptions"
        :toolbar="toolbar"
        @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
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
        getRowId(params: GetRowIdParams) {
            return params.data.a1;
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
