var expandedIcon = '<i class="fa fa-folder-open-o"/>';
var contractedIcon = '<i class="fa fa-folder"/>';

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
            padding: 30,
            innerRenderer: FileCellRenderer
        }
    },
    {field: "dateModified"},
    {field: "size"}
];

// specify the data
var rowData = [
    {id: 101, filePath: ['Documents', 'txt', 'notes.txt'], dateModified: "21 May 2017, 13:50", size: "14 KB"},
    {id: 102, filePath: ['Documents', 'pdf', "book.pdf"], dateModified: "22 May 2017, 13:50", size: "2.1 MB"},
    {id: 103, filePath: ['Documents', 'pdf', "cv.pdf"], dateModified: "3 Jun 2017, 21:02", size: "2.4 MB"},
    {id: 104, filePath: ['Documents', 'xls', "accounts.xls"], dateModified: "12 Aug 2016, 22:50", size: "4.3 MB"},
    {id: 105, filePath: ['Documents', 'stuff']},
    {id: 106, filePath: ['Documents', 'stuff', 'xyz.txt'], dateModified: "12 Aug 2016, 22:50", size: "4.3 MB"},
    {id: 107, filePath: ['Music', 'mp3', "theme.mp3"], dateModified: "11 Sep 2016, 20:03", size: "14.3 MB"},
    {id: 108, filePath: ["temp.txt"], dateModified: "17 Jan 2016, 20:03", size: "101 KB"}
];

var gridOptions = {
    animateRows: true,
    columnDefs: columnDefs,
    rowData: rowData,
    enableFilter: true,
    enableSorting: true,
    groupDefaultExpanded: -1,
    treeData: true,
    icons: {
        groupExpanded: expandedIcon,
        groupContracted: contractedIcon
    },
    getDataPath: function(data) {
        return data.filePath;
    },
    getRowNodeId: function(data) {
        return data.id;
    }
};

function FileCellRenderer() {}

FileCellRenderer.prototype.init = function(params) {
    var tempDiv = document.createElement('div');

    var icon = getFileIcon(params.value);
    tempDiv.innerHTML = icon ?
        '<i class="'+ icon + '"/><span style="padding:5px; color: black; font-size: 16px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif">' + params.value + '</span>' : params.value;

    this.eGui = tempDiv.firstChild;
};

FileCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

var getFileIcon = function (filename) {
    return filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' :
           filename.endsWith('.xls') ? 'fa fa-file-excel-o' :
           filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'fa fa-file-audio-o' :
           filename.endsWith('.txt') ? 'fa fa-file-o' : null;
};

function addNewGroup() {
    var newGroupData = [
        {id: 109, filePath: ['Music', 'wav', "hit.wav"], dateModified: "11 Sep 2016, 20:03", size: "14.3 MB"}
    ];

    gridOptions.api.updateRowData({add: newGroupData});
}

function moveSelectedToStuff() {

    var selectedRows = gridOptions.api.getSelectedRows();
    console.log("selectedRows: ", selectedRows);

    var selectedRowData = selectedRows[0];
    if(!selectedRowData) {
        console.warn("No nodes selected");
        return;
    }

    var stuffNode = gridOptions.api.getRowNode(105);
    var lastNodeInPath = selectedRowData.filePath.slice(-1)[0];
    selectedRowData.filePath = stuffNode.data.filePath.concat([lastNodeInPath]);

    gridOptions.api.updateRowData({update: [selectedRowData]});
    gridOptions.api.deselectAll();
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});