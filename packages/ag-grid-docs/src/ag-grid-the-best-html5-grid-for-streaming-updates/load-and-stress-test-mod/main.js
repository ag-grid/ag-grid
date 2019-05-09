"use strict";
var columnDefs = [
        // these are the row groups, so they are all hidden (they are showd in the group column)
        {headerName: 'Hierarchy', children: [
            {headerName: 'Product', field: 'product', type: 'dimension', rowGroupIndex: 0, hide: true},
            {headerName: 'Portfolio', field: 'portfolio', type: 'dimension', rowGroupIndex: 1, hide: true},
            {headerName: 'Book', field: 'book', type: 'dimension', rowGroupIndex: 2, hide: true}
        ]},

        // some string values, that do not get aggregated
        // {headerName: 'Attributes', children: [
        //         {headerName: 'Trade', field: 'trade', width: 100},
        //         {headerName: 'Deal Type', field: 'dealType', type: 'dimension'},
        //         {headerName: 'Bid', field: 'bidFlag', type: 'dimension', width: 100}
        // ]},

        // all the other columns (visible and not grouped)
        {headerName: 'Values', children: [
                {headerName: 'Current', field: 'current', type: 'measure'},
                {headerName: 'Previous', field: 'previous', type: 'measure'},
                {headerName: 'PL 1', field: 'pl1', type: 'measure'},
                {headerName: 'PL 2', field: 'pl2', type: 'measure'},
                {headerName: 'Gain-DX', field: 'gainDx', type: 'measure'},
                {headerName: 'SX / PX', field: 'sxPx', type: 'measure'},
                {headerName: '99 Out', field: '_99Out', type: 'measure'},
                {headerName: 'Submitter ID', field: 'submitterID', type: 'measure'},
                {headerName: 'Submitted Deal ID', field: 'submitterDealID', type: 'measure'}
        ]}
    ];

var gridOptions = {
    getRowNodeId: function(data) { return data.trade; },
    columnTypes: {
        dimension: {
            enableRowGroup: true,
            enablePivot: true
        },
        measure: {
            width: 150,
            aggFunc: 'sum',
            enableValue: true,
            cellClass: 'number',
            valueFormatter: numberCellFormatter,
            cellRenderer:'agAnimateShowChangeCellRenderer'
        }
    },
    defaultColDef: {
        width: 120,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        width: 200
    },
    columnDefs: columnDefs,
    animateRows: true,

    enableCharts: true,


    enableRangeSelection: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    suppressAggFuncInHeader: true,
    sideBar: {
        toolPanels: ['columns','filters'],
        defaultToolPanel: ''
    }
};

function onStartLoad() {
    worker.postMessage('startLoad');
}

function onStopMessages() {
    worker.postMessage('stop');
}

function onColumnsGroup() {
    gridOptions.columnApi.setPivotMode(false);
    gridOptions.columnApi.setColumnState([{"colId":"product","hide":true,"width":120,"rowGroupIndex":0},{"colId":"portfolio","hide":true,"width":120,"rowGroupIndex":1},{"colId":"book","hide":true,"width":120,"rowGroupIndex":2},{"colId":"trade","width":100},{"colId":"dealType","width":120},{"colId":"bidFlag","width":100},{"colId":"current","aggFunc":"sum","width":150},{"colId":"previous","aggFunc":"sum","width":150},{"colId":"pl1","aggFunc":"sum","width":150},{"colId":"pl2","aggFunc":"sum","width":150},{"colId":"gainDx","aggFunc":"sum","width":150},{"colId":"sxPx","aggFunc":"sum","width":150},{"colId":"_99Out","aggFunc":"sum","width":150},{"colId":"submitterID","aggFunc":"sum","width":150},{"colId":"submitterDealID","aggFunc":"sum","width":150}]);
}

function onColumnsPivot() {
    gridOptions.columnApi.setPivotMode(true);
    gridOptions.columnApi.setColumnState([{"colId":"product","hide":true,"width":120,"rowGroupIndex":0},{"colId":"portfolio","width":120,"pivotIndex":0},{"colId":"book","hide":true,"width":120,"rowGroupIndex":1},{"colId":"trade","width":100},{"colId":"dealType","width":120},{"colId":"bidFlag","width":100},{"colId":"current","aggFunc":"sum","width":150},{"colId":"previous","aggFunc":"sum","width":150},{"colId":"pl1","width":150},{"colId":"pl2","width":150},{"colId":"gainDx","width":150},{"colId":"sxPx","width":150},{"colId":"_99Out","width":150},{"colId":"submitterID","width":150},{"colId":"submitterDealID","width":150}]);
}

function onColumnsFlat() {
    gridOptions.columnApi.setPivotMode(false);
    gridOptions.columnApi.setColumnState([{"colId": "product", "width": 120}, {"colId": "portfolio", "width": 120}, {"colId": "book", "width": 120}, {"colId": "trade", "width": 100}, {"colId": "dealType", "width": 120}, {"colId": "bidFlag", "width": 100}, {"colId": "current", "width": 150}, {"colId": "previous", "width": 150}, {"colId": "pl1", "width": 150}, {"colId": "pl2", "width": 150}, {"colId": "gainDx", "width": 150}, {"colId": "sxPx", "width": 150}, {"colId": "_99Out", "width": 150}, {"colId": "submitterID", "width": 150}, {"colId": "submitterDealID", "width": 150}]);
}

var worker;

function startWorker() {

    worker = new Worker(__basePath + 'worker.js');

    worker.onmessage = function(e) {
        switch (e.data.type) {
            case 'setRowData':
                gridOptions.api.setRowData(e.data.records);
                break;
            case 'updateData':
                gridOptions.api.batchUpdateRowData({update: e.data.records});
                break;
            default:
                console.log('unrecognised event type ' + e.type);
        }
    };
}

function numberCellFormatter(params) {
    return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

// after page is loaded, create the grid.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    startWorker();
    // onStartLoad();
});
