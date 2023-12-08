import {
  GridApi,
  createGrid,
  FirstDataRenderedEvent,
  GridOptions,
  IDetailCellRendererParams,
  GetRowIdParams,
} from '@ag-grid-community/core';
import { CallsCellRenderer } from './callsCellRenderer_typescript'

const gridOptions: GridOptions = {
  masterDetail: true,
  isRowMaster: (dataItem: any) => {
    return dataItem ? dataItem.callRecords.length > 0 : false
  },
  columnDefs: [
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
    { field: 'account' },
    { field: 'calls', cellRenderer: CallsCellRenderer },
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
  ],
  defaultColDef: {
    flex: 1,
  },
  getRowId: (params: GetRowIdParams) => {
    return params.data.account
  },
  detailCellRendererParams: {
    detailGridOptions: {
      columnDefs: [
        { field: 'callId' },
        { field: 'direction' },
        { field: 'number', minWidth: 150 },
        { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
        { field: 'switchCode', minWidth: 150 },
      ],
      defaultColDef: {
        flex: 1,
      },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.callRecords)
    },
  } as IDetailCellRendererParams<IAccount, ICallRecord>,
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  // arbitrarily expand a row for presentational purposes
  setTimeout(() => {
    params.api.getDisplayedRowAtIndex(1)!.setExpanded(true)
  }, 0)
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);

fetch(
  'https://www.ag-grid.com/example-assets/master-detail-dynamic-data.json'
)
  .then(response => response.json())
  .then(function (data) {
    gridApi.setGridOption('rowData', data)
  })
