var expandedIcon = '<i class="fa fa-minus-square-o"/><span style="padding-right: 5px"></span><i class="fa fa-folder-open-o"/>';
var contractedIcon = '<i class="fa fa-plus-square-o"/><span style="padding-right: 5px"></span><i class="fa fa-folder-o"/>';

// specify the columns
var columnDefs = [
    {
        headerName: "Files",
        cellRenderer: 'group',
        showRowGroup: true,
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: FileCellRenderer
        }
    },
    {field: "dateModified"},
    {field: "size"}
];

// specify the data
var rowData = [
    {filePath: ['Documents', 'txt', 'notes.txt'], dateModified: "21 May 2017, 13:50", size: "14 KB"},
    {filePath: ['Documents', 'pdf', "book.pdf"], dateModified: "22 May 2017, 13:50", size: "2.1 MB"},
    {filePath: ['Documents', 'pdf', "cv.pdf"], dateModified: "3 Jun 2017, 21:02", size: "2.4 MB"},
    {filePath: ['Documents', 'xls', "accounts.xls"], dateModified: "12 Aug 2016, 22:50", size: "4.3 MB"},
    {filePath: ['Music', 'mp3', "theme.mp3"], dateModified: "11 Sep 2016, 20:03", size: "14.3 MB"},
    {filePath: ["temp.txt"], dateModified: "17 Jan 2016, 20:03", size: "101 KB"}
];

var gridOptions = {
    suppressRowClickSelection: true,
    animateRows: true,
    columnDefs: columnDefs,
    rowData: rowData,
    enableFilter: true,
    enableSorting: true,
    groupDefaultExpanded: 1,
    treeData: true,
    icons: {
        groupExpanded: expandedIcon,
        groupContracted: contractedIcon
    },
    getGroupKeys: function(data) {
        return data.filePath;
    },
    onGridReady: function () {
        // set initial expanded state
        gridOptions.api.forEachNode(function(node) {
            if (node.key==='pdf' || node.key==='mp3') {
                node.setExpanded(true);
            }
        });
    }
};

function FileCellRenderer() {}

FileCellRenderer.prototype.init = function(params) {
    var tempDiv = document.createElement('div');

    var icon = getFileIcon(params.value);
    tempDiv.innerHTML = icon ?
        '<i class="'+ icon + '"/><span style="padding:5px"><b>' + params.value + '</b></span>' : params.value;

    this.eGui = tempDiv.firstChild;
};

FileCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

var getFileIcon = function (filename) {
    return filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' :
           filename.endsWith('.xls') ? 'fa fa-file-excel-o' :
           filename.endsWith('.mp3') ? 'fa fa-file-audio-o' :
           filename.endsWith('.txt') ? 'fa fa-file-o' : null;
};


// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});