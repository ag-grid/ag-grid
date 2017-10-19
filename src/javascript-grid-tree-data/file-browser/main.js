// specify the columns
var columnDefs = [
    {
        headerName: "Files",
        cellRenderer: 'group',
        showRowGroup: true,
        width: 250,
        cellRendererParams: {
            checkbox: true,
            suppressCount: true,
            padding: 20,
            innerRenderer: FileCellRenderer
        }
    },
    {field: "dateModified"},
    {field: "size"}
];

// specify the data
var rowData = [
    {id: 1, filePath: ['Documents']},
    {id: 2, filePath: ['Documents', 'txt']},
    {id: 3, filePath: ['Documents', 'txt', 'notes.txt'], dateModified: "21 May 2017, 13:50", size: "14 KB"},
    {id: 4, filePath: ['Documents', 'pdf']},
    {id: 5, filePath: ['Documents', 'pdf', "book.pdf"], dateModified: "22 May 2017, 13:50", size: "2.1 MB"},
    {id: 6, filePath: ['Documents', 'pdf', "cv.pdf"], dateModified: "3 Jun 2017, 21:02", size: "2.4 MB"},
    {id: 7, filePath: ['Documents', 'xls']},
    {id: 8, filePath: ['Documents', 'xls', "accounts.xls"], dateModified: "12 Aug 2016, 22:50", size: "4.3 MB"},
    {id: 9, filePath: ['Documents', 'stuff']},
    {id: 10, filePath: ['Documents', 'stuff', 'xyz.txt'], dateModified: "12 Aug 2016, 22:50", size: "4.3 MB"},
    {id: 11, filePath: ['Music']},
    {id: 12, filePath: ['Music', 'mp3']},
    {id: 13, filePath: ['Music', 'mp3', "theme.mp3"], dateModified: "11 Sep 2016, 20:03", size: "14.3 MB"},
    {id: 14, filePath: ["temp.txt"], dateModified: "17 Jan 2016, 20:03", size: "101 KB"}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    treeData: true,
    animateRows: true,
    enableFilter: true,
    enableSorting: true,
    groupDefaultExpanded: -1,
    icons: {
        groupExpanded: '<i class="fa fa-folder-open-o"/>',
        groupContracted: '<i class="fa fa-folder"/>'
    },
    getDataPath: function (data) {
        return data.filePath;
    },
    getRowNodeId: function (data) {
        return data.id;
    }
};

function FileCellRenderer() {
}

FileCellRenderer.prototype.init = function (params) {
    var tempDiv = document.createElement('div');
    var value = params.value;
    var icon = getFileIcon(params.value);
    tempDiv.innerHTML = icon ? '<i class="' + icon + '"/>' + '<span class="filename">' + value + '</span>' : value;
    this.eGui = tempDiv.firstChild;
};

FileCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

function addNewGroup() {
    var newGroupData = [{
        id: rowData.length + 1,
        filePath: ['Music', 'wav', "hit.wav"], //TODO: note that no group node for 'wave' is provided!
        dateModified: "11 Sep 2016, 20:03",
        size: "14.3 MB"
    }];
    gridOptions.api.updateRowData({add: newGroupData});
}

function removeSelected() {
    var selectedNode = gridOptions.api.getSelectedNodes()[0]; //rowSelection = 'single'
    if (!selectedNode) {
        console.warn("No nodes selected!");
        return;
    }

    gridOptions.api.updateRowData({remove: getRowsToRemove(selectedNode)});
}

function getRowsToRemove(node) {
    var res = [];
    for (var i = 0; i < node.childrenAfterGroup.length; i++) {
        res = res.concat(getRowsToRemove(node.childrenAfterGroup[i]));
    }
    return res.concat([node.data]);
}

function moveSelectedNodeToTarget(targetRowId) {
    var selectedNode = gridOptions.api.getSelectedNodes()[0]; //rowSelection = 'single'
    if (!selectedNode) {
        console.warn("No nodes selected!");
        return;
    }

    var targetNode = gridOptions.api.getRowNode(targetRowId);
    var invalidMove = selectedNode.key === targetNode.key || isSelectionParentOfTarget(selectedNode, targetNode);

    if (invalidMove) {
        console.warn("Invalid selection - must not be parent or same as target!");
    } else {
        var rowsToUpdate = getRowsToUpdate(selectedNode, targetNode.data.filePath);
        gridOptions.api.updateRowData({update: rowsToUpdate});
    }

    gridOptions.api.deselectAll();
}

function isSelectionParentOfTarget(selectedNode, targetNode) {
    var children = selectedNode.childrenAfterGroup;
    for (var i = 0; i < children.length; i++) {
        if (children[i].key === targetNode.key) return true;
        isSelectionParentOfTarget(children[i], targetNode.key);
    }
    return false;
}

function getRowsToUpdate(node, parentPath) {
    var res = [];

    node.data.filePath = parentPath.concat([node.key]);

    for (var i = 0; i < node.childrenAfterGroup.length; i++) {
        var updatedChildRowData = getRowsToUpdate(node.childrenAfterGroup[i], node.data.filePath);
        res = res.concat(updatedChildRowData);
    }

    return res.concat([node.data]); //TODO: order is important!
}

function getFileIcon(filename) {
    return filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' :
        filename.endsWith('.xls') ? 'fa fa-file-excel-o' :
            filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'fa fa-file-audio-o' : 'fa fa-file-o';
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function () {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});