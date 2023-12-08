import {
  GridApi,
  createGrid,
  GridOptions,
  FirstDataRenderedEvent,
  CheckboxSelectionCallbackParams,
  IRowNode,
} from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'athlete',
      headerCheckboxSelection: true,
      checkboxSelection: (params: CheckboxSelectionCallbackParams<IOlympicData>) => {
        return !!params.data && params.data.year === 2012;
      },
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
  onFirstDataRendered: (params: FirstDataRenderedEvent<IOlympicData>) => {
    const nodesToSelect: IRowNode[] = [];
    params.api.forEachNode((node) => {
      if (node.data && node.data.year !== 2012) {
        nodesToSelect.push(node);
      }
    });
    params.api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
  }
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
