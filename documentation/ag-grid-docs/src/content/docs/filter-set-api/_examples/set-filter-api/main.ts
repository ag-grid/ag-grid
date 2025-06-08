import type {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterHandler,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    NumberFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agSetColumnFilter',
        },
        {
            field: 'country',
            valueFormatter: (params: ValueFormatterParams) => {
                return `${params.value.name} (${params.value.code})`;
            },
            keyCreator: countryKeyCreator,
            filterParams: { valueFormatter: (params: ValueFormatterParams) => params.value.name } as ISetFilterParams,
        },
        { field: 'age', maxWidth: 120, filter: 'agNumberColumnFilter' },
        { field: 'year', maxWidth: 120 },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze', filter: 'agNumberColumnFilter' },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 160,
        filter: true,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered,
};

function countryKeyCreator(params: KeyCreatorParams) {
    return params.value.name;
}

function patchData(data: any[]) {
    // hack the data, replace each country with an object of country name and code
    data.forEach((row) => {
        const countryName = row.country;
        const countryCode = countryName.substring(0, 2).toUpperCase();
        row.country = {
            name: countryName,
            code: countryCode,
        };
    });
}

function selectJohnAndKenny() {
    gridApi!.setColumnFilterModel('athlete', { values: ['John Joe Nevin', 'Kenny Egan'] }).then(() => {
        gridApi!.onFilterChanged();
    });
}

function selectEverything() {
    gridApi!.setColumnFilterModel('athlete', null).then(() => {
        gridApi!.onFilterChanged();
    });
}

function selectNothing() {
    gridApi!.setColumnFilterModel('athlete', { values: [] }).then(() => {
        gridApi!.onFilterChanged();
    });
}

function setCountriesToFranceAustralia() {
    const handler = gridApi!.getColumnFilterHandler<SetFilterHandler<{ name: string; code: string }>>('country');
    handler!.setFilterValues([
        {
            name: 'France',
            code: 'FR',
        },
        {
            name: 'Australia',
            code: 'AU',
        },
    ]);
}

function setCountriesToAll() {
    const handler = gridApi!.getColumnFilterHandler<SetFilterHandler<{ name: string; code: string }>>('country');
    handler!.resetFilterValues();
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            patchData(data);
            gridApi!.setGridOption('rowData', data);
        });
});
