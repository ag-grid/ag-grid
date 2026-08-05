import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

const myTheme = themeQuartz.withParams({
    sideBarBackgroundColor: '#08f3',
    sideButtonBarBackgroundColor: '#fff6',
    sideButtonBarTopPadding: 20,
    sideButtonSelectedUnderlineColor: 'orange',
    sideButtonTextColor: '#0009',
    sideButtonHoverBackgroundColor: '#fffa',
    sideButtonSelectedBackgroundColor: '#08f1',
    sideButtonHoverTextColor: '#000c',
    sideButtonSelectedTextColor: '#000e',
    sideButtonSelectedBorder: false,
});

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 170, enableRowGroup: true, enablePivot: true },
    { field: 'age', enableRowGroup: true, enablePivot: true },
    { field: 'country', enableRowGroup: true, enablePivot: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'date' },
    { field: 'sport', enableRowGroup: true, enablePivot: true },
    { field: 'gold', enableValue: true },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
    { field: 'total', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    theme: myTheme,
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        filter: true,
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
