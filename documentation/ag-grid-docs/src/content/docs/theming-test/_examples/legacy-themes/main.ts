import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
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
    theme: 'legacy',
};

function useTheme(theme: string, isDark: boolean) {
    const themeClass = `ag-theme-${theme}${isDark ? '-dark' : ''}`;
    document.getElementById('myGrid')!.className = themeClass;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
