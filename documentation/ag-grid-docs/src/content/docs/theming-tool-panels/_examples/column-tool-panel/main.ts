import type { GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi<IOlympicData>;

const myTheme = themeQuartz.withParams({
    columnSelectIndentSize: 40,
    columnDropCellBackgroundColor: 'purple',
    columnDropCellTextColor: 'white',
    columnDropCellDragHandleColor: 'white',
    columnDropCellBorder: { color: 'yellow', style: 'dashed', width: 2 },
});

const gridOptions: GridOptions<IOlympicData> = {
    theme: myTheme,
    columnDefs: [
        {
            headerName: 'Athlete',
            children: [
                { field: 'athlete', minWidth: 170, rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'age', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'country', enableRowGroup: true, enablePivot: true },
            ],
        },
        {
            headerName: 'Event',
            children: [
                { field: 'year', enableRowGroup: true, enablePivot: true },
                { field: 'date' },
                { field: 'sport', enableRowGroup: true, enablePivot: true },
            ],
        },
        {
            headerName: 'Medals',
            children: [
                { field: 'gold', enableValue: true },
                { field: 'silver', enableValue: true },
                { field: 'bronze', enableValue: true },
                { field: 'total', enableValue: true },
            ],
        },
    ],
    defaultColDef: {
        editable: true,
        filter: true,
    },
    sideBar: 'columns',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
