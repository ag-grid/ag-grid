import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, GridApi, GridOptions, INumberFilterParams, ValueGetterParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const originalColumnDefs: ColDef[] = [
    { field: 'athlete' },
    {
        field: 'age',
        maxWidth: 120,
        filter: 'agNumberColumnFilter',
        filterParams: {
            includeBlanksInEquals: false,
            includeBlanksInNotEqual: false,
            includeBlanksInLessThan: false,
            includeBlanksInGreaterThan: false,
            includeBlanksInRange: false,
        } as INumberFilterParams,
    },
    {
        headerName: 'Description',
        valueGetter: (params: ValueGetterParams) => `Age is ${params.data.age}`,
        minWidth: 340,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: originalColumnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: [
        {
            athlete: 'Alberto Gutierrez',
            age: 36,
        },
        {
            athlete: 'Niall Crosby',
            age: 40,
        },
        {
            athlete: 'Sean Landsman',
            age: null,
        },
        {
            athlete: 'Robert Clarke',
            age: undefined,
        },
    ],
};

function updateParams(toChange: string) {
    const value: boolean = (document.getElementById(`checkbox${toChange}`) as HTMLInputElement).checked;
    originalColumnDefs[1].filterParams[`includeBlanksIn${toChange}`] = value;

    gridApi!.setGridOption('columnDefs', originalColumnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
