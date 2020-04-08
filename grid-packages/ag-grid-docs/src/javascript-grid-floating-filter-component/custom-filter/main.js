
var columnDefs = [
    { field: 'athlete', width: 150, filter: false },
    { field: 'gold', width: 100, filter: 'customNumberFilter', suppressMenu: true },
    { field: 'silver', width: 100, filter: 'customNumberFilter', suppressMenu: true },
    { field: 'bronze', width: 100, filter: 'customNumberFilter', suppressMenu: true },
    { field: 'total', width: 100, filter: 'customNumberFilter', suppressMenu: true }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        resizable: true,
    },
    components: {
        customNumberFilter: getNumberFilterComponent()
    },
    columnDefs: columnDefs,
    rowData: null
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNumberFilterComponent() {
    function NumberFilter() {
    }

    NumberFilter.prototype.init = function(params) {
        this.valueGetter = params.valueGetter;
        this.filterText = null;
        this.params = params;
        this.setupGui();
    };

    // not called by ag-Grid, just for us to help setup
    NumberFilter.prototype.setupGui = function() {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Greater than: </div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Number of medals..."/></div>' +
            '</div>';

        var that = this;
        this.onFilterChanged = function() {
            that.extractFilterText();
            that.params.filterChangedCallback();
        };

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener('input', this.onFilterChanged);
    };

    NumberFilter.prototype.extractFilterText = function() {
        this.filterText = this.eFilterText.value;
    };

    NumberFilter.prototype.getGui = function() {
        return this.gui;
    };

    NumberFilter.prototype.doesFilterPass = function(params) {
        var valueGetter = this.valueGetter;
        var value = valueGetter(params);
        var filterValue = this.filterText;

        if (this.isFilterActive()) {
            if (!value) return false;
            return Number(value) > Number(filterValue);
        }
    };

    NumberFilter.prototype.isFilterActive = function() {
        return this.filterText !== null &&
            this.filterText !== undefined &&
            this.filterText !== '' &&
            isNumeric(this.filterText);
    };

    NumberFilter.prototype.getModel = function() {
        return this.isFilterActive() ? Number(this.eFilterText.value) : null;
    };

    NumberFilter.prototype.setModel = function(model) {
        this.eFilterText.value = model;
        this.extractFilterText();
    };


    NumberFilter.prototype.destroy = function() {
        this.eFilterText.removeEventListener('input', this.onFilterChanged);
    };

    NumberFilter.prototype.getModelAsString = function() {
        return this.isFilterActive() ? '>' + this.filterText : '';
    };

    return NumberFilter;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
