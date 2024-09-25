import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import { MedalRenderer } from './medalRendererComponent_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Component By Name',
            field: 'country',
            cellRenderer: 'medalRenderer',
        },
        {
            headerName: 'Component By Direct Reference',
            field: 'country',
            cellRenderer: MedalRenderer,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    components: {
        medalRenderer: MedalRenderer,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
