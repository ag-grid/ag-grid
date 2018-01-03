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
    {id: 1, filePath: ['Music'], type: 'folder'},
    {id: 2, filePath: ['Music', 'mp3'], type: 'folder'},
    {id: 11, filePath: ['Music', 'mp3', 'theme.mp3'], type: 'file', dateModified: 'Sep 11 2016 08:03:00 PM', size: 14.3},
    {id: 12, filePath: ['temp.txt'], type: 'file', dateModified: 'Aug 12 2016 10:50:00 PM', size: 101}
];

var gridOptions = {
    components: {
        fileCellRenderer: getFileCellRenderer()
    },
    columnDefs: columnDefs,
    rowData: rowData,
    treeData: true,
    rowDragPassive: true,
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
        rowDrag: function(params) {
            return params.node.data && params.node.data.type==='file';
        },
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
    let movingData = event.node.data;
    let overNode = event.overNode;
    let overData = event.overNode.data;

    // find out what folder we are hovering over
    let newParentPath;
    if (overData.type==='folder') {
        // if over a folder, we take the folder path
        newParentPath = overData.filePath;
    } else {
        // if over a file, we take the parent path
        newParentPath = overNode.parent.data.filePath;
    }

    let needToChangeParent = !arePathsEqual(newParentPath, movingData.filePath);

    if (needToChangeParent) {
        // last part of the file path is the file name
        let fileName = movingData.filePath[movingData.filePath.length-1];
        let newPath = [];
        newParentPath.forEach( function(item) {
            newPath.push(item);
        });
        newPath.push(fileName);

        movingData.filePath = newPath;

        gridOptions.api.updateRowData({
            update: [movingData]
        });
        gridOptions.api.clearFocusedCell();
    }
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