import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, ISetFilterParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

import { CustomTooltip } from './customTooltip';
import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'colA',
            tooltipField: 'colA',
            filter: 'agSetColumnFilter',
        },
        {
            field: 'colB',
            tooltipField: 'colB',
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            } as ISetFilterParams,
        },
        {
            field: 'colC',
            tooltipField: 'colC',
            tooltipComponent: CustomTooltip,
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            } as ISetFilterParams,
        },
    ],
    sideBar: 'filters',
    defaultColDef: {
        flex: 1,
    },
    tooltipShowDelay: 100,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
