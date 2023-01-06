import { GetRowIdParams, Grid, GridOptions, ISetFilterParams, KeyCreatorParams, ValueFormatterParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'employmentType' },
    {
      field: 'startDate',
      valueFormatter: (params: ValueFormatterParams) => params.value ? params.value.toLocaleDateString() : params.value,
      filterParams: {
        treeList: true
      } as ISetFilterParams<any, Date>,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    filter: true,
    floatingFilter: true,
  },
  autoGroupColumnDef: {
    headerName: 'Employee',
    field: 'employeeName',
    cellRendererParams: {
      suppressCount: true,
    },
    filter: 'agSetColumnFilter',
    filterParams: {
      treeList: true,
      keyCreator: (params: KeyCreatorParams) => params.value ? params.value.join('#') : null,
    } as ISetFilterParams<any, string[]>,
    minWidth: 280
  },
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: -1,
  getDataPath: (data: any) => data.dataPath,
  getRowId: (params: GetRowIdParams<any>) => params.data.employeeId,
}

function processData(data: any[]) {
  const flattenedData: any[] = [];
  const flattenRowRecursive = (row: any, parentPath: string[]) => {
    const dateParts = row.startDate.split('/');
    const startDate = new Date(parseInt(dateParts[2]), dateParts[1] - 1, dateParts[0]);
    const dataPath = [...parentPath, row.employeeName];
    flattenedData.push({...row, dataPath, startDate});
    if (row.underlings) {
      row.underlings.forEach((underling: any) => flattenRowRecursive(underling, dataPath));
    }
  };
  data.forEach(row => flattenRowRecursive(row, []));
  return flattenedData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/tree-data.json')
    .then(response => response.json())
    .then((data) => gridOptions.api!.setRowData(processData(data)))
})
