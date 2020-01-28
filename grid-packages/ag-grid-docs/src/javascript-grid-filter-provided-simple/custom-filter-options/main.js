var columnDefs = [
    {
        field: "athlete",
        width: 150,
        filterParams: {
            filterOptions: [
                'contains',
                {
                    displayKey: 'startsA',
                    displayName: 'Starts With "A"',
                    test: function(filterValue, cellValue) {
                        return cellValue != null && cellValue.indexOf('a')==0;
                    },
                    hideFilterInput: true
                },
                {
                    displayKey: 'startsB',
                    displayName: 'Starts With "N"',
                    test: function(filterValue, cellValue) {
                        return cellValue != null && cellValue.indexOf('n')==0;
                    },
                    hideFilterInput: true
                }
            ]
        }
    },
    {
        field: "age",
        width: 90,
        filter: 'agNumberColumnFilter',
        filterParams: {
            filterOptions: [
                'empty',
                {
                    displayKey: 'evenNumbers',
                    displayName: 'Even Numbers',
                    test: function(filterValue, cellValue) {
                        return cellValue != null && cellValue % 2 === 0;
                    },
                    hideFilterInput: true
                },
                {
                    displayKey: 'oddNumbers',
                    displayName: 'Odd Numbers',
                    test: function(filterValue, cellValue) {
                        return cellValue != null && cellValue % 2 !== 0;
                    },
                    hideFilterInput: true
                },
                {
                    displayKey: 'blanks',
                    displayName: 'Blanks',
                    test: function(filterValue, cellValue) {
                        return cellValue == null;
                    },
                    hideFilterInput: true
                },
            ],
            suppressAndOrCondition: true
        }
    },
    {
        field: "date",
        width: 145,
        filter:'agDateColumnFilter',
        filterParams: {
            filterOptions: [
                'equals',
                {
                    displayKey: 'equalsWithNulls',
                    displayName: 'Equals (with Nulls)',
                    test: function(filterValue, cellValue) {
                        if (cellValue == null) return true;

                        var parts = cellValue.split("/");
                        var cellDate = new Date(
                            Number(parts[2]),
                            Number(parts[1] - 1),
                            Number(parts[0])
                        );

                        return cellDate.getTime() === filterValue.getTime();
                    }
                },

            ],
            comparator: function (filterLocalDateAtMidnight, cellValue){
                var dateAsString = cellValue;
                if (dateAsString == null) return -1;
                var dateParts  = dateAsString.split("/");
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                    return 0
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            },
            browserDatePicker: true
        }
    },
    {
        field: "country",
        width: 120,
        filterParams: {
            filterOptions: [
                // 'equals',
                'notEqual',
                {
                    displayKey: 'notEqualNoNulls',
                    displayName: 'Not Equals without Nulls',
                    test: function(filterValue, cellValue) {
                        if (cellValue == null) return false;
                        return cellValue !== filterValue;
                    }
                }
            ]
        }
    },
    {headerName: "Gold", field: "gold", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Total", field: "total", width: 100, filter: false}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        sortable: true,
        filter: true
    },
    localeTextFunc: function(key, defaultValue) {
        if (key === 'notEqualNoNulls') {
            return '* Not Equals (No Nulls) *'
        }
        return defaultValue;
    }
};

function printState() {
    var filterState = gridOptions.api.getFilterModel();
    console.log("filterState: ", filterState);
}

function saveState() {
    window.filterState = gridOptions.api.getFilterModel();
    console.log('filter state saved');
}

function restoreState() {
    gridOptions.api.setFilterModel(window.filterState);
    console.log('filter state restored');
}

function resetState() {
    gridOptions.api.setFilterModel(null);
    console.log('column state reset');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/latest/packages/ag-grid-docs/src/javascript-grid-filter-provided-simple/custom-filter-options/data/data.json'})
        .then(function (data) {
            gridOptions.api.setRowData(data);
        }
    );
});