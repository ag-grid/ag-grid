import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnApiModule, ColumnAutoSizeModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }, { field: 'sport' }];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoSizeStrategy: {
        type: 'fitGridWidth',
    },
};

function onBtSortAthlete() {
    gridApi!.applyColumnState({
        state: [{ colId: 'athlete', sort: 'asc' }],
    });
}

function onBtClearAllSorting() {
    gridApi!.applyColumnState({
        defaultState: { sort: null },
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
