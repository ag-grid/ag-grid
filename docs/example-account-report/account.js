var valueCellStyle = {
    'text-align': 'right'
};

var columnDefs = [
    {
        field: "category", rowGroupIndex: 0, hide: true
    },
    {
        headerName: 'Week 1',
        children: [
            {headerName: "Units", field: "amount1", width: 70, aggFunc: 'sum', cellStyle: valueCellStyle},
            {headerName: "GBP", field: "gbp1", width: 70, cellRenderer: currencyRenderer, aggFunc: 'sum', cellStyle: valueCellStyle}
        ]
    },
    {
        headerName: 'Week 2',
        children: [
            {headerName: "Units", field: "amount2", width: 70, aggFunc: 'sum', cellStyle: valueCellStyle},
            {headerName: "GBP", field: "gbp2", width: 70, cellRenderer: currencyRenderer, aggFunc: 'sum', cellStyle: valueCellStyle}
        ]
    },
    {
        headerName: 'Week 3',
        children: [
            {headerName: "Units", field: "amount3", width: 70, aggFunc: 'sum', cellStyle: valueCellStyle},
            {headerName: "GBP", field: "gbp3", width: 70, cellRenderer: currencyRenderer, aggFunc: 'sum', cellStyle: valueCellStyle}
        ]
    },
    {
        headerName: 'Period Total',
        children: [
            {headerName: "Units", field: "amountTotal", width: 70, aggFunc: 'sum', cellStyle: valueCellStyle},
            {headerName: "GBP", field: "gbpTotal", width: 70, cellRenderer: currencyRenderer, aggFunc: 'sum', cellStyle: valueCellStyle}
        ]
    }
];

function currencyRenderer(params) {
    if (params.value) {
        return '£ ' + params.value.toLocaleString();
    } else {
        return null;
    }
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    rowSelection: 'single',
    groupHeaders: true,
    groupDefaultExpanded: -1,
    groupIncludeFooter: true,
    enableColResize: true,
    enableSorting: false,
    forPrint: true,
    icons: {
        groupExpanded: '<i class="fa fa-minus-square-o"></i>',
        groupContracted: '<i class="fa fa-plus-square-o"></i>'
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});