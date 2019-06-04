var columnDefs = [
    {headerName: 'Athlete', field: 'athlete', width: 150},
    {
        headerName: 'Age',
        field: 'age',
        width: 90,
        filter: 'agNumberColumnFilter',
        filterParams: {
            includeBlanksInEquals: false,
            includeBlanksInLessThan: false,
            includeBlanksInGreaterThan: false
        }
    },
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
            includeBlanksInEquals: false,
            includeBlanksInLessThan: false,
            includeBlanksInGreaterThan: false
        }
    },
    {   headerName: 'Description',
        valueGetter: '"Age is " + data.age + " and Date is " + data.date',
        width: 400
    },
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
            columnDefs[1].filterParams.includeBlanksInEquals = value;
            columnDefs[2].filterParams.includeBlanksInEquals = value;
            break;
        case 'lessThan':
            columnDefs[1].filterParams.includeBlanksInLessThan = value;
            columnDefs[2].filterParams.includeBlanksInLessThan = value;
            break;
        case 'greaterThan':
            columnDefs[1].filterParams.includeBlanksInGreaterThan = value;
            columnDefs[2].filterParams.includeBlanksInGreaterThan = value;
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
            athlete: 'Niall Crosby',
            age: 40,
            country: 'Spain',
            year: '2017',
            date: undefined,
            sport: 'Running',
            gold: 1,
            silver: 0,
            bronze: 0
        },
        {
            athlete: 'Sean Landsman',
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
            age: undefined,
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
