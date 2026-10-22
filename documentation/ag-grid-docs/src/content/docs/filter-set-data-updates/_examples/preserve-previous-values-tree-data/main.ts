import type { GridApi, GridOptions, KeyCreatorParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, SetFilterModule, TreeDataModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnMenuModule, SetFilterModule, TreeDataModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'size' }],
    autoGroupColumnDef: {
        headerName: 'File',
        minWidth: 250,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        filterParams: {
            treeList: true,
            keyCreator: (params: KeyCreatorParams) => (params.value ? params.value.join('/') : null),
            preservePreviousValues: true,
        },
    },
    treeData: true,
    getDataPath: (data) => data.path,
    groupDefaultExpanded: -1,
    rowData: getRowData(),
};

function getRowData() {
    return [
        { path: ['Documents'] },
        { path: ['Documents', 'report.pdf'], size: 120 },
        { path: ['Documents', 'notes.txt'], size: 4 },
        { path: ['Pictures'] },
        { path: ['Pictures', 'beach.jpg'], size: 2400 },
        { path: ['Pictures', 'city.jpg'], size: 1800 },
    ];
}

function selectReportAndArchive() {
    // 'Archive/old.zip' is not in the data, so it is listed by its key.
    gridApi!.setFilterModel({
        'ag-Grid-AutoColumn': { filterType: 'set', values: ['Documents/report.pdf', 'Archive/old.zip'] },
    });
}

function removeBeach() {
    gridApi!.setGridOption(
        'rowData',
        gridApi!.getGridOption('rowData')!.filter((row) => row.path[1] !== 'beach.jpg')
    );
}

function removeDocuments() {
    gridApi!.setGridOption(
        'rowData',
        gridApi!.getGridOption('rowData')!.filter((row) => row.path[0] !== 'Documents')
    );
}

function restoreData() {
    gridApi!.setGridOption('rowData', getRowData());
}

function clearPreservedValues() {
    gridApi!.doFilterAction({ colId: 'ag-Grid-AutoColumn', action: 'clearPreservedValues' });
}

function reset() {
    gridApi!.setFilterModel(null);
    gridApi!.setGridOption('rowData', getRowData());
    gridApi!.doFilterAction({ colId: 'ag-Grid-AutoColumn', action: 'clearPreservedValues' });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
