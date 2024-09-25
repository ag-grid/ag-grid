import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, ISetFilterParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, FiltersToolPanelModule, MenuModule, SetFilterModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Default',
            field: 'animal',
            filter: 'agSetColumnFilter',
        },
        {
            headerName: 'Excel (Windows)',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                excelMode: 'windows',
            } as ISetFilterParams,
        },
        {
            headerName: 'Excel (Mac)',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                excelMode: 'mac',
            } as ISetFilterParams,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
    },
    sideBar: 'filters',
    rowData: getData(),
    localeText: {
        applyFilter: 'OK',
        cancelFilter: 'Cancel',
        resetFilter: 'Clear Filter',
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
