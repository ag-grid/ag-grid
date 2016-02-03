var monthValueGetter = '(ctx.month < colDef.month) ? data[colDef.field + "_bud"] : data[colDef.field + "_act"]';
var monthCellClassRules = {
    'cell-act': 'ctx.month < colDef.month',
    'cell-bud': 'ctx.month >= colDef.month',
    'cell-negative': 'x < 0'
};
var yearToDateValueGetter = 'var total = 0; ctx.months.forEach( function(monthName, monthIndex) { if (monthIndex<=ctx.month) { total += data[monthName + "_act"]; } }); return total; ';
var accountingCellRenderer = function(params) {
    if (params.value >= 0) {
        return params.value.toLocaleString();
    } else {
        return '(' + Math.abs(params.value).toLocaleString() + ')';
    }
};

var columnDefs = [
    {
        headerName: 'Monthly Data',
        children: [
            {headerName : 'Jan', field: 'jan', month: 0, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

            {headerName : 'Feb', field: 'feb', month: 1, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

            {headerName : 'Mar', field: 'mar', month: 2, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

            {headerName : 'Apr', field: 'apr', month: 3, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

            {headerName : 'May', field: 'may', month: 4, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

            {headerName : 'Jun', field: 'jun', month: 5, cellRenderer: accountingCellRenderer,
                cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

            {headerName : 'YTD', cellClass: 'cell-figure', cellRenderer: accountingCellRenderer,
                valueGetter: yearToDateValueGetter, cellStyle: {'font-weight': 'bold'}}
        ]
    },
    {
        field: 'country', rowGroupIndex: 0
    }
];

var gridOptions = {
    groupColumnDef: {headerName : "Location", field: "city", width: 200,
        cellRenderer: {
            renderer: 'group',
            checkbox: true
        }
    },
    columnDefs: columnDefs,
    colWidth: 100,
    rowSelection: 'multiple',
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    groupHeaders: true,
    rowHeight: 22,
    onModelUpdated: modelUpdated,
    groupSelectsChildren: true,
    groupHideGroupColumns: true,
    context: {
        month: 0,
        months: ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    },
    onGridReady: function(event) {
        event.api.sizeColumnsToFit();
    },
    icons: {
        menu: '<i class="fa fa-bars"/>',
        filter: '<i class="fa fa-filter"/>',
        sortAscending: '<i class="fa fa-long-arrow-down"/>',
        sortDescending: '<i class="fa fa-long-arrow-up"/>',
        groupExpanded: '<i class="fa fa-minus-square-o"/>',
        groupContracted: '<i class="fa fa-plus-square-o"/>',
        columnGroupOpened: '<i class="fa fa-minus-square-o"/>',
        columnGroupClosed: '<i class="fa fa-plus-square-o"/>'
    },
    groupAggFunction: groupAggFunction
};

var monthNames = ['Budget Only', 'Year to Jan', 'Year to Feb', 'Year to Mar', 'Year to Apr', 'Year to May',
    'Year to Jun', 'Year to Jul', 'Year to Aug', 'Year to Sep', 'Year to Oct', 'Year to Nov', 'Full Year'];

onChangeMonth = function(i) {
    var newMonth = gridOptions.context.month += i;

    if (newMonth < -1) {
        newMonth = -1;
    }
    if (newMonth > 5) {
        newMonth = 5;
    }

    gridOptions.context.month = newMonth;
    document.querySelector('#monthName').innerHTML = monthNames[newMonth + 1];
    gridOptions.api.refreshView();
};

function groupAggFunction(rows) {

    var aggFields = [
            'jan_act','jan_bud','feb_act','feb_bud','mar_act','mar_bud',
            'apr_act','apr_bud','may_act','may_bud','jun_act','jun_bud',
            'jul_act','jul_bud','aug_act','aug_bud','sep_act','sep_bud',
            'oct_act','oct_bud','nov_act','nov_bud','dec_act','dec_bud'];

    var data = {};

    for (var j = 0; j<aggFields.length; j++) {
        data[aggFields[j]] = 0;
    }

    for (var i = 0; i<rows.length; i++) {
        for (var k = 0; k<aggFields.length; k++) {
            var aggField = aggFields[k];
            var row = rows[i];
            data[aggField] += row.data[aggField];
        }
    }

    return data;
}

function onQuickFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../sample-data/monthlySales.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
            gridOptions.api.sizeColumnsToFit();
        }
    };
});

function modelUpdated() {
    if (gridOptions.rowData) {
        var model = gridOptions.api.getModel();
        var totalRows = gridOptions.rowData.length;
        var processedRows = model.getVirtualRowCount();
        document.querySelector('#rowCount').innerHTML = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
    }
}
