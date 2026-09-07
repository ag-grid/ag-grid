import type { GridApi, GridOptions, ISetFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TooltipModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import { CustomTooltip } from './customTooltip';
import { getData } from './data';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TooltipModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'colA',
            tooltip: true,
            filter: 'agSetColumnFilter',
        },
        {
            field: 'colB',
            tooltip: true,
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            } as ISetFilterParams,
        },
        {
            field: 'colC',
            tooltip: true,
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
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
