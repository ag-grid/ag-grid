import type { ColDef, GridApi, GridOptions, ITextFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        filterParams: {
            filterOptions: ['contains', 'notContains'],
            maxNumConditions: 1,
        } as ITextFilterParams,
    },
    {
        field: 'country',
        filterParams: {
            filterOptions: ['contains'],
        } as ITextFilterParams,
    },
    {
        field: 'sport',
        filterParams: {
            defaultOption: 'startsWith',
        } as ITextFilterParams,
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    columnDefs,
    rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
