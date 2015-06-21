var fileBrowserModule = angular.module('account', ['angularGrid']);

fileBrowserModule.controller('accountController', function($scope) {

    var columnDefs = [
        {headerName: '', field: 'item', width: 200, cellRenderer: {
            renderer: 'group'
        }},
        {headerName: "Units", field: "amount1", headerGroup: 'Week 1', width: 70},
        {headerName: "GBP", field: "gbp1", headerGroup: 'Week 1', width: 70, cellRenderer: currencyRenderer},
        {headerName: "Units", field: "amount2", headerGroup: 'Week 2', width: 70},
        {headerName: "GBP", field: "gbp2", headerGroup: 'Week 2', width: 70, cellRenderer: currencyRenderer},
        {headerName: "Units", field: "amount3", headerGroup: 'Week 3', width: 70},
        {headerName: "GBP", field: "gbp3", headerGroup: 'Week 3', width: 70, cellRenderer: currencyRenderer},
        {headerName: "Units", field: "amountTotal", headerGroup: 'Period Total', width: 70},
        {headerName: "GBP", field: "gbpTotal", headerGroup: 'Period Total', width: 70, cellRenderer: currencyRenderer}
    ];

    function currencyRenderer(params) {
        if (params.value) {
            return '£ ' + params.value.toLocaleString();
        } else {
            return null;
        }
    }

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: createRowData(),
        rowSelection: 'single',
        groupKeys: ['category'],
        groupHeaders: true,
        groupDefaultExpanded: true,
        groupIncludeFooter: true,
        groupAggFields: ['amount1','gbp1','amount2','gbp2','amount3','gbp3','amount4','gbp4'],
        enableColResize: true,
        enableSorting: false,
        dontUseScrolls: true,
        groupSuppressAutoColumn: true,
        icons: {
            groupExpanded: '<i class="fa fa-minus-square-o"/>',
            groupContracted: '<i class="fa fa-plus-square-o"/>'
        },
        enableFilter: false
    };

    function createRowData() {
        var rows = [];
        ['Ales','Larger','Cider','Wine','Spirits'].forEach( function (item) {
            rows.push({category: 'Alcoholic Drinks', item: item});
        });

        ['Water','Juice','Soda','Milk'].forEach( function (item) {
            rows.push({category: 'Non-Alcoholic Drinks', item: item});
        });

        rows.forEach( function(row) {

            row.amount1 = Math.round(Math.random() * 100);
            row.amount2 = Math.round(Math.random() * 100);
            row.amount3 = Math.round(Math.random() * 100);
            row.amountTotal = row.amount1 + row.amount2 + row.amount3;

            row.gbp1 = row.amount1 * 22;
            row.gbp2 = row.amount2 * 22;
            row.gbp3 = row.amount3 * 22;
            row.gbpTotal = row.amountTotal * 22;
        });

        return rows;
    }
});
