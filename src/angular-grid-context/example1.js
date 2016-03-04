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
    {headerName: "Price Local", field: "price",
        cellStyle: {'text-align': 'right'},
        cellRenderer: actualCurrencyCellRenderer,
        width: 150},
    {headerName: "Report Price", width: 150,
        cellStyle: {'text-align': 'right'},
        cellRenderer: reportingCurrencyCellRenderer,
        headerValueGetter: 'ctx.reportingCurrency'}
];

function actualCurrencyCellRenderer(params) {
    switch (params.data.currency) {
        case 'EUR': return eurFormatter.format(params.value);
        case 'USD': return usdFormatter.format(params.value);
        case 'GBP': return gbpFormatter.format(params.value);
    }
}

function reportingCurrencyCellRenderer(params) {
    var reportingCurrency = params.context.reportingCurrency;
    var fxRateSet = exchangeRates[reportingCurrency];
    var fxRate = fxRateSet[params.data.currency];
    var value;
    if (fxRate) {
        value = params.data.price * fxRate;
    } else {
        value = params.data.price;
    }
    switch (reportingCurrency) {
        case 'EUR': return eurFormatter.format(value);
        case 'USD': return usdFormatter.format(value);
        case 'GBP': return gbpFormatter.format(value);
    }
}

var currencyChanged = function(value) {
    gridOptions.context.reportingCurrency = value;
    gridOptions.api.refreshView();
    gridOptions.api.refreshHeader();
};

var gridOptions = {
    context: {
        reportingCurrency: 'EUR'
    },
    columnDefs: columnDefs,
    rowData: data
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

