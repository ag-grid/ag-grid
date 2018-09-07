var columnDefs = [
    {headerName: 'Athlete', field: 'athlete'},
    {headerName: 'Age', field: 'age'},
    {headerName: 'Country', field: 'country'},
    {headerName: 'Year', field: 'year'},
    {headerName: 'Date', field: 'date'},
    {headerName: 'Sport', field: 'sport'},
    {headerName: 'Gold', field: 'gold'},
    {headerName: 'Silver', field: 'silver'},
    {headerName: 'Bronze', field: 'bronze'},
    {headerName: 'Total', field: 'total'}
];

var gridOptions = {
    // this is a handy way to set defaults onto the columns
    defaultColDef: {
        editable: true,
        // we use a cell renderer to include a button, so when the button
        // gets clicked, the editing starts.
        cellRenderer: 'singleClickEditRenderer'
    },
    columnDefs: columnDefs,
    // set the bottom grid to no click editing
    suppressClickEdit: true,
    components:{
        singleClickEditRenderer:getRenderer()
    }
};

function getRenderer() {
    function CellRenderer() {
    }

    CellRenderer.prototype.createGui = function () {


        var template = '<span><button id="theButton">#</button><span id="theValue" style="padding-left: 4px;"></span></span>';
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        this.eGui = tempDiv.firstElementChild;
    };

    CellRenderer.prototype.init = function (params) {

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
    CellRenderer.prototype.onButtonClicked = function () {

        // start editing this cell. see the docs on the params that this method takes
        var startEditingParams = {
            rowIndex: this.params.rowIndex,
            colKey: this.params.column.getId()
        };
        this.params.api.startEditingCell(startEditingParams);
    };
    CellRenderer.prototype.getGui = function () {
        // returns our gui to the grid for this cell
        return this.eGui;
    };
    CellRenderer.prototype.destroy = function () {

        // be good, clean up the listener
        this.eButton.removeEventListener('click', this.buttonClickListener);
    };

    return CellRenderer;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var div = document.querySelector('#myGrid');
    new agGrid.Grid(div, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
