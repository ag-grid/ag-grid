import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    ISetFilterParams,
    KeyCreatorParams,
    ValueFormatterParams,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Country',
            field: 'country',
            valueFormatter: countryValueFormatter,
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter: countryValueFormatter,
                keyCreator: countryCodeKeyCreator,
            } as ISetFilterParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        floatingFilter: true,
        cellDataType: false,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered,
};

function countryCodeKeyCreator(params: KeyCreatorParams) {
    var countryObject = params.value;
    return countryObject.code;
}

function countryValueFormatter(params: ValueFormatterParams) {
    return params.value.name;
}

function printFilterModel() {
    var filterModel = gridApi!.getFilterModel();
    console.log(filterModel);
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // hack the data, replace each country with an object of country name and code.
            // also make country codes unique
            const uniqueCountryCodes: Map<string, string> = new Map();
            const newData: any[] = [];
            data.forEach(function (row: any) {
                const countryName = row.country;
                const countryCode = countryName.substring(0, 2).toUpperCase();
                const uniqueCountryName = uniqueCountryCodes.get(countryCode);
                if (!uniqueCountryName || uniqueCountryName === countryName) {
                    uniqueCountryCodes.set(countryCode, countryName);
                    row.country = {
                        name: countryName,
                        code: countryCode,
                    };
                    newData.push(row);
                }
            });

            gridApi!.setGridOption('rowData', newData);
        });
});
