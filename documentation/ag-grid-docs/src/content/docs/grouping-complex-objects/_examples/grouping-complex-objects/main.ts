import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    GridApi,
    GridOptions,
    KeyCreatorParams,
    ValueFormatterParams,
    ValueGetterParams,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
        { field: 'age' },
        {
            field: 'country',
            rowGroup: true,
            hide: true,
            valueFormatter: countryValueFormatter,
            valueGetter: countryValueGetter,
            keyCreator: countryKeyCreator,
        },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport', minWidth: 200 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
};

function countryValueFormatter(params: ValueFormatterParams) {
    if (!params.value) {
        return '';
    }
    return `[${params.value.code}] ${params.value.name}`;
}

function countryKeyCreator(params: KeyCreatorParams) {
    var countryObject = params.value;
    return countryObject.name;
}

function countryValueGetter(params: ValueGetterParams) {
    // hack the data  - replace the country with an object of country name and code
    var countryName = params.data.country;
    var countryCode = countryName.substring(0, 2).toUpperCase();
    return {
        name: countryName,
        code: countryCode,
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
