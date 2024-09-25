import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    GetRowIdParams,
    GridApi,
    GridOptions,
    ICellRendererParams,
    IRowNode,
    RowDragEndEvent,
    ValueFormatterParams,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

class FileCellRenderer {
    private eGui!: any;

    init(params: ICellRendererParams) {
        var tempDiv = document.createElement('div');
        var value = params.value;
        var icon = this.getFileIcon(params.value);
        tempDiv.innerHTML = icon ? '<i class="' + icon + '"/>' + '<span class="filename">' + value + '</span>' : value;
        this.eGui = tempDiv.firstChild!;
    }
    getGui() {
        return this.eGui;
    }

    getFileIcon(filename: string) {
        return filename.endsWith('.mp3') || filename.endsWith('.wav')
            ? 'far fa-file-audio'
            : filename.endsWith('.xls')
              ? 'far fa-file-excel'
              : filename.endsWith('.txt')
                ? 'far fa-file'
                : filename.endsWith('.pdf')
                  ? 'far fa-file-pdf'
                  : 'far fa-folder';
    }
}

var valueFormatter = function (params: ValueFormatterParams) {
    return params.value ? params.value + ' MB' : '';
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'dateModified' },
        {
            field: 'size',
            valueFormatter: valueFormatter,
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    rowData: getData(),
    treeData: true,
    groupDefaultExpanded: -1,
    getDataPath: (data: any) => {
        return data.filePath;
    },
    getRowId: (params: GetRowIdParams) => {
        return String(params.data.id);
    },
    autoGroupColumnDef: {
        rowDrag: true,
        headerName: 'Files',
        minWidth: 300,
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: FileCellRenderer,
        },
    },
    onRowDragEnd: onRowDragEnd,
};

function onRowDragEnd(event: RowDragEndEvent) {
    // this is the row the mouse is hovering over
    var overNode = event.overNode;
    if (!overNode) {
        return;
    }

    // folder to drop into is where we are going to move the file/folder to
    var folderToDropInto =
        overNode.data.type === 'folder'
            ? // if over a folder, we take the immediate row
              overNode
            : // if over a file, we take the parent row (which will be a folder)
              overNode.parent;

    // the data we want to move
    var movingData = event.node.data;

    // take new parent path from parent, if data is missing, means it's the root node,
    // which has no data.
    var newParentPath = folderToDropInto!.data ? folderToDropInto!.data.filePath : [];
    var needToChangeParent = !arePathsEqual(newParentPath, movingData.filePath);

    // check we are not moving a folder into a child folder
    var invalidMode = isSelectionParentOfTarget(event.node, folderToDropInto);
    if (invalidMode) {
        console.log('invalid move');
    }

    if (needToChangeParent && !invalidMode) {
        var updatedRows: any[] = [];
        moveToPath(newParentPath, event.node, updatedRows);

        gridApi!.applyTransaction({
            update: updatedRows,
        });

        gridApi!.clearFocusedCell();
    }
}

// this updates the filePath locations in our data, we update the data
// before we send it to AG Grid
function moveToPath(newParentPath: string[], node: IRowNode, allUpdatedNodes: any[]) {
    // last part of the file path is the file name
    var oldPath = node.data.filePath;
    var fileName = oldPath[oldPath.length - 1];
    var newChildPath = newParentPath.slice();
    newChildPath.push(fileName);

    node.data.filePath = newChildPath;

    allUpdatedNodes.push(node.data);

    if (node.childrenAfterGroup) {
        node.childrenAfterGroup.forEach((childNode) => {
            moveToPath(newChildPath, childNode, allUpdatedNodes);
        });
    }
}

function isSelectionParentOfTarget(selectedNode: IRowNode, targetNode: IRowNode | null) {
    let children = [...(selectedNode.childrenAfterGroup || [])];

    if (!targetNode) {
        return false;
    }

    while (children.length) {
        const node = children.shift();
        if (!node) {
            continue;
        }

        if (node.key === targetNode.key) {
            return true;
        }

        if (node.childrenAfterGroup && node.childrenAfterGroup.length) {
            children.push(...node.childrenAfterGroup);
        }
    }

    return false;
}

function arePathsEqual(path1: string[], path2: string[]) {
    if (path1.length !== path2.length) {
        return false;
    }

    var equal = true;
    path1.forEach(function (item, index) {
        if (path2[index] !== item) {
            equal = false;
        }
    });

    return equal;
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    // create the grid passing in the div to use together with the columns & data we want to use
    gridApi = createGrid(eGridDiv, gridOptions);
});
