var columnDefs = [
    { field: "athlete", minWidth: 150, filter: PersonFilter },
    { field: "age", filter: 'agNumberColumnFilter' },
    { field: "country", minWidth: 150 },
    { field: "year", filter: YearFilter },
    {
        field: "date", minWidth: 130, filter: 'agDateColumnFilter', filterParams: {
            comparator: function(filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
                var dateParts = dateAsString.split("/");
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                    return 0;
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            }
        }
    },
    { field: "sport" },
    { field: "gold", filter: 'agNumberColumnFilter' },
    { field: "silver", filter: 'agNumberColumnFilter' },
    { field: "bronze", filter: 'agNumberColumnFilter' },
    { field: "total", filter: 'agNumberColumnFilter' }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    columnDefs: columnDefs,
    rowData: null
};

function PersonFilter() {
}

PersonFilter.prototype.init = function(params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.setupGui(params);
};

// not called by ag-Grid, just for us to help setup
PersonFilter.prototype.setupGui = function(params) {
    this.gui = document.createElement('div');
    this.gui.innerHTML =
        '<div style="padding: 4px; width: 200px;">' +
        '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
        '<div style="margin-top: 20px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
        '<div style="margin-top: 20px;">Just to iterate anything can go in here, here is an image!!</div>' +
        '<div><img src="https://www.ag-grid.com/images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
        '</div>';

    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener("changed", listener);
    this.eFilterText.addEventListener("paste", listener);
    this.eFilterText.addEventListener("input", listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    this.eFilterText.addEventListener("keydown", listener);
    this.eFilterText.addEventListener("keyup", listener);

    var that = this;

    function listener(event) {
        that.filterText = event.target.value;
        params.filterChangedCallback();
    }
};

PersonFilter.prototype.getGui = function() {
    return this.gui;
};

PersonFilter.prototype.doesFilterPass = function(params) {
    // make sure each word passes separately, ie search for firstname, lastname
    var passed = true;
    var valueGetter = this.valueGetter;
    this.filterText.toLowerCase().split(" ").forEach(function(filterWord) {
        var value = valueGetter(params);
        if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
            passed = false;
        }
    });

    return passed;
};

PersonFilter.prototype.isFilterActive = function() {
    return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
};

PersonFilter.prototype.getModel = function() {
    var model = { value: this.filterText.value };
    return model;
};

PersonFilter.prototype.setModel = function(model) {
    this.eFilterText.value = model.value;
};

function YearFilter() {
}

YearFilter.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div style="display: inline-block; width: 400px;">' +
        '<div style="padding: 10px; background-color: #d3d3d3; text-align: center;">' +
        'This is a very wide filter' +
        '</div>' +
        '<label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">' +
        '  <input type="radio" name="yearFilter" checked="true" id="rbAllYears" filter-checkbox="true"/> All' +
        '</label>' +
        '<label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">' +
        '  <input type="radio" name="yearFilter" id="rbSince2010" filter-checkbox="true"/> Since 2010' +
        '</label>' +
        '</div>';
    this.rbAllYears = this.eGui.querySelector('#rbAllYears');
    this.rbSince2010 = this.eGui.querySelector('#rbSince2010');
    this.rbAllYears.addEventListener('change', this.onRbChanged.bind(this));
    this.rbSince2010.addEventListener('change', this.onRbChanged.bind(this));
    this.filterActive = false;
    this.filterChangedCallback = params.filterChangedCallback;
    this.valueGetter = params.valueGetter;
};

YearFilter.prototype.onRbChanged = function() {
    this.filterActive = this.rbSince2010.checked;
    this.filterChangedCallback();
};

YearFilter.prototype.getGui = function() {
    return this.eGui;
};

YearFilter.prototype.doesFilterPass = function(params) {
    return params.data.year >= 2010;
};

YearFilter.prototype.isFilterActive = function() {
    return this.filterActive;
};

YearFilter.prototype.getModel = function() {
    var model = { value: this.rbSince2010.checked };
    return model;
};

YearFilter.prototype.setModel = function(model) {
    this.rbSince2010.checked = model.value;
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
