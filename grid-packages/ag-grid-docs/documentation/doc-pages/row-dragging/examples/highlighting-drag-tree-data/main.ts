import { CellClassParams, GetRowIdParams, Grid, GridApi, GridOptions, RefreshCellsParams, RowDragEndEvent, RowDragLeaveEvent, RowDragMoveEvent, IRowNode, ValueFormatterParams } from '@ag-grid-community/core';
import { getData } from "./data";

declare var FileCellRenderer: any;

var valueFormatter = function (params: ValueFormatterParams) {
  return params.value ? params.value + ' MB' : ''
}

var cellClassRules = {
  'hover-over': (params: CellClassParams) => {
    return params.node === potentialParent
  },
}

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'dateModified',
      cellClassRules: cellClassRules,
    },
    {
      field: 'size',
      valueFormatter: valueFormatter,
      cellClassRules: cellClassRules,
    },
  ],
  defaultColDef: {
    flex: 1,
    resizable: true,
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
  autoGroupColumnDef: {
    rowDrag: true,
    headerName: 'Files',
    minWidth: 300,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: FileCellRenderer,
    },
    cellClassRules: {
      'hover-over': (params) => {
        return params.node === potentialParent
      },
    },
  },
  onRowDragEnd: onRowDragEnd,
  onRowDragMove: onRowDragMove,
  onRowDragLeave: onRowDragLeave,
}

var potentialParent: any = null

function onRowDragMove(event: RowDragMoveEvent) {
  setPotentialParentForNode(event.api, event.overNode)
}

function onRowDragLeave(event: RowDragLeaveEvent) {
  // clear node to highlight
  setPotentialParentForNode(event.api, null)
}

function onRowDragEnd(event: RowDragEndEvent) {
  if (!potentialParent) {
    return
  }

  var movingData = event.node.data

  // take new parent path from parent, if data is missing, means it's the root node,
  // which has no data.
  var newParentPath = potentialParent.data ? potentialParent.data.filePath : []
  var needToChangeParent = !arePathsEqual(newParentPath, movingData.filePath)

  // check we are not moving a folder into a child folder
  var invalidMode = isSelectionParentOfTarget(event.node, potentialParent)
  if (invalidMode) {
    console.log('invalid move')
  }

  if (needToChangeParent && !invalidMode) {
    var updatedRows: any[] = []
    moveToPath(newParentPath, event.node, updatedRows)

    gridOptions.api!.applyTransaction({
      update: updatedRows,
    })
    gridOptions.api!.clearFocusedCell()
  }

  // clear node to highlight
  setPotentialParentForNode(event.api, null)
}

function moveToPath(newParentPath: string[], node: IRowNode, allUpdatedNodes: any[]) {
  // last part of the file path is the file name
  var oldPath = node.data.filePath
  var fileName = oldPath[oldPath.length - 1]
  var newChildPath = newParentPath.slice()
  newChildPath.push(fileName)

  node.data.filePath = newChildPath

  allUpdatedNodes.push(node.data)

  if (node.childrenAfterGroup) {
    node.childrenAfterGroup.forEach(function (childNode) {
      moveToPath(newChildPath, childNode, allUpdatedNodes)
    })
  }
}

function isSelectionParentOfTarget(selectedNode: IRowNode, targetNode: any) {
  var children = selectedNode.childrenAfterGroup || []
  for (var i = 0; i < children.length; i++) {
    if (targetNode && children[i].key === targetNode.key) return true
    isSelectionParentOfTarget(children[i], targetNode)
  }
  return false
}

function arePathsEqual(path1: string[], path2: string[]) {
  if (path1.length !== path2.length) {
    return false
  }

  var equal = true
  path1.forEach(function (item, index) {
    if (path2[index] !== item) {
      equal = false
    }
  })

  return equal
}

function setPotentialParentForNode(api: GridApi, overNode: IRowNode | undefined | null) {
  var newPotentialParent
  if (overNode) {
    newPotentialParent =
      overNode.data.type === 'folder'
        ? // if over a folder, we take the immediate row
        overNode
        : // if over a file, we take the parent row (which will be a folder)
        overNode.parent
  } else {
    newPotentialParent = null
  }

  var alreadySelected = potentialParent === newPotentialParent
  if (alreadySelected) {
    return
  }

  // we refresh the previous selection (if it exists) to clear
  // the highlighted and then the new selection.
  var rowsToRefresh = []
  if (potentialParent) {
    rowsToRefresh.push(potentialParent)
  }
  if (newPotentialParent) {
    rowsToRefresh.push(newPotentialParent)
  }

  potentialParent = newPotentialParent

  refreshRows(api, rowsToRefresh)
}

function refreshRows(api: GridApi, rowsToRefresh: IRowNode[]) {
  var params: RefreshCellsParams = {
    // refresh these rows only.
    rowNodes: rowsToRefresh,
    // because the grid does change detection, the refresh
    // will not happen because the underlying value has not
    // changed. to get around this, we force the refresh,
    // which skips change detection.
    force: true,
  }
  api.refreshCells(params)
}


// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!

  // create the grid passing in the div to use together with the columns & data we want to use
  new Grid(eGridDiv, gridOptions)
})
