import type { GridApi } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { gridOptions, type IOlympicData } from './gridOptions';

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi;

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
