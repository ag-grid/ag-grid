import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, ToolbarModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnMenuModule,
    CsvExportModule,
    ColumnAutoSizeModule,
    ColumnApiModule,
    ContextMenuModule,
    ToolbarModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country', filter: 'agTextColumnFilter' },
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
            {
                key: 'sortFirstColumnDesc',
                icon: 'sortDescending',
                tooltip: 'Sort First Column Descending',
                action: (params) =>
                    params.api.applyColumnState({
                        state: [{ colId: 'athlete', sort: 'desc' }],
                        defaultState: { sort: null },
                    }),
            },
            'separator',
            {
                key: 'addFilter',
                icon: 'filter-add',
                tooltip: 'Add Filter',
                action: (params) =>
                    params.api.setFilterModel({
                        country: { filterType: 'text', type: 'contains', filter: 'Canada' },
                    }),
            },
            {
                key: 'clearFilters',
                icon: 'filterActive',
                tooltip: 'Clear All Filters',
                action: (params) => params.api.setFilterModel(null),
            },
            'separator',
            {
                key: 'showColumnChooser',
                icon: 'columns',
                tooltip: 'Open Column Chooser',
                action: (params) => params.api.showColumnChooser(),
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
