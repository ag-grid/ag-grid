import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    ISetFilter,
    ISetFilterParams,
    SetFilterValuesFuncParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

var list1 = ['Elephant', 'Lion', 'Monkey'];
var list2 = ['Elephant', 'Giraffe', 'Tiger'];

var valuesArray = list1.slice();
var valuesCallbackList = list1;

function valuesCallback(params: SetFilterValuesFuncParams) {
    setTimeout(() => {
        params.success(valuesCallbackList);
    }, 1000);
}

var arrayFilterParams: ISetFilterParams = {
    values: valuesArray,
};

var callbackFilterParams: ISetFilterParams = {
    values: valuesCallback,
    refreshValuesOnOpen: true,
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            colId: 'array',
            headerName: 'Values Array',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: arrayFilterParams,
        },
        {
            colId: 'callback',
            headerName: 'Values Callback',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: callbackFilterParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    sideBar: 'filters',
    rowData: getData(),
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.getToolPanelInstance('filters')!.expandFilters();
}

function useList1() {
    console.log('Updating values to ' + list1);
    valuesArray.length = 0;
    list1.forEach((value) => {
        valuesArray.push(value);
    });

    gridApi!.getColumnFilterInstance<ISetFilter>('array').then((filter) => {
        filter!.refreshFilterValues();

        valuesCallbackList = list1;
    });
}

function useList2() {
    console.log('Updating values to ' + list2);
    valuesArray.length = 0;
    list2.forEach((value) => {
        valuesArray.push(value);
    });

    gridApi!.getColumnFilterInstance<ISetFilter>('array').then((filter) => {
        filter!.refreshFilterValues();

        valuesCallbackList = list2;
    })!;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
