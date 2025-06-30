import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ModuleRegistry,
    ValidationModule,
    createGrid,
    themeAlpine,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    AllEnterpriseModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
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
    columnDefs,
};

function useTheme(theme: string, isDark: boolean) {
    let themePart;
    switch (theme) {
        case 'quartz':
            themePart = themeQuartz;
            break;
        case 'alpine':
            themePart = themeAlpine;
            break;
        case 'balham':
            themePart = themeBalham;
            break;
        case 'material':
            themePart = themeMaterial;
            break;
    }
    const gridDiv = document.getElementById('myGrid')!;
    if (isDark) {
        gridDiv.setAttribute('data-ag-theme-mode', 'dark');
    } else {
        gridDiv.removeAttribute('data-ag-theme-mode');
    }
    gridApi.setGridOption('theme', themePart);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
