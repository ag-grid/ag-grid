import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ColumnApiModule,
    ColumnAutoSizeModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoSizeStrategy: {
        type: 'fitCellContents',
        scaleUpToFitGridWidth: true,
        applyToUiActions: true,
    },
    getContextMenuItems: (params) => [...(params.defaultItems ?? []), 'autoSizeAll'],
};

function narrowColumns() {
    gridApi!.applyColumnState({
        state: ['athlete', 'country', 'sport', 'year', 'total'].map((colId) => ({ colId, width: 100 })),
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
