import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, ISetFilterParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

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
