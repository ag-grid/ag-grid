import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, INumberFilterParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    {
        field: 'age',
        maxWidth: 120,
        filter: 'agNumberColumnFilter',
        filterParams: {
            includeBlanksInEquals: false,
            includeBlanksInLessThan: false,
            includeBlanksInGreaterThan: false,
            includeBlanksInRange: false,
        } as INumberFilterParams,
    },
    {
        headerName: 'Description',
        valueGetter: '"Age is " + data.age',
        minWidth: 340,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
};

function changeNull(toChange: string, value: boolean) {
    switch (toChange) {
        case 'equals':
            columnDefs[1].filterParams.includeBlanksInEquals = value;
            break;
        case 'lessThan':
            columnDefs[1].filterParams.includeBlanksInLessThan = value;
            break;
        case 'greaterThan':
            columnDefs[1].filterParams.includeBlanksInGreaterThan = value;
            break;
        case 'inRange':
            columnDefs[1].filterParams.includeBlanksInRange = value;
            break;
    }

    var filterModel = gridApi!.getFilterModel();

    gridApi!.setGridOption('columnDefs', columnDefs);
    gridApi!.destroyFilter('age');
    gridApi!.setFilterModel(filterModel);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    gridApi!.setGridOption('rowData', [
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
    ]);
});
