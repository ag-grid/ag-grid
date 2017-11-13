var masterColumnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer: 'group'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var detailColumnDefs = [
    {field: 'callId'},
    {field: 'direction'},
    {field: 'number'},
    {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
    {field: 'switchCode'}
];

var detailGridOptions = {
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    columnDefs: detailColumnDefs,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
        console.log('grid created');
    },
    defaultColDef: {
        editable: true
    },
    enableRangeSelection: true
};

var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    masterDetail: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    detailGridOptions: detailGridOptions,
    // detailCellRenderer: DetailCellRenderer,
    detailCellRendererParams: {
        // template:
        //     '<div style="height: 100%; background-color: #eef; padding: 20px; box-sizing: border-box;">' +
        //     '  <div style="height: 10%;">Call Details</div>' +
        //     '  <div ref="eDetailGrid" style="height: 90%;"></div>' +
        //     '</div>'
        // template: function(params) {
        //     var personName = params.data.name;
        //     var template =
        //          '<div style="height: 100%; background-color: #eef; padding: 20px; box-sizing: border-box;">'
        //         +'  <div style="height: 10%;">Name: '+personName+'</div>'
        //         +'  <div ref="eDetailGrid" style="height: 90%;"></div>'
        //         +'</div>';
        //     return template;
        // }
    },
    getDetailRowData: function(params) {
        setTimeout(function() {
            params.successCallback(params.data.callRecords);
        }, 1000);
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, masterGridOptions);
});

// setInterval( function() {
//     console.log('setInterval ' + Math.random());
//     masterGridOptions.api.forEachDetailGridApi( function(detailGridApi, id) {
//         console.log('got api for ' + id);
//         detailGridApi.stopEditing();
//     });
// }, 2000);

// function DetailCellRenderer() {
// }
//
// DetailCellRenderer.prototype.init = function(params) {
//     this.eGui = document.createElement('div');
//     this.eGui.innerHTML = '<div style="border: 2px solid green;">This is the detail grid</div>'
// };
//
// DetailCellRenderer.prototype.getGui = function() {
//     return this.eGui;
// };


setInterval( function() {
    console.log('setInterval ' + Math.random());
    masterGridOptions.api.forEachDetailGridApi( function(detailGridApi, id) {
        console.log('got api for ' + id);
        detailGridApi.stopEditing();
    });
}, 2000);