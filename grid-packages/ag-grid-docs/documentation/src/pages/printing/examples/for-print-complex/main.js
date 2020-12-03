var columnDefs = [
    {field: 'group', rowGroup: true, hide: true},
    {field: 'id', pinned: 'left', width: 70},
    {field: 'model', width: 180},
    {field: 'color', width: 100},
    {field: 'price', valueFormatter: '\'$\' + value.toLocaleString()', width: 100},
    {field: 'year', width: 100},
    {field: 'country', width: 120}
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
        sortable: true
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    animateRows: true,
    groupUseEntireRow: true,
    onGridReady: function(params) {
        params.api.expandAll();
    }
};

function onBtPrint() {
    var api = gridOptions.api;

    setPrinterFriendly(api);

    setTimeout( function( ) {
        print();
        setNormal(api);
    }, 2000);
}

function setPrinterFriendly(api) {
    var eGridDiv = document.querySelector('#myGrid');
    eGridDiv.style.height = '';
    api.setDomLayout('print');
}

function setNormal(api) {
    var eGridDiv = document.querySelector('#myGrid');
    eGridDiv.style.width = '700px';
    eGridDiv.style.height = '200px';

    api.setDomLayout(null);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
