import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const myTheme = themeQuartz.withParams({
    inputBorder: { color: 'orange', style: 'dotted', width: 3 },
    inputBackgroundColor: 'rgb(255, 209, 123)',
    inputPlaceholderTextColor: 'rgb(155, 101, 1)',
    inputIconColor: 'purple',
    inputTextColor: 'black',
    // Cell Editors
    inputInvalidBackgroundColor: 'purple',
    inputInvalidBorder: 'darkred',
    inputInvalidTextColor: 'white',
});

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 170 },
    { field: 'age', headerName: 'Age (< 20)', cellEditorParams: { max: 20 } },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    theme: myTheme,
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
    },
    sideBar: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
