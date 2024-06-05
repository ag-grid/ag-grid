import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    GridApi,
    GridOptions,
    INumberFilterParams,
    ValueFormatterParams,
    createGrid,
} from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

import { getData } from './data';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

var numberValueFormatter = function (params: ValueFormatterParams) {
    return params.value.toFixed(2);
};

var saleFilterParams: INumberFilterParams = {
    allowedCharPattern: '\\d\\-\\,\\$',
    numberParser: (text: string | null) => {
        return text == null ? null : parseFloat(text.replace(',', '.').replace('$', ''));
    },
    numberFormatter: (value: number | null) => {
        return value == null ? null : value.toString().replace('.', ',');
    },
};

var saleValueFormatter = function (params: ValueFormatterParams) {
    var formatted = params.value.toFixed(2).replace('.', ',');

    if (formatted.indexOf('-') === 0) {
        return '-$' + formatted.slice(1);
    }

    return '$' + formatted;
};

const columnDefs: ColDef[] = [
    {
        field: 'sale',
        headerName: 'Sale ($)',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        valueFormatter: numberValueFormatter,
    },
    {
        field: 'sale',
        headerName: 'Sale',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        filterParams: saleFilterParams,
        valueFormatter: saleValueFormatter,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
