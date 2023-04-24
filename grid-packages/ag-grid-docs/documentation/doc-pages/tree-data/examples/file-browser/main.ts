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
    },
  ],
  defaultColDef: {
    flex: 1,
    filter: true,
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
}

function getNextId() {
  if (!window.nextId) {
    window.nextId = 15
  } else {
    window.nextId++
  }
  return window.nextId
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

function addNewGroup() {
  var newGroupData = [
    {
      id: getNextId(),
      filePath: ['Music', 'wav', 'hit_' + new Date().getTime() + '.wav'],
      dateModified: 'Aug 23 2017 11:52:00 PM',
      size: 58.9,
    },
  ]
  gridOptions.api!.applyTransaction({ add: newGroupData })
}

function removeSelected() {
  var selectedNode = gridOptions.api!.getSelectedNodes()[0] // single selection
  if (!selectedNode) {
    console.warn('No nodes selected!')
    return
  }

  gridOptions.api!.applyTransaction({ remove: getRowsToRemove(selectedNode) })
}

function getRowsToRemove(node: IRowNode) {
  var res: any[] = []
  const children = node.childrenAfterGroup || [];
  for (var i = 0; i < children.length; i++) {
    res = res.concat(getRowsToRemove(children[i]))
  }

  // ignore nodes that have no data, i.e. 'filler groups'
  return node.data ? res.concat([node.data]) : res
}

function moveSelectedNodeToTarget(targetRowId: string) {
  var selectedNode = gridOptions.api!.getSelectedNodes()[0] // single selection
  if (!selectedNode) {
    console.warn('No nodes selected!')
    return
  }

  var targetNode = gridOptions.api!.getRowNode(targetRowId)!
  var invalidMove =
    selectedNode.key === targetNode.key ||
    isSelectionParentOfTarget(selectedNode, targetNode)
  if (invalidMove) {
    console.warn('Invalid selection - must not be parent or same as target!')
    return
  }

  var rowsToUpdate = getRowsToUpdate(selectedNode, targetNode.data.filePath)
  gridOptions.api!.applyTransaction({ update: rowsToUpdate })
}

function isSelectionParentOfTarget(selectedNode: IRowNode, targetNode: IRowNode) {
  var children = selectedNode.childrenAfterGroup || [];
  for (var i = 0; i < children.length; i++) {
    if (targetNode && children[i].key === targetNode.key) return true
    isSelectionParentOfTarget(children[i], targetNode)
  }
  return false
}

function getRowsToUpdate(node: IRowNode, parentPath: string[]) {
  var res: any[] = []

  var newPath = parentPath.concat([node.key!])
  if (node.data) {
    // groups without data, i.e. 'filler groups' don't need path updated
    node.data.filePath = newPath
  }

  var children = node.childrenAfterGroup || [];
  for (var i = 0; i < children.length; i++) {
    var updatedChildRowData = getRowsToUpdate(
      children[i],
      newPath
    )
    res = res.concat(updatedChildRowData)
  }

  // ignore nodes that have no data, i.e. 'filler groups'
  return node.data ? res.concat([node.data]) : res
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
