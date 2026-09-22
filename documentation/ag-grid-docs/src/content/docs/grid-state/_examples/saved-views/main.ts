import type { GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { savedStates } from './savedStates';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    gridId: 'savedViews',
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { field: 'country', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'year' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        enableRowGroup: true,
        enableValue: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    rowGroupPanelShow: 'always',
    sideBar: 'columns',
};

function applyView(viewName: string) {
    const state = savedStates[viewName];
    gridApi.setState(state);
    console.log(`Applied view "${viewName}"`, state);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
