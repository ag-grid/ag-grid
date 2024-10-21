import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, ISetFilterParams, SetFilterValuesFuncParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

var filterParams: ISetFilterParams = {
    values: (params: SetFilterValuesFuncParams) => {
        setTimeout(() => {
            params.success(['value 1', 'value 2']);
        }, 3000);
    },
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: [
        { value: 'value 1' },
        { value: 'value 1' },
        { value: 'value 1' },
        { value: 'value 1' },
        { value: 'value 2' },
        { value: 'value 2' },
        { value: 'value 2' },
        { value: 'value 2' },
        { value: 'value 2' },
    ],
    columnDefs: [
        {
            headerName: 'Set filter column',
            field: 'value',
            filter: 'agSetColumnFilter',
            floatingFilter: true,
            filterParams: filterParams,
            minWidth: 250,
        },
    ],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
