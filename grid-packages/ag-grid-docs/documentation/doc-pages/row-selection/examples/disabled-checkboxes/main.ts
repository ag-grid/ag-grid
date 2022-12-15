import { Grid, GridOptions, FirstDataRenderedEvent, IRowNode } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'athlete',
      headerCheckboxSelection: true,      
      checkboxSelection: true,
      showDisabledCheckboxes: true,
    },
    { field: 'sport' },
    { field: 'year', maxWidth: 120 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  isRowSelectable: (params: IRowNode<IOlympicData>) => {   
    return !!params.data && params.data.year === 2012;
  },  
  onFirstDataRendered: (params: FirstDataRenderedEvent<IOlympicData>) => {
    params.api.forEachNode((node) =>      
      node.setSelected(!!node.data && node.data.year === 2012)
    );
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
