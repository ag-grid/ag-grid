import { createApp, defineComponent, ref } from 'vue';

import type {
    ColDef,
    HeaderValueGetterParams,
    IGetRowsParams,
    IServerSideGetRowsParams,
    IViewportDatasource,
    IViewportDatasourceParams,
} from 'ag-grid-community';
import {
    CheckboxEditorModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    DateEditorModule,
    DateFilterModule,
    InfiniteRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { ROW_DATA, getSortModel, queryRows } from './data';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ColumnApiModule,
    CheckboxEditorModule,
    DateEditorModule,
    DateFilterModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    ServerSideRowModelModule,
    ViewportRowModelModule,
    RowGroupingModule,
]);

type RowModel = 'clientSide' | 'infinite' | 'serverSide' | 'viewport';

const BLOCK_SIZE = 4;

/** Serves the block asked for, from the rows left by the filter and sort the grid passed on. */
function getBlock(params: IGetRowsParams): void {
    const rows = queryRows(params.filterModel, params.sortModel);
    setTimeout(() => params.successCallback(rows.slice(params.startRow, params.endRow), rows.length), 200);
}

/**
 * Groups the rows by `dateStr`: the first request returns group rows, which carry only the group key,
 * and expanding a group returns the leaf rows under it.
 */
function getGroupedRows(params: IServerSideGetRowsParams): void {
    const { groupKeys, filterModel, sortModel } = params.request;
    const leaves = queryRows(filterModel as Record<string, any>, sortModel);
    const rows = groupKeys.length
        ? leaves.filter(({ dateStr }) => dateStr === groupKeys[0])
        : [...new Set(leaves.map(({ dateStr }) => dateStr))].map((dateStr) => ({ dateStr }));

    setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 200);
}

/**
 * The viewport datasource is given no filter or sort hook, so the grid's own filter and sort events
 * tell it to push the matching rows again.
 */
function createViewportDatasource(): { datasource: IViewportDatasource; refresh: () => void } {
    let params: IViewportDatasourceParams | undefined;

    const push = () => {
        if (!params) {
            return;
        }
        const rows = queryRows(params.api.getFilterModel(), getSortModel(params.api));
        params.setRowCount(rows.length);
        setTimeout(() => {
            const byIndex: Record<number, any> = {};
            rows.forEach((row, index) => (byIndex[index] = row));
            params!.setRowData(byIndex);
        }, 200);
    };

    return {
        datasource: {
            init: (viewportParams) => {
                params = viewportParams;
                push();
            },
            setViewportRange: () => {},
        },
        refresh: push,
    };
}

/** No column declares `cellDataType`, so every type is inferred from the data. */
function getColumnDefs(rowModel: RowModel): ColDef[] {
    // The Server-Side Row Model groups by `dateStr`, so inference there waits for the leaf rows
    const grouped: ColDef = rowModel === 'serverSide' ? { rowGroup: true, hide: true } : {};
    return [
        { field: 'athlete', headerName: 'Athlete' },
        { field: 'age', headerName: 'Age' },
        { field: 'date', headerName: 'Date' },
        { field: 'dateStr', headerName: 'Date (String)', ...grouped },
        { field: 'hasGold', headerName: 'Gold' },
    ];
}

/** Shows each column's inferred type in its header, which is the point of the example. */
function headerValueGetter(params: HeaderValueGetterParams): string {
    const { headerName, cellDataType } = params.colDef ?? {};
    if (cellDataType === undefined) {
        return headerName ?? '';
    }
    return `${headerName} (${cellDataType === false ? 'not inferred yet' : cellDataType})`;
}

const VueExample = defineComponent({
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <span>Row model:</span>
                <label v-for="option in rowModels" :key="option.value">
                    <input
                        type="radio"
                        name="rowModel"
                        :value="option.value"
                        :checked="rowModel === option.value"
                        @change="onRowModelChange(option.value)"
                    /> {{ option.label }}
                </label>
            </div>
            <div id="myGrid">
                <ag-grid-vue
                    v-if="gridVisible"
                    style="width: 100%; height: 100%;"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :rowModelType="rowModel"
                    :suppressSetFilterByDefault="true"
                    :rowData="rowData"
                    :cacheBlockSize="cacheBlockSize"
                    :datasource="datasource"
                    :serverSideDatasource="serverSideDatasource"
                    :viewportDatasource="viewportDatasource"
                    @filter-changed="onFilterOrSortChanged"
                    @sort-changed="onFilterOrSortChanged"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const rowModel = ref<RowModel>('clientSide');
        const gridVisible = ref(true);

        const columnDefs = ref<ColDef[]>(getColumnDefs('clientSide'));
        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 170,
            filter: true,
            editable: true,
            headerValueGetter,
        });

        const rowModels = [
            { value: 'clientSide', label: 'Client-Side' },
            { value: 'infinite', label: 'Infinite' },
            { value: 'serverSide', label: 'Server-Side' },
            { value: 'viewport', label: 'Viewport' },
        ];

        const rowData = ref<any[] | undefined>(ROW_DATA);
        const cacheBlockSize = ref<number | undefined>(undefined);
        const datasource = ref<any>(undefined);
        const serverSideDatasource = ref<any>(undefined);
        const viewportDatasource = ref<any>(undefined);
        let refreshViewport: () => void = () => {};

        // `rowModelType` is an initial-only option, so switching it recreates the grid
        const onRowModelChange = (next: RowModel) => {
            gridVisible.value = false;
            rowModel.value = next;
            columnDefs.value = getColumnDefs(next);
            rowData.value = undefined;
            cacheBlockSize.value = undefined;
            datasource.value = undefined;
            serverSideDatasource.value = undefined;
            viewportDatasource.value = undefined;

            switch (next) {
                case 'clientSide':
                    rowData.value = ROW_DATA;
                    break;
                case 'infinite':
                    cacheBlockSize.value = BLOCK_SIZE;
                    datasource.value = { getRows: getBlock };
                    break;
                case 'serverSide':
                    serverSideDatasource.value = { getRows: getGroupedRows };
                    break;
                case 'viewport': {
                    const viewport = createViewportDatasource();
                    viewportDatasource.value = viewport.datasource;
                    refreshViewport = viewport.refresh;
                    break;
                }
            }

            setTimeout(() => {
                gridVisible.value = true;
            });
        };

        return {
            rowModel,
            rowModels,
            gridVisible,
            columnDefs,
            defaultColDef,
            rowData,
            cacheBlockSize,
            datasource,
            serverSideDatasource,
            viewportDatasource,
            onRowModelChange,
            onFilterOrSortChanged: () => refreshViewport(),
        };
    },
});

createApp(VueExample).mount('#app');
