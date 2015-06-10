
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    // Rates taken from google at time of writing
    var exchangeRates = {
        EUR: {
            GBP:.72,
            USD: 1.08
        },
        GBP: {
            EUR: 1.29,
            USD: 1.5
        },
        USD: {
            GBP: .67,
            EUR: .93
        }
    };

    var data = [
        {product: 'Product 1', currency: 'EUR', price: 644},
        {product: 'Product 2', currency: 'EUR', price: 354},
        {product: 'Product 3', currency: 'GBP', price: 429},
        {product: 'Product 4', currency: 'GBP', price: 143},
        {product: 'Product 5', currency: 'USD', price: 345},
        {product: 'Product 6', currency: 'USD', price: 982}
    ];

    var columnDefs = [
        {headerName: "Product", field: "product", width: 150},
        {headerName: "Currency", field: "currency", width: 150},
        {headerName: "Price Local", field: "price", width: 150},
        {headerName: "Report Price", width: 150,
            cellRenderer: reportingCurrencyCellRenderer,
            headerValueGetter: 'ctx.reportingCurrency'}
    ];

    // in the future, change this to a value getter
    function reportingCurrencyCellRenderer(params) {
        var fxRateSet = exchangeRates[params.context.reportingCurrency];
        var fxRate = fxRateSet[params.data.currency];
        if (fxRate) {
            return params.data.price * fxRate;
        } else {
            return params.data.price;
        }
    }

    $scope.currencies = ['EUR','GBP','USD'];

    $scope.currencyChanged = function() {
        $scope.gridOptions.api.refreshView();
        $scope.gridOptions.api.refreshHeader();
    };

    $scope.gridOptions = {
        context: {
            reportingCurrency: 'EUR'
        },
        columnDefs: columnDefs,
        rowData: data,
        dontUseScrolls: true
    };

});

