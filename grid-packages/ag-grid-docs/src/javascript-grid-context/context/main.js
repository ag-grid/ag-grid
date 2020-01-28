function reportingCurrencyValueGetter(params) {
    // Rates taken from google at time of writing
    var exchangeRates = {
        EUR: {
            GBP: 0.72,
            USD: 1.08
        },
        GBP: {
            EUR: 1.29,
            USD: 1.5
        },
        USD: {
            GBP: 0.67,
            EUR: 0.93
        }
    };

    var price = params.data[params.colDef.field];
    var reportingCurrency = params.context.reportingCurrency;
    var fxRateSet = exchangeRates[reportingCurrency];
    var fxRate = fxRateSet[price.currency];
    var priceInReportingCurrency;
    if (fxRate) {
        priceInReportingCurrency = price.amount * fxRate;
    } else {
        priceInReportingCurrency = price.amount;
    }

    var result = {
        currency: reportingCurrency,
        amount: priceInReportingCurrency
    };

    return result;
}

function getCurrencyCellRenderer() {
    var gbpFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2
    });
    var eurFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    });
    var usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    function currencyCellRenderer(params) {
        switch (params.value.currency) {
            case 'EUR':
                return eurFormatter.format(params.value.amount);
            case 'USD':
                return usdFormatter.format(params.value.amount);
            case 'GBP':
                return gbpFormatter.format(params.value.amount);
        }
    }

    return currencyCellRenderer;
}

var rowData = [
    {product: 'Product 1', price: {currency: 'EUR', amount: 644}},
    {product: 'Product 2', price: {currency: 'EUR', amount: 354}},
    {product: 'Product 3', price: {currency: 'GBP', amount: 429}},
    {product: 'Product 4', price: {currency: 'GBP', amount: 143}},
    {product: 'Product 5', price: {currency: 'USD', amount: 345}},
    {product: 'Product 6', price: {currency: 'USD', amount: 982}}
];

var columnDefs = [
    {headerName: 'Product', field: 'product', width: 150},
    {headerName: 'Currency', field: 'price.currency', width: 150},
    {
        headerName: 'Price Local',
        field: 'price',
        cellStyle: {'text-align': 'right'},
        cellRenderer: 'currencyCellRenderer',
        width: 150
    },
    {
        headerName: 'Report Price',
        width: 150,
        field: 'price',
        cellStyle: {'text-align': 'right'},
        cellRenderer: 'currencyCellRenderer',
        valueGetter: reportingCurrencyValueGetter,
        headerValueGetter: 'ctx.reportingCurrency'
    }
];

function currencyChanged() {
    var value = document.getElementById('currency').value;
    gridOptions.context = {reportingCurrency: value};
    gridOptions.api.refreshCells();
    gridOptions.api.refreshHeader();
}

var gridOptions = {
    context: {
        reportingCurrency: 'EUR'
    },
    columnDefs: columnDefs,
    rowData: rowData,
    components:{
        currencyCellRenderer:getCurrencyCellRenderer()
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
