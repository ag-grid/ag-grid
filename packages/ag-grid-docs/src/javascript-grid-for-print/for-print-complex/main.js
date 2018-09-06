var columnDefs = [
    {field: 'group', rowGroup: true, hide: true},
    {field: 'id', pinned: 'left', width: 60},
    {field: 'model', width: 150},
    {field: 'color', width: 100},
    {field: 'price', valueFormatter: '"$" + value.toLocaleString()', width: 100},
    {field: 'year', width: 100},
    {field: 'country', width: 100}
];

var models = ['Mercedes-AMG C63','BMW M2','Audi TT Roadster','Mazda MX-5','BMW M3','Porsche 718 Boxster','Porsche 718 Cayman'];
var colors = ['Red','Black','Green','White','Blue'];
var countries = ['UK', 'Spain', 'France', 'Ireland', 'USA'];

function createRowData() {
    var rowData = [];
    for (var i = 0; i<200; i++) {
        var item = {
            id: i + 1,
            group: 'Group ' + (Math.floor(i / 20) + 1),
            model: models[Math.floor(Math.random()*models.length)],
            color: colors[Math.floor(Math.random()*colors.length)],
            country: countries[Math.floor(Math.random()*countries.length)],
            year: 2018 - Math.floor(Math.random() * 20),
            price: 20000 + ((Math.floor(Math.random() * 100)*100))
        };
        rowData.push(item);
    }
    return rowData;
}

var gridOptions = {
    defaultColDef: {
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableSorting: true,
    animateRows: true,
    toolPanelSuppressSideButtons: true,
    groupUseEntireRow: true,
    onGridReady: function(params) {
        params.api.expandAll();
    }
};

function onBtPrint() {
    var gridApi = gridOptions.api;

    setPrinterFriendly(gridApi);

    setTimeout( function( ) {
        print();
        setNormal(gridApi);
    }, 2000);
}

function setPrinterFriendly(api) {
    var eGridDiv = document.querySelector('.my-grid');
    eGridDiv.style.width = '';
    eGridDiv.style.height = '';

    api.setDomLayout('print');
}

function setNormal(api) {
    var eGridDiv = document.querySelector('.my-grid');
    eGridDiv.style.width = '600px';
    eGridDiv.style.height = '200px';

    api.setDomLayout(null);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
