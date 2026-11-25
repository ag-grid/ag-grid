import type { ColDef, GridApi, GridOptions, TooltipCallbackParams, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    TextFilterModule,
    TooltipModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

import { CustomTooltip } from './customTooltip_typescript';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PaginationModule,
    TextFilterModule,
    TooltipModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        filter: 'agTextColumnFilter',
        tooltip: true,
        headerTooltip: true,
    },
    { field: 'country', tooltip: 'The country the athlete represents', headerTooltip: "The athlete's nationality" },
    { field: 'year', tooltip: ({ value }: TooltipCallbackParams) => `Games held in ${value}` },
    {
        field: 'total',
        headerName: 'Total Medals',
        valueFormatter: ({ value }: ValueFormatterParams) => `${value} medals`,
        tooltip: true,
        headerTooltip: ({ value }: TooltipCallbackParams) => `Column: ${value}`,
        tooltipComponent: CustomTooltip,
        tooltipComponentParams: { color: '#55AA77' },
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    columnDefs: columnDefs,
    tooltipTrigger: 'hoverOrFocus',
    tooltipShowMode: 'standard',
    tooltipShowDelay: 500,
    tooltipSwitchShowDelay: 0,
    pagination: true,
    paginationPageSize: 5,
    paginationPageSizeSelector: false,
    sideBar: { toolPanels: ['columns'] },
    suppressMenuHide: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});
