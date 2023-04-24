import { GetRowIdParams, Grid, GridOptions, ICellRendererComp, ICellRendererParams, IRowNode } from '@ag-grid-community/core';
import { getData } from "./data";

declare var window: any

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'dateModified',
      minWidth: 250,
      comparator: (d1, d2) => {
        return new Date(d1).getTime() < new Date(d2).getTime() ? -1 : 1
      },
    },
    {
      field: 'size',
      aggFunc: 'sum',
      valueFormatter: (params) => {
        return params.value
          ? Math.round(params.value * 10) / 10 + ' MB'
          : '0 MB'
      },
      filter: 'agNumberColumnFilter'
    },
  ],
  defaultColDef: {
    flex: 1,
    filter: true,
    floatingFilter: true,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    headerName: 'Files',
    minWidth: 330,
    cellRendererParams: {
      checkbox: true,
      suppressCount: true,
      innerRenderer: getFileCellRenderer(),
    },
  },
  rowData: getData(),
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: -1,
  getDataPath: (data: any) => {
    return data.filePath
  },
  getRowId: (params: GetRowIdParams) => {
    return params.data.id
  },
  groupAggFiltering: true,
}

function getFileCellRenderer() {
  class FileCellRenderer implements ICellRendererComp {
    eGui: any;

    init(params: ICellRendererParams) {
      var tempDiv = document.createElement('div')
      var value = params.value
      var icon = getFileIcon(params.value)
      tempDiv.innerHTML = icon
        ? '<span><i class="' +
        icon +
        '"></i>' +
        '<span class="filename"></span>' +
        value +
        '</span>'
        : value
      this.eGui = tempDiv.firstChild
    }

    getGui() {
      return this.eGui;
    }

    refresh() {
      return false;
    }
  }

  return FileCellRenderer
}

function getFileIcon(name: string) {
  return endsWith(name, '.mp3') || endsWith(name, '.wav')
    ? 'far fa-file-audio'
    : endsWith(name, '.xls')
      ? 'far fa-file-excel'
      : endsWith(name, '.txt')
        ? 'far fa-file'
        : endsWith(name, '.pdf')
          ? 'far fa-file-pdf'
          : 'far fa-folder'
}

function endsWith(str: string | null, match: string | null) {
  var len
  if (str == null || !str.length || match == null || !match.length) {
    return false
  }
  len = str.length
  return str.substring(len - match.length, len) === match
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
  // lookup the container we want the Grid to use
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!

  // create the grid passing in the div to use together with the columns & data we want to use
  new Grid(gridDiv, gridOptions)
})
