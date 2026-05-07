import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ContextMenuModule, ToolbarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    CsvExportModule,
    ColumnAutoSizeModule,
    ColumnApiModule,
    ContextMenuModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        minWidth: 100,
        filter: true,
    },
    toolbar: {
        items: [
            {
                key: 'sizeColumnsToFit',
                icon: 'maximize',
                tooltip: 'Size Columns to Fit',
                action: (params) => params.api.sizeColumnsToFit(),
            },
            'separator',
            {
                key: 'autoSizeAll',
                icon: 'minimize',
                tooltip: 'Auto-size All Columns',
                action: (params) => params.api.autoSizeAllColumns(),
            },
            'separator',
            {
                key: 'sortFirstColumnAsc',
                icon: 'sortAscending',
                tooltip: 'Sort First Column Ascending',
                action: (params) =>
                    params.api.applyColumnState({
                        state: [{ colId: 'athlete', sort: 'asc' }],
                        defaultState: { sort: null },
                    }),
            },
            'separator',
            {
                key: 'resetFilters',
                icon: 'clipboardCut',
                tooltip: 'Reset All Filters',
                action: (params) => params.api.setFilterModel(null),
            },
            'separator',
            {
                key: 'resetColumns',
                icon: 'columns',
                tooltip: 'Reset Column State',
                action: (params) => params.api.resetColumnState(),
            },
        ],
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
