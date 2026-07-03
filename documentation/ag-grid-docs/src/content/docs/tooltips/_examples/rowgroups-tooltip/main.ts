import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
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
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TooltipModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

const columnDefs: ColDef[] = [
    {
        field: 'country',
        width: 120,
        rowGroup: true,
        hide: true,
        // inherited by group rows in the group column
        tooltipValueGetter: (params) => `Country: ${params.value}`,
    },
    {
        field: 'year',
        width: 90,
        rowGroup: true,
        hide: true,
        // inherited by group rows in the group column
        tooltipValueGetter: (params) => `Year: ${params.value}`,
    },
    { field: 'athlete', width: 200 },
    { field: 'age', width: 90 },
    { field: 'sport', width: 110 },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    autoGroupColumnDef: {
        headerTooltip: 'Group',
        minWidth: 190,
        // applies to leaf rows only; group rows inherit from their colDef
        tooltipValueGetter: (params) => `Athlete: ${params.value}`,
    },
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    tooltipShowDelay: 500,
    columnDefs: columnDefs,
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
