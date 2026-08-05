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
    ColumnMenuModule,
    ContextMenuModule,
    ClientSideRowModelModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'age', width: 90 },
    { field: 'country', width: 120 },
    { field: 'year', width: 90 },
    { field: 'date', width: 110 },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoSizeStrategy: {
        type: 'fitCellContents',
        scaleUpToFitGridWidth: true,
        applyToUiActions: true,
    },
};

function resetWidths() {
    gridApi!.setColumnWidths(columnDefs.map((colDef) => ({ key: colDef.field!, newWidth: 100 })));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
