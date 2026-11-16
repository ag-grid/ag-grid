import type { FirstDataRenderedEvent, GridApi, GridOptions, KeyCreatorParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, FiltersToolPanelModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnMenuModule,
    FiltersToolPanelModule,
    SetFilterModule,
    RowGroupingModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'city', hide: true }, { field: 'sales' }],
    autoGroupColumnDef: {
        headerName: 'City',
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
    sideBar: {
        toolPanels: [
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
                toolPanelParams: { suppressSyncLayoutWithGrid: true },
            },
        ],
        defaultToolPanel: 'filters',
    },
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function getRowData() {
    return [
        { country: 'Australia', city: 'Sydney', sales: 41 },
        { country: 'Australia', city: 'Melbourne', sales: 38 },
        { country: 'Australia', city: 'Perth', sales: 15 },
        { country: 'Brazil', city: 'Salvador', sales: 26 },
        { country: 'Brazil', city: 'Rio de Janeiro', sales: 29 },
        { country: 'Canada', city: 'Toronto', sales: 36 },
        { country: 'Canada', city: 'Vancouver', sales: 22 },
        { country: 'Canada', city: 'Montreal', sales: 19 },
        { country: 'France', city: 'Paris', sales: 52 },
        { country: 'France', city: 'Lyon', sales: 21 },
        { country: 'France', city: 'Marseille', sales: 17 },
        { country: 'Germany', city: 'Berlin', sales: 44 },
        { country: 'Germany', city: 'Munich', sales: 31 },
        { country: 'Germany', city: 'Hamburg', sales: 25 },
        { country: 'Italy', city: 'Rome', sales: 33 },
        { country: 'Italy', city: 'Milan', sales: 40 },
        { country: 'Italy', city: 'Naples', sales: 14 },
        { country: 'Japan', city: 'Tokyo', sales: 55 },
        { country: 'Japan', city: 'Osaka', sales: 27 },
        { country: 'Mexico', city: 'Mexico City', sales: 30 },
        { country: 'Mexico', city: 'Guadalajara', sales: 11 },
        { country: 'Netherlands', city: 'Amsterdam', sales: 28 },
        { country: 'Netherlands', city: 'Rotterdam', sales: 16 },
        { country: 'Portugal', city: 'Lisbon', sales: 23 },
        { country: 'Portugal', city: 'Porto', sales: 13 },
        { country: 'South Africa', city: 'Cape Town', sales: 20 },
        { country: 'South Africa', city: 'Johannesburg', sales: 26 },
        { country: 'Sweden', city: 'Stockholm', sales: 27 },
        { country: 'Sweden', city: 'Gothenburg', sales: 12 },
        { country: 'United Kingdom', city: 'London', sales: 50 },
        { country: 'United Kingdom', city: 'Manchester', sales: 24 },
        { country: 'United Kingdom', city: 'Edinburgh', sales: 18 },
        { country: 'United States', city: 'New York', sales: 58 },
        { country: 'United States', city: 'Chicago', sales: 32 },
        { country: 'United States', city: 'San Francisco', sales: 37 },
    ];
}

function selectParisAndMadrid() {
    // 'Spain#Madrid' is not in the data, so it is listed by its key.
    gridApi!.setFilterModel({ 'ag-Grid-AutoColumn': { filterType: 'set', values: ['France#Paris', 'Spain#Madrid'] } });
}

function removeRome() {
    gridApi!.setGridOption(
        'rowData',
        gridApi!.getGridOption('rowData')!.filter((row) => row.city !== 'Rome')
    );
}

function removeFrance() {
    gridApi!.setGridOption(
        'rowData',
        gridApi!.getGridOption('rowData')!.filter((row) => row.country !== 'France')
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

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    const filtersToolPanel = params.api.getToolPanelInstance('filters')!;
    // The Filters Tool Panel lists only primary columns unless given a layout.
    filtersToolPanel.setFilterLayout([{ colId: 'ag-Grid-AutoColumn' }]);
    filtersToolPanel.expandFilters(['ag-Grid-AutoColumn']);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
