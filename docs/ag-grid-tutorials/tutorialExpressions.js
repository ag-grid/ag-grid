
(function() {

    document.addEventListener('DOMContentLoaded', function() {

        var gridDiv = document.querySelector('#myGrid');

        var monthValueGetter = "ctx.selectedMonth<colDef.monthIndex ? data[colDef.field + '_bud'] : data[colDef.field + '_act']";
        var monthCellClassRules = {
            'actual': 'ctx.selectedMonth >= colDef.monthIndex',
            'budget': 'ctx.selectedMonth < colDef.monthIndex',
            'negative': 'x < 0'
        };

        var gridOptions = {
            context: {selectedMonth: 0},
            columnDefs: [
                {headerName: 'Country', field: 'country'},
                {headerName: 'City', field: 'city'},
                {headerName: 'Jan', field: 'jan', monthIndex: 0, valueGetter: monthValueGetter,
                    cellClassRules: monthCellClassRules, cellRenderer: numberCellRenderer,
                    cellClass: 'rightAlign'},
                {headerName: 'Feb', field: 'feb', monthIndex: 1, valueGetter: monthValueGetter,
                    cellClassRules: monthCellClassRules, cellRenderer: numberCellRenderer,
                    cellClass: 'rightAlign'},
                {headerName: 'Mar', field: 'mar', monthIndex: 2, valueGetter: monthValueGetter,
                    cellClassRules: monthCellClassRules, cellRenderer: numberCellRenderer,
                    cellClass: 'rightAlign'},
                {headerName: 'Apr', field: 'apr', monthIndex: 3, valueGetter: monthValueGetter,
                    cellClassRules: monthCellClassRules, cellRenderer: numberCellRenderer,
                    cellClass: 'rightAlign'},
                {headerName: 'May', field: 'may', monthIndex: 4, valueGetter: monthValueGetter,
                    cellClassRules: monthCellClassRules, cellRenderer: numberCellRenderer,
                    cellClass: 'rightAlign'},
                {headerName: 'YTD Act',
                    valueGetter:
                    '    var total = 0;' +
                    '    if (ctx.selectedMonth>=0) {total += data.jan_act;}' +
                    '    if (ctx.selectedMonth>=1) {total += data.feb_act;}' +
                    '    if (ctx.selectedMonth>=2) {total += data.mar_act;}' +
                    '    if (ctx.selectedMonth>=3) {total += data.apr_act;}' +
                    '    if (ctx.selectedMonth>=4) {total += data.may_act;}' +
                    '    return total;',
                    cellRenderer: numberCellRenderer, cellClass: 'rightAlign'}
            ]
        };

        function numberCellRenderer(params) {
            if (params.value < 0) {
                return '(' + (params.value*-1).toLocaleString() + ')';
            } else {
                return params.value.toLocaleString();
            }
        }

        new ag.grid.Grid(gridDiv, gridOptions);

        jsonLoad( function(data) {
            gridOptions.api.setRowData(data);
            gridOptions.api.sizeColumnsToFit();
        });

        document.querySelector('#btMonthDown').addEventListener('click', function() {
            gridOptions.context.selectedMonth--;
            gridOptions.api.refreshView();
        });
        document.querySelector('#btMonthUp').addEventListener('click', function() {
            gridOptions.context.selectedMonth++;
            gridOptions.api.refreshView();
        });
    });

})();


function jsonLoad(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../sample-data/monthlySales.json'); // by default async
    xhr.responseType = 'json'; // in which format you expect the response to be

    xhr.onload = function() {
        if(this.status == 200) {// onload called even on 404 etc so check the status
            callback(this.response);
        }
    };

    xhr.onerror = function() {
        console.log('loading data error');
    };

    xhr.send();
}