import { Grid,GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {field: 'athlete', minWidth: 200},
        {field: 'age'},
        {field: 'country', minWidth: 200},
    ],
} 

function onBtSetLoading(loading: boolean) {
    gridOptions.api!.setLoading(loading)
}

function reloadData(){
    gridOptions.api!.setLoading(true);
    gridOptions.api!.setRowData([]);
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then(response => response.json())
    .then((data: IOlympicData[]) => {
        // Artificial delay to simulate async loading
        setTimeout(() => {
          gridOptions.api!.setLoading(false)
          gridOptions.api!.setRowData(data)
        }, 2000)
      })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)
    reloadData();    
})
