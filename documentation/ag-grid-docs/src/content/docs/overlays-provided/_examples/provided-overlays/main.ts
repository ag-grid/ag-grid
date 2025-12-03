import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    CsvExportModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    loading: true,
    defaultColDef: {
        filter: true,
    },
    columnDefs: [{ field: 'athlete' }, { field: 'country' }],
};

function setLoading(value: boolean) {
    gridApi!.setGridOption('loading', value);
}

function onBtnClearRowData() {
    gridApi!.setGridOption('rowData', []);
}

function onBtnSetRowData() {
    gridApi!.setGridOption('rowData', [
        { athlete: 'Michael Phelps', country: 'US' },
        { athlete: 'Chris Hoy', country: 'UK' },
    ]);
}

function onBtnSetFilter() {
    onBtnSetRowData();
    gridApi!.setFilterModel({ country: { filterType: 'text', type: 'equals', filter: 'Spain' } });
}

function onBtnClearFilter() {
    gridApi!.setFilterModel(null);
}

function onCsvExport() {
    gridApi!.exportDataAsCsv();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
