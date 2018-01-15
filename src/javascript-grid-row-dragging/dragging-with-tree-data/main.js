// specify the columns
var columnDefs = [
    {
        field: 'dateModified'
    },
    {
        field: 'size',
        valueFormatter: function(params) {
            return params.value ? params.value + ' MB' : '';
        }
    }
];

// specify the data
var rowData = [
    {id: 1, filePath: ['Documents'], type: 'folder'},
    {id: 2, filePath: ['Documents', 'txt'], type: 'folder'},
    {id: 3, filePath: ['Documents', 'txt', 'notes.txt'], type: 'file', dateModified: 'May 21 2017 01:50:00 PM', size: 14.7},
    {id: 4, filePath: ['Documents', 'pdf'], type: 'folder'},
    {id: 5, filePath: ['Documents', 'pdf', 'book.pdf'], type: 'file', dateModified: 'May 20 2017 01:50:00 PM', size: 2.1},
    {id: 6, filePath: ['Documents', 'pdf', 'cv.pdf'], type: 'file', dateModified: 'May 20 2016 11:50:00 PM', size: 2.4},
    {id: 7, filePath: ['Documents', 'xls'], type: 'folder'},
    {id: 8, filePath: ['Documents', 'xls', 'accounts.xls'], type: 'file', dateModified: 'Aug 12 2016 10:50:00 AM', size: 4.3},
    {id: 9, filePath: ['Documents', 'stuff'], type: 'folder'},
    {id: 10, filePath: ['Documents', 'stuff', 'xyz.txt'], type: 'file', dateModified: 'Jan 17 2016 08:03:00 PM', size: 1.1},
    {id: 11, filePath: ['Music'], type: 'folder'},
    {id: 12, filePath: ['Music', 'mp3'], type: 'folder'},
    {id: 13, filePath: ['Music', 'mp3', 'theme.mp3'], type: 'file', dateModified: 'Sep 11 2016 08:03:00 PM', size: 14.3},
    {id: 14, filePath: ['Misc'], type: 'folder'},
    {id: 15, filePath: ['Misc', 'temp.txt'], type: 'file', dateModified: 'Aug 12 2016 10:50:00 PM', size: 101}
];

var gridOptions = {
    components: {
        fileCellRenderer: getFileCellRenderer()
    },
    columnDefs: columnDefs,
    rowData: rowData,
    treeData: true,
    animateRows: true,
    enableColResize: true,
    groupDefaultExpanded: -1,
    getDataPath: function(data) {
        return data.filePath;
    },
    getRowNodeId: function(data) {
        return data.id;
    },
    autoGroupColumnDef: {
        rowDrag: true,
        headerName: 'Files',
        width: 250,
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: 'fileCellRenderer'
        }
    },
    onRowDragEnd: onRowDragEnd
};

function onRowDragEnd(event) {

    // this is the row the mouse is hovering over
    var overNode = event.overNode;
    if (!overNode) { return; }

    // folder to drop into is where we are going to move the file/folder to
    var folderToDropInto = overNode.data.type === 'folder'
        // if over a folder, we take the immediate row
        ? overNode
        // if over a file, we take the parent row (which will be a folder)
        : overNode.parent;

    // the data we want to move
    var movingData = event.node.data;

    // take new parent path from parent, if data is missing, means it's the root node,
    // which has no data.
    var newParentPath = folderToDropInto.data ? folderToDropInto.data.filePath : [];
    var needToChangeParent = !arePathsEqual(newParentPath, movingData.filePath);

    // check we are not moving a folder into a child folder
    var invalidMode = isSelectionParentOfTarget(event.node, folderToDropInto);
    if (invalidMode) {
        console.log('invalid move');
    }

    if (needToChangeParent && !invalidMode) {

        var updatedRows = [];
        moveToPath(newParentPath, event.node, updatedRows);

        gridOptions.api.updateRowData({
            update: updatedRows
        });

        gridOptions.api.clearFocusedCell();
    }
}

// this updates the filePath locations in our data, we update the data
// before we send it to ag-Grid
function moveToPath(newParentPath, node, allUpdatedNodes) {
    // last part of the file path is the file name
    var oldPath = node.data.filePath;
    var fileName = oldPath[oldPath.length-1];
    var newChildPath = newParentPath.slice();
    newChildPath.push(fileName);

    node.data.filePath = newChildPath;

    allUpdatedNodes.push(node.data);

    if (node.childrenAfterGroup) {
        node.childrenAfterGroup.forEach( function(childNode) {
            moveToPath(newChildPath, childNode, allUpdatedNodes);
        });
    }
}

function isSelectionParentOfTarget(selectedNode, targetNode) {
    var children = selectedNode.childrenAfterGroup;
    for (var i = 0; i < children.length; i++) {
        if (targetNode && children[i].key === targetNode.key) return true;
        isSelectionParentOfTarget(children[i], targetNode);
    }
    return false;
}

function arePathsEqual(path1, path2) {
    if (path1.length !== path2.length) { return false; }

    var equal = true;
    path1.forEach( function(item, index) {
        if (path2[index]!==item) {
            equal = false;
        }
    });

    return equal;
}

function getFileCellRenderer() {
    function FileCellRenderer() {}

    FileCellRenderer.prototype.init = function(params) {
        var tempDiv = document.createElement('div');
        var value = params.value;
        var icon = getFileIcon(params.value);
        tempDiv.innerHTML = icon ? '<i class="' + icon + '"/>' + '<span class="filename">' + value + '</span>' : value;
        this.eGui = tempDiv.firstChild;
    };
    FileCellRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return FileCellRenderer
}

function getFileIcon(filename) {
    return filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'fa fa-file-audio-o'
        : filename.endsWith('.xls') ? 'fa fa-file-excel-o'
            : filename.endsWith('.txt') ? 'fa fa fa-file-o'
                : filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' : 'fa fa-folder';
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function() {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});