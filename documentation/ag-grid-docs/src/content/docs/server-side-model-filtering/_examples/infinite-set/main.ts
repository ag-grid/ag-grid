import {
    ColDef,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    ISetFilter,
    KeyCreatorParams,
    SetFilterValuesFuncParams,
    ValueFormatterParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([MenuModule, ServerSideRowModelModule, SetFilterModule]);

const columnDefs: ColDef[] = [
    {
        field: 'country',
        filter: 'agSetColumnFilter',
        valueFormatter: countryValueFormatter,
        filterParams: {
            values: getCountryValuesAsync,
            keyCreator: countryCodeKeyCreator,
            valueFormatter: countryValueFormatter,
            comparator: countryComparator,
        },
    },
    {
        field: 'sport',
        filter: 'agSetColumnFilter',
        filterParams: {
            values: getSportValuesAsync,
        },
    },
    { field: 'athlete' },
];

function countryCodeKeyCreator(params: KeyCreatorParams): string {
    return params.value.code;
}

function countryValueFormatter(params: ValueFormatterParams): string {
    return params.value.name;
}

function countryComparator(a: { name: string; code: string }, b: { name: string; code: string }): number {
    // for complex objects, need to provide a comparator to choose what to sort by
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    }
    return 0;
}

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
    },
    // use the server-side row model
    rowModelType: 'serverSide',

    // fetch 100 rows at a time
    cacheBlockSize: 100,

    // only keep 10 blocks of rows
    maxBlocksInCache: 10,

    onFilterChanged: onFilterChanged,
};

var fakeServer: any;
var selectedCountries: string[] | null = null;

function onFilterChanged() {
    var countryFilterModel = gridApi!.getFilterModel()['country'];
    var selected = countryFilterModel && countryFilterModel.values;

    if (!areEqual(selectedCountries, selected)) {
        selectedCountries = selected;

        console.log('Refreshing sports filter');
        gridApi!.getColumnFilterInstance<ISetFilter>('sport').then((sportFilter) => {
            sportFilter!.refreshFilterValues();
        });
    }
}

function areEqual(a: null | string[], b: null | string[]) {
    if (a == null && b == null) {
        return true;
    }
    if (a != null || b != null) {
        return false;
    }

    return (
        a!.length === b!.length &&
        a!.every(function (v, i) {
            return b![i] === v;
        })
    );
}

function getCountryValuesAsync(params: SetFilterValuesFuncParams) {
    var countries = fakeServer.getCountries();

    // simulating real server call with a 500ms delay
    setTimeout(() => {
        params.success(countries);
    }, 500);
}

function getSportValuesAsync(params: SetFilterValuesFuncParams) {
    var sports = fakeServer.getSports(selectedCountries);

    // simulating real server call with a 500ms delay
    setTimeout(() => {
        params.success(sports);
    }, 500);
}

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

            // simulating real server call with a 500ms delay
            setTimeout(() => {
                if (response.success) {
                    // supply rows for requested block to grid
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                } else {
                    params.fail();
                }
            }, 500);
        },
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // we don't have unique codes in our dataset, so generate unique ones
            const namesToCodes: Map<string, string> = new Map();
            const codesToNames: Map<string, string> = new Map();
            data.forEach((row: any) => {
                row.countryName = row.country;
                if (namesToCodes.has(row.countryName)) {
                    row.countryCode = namesToCodes.get(row.countryName);
                } else {
                    row.countryCode = row.country.substring(0, 2).toUpperCase();
                    if (codesToNames.has(row.countryCode)) {
                        let num = 0;
                        do {
                            row.countryCode = `${row.countryCode[0]}${num++}`;
                        } while (codesToNames.has(row.countryCode));
                    }
                    codesToNames.set(row.countryCode, row.countryName);
                    namesToCodes.set(row.countryName, row.countryCode);
                }
                delete row.country;
            });
            // setup the fake server with entire dataset
            fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            var datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
