// specify the columns
var columnDefs = [
    {
        field: 'dateModified',
        comparator: function(d1, d2) {
            return new Date(d1).getTime() < new Date(d2).getTime() ? -1 : 1;
        }
    },
    {
        field: 'size',
        aggFunc: 'sum',
        valueFormatter: function(params) {
            return params.value ? Math.round(params.value * 10) / 10 + ' MB' : '0 MB';
        }
    }
];

function getNextId() {
    if (!window.nextId) {
        window.nextId = 13;
    } else {
        window.nextId++;
    }
    return window.nextId;
}

// specify the data
var rowData = [
      {
        id: 1,
        filePath: ["Documents"]
      },
      {
        id: 2,
        filePath: ["Documents", "txt"]
      },
      {
        id: 3,
        filePath: ["Documents", "txt", "notes.txt"],
        dateModified: "May 21 2017 01:50:00 PM",
        size: 14.7
      },
      {
        id: 4,
        filePath: ["Documents", "pdf"]
      },
      {
        id: 5,
        filePath: ["Documents", "pdf", "book.pdf"],
        dateModified: "May 20 2017 01:50:00 PM",
        size: 2.1
      },
      {
        id: 6,
        filePath: ["Documents", "pdf", "cv.pdf"],
        dateModified: "May 20 2016 11:50:00 PM",
        size: 2.4
      },
      {
        id: 7,
        filePath: ["Documents", "xls"]
      },
      {
        id: 8,
        filePath: ["Documents", "xls", "accounts.xls"],
        dateModified: "Aug 12 2016 10:50:00 AM",
        size: 4.3
      },
      {
        id: 9,
        filePath: ["Documents", "stuff"]
      },
      {
        id: 10,
        filePath: ["Documents", "stuff", "xyz.txt"],
        dateModified: "Jan 17 2016 08:03:00 PM",
        size: 1.1
      },
      {
        id: 11,
        filePath: ["Music", "mp3", "pop"],
        dateModified: "Sep 11 2016 08:03:00 PM",
        size: 14.3
      },
      {
        id: 12,
        filePath: ["temp.txt"],
        dateModified: "Aug 12 2016 10:50:00 PM",
        size: 101
      },
      {
        id: 13,
        filePath: ["Music", "mp3", "pop", "theme.mp3"],
        dateModified: "Aug 12 2016 10:50:00 PM",
        size: 101
      },
      {
        id: 14,
        filePath: ["Music", "mp3", "jazz"],
        dateModified: "Aug 12 2016 10:50:00 PM",
        size: 101
      }
    ];

var gridOptions = {
    components: {
        fileCellRenderer: getFileCellRenderer()
    },
    columnDefs: columnDefs,
    rowData: rowData,
    treeData: true,
    animateRows: true,
    enableFilter: true,
    enableSorting: true,
    enableColResize: true,
    groupDefaultExpanded: -1,
    getDataPath: function(data) {
        return data.filePath;
    },
    getRowNodeId: function(data) {
        return data.id;
    },
    autoGroupColumnDef: {
        headerName: 'Files',
        width: 250,
        cellRendererParams: {
            checkbox: true,
            suppressCount: true,
            innerRenderer: 'fileCellRenderer'
        }
    }
};

function getFileCellRenderer() {
    function FileCellRenderer() {}

    FileCellRenderer.prototype.init = function(params) {
        var tempDiv = document.createElement('div');
        var value = params.value;
        var icon = getFileIcon(params.value);
        tempDiv.innerHTML = icon ? '<span><i class="' + icon + '"></i>' + '<span class="filename"></span>' + value + '</span>' : value;
        this.eGui = tempDiv.firstChild;
    };
    FileCellRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return FileCellRenderer
}

function addNewGroup() {
    var newGroupData = [
        {
            id: getNextId(),
            filePath: ['Music', 'wav', 'hit_'+new Date().getTime()+'.wav'],
            dateModified: 'Aug 23 2017 11:52:00 PM',
            size: 58.9
        }
    ];
    gridOptions.api.updateRowData({add: newGroupData});
}

function removeSelected() {
    var selectedNode = gridOptions.api.getSelectedNodes()[0]; // single selection
    if (!selectedNode) {
        console.warn('No nodes selected!');
        return;
    }

    gridOptions.api.updateRowData({remove: getRowsToRemove(selectedNode)});
}

function getRowsToRemove(node) {
    var res = [];
    for (var i = 0; i < node.childrenAfterGroup.length; i++) {
        res = res.concat(getRowsToRemove(node.childrenAfterGroup[i]));
    }

    // ignore nodes that have no data, i.e. 'filler groups'
    return node.data ? res.concat([node.data]) : res;
}

function moveSelectedNodeToTarget(targetRowId) {
    var selectedNode = gridOptions.api.getSelectedNodes()[0]; // single selection
    if (!selectedNode) {
        console.warn('No nodes selected!');
        return;
    }

    var targetNode = gridOptions.api.getRowNode(targetRowId);
    var invalidMove = selectedNode.key === targetNode.key || isSelectionParentOfTarget(selectedNode, targetNode);
    if (invalidMove) {
        console.warn('Invalid selection - must not be parent or same as target!');
        return;
    }

    var rowsToUpdate = getRowsToUpdate(selectedNode, targetNode.data.filePath);
    gridOptions.api.updateRowData({update: rowsToUpdate});
}

function isSelectionParentOfTarget(selectedNode, targetNode) {
    var children = selectedNode.childrenAfterGroup;
    for (var i = 0; i < children.length; i++) {
        if (targetNode && children[i].key === targetNode.key) return true;
        isSelectionParentOfTarget(children[i], targetNode);
    }
    return false;
}

function getRowsToUpdate(node, parentPath) {
    var res = [];

    var newPath = parentPath.concat([node.key]);
    if (node.data) {
        // groups without data, i.e. 'filler groups' don't need path updated
        node.data.filePath = newPath;
    }

    for (var i = 0; i < node.childrenAfterGroup.length; i++) {
        var updatedChildRowData = getRowsToUpdate(node.childrenAfterGroup[i], newPath);
        res = res.concat(updatedChildRowData);
    }

    // ignore nodes that have no data, i.e. 'filler groups'
    return node.data ? res.concat([node.data]) : res;
}

function getFileIcon(filename) {
    return filename.endsWith('.mp3') || filename.endsWith('.wav')
        ? 'fa fa-file-audio-o'
        : filename.endsWith('.xls') ? 'fa fa-file-excel-o' : filename.endsWith('.txt') ? 'fa fa fa-file-o' : filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' : 'fa fa-folder';
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function() {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});