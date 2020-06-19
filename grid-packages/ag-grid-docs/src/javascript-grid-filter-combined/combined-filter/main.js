var gridOptions = {
    columnDefs: [
        { field: 'athlete', filter: 'agCombinedColumnFilter' },
        {
            field: 'country',
            filter: 'agCombinedColumnFilter',
            filterParams: {
                wrappedFilter: {
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        defaultOption: 'contains',
                        alwaysShowBothConditions: false,
                    }
                }
            }
        },
        {
            field: 'gold',
            filter: 'agCombinedColumnFilter',
            filterParams: {
                wrappedFilter: {
                    filter: 'agNumberColumnFilter',
                }
            }
        },
        {
            field: 'date',
            filter: 'agCombinedColumnFilter',
            filterParams: {
                wrappedFilter: {
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        comparator: function(filterDate, cellValue) {
                            if (cellValue == null) return -1;

                            return getDate(cellValue) - filterDate;
                        },
                    }
                },
                comparator: function(a, b) {
                    return getDate(a) - getDate(b);
                }
            }
        },
        {
            field: 'year',
            filter: 'agCombinedColumnFilter',
            filterParams: {
                wrappedFilter: {
                    filter: YearFilter,
                }
            }
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
        floatingFilter: true,
    }
};

function getDate(value) {
    var dateParts = value.split('/');
    return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
};

var savedFilterState;

function printState() {
    var filterState = gridOptions.api.getFilterModel();
    console.log('Current filter state: ', filterState);
}

function saveState() {
    savedFilterState = gridOptions.api.getFilterModel();
    console.log('Filter state saved');
}

function restoreState() {
    gridOptions.api.setFilterModel(savedFilterState);
    console.log('Filter state restored');
}

function resetState() {
    gridOptions.api.setFilterModel(null);
    console.log('Filter state reset');
}

function YearFilter() {
}

YearFilter.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div style="display: flex; justify-content: center;">' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFilter" checked="true" id="rbAllYears" /> All' +
        '</label>' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFilter" id="rbSince2010" /> Since 2010' +
        '</label>' +
        '</div>';
    this.eGui.querySelector('#rbAllYears').addEventListener('change', params.filterChangedCallback.bind(this));
    this.rbSince2010 = this.eGui.querySelector('#rbSince2010');
    this.rbSince2010.addEventListener('change', params.filterChangedCallback.bind(this));
    this.filterActive = false;
};

YearFilter.prototype.getGui = function() {
    return this.eGui;
};

YearFilter.prototype.doesFilterPass = function(params) {
    return params.data.year >= 2010;
};

YearFilter.prototype.isFilterActive = function() {
    return this.rbSince2010.checked;
};

// this example isn't using getModel() and setModel(),
// so safe to just leave these empty. don't do this in your code!!!
YearFilter.prototype.getModel = function() {
};

YearFilter.prototype.setModel = function() {
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
