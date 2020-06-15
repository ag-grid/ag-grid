var gridOptions = {
    columnDefs: [
        { field: 'athlete', filter: 'agCombinedColumnFilter' },
        {
            field: 'country',
            filter: 'agCombinedColumnFilter',
            filterParams: { combineWithFilter: 'text' }
        },
        {
            field: 'gold',
            filter: 'agCombinedColumnFilter',
            filterParams: { combineWithFilter: 'agNumberColumnFilter' }
        },
        {
            field: 'date',
            filter: 'agCombinedColumnFilter',
            filterParams: {
                combineWithFilter: 'agDateColumnFilter',
                comparator: function(filterDate, cellValue) {
                    if (cellValue == null) return -1;

                    var getDate = function(value) {
                        var dateParts = value.split('/');
                        return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
                    };

                    if (!(filterDate instanceof Date)) {
                        filterDate = getDate(filterDate);
                    }

                    var cellDate = getDate(cellValue);

                    if (filterDate.getTime() == cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterDate) {
                        return -1;
                    }

                    if (cellDate > filterDate) {
                        return 1;
                    }
                },
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
        floatingFilter: true,
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
