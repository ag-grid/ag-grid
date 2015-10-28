var monthlySalesModule = angular.module('monthlySales', ['agGrid']);

monthlySalesModule.controller('monthlySalesController', function($scope, $http) {

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
        {headerName : 'Jan', headerGroup: 'Monthly Data', field: 'jan', month: 0, cellRenderer: accountingCellRenderer,
            cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

        {headerName : 'Feb', headerGroup: 'Monthly Data', field: 'feb', month: 1, cellRenderer: accountingCellRenderer,
            cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

        {headerName : 'Mar', headerGroup: 'Monthly Data', field: 'mar', month: 2, cellRenderer: accountingCellRenderer,
            cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

        {headerName : 'Apr', headerGroup: 'Monthly Data', field: 'apr', month: 3, cellRenderer: accountingCellRenderer,
            cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

        {headerName : 'May', headerGroup: 'Monthly Data', field: 'may', month: 4, cellRenderer: accountingCellRenderer,
            cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

        {headerName : 'Jun', headerGroup: 'Monthly Data', field: 'jun', month: 5, cellRenderer: accountingCellRenderer,
            cellClass: 'cell-figure', valueGetter: monthValueGetter, cellClassRules: monthCellClassRules},

        {headerName : 'YTD', headerGroup: 'Totals', cellClass: 'cell-figure', cellRenderer: accountingCellRenderer,
            valueGetter: yearToDateValueGetter, cellStyle: {'font-weight': 'bold'}}

    ];

    $scope.gridOptions = {
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
        groupKeys: ['country'],
        rowHeight: 22,
        onModelUpdated: modelUpdated,
        groupSelectsChildren: true,
        context: {
            month: 0,
            months: ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
        },
        onReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        icons: {
            menu: '<i class="fa fa-bars"/>',
            filter: '<i class="fa fa-filter"/>',
            sortAscending: '<i class="fa fa-long-arrow-down"/>',
            sortDescending: '<i class="fa fa-long-arrow-up"/>',
            groupExpanded: '<i class="fa fa-minus-square-o"/>',
            groupContracted: '<i class="fa fa-plus-square-o"/>',
            headerGroupOpened: '<i class="fa fa-minus-square-o"/>',
            headerGroupClosed: '<i class="fa fa-plus-square-o"/>'
        },
        groupAggFunction: groupAggFunction
    };

    var monthNames = ['Full Year', 'Year to Jan', 'Year to Feb', 'Year to Mar', 'Year to Apr', 'Year to May',
        'Year to Jun', 'Year to Jul', 'Year to Aug', 'Year to Sep', 'Year to Oct', 'Year to Nov', 'Full Year',];

    $scope.monthName = monthNames[1];

    $scope.onChangeMonth = function(i) {
        var newMonth = $scope.gridOptions.context.month += i;

        if (newMonth < -1) {
            newMonth = -1;
        }
        if (newMonth > 5) {
            newMonth = 5;
        }

        $scope.gridOptions.context.month = newMonth;
        $scope.monthName = monthNames[newMonth + 1];
        $scope.gridOptions.api.refreshView();
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


    $http.get("../sample-data/monthlySales.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
            $scope.gridOptions.api.sizeColumnsToFit();
        });

    function modelUpdated() {
        if ($scope.gridOptions.rowData) {
            var model = $scope.gridOptions.api.getModel();
            var totalRows = $scope.gridOptions.rowData.length;
            var processedRows = model.getVirtualRowCount();
            $scope.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    }
});