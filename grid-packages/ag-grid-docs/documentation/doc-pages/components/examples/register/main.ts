import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import {MedalRenderer} from './medalRendererComponent_typescript';

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
        medalRenderer: MedalRenderer
    }
}

// setup the grid
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then(response => response.json())
      .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
