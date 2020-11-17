var gridOptions = {
    columnDefs: [
        { field: 'athlete', minWidth: 180 },
        { field: 'age' },
        { field: 'country', minWidth: 160 },
        { field: 'year' },
        { field: 'date', minWidth: 160 },
        { field: 'sport', minWidth: 180 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        editable: true,
        // we use a cell renderer to include a button, so when the button
        // gets clicked, the editing starts.
        cellRenderer: 'singleClickEditRenderer',
    },
    // set the bottom grid to no click editing
    suppressClickEdit: true,
    components: {
        singleClickEditRenderer: getRenderer()
    }
};

function getRenderer() {
    function CellRenderer() {
    }

    CellRenderer.prototype.createGui = function() {
        var template = '<span><button id="theButton" style="height: 39px">#</button><span id="theValue" style="padding-left: 4px;"></span></span>';
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        this.eGui = tempDiv.firstElementChild;
    };

    CellRenderer.prototype.init = function(params) {

        // create the gui
        this.createGui();
        // keep params, we use it in onButtonClicked
        this.params = params;

        // attach the value to the value span
        var eValue = this.eGui.querySelector('#theValue');

        eValue.innerHTML = params.value;
        // setup the button, first get reference to it
        this.eButton = this.eGui.querySelector('#theButton');

        // bind the listener so 'this' is preserved, also keep reference to it for removal
        this.buttonClickListener = this.onButtonClicked.bind(this);
        // add the listener
        this.eButton.addEventListener('click', this.buttonClickListener);
    };
    CellRenderer.prototype.onButtonClicked = function() {

        // start editing this cell. see the docs on the params that this method takes
        var startEditingParams = {
            rowIndex: this.params.rowIndex,
            colKey: this.params.column.getId()
        };
        this.params.api.startEditingCell(startEditingParams);
    };
    CellRenderer.prototype.getGui = function() {
        // returns our gui to the grid for this cell
        return this.eGui;
    };
    CellRenderer.prototype.destroy = function() {

        // be good, clean up the listener
        this.eButton.removeEventListener('click', this.buttonClickListener);
    };

    return CellRenderer;
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
