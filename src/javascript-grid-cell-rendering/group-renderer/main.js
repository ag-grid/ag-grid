function getSimpleCellRenderer() {
    function SimpleCellRenderer() {}

    SimpleCellRenderer.prototype.init = function(params) {
        var tempDiv = document.createElement('div');
        if (params.node.group) {
            tempDiv.innerHTML = '<span style="border-bottom: 1px solid grey; border-left: 1px solid grey; padding: 2px;">' + params.value + '</span>';
        } else {
            tempDiv.innerHTML =
                '<span><img src="https://flags.fmcdn.net/data/flags/mini/ie.png" style="width: 20px; padding-right: 4px;"/>' + params.value + '</span>';
        }
        this.eGui = tempDiv.firstChild;
    };

    SimpleCellRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return SimpleCellRenderer;
}

var columnDefs = [
    // this column shows just the country group values, but has not group renderer, so there is no expand / collapse functionality
    {headerName: 'Country Group - No Renderer', showRowGroup: 'country'},

    // same as before, but we show all group values, again with no cell renderer
    {headerName: 'All Groups - No Renderer', showRowGroup: true},

    // add in a cell renderer
    {headerName: 'Group Renderer A', showRowGroup: true, cellRenderer:'agGroupCellRenderer'},

    // add in a field
    {headerName: 'Group Renderer B', showRowGroup: true, cellRenderer:'agGroupCellRenderer', field: 'city'},

    // add in a cell renderer params
    {
        headerName: 'Group Renderer C',
        showRowGroup: true,
        cellRenderer:'agGroupCellRenderer',
        field: 'city',
        cellRendererParams: {
            suppressCount: true,
            checkbox: true,
            padding: 20,
            innerRenderer: 'simpleCellRenderer',
            suppressDoubleClickExpand: true
        }
    },

    {headerName: 'Type', field: 'type', rowGroup: 'true'},
    {headerName: 'Country', field: 'country', rowGroup: 'true'},
    {headerName: 'City', field: 'city'}
];

function createRowData() {
    var rowData = [];

    var irelandCities = ['Dublin', 'Galway', 'Cork'];
    var ukCities = ['London', 'Bristol', 'Manchester', 'Liverpool'];
    var usaCities = ['New York', 'Boston', 'L.A.', 'San Fransisco', 'Detroit'];
    var middleEarthCities = ['The Shire', 'Rohan', 'Rivendell', 'Mordor'];
    var midkemiaCities = ['Darkmoor', 'Crydee', 'Elvandar', 'LaMut', 'Ylith'];

    var addCity = function(country, type, city) {
        rowData.push({country: country, type: type, city: city});
    };

    irelandCities.forEach(addCity.bind(null, 'Ireland', 'Non Fiction'));
    ukCities.forEach(addCity.bind(null, 'United Kingdom', 'Non Fiction'));
    usaCities.forEach(addCity.bind(null, 'USA Cities', 'Non Fiction'));
    middleEarthCities.forEach(addCity.bind(null, 'Middle Earth', 'Fiction'));
    midkemiaCities.forEach(addCity.bind(null, 'Midkemia', 'Fiction'));

    return rowData;
}

var gridOptions = {
    components:{
        simpleCellRenderer: getSimpleCellRenderer()
    },
    defaultColDef: {},
    // we don't want the auto column here, as we are providing our own cols
    groupSuppressAutoColumn: true,
    suppressRowClickSelection: true,
    groupDefaultExpanded: 1,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    animateRows: true,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
