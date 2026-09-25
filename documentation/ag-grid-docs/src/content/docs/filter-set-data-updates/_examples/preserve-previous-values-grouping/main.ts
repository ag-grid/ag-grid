import type { GridApi, GridOptions, KeyCreatorParams, SetFilterHandler } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnMenuModule, SetFilterModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'city', hide: true }, { field: 'sales' }],
    autoGroupColumnDef: {
        field: 'city',
        minWidth: 250,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        filterParams: {
            treeList: true,
            keyCreator: (params: KeyCreatorParams) => (params.value ? params.value.join('#') : null),
            preservePreviousValues: true,
        },
    },
    groupDefaultExpanded: -1,
    rowData: getRowData(),
};

function getRowData() {
    return [
        { country: 'France', city: 'Paris', sales: 10 },
        { country: 'France', city: 'Lyon', sales: 20 },
        { country: 'Italy', city: 'Rome', sales: 30 },
        { country: 'Italy', city: 'Milan', sales: 40 },
    ];
}

function selectParisAndMadrid() {
    // 'Spain#Madrid' is not in the data, so it is listed by its key.
    gridApi!.setFilterModel({ 'ag-Grid-AutoColumn': { filterType: 'set', values: ['France#Paris', 'Spain#Madrid'] } });
}

function removeFrance() {
    gridApi!.setGridOption(
        'rowData',
        getRowData().filter((row) => row.country !== 'France')
    );
}

function removeRome() {
    gridApi!.setGridOption(
        'rowData',
        getRowData().filter((row) => row.city !== 'Rome')
    );
}

function restoreData() {
    gridApi!.setGridOption('rowData', getRowData());
}

function clearPreservedValues() {
    gridApi!.getColumnFilterHandler<SetFilterHandler>('ag-Grid-AutoColumn')!.clearPreservedValues();
}

function reset() {
    gridApi!.setFilterModel(null);
    restoreData();
    clearPreservedValues();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
