import { Grid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions = {
    columnDefs: [
      { field: 'country', rowGroup: true },
      { field: 'athlete' },
    ],
    autoGroupColumnDef: {
        cellRendererSelector: (params) => {
            if (['Australia', 'Norway'].includes(params.node.key!)) {
                return; // use Default Cell Renderer
            }
            return { component: 'agGroupCellRenderer' };
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)
  
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then(response => response.json())
      .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
});
