import type { ColDef, ColGroupDef, GridApi, GridOptions, HeaderClassParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ValidationModule /* Development Only */,
]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Athlete Details',
        headerStyle: { color: 'white', backgroundColor: 'cadetblue' },
        children: [
            {
                field: 'athlete',
                headerStyle: { color: 'white', backgroundColor: 'teal' },
            },
            { field: 'age', initialWidth: 120 },
            {
                field: 'country',
                headerStyle: (params: HeaderClassParams) => {
                    return {
                        color: 'white',
                        backgroundColor: params.floatingFilter ? 'cornflowerblue' : 'teal',
                    };
                },
            },
        ],
    },
    {
        field: 'sport',
        wrapHeaderText: true,
        autoHeaderHeight: true,
        headerName: 'The Sport the athlete participated in',
        headerClass: 'sport-header',
    },
    {
        headerName: 'Medal Details',
        headerStyle: (params) => {
            return {
                color: 'white',
                backgroundColor: params.columnGroup?.isExpanded() ? 'cornflowerblue' : 'orangered',
            };
        },
        children: [
            { field: 'bronze', columnGroupShow: 'open' },
            { field: 'silver', columnGroupShow: 'open' },
            { field: 'gold', columnGroupShow: 'open' },
            {
                columnGroupShow: 'closed',
                field: 'total',
            },
        ],
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        initialWidth: 200,

        floatingFilter: true,
        filter: true,
    },
    columnDefs: columnDefs,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => gridApi!.setGridOption('rowData', data));
});
