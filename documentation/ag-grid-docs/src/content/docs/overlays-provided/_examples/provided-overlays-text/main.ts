import type { GridApi, GridOptions, OverlayComponentUserParams } from 'ag-grid-community';
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
    CsvExportModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

let gridApi: GridApi<IAthlete>;

const overlayComponentParams: OverlayComponentUserParams = {
    loading: { overlayText: 'Please wait while your data is loading...' },
    noRows: { overlayText: 'This grid has no data!' },
    noMatchingRows: { overlayText: 'Current Filter Matches No Rows' },
    exporting: { overlayText: 'Exporting your data...' },
};

const gridOptions: GridOptions<IAthlete> = {
    loading: true,
    defaultColDef: {
        filter: true,
    },
    columnDefs: [{ field: 'athlete' }, { field: 'country' }],
    overlayComponentParams,
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
    gridApi!.setGridOption('rowData', [
        { athlete: 'Michael Phelps', country: 'US' },
        { athlete: 'Chris Hoy', country: 'UK' },
    ]);
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
