var columnDefs = [
    {headerName: 'Athlete', field: 'athlete', width: 150},
    {
        headerName: 'Age',
        field: 'age',
        width: 90,
        filter: 'agNumberColumnFilter',
        filterParams: {
            includeNullInEquals: false,
            includeNullInLessThan: false,
            includeNullInGreaterThan: false
        }
    },
    {headerName: 'Country', field: 'country', width: 120},
    {headerName: 'Year', field: 'year', width: 90},
    {
        headerName: 'Date',
        field: 'date',
        width: 145,
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: function(filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
                if (dateAsString == null) return -1;
                var dateParts = dateAsString.split('/');
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                    return 0;
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            },
            includeNullInEquals: false,
            includeNullInLessThan: false,
            includeNullInGreaterThan: false
        }
    },
    {headerName: 'Sport', field: 'sport', width: 110},
    {headerName: 'Gold', field: 'gold', width: 100, filter: 'agNumberColumnFilter'},
    {headerName: 'Silver', field: 'silver', width: 100, filter: 'agNumberColumnFilter'},
    {headerName: 'Bronze', field: 'bronze', width: 100, filter: 'agNumberColumnFilter'},
    {headerName: 'Total', field: 'total', width: 100, filter: false}
];

var gridOptions = {
    defaultColDef: {
        filter: true
    },
    columnDefs: columnDefs,
    rowData: null
};

function changeNull(toChange, value) {
    switch (toChange) {
        case 'equals':
            columnDefs[1].filterParams.includeNullInEquals = value;
            columnDefs[4].filterParams.includeNullInEquals = value;
            break;
        case 'lessThan':
            columnDefs[1].filterParams.includeNullInLessThan = value;
            columnDefs[4].filterParams.includeNullInLessThan = value;
            break;
        case 'greaterThan':
            columnDefs[1].filterParams.includeNullInGreaterThan = value;
            columnDefs[4].filterParams.includeNullInGreaterThan = value;
            break;
    }
    var filterModel = gridOptions.api.getFilterModel();
    gridOptions.api.setColumnDefs(columnDefs);
    gridOptions.api.destroyFilter('age');
    gridOptions.api.destroyFilter('date');
    gridOptions.api.setFilterModel(filterModel);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    gridOptions.api.setRowData([
        {
            athlete: 'Alberto Gutierrez',
            age: 36,
            country: 'Spain',
            year: '2017',
            date: null,
            sport: 'Squash',
            gold: 1,
            silver: 0,
            bronze: 0
        },
        {
            athlete: 'Alberto Gutierrez',
            age: 36,
            country: 'Spain',
            year: '2017',
            date: null,
            sport: 'Running',
            gold: 1,
            silver: 0,
            bronze: 0
        },
        {
            athlete: 'John Masterson',
            age: null,
            country: 'Rainland',
            year: '2017',
            date: '25/10/2016',
            sport: 'Running',
            gold: 0,
            silver: 0,
            bronze: 1
        },
        {
            athlete: 'Robert Clarke',
            age: null,
            country: 'Raveland',
            year: '2017',
            date: '25/10/2016',
            sport: 'Squash',
            gold: 0,
            silver: 0,
            bronze: 1
        }
    ]);
});
