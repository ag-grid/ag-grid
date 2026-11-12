import type {
    ColDef,
    GridApi,
    GridOptions,
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
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

import { ROW_DATA, getSortModel, queryRows } from './data';

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

let gridApi: GridApi;

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

/** Shows each column's inferred type in its header, which is the point of the example. */
function headerValueGetter(params: HeaderValueGetterParams): string {
    const { headerName, cellDataType } = params.colDef ?? {};
    if (cellDataType === undefined) {
        return headerName ?? '';
    }
    return `${headerName} (${cellDataType === false ? 'not inferred yet' : cellDataType})`;
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

function getGridOptions(rowModel: RowModel): GridOptions {
    const gridOptions: GridOptions = {
        columnDefs: getColumnDefs(rowModel),
        defaultColDef: {
            flex: 1,
            minWidth: 170,
            filter: true,
            editable: true,
            headerValueGetter,
        },
        rowModelType: rowModel,
        // `filter: true` then uses the filter the inferred data type implies, rather than the Set Filter
        suppressSetFilterByDefault: true,
    };

    switch (rowModel) {
        case 'clientSide':
            gridOptions.rowData = ROW_DATA;
            break;
        case 'infinite':
            gridOptions.cacheBlockSize = BLOCK_SIZE;
            gridOptions.datasource = { getRows: getBlock };
            break;
        case 'serverSide':
            gridOptions.serverSideDatasource = { getRows: getGroupedRows };
            break;
        case 'viewport': {
            const viewport = createViewportDatasource();
            gridOptions.viewportDatasource = viewport.datasource;
            gridOptions.onFilterChanged = viewport.refresh;
            gridOptions.onSortChanged = viewport.refresh;
            break;
        }
    }

    return gridOptions;
}

function onRowModelChange(): void {
    const checked = document.querySelector<HTMLInputElement>('input[name="rowModel"]:checked')!;
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    // `rowModelType` is an initial-only option, so switching it recreates the grid
    gridApi.destroy();
    gridApi = createGrid(gridDiv, getGridOptions(checked.value as RowModel));
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, getGridOptions('clientSide'));
});
